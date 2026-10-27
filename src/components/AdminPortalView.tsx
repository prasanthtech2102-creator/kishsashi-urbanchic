/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Product, Category, NavbarItem, Order, Review, Banner, Notification } from "../types";
import { BRAND_LOGO_URL } from "../mockData";
import { auth } from "../firebase";
import brandLogo from "../assets/logo.jpeg";
import { LayoutDashboard, ShoppingCart, FolderKanban, Sliders, MessageSquare, Plus, Edit2, Trash2, Save, LogOut, Check, Eye, AlertCircle, TrendingUp, DollarSign, Users, Package, ShoppingBag, EyeOff, RotateCw, X, Image as ImageIcon, Sparkles } from "lucide-react";

interface ImageLinkInputProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

function ImageLinkInput({ label, value, onChange, placeholder = "Paste high-res image URL (https://...)" }: ImageLinkInputProps) {
  return (
    <div className="bg-neutral-950/40 p-3.5 border border-neutral-800 rounded space-y-2 mt-1 mb-1 text-left w-full">
      <label className="text-[10px] font-bold tracking-widest text-[#C5A85C] uppercase block">{label}</label>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 outline-none focus:border-luxury-gold text-white text-xs"
      />
      {value && (
        <div className="flex items-center gap-3 text-left bg-neutral-950 p-2 border border-neutral-800">
          <img
            src={value}
            alt="Preview"
            className="w-10 h-14 object-cover border border-neutral-800 shrink-0"
            referrerPolicy="no-referrer"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <p className="text-[8px] text-gray-400 font-mono truncate flex-grow leading-tight">{value}</p>
        </div>
      )}
    </div>
  );
}

interface AdminPortalViewProps {
  products: Product[];
  categories: Category[];
  navbarItems: NavbarItem[];
  orders: Order[];
  reviews: Review[];
  banners: Banner[];
  notifications: Notification[];
  deliveryCost: number;
  onUpdateDeliveryCost: (cost: number) => void;
  onAddProduct: (p: Product) => void;
  onEditProduct: (p: Product) => void;
  onDeleteProduct: (pId: string) => void;
  onAddCategory: (cat: Category) => void;
  onEditCategory: (cat: Category) => void;
  onDeleteCategory: (catId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: Order["status"]) => void;
  onUpdateNavbar: (items: NavbarItem[]) => void;
  onAddBanner: (b: Banner) => void;
  onEditBanner: (b: Banner) => void;
  onDeleteBanner: (id: string) => void;
  onReorderBanners?: (items: Banner[]) => void;
  onDeleteReview: (revId: string) => void;
  onLogoutAdmin: () => void;
}

export default function AdminPortalView({
  products,
  categories,
  navbarItems,
  orders,
  reviews,
  banners,
  notifications,
  deliveryCost,
  onUpdateDeliveryCost,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onUpdateOrderStatus,
  onUpdateNavbar,
  onAddBanner,
  onEditBanner,
  onDeleteBanner,
  onReorderBanners,
  onDeleteReview,
  onLogoutAdmin
}: AdminPortalViewProps) {
  
  // Navigation
  const [activePanel, setActivePanel] = useState<"dashboard" | "products" | "categories" | "banners" | "orders" | "navbar" | "reviews">("dashboard");

  // Dynamic delivery settings
  const [tempDeliveryCost, setTempDeliveryCost] = useState(deliveryCost);
  const [showLogisticsSuccess, setShowLogisticsSuccess] = useState(false);

  // Sync state if deliveryCost prop updates
  React.useEffect(() => {
    setTempDeliveryCost(deliveryCost);
  }, [deliveryCost]);

  // Product CRUD states
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Product Form Input Values
  const [prodName, setProdName] = useState("");
  const [prodCategory, setProdCategory] = useState(categories[0]?.name || "Sarees");
  const [prodSub, setProdSub] = useState("");
  const [prodSku, setProdSku] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrice, setProdPrice] = useState(0);
  const [prodDiscountPrice, setProdDiscountPrice] = useState(0);
  const [prodStock, setProdStock] = useState(1);
  const [prodSizes, setProdSizes] = useState<string[]>(["M"]);
  const [prodColors, setProdColors] = useState<string[]>(["Onyx Black"]);
  const [prodMaterial, setProdMaterial] = useState("Satin Blend");
  const [prodWeight, setProdWeight] = useState("350g");
  const [prodBrand, setProdBrand] = useState("KISHSASHI URBANCHIC");
  const [prodThumbnail, setProdThumbnail] = useState("");
  const [prodImages, setProdImages] = useState<string[]>([""]);
  const [prodStatus, setProdStatus] = useState<Product["status"]>("Active");
  const [prodFeatured, setProdFeatured] = useState(false);

  // Category CRUD states
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState("");
  const [catSubs, setCatSubs] = useState("");
  const [catImage, setCatImage] = useState("");
  const [catStatus, setCatStatus] = useState<Category["status"]>("Active");

  // Navbar management states
  const [navEditId, setNavEditId] = useState<string | null>(null);
  const [navEditLabel, setNavEditLabel] = useState("");
  const [navEditEnabled, setNavEditEnabled] = useState(true);
  const [showAddNav, setShowAddNav] = useState(false);
  const [newNavLabel, setNewNavLabel] = useState("");
  const [newNavUrl, setNewNavUrl] = useState("");

  // Banner CRUD states
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtitle, setBannerSubtitle] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [bannerDiscountText, setBannerDiscountText] = useState("");
  const [bannerLink, setBannerLink] = useState(categories[0]?.name || "Sarees");

  // Statistics calculation
  const totalUsers = 42; // static seeded count
  const totalProducts = products.length;
  const totalOrdersCount = orders.length;
  
  // Financial numbers
  const deliveredOrders = orders.filter((o) => o.status === "Delivered");
  const pendingOrders = orders.filter((o) => o.status === "Pending");
  const cancelledOrders = orders.filter((o) => o.status === "Cancelled");
  
  const totalRevenue = deliveredOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  
  const todaySales = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((acc, o) => acc + o.totalAmount, 0) * 0.4; // simulated daily portion
  const weeklySales = totalRevenue * 0.85; // Simulated weekly reports allocation
  const monthlySales = totalRevenue;

  // Low Stock products listing (< 4 units)
  const lowStockProducts = products.filter((p) => p.stock <= 3);

  // Auto-fill form values on product editing
  const handleOpenProductEdit = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdCategory(p.category);
    setProdSub(p.subcategory);
    setProdSku(p.sku);
    setProdDesc(p.description);
    setProdPrice(p.price);
    setProdDiscountPrice(p.discountPrice);
    setProdStock(p.stock);
    setProdSizes(p.sizes);
    setProdColors(p.colors);
    setProdMaterial(p.material);
    setProdWeight(p.weight);
    setProdBrand(p.brand);
    setProdThumbnail(p.thumbnail);
    setProdImages(p.images);
    setProdStatus(p.status);
    setProdFeatured(p.featured);
    setShowProductModal(true);
  };

  const handleOpenProductCreate = () => {
    setEditingProduct(null);
    setProdName("");
    setProdCategory(categories[0]?.name || "Sarees");
    setProdSub(categories[0]?.subcategories[0] || "Silk Sarees");
    setProdSku(`KSH-SKU-${Math.floor(Math.random() * 9000 + 1000)}`);
    setProdDesc("");
    setProdPrice(5000);
    setProdDiscountPrice(4500);
    setProdStock(10);
    setProdSizes(["M", "L", "XL"]);
    setProdColors(["Onyx Black", "Classic Gold"]);
    setProdMaterial("Premium Linen");
    setProdWeight("190g");
    setProdBrand("KISHSASHI URBANCHIC");
    setProdThumbnail("https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=300");
    setProdImages(["https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=1000"]);
    setProdStatus("Active");
    setProdFeatured(false);
    setShowProductModal(true);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const safePrice = Math.max(0, Number(prodPrice) || 0);
    const safeDiscountPrice = Math.max(0, Number(prodDiscountPrice) || 0);
    const discountPercent = safePrice > 0 && safeDiscountPrice < safePrice
      ? Math.round(((safePrice - safeDiscountPrice) / safePrice) * 100)
      : 0;
    const validImages = prodImages.filter((img) => img.trim() !== "");
    const fallbackImg = "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=1000";
    
    const finalizedProduct: Product = {
      id: editingProduct?.id || `p_${Date.now()}`,
      name: prodName.trim() || "Untitled Apparel",
      category: prodCategory,
      subcategory: prodSub,
      sku: prodSku.trim() || `KSH-SKU-${Math.floor(Math.random() * 9000 + 1000)}`,
      description: prodDesc,
      price: safePrice,
      discountPrice: safeDiscountPrice,
      discountPercent: discountPercent,
      stock: Math.max(0, Number(prodStock) || 0),
      sizes: prodSizes.length > 0 ? prodSizes : ["M"],
      colors: prodColors.length > 0 ? prodColors : ["Default"],
      material: prodMaterial,
      weight: prodWeight,
      brand: prodBrand,
      thumbnail: prodThumbnail || validImages[0] || fallbackImg,
      images: validImages.length > 0 ? validImages : [prodThumbnail || fallbackImg],
      status: prodStatus,
      featured: prodFeatured,
      reviews: editingProduct?.reviews || []
    };

    if (editingProduct) {
      onEditProduct(finalizedProduct);
    } else {
      onAddProduct(finalizedProduct);
    }
    setShowProductModal(false);
  };

  // Category CRUD handlers
  const handleOpenCatEdit = (c: Category) => {
    setEditingCategory(c);
    setCatName(c.name);
    setCatSubs(c.subcategories.join(", "));
    setCatImage(c.image);
    setCatStatus(c.status);
    setShowCatModal(true);
  };

  const handleOpenCatCreate = () => {
    setEditingCategory(null);
    setCatName("");
    setCatSubs("");
    setCatImage("https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=500");
    setCatStatus("Active");
    setShowCatModal(true);
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subArr = catSubs.split(",").map((s) => s.trim()).filter((s) => s !== "");
    const finalizedCat: Category = {
      id: editingCategory?.id || `cat_${catName.toLowerCase().replace(/\s+/g, "_")}`,
      name: catName,
      subcategories: subArr,
      image: catImage,
      status: catStatus
    };

    if (editingCategory) {
      onEditCategory(finalizedCat);
    } else {
      onAddCategory(finalizedCat);
    }
    setShowCatModal(false);
  };

  // Navbar customizer helper actions
  const handleNavbarRearrange = (id: string, dir: "up" | "down") => {
    const sorted = [...navbarItems].sort((a,b) => a.order - b.order);
    const index = sorted.findIndex((n) => n.id === id);
    if (index === -1) return;
    
    if (dir === "up" && index > 0) {
      // Swap elements order integers
      const temp = sorted[index].order;
      sorted[index].order = sorted[index - 1].order;
      sorted[index - 1].order = temp;
    } else if (dir === "down" && index < sorted.length - 1) {
      const temp = sorted[index].order;
      sorted[index].order = sorted[index + 1].order;
      sorted[index + 1].order = temp;
    }
    onUpdateNavbar(sorted);
  };

  const handleNavbarEditSave = (id: string) => {
    const updated = navbarItems.map((n) => {
      if (n.id === id) {
        return { ...n, label: navEditLabel, enabled: navEditEnabled };
      }
      return n;
    });
    onUpdateNavbar(updated);
    setNavEditId(null);
  };

  const handleAddNavbarItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNavLabel.trim()) return;
    const maxOrder = navbarItems.reduce((max, item) => item.order > max ? item.order : max, 0);
    const newItem: NavbarItem = {
      id: `nav_cust_${Date.now()}`,
      label: newNavLabel,
      url: newNavUrl.startsWith("#") ? newNavUrl : `#${newNavUrl.toLowerCase().replace(/\s+/g, "_")}`,
      enabled: true,
      order: maxOrder + 1
    };
    onUpdateNavbar([...navbarItems, newItem]);
    setNewNavLabel("");
    setNewNavUrl("");
    setShowAddNav(false);
  };

  const handleNavbarDelete = (id: string) => {
    const updated = navbarItems.filter((n) => n.id !== id);
    onUpdateNavbar(updated);
  };

  const toggleSizeSelection = (size: string) => {
    if (prodSizes.includes(size)) {
      setProdSizes(prodSizes.filter((s) => s !== size));
    } else {
      setProdSizes([...prodSizes, size]);
    }
  };

  return (
    <div className="bg-[#121212] text-gray-200 min-h-screen select-none font-sans">
      
      {/* Dark admin banner header */}
      <div className="bg-luxury-green p-5 border-b border-luxury-gold/30 flex justify-between items-center px-6 lg:px-10">
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
            className="h-[68px] w-auto object-contain bg-black/20 p-1 rounded border border-luxury-gold/30"
          />
          <div>
            <h1 className="font-luxury-title text-xl text-white tracking-widest flex items-center gap-2">
              KISHSASHI URBANCHIC
              <span className="text-[10px] font-mono text-luxury-gold tracking-widest bg-luxury-gold/15 px-2 py-0.5 rounded border border-luxury-gold/30 font-semibold uppercase">
                ADMIN CONTROL PANEL
              </span>
            </h1>
            <p className="text-[10px] text-gray-300 font-mono tracking-wider mt-1 uppercase">
              Logged in as Administrator &bull; {auth?.currentUser?.email ?? "Firebase account"}
            </p>
          </div>
        </div>

        <button
          onClick={onLogoutAdmin}
          className="bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-200 hover:text-white font-mono text-xs tracking-widest py-2 px-4 flex items-center gap-2 uppercase transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          TERMINATE SESSION
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[600px]">
        
        {/* Left Drawer Navigation menu for Admin */}
        <div className="bg-neutral-900 p-4 border-r border-neutral-800/50 flex flex-col gap-1.5 lg:col-span-1">
          <div className="p-2 mb-4">
            <h4 className="text-[9px] font-mono tracking-widest text-[#C5A85C] uppercase font-bold">MANAGEMENT DIVISIONS</h4>
          </div>

          <button
            onClick={() => setActivePanel("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 text-xs font-mono font-bold tracking-widest uppercase transition-all ${
              activePanel === "dashboard" ? "bg-luxury-green text-[#C5A85C] border-l-4 border-luxury-gold shadow" : "text-gray-400 hover:text-white hover:bg-neutral-800/50"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Metrics Summary
          </button>

          <button
            onClick={() => setActivePanel("products")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 text-xs font-mono font-bold tracking-widest uppercase transition-all ${
              activePanel === "products" ? "bg-luxury-green text-[#C5A85C] border-l-4 border-luxury-gold shadow" : "text-gray-400 hover:text-white hover:bg-neutral-800/50"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Inventory Apparels
          </button>

          <button
            onClick={() => setActivePanel("categories")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 text-xs font-mono font-bold tracking-widest uppercase transition-all cursor-pointer ${
              activePanel === "categories" ? "bg-luxury-green text-[#C5A85C] border-l-4 border-luxury-gold shadow" : "text-gray-400 hover:text-white hover:bg-neutral-800/50"
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            Categories curator
          </button>

          <button
            onClick={() => setActivePanel("banners")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 text-xs font-mono font-bold tracking-widest uppercase transition-all cursor-pointer ${
              activePanel === "banners" ? "bg-luxury-green text-[#C5A85C] border-l-4 border-luxury-gold shadow" : "text-gray-400 hover:text-white hover:bg-neutral-800/50"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Hero Banners Slider ({banners.length})
          </button>

          <button
            onClick={() => setActivePanel("orders")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 text-xs font-mono font-bold tracking-widest uppercase transition-all ${
              activePanel === "orders" ? "bg-luxury-green text-[#C5A85C] border-l-4 border-luxury-gold shadow" : "text-gray-400 hover:text-white hover:bg-neutral-800/50"
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            COD order dispatchers
          </button>

          <button
            onClick={() => setActivePanel("navbar")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 text-xs font-mono font-bold tracking-widest uppercase transition-all ${
              activePanel === "navbar" ? "bg-luxury-green text-[#C5A85C] border-l-4 border-luxury-gold shadow" : "text-gray-400 hover:text-white hover:bg-neutral-800/50"
            }`}
          >
            <Sliders className="w-4 h-4" />
            Navbar Customizer
          </button>

          <button
            onClick={() => setActivePanel("reviews")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 text-xs font-mono font-bold tracking-widest uppercase transition-all ${
              activePanel === "reviews" ? "bg-luxury-green text-[#C5A85C] border-l-4 border-luxury-gold shadow" : "text-gray-400 hover:text-white hover:bg-neutral-800/50"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Reviews spam filter
          </button>
        </div>

        {/* Right content panels */}
        <div className="lg:col-span-4 p-6 sm:p-8 bg-neutral-950 overflow-y-auto max-h-[85vh]">
          
          {/* PANEL 1: METRICS DASHBOARD */}
          {activePanel === "dashboard" && (
            <div className="space-y-8 animate-fade-in text-xs uppercase font-mono">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
                <h2 className="font-luxury-title text-lg font-light tracking-wider text-white">METRICS SUMMARY</h2>
                <div className="text-gray-500 text-[10px] tracking-wide">
                  REAL-TIME BOUTIQUE MANAGEMENT & LOGISTICS
                </div>
              </div>

              {/* Grid: Stats numbers */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-neutral-900 border border-neutral-800 p-4.5 flex gap-3.5 items-center">
                  <div className="p-3 bg-luxury-gold/10 text-luxury-gold rounded">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Total Revenue</p>
                    <p className="text-sm font-bold mt-1 text-white text-luxury-gold">LKR {totalRevenue.toLocaleString()}</p>
                  </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-4.5 flex gap-3.5 items-center">
                  <div className="p-3 bg-luxury-green/10 text-emerald-500 rounded">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Today Sales</p>
                    <p className="text-sm font-bold mt-1 text-emerald-500">LKR {todaySales.toLocaleString()}</p>
                  </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-4.5 flex gap-3.5 items-center">
                  <div className="p-3 bg-[#0055ff]/10 text-sky-500 rounded">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Orders Received</p>
                    <p className="text-sm font-bold mt-1 text-white">{totalOrdersCount}</p>
                  </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-4.5 flex gap-3.5 items-center">
                  <div className="p-3 bg-purple-500/10 text-purple-400 rounded">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Patrons Enrolled</p>
                    <p className="text-sm font-bold mt-1 text-white">{totalUsers}</p>
                  </div>
                </div>
              </div>

              {/* Sub summaries cards row */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
                <div className="p-3.5 bg-neutral-900 border border-neutral-800 text-center">
                  <span className="text-xs font-bold text-amber-500 text-lg block">{pendingOrders.length}</span>
                  <span className="text-[8px] text-gray-500 uppercase tracking-widest mt-1 block">Pending Orders</span>
                </div>
                <div className="p-3.5 bg-neutral-900 border border-neutral-800 text-center">
                  <span className="text-xs font-bold text-emerald-500 text-lg block">{deliveredOrders.length}</span>
                  <span className="text-[8px] text-gray-500 uppercase tracking-widest mt-1 block">Delivered Orders</span>
                </div>
                <div className="p-3.5 bg-neutral-900 border border-neutral-800 text-center">
                  <span className="text-xs font-bold text-red-500 text-lg block">{cancelledOrders.length}</span>
                  <span className="text-[8px] text-gray-500 uppercase tracking-widest mt-1 block">Cancelled Orders</span>
                </div>
                <div className="p-3.5 bg-neutral-900 border border-neutral-800 text-center">
                  <span className="text-xs font-bold text-[#C5A85C] text-lg block">{totalProducts}</span>
                  <span className="text-[8px] text-gray-500 uppercase tracking-widest mt-1 block">Apparels Listed</span>
                </div>
                <div className="p-3.5 bg-neutral-900 border border-neutral-800 text-center col-span-2 md:col-span-1">
                  <span className="text-xs font-bold text-red-400 text-lg block">{lowStockProducts.length}</span>
                  <span className="text-[8px] text-gray-500 uppercase tracking-widest mt-1 block">Low Stock Alerts</span>
                </div>
              </div>

              {/* Dashboard Analytics Graphics: SVG Flowing Curves and Columns (Beautiful pure SVG custom graphs) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Visual Graphic 1: Revenue Monthly Curve (SVG) */}
                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded shadow-sm">
                  <h4 className="text-[10px] font-bold tracking-widest text-[#C5A85C] uppercase mb-4">
                    Monthly Revenue Trend (LKR) &bull; May 2026
                  </h4>
                  
                  {/* Flow curve SVG */}
                  <div className="w-full h-44 relative bg-neutral-950/40 border border-neutral-800/30 flex items-center justify-center p-2 rounded">
                    <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#C5A85C" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#C5A85C" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 0 40 Q 25 30 50 15 T 100 8 L 100 40 Z"
                        fill="url(#goldGrad)"
                      />
                      <path
                        d="M 0 40 Q 25 30 50 15 T 100 8"
                        fill="none"
                        stroke="#C5A85C"
                        strokeWidth="1.2"
                      />
                      {/* Grid Horizontal markers */}
                      <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                      <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                      <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                    </svg>

                    <div className="absolute top-2 right-2 text-[8px] font-mono text-gray-500 uppercase tracking-widest">
                      Max: LKR {totalRevenue.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[9px] text-gray-500 uppercase mt-2 px-1">
                    <span>Week 1</span>
                    <span>Week 2</span>
                    <span>Week 3 (Current)</span>
                    <span>Week 4 (Predict)</span>
                  </div>
                </div>

                {/* Visual Graphic 2: Daily Sales bar charts (SVG) */}
                <div className="bg-neutral-900 border border-[#222222] p-5 rounded shadow-sm">
                  <h4 className="text-[10px] font-bold tracking-widest text-[#C5A85C] uppercase mb-4">
                    Daily Sales Volume Analytics
                  </h4>

                  {/* Verticals SVG columns block */}
                  <div className="w-full h-44 relative bg-neutral-950/40 border border-[#222222] flex items-end justify-between p-4 rounded">
                    {/* Columns representation */}
                    {[
                      { l: "Mon", v: 14750 },
                      { l: "Tue", v: 24500 },
                      { l: "Wed", v: 11500 },
                      { l: "Thu", v: 32000 },
                      { l: "Fri", v: 8500 },
                      { l: "Sat", v: totalRevenue * 0.3 },
                      { l: "Sun", v: totalRevenue * 0.15 }
                    ].map((col, idx) => {
                      const maxVal = 40000;
                      const percent = Math.min((col.v / maxVal) * 100, 100);
                      return (
                        <div key={idx} className="flex flex-col items-center flex-grow">
                          <div className="text-[7px] text-gray-500 mb-1.5 font-mono">LKR {Math.round(col.v / 1000)}k</div>
                          <div className="w-4 bg-neutral-800 h-24 rounded-t-sm relative overflow-hidden flex items-end">
                            <div 
                              className="w-full bg-luxury-gold hover:bg-[#E2CC91] transition-all" 
                              style={{ height: `${percent}%` }}
                            />
                          </div>
                          <span className="text-[8px] text-gray-400 mt-2 tracking-widest uppercase">{col.l}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Recent Orders & LOW STOCK row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Recent Orders columns */}
                <div className="lg:col-span-2 bg-neutral-900 border border-[#222222] p-5">
                  <h4 className="text-[10px] font-bold tracking-widest text-[#C5A85C] uppercase mb-4 pb-2 border-b border-neutral-800">
                    RECENT ORDER LISTS
                  </h4>
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((or) => (
                      <div key={or.id} className="flex justify-between items-center text-[10px] uppercase font-mono py-2 border-b border-neutral-800/45">
                        <div>
                          <p className="font-bold text-white">{or.customerName}</p>
                          <p className="text-gray-500 mt-0.5">{or.id} &bull; {new Date(or.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-luxury-gold font-bold">LKR {or.totalAmount.toLocaleString()}</p>
                          <span className="text-[8px] text-gray-400 font-semibold">{or.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Left: LOW STOCK ALERTS */}
                <div className="bg-neutral-900 border border-[#222222] p-5">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-neutral-800">
                    <h4 className="text-[10px] font-bold tracking-widest text-red-400 uppercase">
                      CRITICAL LOW STOCKS
                    </h4>
                    <span className="text-[8px] bg-red-950/40 text-red-400 border border-red-800/40 px-1.5 py-0.5 font-bold">
                      REFRESH REQUIRED
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {lowStockProducts.length === 0 ? (
                      <p className="text-gray-500 text-[10px] uppercase">All listings stocks verified healthy!</p>
                    ) : (
                      lowStockProducts.map((lsp) => (
                        <div key={lsp.id} className="flex gap-3.5 items-center text-[10px] uppercase font-mono bg-neutral-950 p-2.5 border border-neutral-800">
                          <img
                            referrerPolicy="no-referrer"
                            src={lsp.thumbnail}
                            alt={lsp.name}
                            className="w-8 aspect-[3/4] object-cover border border-neutral-800"
                          />
                          <div className="flex-grow">
                            <p className="text-white font-semibold truncate w-36">{lsp.name}</p>
                            <p className="text-red-400 font-bold mt-1">STOCK COUNDS: {lsp.stock} remaining</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Store Logistics & Delivery Settings */}
              <div className="bg-neutral-900 border border-neutral-800 p-5 rounded shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-neutral-800">
                  <h4 className="text-[10px] font-bold tracking-widest text-[#C5A85C] uppercase">
                    ⚜ COURIER & LOGISTICS SETTINGS
                  </h4>
                  <span className="text-[8px] bg-neutral-950 text-gray-400 border border-neutral-800 px-1.5 py-0.5 font-bold">
                    SYSTEM PARAMETERS [LKR]
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div>
                    <p className="text-gray-400 text-[10px] leading-relaxed uppercase font-light tracking-wide normal-case">
                      Configure the flat delivery & cash-on-delivery (COD) shipping tariff applied globally during storefront checkout. This is displayed dynamically in customers' checkout invoice summary as part of the total order sum.
                    </p>
                  </div>

                  <div className="space-y-3.5 bg-neutral-950 p-4 border border-neutral-800">
                    <div>
                      <label className="text-[9px] text-[#C5A85C] block mb-1">STANDARD DELIVERY TARIFF (LKR)</label>
                      <input
                        type="number"
                        min="0"
                        value={tempDeliveryCost}
                        onChange={(e) => setTempDeliveryCost(Number(e.target.value))}
                        className="w-full bg-[#121212] text-xs font-mono border border-neutral-800 px-3 py-2 text-white outline-none focus:border-luxury-gold"
                        placeholder="e.g. 350"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onUpdateDeliveryCost(tempDeliveryCost);
                        setShowLogisticsSuccess(true);
                        setTimeout(() => setShowLogisticsSuccess(false), 2500);
                      }}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-neutral-950 hover:text-white transition-all py-2 text-[10px] font-mono font-bold tracking-widest uppercase border border-amber-500/20"
                    >
                      UPDATE COMPONENT TARIFF RATES
                    </button>

                    {showLogisticsSuccess && (
                      <p className="text-emerald-500 text-[9px] font-mono text-center uppercase tracking-wider animate-pulse">
                        ✦ Logistics rates updated successfully in real-time persistent memory!
                      </p>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* PANEL 2: PRODUCTS MANAGER */}
          {activePanel === "products" && (
            <div className="space-y-6 animate-fade-in text-xs font-mono uppercase">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
                <h2 className="font-luxury-title text-lg font-light tracking-wider text-white">INVENTORY CONTROL BOARD</h2>
                <button
                  onClick={handleOpenProductCreate}
                  className="bg-luxury-green hover:bg-luxury-lightgreen text-[#C5A85C] border border-luxury-gold/30 px-4 py-2 text-[10px] tracking-widest flex items-center gap-1.5 transition-all font-bold"
                >
                  <Plus className="w-4 h-4" />
                  ADD APPAREL SKU
                </button>
              </div>

              {/* Master table of products */}
              <div className="bg-neutral-900 border border-neutral-800 rounded overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[650px]">
                  <thead>
                    <tr className="bg-neutral-950 border-b border-neutral-800 text-[10px] text-gray-500 tracking-wider">
                      <th className="p-3.5 pl-5">Apparel info</th>
                      <th className="p-3.5">SKU No</th>
                      <th className="p-3.5">Category context</th>
                      <th className="p-3.5">Discounts Price</th>
                      <th className="p-3.5">Stocks</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right pr-5">Control Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-b border-neutral-800/50 hover:bg-neutral-950/50 transition-colors text-[10px]">
                        <td className="p-3.5 pl-5 flex items-center gap-3.5">
                          <img
                            referrerPolicy="no-referrer"
                            src={p.thumbnail}
                            alt={p.name}
                            className="w-9 h-12 object-cover border border-neutral-800"
                          />
                          <div>
                            <p className="text-white font-semibold truncate w-48">{p.name}</p>
                            <p className="text-[8px] text-[#C5A85C] mt-0.5">{p.brand} &bull; {p.featured ? "Featured" : "Standard"}</p>
                          </div>
                        </td>
                        <td className="p-3.5 font-medium text-gray-400">{p.sku}</td>
                        <td className="p-3.5 text-gray-400">{p.category} &bull; <span className="text-gray-500 text-[9px]">{p.subcategory}</span></td>
                        <td className="p-3.5 font-bold text-white">
                          LKR {p.discountPrice.toLocaleString()} 
                          {p.discountPercent > 0 && <span className="text-[8px] bg-red-950 border border-red-800/40 text-red-400 ml-1.5 px-1 font-normal">-{p.discountPercent}%</span>}
                        </td>
                        <td className="p-3.5">
                          <span className={`font-bold ${p.stock <= 3 ? "text-red-400" : "text-gray-200"}`}>{p.stock} units</span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 text-[8px] font-bold ${p.status === "Active" ? "bg-emerald-950/50 border border-emerald-800/40 text-emerald-400" : "bg-neutral-950 border border-neutral-700 text-gray-500"}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right pr-5 space-x-1">
                          <button
                            onClick={() => handleOpenProductEdit(p)}
                            className="p-1 px-2.5 bg-neutral-800 text-gray-300 hover:text-white border border-neutral-700 hover:border-neutral-500 transition-colors"
                            title="Edit"
                          >
                            EDIT
                          </button>
                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-1 px-2.5 bg-red-950/30 text-red-400 hover:text-red-300 border border-red-900/30 hover:border-red-700/60 transition-colors"
                            title="Delete"
                          >
                            DELETE
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Product Modal Form Overlay */}
              {showProductModal && (
                <div
                  onClick={(e) => { if (e.target === e.currentTarget) setShowProductModal(false); }}
                  className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in text-xs font-mono uppercase"
                >
                  <form onSubmit={handleProductSubmit} className="relative w-full max-w-3xl bg-neutral-900 p-6 shadow-2xl space-y-5 rounded border border-neutral-800 select-none max-h-[92vh] overflow-y-auto">
                    
                    {/* Top Right Close Button */}
                    <button
                      type="button"
                      onClick={() => setShowProductModal(false)}
                      aria-label="Close Product Form"
                      className="absolute top-4 right-4 z-20 text-gray-400 hover:text-white hover:bg-neutral-800 p-1.5 rounded transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <h3 className="font-luxury-title text-base tracking-widest text-white border-b border-neutral-800 pb-3 flex justify-between items-center font-semibold pr-10">
                      <span>{editingProduct ? "EDIT APPAREL ATTRIBUTES" : "CREATE NEW FASHION APPAREL"}</span>
                      <span className="text-[10px] text-luxury-gold font-normal hidden sm:inline">KISHSASHI CATALOG MANAGER</span>
                    </h3>

                    {/* Form rows grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300">
                      <div>
                        <label className="text-[9px] text-luxury-gold block mb-1">Product Title</label>
                        <input
                          type="text"
                          required
                          value={prodName}
                          onChange={(e) => setProdName(e.target.value)}
                          placeholder="e.g. Kishsashi Banarasi Silk Saree"
                          className="w-full bg-neutral-950 border border-neutral-800 px-3.5 py-2 outline-none focus:border-luxury-gold text-white uppercase text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] text-luxury-gold block mb-1">SKU identifier</label>
                        <input
                          type="text"
                          required
                          value={prodSku}
                          onChange={(e) => setProdSku(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 px-3.5 py-2 outline-none focus:border-luxury-gold text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] text-luxury-gold block mb-1">Category Division</label>
                        <select
                          value={prodCategory}
                          onChange={(e) => {
                            setProdCategory(e.target.value);
                            const found = categories.find((c) => c.name === e.target.value);
                            setProdSub(found?.subcategories[0] || "");
                          }}
                          className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 outline-none focus:border-luxury-gold text-white text-xs uppercase"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] text-luxury-gold block mb-1">Subcategory Branch</label>
                        <select
                          value={prodSub}
                          onChange={(e) => setProdSub(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 outline-none focus:border-luxury-gold text-white text-xs uppercase"
                        >
                          {(categories.find((c) => c.name === prodCategory)?.subcategories || []).map((sb) => (
                            <option key={sb} value={sb}>{sb}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] text-luxury-gold block mb-1">Original Price (LKR)</label>
                        <input
                          type="number"
                          required
                          value={prodPrice}
                          onChange={(e) => setProdPrice(Number(e.target.value))}
                          className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 outline-none focus:border-luxury-gold text-white font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] text-luxury-gold block mb-1">Discounted Sale Price (LKR)</label>
                        <input
                          type="number"
                          required
                          value={prodDiscountPrice}
                          onChange={(e) => setProdDiscountPrice(Number(e.target.value))}
                          className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 outline-none focus:border-luxury-gold text-white font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] text-luxury-gold block mb-1">Available Stocks</label>
                        <input
                          type="number"
                          required
                          value={prodStock}
                          onChange={(e) => setProdStock(Number(e.target.value))}
                          className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 outline-none focus:border-luxury-gold text-white font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] text-luxury-gold block mb-1">Brand Name Label</label>
                        <input
                          type="text"
                          required
                          value={prodBrand}
                          onChange={(e) => setProdBrand(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 outline-none focus:border-luxury-gold text-white text-xs uppercase"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] text-luxury-gold block mb-1">Core Material blend</label>
                        <input
                          type="text"
                          value={prodMaterial}
                          onChange={(e) => setProdMaterial(e.target.value)}
                          placeholder="e.g. Mulberry Silk, Egyptian Cotton"
                          className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 outline-none focus:border-luxury-gold text-white text-xs uppercase"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] text-luxury-gold block mb-1">Weight (g)</label>
                        <input
                          type="text"
                          value={prodWeight}
                          onChange={(e) => setProdWeight(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 outline-none focus:border-luxury-gold text-white text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[9px] text-luxury-gold block mb-1">Product Narrative story (Description)</label>
                        <textarea
                          rows={3}
                          value={prodDesc}
                          onChange={(e) => setProdDesc(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 outline-none focus:border-luxury-gold text-white text-xs uppercase"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[9px] text-luxury-gold block mb-2">Available Sizing charts (Click to toggle)</label>
                        <div className="flex gap-2.5">
                          {["XS", "S", "M", "L", "XL", "XXL"].map((sz) => {
                            const selected = prodSizes.includes(sz);
                            return (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => toggleSizeSelection(sz)}
                                className={`w-12 h-10 border text-xs font-bold transition-all ${
                                  selected 
                                    ? "bg-luxury-green text-luxury-gold border-luxury-gold" 
                                    : "bg-neutral-950 text-gray-500 border-neutral-800 hover:border-neutral-700"
                                }`}
                              >
                                {sz}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ImageLinkInput
                          label="Thumbnail Image URL"
                          value={prodThumbnail}
                          onChange={(url) => setProdThumbnail(url)}
                        />
                        <ImageLinkInput
                          label="Primary Display Image URL"
                          value={prodImages[0] || ""}
                          onChange={(url) => {
                            const copy = [...prodImages];
                            copy[0] = url;
                            setProdImages(copy);
                          }}
                        />
                      </div>

                      <div>
                        <label className="text-[9px] text-luxury-gold block mb-1.5">Availability Status</label>
                        <div className="flex gap-3">
                          {["Active", "Inactive"].map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setProdStatus(st as Product["status"])}
                              className={`flex-grow py-2 border font-bold text-[10px] tracking-widest ${
                                prodStatus === st
                                  ? "bg-luxury-green text-luxury-gold border-luxury-gold"
                                  : "bg-neutral-950 text-gray-500 border-neutral-800"
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 pt-5 pl-1.5">
                        <input
                          type="checkbox"
                          id="featuredCheck"
                          checked={prodFeatured}
                          onChange={(e) => setProdFeatured(e.target.checked)}
                          className="w-4 h-4 accent-luxury-gold cursor-pointer"
                        />
                        <label htmlFor="featuredCheck" className="text-[10px] font-bold tracking-wider text-white uppercase cursor-pointer select-none">
                          FEATURED LUXURY SPOTLIGHTS
                        </label>
                      </div>

                    </div>

                    <div className="flex justify-end gap-3.5 border-t border-neutral-800 pt-4 mt-6">
                      <button
                        type="button"
                        onClick={() => setShowProductModal(false)}
                        className="px-5 py-2.5 border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 font-bold transition-all text-gray-300 cursor-pointer"
                      >
                        CLOSE FORM
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-luxury-green text-[#C5A85C] border border-luxury-gold/30 hover:bg-luxury-lightgreen font-bold transition-all"
                      >
                        SAVE PRODUCT APPAREL
                      </button>
                    </div>

                  </form>
                </div>
              )}
            </div>
          )}

          {/* PANEL 3: CATEGORIES LISTING */}
          {activePanel === "categories" && (
            <div className="space-y-6 animate-fade-in text-xs font-mono uppercase">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
                <h2 className="font-luxury-title text-lg font-light tracking-wider text-white">CATEGORY STRUCTURE</h2>
                <button
                  onClick={handleOpenCatCreate}
                  className="bg-luxury-green hover:bg-luxury-lightgreen text-luxury-gold border border-luxury-gold/30 px-4 py-2 text-[10px] tracking-widest flex items-center gap-1.5 font-bold"
                >
                  <Plus className="w-4 h-4" />
                  ADD LUXURY CATEGORY
                </button>
              </div>

              {/* Grid: Category List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((c) => (
                  <div key={c.id} className="bg-neutral-900 border border-neutral-800 p-4 relative flex flex-col justify-between shadow-sm">
                    <span className="absolute top-4 right-4 text-[8px] font-semibold border px-1.5 bg-neutral-950 border-neutral-800/80 text-gray-500">
                      Label: {c.status}
                    </span>
                    
                    <div className="flex gap-4 items-center mb-4">
                      <img
                        referrerPolicy="no-referrer"
                        src={c.image}
                        alt={c.name}
                        className="w-12 h-16 object-cover border border-neutral-800"
                      />
                      <div>
                        <h4 className="font-bold text-white tracking-wide text-sm">{c.name}</h4>
                        <p className="text-[10px] text-gray-500 font-medium mt-1">({c.subcategories.length} branch subcategories)</p>
                      </div>
                    </div>

                    <div className="bg-neutral-950 p-2.5 border border-neutral-800/80 mb-4 flex-grow">
                      <p className="text-[8px] tracking-wider text-[#C5A85C] font-bold mb-1.5 uppercase">SUB-BRANCHES:</p>
                      <p className="text-[10px] text-gray-400 capitalize whitespace-normal leading-relaxed line-clamp-3">
                        {c.subcategories.join(" || ")}
                      </p>
                    </div>

                    <div className="flex gap-2 border-t border-neutral-800/50 pt-3 mt-auto">
                      <button
                        onClick={() => handleOpenCatEdit(c)}
                        className="flex-grow py-1.5 bg-neutral-800 text-gray-300 hover:text-white border border-neutral-700 transition-colors text-center text-[9px] font-bold tracking-widest uppercase"
                      >
                        EDIT ATTRS
                      </button>
                      <button
                        onClick={() => onDeleteCategory(c.id)}
                        className="p-1.5 bg-red-950/20 text-red-400 hover:text-red-300 border border-red-900/20 transition-colors text-center text-[9px] font-bold tracking-widest uppercase"
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Category modal */}
              {showCatModal && (
                <div
                  onClick={(e) => { if (e.target === e.currentTarget) setShowCatModal(false); }}
                  className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in text-xs font-mono uppercase"
                >
                  <form onSubmit={handleCategorySubmit} className="relative w-full max-w-lg bg-neutral-900 p-6 shadow-2xl space-y-4 rounded border border-neutral-800 select-none">
                    
                    {/* Top Right Close Button */}
                    <button
                      type="button"
                      onClick={() => setShowCatModal(false)}
                      aria-label="Close Category Form"
                      className="absolute top-4 right-4 z-20 text-gray-400 hover:text-white hover:bg-neutral-800 p-1.5 rounded transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <h3 className="font-luxury-title text-base tracking-widest text-[#C5A85C] border-b border-neutral-800 pb-3 font-semibold pr-10">
                      {editingCategory ? "EDIT CATEGORY STRUCT" : "ADD NEW STRATEGIC CATEGORY"}
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[9px] text-[#C5A85C] block mb-1">Category Label</label>
                        <input
                          type="text"
                          required
                          value={catName}
                          onChange={(e) => setCatName(e.target.value)}
                          placeholder="e.g. Sarees"
                          className="w-full bg-neutral-950 border border-neutral-800 px-3.5 py-2 outline-none focus:border-luxury-gold text-white text-xs uppercase"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] text-[#C5A85C] block mb-1">Subcategory Branch List (Comma separated values)</label>
                        <input
                          type="text"
                          required
                          value={catSubs}
                          onChange={(e) => setCatSubs(e.target.value)}
                          placeholder="e.g. Silk, Designer, Weddings"
                          className="w-full bg-neutral-950 border border-neutral-800 px-3.5 py-2 outline-none focus:border-luxury-gold text-white text-xs uppercase"
                        />
                        <span className="text-[8px] text-gray-500 mt-1 block font-mono">Separate each with comma sign (,)</span>
                      </div>

                      <div>
                        <ImageLinkInput
                          label="Category Image URL"
                          value={catImage}
                          onChange={(url) => setCatImage(url)}
                        />
                      </div>

                      <div>
                        <label className="text-[9px] text-[#C5A85C] block mb-1">Publishing Status</label>
                        <div className="flex gap-3">
                          {["Active", "Inactive"].map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setCatStatus(st as Category["status"])}
                              className={`flex-grow py-2 border font-bold text-[10px] tracking-widest uppercase ${
                                catStatus === st
                                  ? "bg-luxury-green text-luxury-gold border-luxury-gold"
                                  : "bg-neutral-950 text-gray-500 border-neutral-800"
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3.5 border-t border-neutral-800 pt-4 mt-6">
                      <button
                        type="button"
                        onClick={() => setShowCatModal(false)}
                        className="px-4 py-2 border border-neutral-700 bg-neutral-800 font-bold text-gray-300 cursor-pointer hover:bg-neutral-700"
                      >
                        CLOSE
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-luxury-green text-[#C5A85C] border border-luxury-gold/30 hover:bg-luxury-lightgreen font-bold cursor-pointer"
                      >
                        SAVE CATEGORY
                      </button>
                    </div>

                  </form>
                </div>
              )}
            </div>
          )}

          {/* PANEL: HERO BANNERS MANAGEMENT */}
          {activePanel === "banners" && (
            <div className="space-y-6 animate-fade-in text-xs font-mono uppercase">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
                <div>
                  <h2 className="font-luxury-title text-lg font-light tracking-wider text-white">HERO BANNER SLIDER CURATOR</h2>
                  <p className="text-[10px] text-gray-400 font-mono tracking-wide mt-1 normal-case">
                    Add, edit, reorder, or delete high-resolution promotional hero banners for the storefront slider.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingBanner(null);
                    setBannerTitle("");
                    setBannerSubtitle("");
                    setBannerImage("https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1400");
                    setBannerDiscountText("Flat 20% OFF on Wedding Essentials");
                    setBannerLink(categories[0]?.name || "Sarees");
                    setShowBannerModal(true);
                  }}
                  className="bg-luxury-green hover:bg-luxury-lightgreen text-[#C5A85C] border border-luxury-gold/30 px-4 py-2.5 text-[10px] tracking-widest flex items-center gap-1.5 font-bold cursor-pointer transition-all shadow"
                >
                  <Plus className="w-4 h-4" />
                  ADD HERO BANNER
                </button>
              </div>

              {banners.length === 0 ? (
                <div className="bg-neutral-900 border border-neutral-800 p-12 text-center text-gray-400 font-mono text-xs uppercase tracking-widest">
                  No promotional hero banners listed. Click &quot;ADD HERO BANNER&quot; above to create one.
                </div>
              ) : (
                <div className="space-y-5">
                  {banners.map((b, idx) => (
                    <div key={b.id} className="bg-neutral-900 border border-neutral-800 p-4.5 rounded shadow-sm hover:border-neutral-700 transition-all">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                        
                        {/* Slide order badge & preview image */}
                        <div className="lg:col-span-4 relative group overflow-hidden border border-neutral-800 aspect-[16/9] bg-neutral-950 rounded">
                          <img
                            src={b.image}
                            alt={b.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover object-center"
                            onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800"; }}
                          />
                          <span className="absolute top-2 left-2 bg-luxury-green/90 text-[#E2CC91] border border-luxury-gold/30 text-[9px] font-bold px-2 py-0.5 font-mono shadow">
                            SLIDE #{idx + 1}
                          </span>
                        </div>

                        {/* Banner Details */}
                        <div className="lg:col-span-5 space-y-2">
                          <div className="flex items-center gap-2">
                            {b.discountText && (
                              <span className="bg-luxury-gold/15 text-luxury-gold border border-luxury-gold/30 text-[8px] font-bold px-2 py-0.5">
                                {b.discountText}
                              </span>
                            )}
                            <span className="text-gray-500 text-[8px]">&bull; Target Link: <strong className="text-[#E2CC91]">{b.link}</strong></span>
                          </div>
                          
                          <h3 className="font-luxury-title text-base sm:text-lg text-white font-light tracking-wide uppercase line-clamp-1">
                            {b.title}
                          </h3>
                          
                          <p className="text-gray-400 text-[10px] font-light line-clamp-2 leading-relaxed normal-case">
                            {b.subtitle}
                          </p>

                          <p className="text-[8px] text-gray-500 font-mono truncate pt-1">
                            Image URL: {b.image}
                          </p>
                        </div>

                        {/* Actions (Move Up / Down, Edit, Delete) */}
                        <div className="lg:col-span-3 flex lg:flex-col justify-end gap-2 text-right">
                          <div className="flex gap-1.5 w-full">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => {
                                const copy = [...banners];
                                const temp = copy[idx];
                                copy[idx] = copy[idx - 1];
                                copy[idx - 1] = temp;
                                if (onReorderBanners) onReorderBanners(copy);
                              }}
                              className="flex-1 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-20 text-gray-300 hover:text-white border border-neutral-700 text-[9px] font-bold transition-all cursor-pointer"
                              title="Move Slide Up"
                            >
                              ▲ UP
                            </button>
                            <button
                              type="button"
                              disabled={idx === banners.length - 1}
                              onClick={() => {
                                const copy = [...banners];
                                const temp = copy[idx];
                                copy[idx] = copy[idx + 1];
                                copy[idx + 1] = temp;
                                if (onReorderBanners) onReorderBanners(copy);
                              }}
                              className="flex-1 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-20 text-gray-300 hover:text-white border border-neutral-700 text-[9px] font-bold transition-all cursor-pointer"
                              title="Move Slide Down"
                            >
                              ▼ DOWN
                            </button>
                          </div>

                          <div className="flex gap-1.5 w-full">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingBanner(b);
                                setBannerTitle(b.title);
                                setBannerSubtitle(b.subtitle);
                                setBannerImage(b.image);
                                setBannerDiscountText(b.discountText);
                                setBannerLink(b.link);
                                setShowBannerModal(true);
                              }}
                              className="flex-1 py-1.5 bg-luxury-green/50 hover:bg-luxury-lightgreen text-[#E2CC91] border border-luxury-gold/30 text-[9px] font-bold transition-all cursor-pointer"
                            >
                              EDIT SLIDE
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteBanner(b.id)}
                              className="flex-1 py-1.5 bg-red-950/30 hover:bg-red-900/60 text-red-400 hover:text-white border border-red-900/30 text-[9px] font-bold transition-all cursor-pointer"
                            >
                              REMOVE
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Banner Add / Edit Modal */}
              {showBannerModal && (
                <div
                  onClick={(e) => { if (e.target === e.currentTarget) setShowBannerModal(false); }}
                  className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in text-xs font-mono uppercase"
                >
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!bannerTitle.trim() || !bannerImage.trim()) return;
                      const finalized: Banner = {
                        id: editingBanner?.id || `banner_${Date.now()}`,
                        title: bannerTitle.trim(),
                        subtitle: bannerSubtitle.trim(),
                        image: bannerImage.trim(),
                        discountText: bannerDiscountText.trim(),
                        link: bannerLink.trim() || "Sarees"
                      };
                      if (editingBanner) {
                        onEditBanner(finalized);
                      } else {
                        onAddBanner(finalized);
                      }
                      setShowBannerModal(false);
                    }}
                    className="relative w-full max-w-xl bg-neutral-900 p-6 shadow-2xl space-y-4 rounded border border-neutral-800 select-none max-h-[92vh] overflow-y-auto"
                  >
                    
                    {/* Top Right Close Button */}
                    <button
                      type="button"
                      onClick={() => setShowBannerModal(false)}
                      aria-label="Close Banner Modal"
                      className="absolute top-4 right-4 z-20 text-gray-400 hover:text-white hover:bg-neutral-800 p-1.5 rounded transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <h3 className="font-luxury-title text-base tracking-widest text-[#C5A85C] border-b border-neutral-800 pb-3 font-semibold pr-10">
                      {editingBanner ? "EDIT HERO BANNER SLIDE" : "ADD NEW HERO BANNER SLIDE"}
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[9px] text-[#C5A85C] block mb-1">Banner Main Heading (Serif)</label>
                        <input
                          type="text"
                          required
                          value={bannerTitle}
                          onChange={(e) => setBannerTitle(e.target.value)}
                          placeholder="e.g. WEDDING SUITE or METROPOLITAN MODERN"
                          className="w-full bg-neutral-950 border border-neutral-800 px-3.5 py-2 outline-none focus:border-luxury-gold text-white text-xs uppercase"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] text-[#C5A85C] block mb-1">Banner Subtitle / Description</label>
                        <textarea
                          rows={2}
                          value={bannerSubtitle}
                          onChange={(e) => setBannerSubtitle(e.target.value)}
                          placeholder="e.g. Luxurious Handwoven Silk & Bridal Sarees"
                          className="w-full bg-neutral-950 border border-neutral-800 px-3.5 py-2 outline-none focus:border-luxury-gold text-white text-xs uppercase"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] text-[#C5A85C] block mb-1">Promotional Discount Tag (Badge)</label>
                        <input
                          type="text"
                          value={bannerDiscountText}
                          onChange={(e) => setBannerDiscountText(e.target.value)}
                          placeholder="e.g. Flat 20% OFF on Wedding Essentials"
                          className="w-full bg-neutral-950 border border-neutral-800 px-3.5 py-2 outline-none focus:border-luxury-gold text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] text-[#C5A85C] block mb-1">Target Category / Store Link</label>
                        <select
                          value={bannerLink}
                          onChange={(e) => setBannerLink(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 px-3.5 py-2 outline-none focus:border-luxury-gold text-white text-xs uppercase"
                        >
                          <option value="All">All Apparels</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <ImageLinkInput
                          label="Banner Background High-Res Image URL"
                          value={bannerImage}
                          onChange={(url) => setBannerImage(url)}
                          placeholder="e.g. https://images.unsplash.com/photo-..."
                        />
                      </div>

                      {/* Live preview of the banner */}
                      {bannerImage && (
                        <div className="bg-neutral-950 p-3 border border-neutral-800 rounded">
                          <span className="text-[8px] text-gray-500 font-mono block mb-2 font-bold uppercase">Live Slide Preview:</span>
                          <div className="relative aspect-[16/7] overflow-hidden rounded border border-neutral-800 bg-black flex flex-col justify-end p-4">
                            <img
                              src={bannerImage}
                              alt="Live preview"
                              referrerPolicy="no-referrer"
                              className="absolute inset-0 w-full h-full object-cover object-center opacity-65"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <div className="relative z-10 space-y-1">
                              {bannerDiscountText && (
                                <span className="bg-luxury-gold text-luxury-green px-2 py-0.5 text-[8px] font-bold">
                                  {bannerDiscountText}
                                </span>
                              )}
                              <h4 className="font-luxury-title text-sm sm:text-base text-white uppercase drop-shadow font-bold">
                                {bannerTitle || "BANNER TITLE"}
                              </h4>
                              <p className="text-[8px] text-gray-300 uppercase line-clamp-1">
                                {bannerSubtitle || "Banner subtitle goes here"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-3.5 border-t border-neutral-800 pt-4 mt-6">
                      <button
                        type="button"
                        onClick={() => setShowBannerModal(false)}
                        className="px-4 py-2 border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 font-bold text-gray-300 cursor-pointer"
                      >
                        CANCEL
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-luxury-green text-[#C5A85C] border border-luxury-gold/30 hover:bg-luxury-lightgreen font-bold cursor-pointer"
                      >
                        SAVE HERO BANNER
                      </button>
                    </div>

                  </form>
                </div>
              )}

            </div>
          )}

          {/* PANEL 4: ORDERS DISPATCH SYSTEM */}
          {activePanel === "orders" && (
            <div className="space-y-6 animate-fade-in text-xs font-mono uppercase">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
                <h2 className="font-luxury-title text-lg font-light tracking-wider text-white">COD ORDERS DISPATCH CONTROL</h2>
                <div className="text-[10px] text-red-400 font-bold border border-red-800/40 p-1.5 bg-red-950/20">
                  MANUAL CASH ON DELIVERY VERIFICATION ONLY
                </div>
              </div>

              {orders.length === 0 ? (
                <p className="text-gray-500">No orders received yet.</p>
              ) : (
                <div className="space-y-5">
                  {orders.map((or) => (
                    <div key={or.id} className="bg-neutral-900 border border-neutral-800 p-5 flex flex-col justify-between shadow-sm">
                      
                      {/* Top status */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-800 pb-3 mb-4 gap-3">
                        <div>
                          <p className="font-bold text-white text-sm">{or.id} &bull; {or.customerName}</p>
                          <p className="text-[9px] text-gray-500 font-mono tracking-wide mt-1">Order Date: {new Date(or.date).toLocaleString()} &bull; Phone: {or.mobile}</p>
                        </div>

                        {/* Status switcher controller dropdown */}
                        <div className="flex items-center gap-2.5">
                          <label className="text-[9px] text-luxury-gold font-bold">DISPATCH LEVEL:</label>
                          <select
                            value={or.status}
                            onChange={(e) => onUpdateOrderStatus(or.id, e.target.value as Order["status"])}
                            className="bg-neutral-950 border border-neutral-800 px-2 py-1.5 text-[10px] text-white outline-none focus:border-luxury-gold font-bold font-mono"
                          >
                            {["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"].map((st) => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Order items lists details layout */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Column 1: Items */}
                        <div className="space-y-3.5 border-r border-neutral-800/50 pr-4">
                          <p className="text-[8px] text-luxury-gold font-bold tracking-widest">APPARELS ORDERED:</p>
                          {or.items.map((it, idx) => (
                            <div key={idx} className="flex gap-3 items-center text-[10px]">
                              <img
                                referrerPolicy="no-referrer"
                                src={it.thumbnail}
                                alt={it.productName}
                                className="w-8 aspect-[3/4] object-cover border border-neutral-800"
                              />
                              <div>
                                <p className="text-white font-medium truncate w-56">{it.productName}</p>
                                <p className="text-gray-500 mt-0.5">SIZE: {it.size} | COLOR: {it.color} | QTY: {it.quantity}</p>
                                <p className="text-[#C5A85C] font-semibold mt-0.5">LKR {it.price.toLocaleString()} per unit</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Column 2: Shipping details */}
                        <div className="space-y-2 text-[10px] text-gray-400">
                          <p className="text-[8px] text-luxury-gold font-bold tracking-widest">SHIPPING AND INVOICE RECORD:</p>
                          <p className="text-white font-semibold">Recipient: {or.address.firstName} {or.address.lastName}</p>
                          <p className="font-light truncate uppercase">Address: {or.address.houseNumber}, {or.address.apartmentName && `${or.address.apartmentName},` } {or.address.streetName}, {or.address.area && `${or.address.area},` } {or.address.city}, {or.address.district}, {or.address.state}, {or.address.postalCode}</p>
                          <p className="font-mono text-[9px] mt-1.5">Contact Line: {or.address.mobile} {or.address.altMobile && ` | ${or.address.altMobile}`}</p>
                          <p className="font-mono text-[9px]">Receipt Invoicing Copy: {or.address.email}</p>
                        </div>
                        
                      </div>

                      {/* Foot sub-total payables stats */}
                      <div className="border-t border-neutral-800 mt-5 pt-3 flex justify-between items-center text-[10px]">
                        <div className="text-gray-500 uppercase tracking-widest font-mono">
                          COD Payment Method &bull; Flat Delivery charge LKR {or.shippingCharge.toLocaleString()} included.
                        </div>
                        <div className="text-white font-bold text-xs uppercase font-mono bg-luxury-gold/5 px-3 py-1.5 border border-luxury-gold/15">
                          Invoiced Sum: LKR {(or.totalAmount + or.shippingCharge).toLocaleString()}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PANEL 5: NAVBAR CUSTOMIZATION */}
          {activePanel === "navbar" && (
            <div className="space-y-6 animate-fade-in text-xs font-mono uppercase">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
                <h2 className="font-luxury-title text-lg font-light tracking-wider text-white">STOREFRONT NAVBAR MANAGER</h2>
                <button
                  onClick={() => setShowAddNav(!showAddNav)}
                  className="bg-luxury-green hover:bg-luxury-lightgreen text-luxury-gold border border-luxury-gold/30 px-4 py-2 text-[10px] tracking-widest flex items-center gap-1.5 font-bold"
                >
                  <Plus className="w-4 h-4" />
                  ADD CUSTOM ITEM
                </button>
              </div>

              {/* Add form */}
              {showAddNav && (
                <form onSubmit={handleAddNavbarItem} className="bg-neutral-900 border border-neutral-800 p-4 space-y-4 max-w-md">
                  <h4 className="font-mono font-bold tracking-widest text-[#C5A85C] block">NEW CUSTOM NAVBAR ELEMENT</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[9px] text-gray-500 block mb-1">Navbar Label Tag</label>
                      <input
                        type="text"
                        required
                        value={newNavLabel}
                        onChange={(e) => setNewNavLabel(e.target.value)}
                        placeholder="e.g. Bridal Suite"
                        className="w-full bg-neutral-950 border border-neutral-800 px-3 py-1.5 outline-none focus:border-luxury-gold text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-500 block mb-1">Target URL link</label>
                      <input
                        type="text"
                        required
                        value={newNavUrl}
                        onChange={(e) => setNewNavUrl(e.target.value)}
                        placeholder="e.g. #sale || Sarees"
                        className="w-full bg-neutral-950 border border-neutral-800 px-3 py-1.5 outline-none focus:border-luxury-gold text-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-luxury-green border border-luxury-gold/20 text-[#C5A85C] px-3.5 py-1.5 font-bold"
                    >
                      SAVE ELEMENT
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddNav(false)}
                      className="bg-neutral-800 border border-neutral-700 text-gray-300 px-3.5 py-1.5 font-bold"
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              )}

              {/* Re-orderable Navbar Items board */}
              <div className="bg-neutral-900 border border-neutral-800 rounded p-4 space-y-3 max-w-2xl">
                <p className="text-[9px] text-gray-500 block mb-3 uppercase tracking-wider font-bold">
                  REARRANGE AND TOGGLE VISIBILITY IN REAL-TIME SITE HEADERS:
                </p>

                {navbarItems
                  .sort((a,b) => a.order - b.order)
                  .map((item, index) => {
                    const isEditing = navEditId === item.id;
                    return (
                      <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3.5 bg-neutral-950 border border-neutral-800/80 gap-3">
                        {isEditing ? (
                          <div className="flex gap-2.5 flex-grow">
                            <input
                              type="text"
                              value={navEditLabel}
                              onChange={(e) => setNavEditLabel(e.target.value)}
                              className="bg-neutral-900 border border-neutral-700 text-white px-2 py-1 text-xs"
                            />
                            <div className="flex items-center gap-1.5">
                              <input
                                type="checkbox"
                                id={`editNavVis-${item.id}`}
                                checked={navEditEnabled}
                                onChange={(e) => setNavEditEnabled(e.target.checked)}
                                className="w-3.5 h-3.5 accent-luxury-gold"
                              />
                              <label htmlFor={`editNavVis-${item.id}`} className="text-[8px] text-gray-400 font-bold uppercase cursor-pointer">
                                PUBLISHED
                              </label>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <span className="font-mono text-[9px] text-gray-600 bg-neutral-900 py-1 px-2 border border-neutral-800 rounded font-bold">
                              O:{item.order}
                            </span>
                            <span className="font-bold text-white tracking-widest uppercase text-xs">{item.label}</span>
                            <span className="text-gray-500 text-[9px] font-mono leading-none truncate w-24">Link: {item.url}</span>
                            <span className={`px-1.5 py-0.5 text-[7px] font-mono font-bold uppercase rounded ${item.enabled ? "bg-emerald-950 border border-emerald-800 text-emerald-400" : "bg-red-950 border border-red-900 text-red-400"}`}>
                              {item.enabled ? "Active" : "Disabled"}
                            </span>
                          </div>
                        )}

                        {/* Arrows up, down, edit, save and delete block */}
                        <div className="flex items-center gap-1 mt-2 sm:mt-0 font-mono text-[9.5px]">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleNavbarEditSave(item.id)}
                                className="bg-emerald-800 text-white px-2.5 py-1 border border-emerald-600 uppercase font-bold"
                              >
                                SAVE
                              </button>
                              <button
                                onClick={() => setNavEditId(null)}
                                className="bg-neutral-800 text-gray-400 px-2.5 py-1 border border-neutral-700 uppercase font-bold"
                              >
                                BACK
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setNavEditId(item.id);
                                  setNavEditLabel(item.label);
                                  setNavEditEnabled(item.enabled);
                                }}
                                className="bg-neutral-800 text-gray-300 hover:text-white px-2.5 py-1 border border-neutral-700 transition"
                              >
                                EDIT
                              </button>

                              <button
                                disabled={index === 0}
                                onClick={() => handleNavbarRearrange(item.id, "up")}
                                className="bg-neutral-800 text-gray-300 disabled:opacity-20 hover:text-white px-2 py-1 border border-neutral-700 transition"
                              >
                                ▲ UP
                              </button>

                              <button
                                disabled={index === navbarItems.length - 1}
                                onClick={() => handleNavbarRearrange(item.id, "down")}
                                className="bg-neutral-800 text-gray-300 disabled:opacity-20 hover:text-white px-2 py-1 border border-neutral-700 transition"
                              >
                                ▼ DOWN
                              </button>

                              <button
                                onClick={() => handleNavbarDelete(item.id)}
                                className="bg-red-950/20 text-red-400 hover:text-white px-2 py-1 border border-red-900/10 transition"
                              >
                                TRASH
                              </button>
                            </>
                          )}
                        </div>

                      </div>
                    );
                  })}
              </div>

            </div>
          )}

          {/* PANEL 6: REVIEWS AUDITING */}
          {activePanel === "reviews" && (
            <div className="space-y-6 animate-fade-in text-xs font-mono uppercase">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
                <h2 className="font-luxury-title text-lg font-light tracking-wider text-white">REVIEWS AUDIT AND SPAM REMOVALS</h2>
                <div className="text-[10px] text-gray-500 block">
                  ({reviews.length} user reviews submitted)
                </div>
              </div>

              {/* Spam reviewer lists */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-gray-500 uppercase tracking-widest text-[10px]">No reviews submitted by customers yet.</p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="bg-neutral-900 border border-neutral-800 p-4.5 flex flex-col justify-between shadow-sm">
                      <div className="flex justify-between items-start border-b border-neutral-800 pb-2 mb-3">
                        <div>
                          <p className="text-white font-bold">{rev.customerName}</p>
                          <p className="text-gray-500 text-[9px] mt-0.5">Apparel Code: {rev.productId} &bull; Date: {rev.date}</p>
                        </div>
                        <button
                          onClick={() => onDeleteReview(rev.id)}
                          className="text-red-400 hover:text-red-300 border border-red-900/30 hover:border-red-700 px-3 py-1 bg-red-950/25 transition-colors font-mono font-bold text-[9px] tracking-widest"
                          title="Purge review out of systems"
                        >
                          PURGE BAN SPAM
                        </button>
                      </div>

                      <div className="flex gap-1 text-amber-500 mb-2.5">
                        {[1,2,3,4,5].map((s) => (
                          <span key={s} className="text-sm">
                            {s <= rev.rating ? "★" : "☆"}
                          </span>
                        ))}
                      </div>

                      <p className="text-gray-400 text-[10px] uppercase font-light leading-relaxed">
                        &quot;{rev.comment}&quot;
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
