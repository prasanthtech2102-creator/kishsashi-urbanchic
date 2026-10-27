/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import { Banner } from "../types";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";

interface BannerSliderProps {
  banners: Banner[];
  onBannerClick: (categoryName: string) => void;
}

export default function BannerSlider({ banners, onBannerClick }: BannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    if (banners.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    if (banners.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (isPaused || banners.length <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, banners.length]);

  if (!banners || banners.length === 0) return null;

  return (
    <div
      className="relative w-full bg-luxury-charcoal overflow-hidden select-none border-b border-luxury-gold/30"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slider viewport */}
      <div className="relative h-[480px] sm:h-[560px] md:h-[620px] w-full">
        {banners.map((banner, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 pointer-events-auto z-10" : "opacity-0 pointer-events-none z-0"
              }`}
            >
              {/* Background hero image with rich luxury gradient overlays */}
              <div className="absolute inset-0 bg-neutral-950">
                <img
                  referrerPolicy="no-referrer"
                  src={banner.image}
                  alt={banner.title}
                  className={`w-full h-full object-cover object-center transform transition-transform duration-[7000ms] ease-out ${
                    isActive ? "scale-105" : "scale-100"
                  }`}
                />
                {/* Multi-layered luxury tint gradients */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/35" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
                <div className="absolute inset-0 bg-[#072F22]/30 mix-blend-multiply" />
              </div>

              {/* Text content container */}
              <div className="relative h-full max-w-7xl mx-auto px-6 lg:px-12 flex flex-col justify-center items-start">
                <div className="max-w-2xl space-y-4 sm:space-y-5 animate-fade-in">
                  
                  {/* Discount tag badge */}
                  {banner.discountText && (
                    <div className="inline-flex items-center gap-2 bg-luxury-gold text-luxury-green px-3.5 py-1.5 text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase shadow-lg">
                      <Sparkles className="w-3.5 h-3.5 fill-current" />
                      <span>{banner.discountText}</span>
                    </div>
                  )}

                  {/* Main serif title */}
                  <h1 className="font-luxury-title text-3xl sm:text-5xl md:text-6xl font-light tracking-wide text-white leading-[1.1] uppercase drop-shadow-md">
                    {banner.title}
                  </h1>

                  {/* Subtitle */}
                  <p className="text-gray-300 text-xs sm:text-sm md:text-base font-light tracking-wider uppercase max-w-lg leading-relaxed">
                    {banner.subtitle}
                  </p>

                  {/* Gold divider line */}
                  <div className="w-20 h-[2px] bg-luxury-gold my-3" />

                  {/* CTA Buttons */}
                  <div className="pt-2 flex flex-wrap gap-4 items-center">
                    <button
                      onClick={() => onBannerClick(banner.link)}
                      className="group bg-luxury-green hover:bg-luxury-lightgreen text-[#E2CC91] border border-luxury-gold/60 hover:border-luxury-gold px-7 py-3.5 text-xs font-mono font-bold tracking-widest uppercase shadow-xl transition-all flex items-center gap-2.5 cursor-pointer"
                    >
                      <span>EXPLORE {banner.link.toUpperCase()}</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                    <span className="text-[10px] font-mono text-gray-400 tracking-widest hidden sm:inline-block">
                      ✦ HANDWOVEN LUXURY &bull; ISLANDWIDE COD
                    </span>
                  </div>

                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-black/40 hover:bg-luxury-green border border-luxury-gold/40 text-[#E2CC91] hover:text-white flex items-center justify-center transition-all backdrop-blur-xs cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-black/40 hover:bg-luxury-green border border-luxury-gold/40 text-[#E2CC91] hover:text-white flex items-center justify-center transition-all backdrop-blur-xs cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Pagination Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                idx === currentIndex
                  ? "w-8 bg-luxury-gold"
                  : "w-2.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
