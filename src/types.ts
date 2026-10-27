/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Review {
  id: string;
  productId: string;
  userId?: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  sku: string;
  description: string;
  price: number;
  discountPrice: number;
  discountPercent: number;
  stock: number;
  sizes: string[]; // e.g. ["XS", "S", "M", "L", "XL", "XXL"]
  colors: string[];
  material: string;
  weight: string;
  brand: string;
  images: string[];
  thumbnail: string;
  status: "Active" | "Inactive";
  featured: boolean;
  reviews: Review[];
}

export interface Category {
  id: string;
  name: string;
  subcategories: string[];
  image: string;
  status: "Active" | "Inactive";
}

export interface NavbarItem {
  id: string;
  label: string;
  url: string;
  enabled: boolean;
  order: number;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  gender: string;
  dob: string;
  mobile: string;
  alternativeMobile: string;
  email: string;
  profileImage: string;
  verified: boolean;
}

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  altMobile: string;
  email: string;
  houseNumber: string;
  apartmentName: string;
  streetName: string;
  area: string;
  landmark: string;
  city: string;
  district: string;
  state: string;
  country: string; // Defaults to Sri Lanka
  postalCode: string;
  type: "Home" | "Office" | "Other";
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  price: number;
  thumbnail: string;
  size: string;
  color: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  mobile: string;
  items: OrderItem[];
  totalAmount: number;
  shippingCharge: number;
  address: Address;
  paymentMethod: "COD";
  status: "Pending" | "Confirmed" | "Packed" | "Shipped" | "Delivered" | "Cancelled";
  date: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  discountText: string;
  link: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "order" | "inventory" | "system";
  date: string;
  read: boolean;
}
