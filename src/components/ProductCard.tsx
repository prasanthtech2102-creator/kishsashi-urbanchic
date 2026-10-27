/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Product } from "../types";
import { Heart, ShoppingBag, Eye, Star } from "lucide-react";

interface ProductCardProps {
  key?: React.Key;
  product: Product;
  onPreview: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, selectedSize: string, selectedColor: string) => void;
  isWishlisted: boolean;
}

export default function ProductCard({
  product,
  onPreview,
  onToggleWishlist,
  onAddToCart,
  isWishlisted
}: ProductCardProps) {
  const formattedPrice = `LKR ${product.price.toLocaleString()}`;
  const formattedDiscountPrice =
    product.discountPrice < product.price ? `LKR ${product.discountPrice.toLocaleString()}` : null;

  // Calculate average rating
  const avgRating =
    product.reviews.length > 0
      ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1)
      : null;

  const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : "M";
  const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : "Default";

  return (
    <div className="group relative bg-white border border-gray-100 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl hover:border-luxury-gold/30 transition-all duration-300">
      
      {/* Product Image Stage */}
      <div className="relative aspect-[3/4] w-full bg-gray-50 overflow-hidden zoom-container">
        
        {/* Discount Tag */}
        {product.discountPercent > 0 && (
          <div className="absolute top-3 left-3 z-10 bg-luxury-gold text-white text-[10px] font-mono tracking-widest uppercase px-2.5 py-1 font-semibold rounded-none shadow-md">
            {product.discountPercent}% OFF
          </div>
        )}

        {/* Featured Tag */}
        {product.featured && (
          <div className="absolute top-3 right-3 z-10 bg-luxury-green text-luxury-gold text-[9px] font-mono tracking-widest uppercase px-2 py-1 border border-luxury-gold/30 rounded-none shadow-md">
            FEATURED
          </div>
        )}

        {/* Image Display */}
        <img
          referrerPolicy="no-referrer"
          src={product.images[0] || product.thumbnail}
          alt={product.name}
          className="w-full h-full object-cover object-center zoom-image"
        />

        {/* Action Overlay buttons */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2.5 z-10">
          <button
            onClick={() => onToggleWishlist(product.id)}
            className={`p-2.5 rounded-full backdrop-blur-md transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 ${
              isWishlisted
                ? "bg-luxury-gold text-white border-luxury-gold scale-110"
                : "bg-white text-luxury-charcoal hover:bg-luxury-green hover:text-white border-gray-100"
            } border shadow-lg`}
            title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
          </button>

          <button
            onClick={() => onPreview(product)}
            className="p-2.5 bg-white text-luxury-charcoal hover:bg-luxury-green hover:text-white rounded-full border border-gray-100 backdrop-blur-md transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75 shadow-lg"
            title="Quick View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          {product.stock > 0 ? (
            <button
              onClick={() => onAddToCart(product, defaultSize, defaultColor)}
              className="p-2.5 bg-white text-luxury-charcoal hover:bg-luxury-green hover:text-white rounded-full border border-gray-100 backdrop-blur-md transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-150 shadow-lg"
              title="Quick Add to Cart"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => onPreview(product)}
              className="p-2 bg-red-700 hover:bg-red-800 text-white text-[9px] tracking-widest font-mono uppercase font-semibold transform translate-y-4 group-hover:translate-y-0 duration-300 delay-150 cursor-pointer shadow"
              title="Out of stock - Click to return to Home Dashboard"
            >
              OUT OF STOCK
            </button>
          )}
        </div>

        {/* Low Stock Warning */}
        {product.stock > 0 && product.stock <= 3 && (
          <div className="absolute bottom-2 left-2 z-10 bg-red-600 text-white text-[8px] tracking-wider font-mono px-1.5 py-0.5">
            ONLY {product.stock} LEFT!
          </div>
        )}
      </div>

      {/* Product Information Grid */}
      <div className="p-4 flex flex-col justify-between flex-grow bg-white">
        <div>
          {/* Brand & Stars Row */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono tracking-widest text-[#C5A85C] uppercase font-semibold">
              {product.brand}
            </span>
            {avgRating && (
              <div className="flex items-center gap-0.5 text-xs text-amber-500">
                <Star className="w-3 h-3 fill-current text-amber-500" />
                <span className="text-[10px] text-gray-400 font-mono font-medium">{avgRating}</span>
              </div>
            )}
          </div>

          {/* Title click points to details */}
          <h3
            onClick={() => onPreview(product)}
            className="text-xs font-medium text-luxury-charcoal hover:text-luxury-gold tracking-wide mb-2 line-clamp-2 uppercase cursor-pointer transition-colors leading-relaxed h-8"
          >
            {product.name}
          </h3>
          
          <p className="text-[10px] text-gray-400 font-normal tracking-wide mb-3">
            {product.category} &bull; {product.subcategory}
          </p>
        </div>

        {/* Pricing Layout */}
        <div className="mt-auto pt-2 border-t border-gray-50 flex items-baseline gap-2.5 flex-wrap">
          {formattedDiscountPrice ? (
            <>
              <span className="text-sm font-semibold text-luxury-green tracking-wide">
                {formattedDiscountPrice}
              </span>
              <span className="text-xs text-gray-400 line-through font-light">
                {formattedPrice}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold text-luxury-green tracking-wide">
              {formattedPrice}
            </span>
          )}
        </div>

        {/* Stock Slider Graphic for low-stock awareness */}
        {product.stock > 0 && (
          <div className="mt-3 w-full bg-gray-100 h-1">
            <div 
              className={`h-full ${product.stock <= 3 ? 'bg-red-500' : 'bg-luxury-green'}`} 
              style={{ width: `${Math.min((product.stock / 20) * 100, 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
