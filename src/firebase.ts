import {
  createUserWithEmailAndPassword,
  getAuth,
  getIdTokenResult,
  reload,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser
} from "firebase/auth";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  collection,
  doc,
  deleteDoc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
  type Unsubscribe
} from "firebase/firestore";
import type { Address, Banner, Category, NavbarItem, Notification, Order, Product, Review, User } from "./types";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const requiredConfig = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.messagingSenderId,
  firebaseConfig.appId
];

export const firebaseConfigured = requiredConfig.every(Boolean);
const app = firebaseConfigured
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

export interface StoreSettings {
  initialized: boolean;
  navbarItems: NavbarItem[];
  banners: Banner[];
  deliveryCost: number;
}

export function requireFirebase() {
  if (!auth || !db) {
    throw new Error(
      "Firebase is not configured. Add the VITE_FIREBASE_* values from your Firebase project to .env.local."
    );
  }
  return { auth, db };
}

export function subscribeDocuments<T extends { id: string }>(
  collectionName: string,
  onData: (documents: T[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const { db: firestore } = requireFirebase();
  return onSnapshot(
    collection(firestore, collectionName),
    (snapshot) => onData(snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as T)),
    onError
  );
}

export function subscribeStoreSettings(
  onData: (settings: StoreSettings | null) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const { db: firestore } = requireFirebase();
  return onSnapshot(doc(firestore, "settings", "storefront"), (snapshot) => {
    onData(snapshot.exists() ? snapshot.data() as StoreSettings : null);
  }, onError);
}

export function subscribeUserDocuments<T extends { id: string }>(
  userId: string,
  collectionName: "addresses" | "wishlist",
  onData: (documents: T[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const { db: firestore } = requireFirebase();
  return onSnapshot(
    collection(firestore, "users", userId, collectionName),
    (snapshot) => onData(snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as T)),
    onError
  );
}

export function subscribeUserCart(
  userId: string,
  onData: (items: Array<{ product: Product; size: string; color: string; quantity: number }>) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const { db: firestore } = requireFirebase();
  return onSnapshot(doc(firestore, "users", userId, "cart", "current"), (snapshot) => {
    onData(snapshot.exists() ? snapshot.data().items ?? [] : []);
  }, onError);
}

export function subscribeUserOrders(
  userId: string,
  isAdmin: boolean,
  onData: (orders: Order[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const { db: firestore } = requireFirebase();
  const orders = collection(firestore, "orders");
  const ordersQuery = isAdmin ? orders : query(orders, where("userId", "==", userId));
  return onSnapshot(
    ordersQuery,
    (snapshot) => onData(snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as Order)),
    onError
  );
}

async function commitBatches(
  firestore: ReturnType<typeof getFirestore>,
  operations: Array<(batch: ReturnType<typeof writeBatch>) => void>
): Promise<void> {
  for (let offset = 0; offset < operations.length; offset += 450) {
    const batch = writeBatch(firestore);
    operations.slice(offset, offset + 450).forEach((operation) => operation(batch));
    await batch.commit();
  }
}

export async function saveAdminCollection<T extends { id: string }>(
  collectionName: "products" | "categories" | "notifications" | "orders",
  documents: T[]
): Promise<void> {
  const { db: firestore } = requireFirebase();
  const collectionRef = collection(firestore, collectionName);
  const currentDocuments = await getDocs(collectionRef);
  const nextIds = new Set(documents.map((item) => item.id));
  const operations: Array<(batch: ReturnType<typeof writeBatch>) => void> = [];

  currentDocuments.docs.forEach((current) => {
    if (!nextIds.has(current.id)) {
      operations.push((batch) => batch.delete(current.ref));
    }
  });
  documents.forEach((item) => {
    const data = collectionName === "orders"
      ? item
      : (({ id: _id, ...fields }) => fields)(item);
    operations.push((batch) => batch.set(doc(firestore, collectionName, item.id), data));
  });
  await commitBatches(firestore, operations);
}

export async function saveStoreSettings(settings: StoreSettings): Promise<void> {
  const { db: firestore } = requireFirebase();
  await setDoc(doc(firestore, "settings", "storefront"), {
    ...settings,
    updatedAt: serverTimestamp()
  });
}

export async function initializeStoreData(
  products: Product[],
  categories: Category[],
  settings: StoreSettings,
  notifications: Notification[]
): Promise<void> {
  const { db: firestore } = requireFirebase();
  const settingsRef = doc(firestore, "settings", "storefront");
  await runTransaction(firestore, async (transaction) => {
    const existing = await transaction.get(settingsRef);
    if (existing.exists()) return;

    products.forEach(({ id, ...data }) => {
      transaction.set(doc(firestore, "products", id), data);
    });
    categories.forEach(({ id, ...data }) => {
      transaction.set(doc(firestore, "categories", id), data);
    });
    notifications.forEach(({ id, ...data }) => {
      transaction.set(doc(firestore, "notifications", id), data);
    });
    transaction.set(settingsRef, { ...settings, updatedAt: serverTimestamp() });
  });
}

export async function saveUserAddresses(userId: string, addresses: Address[]): Promise<void> {
  await saveUserCollection(userId, "addresses", addresses);
}

export async function saveUserWishlist(
  userId: string,
  productIds: string[]
): Promise<void> {
  await saveUserCollection(
    userId,
    "wishlist",
    productIds.map((productId) => ({ id: productId, productId }))
  );
}

async function saveUserCollection<T extends { id: string }>(
  userId: string,
  collectionName: "addresses" | "wishlist",
  documents: T[]
): Promise<void> {
  const { db: firestore } = requireFirebase();
  const collectionRef = collection(firestore, "users", userId, collectionName);
  const currentDocuments = await getDocs(collectionRef);
  const nextIds = new Set(documents.map((item) => item.id));
  const operations: Array<(batch: ReturnType<typeof writeBatch>) => void> = [];

  currentDocuments.docs.forEach((current) => {
    if (!nextIds.has(current.id)) {
      operations.push((batch) => batch.delete(current.ref));
    }
  });
  documents.forEach(({ id, ...data }) => {
    operations.push((batch) => batch.set(doc(firestore, "users", userId, collectionName, id), data));
  });
  await commitBatches(firestore, operations);
}

export async function saveUserCart(
  userId: string,
  items: Array<{ product: Product; size: string; color: string; quantity: number }>
): Promise<void> {
  const { db: firestore } = requireFirebase();
  await setDoc(doc(firestore, "users", userId, "cart", "current"), { items });
}

export async function createUserOrder(order: Order): Promise<void> {
  const { db: firestore } = requireFirebase();
  await setDoc(doc(firestore, "orders", order.id), order);
}

export async function saveUserReview(review: Review): Promise<void> {
  const { db: firestore } = requireFirebase();
  await setDoc(doc(firestore, "reviews", review.id), review);
}

export async function deleteAdminReview(reviewId: string): Promise<void> {
  const { db: firestore } = requireFirebase();
  await deleteDoc(doc(firestore, "reviews", reviewId));
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const { auth: firebaseAuth } = requireFirebase();
  const currentUser = firebaseAuth.currentUser;
  if (!currentUser) return false;
  return hasAdminAccess(currentUser);
}

async function hasAdminAccess(firebaseUser: FirebaseUser): Promise<boolean> {
  const token = await getIdTokenResult(firebaseUser);
  if (token.claims.admin === true) return true;

  const { db: firestore } = requireFirebase();
  const adminSnapshot = await getDoc(doc(firestore, "admins", firebaseUser.uid));
  if (!adminSnapshot.exists()) return false;

  const adminRecord = adminSnapshot.data();
  return adminRecord.active === true
    && adminRecord.role === "admin"
    && adminRecord.email === firebaseUser.email;
}

export function profileFromAuthUser(firebaseUser: FirebaseUser): User {
  const [firstName = "", ...lastNameParts] = (firebaseUser.displayName ?? "").split(" ");
  const email = firebaseUser.email ?? "";
  return {
    id: firebaseUser.uid,
    firstName,
    lastName: lastNameParts.join(" "),
    username: email.split("@")[0] ?? "",
    gender: "",
    dob: "",
    mobile: "",
    alternativeMobile: "",
    email,
    profileImage:
      firebaseUser.photoURL ??
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
    verified: firebaseUser.emailVerified
  };
}

export async function getOrCreateUserProfile(firebaseUser: FirebaseUser): Promise<User> {
  const { db: firestore } = requireFirebase();
  const profileRef = doc(firestore, "users", firebaseUser.uid);
  const authProfile = profileFromAuthUser(firebaseUser);

  return runTransaction(firestore, async (transaction) => {
    const profileSnapshot = await transaction.get(profileRef);
    if (profileSnapshot.exists()) {
      const storedProfile = profileSnapshot.data() as Partial<User>;
      const profile: User = {
        ...authProfile,
        ...storedProfile,
        id: firebaseUser.uid,
        email: authProfile.email,
        verified: authProfile.verified
      };

      if (storedProfile.verified !== authProfile.verified) {
        transaction.set(
          profileRef,
          { verified: authProfile.verified, updatedAt: serverTimestamp() },
          { merge: true }
        );
      }

      return profile;
    }

    transaction.set(profileRef, {
      ...authProfile,
      uid: firebaseUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return authProfile;
  });
}

export async function createCustomerProfile(
  firebaseUser: FirebaseUser,
  profile: Omit<User, "id">
): Promise<User> {
  const { db: firestore } = requireFirebase();
  const userProfile: User = {
    ...profile,
    id: firebaseUser.uid,
    email: firebaseUser.email ?? profile.email,
    verified: firebaseUser.emailVerified
  };
  const profileRef = doc(firestore, "users", firebaseUser.uid);
  await runTransaction(firestore, async (transaction) => {
    const existingProfile = await transaction.get(profileRef);
    transaction.set(profileRef, {
      ...userProfile,
      uid: firebaseUser.uid,
      createdAt: existingProfile.exists()
        ? existingProfile.data().createdAt
        : serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  });
  return userProfile;
}

export async function registerWithEmailAndPassword(
  profile: Omit<User, "id">,
  password: string
): Promise<User> {
  const { auth: firebaseAuth } = requireFirebase();
  const credential = await createUserWithEmailAndPassword(
    firebaseAuth,
    profile.email.trim().toLowerCase(),
    password
  );
  const displayName = `${profile.firstName} ${profile.lastName}`.trim();
  await updateProfile(credential.user, {
    displayName,
    photoURL: profile.profileImage || null
  });
  return createCustomerProfile(credential.user, profile);
}

export async function loginWithEmailAndPassword(
  email: string,
  password: string
): Promise<{ isAdmin: true } | { isAdmin: false; profile: User }> {
  const { auth: firebaseAuth } = requireFirebase();
  const credential = await signInWithEmailAndPassword(
    firebaseAuth,
    email.trim().toLowerCase(),
    password
  );
  if (await hasAdminAccess(credential.user)) return { isAdmin: true };
  return {
    isAdmin: false,
    profile: await getOrCreateUserProfile(credential.user)
  };
}

export async function logoutFirebaseUser(): Promise<void> {
  const { auth: firebaseAuth } = requireFirebase();
  await signOut(firebaseAuth);
}

export async function sendUserVerificationEmail(): Promise<void> {
  const { auth: firebaseAuth } = requireFirebase();
  if (!firebaseAuth.currentUser) {
    throw new Error("Sign in before requesting an email verification link.");
  }
  await sendEmailVerification(firebaseAuth.currentUser);
}

export async function refreshUserVerificationStatus(userId: string): Promise<User> {
  const { auth: firebaseAuth } = requireFirebase();
  const firebaseUser = firebaseAuth.currentUser;
  if (!firebaseUser || firebaseUser.uid !== userId) {
    throw new Error("The signed-in account does not match this user profile.");
  }

  await reload(firebaseUser);
  await firebaseUser.getIdToken(true);
  return getOrCreateUserProfile(firebaseUser);
}

export async function saveUserProfile(profile: User): Promise<void> {
  const { auth: firebaseAuth, db: firestore } = requireFirebase();
  if (!firebaseAuth.currentUser || firebaseAuth.currentUser.uid !== profile.id) {
    throw new Error("You can only update the profile for the signed-in account.");
  }

  const { id, ...profileData } = profile;
  await setDoc(
    doc(firestore, "users", id),
    {
      ...profileData,
      uid: id,
      email: firebaseAuth.currentUser.email ?? profile.email,
      verified: firebaseAuth.currentUser.emailVerified,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

export function getFirebaseErrorMessage(error: unknown): string {
  const code = (error as { code?: string } | null)?.code;
  switch (code) {
    case "auth/email-already-in-use":
      return "An account already exists for this email. Please log in.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "The email address or password is incorrect.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "Could not connect to Firebase. Check your internet connection and try again.";
    case "auth/invalid-api-key":
      return "Firebase configuration is invalid. Check the VITE_FIREBASE_* values.";
    case "auth/operation-not-allowed":
      return "Email and password sign-in is not enabled in Firebase Authentication.";
    case "auth/weak-password":
      return "Choose a password with at least 6 characters.";
    case "permission-denied":
    case "firestore/permission-denied":
      return "Firestore denied access. Deploy the provided firestore.rules and confirm your project configuration.";
    default:
      if (error instanceof Error) return error.message;
      return "Authentication failed. Please try again.";
  }
}

export { createUserWithEmailAndPassword };
