/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { Product, Review } from "../types";
import { X, Heart, ShoppingBag, Star, ShieldCheck, Truck, RefreshCw, Send, Tag } from "lucide-react";

interface ProductDetailPageProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, color: string, qty: number) => void;
  onToggleWishlist: (productId: string) => void;
  isWishlisted: boolean;
  relatedProducts: Product[];
  onSelectRelated: (product: Product) => void;
  onAddReview: (productId: string, rating: number, comment: string) => void;
  onGoHome?: () => void;
}

export default function ProductDetailPage({
  product,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  relatedProducts,
  onSelectRelated,
  onAddReview,
  onGoHome
}: ProductDetailPageProps) {
  const [activeImage, setActiveImage] = useState(product.images?.[0] || product.thumbnail);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "M");
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "Default");
  const [quantity, setQuantity] = useState(1);

  React.useEffect(() => {
    setActiveImage(product.images?.[0] || product.thumbnail);
    setSelectedSize(product.sizes?.[0] || "M");
    setSelectedColor(product.colors?.[0] || "Default");
    setQuantity((prev) => (product.stock > 0 ? Math.min(prev, product.stock) : 1));

    // When product is out of stock, automatically navigate back to the home dashboard
    if (product.stock <= 0 && onGoHome) {
      const timer = setTimeout(() => {
        onGoHome();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [product.id, product.stock, onGoHome]);

  // Review Input State
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [reviewName, setReviewName] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Zoom Ref and State
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({
    transform: "scale(1)",
    transformOrigin: "center"
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transform: "scale(1.8)",
      transformOrigin: `${x}% ${y}%`
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transform: "scale(1)",
      transformOrigin: "center"
    });
  };

  // Pricing format
  const formattedPrice = `LKR ${product.price.toLocaleString()}`;
  const formattedDiscountPrice =
    product.discountPrice < product.price ? `LKR ${product.discountPrice.toLocaleString()}` : null;

  // Rating metrics
  const totalReviews = product.reviews.length;
  const avgRating = totalReviews > 0
    ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : "No";

  const handleAddReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !reviewName.trim()) return;
    onAddReview(product.id, newRating, `${reviewName}: ${newComment}`);
    setNewComment("");
    setReviewName("");
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 4000);
  };

  // Color bubble codes representation mapping
  const getColorHex = (colorName: string) => {
    const colComp = colorName.toLowerCase();
    if (colComp.includes("green") || colComp.includes("emerald")) return "bg-emerald-800";
    if (colComp.includes("gold")) return "bg-[#C5A85C]";
    if (colComp.includes("black") || colComp.includes("onyx")) return "bg-[#121212]";
    if (colComp.includes("crimson") || colComp.includes("red")) return "bg-red-700";
    if (colComp.includes("blue")) return "bg-blue-800";
    if (colComp.includes("white") || colComp.includes("ivory")) return "bg-slate-100 border border-gray-300";
    if (colComp.includes("rose")) return "bg-rose-300";
    return "bg-neutral-500";
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-fade-in"
    >
      <div className="relative w-full max-w-6xl bg-[#FBF9F4] shadow-2xl overflow-hidden max-h-[96vh] flex flex-col justify-between">
        
        {/* Modal Close Toggle Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close product details"
          className="absolute top-4 right-4 z-50 bg-white text-luxury-charcoal hover:bg-luxury-green hover:text-white p-2.5 rounded-full border border-gray-200 shadow-lg transition-colors cursor-pointer"
          title="Close detail page"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Outer scrolling content wrapper */}
        <div className="overflow-y-auto flex-grow px-4 py-8 sm:px-6 md:p-10 select-none">
          
          {/* Main Grid: Images & Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pb-10 border-b border-gray-200">
            
            {/* Left: Product Images Stage */}
            <div className="flex flex-col gap-4">
              
              {/* Main image with bespoke touch hover zoom */}
              <div 
                ref={imageContainerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative aspect-[3/4] w-full bg-white border border-gray-100 overflow-hidden cursor-zoom-in group shadow-sm"
              >
                {product.discountPercent > 0 && (
                  <span className="absolute top-4 left-4 z-10 bg-luxury-gold text-white text-xs tracking-widest px-3 py-1 uppercase font-semibold">
                    {product.discountPercent}% OFF
                  </span>
                )}
                
                <img
                  referrerPolicy="no-referrer"
                  src={activeImage}
                  alt={product.name}
                  style={zoomStyle}
                  className="w-full h-full object-cover object-center transition-transform duration-100 ease-out"
                />

                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 text-[10px] uppercase font-mono tracking-widest sm:block hidden">
                  Hover to Magnify
                </div>
              </div>

              {/* Multiple Thumbnails Gallery list */}
              {product.images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto py-1">
                  {product.images.map((imgUrl, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(imgUrl)}
                      className={`flex-shrink-0 w-20 aspect-[3/4] bg-white border overflow-hidden ${
                        activeImage === imgUrl ? "border-luxury-gold ring-1 ring-luxury-gold" : "border-gray-200"
                      } transition-all`}
                    >
                      <img
                        referrerPolicy="no-referrer"
                        src={imgUrl}
                        alt="Product view thumbnail"
                        className="w-full h-full object-cover object-center"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product specs */}
            <div className="flex flex-col justify-start">
              
              {/* Product tags */}
              <div className="flex items-center gap-1.5 mb-3 text-xs tracking-wider font-mono text-luxury-gold uppercase">
                <Tag className="w-3.5 h-3.5" />
                <span>{product.brand}</span>
                <span>&bull;</span>
                <span>{product.category}</span>
                <span>&bull;</span>
                <span className="text-gray-400">{product.subcategory}</span>
              </div>

              {/* Product Main Title */}
              <h1 className="font-luxury-title text-2xl sm:text-3xl font-light tracking-wide text-luxury-green mb-3 uppercase leading-tight">
                {product.name}
              </h1>

              {/* Stars & Rating Summary Row */}
              <div className="flex items-center gap-2 mb-6 text-sm text-gray-500 border-b border-gray-100 pb-4">
                <div className="flex items-center text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(Number(avgRating) || 5) ? "fill-current" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold text-luxury-charcoal">{avgRating} / 5.0</span>
                <span className="text-gray-400">({totalReviews} customer feedback review{totalReviews !== 1 ? "s" : ""})</span>
              </div>

              {/* SKU & Spec labels */}
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-mono text-gray-500 mb-6 bg-white p-3.5 border border-gray-100">
                <div>SKU: <span className="text-luxury-charcoal font-medium">{product.sku}</span></div>
                <div>Material: <span className="text-luxury-charcoal font-medium">{product.material}</span></div>
                <div>Weight: <span className="text-luxury-charcoal font-medium">{product.weight}</span></div>
                <div>Availability: <span className={`font-semibold ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>{product.stock > 0 ? `In Stock (${product.stock} items)` : "Out of stock"}</span></div>
              </div>

              {/* Pricing Blocks */}
              <div className="mb-6 flex items-baseline gap-4 bg-luxury-gold/5 p-4 border-l-4 border-luxury-gold">
                {formattedDiscountPrice ? (
                  <>
                    <span className="text-3xl font-bold text-luxury-green tracking-wide">
                      {formattedDiscountPrice}
                    </span>
                    <span className="text-lg text-gray-400 line-through font-light">
                      {formattedPrice}
                    </span>
                    <span className="text-xs bg-red-100 text-red-700 font-mono font-semibold px-2 py-0.5 uppercase">
                      Save LKR {(product.price - product.discountPrice).toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-luxury-green tracking-wide">
                    {formattedPrice}
                  </span>
                )}
              </div>

              {/* COLOR Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <span className="text-xs font-mono font-semibold text-luxury-charcoal tracking-widest uppercase block mb-2.5">
                    SELECT COLOR: <span className="text-luxury-gold">{selectedColor}</span>
                  </span>
                  <div className="flex items-center gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center p-0.5 transition-all ${
                          selectedColor === color
                            ? "ring-2 ring-luxury-gold ring-offset-2 scale-110"
                            : "hover:scale-105"
                        }`}
                        title={color}
                      >
                        <span className={`w-full h-full rounded-full ${getColorHex(color)}`} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SIZE Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <span className="text-xs font-mono font-semibold text-luxury-charcoal tracking-widest uppercase block mb-2.5">
                    SELECT SIZE (WOMEN SIZES): <span className="text-luxury-gold">{selectedSize}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-12 h-10 px-3 flex items-center justify-center text-xs font-mono font-medium border transition-all ${
                          selectedSize === size
                            ? "bg-luxury-green text-luxury-gold border-luxury-green font-semibold"
                            : "bg-white text-luxury-charcoal border-gray-200 hover:border-luxury-gold hover:text-luxury-gold"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* QUANTITY & ACTIONS */}
              <div className="flex items-center gap-4 flex-wrap mb-8 border-t border-gray-150 pt-6">
                
                {/* Quantity adjuster */}
                {product.stock > 0 && (
                  <div className="flex items-center border border-gray-300 bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-gray-500 hover:bg-gray-50 border-r border-gray-300"
                    >-</button>
                    <span className="w-12 text-center font-mono font-medium text-sm text-luxury-green">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-2 text-gray-500 hover:bg-gray-50 border-l border-gray-300"
                    >+</button>
                  </div>
                )}

                {/* Primary Add to Cart button */}
                {product.stock > 0 ? (
                  <button
                    onClick={() => onAddToCart(product, selectedSize, selectedColor, quantity)}
                    className="flex-grow min-w-[180px] bg-luxury-green hover:bg-luxury-lightgreen text-[#C5A85C] border border-luxury-gold/15 px-6 py-3.5 text-xs font-semibold tracking-widest uppercase flex items-center justify-center gap-2.5 transition-all shadow-md group"
                  >
                    <ShoppingBag className="w-4 h-4 transition-transform group-hover:scale-110" />
                    ADD TO BAG (LKR {((product.discountPrice < product.price ? product.discountPrice : product.price) * quantity).toLocaleString()})
                  </button>
                ) : (
                  <button
                    onClick={onGoHome || onClose}
                    className="flex-grow min-w-[180px] bg-red-700 hover:bg-red-800 text-white px-6 py-3.5 text-xs font-semibold tracking-widest uppercase text-center border border-red-800 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    title="Product is depleted. Click to return to Home Dashboard"
                  >
                    <span>OUT OF STOCK — RETURN TO HOME</span>
                  </button>
                )}

                {/* Quick Wishlist button */}
                <button
                  onClick={() => onToggleWishlist(product.id)}
                  className={`p-3.5 border transition-all ${
                    isWishlisted
                      ? "bg-luxury-gold text-white border-luxury-gold"
                      : "bg-white text-luxury-charcoal border-gray-200 hover:border-luxury-gold hover:text-luxury-gold"
                  }`}
                  title={isWishlisted ? "Saved" : "Save to Wishlist"}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
                </button>
              </div>

              {/* Shipping, Returns & Authenticity assurances list */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-200 pt-6 text-xs text-gray-500 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-luxury-gold flex-shrink-0" />
                  <span>100% Genuine Designer Apparel</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-luxury-gold flex-shrink-0" />
                  <span>Islandwide COD Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-luxury-gold flex-shrink-0" />
                  <span>Easy 7-day Exchange Policy</span>
                </div>
              </div>

            </div>
          </div>

          {/* Description Detail tab */}
          <div className="py-10 border-b border-gray-200">
            <h3 className="font-luxury-title text-lg tracking-widest text-[#072F22] uppercase mb-4 font-semibold">
              PRODUCT STORY & DESCRIPTION
            </h3>
            <p className="text-gray-600 font-light text-sm leading-relaxed max-w-4xl uppercase tracking-wider">
              {product.description}
            </p>
          </div>

          {/* Customer Reviews Section */}
          <div className="py-10 border-b border-gray-200">
            <h3 className="font-luxury-title text-lg tracking-widest text-[#072F22] uppercase mb-6 font-semibold">
              REVIEWS & RATINGS ({totalReviews})
            </h3>

            {/* Grid: Existing reviews and add review form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              
              {/* Existing Reviews List column */}
              <div className="lg:col-span-2 space-y-6">
                {product.reviews.length === 0 ? (
                  <p className="text-gray-400 text-xs tracking-wider uppercase">Be the first client to review this item.</p>
                ) : (
                  product.reviews.map((rev) => (
                    <div key={rev.id} className="bg-white p-5 border border-gray-100 flex flex-col shadow-sm">
                      <div className="flex justify-between items-center mb-2.5">
                        <span className="font-semibold text-xs text-luxury-green uppercase tracking-wider">{rev.customerName}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{rev.date}</span>
                      </div>
                      <div className="flex gap-0.5 text-amber-500 mb-2.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${star <= rev.rating ? "fill-current" : "text-gray-200"}`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 font-light leading-relaxed uppercase tracking-wide">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add feedback rating form col */}
              <div className="bg-white p-6 border border-gray-100 shadow-sm h-fit">
                <h4 className="text-xs font-mono font-bold tracking-widest text-luxury-charcoal uppercase mb-4 pb-2.5 border-b border-gray-100">
                  WRITE A DESIGN FEEDBACK
                </h4>

                {reviewSuccess && (
                  <div className="mb-4 bg-emerald-50 text-emerald-800 p-3 text-xs border border-emerald-200 rounded-none font-medium">
                    Thank you! Your verified customer review was added successfully.
                  </div>
                )}

                <form onSubmit={handleAddReviewSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-mono tracking-widest text-gray-500 uppercase block mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="e.g. Sithmi Perera"
                      className="w-full text-xs bg-luxury-sand border border-gray-200 px-3 py-2 outline-none focus:border-luxury-gold uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono tracking-widest text-gray-500 uppercase block mb-1">Star Rating</label>
                    <div className="flex items-center gap-1.5 ">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="text-amber-500 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-5 h-5 ${star <= newRating ? "fill-current" : "text-gray-200"}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono tracking-widest text-gray-500 uppercase block mb-1">Your Commentary</label>
                    <textarea
                      required
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Describe stitching quality, fitting feel, drape look..."
                      className="w-full text-xs bg-luxury-sand border border-gray-200 px-3 py-2 outline-none focus:border-luxury-gold uppercase"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-luxury-green hover:bg-luxury-lightgreen text-luxury-gold py-2.5 text-xs font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2 border-t border-luxury-gold/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    SUBMIT REVIEW
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Related Products Rows */}
          <div className="py-10">
            <h3 className="font-luxury-title text-base tracking-widest text-[#072F22] uppercase mb-6 font-semibold">
              YOU MAY ALSO CHERISH
            </h3>
            <div className="grid grid-cols-2 shadow-inner sm:grid-cols-4 gap-4">
              {relatedProducts.length === 0 ? (
                <p className="text-gray-400 text-xs">Exquisite collections coming soon.</p>
              ) : (
                relatedProducts.map((relProd) => {
                  const rPrice = `LKR ${relProd.price.toLocaleString()}`;
                  const rDiscPrice = relProd.discountPrice < relProd.price ? `LKR ${relProd.discountPrice.toLocaleString()}` : null;
                  return (
                    <div
                      key={relProd.id}
                      onClick={() => {
                        onSelectRelated(relProd);
                        setActiveImage(relProd.images[0] || relProd.thumbnail);
                        setZoomStyle({ transform: "scale(1)", transformOrigin: "center" });
                        setQuantity(1);
                      }}
                      className="bg-white p-2.5 border border-gray-100 cursor-pointer hover:border-luxury-gold transition-all shadow-sm flex flex-col justify-between"
                    >
                      <div className="aspect-[3/4] bg-gray-50 overflow-hidden mb-2">
                        <img
                          referrerPolicy="no-referrer"
                          src={relProd.images[0] || relProd.thumbnail}
                          alt={relProd.name}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                      <h4 className="text-[10px] font-semibold text-luxury-charcoal line-clamp-1 uppercase tracking-wide">
                        {relProd.name}
                      </h4>
                      <p className="text-[8px] text-gray-400 uppercase tracking-widest font-mono mb-1">{relProd.brand}</p>
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        {rDiscPrice ? (
                          <>
                            <span className="text-xs font-semibold text-[#072F22]">{rDiscPrice}</span>
                            <span className="text-[10px] text-gray-400 line-through">{rPrice}</span>
                          </>
                        ) : (
                          <span className="text-xs font-semibold text-[#072F22]">{rPrice}</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
