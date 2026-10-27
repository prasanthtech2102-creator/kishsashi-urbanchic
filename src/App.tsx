/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Product, Category, NavbarItem, Banner, Notification, Address, Order, User, Review } from "./types";
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, DEFAULT_NAVBAR, INITIAL_BANNERS, INITIAL_NOTIFICATIONS } from "./mockData";
import StorefrontView from "./components/StorefrontView";
import AdminPortalView from "./components/AdminPortalView";
import UserDashboardView from "./components/UserDashboardView";
import LoginDialog from "./components/LoginDialog";
import { User as UserIcon, LogOut, ArrowLeft, Heart, ShieldAlert } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import {
  auth,
  createUserOrder,
  deleteAdminReview,
  firebaseConfigured,
  getFirebaseErrorMessage,
  getOrCreateUserProfile,
  initializeStoreData,
  isCurrentUserAdmin,
  logoutFirebaseUser,
  refreshUserVerificationStatus,
  saveAdminCollection,
  saveStoreSettings,
  saveUserAddresses,
  saveUserCart,
  saveUserWishlist,
  subscribeDocuments,
  subscribeStoreSettings,
  subscribeUserCart,
  subscribeUserDocuments,
  subscribeUserOrders,
  saveUserProfile,
  saveUserReview,
  sendUserVerificationEmail
} from "./firebase";

export default function App() {
  
  // Store data stays on mock seeds until Firestore has been initialized by an admin.
  const [baseProducts, setBaseProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [firestoreReviews, setFirestoreReviews] = useState<Review[]>([]);
  const products = baseProducts.map((product) => {
    const remoteReviews = firestoreReviews.filter((review) => review.productId === product.id);
    const remoteReviewIds = new Set(remoteReviews.map((review) => review.id));
    return {
      ...product,
      reviews: [
        ...remoteReviews,
        ...product.reviews.filter((review) => !remoteReviewIds.has(review.id))
      ]
    };
  });
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [navbarItems, setNavbarItems] = useState<NavbarItem[]>(DEFAULT_NAVBAR);
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryCost, setDeliveryCost] = useState<number>(350);
  const [storeInitialized, setStoreInitialized] = useState(false);

  // CART & WISHLIST STATES
  const [cart, setCart] = useState<{ product: Product; size: string; color: string; quantity: number }[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const wishlist = wishlistIds
    .map((productId) => products.find((product) => product.id === productId))
    .filter((product): product is Product => Boolean(product));

  // USER ACCESS SESSION SECTOR
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // CURRENT RENDER CONTROL PANEL ("storefront" | "user-dashboard" | "admin-portal")
  const [currentPanel, setCurrentPanel] = useState<"storefront" | "user-dashboard" | "admin-portal">("storefront");
  const [appNotice, setAppNotice] = useState<{ type: "error" | "info"; text: string } | null>(null);

  const showNotice = (text: string, type: "error" | "info" = "error") => {
    setAppNotice({ type, text });
    setTimeout(() => setAppNotice(null), 4000);
  };

  const safeSetStorage = (key: string, value: string) => {
    if (firebaseConfigured) return;
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      console.warn(`LocalStorage quota or write warning for ${key}:`, err);
    }
  };

  // Keep the mock storefront available only when Firebase is not configured.
  useEffect(() => {
    if (firebaseConfigured) return;
    try {
      const storedProds = localStorage.getItem("ksh_products");
      const storedCats = localStorage.getItem("ksh_categories");
      const storedNavs = localStorage.getItem("ksh_navbar");
      const storedBanners = localStorage.getItem("ksh_banners");
      const storedNotifs = localStorage.getItem("ksh_notifications");
      if (storedProds) {
        const parsed = JSON.parse(storedProds);
        const migrated = parsed.map((p: Product) => p.category === "Kurtis & Kurtas" ? { ...p, category: "Kurtis Set" } : p);
        setBaseProducts(migrated);
        safeSetStorage("ksh_products", JSON.stringify(migrated));
      } else {
        setBaseProducts(INITIAL_PRODUCTS);
        safeSetStorage("ksh_products", JSON.stringify(INITIAL_PRODUCTS));
      }

      if (storedCats) {
        const parsed = JSON.parse(storedCats);
        const migrated = parsed.map((c: Category) => (c.name === "Kurtis & Kurtas" || c.id === "cat_kurtis") ? { ...c, name: "Kurtis Set" } : c);
        setCategories(migrated);
        safeSetStorage("ksh_categories", JSON.stringify(migrated));
      } else {
        setCategories(INITIAL_CATEGORIES);
        safeSetStorage("ksh_categories", JSON.stringify(INITIAL_CATEGORIES));
      }

      if (storedNavs) setNavbarItems(JSON.parse(storedNavs));
      else {
        setNavbarItems(DEFAULT_NAVBAR);
        safeSetStorage("ksh_navbar", JSON.stringify(DEFAULT_NAVBAR));
      }

      if (storedBanners) setBanners(JSON.parse(storedBanners));
      else {
        setBanners(INITIAL_BANNERS);
        safeSetStorage("ksh_banners", JSON.stringify(INITIAL_BANNERS));
      }

      if (storedNotifs) setNotifications(JSON.parse(storedNotifs));
      else {
        setNotifications(INITIAL_NOTIFICATIONS);
        safeSetStorage("ksh_notifications", JSON.stringify(INITIAL_NOTIFICATIONS));
      }

      localStorage.removeItem("ksh_current_user");
      localStorage.removeItem("ksh_admin_logged");
      const storedDeliveryCost = localStorage.getItem("ksh_delivery_cost");
      if (storedDeliveryCost) {
        setDeliveryCost(Number(storedDeliveryCost));
      } else {
        safeSetStorage("ksh_delivery_cost", "350");
      }
    } catch (e) {
      console.error("Local storage hydration fault:", e);
    }
  }, []);

  useEffect(() => {
    if (!firebaseConfigured) return;
    return subscribeStoreSettings((settings) => {
      const initialized = settings?.initialized === true;
      setStoreInitialized(initialized);
      if (initialized && settings) {
        setNavbarItems(settings.navbarItems ?? DEFAULT_NAVBAR);
        setBanners(settings.banners ?? INITIAL_BANNERS);
        setDeliveryCost(settings.deliveryCost ?? 350);
      } else {
        setNavbarItems(DEFAULT_NAVBAR);
        setBanners(INITIAL_BANNERS);
        setDeliveryCost(350);
      }
    }, (error) => showNotice(getFirebaseErrorMessage(error)));
  }, []);

  useEffect(() => {
    if (!firebaseConfigured || !storeInitialized) return;
    const handleReadError = (error: Error) => showNotice(getFirebaseErrorMessage(error));
    const unsubscribers = [
      subscribeDocuments<Product>("products", setBaseProducts, handleReadError),
      subscribeDocuments<Category>("categories", setCategories, handleReadError),
      subscribeDocuments<Review>("reviews", setFirestoreReviews, handleReadError)
    ];
    if (isAdminLoggedIn) {
      unsubscribers.push(
        subscribeDocuments<Notification>("notifications", setNotifications, handleReadError)
      );
    }
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [storeInitialized, isAdminLoggedIn]);

  useEffect(() => {
    if (!firebaseConfigured || (!currentUser && !isAdminLoggedIn)) {
      setOrders([]);
      return;
    }
    return subscribeUserOrders(
      currentUser?.id ?? auth?.currentUser?.uid ?? "",
      isAdminLoggedIn,
      setOrders,
      (error) => showNotice(getFirebaseErrorMessage(error))
    );
  }, [currentUser?.id, isAdminLoggedIn]);

  useEffect(() => {
    if (!firebaseConfigured || !currentUser) {
      setAddresses([]);
      setWishlistIds([]);
      setCart([]);
      return;
    }
    const handleReadError = (error: Error) => showNotice(getFirebaseErrorMessage(error));
    const unsubscribers = [
      subscribeUserDocuments<Address>(currentUser.id, "addresses", setAddresses, handleReadError),
      subscribeUserDocuments<{ id: string; productId: string }>(
        currentUser.id,
        "wishlist",
        (documents) => setWishlistIds(documents.map((item) => item.productId)),
        handleReadError
      ),
      subscribeUserCart(currentUser.id, setCart, handleReadError)
    ];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [currentUser?.id]);

  useEffect(() => {
    const firebaseAuth = auth;
    if (!firebaseAuth) {
      setCurrentUser(null);
      return;
    }

    return onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (!firebaseUser) {
        setCurrentUser(null);
        setIsAdminLoggedIn(false);
        setCurrentPanel("storefront");
        return;
      }

      try {
        const isAdmin = await isCurrentUserAdmin();
        if (firebaseAuth.currentUser?.uid !== firebaseUser.uid) return;
        if (isAdmin) {
          setCurrentUser(null);
          setIsAdminLoggedIn(true);
          setCurrentPanel("admin-portal");
          await initializeStoreData(
            INITIAL_PRODUCTS,
            INITIAL_CATEGORIES,
            {
              initialized: true,
              navbarItems: DEFAULT_NAVBAR,
              banners: INITIAL_BANNERS,
              deliveryCost: 350
            },
            INITIAL_NOTIFICATIONS
          );
          return;
        }
        setIsAdminLoggedIn(false);
        const userProfile = await getOrCreateUserProfile(firebaseUser);
        if (firebaseAuth.currentUser?.uid === firebaseUser.uid) {
          setCurrentUser(userProfile);
        }
      } catch (error) {
        showNotice(getFirebaseErrorMessage(error));
      }
    });
  }, []);

  // Sync Helper to update local state + persist to storage
  const reportWriteFailure = (write: Promise<void>) => {
    void write.catch((error: unknown) => showNotice(getFirebaseErrorMessage(error)));
  };

  const updateProductsState = (newProds: Product[]) => {
    setBaseProducts(newProds);
    safeSetStorage("ksh_products", JSON.stringify(newProds));
    if (firebaseConfigured && isAdminLoggedIn) {
      reportWriteFailure(saveAdminCollection("products", newProds));
    }
  };

  const updateCategoriesState = (newCats: Category[]) => {
    setCategories(newCats);
    safeSetStorage("ksh_categories", JSON.stringify(newCats));
    if (firebaseConfigured && isAdminLoggedIn) {
      reportWriteFailure(saveAdminCollection("categories", newCats));
    }
  };

  const updateNavbarState = (newNavs: NavbarItem[]) => {
    setNavbarItems(newNavs);
    safeSetStorage("ksh_navbar", JSON.stringify(newNavs));
    if (firebaseConfigured && isAdminLoggedIn) {
      reportWriteFailure(saveStoreSettings({
        initialized: true,
        navbarItems: newNavs,
        banners,
        deliveryCost
      }));
    }
  };

  const updateBannersState = (newBans: Banner[]) => {
    setBanners(newBans);
    safeSetStorage("ksh_banners", JSON.stringify(newBans));
    if (firebaseConfigured && isAdminLoggedIn) {
      reportWriteFailure(saveStoreSettings({
        initialized: true,
        navbarItems,
        banners: newBans,
        deliveryCost
      }));
    }
  };

  const updateNotificationsState = (newNotifs: Notification[]) => {
    setNotifications(newNotifs);
    safeSetStorage("ksh_notifications", JSON.stringify(newNotifs));
    if (firebaseConfigured && isAdminLoggedIn) {
      reportWriteFailure(saveAdminCollection("notifications", newNotifs));
    }
  };

  const updateAddressesState = (newAddrs: Address[]) => {
    setAddresses(newAddrs);
    safeSetStorage("ksh_addresses", JSON.stringify(newAddrs));
    if (firebaseConfigured && currentUser) {
      reportWriteFailure(saveUserAddresses(currentUser.id, newAddrs));
    }
  };

  const updateOrdersState = (newOrders: Order[], adminUpdate = true) => {
    setOrders(newOrders);
    safeSetStorage("ksh_orders", JSON.stringify(newOrders));
    if (firebaseConfigured && isAdminLoggedIn && adminUpdate) {
      reportWriteFailure(saveAdminCollection("orders", newOrders));
    }
  };

  const handleUpdateDeliveryCost = (cost: number) => {
    setDeliveryCost(cost);
    safeSetStorage("ksh_delivery_cost", String(cost));
    if (firebaseConfigured && isAdminLoggedIn) {
      reportWriteFailure(saveStoreSettings({
        initialized: true,
        navbarItems,
        banners,
        deliveryCost: cost
      }));
    }
  };

  // SESSION CONTROL EVENTS
  const handleLoginAdminSuccess = () => {
    setIsAdminLoggedIn(true);
    setCurrentPanel("admin-portal");
    showNotice("Administrator authenticated successfully.", "info");
  };

  const handleLoginUserSuccess = (userProfile: User) => {
    setIsAdminLoggedIn(false);
    setCurrentUser(userProfile);
    setCurrentPanel("storefront");
    showNotice(`Welcome back, ${userProfile.firstName}!`, "info");
  };

  const handleLogout = async () => {
    try {
      if (auth?.currentUser) {
        await logoutFirebaseUser();
      }
    } catch (error) {
      showNotice(getFirebaseErrorMessage(error));
      return;
    }

    setCurrentUser(null);
    setIsAdminLoggedIn(false);
    localStorage.removeItem("ksh_current_user");
    localStorage.removeItem("ksh_admin_logged");
    setCurrentPanel("storefront");
    setAddresses([]);
    setWishlistIds([]);
    setCart([]);
    setOrders([]);
    setShowLoginModal(false);
    showNotice("You have been signed out.", "info");
  };

  // CART INTERVENTION SUITE
  const updateCartState = (newCart: typeof cart) => {
    setCart(newCart);
    if (firebaseConfigured && currentUser) {
      reportWriteFailure(saveUserCart(currentUser.id, newCart));
    }
  };

  const handleAddToCart = (product: Product, size: string, color: string, qty: number) => {
    const liveProd = products.find((p) => p.id === product.id) || product;
    if (liveProd.stock <= 0) {
      showNotice(`"${liveProd.name}" is currently out of stock.`, "error");
      return;
    }

    const totalInCartForProduct = cart
      .filter((c) => c.product.id === liveProd.id)
      .reduce((sum, c) => sum + c.quantity, 0);

    if (totalInCartForProduct + qty > liveProd.stock) {
      const remaining = Math.max(0, liveProd.stock - totalInCartForProduct);
      if (remaining === 0) {
        showNotice(`All ${liveProd.stock} available unit(s) of "${liveProd.name}" are already in your bag.`, "error");
        return;
      }
      qty = remaining;
      showNotice(`Adjusted quantity to maximum available stock (${liveProd.stock} units).`, "info");
    }

    const existingIdx = cart.findIndex((c) => c.product.id === liveProd.id && c.size === size && c.color === color);
    
    if (existingIdx > -1) {
      const updated = [...cart];
      updated[existingIdx] = {
        ...updated[existingIdx],
        product: liveProd,
        quantity: updated[existingIdx].quantity + qty
      };
      updateCartState(updated);
    } else {
      updateCartState([...cart, { product: liveProd, size, color, quantity: qty }]);
    }
  };

  const handleRemoveFromCart = (index: number) => {
    updateCartState(cart.filter((_, idx) => idx !== index));
  };

  const handleUpdateCartQty = (index: number, qty: number) => {
    const item = cart[index];
    if (!item) return;
    const liveProd = products.find((p) => p.id === item.product.id) || item.product;
    if (liveProd.stock <= 0) {
      handleRemoveFromCart(index);
      showNotice(`"${liveProd.name}" is now out of stock and was removed from your bag.`, "error");
      return;
    }
    const otherVariantsQty = cart
      .filter((c, idx) => idx !== index && c.product.id === liveProd.id)
      .reduce((sum, c) => sum + c.quantity, 0);
    const maxAllowed = Math.max(1, liveProd.stock - otherVariantsQty);
    const clampedQty = Math.min(Math.max(1, qty), maxAllowed);
    if (qty > maxAllowed) {
      showNotice(`Only ${liveProd.stock} unit(s) of "${liveProd.name}" available in stock.`, "error");
    }
    const updated = [...cart];
    updated[index] = { ...updated[index], product: liveProd, quantity: clampedQty };
    updateCartState(updated);
  };

  // WISHLIST INTERVENTION SUITE
  const handleToggleWishlist = (productId: string) => {
    const foundProd = products.find((p) => p.id === productId);
    if (!foundProd) return;

    const updatedIds = wishlistIds.includes(productId)
      ? wishlistIds.filter((id) => id !== productId)
      : [...wishlistIds, productId];
    setWishlistIds(updatedIds);
    if (firebaseConfigured && currentUser) {
      reportWriteFailure(saveUserWishlist(currentUser.id, updatedIds));
    }
  };

  // SECURE CASH ON DELIVERY CHECKOUT ENDPOINT TRIGGER
  const handleCheckout = async (
    shipAddress: Address,
    finalizedCart?: typeof cart
  ): Promise<Order | null> => {
    if (!currentUser) {
      showNotice("Sign in before placing an order.");
      setShowLoginModal(true);
      return null;
    }
    const activeCart = finalizedCart || cart;
    if (activeCart.length === 0) return null;

    const subtotal = activeCart.reduce((acc, c) => {
      const activePrice = c.product.discountPrice < c.product.price ? c.product.discountPrice : c.product.price;
      return acc + activePrice * c.quantity;
    }, 0);

    const checkOrder: Order = {
      id: `KSH-ORD-${Math.floor(Math.random() * 90000) + 10000}`,
      userId: currentUser.id,
      customerName: `${shipAddress.firstName} ${shipAddress.lastName}`,
      mobile: shipAddress.mobile,
      items: activeCart.map((c) => ({
        productId: c.product.id,
        productName: c.product.name,
        sku: c.product.sku,
        quantity: c.quantity,
        price: c.product.discountPrice < c.product.price ? c.product.discountPrice : c.product.price,
        thumbnail: c.product.thumbnail,
        size: c.size,
        color: c.color
      })),
      totalAmount: subtotal,
      shippingCharge: deliveryCost, // Dynamically configured admin delivery cost
      address: shipAddress,
      paymentMethod: "COD",
      status: "Pending",
      date: new Date().toISOString()
    };

    if (firebaseConfigured) {
      await createUserOrder(checkOrder);
    }

    // Keep the current view responsive; shared inventory writes must be performed by a trusted server.
    if (!firebaseConfigured) {
      const updatedProducts = products.map((prod) => {
        const totalPurchased = activeCart
          .filter((c) => c.product.id === prod.id)
          .reduce((sum, c) => sum + c.quantity, 0);
        return totalPurchased > 0
          ? { ...prod, stock: Math.max(0, prod.stock - totalPurchased) }
          : prod;
      });
      setBaseProducts(updatedProducts);
      safeSetStorage("ksh_products", JSON.stringify(updatedProducts));
    }

    // Append order metrics; the Firestore listener remains the source of truth.
    const newOrdersList = [checkOrder, ...orders];
    updateOrdersState(newOrdersList, false);

    updateCartState([]);
    return checkOrder;
  };

  // ADD PRODUCT REVIEW FROM DETAIL SCREEN
  const handleAddReview = (productId: string, rating: number, comment: string) => {
    const reviewerName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Noble Patron";
    const addedRev: Review = {
      id: `rev_${Date.now()}`,
      productId,
      ...(currentUser ? { userId: currentUser.id } : {}),
      customerName: reviewerName,
      rating,
      comment,
      date: new Date().toISOString()
    };

    const updatedProducts = products.map((p) => {
      if (p.id === productId) {
        const newRevs = [addedRev, ...p.reviews];
        // Re-scale average scores
        const avg = Math.round((newRevs.reduce((acc, r) => acc + r.rating, 0) / newRevs.length) * 10) / 10;
        return {
          ...p,
          reviews: newRevs,
          rating: avg
        };
      }
      return p;
    });

    updateProductsState(updatedProducts);
    if (firebaseConfigured && currentUser) {
      reportWriteFailure(saveUserReview(addedRev));
    }
  };

  const handleAdminDeleteReview = (reviewId: string) => {
    const updatedProducts = products.map((product) => ({
      ...product,
      reviews: product.reviews.filter((review) => review.id !== reviewId)
    }));
    updateProductsState(updatedProducts);
    if (firebaseConfigured && isAdminLoggedIn) {
      reportWriteFailure(deleteAdminReview(reviewId));
    }
  };

  const handleUpdateUserProfile = async (updatedUser: User) => {
    try {
      await saveUserProfile(updatedUser);
      setCurrentUser(updatedUser);
    } catch (error) {
      showNotice(getFirebaseErrorMessage(error));
      throw error;
    }
  };

  const handleRefreshVerificationStatus = async () => {
    if (!currentUser) return;
    try {
      const updatedUser = await refreshUserVerificationStatus(currentUser.id);
      setCurrentUser(updatedUser);
    } catch (error) {
      showNotice(getFirebaseErrorMessage(error));
      throw error;
    }
  };

  const handleUpdateAddresses = (newAddrs: Address[]) => {
    updateAddressesState(newAddrs);
  };

  // ADMIN CRUDS HANDLERS
  const handleAdminUpdateProduct = (updatedProd: Product) => {
    const updated = products.map((p) => p.id === updatedProd.id ? updatedProd : p);
    updateProductsState(updated);
  };

  const handleAdminDeleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    updateProductsState(updated);
  };

  const handleAdminAddProduct = (newProd: Product) => {
    const updated = [newProd, ...products];
    updateProductsState(updated);
  };

  const handleAdminUpdateCategory = (updatedCat: Category) => {
    const updated = categories.map((c) => c.id === updatedCat.id ? updatedCat : c);
    updateCategoriesState(updated);
  };

  const handleAdminUpdateNavbar = (updatedNavs: NavbarItem[]) => {
    updateNavbarState(updatedNavs);
  };

  const handleAdminUpdateOrders = (updatedOrders: Order[]) => {
    updateOrdersState(updatedOrders);
  };

  const handleAdminUpdateNotifs = (updNotifs: Notification[]) => {
    updateNotificationsState(updNotifs);
  };

  return (
    <div className="bg-[#FBF9F4] min-h-screen text-[#121212] font-sans antialiased relative">
      {appNotice && (
        <div className={`fixed top-12 right-6 z-50 px-5 py-3 shadow-xl border text-xs font-mono uppercase tracking-wider flex items-center gap-3 transition-all ${
          appNotice.type === "error"
            ? "bg-red-950 text-red-100 border-red-500"
            : "bg-luxury-green text-[#E2CC91] border-luxury-gold"
        }`}>
          <ShieldAlert className="w-4 h-4 shrink-0 text-luxury-gold" />
          <span>{appNotice.text}</span>
          <button
            onClick={() => setAppNotice(null)}
            className="ml-2 text-[10px] underline hover:opacity-80"
          >
            DISMISS
          </button>
        </div>
      )}
      
      {/* ✦ UPPER BAR SESSIONS METADATA ✦ */}
      <div className="bg-luxury-green/5 text-[#072F22] py-2 px-6 flex justify-between items-center text-[10px] font-mono tracking-widest border-b border-gray-150 select-none">
        
        <div className="flex items-center gap-3">
          <span className="text-luxury-green font-semibold">
            ✦ MODERN GRACE, URBAN STYLE
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-luxury-gold font-bold">ISLANDWIDE CASH ON DELIVERY (COD) &bull; LKR</span>
        </div>

        <div className="flex items-center gap-4">
          {isAdminLoggedIn && (
            <button
              onClick={() => setCurrentPanel(currentPanel === "admin-portal" ? "storefront" : "admin-portal")}
              className="text-amber-700 hover:text-amber-900 font-bold uppercase transition-all underline decoration-dotted decoration-luxury-gold"
            >
              [BACKSTAGE PORTAL: {currentPanel === "admin-portal" ? "STORE LIVE" : "EDIT CODE"}]
            </button>
          )}

          {currentUser && (
            <button
              onClick={() => setCurrentPanel(currentPanel === "user-dashboard" ? "storefront" : "user-dashboard")}
              className="text-luxury-green hover:text-luxury-lightgreen font-bold uppercase"
            >
              [MY ACC: {currentUser.firstName.toUpperCase()}]
            </button>
          )}

          {(currentUser || isAdminLoggedIn) ? (
            <button
              onClick={handleLogout}
              className="hover:text-red-700 flex items-center gap-1 transition-colors uppercase font-bold"
              title="Terminate Secure Sessions"
            >
              <LogOut className="w-3 h-3 text-red-500" />
              LOGOUT
            </button>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="text-[#C5A85C] hover:text-luxury-green font-bold uppercase"
            >
              PATRON LOGIN
            </button>
          )}
        </div>

      </div>

      {/* ✦ MAIN LAYOUT PANELS ROUTER ✦ */}
      <div className="transition-all duration-300">
        
        {/* PANEL A: GENERAL STOREFRONT VIEW */}
        {currentPanel === "storefront" && (
          <StorefrontView
            products={products}
            categories={categories}
            navbarItems={navbarItems}
            banners={banners}
            addresses={addresses}
            cart={cart}
            wishlist={wishlist}
            orders={orders}
            deliveryCost={deliveryCost}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onUpdateCartQty={handleUpdateCartQty}
            onToggleWishlist={handleToggleWishlist}
            onCheckout={handleCheckout}
            onAddReview={handleAddReview}
            onOpenDashboard={() => setCurrentPanel("user-dashboard")}
            onOpenAdmin={() => {
              if (isAdminLoggedIn) setCurrentPanel("admin-portal");
              else setShowLoginModal(true);
            }}
            isLoggedIn={!!currentUser}
            onOpenAuth={() => setShowLoginModal(true)}
          />
        )}

        {/* PANEL B: USER DASHBOARD ACCOUNT */}
        {currentPanel === "user-dashboard" && currentUser && (
          <div className="w-full py-6 animate-fade-in select-none">
            <button
              onClick={() => setCurrentPanel("storefront")}
              className="mx-6 mb-6 inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-[#C5A85C] hover:text-luxury-green uppercase"
            >
              <ArrowLeft className="w-4 h-4" />
              BACK TO LUXURY STORE DRAWER
            </button>

            <UserDashboardView
              user={currentUser}
              addresses={addresses}
              orders={orders.filter((o) => o.userId === currentUser.id)}
              wishlist={wishlist}
              onUpdateProfile={handleUpdateUserProfile}
              onSendVerificationEmail={sendUserVerificationEmail}
              onRefreshVerificationStatus={handleRefreshVerificationStatus}
              onAddAddress={(newAddr) => updateAddressesState([...addresses, newAddr])}
              onDeleteAddress={(addrId) => updateAddressesState(addresses.filter((a) => a.id !== addrId))}
              onRemoveFromWishlist={handleToggleWishlist}
              onMoveToCart={(product, size, color) => handleAddToCart(product, size, color, 1)}
              onClose={() => setCurrentPanel("storefront")}
            />
          </div>
        )}

        {/* PANEL C: ADMIN BACKSTAGE CONTROL PANEL */}
        {currentPanel === "admin-portal" && isAdminLoggedIn && (
          <div className="w-full py-6 animate-fade-in select-none">
            <button
              onClick={() => setCurrentPanel("storefront")}
              className="mx-6 mb-6 inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-amber-600 hover:text-amber-800 uppercase"
            >
              <ArrowLeft className="w-4 h-4" />
              TERRAIN MAP: ENTER LIVE SHOP ONLINE
            </button>

            <AdminPortalView
              products={products}
              categories={categories}
              navbarItems={navbarItems}
              orders={orders}
              reviews={products.flatMap((p) => p.reviews)}
              banners={banners}
              notifications={notifications}
              deliveryCost={deliveryCost}
              onUpdateDeliveryCost={handleUpdateDeliveryCost}
              onAddProduct={handleAdminAddProduct}
              onEditProduct={handleAdminUpdateProduct}
              onDeleteProduct={handleAdminDeleteProduct}
              onAddCategory={(newCat) => updateCategoriesState([...categories, newCat])}
              onEditCategory={handleAdminUpdateCategory}
              onDeleteCategory={(catId) => updateCategoriesState(categories.filter((c) => c.id !== catId))}
              onUpdateOrderStatus={(orderId, status) => {
                const updated = orders.map((o) => o.id === orderId ? { ...o, status } : o);
                handleAdminUpdateOrders(updated);
              }}
              onUpdateNavbar={handleAdminUpdateNavbar}
              onAddBanner={(newBanner) => updateBannersState([...banners, newBanner])}
              onEditBanner={(updBanner) => updateBannersState(banners.map((b) => b.id === updBanner.id ? updBanner : b))}
              onDeleteBanner={(bannerId) => updateBannersState(banners.filter((b) => b.id !== bannerId))}
              onReorderBanners={(reordered) => updateBannersState(reordered)}
              onDeleteReview={handleAdminDeleteReview}
              onLogoutAdmin={handleLogout}
            />
          </div>
        )}

      </div>

      {/* ✦ LOGIN DIALOG MODAL LAYOUT ✦ */}
      {showLoginModal ? (
        <LoginDialog
          isCompulsory={false}
          onClose={() => setShowLoginModal(false)}
          onLoginAdminSuccess={() => {
            handleLoginAdminSuccess();
            setShowLoginModal(false);
          }}
          onLoginUserSuccess={(u) => {
            handleLoginUserSuccess(u);
            setShowLoginModal(false);
          }}
        />
      ) : null}

    </div>
  );
}
