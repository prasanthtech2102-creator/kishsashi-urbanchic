/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Category, NavbarItem, Address, Order, Banner, Review, Notification } from "./types";

// Theme constants
export const THEME = {
  green: "#072F22",
  gold: "#C5A85C",
  white: "#FFFFFF",
  black: "#121212",
  sand: "#FBF9F4"
};

// Brand Logo URL
export const BRAND_LOGO_URL = "https://cdn.phototourl.com/member/2026-10-26-7f13cf5b-6bfa-4a70-94db-f50b8c4f2403.jpg";

// Default User Address
export const DEFAULT_ADDRESSES: Address[] = [
  {
    id: "addr_1",
    firstName: "Aanya",
    lastName: "Silva",
    mobile: "+94 77 123 4567",
    altMobile: "+94 71 987 6543",
    email: "customer@kishsashi.com",
    houseNumber: "24/B",
    apartmentName: "Emerald Heights",
    streetName: "Flower Road",
    area: "Colombo 07",
    landmark: "Opposite National Museum",
    city: "Colombo",
    district: "Colombo",
    state: "Western Province",
    country: "Sri Lanka",
    postalCode: "00700",
    type: "Home"
  },
  {
    id: "addr_2",
    firstName: "Aanya",
    lastName: "Silva",
    mobile: "+94 77 123 4567",
    altMobile: "",
    email: "customer@kishsashi.com",
    houseNumber: "Level 14",
    apartmentName: "World Trade Center",
    streetName: "Echelon Square",
    area: "Fort",
    landmark: "East Tower",
    city: "Colombo",
    district: "Colombo",
    state: "Western Province",
    country: "Sri Lanka",
    postalCode: "00100",
    type: "Office"
  }
];

// Initial Categories
export const INITIAL_CATEGORIES: Category[] = [
  {
    id: "cat_sarees",
    name: "Sarees",
    subcategories: ["Silk Sarees", "Cotton Sarees", "Party Wear Sarees", "Designer Sarees", "Wedding Sarees"],
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=700",
    status: "Active"
  },
  {
    id: "cat_dresses",
    name: "Dresses",
    subcategories: ["Maxi Dresses", "Mini Dresses", "Party Dresses", "Casual Dresses", "Evening Dresses"],
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=700",
    status: "Active"
  },
  {
    id: "cat_kurtis",
    name: "Kurtis Set",
    subcategories: ["Printed Kurtis", "Designer Kurtis", "Cotton Kurtis", "Party Kurtis"],
    image: "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&q=80&w=700",
    status: "Active"
  },
  {
    id: "cat_tops",
    name: "Tops",
    subcategories: ["Casual Tops", "Crop Tops", "Office Wear Tops", "Designer Tops"],
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=700",
    status: "Active"
  },
  {
    id: "cat_bottoms",
    name: "Jeans & Bottom Wear",
    subcategories: ["Jeans", "Palazzo", "Leggings", "Trousers", "Skirts"],
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=700",
    status: "Active"
  },
  {
    id: "cat_ethnic",
    name: "Ethnic Wear",
    subcategories: ["Salwar Suits", "Lehenga", "Anarkali", "Traditional Sets"],
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=700",
    status: "Active"
  },
  {
    id: "cat_western",
    name: "Western Wear",
    subcategories: ["Jackets", "Blazers", "Jumpsuits", "Shrugs"],
    image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&q=80&w=700",
    status: "Active"
  },
  {
    id: "cat_nightwear",
    name: "Nightwear",
    subcategories: ["Night Dresses", "Pajama Sets"],
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=700",
    status: "Active"
  },
  {
    id: "cat_innerwear",
    name: "Innerwear",
    subcategories: ["Bra", "Panties", "Shapewear"],
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=700",
    status: "Active"
  },
  {
    id: "cat_footwear",
    name: "Footwear",
    subcategories: ["Heels", "Sandals", "Flats", "Sneakers"],
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=700",
    status: "Active"
  },
  {
    id: "cat_handbags",
    name: "Handbags",
    subcategories: ["Tote Bags", "Sling Bags", "Clutches"],
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=700",
    status: "Active"
  },
  {
    id: "cat_jewellery",
    name: "Jewellery",
    subcategories: ["Earrings", "Necklaces", "Rings", "Bracelets"],
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=700",
    status: "Active"
  },
  {
    id: "cat_beauty",
    name: "Beauty & Accessories",
    subcategories: ["Makeup Kits", "Hair Accessories", "Sunglasses", "Watches"],
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=700",
    status: "Active"
  }
];

// Initial Banners
export const INITIAL_BANNERS: Banner[] = [
  {
    id: "banner_1",
    title: "WEDDING SUITE",
    subtitle: "Luxurious Handwoven Silk & Bridal Sarees",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1400",
    discountText: "Flat 20% OFF on Wedding Essentials",
    link: "Sarees"
  },
  {
    id: "banner_2",
    title: "FLAT 50% OFF",
    subtitle: "End of Season Luxury Fashion Sale",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1400",
    discountText: "Save Big - Selected Maxi Dresses & Tops",
    link: "Dresses"
  },
  {
    id: "banner_3",
    title: "METROPOLITAN MODERN",
    subtitle: "Kishsashi Office & Designer Tops Collection",
    image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&q=80&w=1400",
    discountText: "Elite Wardrobes for High Achievers",
    link: "Tops"
  }
];

// Default Navbar Menu Config
export const DEFAULT_NAVBAR: NavbarItem[] = [
  { id: "nav_home", label: "Home", url: "#home", enabled: true, order: 1 },
  { id: "nav_shop", label: "Shop", url: "#shop", enabled: true, order: 2 },
  { id: "nav_categories", label: "Categories", url: "#categories", enabled: true, order: 3 },
  { id: "nav_arrivals", label: "New Arrival", url: "#arrivals", enabled: true, order: 4 },
  { id: "nav_sale", label: "Sale", url: "#sale", enabled: true, order: 5 },
  { id: "nav_contact", label: "Contact", url: "#contact", enabled: true, order: 6 }
];

// Seed Reviews
const seedReviews: Review[] = [
  {
    id: "rev_1",
    productId: "p_silk_01",
    customerName: "Sithmi Perera",
    rating: 5,
    comment: "This banarasi silk saree is majestic. The border has true gold thread details. Absolute elite luxury quality, LKR 24,500 was worth every cent.",
    date: "2026-05-18"
  },
  {
    id: "rev_2",
    productId: "p_silk_01",
    customerName: "Minoli Wijesinghe",
    rating: 4,
    comment: "Excellent texture and rich look. It's a bit heavier than standard silk, but drapes beautifully for functions.",
    date: "2026-05-20"
  },
  {
    id: "rev_3",
    productId: "p_dress_01",
    customerName: "Dilini Cooray",
    rating: 5,
    comment: "Wore this evening dress to a charity gala. Received 100+ compliments! Fits like an absolute dream.",
    date: "2026-05-15"
  }
];

// Seed Products
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "p_silk_01",
    name: "Kishsashi Kanchipuram Gold Brocade Silk Saree",
    category: "Sarees",
    subcategory: "Silk Sarees",
    sku: "KSH-SR-KNC-01",
    description: "Indulge in absolute luxury with this masterpiece Kanchipuram silk saree. Woven on authentic handlooms, this gorgeous drape sports pure zari gold brocade work along the pallu and traditional patterns on the body. Perfect for high-profile weddings and royalty-themed gala events.",
    price: 32000,
    discountPrice: 24500,
    discountPercent: 23,
    stock: 5,
    sizes: ["L", "XL", "XXL"],
    colors: ["Crimson Red", "Classic Emerald", "Royal Blue"],
    material: "Pure Mulberry Handloom Silk & Zari",
    weight: "850g",
    brand: "KISHSASHI URBANCHIC",
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1000"
    ],
    thumbnail: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=300",
    status: "Active",
    featured: true,
    reviews: [seedReviews[0], seedReviews[1]]
  },
  {
    id: "p_dress_01",
    name: "Gold-Stitched Emerald Satin Maxi Dress",
    category: "Dresses",
    subcategory: "Maxi Dresses",
    sku: "KSH-DR-SAT-02",
    description: "An incredibly elegant flowing silhouette made from double-faced heavy satin core fabric, embroidered with subtle gold leafing on the cuffs and bodice. This premium maxi dress features an adjustable belt to highlight your waist line with maximum premium comfort.",
    price: 18500,
    discountPrice: 15500,
    discountPercent: 16,
    stock: 12,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Forest Green", "Champagne Gold", "Onyx Black"],
    material: "Elite Satin Silk blend",
    weight: "420g",
    brand: "KISHSASHI URBANCHIC",
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1000"
    ],
    thumbnail: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=300",
    status: "Active",
    featured: true,
    reviews: [seedReviews[2]]
  },
  {
    id: "p_kurti_01",
    name: "Classic Ivory Embroidered Designer Kurti",
    category: "Kurtis Set",
    subcategory: "Designer Kurtis",
    sku: "KSH-KT-IVR-03",
    description: "This modern high-collar embroidered kurti blends custom fusion aesthetics with lightweight premium wear. Elaborate gold thread necklines are curated by traditional artisans, providing unparalleled elegance for casual get-togethers or designer wear needs.",
    price: 9500,
    discountPrice: 7900,
    discountPercent: 17,
    stock: 2, // Low stock product
    sizes: ["S", "M", "L", "XL"],
    colors: ["Ivory White", "Rose Quartz"],
    material: "Premium Organic Linen & Cotton Mix",
    weight: "260g",
    brand: "KISHSASHI URBANCHIC",
    images: [
      "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1000"
    ],
    thumbnail: "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&q=80&w=300",
    status: "Active",
    featured: false,
    reviews: []
  },
  {
    id: "p_top_01",
    name: "Polished Georgette Corporate Office Top",
    category: "Tops",
    subcategory: "Office Wear Tops",
    sku: "KSH-TP-GEO-04",
    description: "Exquisite office wear georgette top with structured gold button trims on the shoulders and double lined sleek collar. Tailored for professional women who cherish sharp confidence and premium material breathability, throughout the working schedules.",
    price: 6500,
    discountPrice: 6500,
    discountPercent: 0,
    stock: 25,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Olive Green", "Midnight Black", "Sleek White"],
    material: "Heavy Flow Georgette",
    weight: "180g",
    brand: "KISHSASHI URBANCHIC",
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1000"
    ],
    thumbnail: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=300",
    status: "Active",
    featured: true,
    reviews: []
  },
  {
    id: "p_bag_01",
    name: "Royal Golden-Embossed Leather Clutch Bag",
    category: "Handbags",
    subcategory: "Clutches",
    sku: "KSH-HB-CLT-05",
    description: "An ultra-premium gold frame clutch featuring hand-woven metallic threads and soft vegan leather lining inside. Comes with a detachable pure brass gold chain strap for conversion into a luxury sling purse.",
    price: 14000,
    discountPrice: 11500,
    discountPercent: 18,
    stock: 8,
    sizes: ["XS"], // Clutches have NO sizing but for uniformity we keep an item in stock
    colors: ["Liquid Gold", "Emerald Green", "Void Black"],
    material: "Top-grain textured leather with brass gold metal frames",
    weight: "310g",
    brand: "KISHSASHI URBANCHIC ACCESSORIES",
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=1000"
    ],
    thumbnail: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=300",
    status: "Active",
    featured: true,
    reviews: []
  },
  {
    id: "p_heel_01",
    name: "Sienna Premium Suede Ankle-Strap Block Heels",
    category: "Footwear",
    subcategory: "Heels",
    sku: "KSH-FW-HLS-06",
    description: "Walk with absolute power and comfort. These hand-stitched Sienna block heels feature ergonomic arch support support and dual cushioning wrapper inside high-grade suede leather exterior.",
    price: 15500,
    discountPrice: 12500,
    discountPercent: 19,
    stock: 14,
    sizes: ["S", "M", "L"], // Stand-in for Footwear sizes like EUR 37, 38, 39
    colors: ["Burnt Sienna", "Emerald Green", "Classic Gold"],
    material: "Eco Suede Leather",
    weight: "500g",
    brand: "KISHSASHI URBANCHIC FOOTWEAR",
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=1000"
    ],
    thumbnail: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=300",
    status: "Active",
    featured: false,
    reviews: []
  },
  {
    id: "p_jw_01",
    name: "Emperor Emerald & Kundan Statement Choker Set",
    category: "Jewellery",
    subcategory: "Necklaces",
    sku: "KSH-JW-CHK-07",
    description: "This royal-inspired choker is embellished with premium synthetic uncut Kundan diamonds and deep-green Brazilian emerald stone hangings. Includes matching tear-drop hanging earrings for a complete regal aesthetic.",
    price: 25000,
    discountPrice: 19500,
    discountPercent: 22,
    stock: 3,
    sizes: ["M"],
    colors: ["Deep Emerald & Gold"],
    material: "Gold plated copper alloy with premium semi-precious stones",
    weight: "350g",
    brand: "KISHSASHI URBANCHIC JEWELLERY",
    images: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1000"
    ],
    thumbnail: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=300",
    status: "Active",
    featured: true,
    reviews: []
  },
  {
    id: "p_dress_02",
    name: "Crimson Silk-Blend Shimmer Dress",
    category: "Dresses",
    subcategory: "Party Dresses",
    sku: "KSH-DR-CRM-08",
    description: "Capture the spotlights with this hand-tailored crimson silk blend shimmer dress, styled with structured shoulder drops and asymmetric bottom drape lines, curated to match luxury party dress aspirations.",
    price: 19500,
    discountPrice: 9750, // 50% OFF sale item
    discountPercent: 50,
    stock: 1, // Extremely low stock
    sizes: ["XS", "S", "M", "L"],
    colors: ["Ruby Violet", "Luxury Gold"],
    material: "Silk-Georgette Blended fibers",
    weight: "380g",
    brand: "KISHSASHI URBANCHIC",
    images: [
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1000"
    ],
    thumbnail: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=300",
    status: "Active",
    featured: true,
    reviews: []
  }
];

// Initial Seed Orders for Dashboard Reports
export const INITIAL_ORDERS: Order[] = [
  {
    id: "KSH-ORD-10042",
    userId: "user_001",
    customerName: "Sithmi Perera",
    mobile: "+94 77 111 2233",
    items: [
      {
        productId: "p_silk_01",
        productName: "Kishsashi Kanchipuram Gold Brocade Silk Saree",
        sku: "KSH-SR-KNC-01",
        quantity: 1,
        price: 24500,
        thumbnail: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=300",
        size: "XL",
        color: "Crimson Red"
      }
    ],
    totalAmount: 24500,
    shippingCharge: 350,
    address: DEFAULT_ADDRESSES[0],
    paymentMethod: "COD",
    status: "Delivered",
    date: "2026-05-20T10:30:00Z"
  },
  {
    id: "KSH-ORD-10043",
    userId: "user_002",
    customerName: "Nisansala De Silva",
    mobile: "+94 71 444 5566",
    items: [
      {
        productId: "p_dress_01",
        productName: "Gold-Stitched Emerald Satin Maxi Dress",
        sku: "KSH-DR-SAT-02",
        quantity: 1,
        price: 15500,
        thumbnail: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=300",
        size: "M",
        color: "Forest Green"
      },
      {
        productId: "p_top_01",
        productName: "Polished Georgette Corporate Office Top",
        sku: "KSH-TP-GEO-04",
        quantity: 1,
        price: 6500,
        thumbnail: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=300",
        size: "M",
        color: "Midnight Black"
      }
    ],
    totalAmount: 22000,
    shippingCharge: 350,
    address: DEFAULT_ADDRESSES[1],
    paymentMethod: "COD",
    status: "Pending",
    date: "2026-05-23T08:15:00Z"
  },
  {
    id: "KSH-ORD-10044",
    userId: "user_001",
    customerName: "Aanya Silva",
    mobile: "+94 77 123 4567",
    items: [
      {
        productId: "p_bag_01",
        productName: "Royal Golden-Embossed Leather Clutch Bag",
        sku: "KSH-HB-CLT-05",
        quantity: 1,
        price: 11500,
        thumbnail: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=300",
        size: "XS",
        color: "Liquid Gold"
      }
    ],
    totalAmount: 11500,
    shippingCharge: 350,
    address: DEFAULT_ADDRESSES[0],
    paymentMethod: "COD",
    status: "Confirmed",
    date: "2026-05-23T11:45:00Z"
  }
];

// Initial Notifications
export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "not_1",
    title: "New Elegant Order",
    message: "Aanya Silva just ordered 1x Royal Golden Leather Clutch Bag via Cash on Delivery.",
    type: "order",
    date: "2026-05-23T11:45:00Z",
    read: false
  },
  {
    id: "not_2",
    title: "Critical Low Stock Alert",
    message: "Kurti product 'Classic Ivory Embroidered Designer Kurti' is down to 2 units left.",
    type: "inventory",
    date: "2026-05-23T09:00:00Z",
    read: false
  }
];
