/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Product, Category, NavbarItem, Address, Order, Review, Banner, OrderItem } from "../types";
import { BRAND_LOGO_URL } from "../mockData";
import BannerSlider from "./BannerSlider";
import ProductCard from "./ProductCard";
import ProductDetailPage from "./ProductDetailPage";
import brandLogo from "../assets/logo.jpeg";
import { Search, Heart, ShoppingBag, SlidersHorizontal, ArrowUpDown, ChevronRight, Mail, Phone, MapPin, Sparkles, Check, CheckCircle2, User, HelpCircle, X, ShieldAlert } from "lucide-react";

interface StorefrontViewProps {
  products: Product[];
  categories: Category[];
  navbarItems: NavbarItem[];
  banners: Banner[];
  addresses: Address[];
  cart: { product: Product; size: string; color: string; quantity: number }[];
  wishlist: Product[];
  orders: Order[];
  deliveryCost: number;
  onAddToCart: (product: Product, size: string, color: string, qty: number) => void;
  onRemoveFromCart: (idx: number) => void;
  onUpdateCartQty: (idx: number, qty: number) => void;
  onToggleWishlist: (productId: string) => void;
  onCheckout: (shipAddress: Address, finalizedCart?: Array<{ product: Product; size: string; color: string; quantity: number }>) => Promise<Order | null>;
  onAddReview: (productId: string, rating: number, comment: string) => void;
  onOpenDashboard: () => void;
  onOpenAdmin: () => void;
  isLoggedIn: boolean;
  onOpenAuth: () => void;
}

export default function StorefrontView({
  products,
  categories,
  navbarItems,
  banners,
  addresses,
  cart,
  wishlist,
  orders,
  deliveryCost,
  onAddToCart,
  onRemoveFromCart,
  onUpdateCartQty,
  onToggleWishlist,
  onCheckout,
  onAddReview,
  onOpenDashboard,
  onOpenAdmin,
  isLoggedIn,
  onOpenAuth
}: StorefrontViewProps) {
  
  // Navigation / Filter states
  const [currentSection, setCurrentSection] = useState<"home" | "shop" | "contact">("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All");
  const [selectedSubFilter, setSelectedSubFilter] = useState<string>("All");
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<"default" | "low-high" | "high-low" | "popular">("default");

  // Detail & Checkout Overlays
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showWishlistDrawer, setShowWishlistDrawer] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutSuccessOrder, setCheckoutSuccessOrder] = useState<Order | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [contactSuccess, setContactSuccess] = useState(false);

  const [stockNotice, setStockNotice] = useState<string | null>(null);

  // Handler for out-of-stock redirection to Home Dashboard
  const handleReturnToHomeFromOutOfStock = (productName?: string) => {
    setPreviewProduct(null);
    setCurrentSection("home");
    setSelectedCategoryFilter("All");
    setSelectedSubFilter("All");
    setSearchQuery("");
    const msg = productName
      ? `Notice: "${productName}" is Out of Stock. Redirected to Home Dashboard.`
      : "Notice: This apparel is Out of Stock. Redirected to Home Dashboard.";
    setStockNotice(msg);
    setTimeout(() => setStockNotice(null), 4500);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectProduct = (p: Product) => {
    const liveProd = products.find((prod) => prod.id === p.id) || p;
    if (liveProd.stock <= 0) {
      handleReturnToHomeFromOutOfStock(liveProd.name);
      return;
    }
    setPreviewProduct(liveProd);
  };

  // Keep previewProduct synchronized with live products state (auto-redirect to home if stock hits 0)
  useEffect(() => {
    if (previewProduct) {
      const updated = products.find((p) => p.id === previewProduct.id);
      if (updated) {
        if (updated.stock <= 0) {
          handleReturnToHomeFromOutOfStock(updated.name);
        } else {
          setPreviewProduct(updated);
        }
      }
    }
  }, [products]);

  // Checkout address selection inside form
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [useCustomAddress, setUseCustomAddress] = useState(false);

  // Custom checkout shipping address form values
  const [shipFirst, setShipFirst] = useState("");
  const [shipLast, setShipLast] = useState("");
  const [shipPhone, setShipPhone] = useState("");
  const [shipAltPhone, setShipAltPhone] = useState("");
  const [shipEmail, setShipEmail] = useState("");
  const [shipHouse, setShipHouse] = useState("");
  const [shipApt, setShipApt] = useState("");
  const [shipStreet, setShipStreet] = useState("");
  const [shipArea, setShipArea] = useState("");
  const [shipCity, setShipCity] = useState("");
  const [shipDistrict, setShipDistrict] = useState("");
  const [shipState, setShipState] = useState("");
  const [shipPostal, setShipPostal] = useState("");

  const activeNavs = navbarItems.filter((n) => n.enabled).sort((a,b) => a.order - b.order);

  // Handle banner link click
  const handleBannerClick = (categoryName: string) => {
    setSelectedCategoryFilter(categoryName);
    setSelectedSubFilter("All");
    setCurrentSection("shop");
    // Scroll smoothly to shop boundary
    document.getElementById("primary-shop")?.scrollIntoView({ behavior: "smooth" });
  };

  // Quick Cart / Wishlist Actions
  const handleAddToCartLocal = (product: Product, size: string, color: string, qty: number) => {
    const liveProd = products.find((p) => p.id === product.id) || product;
    if (liveProd.stock <= 0) {
      handleReturnToHomeFromOutOfStock(liveProd.name);
      return;
    }
    onAddToCart(liveProd, size, color, qty);
    setShowCartDrawer(true);
  };

  const handleQuickAdd = (p: Product, size: string, color: string) => {
    const liveProd = products.find((prod) => prod.id === p.id) || p;
    if (liveProd.stock <= 0) {
      handleReturnToHomeFromOutOfStock(liveProd.name);
      return;
    }
    handleAddToCartLocal(liveProd, size, color, 1);
  };

  // Multi-step Checkout States
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1);
  const [checkoutCart, setCheckoutCart] = useState<typeof cart>([]);
  const [isOrderConfirmedInStep3, setIsOrderConfirmedInStep3] = useState(false);

  // Sync with main cart when checkout dialog opens
  useEffect(() => {
    if (showCheckoutModal) {
      const validCart = cart
        .map((c) => {
          const liveProd = products.find((p) => p.id === c.product.id) || c.product;
          return {
            ...c,
            product: liveProd,
            quantity: Math.min(c.quantity, Math.max(0, liveProd.stock))
          };
        })
        .filter((c) => c.product.stock > 0 && c.quantity > 0);
      setCheckoutCart(validCart);
      setCheckoutStep(1);
      setIsOrderConfirmedInStep3(false);
      setCheckoutError(null);
      setUseCustomAddress(addresses.length === 0);
    }
  }, [showCheckoutModal, cart, products, addresses.length]);

  const handleLocalCartUpdate = (index: number, field: "size" | "color" | "quantity", value: any) => {
    const updated = [...checkoutCart];
    const item = updated[index];
    if (!item) return;
    const liveProd = products.find((p) => p.id === item.product.id) || item.product;

    if (field === "quantity") {
      const otherQty = updated
        .filter((c, i) => i !== index && c.product.id === liveProd.id)
        .reduce((sum, c) => sum + c.quantity, 0);
      const maxAllowed = Math.max(1, liveProd.stock - otherQty);
      const parsed = Math.min(Math.max(1, Number(value)), maxAllowed);
      if (Number(value) > maxAllowed) {
        setCheckoutError(`Maximum available stock for "${liveProd.name}" is ${liveProd.stock} unit(s).`);
      } else {
        setCheckoutError(null);
      }
      updated[index] = { ...item, product: liveProd, quantity: parsed };
    } else {
      updated[index] = { ...item, product: liveProd, [field]: value };
    }
    setCheckoutCart(updated);
  };

  const handleRemoveLocalCartItem = (index: number) => {
    const updated = checkoutCart.filter((_, idx) => idx !== index);
    setCheckoutCart(updated);
  };

  // Cart calculations LKR
  const cartSubtotal = cart.reduce((acc, c) => {
    const activePrice = c.product.discountPrice < c.product.price ? c.product.discountPrice : c.product.price;
    return acc + activePrice * c.quantity;
  }, 0);
  const shippingCharge = cart.length > 0 ? deliveryCost : 0; // Flat Sri Lankan standard shipping from admin settings
  const cartTotal = cartSubtotal + shippingCharge;

  // Checkout-level live pricing computations
  const checkoutSubtotal = checkoutCart.reduce((acc, c) => {
    const activePrice = c.product.discountPrice < c.product.price ? c.product.discountPrice : c.product.price;
    return acc + activePrice * c.quantity;
  }, 0);
  
  const checkoutMRP = checkoutCart.reduce((acc, c) => {
    return acc + c.product.price * c.quantity;
  }, 0);

  const checkoutDiscounts = checkoutMRP - checkoutSubtotal;
  const processingFee = checkoutCart.length > 0 ? 150 : 0; // Flat packaging & security tagging fee
  const checkoutGrandTotal = checkoutSubtotal + deliveryCost + processingFee;

  // Filter application on Product inventory list
  const filteredProducts = products.filter((p) => {
    if (p.status !== "Active") return false;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === "All" || p.category.toLowerCase() === selectedCategoryFilter.toLowerCase();
    const matchesSub = selectedSubFilter === "All" || p.subcategory.toLowerCase() === selectedSubFilter.toLowerCase();
    const matchesSize = selectedSizeFilter === "All" || p.sizes.includes(selectedSizeFilter);
    return matchesSearch && matchesCategory && matchesSub && matchesSize;
  });

  // Sorting implementation
  const sortedProducts = [...filteredProducts].sort((a,b) => {
    const aPrice = a.discountPrice < a.price ? a.discountPrice : a.price;
    const bPrice = b.discountPrice < b.price ? b.discountPrice : b.price;
    if (sortOrder === "low-high") return aPrice - bPrice;
    if (sortOrder === "high-low") return bPrice - aPrice;
    if (sortOrder === "popular") return b.reviews.length - a.reviews.length;
    return 0; // default order
  });

  // Homepage groupings
  const newArrivals = products.filter((p) => p.status === "Active").slice(0, 4);
  const trendingApparels = products.filter((p) => p.status === "Active" && p.reviews.length > 0).slice(0, 4);
  const featuredApparels = products.filter((p) => p.status === "Active" && p.featured).slice(0, 4);
  const discountedApparels = products.filter((p) => p.status === "Active" && p.discountPercent >= 20).slice(0, 4);

  // Address dispatch confirm trigger
  const handlePlaceOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    if (checkoutCart.length === 0) {
      setCheckoutError("Your luxury checkout bag is empty or selected items are out of stock.");
      return;
    }

    // Verify stock availability across all items in checkoutCart
    for (const item of checkoutCart) {
      const liveProd = products.find((p) => p.id === item.product.id);
      const totalRequested = checkoutCart
        .filter((c) => c.product.id === item.product.id)
        .reduce((sum, c) => sum + c.quantity, 0);
      if (!liveProd || liveProd.stock <= 0) {
        setCheckoutError(`"${item.product.name}" is now out of stock. Please remove it to continue.`);
        return;
      }
      if (totalRequested > liveProd.stock) {
        setCheckoutError(`Only ${liveProd.stock} unit(s) of "${liveProd.name}" remain in stock. Please adjust your quantity.`);
        return;
      }
    }

    let checkoutAddress: Address;
    if (useCustomAddress) {
      if (!shipFirst || !shipLast || !shipPhone || !shipHouse || !shipStreet || !shipCity || !shipDistrict) {
        setCheckoutError("Please complete all required shipping address fields to proceed.");
        return;
      }
      checkoutAddress = {
        id: `addr_cust_${Date.now()}`,
        firstName: shipFirst,
        lastName: shipLast,
        mobile: shipPhone,
        altMobile: shipAltPhone,
        email: shipEmail,
        houseNumber: shipHouse,
        apartmentName: shipApt,
        streetName: shipStreet,
        area: shipArea,
        landmark: "",
        city: shipCity,
        district: shipDistrict,
        state: shipState,
        country: "Sri Lanka",
        postalCode: shipPostal,
        type: "Other"
      };
    } else {
      const savedAddress = addresses[selectedAddressIndex] ?? addresses[0];
      if (!savedAddress) {
        setCheckoutError("Add a saved shipping address or choose to ship to a new address.");
        return;
      }
      checkoutAddress = savedAddress;
    }

    if (checkoutStep === 1) {
      setCheckoutStep(2);
      return;
    }

    if (checkoutStep === 2) {
      setCheckoutStep(3);
      return;
    }

    if (checkoutStep === 3) {
      if (!isOrderConfirmedInStep3) {
        setCheckoutError("Please check the confirmation box to affirm your order details.");
        return;
      }

      // Capture state values before triggering parents
      try {
        const createdOrder = await onCheckout(checkoutAddress, checkoutCart);
        if (!createdOrder) {
          setCheckoutError("Sign in before placing your order.");
          return;
        }
        setCheckoutSuccessOrder(createdOrder);
        setShowCheckoutModal(false);
      } catch (error) {
        setCheckoutError(error instanceof Error ? error.message : "The order could not be saved. Please try again.");
      }
    }
  };

  return (
    <div className="bg-[#FBF9F4] min-h-screen text-[#121212] flex flex-col justify-between font-sans relative">
      
      {/* ✦ TOP NAVIGATION HEADERS ✦ */}
      <header className="sticky top-0 z-40 bg-luxury-charcoal text-white border-b border-luxury-gold/20 shadow-md">
        
        {/* Tiny announcements alert bar */}
        {/* Out of Stock Notice Banner */}
        {stockNotice && (
          <div className="bg-red-900 text-white py-2.5 px-6 text-center text-xs font-mono tracking-wider font-bold uppercase select-none flex items-center justify-center gap-2 border-b border-red-750 shadow-md">
            <ShieldAlert className="w-4 h-4 text-luxury-gold flex-shrink-0" />
            <span>{stockNotice}</span>
            <button onClick={() => setStockNotice(null)} className="ml-3 text-red-200 hover:text-white cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tiny announcements alert bar */}
        <div className="bg-luxury-gold text-luxury-green py-1.5 px-6 text-center text-[9.5px] font-mono tracking-widest font-bold uppercase select-none">
          ✦ MODERN GRACE, URBAN STYLE ✦
        </div>

        {/* Main Header rows */}
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 sm:py-4.5 flex items-center justify-between select-none">
          
          {/* Brand logo details */}
          <div 
            onClick={() => { setCurrentSection("home"); setSelectedCategoryFilter("All"); setSelectedSubFilter("All"); }}
            className="cursor-pointer group flex items-center gap-3.5 select-none"
          >
            <img
              src={BRAND_LOGO_URL}
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== brandLogo) {
                  target.src = brandLogo;
                }
              }}
              alt="KISHSASHI URBANCHIC Logo"
              className="h-[60px] sm:h-[68px] w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform rounded"
            />
            {/* <div className="flex flex-col">
              <span className="font-luxury-title text-xl sm:text-2.5xl font-light tracking-[0.22em] text-[#E2CC91] group-hover:text-white transition-colors uppercase leading-none">
                KISHSASHI
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono tracking-[0.45em] text-gray-300 mt-1 uppercase pl-0.5 font-bold">
                URBANCHIC
              </span>
            </div> */}
          </div>

          {/* Navigation link triggers */}
          <nav className="hidden lg:flex items-center gap-7.5 text-xs font-mono font-bold tracking-widest text-gray-300 uppercase">
            {activeNavs.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  if (n.label.toLowerCase() === "contact") {
                    setCurrentSection("contact");
                  } else if (n.label.toLowerCase() === "shop" || n.label.toLowerCase() === "sale" || n.label.toLowerCase() === "new arrival") {
                    if (n.label.toLowerCase() === "sale") {
                      setSelectedCategoryFilter("All");
                      setSelectedSubFilter("All");
                      setSelectedSizeFilter("All");
                      setSortOrder("low-high"); // trigger sorting for sale drapes
                    } else if (n.label.toLowerCase() === "new arrival") {
                      setSelectedCategoryFilter("All");
                      setSelectedSubFilter("All");
                    }
                    setCurrentSection("shop");
                  } else {
                    setCurrentSection("home");
                  }
                }}
                className={`hover:text-[#C5A85C] transition-colors relative py-1.5 ${
                  (currentSection === "home" && n.label.toLowerCase() === "home") ||
                  (currentSection === "shop" && n.label.toLowerCase() === "shop") ||
                  (currentSection === "contact" && n.label.toLowerCase() === "contact")
                    ? "text-[#C5A85C] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-[#C5A85C]"
                    : ""
                }`}
              >
                {n.label}
              </button>
            ))}
          </nav>

          {/* Action elements right side */}
          <div className="flex items-center gap-4.5 text-gray-300 font-mono text-xs">
            
            {/* Admin Backstage portal gateway */}
            <button
              onClick={onOpenAdmin}
              className="text-gray-400 hover:text-luxury-gold hover:underline uppercase text-[9px] font-bold tracking-widest border border-gray-100/10 px-2 py-1 bg-neutral-900 rounded-none sm:block hidden"
              title="Admin Backstage Login"
            >
              ADMIN PORTAL
            </button>

            {/* Profile trigger */}
            {isLoggedIn ? (
              <button
                onClick={onOpenDashboard}
                className="hover:text-[#C5A85C] transition-colors flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-semibold"
                title="My Profile Dashboard"
              >
                <User className="w-4 h-4 text-luxury-gold" />
                <span className="sm:inline hidden">My Account</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="hover:text-[#C5A85C] text-gray-400 hover:underline flex items-center gap-1 uppercase tracking-wider text-[11px] font-semibold"
              >
                LOGIN
              </button>
            )}

            {/* Star count Wishlist */}
            <button
              onClick={() => setShowWishlistDrawer(true)}
              className="relative hover:text-[#C5A85C] transition-colors p-1"
              title="Saved Wishlists"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-luxury-gold text-luxury-green text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Bags shopping cart */}
            <button
              onClick={() => setShowCartDrawer(true)}
              className="relative hover:text-[#C5A85C] transition-colors p-1"
              title="Shopping Bags"
            >
              <ShoppingBag className="w-5 h-5 text-luxury-gold" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-luxury-green text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {cart.length}
                </span>
              )}
            </button>

          </div>

        </div>
      </header>

      {/* ✦ PRIMARY LAYOUT STAGE ✦ */}
      <main className="flex-grow select-none">
        
        {/* SECTION 1: USER HOME PAGE VIEW */}
        {currentSection === "home" && (
          <div className="space-y-16 animate-fade-in pb-16">
            
            {/* Banner Slider Hero */}
            <BannerSlider banners={banners} onBannerClick={handleBannerClick} />

            {/* Luxury Category Circular/Square grid */}
            <section className="max-w-7xl mx-auto px-6 lg:px-10" id="categories">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <span className="text-[10px] font-mono tracking-widest text-[#C5A85C] uppercase block mb-1">THE LUXURY BRANDS INSIGNIAS</span>
                <h2 className="font-luxury-title text-2xl sm:text-3.5xl font-light text-luxury-green tracking-wide uppercase leading-tight">
                  SIGNATURE WOMENS COLLECTIONS
                </h2>
                <div className="w-16 h-[1px] bg-luxury-gold mx-auto mt-4" />
              </div>

              {/* Grid lists */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
                {categories.slice(0, 6).map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => handleBannerClick(cat.name)}
                    className="group cursor-pointer bg-white border border-gray-100 p-3.5 text-center flex flex-col justify-between hover:border-luxury-gold transition-all shadow-sm"
                  >
                    <div className="aspect-square bg-gray-50 overflow-hidden mb-3 zoom-container">
                      <img
                        referrerPolicy="no-referrer"
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover object-center zoom-image"
                      />
                    </div>
                    <h4 className="text-xs font-bold text-luxury-green tracking-widest uppercase group-hover:text-luxury-gold transition-colors">
                      {cat.name}
                    </h4>
                  </div>
                ))}
              </div>
            </section>

            {/* Spotlight row 1: NEW ARRIVALS */}
            <section className="max-w-7xl mx-auto px-6 lg:px-10" id="arrivals">
              <div className="flex justify-between items-baseline mb-8 border-b border-gray-100 pb-4">
                <h3 className="font-luxury-title text-xl sm:text-2xl font-light tracking-wide text-luxury-green uppercase block">
                  CROWNED NEW ARRIVALS
                </h3>
                <button
                  onClick={() => { setCurrentSection("shop"); setSelectedCategoryFilter("All"); }}
                  className="text-xs font-mono font-bold tracking-widest text-[#C5A85C] hover:text-luxury-green flex items-center gap-1 uppercase transition-colors"
                >
                  VIEW ALL
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {newArrivals.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onPreview={handleSelectProduct}
                    onToggleWishlist={onToggleWishlist}
                    onAddToCart={handleQuickAdd}
                    isWishlisted={wishlist.some((w) => w.id === prod.id)}
                  />
                ))}
              </div>
            </section>

            {/* Spotlight row 2: THE END-OF-SEASON 50% SALE */}
            <section className="bg-luxury-green text-white py-14" id="sale">
              <div className="max-w-7xl mx-auto px-6 lg:px-10">
                <div className="flex justify-between items-baseline mb-8 border-b border-luxury-gold/20 pb-4">
                  <div>
                    <span className="text-[9px] font-mono tracking-widest text-luxury-gold uppercase block mb-1">MANDATORY EXCLUSIVES</span>
                    <h3 className="font-luxury-title text-xl sm:text-2xl font-light tracking-wide text-[#E2CC91] uppercase block">
                      ELITE LIQUIDATION SALE - SAVINGS UP TO 50%
                    </h3>
                  </div>
                  <button
                    onClick={() => { setCurrentSection("shop"); setSortOrder("low-high"); setSelectedCategoryFilter("All"); }}
                    className="text-xs font-mono font-bold tracking-widest text-[#C5A85C] hover:text-white flex items-center gap-1 uppercase transition-colors"
                  >
                    EXPLORE DESIGNS
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {discountedApparels.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      onPreview={handleSelectProduct}
                      onToggleWishlist={onToggleWishlist}
                      onAddToCart={handleQuickAdd}
                      isWishlisted={wishlist.some((w) => w.id === prod.id)}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Spotlight row 3: FEATURED ELEGANCIES */}
            <section className="max-w-7xl mx-auto px-6 lg:px-10">
              <div className="flex justify-between items-baseline mb-8 border-b border-gray-100 pb-4">
                <h3 className="font-luxury-title text-xl sm:text-2xl font-light tracking-wide text-luxury-green uppercase block">
                  FEATURED LUXURY SPOTLIGHTS
                </h3>
                <span className="text-xs font-mono font-medium text-gray-400">CURATED BY ARTISANS</span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredApparels.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onPreview={handleSelectProduct}
                    onToggleWishlist={onToggleWishlist}
                    onAddToCart={handleQuickAdd}
                    isWishlisted={wishlist.some((w) => w.id === prod.id)}
                  />
                ))}
              </div>
            </section>

            {/* Luxury banner text alert */}
            <section className="bg-luxury-sand py-12 border-t border-b border-gray-200 text-center uppercase tracking-widest">
              <div className="max-w-4xl mx-auto px-6 text-luxury-green space-y-4">
                <p className="font-mono text-xs text-luxury-gold font-bold">THE BRAND STATEMENT OF TRUST</p>
                <p className="font-luxury-title text-lg sm:text-xl font-light leading-relaxed">
                  &quot;Every drape of silk, every satin stitch is curated for modern elite Sri Lankan women who command presence, luxury confidence, and peerless modesty.&quot;
                </p>
              </div>
            </section>
          </div>
        )}

        {/* SECTION 2: SHOP CATALOG FILTER PAGE */}
        {currentSection === "shop" && (
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 animate-fade-in" id="primary-shop">
            
            {/* Catalog header */}
            <div className="border-b border-gray-150 pb-5 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#C5A85C] uppercase block mb-1">Collections catalog</span>
                <h2 className="font-luxury-title text-xl sm:text-2xl font-light text-luxury-green tracking-wider uppercase">
                  DISCOVER {selectedCategoryFilter === "All" ? "ALL APPARELS" : selectedCategoryFilter}
                </h2>
                <p className="text-[10px] text-gray-400 font-mono tracking-wide mt-1">({sortedProducts.length} premium models listed)</p>
              </div>

              {/* Sorters and search inputs */}
              <div className="flex gap-2.5 w-full sm:w-auto flex-wrap">
                <div className="relative flex-grow sm:flex-grow-0 min-w-[200px]">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Sarees, Maxi Dresses..."
                    className="w-full bg-white text-xs border border-gray-200 pl-9 pr-4 py-2 outline-none focus:border-luxury-gold uppercase"
                  />
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>

                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="bg-white border border-gray-200 px-3 py-2 text-xs font-mono tracking-wider outline-none focus:border-luxury-gold uppercase"
                >
                  <option value="default">Default Sorter</option>
                  <option value="low-high">Price: Low to High</option>
                  <option value="high-low">Price: High to Low</option>
                  <option value="popular">Review Popularity</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* Left sidebar filters */}
              <div className="space-y-6">
                
                {/* Visual indicator bar */}
                <div className="bg-luxury-green text-luxury-gold p-3 flex justify-between items-center border border-luxury-gold/20">
                  <span className="text-[10px] font-mono tracking-widest uppercase font-bold flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    CATALOG FILTERS
                  </span>
                  <button
                    onClick={() => {
                      setSelectedCategoryFilter("All");
                      setSelectedSubFilter("All");
                      setSelectedSizeFilter("All");
                      setSearchQuery("");
                      setSortOrder("default");
                    }}
                    className="text-[9px] font-mono font-bold tracking-widest uppercase text-white hover:text-luxury-gold"
                  >
                    RESET
                  </button>
                </div>

                {/* Filter section 1: Category */}
                <div className="bg-white p-5 border border-gray-150">
                  <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-luxury-charcoal pb-2 border-b border-gray-100 mb-3 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-luxury-gold" />
                    CATEGORIES
                  </h4>

                  <div className="space-y-1">
                    <button
                      onClick={() => { setSelectedCategoryFilter("All"); setSelectedSubFilter("All"); }}
                      className={`w-full text-left py-1 text-xs uppercase transition-colors ${
                        selectedCategoryFilter === "All" ? "text-luxury-gold font-bold" : "text-gray-500 hover:text-luxury-green"
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => { setSelectedCategoryFilter(c.name); setSelectedSubFilter("All"); }}
                        className={`w-full text-left py-1 text-xs uppercase flex justify-between items-center transition-colors ${
                          selectedCategoryFilter.toLowerCase() === c.name.toLowerCase() ? "text-luxury-gold font-bold" : "text-gray-500 hover:text-luxury-green"
                        }`}
                      >
                        <span>{c.name}</span>
                        <span className="text-[9px] text-gray-300 font-mono">✦</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter section 2: Subcategories (Dependent on selectedCategory!) */}
                {selectedCategoryFilter !== "All" && (
                  <div className="bg-white p-5 border border-gray-150 animate-fade-in">
                    <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-luxury-charcoal pb-2 border-b border-gray-100 mb-3 capitalize">
                      {selectedCategoryFilter} Divisions
                    </h4>

                    <div className="space-y-1">
                      <button
                        onClick={() => setSelectedSubFilter("All")}
                        className={`w-full text-left py-1 text-xs uppercase transition-colors ${
                          selectedSubFilter === "All" ? "text-luxury-gold font-bold" : "text-gray-500 hover:text-luxury-green"
                        }`}
                      >
                        All Subcategories
                      </button>
                      {(categories.find((c) => c.name.toLowerCase() === selectedCategoryFilter.toLowerCase())?.subcategories || []).map((sub) => (
                        <button
                          key={sub}
                          onClick={() => setSelectedSubFilter(sub)}
                          className={`w-full text-left py-1 text-xs uppercase transition-colors ${
                            selectedSubFilter.toLowerCase() === sub.toLowerCase() ? "text-luxury-gold font-bold" : "text-gray-500 hover:text-luxury-green"
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Filter section 3: Sizing */}
                <div className="bg-white p-5 border border-gray-150">
                  <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-luxury-charcoal pb-2 border-b border-gray-100 mb-3">
                    WOMEN SIZES INDEX
                  </h4>

                  <div className="flex gap-2 flex-wrap">
                    {["All", "XS", "S", "M", "L", "XL", "XXL"].map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSizeFilter(sz)}
                        className={`min-w-10 h-8 px-2.5 text-[9.5px] border font-mono font-bold transition-all ${
                          selectedSizeFilter === sz
                            ? "bg-luxury-green text-[#C5A85C] border-luxury-green"
                            : "bg-white text-gray-500 border-gray-200 hover:border-luxury-gold"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right: Products catalog list flow */}
              <div className="lg:col-span-3">
                {sortedProducts.length === 0 ? (
                  <div className="bg-white p-12 text-center border border-dashed border-gray-200 uppercase tracking-widest font-mono text-xs">
                    No apparels match your current filters criteria. Select Reset above!
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {sortedProducts.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        onPreview={handleSelectProduct}
                        onToggleWishlist={onToggleWishlist}
                        onAddToCart={handleQuickAdd}
                        isWishlisted={wishlist.some((w) => w.id === p.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* SECTION 3: STORE CONTACT INFO */}
        {currentSection === "contact" && (
          <div className="max-w-4xl mx-auto px-6 py-14 animate-fade-in select-none">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-[10px] font-mono tracking-widest text-[#C5A85C] uppercase block mb-1">VISIT THE MAJESTIC SUITES</span>
              <h2 className="font-luxury-title text-2xl sm:text-3.5xl font-light text-luxury-green tracking-wide uppercase">
                CONTACT KISHSASHI URBANCHIC
              </h2>
              <div className="w-16 h-[1px] bg-luxury-gold mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              
              {/* Address details */}
              <div className="bg-white p-6 border border-gray-150 space-y-6">
                <h3 className="font-mono font-bold text-xs tracking-widest uppercase text-luxury-green pb-2.5 border-b border-gray-100">
                  FLAGSHIP SHOWROOM SRI LANKA
                </h3>

                <div className="space-y-4.5 text-xs text-gray-600 uppercase tracking-wide">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-luxury-gold flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-luxury-green">Colombo Contact Us</p>
                      <p className="font-light mt-1 text-gray-500 leading-relaxed">
                        No. 22 Madampitiya Road, Colombo 15<br />
                        Landmark: Near Modara Police station
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Phone className="w-5 h-5 text-luxury-gold flex-shrink-0" />
                    <div>
                      <p className="font-bold text-luxury-green">Mobile Number</p>
                      <p className="font-mono text-gray-500 font-medium mt-1">+94 753764932</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Mail className="w-5 h-5 text-luxury-gold flex-shrink-0" />
                    <div>
                      <p className="font-bold text-luxury-green">Mail id</p>
                      <p className="font-mono text-gray-500 font-medium mt-1 lowercase">info.kishsashi@gmail.com</p>
                    </div>
                  </div>
                </div>

                <div className="bg-luxury-sand p-4 text-[10px] uppercase font-mono tracking-wider space-y-2 border border-gray-150">
                  <p className="font-bold text-luxury-green">⚜ SHOWROOM VISITING SCHEDULES:</p>
                  <p>Mon - Sat: 9:00 AM - 8:30 PM (LKR Cash accepted)</p>
                  <p>Sun & Full-Moon Poya Holidays: Closed for curation</p>
                </div>
              </div>

              {/* Feed contact form */}
              <div className="bg-white p-6 border border-gray-150 rounded-none shadow-sm">
                <h3 className="font-mono font-bold text-xs tracking-widest uppercase text-luxury-green pb-2.5 border-b border-gray-100 mb-4">
                  REACH THE MANAGEMENT
                </h3>

                {contactSuccess && (
                  <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 text-[10px] font-mono uppercase">
                    Thank you! Your support concierge ticket was logged.
                  </div>
                )}

                <form onSubmit={(e) => { e.preventDefault(); setContactSuccess(true); setTimeout(() => setContactSuccess(false), 4000); (e.target as HTMLFormElement).reset(); }} className="space-y-4 text-xs">
                  <div>
                    <label className="text-[10px] font-mono tracking-widest uppercase text-gray-400 block mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Minoli Wijesinghe"
                      className="w-full bg-luxury-sand text-xs border border-gray-200 px-3.5 py-2.5 outline-none focus:border-luxury-gold uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono tracking-widest uppercase text-gray-400 block mb-1">Your Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. client@domain.com"
                      className="w-full bg-luxury-sand text-xs border border-gray-200 px-3.5 py-2.5 outline-none focus:border-luxury-gold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono tracking-widest uppercase text-gray-400 block mb-1">Your Message</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Write your concerns about styling sizes, custom silk weaves..."
                      className="w-full bg-luxury-sand text-xs border border-gray-200 px-3.5 py-2.5 outline-none focus:border-luxury-gold uppercase"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-luxury-green hover:bg-luxury-lightgreen text-[#C5A85C] py-3 text-xs font-mono font-bold tracking-widest uppercase border border-luxury-gold/15"
                  >
                    SEND MANAGEMENT TICKET
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* ✦ OVERLAYS 1: PRODUCT PREVIEW MODAL PAGE ✦ */}
      {previewProduct && (
        <ProductDetailPage
          product={previewProduct}
          onClose={() => setPreviewProduct(null)}
          onAddToCart={handleAddToCartLocal}
          onToggleWishlist={onToggleWishlist}
          isWishlisted={wishlist.some((w) => w.id === previewProduct.id)}
          relatedProducts={products.filter((p) => p.status === "Active" && p.category === previewProduct.category && p.id !== previewProduct.id).slice(0, 4)}
          onSelectRelated={handleSelectProduct}
          onAddReview={onAddReview}
          onGoHome={() => handleReturnToHomeFromOutOfStock(previewProduct.name)}
        />
      )}

      {/* ✦ OVERLAYS 2: CART SLIDE OUT SHEETS ✦ */}
      {showCartDrawer && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowCartDrawer(false); }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-fade-in select-none"
        >
          <div className="w-full max-w-md bg-white h-full flex flex-col justify-between shadow-2xl relative">
            
            {/* Drawer head */}
            <div className="bg-luxury-green text-white p-5 flex justify-between items-center border-b border-luxury-gold/20">
              <span className="font-mono text-xs font-bold tracking-widest uppercase flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-luxury-gold" />
                SHOPPING BAGS ({cart.length})
              </span>
              <button
                type="button"
                onClick={() => setShowCartDrawer(false)}
                className="text-gray-300 hover:text-white cursor-pointer p-1"
                title="Close Shopping Bag"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content list */}
            <div className="flex-grow overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-gray-400 font-mono text-xs uppercase tracking-widest">
                  Your bags are empty.<br />Add luxury apparel to begin.
                </div>
              ) : (
                cart.map((c, i) => {
                  const itemPrice = c.product.discountPrice < c.product.price ? c.product.discountPrice : c.product.price;
                  return (
                    <div key={i} className="flex gap-4 items-center border-b border-gray-100 pb-4">
                      <img
                        referrerPolicy="no-referrer"
                        src={c.product.thumbnail}
                        alt={c.product.name}
                        className="w-12 aspect-[3/4] object-cover border border-gray-100"
                      />
                      <div className="flex-grow uppercase text-xs">
                        <h4 className="font-semibold text-luxury-charcoal line-clamp-1">{c.product.name}</h4>
                        <p className="text-[9px] text-gray-400 font-mono tracking-wide mt-0.5">SIZE: {c.size} | COLOR: {c.color}</p>
                        
                        {/* Quantity manager */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => onUpdateCartQty(i, Math.max(1, c.quantity - 1))}
                            className="bg-gray-100 border text-gray-500 w-5 h-5 flex items-center justify-center rounded font-bold"
                          >-</button>
                          <span className="text-xs font-mono font-semibold w-6 text-center">{c.quantity}</span>
                          <button
                            onClick={() => onUpdateCartQty(i, Math.min(c.product.stock, c.quantity + 1))}
                            className="bg-gray-100 border text-gray-500 w-5 h-5 flex items-center justify-center rounded font-bold"
                          >+</button>
                        </div>
                      </div>

                      <div className="text-right flex flex-col justify-between h-full min-w-[80px]">
                        <p className="font-bold text-xs text-[#072F22] font-mono">LKR {(itemPrice * c.quantity).toLocaleString()}</p>
                        <button
                          onClick={() => onRemoveFromCart(i)}
                          className="text-[9px] text-red-500 hover:text-red-700 tracking-wider font-mono font-bold uppercase mt-3 hover:underline"
                        >
                          DELETE
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Calculations and COD Checkout trigger */}
            {cart.length > 0 && (
              <div className="bg-luxury-sand p-5 border-t border-gray-200 uppercase text-xs select-none">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-light">Subtotal Amount:</span>
                    <span className="font-bold font-mono text-luxury-green">LKR {cartSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-light">Delivery Charge (Flat COD):</span>
                    <span className="font-bold font-mono text-luxury-green">LKR {shippingCharge.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-200/80 my-2" />
                  <div className="flex justify-between font-bold text-sm text-luxury-green">
                    <span>Grand Total Payable:</span>
                    <span className="font-mono text-luxury-gold">LKR {cartTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!isLoggedIn) {
                      onOpenAuth();
                      return;
                    }
                    setShowCartDrawer(false);
                    setShowCheckoutModal(true);
                  }}
                  className="w-full bg-luxury-green hover:bg-luxury-lightgreen text-[#C5A85C] border border-luxury-gold/15 py-3.5 text-xs font-mono font-bold tracking-widest uppercase text-center shadow"
                >
                  PROCEED COD CHECKOUT
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ✦ OVERLAYS 3: WISHLIST SAVED SLIDE DRAWER ✦ */}
      {showWishlistDrawer && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowWishlistDrawer(false); }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-fade-in select-none"
        >
          <div className="w-full max-w-md bg-white h-full flex flex-col justify-between shadow-2xl relative">
            
            <div className="bg-luxury-green text-white p-5 flex justify-between items-center border-b border-luxury-gold/20">
              <span className="font-mono text-xs font-bold tracking-widest uppercase flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-luxury-gold" />
                SAVED WISHLISTS ({wishlist.length})
              </span>
              <button
                type="button"
                onClick={() => setShowWishlistDrawer(false)}
                className="text-gray-300 hover:text-white cursor-pointer p-1"
                title="Close Wishlist"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-5 space-y-4">
              {wishlist.length === 0 ? (
                <div className="text-center py-16 text-gray-400 font-mono text-xs uppercase tracking-widest">
                  No saved apparel items.
                </div>
              ) : (
                wishlist.map((wp) => (
                  <div key={wp.id} className="flex gap-4 items-center border-b border-gray-101 pb-3">
                    <img
                      referrerPolicy="no-referrer"
                      src={wp.thumbnail}
                      alt={wp.name}
                      className="w-10 aspect-[3/4] object-cover"
                    />
                    <div className="flex-grow uppercase text-xs">
                      <h4 className="font-semibold text-luxury-charcoal line-clamp-1">{wp.name}</h4>
                      <p className="text-[9px] text-gray-400 font-mono tracking-wide mt-0.5">{wp.brand}</p>
                      <p className="font-bold text-xs text-[#072F22] mt-1 font-mono">
                        LKR {(wp.discountPrice < wp.price ? wp.discountPrice : wp.price).toLocaleString()}
                      </p>
                    </div>

                    <div className="space-y-1 text-right min-w-[100px]">
                      {(products.find((p) => p.id === wp.id)?.stock ?? wp.stock) > 0 ? (
                        <button
                          onClick={() => {
                            const liveWp = products.find((p) => p.id === wp.id) || wp;
                            handleAddToCartLocal(liveWp, liveWp.sizes[0] || "M", liveWp.colors[0] || "Default", 1);
                            onToggleWishlist(wp.id);
                          }}
                          className="bg-luxury-green text-[#C5A85C] border border-luxury-gold/15 text-[9px] font-mono tracking-widest uppercase py-1 px-2.5 block text-center w-full"
                        >
                          TO BAG
                        </button>
                      ) : (
                        <span className="bg-red-50 text-red-600 border border-red-200 text-[8px] font-mono tracking-widest uppercase py-1 px-2 block text-center w-full font-bold">
                          SOLD OUT
                        </span>
                      )}
                      <button
                        onClick={() => onToggleWishlist(wp.id)}
                        className="text-[8px] text-gray-400 tracking-wider font-mono uppercase hover:text-red-600 block text-center w-full mt-1.5"
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

      {/* ✦ OVERLAYS 4: COD CHECKOUT CONTROL MODAL ✦ */}
      {showCheckoutModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowCheckoutModal(false); }}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in text-xs font-mono uppercase"
        >
          <form onSubmit={handlePlaceOrderSubmit} className="relative w-full max-w-2xl bg-[#FBF9F4] p-6 shadow-2xl rounded border border-gray-200 select-none max-h-[94vh] overflow-y-auto">
            
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-luxury-charcoal cursor-pointer p-1 z-10"
              type="button"
              aria-label="Close Checkout Modal"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-luxury-title text-base text-luxury-green tracking-widest uppercase border-b border-gray-250 pb-3 mb-5 font-semibold">
              SECURE CASH ON DELIVERY (COD) CHECKOUT REGISTER
            </h3>

            {checkoutError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 text-[10px] font-mono uppercase flex items-center justify-between">
                <span>{checkoutError}</span>
                <button type="button" onClick={() => setCheckoutError(null)} className="underline ml-2">DISMISS</button>
              </div>
            )}

            {/* Stage Tracker Indicators */}
            <div className="flex justify-between items-center mb-6 px-1 text-[9px] text-gray-400 font-mono tracking-widest border-b pb-4 border-gray-200/60">
              <div className={`flex items-center gap-1.5 ${checkoutStep === 1 ? "text-luxury-green font-bold" : "text-gray-400"}`}>
                <span className={`w-4.5 h-4.5 flex items-center justify-center rounded-full text-[8.5px] ${checkoutStep === 1 ? "bg-luxury-green text-[#C5A85C] font-bold" : "bg-gray-200 text-gray-500"}`}>1</span>
                PRODUCT DETAILS & ADDRESS
              </div>
              <div className="w-8 h-[1px] bg-gray-300"></div>
              <div className={`flex items-center gap-1.5 ${checkoutStep === 2 ? "text-luxury-green font-bold" : "text-gray-400"}`}>
                <span className={`w-4.5 h-4.5 flex items-center justify-center rounded-full text-[8.5px] ${checkoutStep === 2 ? "bg-luxury-green text-[#C5A85C] font-bold" : "bg-gray-200 text-gray-500"}`}>2</span>
                ORDER FINANCIAL SUMMARY
              </div>
              <div className="w-8 h-[1px] bg-gray-300"></div>
              <div className={`flex items-center gap-1.5 ${checkoutStep === 3 ? "text-luxury-green font-bold" : "text-gray-400"}`}>
                <span className={`w-4.5 h-4.5 flex items-center justify-center rounded-full text-[8.5px] ${checkoutStep === 3 ? "bg-luxury-green text-[#C5A85C] font-bold" : "bg-gray-200 text-gray-500"}`}>3</span>
                AFFIRMATION & CHECKOUT
              </div>
            </div>

            {/* STAGE 1: PRODUCT DETAILS & ADDRESS SELECTION */}
            {checkoutStep === 1 && (
              <div className="space-y-6">
                
                {/* Checkout Items Summary list row - CUSTOMISABLE SIZE/COLOR/QTY */}
                <div className="bg-white border p-4.5 rounded shadow-sm">
                  <span className="text-[9px] text-[#C5A85C] font-bold block mb-2 tracking-widest">STAGE 1: VERIFY & TWEAK PRODUCT SPECIFICATIONS:</span>
                  
                  {checkoutCart.length === 0 ? (
                    <p className="text-gray-400 text-center py-2">Your draft cart is currently empty. Please cancel checkout.</p>
                  ) : (
                    <div className="space-y-3.5 divide-y divide-gray-100 max-h-52 overflow-y-auto pr-1">
                      {checkoutCart.map((c, i) => {
                        const itemPrice = c.product.discountPrice < c.product.price ? c.product.discountPrice : c.product.price;
                        return (
                          <div key={i} className="flex gap-4 pt-3.5 items-start text-[10.5px] font-mono text-[#121212]">
                            <img
                              referrerPolicy="no-referrer"
                              src={c.product.thumbnail}
                              alt={c.product.name}
                              className="w-10 aspect-[3/4] object-cover border border-gray-150 rounded"
                            />
                            
                            <div className="flex-grow min-w-0">
                              <span className="font-semibold block truncate text-luxury-green">{c.product.name}</span>
                              <span className="text-[8.5px] text-[#C5A85C] mt-0.5 block">SKU: {c.product.sku} &bull; LKR {itemPrice.toLocaleString()}</span>
                              
                              <div className="flex flex-wrap gap-2.5 mt-2">
                                {/* Size select */}
                                <div>
                                  <label className="text-[7.5px] text-gray-450 block mb-0.5">SIZE</label>
                                  <select
                                    value={c.size}
                                    onChange={(e) => handleLocalCartUpdate(i, "size", e.target.value)}
                                    className="bg-white border border-gray-200 text-[9px] px-1.5 py-0.5 outline-none rounded"
                                  >
                                    {c.product.sizes.map((sz) => (
                                      <option key={sz} value={sz}>{sz}</option>
                                    ))}
                                  </select>
                                </div>

                                {/* Color select */}
                                <div>
                                  <label className="text-[7.5px] text-gray-450 block mb-0.5">COLOR</label>
                                  <select
                                    value={c.color}
                                    onChange={(e) => handleLocalCartUpdate(i, "color", e.target.value)}
                                    className="bg-white border border-gray-200 text-[9px] px-1.5 py-0.5 outline-none rounded"
                                  >
                                    {c.product.colors.map((col) => (
                                      <option key={col} value={col}>{col}</option>
                                    ))}
                                  </select>
                                </div>

                                {/* Qty adjustments */}
                                <div>
                                  <label className="text-[7.5px] text-gray-450 block mb-0.5">QTY</label>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleLocalCartUpdate(i, "quantity", Math.max(1, c.quantity - 1))}
                                      className="border border-gray-200 px-1.5 py-0 bg-gray-50 text-[10px] hover:bg-gray-100 rounded"
                                    >-</button>
                                    <span className="text-[10px] min-w-[14px] text-center font-bold">{c.quantity}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleLocalCartUpdate(i, "quantity", c.quantity + 1)}
                                      className="border border-gray-200 px-1.5 py-0 bg-gray-50 text-[10px] hover:bg-gray-100 rounded"
                                    >+</button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveLocalCartItem(i)}
                              className="text-gray-400 hover:text-red-650 text-[8.5px] tracking-widest font-bold self-start mt-0.5 transition-colors border border-gray-200 hover:border-red-200 px-1.5 py-0.5 rounded"
                            >
                              DELETE
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="border-t border-gray-200/50 mt-3 pt-3 flex justify-between font-bold text-xs text-luxury-green">
                    <span>Draft Invoice Subtotal:</span>
                    <span>LKR {checkoutSubtotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Address choosing options */}
                <div className="space-y-4">
                  <h4 className="text-[10px] text-[#C5A85C] font-semibold tracking-widest block uppercase">SHIPPING DISPATCH DESTINATION:</h4>
                  
                  <div className="flex gap-4">
                    <button
                      type="button"
                      disabled={addresses.length === 0}
                      onClick={() => setUseCustomAddress(false)}
                      className={`flex-grow py-2.5 text-center font-bold text-[10px] tracking-widest border transition-colors ${
                        addresses.length === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                      } ${
                        !useCustomAddress
                          ? "bg-luxury-green text-luxury-gold border-luxury-green"
                          : "bg-white text-gray-500 border-gray-200 hover:border-luxury-gold"
                      }`}
                    >
                      {addresses.length === 0 ? "NO SAVED ADDRESS" : "USE SAVED ADDRESS RECORD"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setUseCustomAddress(true)}
                      className={`flex-grow py-2.5 text-center font-bold text-[10px] tracking-widest border transition-colors cursor-pointer ${
                        useCustomAddress
                          ? "bg-luxury-green text-luxury-gold border-luxury-green"
                          : "bg-white text-gray-500 border-gray-200 hover:border-luxury-gold"
                      }`}
                    >
                      SHIP TO NEW ADDRESS
                    </button>
                  </div>

                  {!useCustomAddress ? (
                    // Use profile address index
                    <div className="space-y-2.5 bg-white p-4 border rounded shadow-sm max-h-48 overflow-y-auto">
                      <span className="text-[9px] text-gray-400 font-bold block">CHOOSE INCORPORATED SLOT:</span>
                      {addresses.length === 0 ? (
                        <p className="text-[10px] uppercase text-gray-500">
                          No saved addresses yet. Choose “Ship to new address” to continue.
                        </p>
                      ) : addresses.map((item, idx) => (
                        <label
                          key={item.id}
                          onClick={() => setSelectedAddressIndex(idx)}
                          className={`flex items-start gap-3 p-3 border cursor-pointer hover:border-luxury-gold transition-colors ${
                            selectedAddressIndex === idx ? "border-luxury-gold bg-luxury-gold/5" : "border-gray-200"
                          }`}
                        >
                          <input
                            type="radio"
                            name="shipAddressSel"
                            checked={selectedAddressIndex === idx}
                            onChange={() => setSelectedAddressIndex(idx)}
                            className="mt-1 accent-luxury-gold cursor-pointer"
                          />
                          <div className="text-[10.5px] uppercase text-gray-600 font-light leading-snug tracking-wide">
                            <span className="font-bold text-luxury-green block mb-1">{item.type} Address: {item.firstName} {item.lastName}</span>
                            {item.houseNumber}, {item.apartmentName && `${item.apartmentName},` } {item.streetName}, {item.city}, {item.district} &bull; {item.postalCode}
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    // New custom address inputs
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4.5 border rounded">
                      <div>
                        <label className="text-[9px] text-gray-400 block mb-1">First Name</label>
                        <input
                          type="text"
                          required={checkoutStep === 1}
                          value={shipFirst}
                          onChange={(e) => setShipFirst(e.target.value)}
                          placeholder="e.g. Minoli"
                          className="w-full bg-luxury-sand text-xs border border-gray-200 px-3 py-1.5 outline-none focus:border-luxury-gold uppercase"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-400 block mb-1">Last Name</label>
                        <input
                          type="text"
                          required={checkoutStep === 1}
                          value={shipLast}
                          onChange={(e) => setShipLast(e.target.value)}
                          placeholder="e.g. Wijesinghe"
                          className="w-full bg-luxury-sand text-xs border border-gray-200 px-3 py-1.5 outline-none focus:border-luxury-gold uppercase"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] text-gray-400 block mb-1">Mobile Contact No</label>
                        <input
                          type="tel"
                          required={checkoutStep === 1}
                          value={shipPhone}
                          onChange={(e) => setShipPhone(e.target.value)}
                          placeholder="+94 77 111 2233"
                          className="w-full bg-luxury-sand text-xs border border-gray-200 px-3 py-1.5 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-400 block mb-1">Alternative Contact</label>
                        <input
                          type="tel"
                          value={shipAltPhone}
                          onChange={(e) => setShipAltPhone(e.target.value)}
                          className="w-full bg-luxury-sand text-xs border border-gray-200 px-3 py-1.5 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] text-gray-400 block mb-1">House Number</label>
                        <input
                          type="text"
                          required={checkoutStep === 1}
                          value={shipHouse}
                          onChange={(e) => setShipHouse(e.target.value)}
                          placeholder="unit coordinates"
                          className="w-full bg-luxury-sand text-xs border border-gray-200 px-3 py-1.5 outline-none uppercase"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-400 block mb-1">Apartment name</label>
                        <input
                          type="text"
                          value={shipApt}
                          onChange={(e) => setShipApt(e.target.value)}
                          className="w-full bg-luxury-sand text-xs border border-gray-200 px-3 py-1.5 outline-none uppercase"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[9px] text-gray-400 block mb-1">Street and lane info</label>
                        <input
                          type="text"
                          required={checkoutStep === 1}
                          value={shipStreet}
                          onChange={(e) => setShipStreet(e.target.value)}
                          placeholder="Galle Road, Flower Lane"
                          className="w-full bg-luxury-sand text-xs border border-gray-200 px-3.5 py-2 outline-none uppercase"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] text-gray-400 block mb-1">City</label>
                        <input
                          type="text"
                          required={checkoutStep === 1}
                          value={shipCity}
                          onChange={(e) => setShipCity(e.target.value)}
                          className="w-full bg-luxury-sand text-xs border border-gray-200 px-3 py-1.5 outline-none uppercase"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-400 block mb-1">District (Sri Lanka)</label>
                        <input
                          type="text"
                          required={checkoutStep === 1}
                          value={shipDistrict}
                          onChange={(e) => setShipDistrict(e.target.value)}
                          placeholder="e.g. Colombo, Kandy"
                          className="w-full bg-luxury-sand text-xs border border-gray-200 px-3 py-1.5 outline-none uppercase"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] text-gray-400 block mb-1">State / Province</label>
                        <input
                          type="text"
                          value={shipState}
                          onChange={(e) => setShipState(e.target.value)}
                          className="w-full bg-luxury-sand text-xs border border-gray-200 px-3 py-1.5 outline-none uppercase"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-400 block mb-1">Postal Code</label>
                        <input
                          type="text"
                          value={shipPostal}
                          onChange={(e) => setShipPostal(e.target.value)}
                          className="w-full bg-luxury-sand text-xs border border-gray-200 px-3 py-1.5 outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* STAGE 2: METRIC FEES & ORDER FINANCIAL STATEMENT */}
            {checkoutStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                
                <div className="bg-white border rounded p-5 space-y-4 shadow-sm">
                  <h4 className="text-[10px] text-[#C5A85C] font-bold tracking-widest block uppercase border-b pb-2">
                    ⚜ STAGE 2: COST SUMMARY & LOGISTICS ADJUSTMENTS
                  </h4>

                  <div className="space-y-3 font-mono text-[11px] text-neutral-800 leading-relaxed">
                    <div className="flex justify-between items-center py-1">
                      <span>ORIGINAL APPAREL RETAIL (MRP TOTAL):</span>
                      <span className="font-bold">LKR {checkoutMRP.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center text-rose-600 border-b border-gray-100 pb-2">
                      <span>KISHSASHI URBANCHIC PROMOTIONAL REBATE (DISCOUNTS):</span>
                      <span className="font-bold">- LKR {checkoutDiscounts.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span>STANDARD NATIONWIDE DELIVERY & COD TARIFF (FEES):</span>
                      <span className="font-bold text-[#121212]">LKR {deliveryCost.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center text-gray-500 pb-2 border-b border-gray-100">
                      <span>SECURE HAND-OFF & COURIER SIGN-OFF PROCESSING (FEES):</span>
                      <span className="font-bold text-neutral-800">LKR {processingFee.toLocaleString()}</span>
                    </div>

                    <div className="pt-2 flex justify-between font-bold text-xs text-luxury-green">
                      <span>ESTIMATED PAYABLE GRAND TOTAL:</span>
                      <span className="text-sm font-bold text-[#072F22]">LKR {checkoutGrandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 border border-amber-200 text-amber-800 uppercase text-[9px] leading-relaxed rounded">
                  * Dynamic Note: The dynamic shipping tariff has been calculated at <strong>LKR {deliveryCost}</strong> based on the real-time adjustments initiated by KISHSASHI URBANCHIC logistics operators.
                </div>

              </div>
            )}

            {/* STAGE 3: ORDER AFFIRMATION AND UNLOCKED PAYMENT VIEW */}
            {checkoutStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                
                <div className="bg-white border rounded p-5 space-y-4.5 shadow-sm font-mono text-[11px]">
                  <h4 className="text-[10px] text-[#C5A85C] font-bold tracking-widest block uppercase border-b pb-2">
                    ⚜ STAGE 3: RECEIVING DISPATCH & SIZING CONFIRMATION
                  </h4>

                  <div className="space-y-2.5 leading-relaxed text-gray-700">
                    <div>
                      <span className="font-bold text-luxury-green block">RECIPIENT NAME:</span>
                      <span className="uppercase font-light">
                        {useCustomAddress
                          ? `${shipFirst} ${shipLast}`
                          : `${addresses[selectedAddressIndex]?.firstName || ""} ${addresses[selectedAddressIndex]?.lastName || ""}`}
                      </span>
                    </div>

                    <div>
                      <span className="font-bold text-luxury-green block">DISPATCH TELEPHONE:</span>
                      <span className="font-light">
                        {useCustomAddress 
                          ? shipPhone 
                          : addresses[selectedAddressIndex]?.mobile || ""
                        }
                      </span>
                    </div>

                    <div>
                      <span className="font-bold text-luxury-green block">DESTINATION ADDRESS:</span>
                      <span className="uppercase font-light">
                        {useCustomAddress 
                          ? `${shipHouse}, ${shipApt ? `${shipApt}, ` : ""}${shipStreet}, ${shipCity}, ${shipDistrict} &bull; ${shipPostal}`
                          : (() => {
                              const item = addresses[selectedAddressIndex];
                              return item ? `${item.houseNumber}, ${item.apartmentName ? `${item.apartmentName}, ` : ""}${item.streetName}, ${item.city}, ${item.district} &bull; ${item.postalCode}` : "";
                            })()
                        }
                      </span>
                    </div>

                    <div>
                      <span className="font-bold text-luxury-green block">TOTAL DELIVERABLE BAG CONFLICTS:</span>
                      <span className="font-semibold text-[#121212]">
                        {checkoutCart.reduce((s, c) => s + c.quantity, 0)} Apparel items
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-luxury-gold/5 p-4 border border-luxury-gold/30 rounded">
                  <span className="text-[9px] text-[#C5A85C] font-bold block mb-2">AFFIRMATION OF TRUTHFULNESS:</span>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOrderConfirmedInStep3}
                      onChange={(e) => setIsOrderConfirmedInStep3(e.target.checked)}
                      className="mt-1 accent-luxury-gold w-4 h-4 cursor-pointer"
                    />
                    <span className="text-[10px] text-gray-600 leading-snug uppercase tracking-wide">
                      I confirm and certify that the shipping information is correct, sizes are double-checked, and I affirm the Cash-on-Delivery payment sum of LKR {checkoutGrandTotal.toLocaleString()} upon hand-off.
                    </span>
                  </label>
                </div>

              </div>
            )}

            {/* Navigation buttons inside the footer */}
            <div className="flex justify-between items-center gap-3 pb-2 border-t mt-6 pt-4">
              {checkoutStep === 1 ? (
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="px-5 py-2.5 border border-gray-300 font-mono tracking-widest text-[10px] uppercase font-bold text-gray-500 hover:bg-gray-150 cursor-pointer transition-colors"
                >
                  CANCEL
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCheckoutStep((checkoutStep - 1) as any)}
                  className="px-5 py-2.5 border border-[#C5A85C]/40 text-[#C5A85C] font-mono tracking-widest text-[10px] uppercase font-bold hover:bg-luxury-gold/5 cursor-pointer transition-colors"
                >
                  &larr; PREVIOUS STAGE
                </button>
              )}

              {checkoutStep < 3 ? (
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-luxury-green text-[#C5A85C] border border-luxury-gold/20 font-mono tracking-widest text-[10px] uppercase font-bold shadow hover:bg-luxury-lightgreen transition-colors cursor-pointer"
                >
                  PROCEED NEXT &rarr;
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!isOrderConfirmedInStep3}
                  className={`px-5 py-2.5 font-mono tracking-widest text-[10px] uppercase font-bold transition-all ${
                    isOrderConfirmedInStep3
                      ? "bg-amber-600 hover:bg-amber-700 text-white cursor-pointer hover:shadow-lg scale-102"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300/40"
                  }`}
                >
                  {isOrderConfirmedInStep3 ? "✓ PLACE SECURE COD ORDER" : "AFFIRM VERIFIED TO PLACE ORDER"}
                </button>
              )}
            </div>

          </form>
        </div>
      )}

      {/* ✦ OVERLAYS 5: checkout SUCCESS invoice simulations dialog box ✦ */}
      {checkoutSuccessOrder && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setCheckoutSuccessOrder(null); }}
          className="fixed inset-0 z-55 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in text-xs font-mono uppercase select-none"
        >
          <div className="relative w-full max-w-lg bg-white p-6.5 shadow-2xl border border-luxury-gold text-[#121212] flex flex-col items-center text-center">
            
            <button
              type="button"
              onClick={() => setCheckoutSuccessOrder(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 cursor-pointer p-1"
              aria-label="Close Order Confirmation"
            >
              <X className="w-5 h-5" />
            </button>

            <CheckCircle2 className="w-14 h-14 text-emerald-600 mb-4 animate-bounce" />

            <h3 className="font-luxury-title text-lg text-luxury-green font-light tracking-wide uppercase mb-1">
              ORDER PLACED SUCCESSFULLY
            </h3>
            <p className="text-[#C5A85C] text-[10px] font-bold uppercase tracking-widest mb-4">
              COD TRANSACTION ID: {checkoutSuccessOrder.id}
            </p>

            <div className="w-full text-left bg-luxury-sand p-4 border text-[10.5px] uppercase font-light tracking-wide space-y-1.5 mb-6.5">
              <p className="font-bold text-luxury-green border-b pb-1">INVOICE PRE-ACTIVATION DETAILS:</p>
              <p>Recipient Patron: <span className="font-semibold text-luxury-green">{checkoutSuccessOrder.customerName}</span></p>
              <p>Delivery address coordinates: <span className="font-light text-gray-500 leading-snug">{checkoutSuccessOrder.address.houseNumber}, {checkoutSuccessOrder.address.streetName}, {checkoutSuccessOrder.address.city}</span></p>
              <p>COD Payable Sum: <span className="font-bold text-luxury-gold">LKR {(checkoutSuccessOrder.totalAmount + checkoutSuccessOrder.shippingCharge).toLocaleString()}</span></p>
              <p>Order Date Logging: {new Date(checkoutSuccessOrder.date).toLocaleDateString()}</p>
              <p className="text-[9px] text-gray-400 font-mono pt-1 text-center font-semibold">Your order dispatch progress is now traceable inside your account dashboard profile!</p>
            </div>

            <button
              onClick={() => { setCheckoutSuccessOrder(null); onOpenDashboard(); }}
              className="w-full bg-luxury-green hover:bg-luxury-lightgreen text-[#C5A85C] border border-luxury-gold/15 py-3 text-xs tracking-widest font-mono font-bold uppercase flex items-center justify-center gap-2 shadow"
            >
              <span>GO TO MY PURCHASE DASHBOARD</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ✦ FOOTER SECTIONS ✦ */}
      <footer className="bg-luxury-charcoal text-gray-400 py-12 border-t border-luxury-gold/25 select-none text-xs uppercase font-mono">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-gray-100/15 pb-10">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3.5">
              <img
                src={BRAND_LOGO_URL}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== brandLogo) {
                    target.src = brandLogo;
                  }
                }}
                alt="KISHSASHI URBANCHIC Logo"
                className="w-[157px] h-auto object-contain rounded"
              />
              {/* <div>
                <span className="font-luxury-title text-base sm:text-lg tracking-[0.25em] text-[#E2CC91] block leading-none uppercase">KISHSASHI</span>
                <span className="text-[8px] tracking-[0.45em] text-gray-400 block uppercase font-bold pl-0.5 mt-1">URBANCHIC</span>
              </div> */}
            </div>
            <p className="text-gray-500 text-[10px] tracking-wider leading-relaxed pt-1">
              Peerless elite women's fashion store featuring hand-woven silks, satins, luxury jewelry and designer handbags. Sri Lanka's crown jewel.
            </p>
          </div>

          {/* Quick link Col */}
          <div className="space-y-3">
            <h4 className="text-white text-[10px] font-bold tracking-widest">COLLECTIONS BRANCHES</h4>
            <div className="grid grid-cols-1 gap-1.5 text-[10.5px]">
              {categories.slice(0, 4).map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleBannerClick(c.name)}
                  className="text-left hover:text-luxury-gold text-gray-500 transition-colors uppercase"
                >
                  {c.name} drapes
                </button>
              ))}
            </div>
          </div>

          {/* Guidelines info Col */}
          <div className="space-y-3">
            <h4 className="text-white text-[10px] font-bold tracking-widest font-mono">STORE CONFIDENCES</h4>
            <ul className="space-y-1.5 text-[10.5px] text-gray-500">
              <li>✦ Cash on Delivery Islandwide</li>
              <li>✦ 100% Secure Manual Audits</li>
              <li>✦ Custom Wedding Suite Consult</li>
              <li>✦ Easy 7-Day Exchange slots</li>
            </ul>
          </div>

          {/* Flagship Showrooms contact col */}
          <div className="space-y-3">
            <h4 className="text-white text-[10px] font-bold tracking-widest font-mono">CONTACT US</h4>
            <p className="text-gray-500 text-[10px] leading-relaxed">
              No. 22 Madampitiya Road, colombo 15<br />
              Landmark: Near Modara Police station<br />
              Mobile Number - +94 753764932<br />
              Mail id - <span className="lowercase">info.kishsashi@gmail.com</span>
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-gray-500 text-[9px] gap-4">
          <p>© 2026 KISHSASHI URBANCHIC. All Rights Reserved. Crafted with pure high-fidelity Luxury design standards.</p>
          <div className="flex gap-4">
            <span className="text-luxury-gold font-bold">LKR RUPEES DISPLAY METHOD IN SERVICE</span>
            <span>&bull;</span>
            <span className="hover:text-white cursor-pointer" onClick={onOpenAdmin}>developed by prasanthtech2102@gmail.com</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
