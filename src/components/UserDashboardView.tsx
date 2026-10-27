/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, Address, Order, Product } from "../types";
import { BRAND_LOGO_URL } from "../mockData";
import brandLogo from "../assets/logo.jpeg";
import { UserCheck, MapPin, ClipboardList, Heart, Key, Save, Trash2, PlusCircle, CheckCircle, Package, Truck, Compass, Check } from "lucide-react";

interface UserDashboardViewProps {
  user: User;
  addresses: Address[];
  orders: Order[];
  wishlist: Product[];
  onUpdateProfile: (updatedUser: User) => Promise<void>;
  onSendVerificationEmail: () => Promise<void>;
  onRefreshVerificationStatus: () => Promise<void>;
  onAddAddress: (newAddr: Address) => void;
  onDeleteAddress: (addrId: string) => void;
  onRemoveFromWishlist: (pId: string) => void;
  onMoveToCart: (product: Product, size: string, color: string) => void;
  onClose: () => void;
}

export default function UserDashboardView({
  user,
  addresses,
  orders,
  wishlist,
  onUpdateProfile,
  onSendVerificationEmail,
  onRefreshVerificationStatus,
  onAddAddress,
  onDeleteAddress,
  onRemoveFromWishlist,
  onMoveToCart,
  onClose
}: UserDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "addresses" | "wishlist" | "settings">("profile");

  // Profile Form States
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [mobile, setMobile] = useState(user.mobile);
  const [altMobile, setAltMobile] = useState(user.alternativeMobile);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Address Form toggle and form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrFirstName, setAddrFirstName] = useState("");
  const [addrLastName, setAddrLastName] = useState("");
  const [addrMobile, setAddrMobile] = useState("");
  const [addrAltMobile, setAddrAltMobile] = useState("");
  const [addrEmail, setAddrEmail] = useState("");
  const [addrHouse, setAddrHouse] = useState("");
  const [addrApt, setAddrApt] = useState("");
  const [addrStreet, setAddrStreet] = useState("");
  const [addrArea, setAddrArea] = useState("");
  const [addrLandmark, setAddrLandmark] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrDistrict, setAddrDistrict] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrPostal, setAddrPostal] = useState("");
  const [addrType, setAddrType] = useState<"Home" | "Office" | "Other">("Home");

  // Order Tracking detail modal selection
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<Order | null>(null);
  const [viewingStageOrderId, setViewingStageOrderId] = useState<string | null>(null);

  // Firebase email verification flow
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);
  const [isRefreshingVerification, setIsRefreshingVerification] = useState(false);
  const isVerified = user.verified;
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setIsSavingProfile(true);
    try {
      await onUpdateProfile({
        ...user,
        firstName,
        lastName,
        mobile,
        alternativeMobile: altMobile
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Could not save your profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrFirstName || !addrHouse || !addrCity || !addrDistrict) return;
    const newAddress: Address = {
      id: `addr_${Date.now()}`,
      firstName: addrFirstName,
      lastName: addrLastName,
      mobile: addrMobile,
      altMobile: addrAltMobile,
      email: addrEmail || user.email,
      houseNumber: addrHouse,
      apartmentName: addrApt,
      streetName: addrStreet,
      area: addrArea,
      landmark: addrLandmark,
      city: addrCity,
      district: addrDistrict,
      state: addrState,
      country: "Sri Lanka",
      postalCode: addrPostal,
      type: addrType
    };
    onAddAddress(newAddress);
    setShowAddressForm(false);
    // Clear Address input fields
    setAddrFirstName("");
    setAddrLastName("");
    setAddrMobile("");
    setAddrAltMobile("");
    setAddrEmail("");
    setAddrHouse("");
    setAddrApt("");
    setAddrStreet("");
    setAddrArea("");
    setAddrLandmark("");
    setAddrCity("");
    setAddrDistrict("");
    setAddrState("");
    setAddrPostal("");
    setAddrType("Home");
  };

  const handleSendVerificationEmail = async () => {
    setVerificationError("");
    try {
      await onSendVerificationEmail();
      setVerificationEmailSent(true);
      setShowVerificationAlert(true);
    } catch (error) {
      setVerificationError(error instanceof Error ? error.message : "Could not send the verification email.");
      setShowVerificationAlert(true);
    }
  };

  const handleRefreshVerificationStatus = async () => {
    setVerificationError("");
    setIsRefreshingVerification(true);
    try {
      await onRefreshVerificationStatus();
      setShowVerificationAlert(false);
    } catch (error) {
      setVerificationError(error instanceof Error ? error.message : "Could not refresh verification status.");
    } finally {
      setIsRefreshingVerification(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "text-amber-600 bg-amber-50 border-amber-200";
      case "Confirmed": return "text-indigo-600 bg-indigo-50 border-indigo-200";
      case "Packed": return "text-purple-600 bg-purple-50 border-purple-200";
      case "Shipped": return "text-blue-600 bg-blue-50 border-blue-200";
      case "Delivered": return "text-emerald-600 bg-emerald-50 border-emerald-200";
      default: return "text-rose-600 bg-rose-50 border-rose-200";
    }
  };

  // Tracking Progress Steps list
  const steps = ["Pending", "Confirmed", "Packed", "Shipped", "Delivered"];
  const getStepIndex = (status: string) => steps.indexOf(status);

  return (
    <div className="w-full bg-white border border-gray-100 my-6 shadow-md overflow-hidden select-none">
      
      {/* Profile Header Block */}
      <div className="bg-luxury-green p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-luxury-gold/20">
        <div className="flex items-center gap-4.5 text-center sm:text-left flex-col sm:flex-row">
          <div className="relative">
            <img
              referrerPolicy="no-referrer"
              src={user.profileImage}
              alt={user.firstName}
              className="w-20 h-20 rounded-full border-2 border-luxury-gold object-cover shadow-md"
            />
            {isVerified ? (
              <span className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1 rounded-full text-[10px]" title="Real Email Verified Customer">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            ) : (
              <span className="absolute bottom-0 right-0 bg-amber-500 text-white p-1 rounded-full text-[8px] font-mono leading-none px-1.5" title="Unverified Profile">
                ?
              </span>
            )}
          </div>
          <div>
            <h2 className="font-luxury-title text-xl text-white tracking-widest uppercase">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-xs font-mono text-luxury-gold tracking-wider mt-1 uppercase">
              @{user.username} &bull; Joined May 2026
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <img
            src={BRAND_LOGO_URL}
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== brandLogo) {
                target.src = brandLogo;
              }
            }}
            alt="KISHSASHI URBANCHIC Logo"
            className="h-[60px] w-auto object-contain hidden sm:block opacity-90 rounded"
          />
          <button
            onClick={onClose}
            className="bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-luxury-green uppercase tracking-widest font-mono font-semibold text-xs py-2.5 px-5 transition-colors cursor-pointer"
          >
            RETURN TO SHOP
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 min-h-[500px]">
        
        {/* Left Side Tab bar layout */}
        <div className="bg-luxury-sand p-4 border-r border-gray-200 flex flex-col gap-1">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-xs font-mono font-bold tracking-widest uppercase transition-all ${
              activeTab === "profile" ? "bg-luxury-green text-luxury-gold border-r-4 border-luxury-gold" : "text-gray-600 hover:text-luxury-green hover:bg-gray-100/50"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            My Profile
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-xs font-mono font-bold tracking-widest uppercase transition-all ${
              activeTab === "orders" ? "bg-luxury-green text-luxury-gold border-r-4 border-luxury-gold" : "text-gray-600 hover:text-luxury-green hover:bg-gray-100/50"
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            My Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab("addresses")}
            className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-xs font-mono font-bold tracking-widest uppercase transition-all ${
              activeTab === "addresses" ? "bg-luxury-green text-luxury-gold border-r-4 border-luxury-gold" : "text-gray-600 hover:text-luxury-green hover:bg-gray-100/50"
            }`}
          >
            <MapPin className="w-4 h-4" />
            Addresses ({addresses.length})
          </button>

          <button
            onClick={() => setActiveTab("wishlist")}
            className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-xs font-mono font-bold tracking-widest uppercase transition-all ${
              activeTab === "wishlist" ? "bg-luxury-green text-luxury-gold border-r-4 border-luxury-gold" : "text-gray-600 hover:text-luxury-green hover:bg-gray-100/50"
            }`}
          >
            <Heart className="w-4 h-4" />
            Wishlist ({wishlist.length})
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-xs font-mono font-bold tracking-widest uppercase transition-all ${
              activeTab === "settings" ? "bg-luxury-green text-luxury-gold border-r-4 border-luxury-gold" : "text-gray-600 hover:text-luxury-green hover:bg-gray-100/50"
            }`}
          >
            <Key className="w-4 h-4" />
            Account Security
          </button>
        </div>

        {/* Right Tab Content Stage */}
        <div className="md:col-span-3 p-6 sm:p-8 bg-white overflow-y-auto max-h-[700px]">
          
          {/* TAB 1: PROFILE MANAGEMENT */}
          {activeTab === "profile" && (
            <div>
              <div className="flex justify-between items-center border-b border-gray-150 pb-4 mb-6">
                <h3 className="font-luxury-title text-base tracking-widest text-luxury-green uppercase font-semibold">PERSONAL INFORMATION</h3>
                
                {/* Email verification status */}
                <div className="flex items-center gap-2">
                  {isVerified ? (
                    <span className="bg-emerald-50 text-emerald-800 text-[10px] uppercase font-mono tracking-widest px-3 py-1 font-semibold border border-emerald-150 rounded-none">
                      Verified Client
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendVerificationEmail}
                      className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] uppercase font-mono tracking-widest px-2.5 py-1 font-semibold transition-colors"
                    >
                      {verificationEmailSent ? "RESEND VERIFICATION EMAIL" : "VERIFY EMAIL ID"}
                    </button>
                  )}
                </div>
              </div>

              {/* Firebase verification instructions */}
              {showVerificationAlert && !isVerified && (
                <div className="mb-6 bg-amber-50 border border-amber-200 p-4 text-xs">
                  <p className="font-bold text-amber-900 uppercase tracking-wider mb-2">Email Verification</p>
                  <p className="text-gray-600 uppercase tracking-wide leading-relaxed mb-3">
                    {verificationEmailSent
                      ? <>Open the Firebase verification link sent to <span className="font-bold">{user.email}</span>, then refresh your verification status here.</>
                      : <>Send a verification link to <span className="font-bold">{user.email}</span>.</>}
                  </p>
                  {verificationEmailSent && (
                    <button
                      type="button"
                      onClick={handleRefreshVerificationStatus}
                      disabled={isRefreshingVerification}
                      className="bg-luxury-green text-luxury-gold text-[10px] tracking-widest font-mono px-4 py-2"
                    >
                      {isRefreshingVerification ? "CHECKING..." : "I VERIFIED — REFRESH STATUS"}
                    </button>
                  )}
                  {verificationError && (
                    <p className="text-red-600 text-[10px] font-mono uppercase mt-2 font-bold">{verificationError}</p>
                  )}
                </div>
              )}

              {profileSuccess && (
                <div className="mb-6 bg-emerald-50 text-emerald-800 p-3 text-xs border border-emerald-150 rounded-none uppercase font-mono font-semibold">
                  Personal records saved successfully.
                </div>
              )}
              {profileError && (
                <div className="mb-6 bg-red-50 text-red-800 p-3 text-xs border border-red-200 rounded-none uppercase font-mono font-semibold">
                  {profileError}
                </div>
              )}

              <form onSubmit={handleProfileSave} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                  <div>
                    <label className="text-[10px] font-mono tracking-widest text-[#C5A85C] uppercase block mb-1">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full bg-luxury-sand text-xs border border-gray-200 px-4 py-3 outline-none focus:border-luxury-gold uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono tracking-widest text-[#C5A85C] uppercase block mb-1">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full bg-luxury-sand text-xs border border-gray-200 px-4 py-3 outline-none focus:border-luxury-gold uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono tracking-widest text-[#C5A85C] uppercase block mb-1">Email ID (Cannot be changed)</label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full bg-gray-100 text-xs text-gray-400 border border-gray-200 px-4 py-3 uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono tracking-widest text-[#C5A85C] uppercase block mb-1">Username (Cannot be changed)</label>
                    <input
                      type="text"
                      disabled
                      value={user.username}
                      className="w-full bg-gray-100 text-xs text-gray-400 border border-gray-200 px-4 py-3 uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono tracking-widest text-[#C5A85C] uppercase block mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      required
                      className="w-full bg-luxury-sand text-xs border border-gray-200 px-4 py-3 outline-none focus:border-luxury-gold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono tracking-widest text-[#C5A85C] uppercase block mb-1">Alternative Number</label>
                    <input
                      type="tel"
                      value={altMobile}
                      onChange={(e) => setAltMobile(e.target.value)}
                      className="w-full bg-luxury-sand text-xs border border-gray-200 px-4 py-3 outline-none focus:border-luxury-gold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono tracking-widest text-[#C5A85C] uppercase block mb-1">Gender</label>
                    <input
                      type="text"
                      disabled
                      value={user.gender}
                      className="w-full bg-gray-100 text-xs text-gray-400 border border-gray-200 px-4 py-3 uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono tracking-widest text-[#C5A85C] uppercase block mb-1">Date of Birth</label>
                    <input
                      type="text"
                      disabled
                      value={user.dob}
                      className="w-full bg-gray-100 text-xs text-gray-400 border border-gray-200 px-4 py-3"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="bg-luxury-green hover:bg-luxury-lightgreen border border-luxury-gold/20 text-[#C5A85C] py-3 px-6 font-mono text-xs font-bold tracking-widest uppercase flex items-center gap-2.5 shadow transition-all transform hover:translate-y-[-1px]"
                >
                  <Save className="w-4 h-4" />
                  {isSavingProfile ? "SAVING..." : "SAVE RECORDS"}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: MY ORDERS & TRACKING */}
          {activeTab === "orders" && (
            <div>
              <div className="border-b border-gray-150 pb-4 mb-6 flex justify-between items-center">
                <h3 className="font-luxury-title text-base tracking-widest text-luxury-green uppercase font-semibold">MY PURCHASE HISTORIES</h3>
                <span className="text-xs font-mono font-medium text-gray-400">COD PAYMENT ONLY</span>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 uppercase tracking-widest font-mono text-xs">
                  No orders placed yet. Keep shopping!
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((ord) => (
                    <div key={ord.id} className="bg-white border border-gray-150 p-5 shadow-sm hover:shadow">
                      {/* Master info row */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-50 pb-3 mb-4 gap-3">
                        <div>
                          <p className="text-xs font-mono font-bold text-luxury-green uppercase">{ord.id}</p>
                          <p className="text-[10px] text-gray-400 font-mono tracking-wide mt-1">Placed on {new Date(ord.date).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] uppercase font-mono font-semibold border px-2.5 py-1 ${getStatusColor(ord.status)}`}>
                            {ord.status}
                          </span>
                          <button
                            onClick={() => setSelectedTrackingOrder(selectedTrackingOrder?.id === ord.id ? null : ord)}
                            className="bg-luxury-sand text-luxury-charcoal hover:bg-luxury-green hover:text-[#C5A85C] text-[10px] uppercase font-mono font-bold px-3 py-1.5 border border-gray-200 transition-colors"
                          >
                            {selectedTrackingOrder?.id === ord.id ? "HIDE TRACKING" : "TRACK ORDER"}
                          </button>
                        </div>
                      </div>

                      {/* Live Visual Order Progress Tracking component */}
                      {selectedTrackingOrder?.id === ord.id && (
                        <div className="bg-luxury-gold/5 p-5 border border-luxury-gold/20 mb-5 animate-fade-in text-xs">
                          <h4 className="font-mono font-bold uppercase tracking-widest text-[#072F22] mb-4 flex items-center gap-2">
                            <Compass className="w-4 h-4 text-luxury-gold animate-spin" />
                            Live Delivery Logistics Progress
                          </h4>

                          {/* Connection line progress view */}
                          <div className="relative flex justify-between items-center w-full my-8">
                            <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-200 -translate-y-1/2 z-0" />
                            <div 
                              className="absolute left-0 top-1/2 h-1 bg-luxury-green -translate-y-1/2 z-0 transition-all duration-700"
                              style={{ width: `${(getStepIndex(ord.status) / (steps.length - 1)) * 100}%` }}
                            />

                            {/* Bullet steps */}
                            {steps.map((st, i) => {
                              const isActive = getStepIndex(ord.status) >= i;
                              const isCurrent = getStepIndex(ord.status) === i;
                              return (
                                <div key={st} className="relative z-10 flex flex-col items-center">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                                    isCurrent 
                                      ? "bg-luxury-green text-luxury-gold border-luxury-gold ring-4 ring-luxury-gold/30 scale-110" 
                                      : isActive 
                                        ? "bg-luxury-green text-[#C5A85C] border-luxury-green" 
                                        : "bg-white text-gray-300 border-gray-200"
                                  }`}>
                                    {isActive ? <Check className="w-4 h-4 stroke-[3]" /> : <span className="text-[10px] font-mono">{i+1}</span>}
                                  </div>
                                  <span className={`text-[9px] font-mono uppercase tracking-widest mt-2 font-bold ${isActive ? 'text-luxury-green' : 'text-gray-400'}`}>
                                    {st}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          <div className="bg-white p-3 border border-gray-100 flex items-center gap-3.5 text-[11px] uppercase tracking-wide">
                            {ord.status === "Pending" && <p className="text-amber-800">Your order is under verification review. Highly valued administrators will manually confirm this shortly.</p>}
                            {ord.status === "Confirmed" && <p className="text-cyan-800">Elite tailoring is confirmed! We have secured the stock in the premium garments wing.</p>}
                            {ord.status === "Packed" && <p className="text-purple-800">Packed in our luxury gold-trimmed gift box packages and ready for courier handovers.</p>}
                            {ord.status === "Shipped" && <p className="text-blue-800 font-medium">Out for delivery with our courier partners. Estimate arrival within Sri Lanka in 48 hours.</p>}
                            {ord.status === "Delivered" && <p className="text-emerald-800 font-semibold font-mono">Delivered! We appreciate your premium patronages at KISHSASHI URBANCHIC.</p>}
                            {ord.status === "Cancelled" && <p className="text-red-800 font-semibold uppercase">This transaction has been terminated by request. Any concerns can be directed to support.</p>}
                          </div>
                        </div>
                      )}

                      {/* Items loop */}
                      <div className="space-y-3.5">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="flex gap-4 items-center">
                            <img
                              referrerPolicy="no-referrer"
                              src={it.thumbnail}
                              alt={it.productName}
                              className="w-14 aspect-[3/4] object-cover border border-gray-100"
                            />
                            <div className="flex-grow">
                              <h4 className="text-xs font-medium text-luxury-charcoal uppercase leading-tight">{it.productName}</h4>
                              <p className="text-[9px] text-gray-400 font-mono tracking-wider mt-1 uppercase">
                                SKU: {it.sku} &bull; SIZE: {it.size} &bull; COLOR: {it.color}
                              </p>
                              <p className="text-[11px] font-mono text-gray-500 font-medium mt-1">
                                LKR {it.price.toLocaleString()} x {it.quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Collapsible stages breakdown */}
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => setViewingStageOrderId(viewingStageOrderId === ord.id ? null : ord.id)}
                          className="text-[#C5A85C] hover:text-luxury-green text-[9px] tracking-widest font-mono font-bold flex items-center gap-1 uppercase cursor-pointer"
                        >
                          {viewingStageOrderId === ord.id ? "▼ HIDE STAGE AUDITED BREAKDOWN" : "▶ VIEW AUDITED STAGES & BILLING DETAIL"}
                        </button>

                        {viewingStageOrderId === ord.id && (
                          <div className="mt-3.5 p-4 bg-luxury-sand/40 border border-gray-250/70 rounded-md space-y-4 animate-fade-in text-[10.5px]">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Stage 1: Full Destination Address details */}
                              <div className="bg-white p-3 border border-gray-200 shadow-xs rounded">
                                <span className="text-[8.5px] text-[#C5A85C] font-extrabold tracking-widest block uppercase mb-1.5">
                                  1. PRODUCT DETAILS (ADDRESS)
                                </span>
                                <div className="text-gray-600 leading-relaxed font-mono uppercase text-[9.5px]">
                                  <span className="font-bold text-luxury-green block">
                                    {ord.address?.firstName} {ord.address?.lastName}
                                  </span>
                                  <span className="block mt-0.5">MOB: {ord.address?.mobile}</span>
                                  <span className="block mt-0.5">
                                    {ord.address?.houseNumber}, {ord.address?.apartmentName && `${ord.address?.apartmentName}, `}{ord.address?.streetName}
                                  </span>
                                  <span className="block">{ord.address?.city}, {ord.address?.district}</span>
                                  <span className="block font-bold">POSTAL: {ord.address?.postalCode}</span>
                                </div>
                              </div>

                              {/* Stage 2: Pricing breakdown */}
                              <div className="bg-white p-3 border border-gray-200 shadow-xs rounded">
                                <span className="text-[8.5px] text-[#C5A85C] font-extrabold tracking-widest block uppercase mb-1.5 border-b pb-1">
                                  2. BUDGET & FEE SPECIFICATION
                                </span>
                                {(() => {
                                  const courierFee = 150; // flat packaging & tagging fee
                                  const grandPayable = ord.totalAmount + ord.shippingCharge + courierFee;
                                  return (
                                    <div className="text-gray-650 font-mono text-[9px] space-y-1">
                                      <div className="flex justify-between">
                                        <span>APPARELS NET:</span>
                                        <span className="font-bold text-neutral-800">LKR {ord.totalAmount.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>DYNAMIC CARRIAGE:</span>
                                        <span className="font-bold text-neutral-800">LKR {ord.shippingCharge.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between text-neutral-500">
                                        <span>LUXURY HANDLING FEE:</span>
                                        <span>LKR {courierFee.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between border-t border-dashed pt-1.5 font-bold text-luxury-green">
                                        <span>COD TOTAL DUE:</span>
                                        <span>LKR {grandPayable.toLocaleString()}</span>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>

                              {/* Stage 3: Payment Affirmation status */}
                              <div className="bg-white p-3 border border-gray-200 shadow-xs rounded">
                                <span className="text-[8.5px] text-[#C5A85C] font-extrabold tracking-widest block uppercase mb-1.5">
                                  3. PAYMENT RECORD AFFIRMATION
                                </span>
                                <div className="text-gray-600 font-mono text-[9.5px] uppercase leading-relaxed space-y-0.5">
                                  <span className="font-bold text-emerald-800 block">METHOD: COD (CASH ON DELIVERY)</span>
                                  <span className="block">LOCK STATUS: <strong className="text-luxury-green">AFFIRMED</strong></span>
                                  <span className="block">AUTHORIZATION: <strong className="text-emerald-700">GRANTED</strong></span>
                                  <span className="block text-[8px] text-gray-400 font-light mt-1 text-lowercase leading-snug">
                                    OUR MANUALLY DEPOSITED SIZING GUARANTEE PROTECTS THIS ORDER.
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Totals row */}
                      <div className="border-t border-gray-100 mt-4 pt-3 flex justify-between text-xs tracking-wide">
                        <div className="text-gray-400 uppercase font-light">
                          Shipping Charge: LKR {ord.shippingCharge.toLocaleString()} &bull; Cash on Delivery
                        </div>
                        <div className="font-semibold text-luxury-green">
                          Total Payable: LKR {(ord.totalAmount + ord.shippingCharge).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADDRESSES MANAGER */}
          {activeTab === "addresses" && (
            <div>
              <div className="border-b border-gray-150 pb-4 mb-6 flex justify-between items-center bg-transparent">
                <h3 className="font-luxury-title text-base tracking-widest text-luxury-green uppercase font-semibold">ADDRESS MANAGEMENT</h3>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="bg-luxury-green hover:bg-luxury-lightgreen text-[#C5A85C] border border-luxury-gold/20 font-mono text-xs font-bold tracking-widest uppercase px-4 py-2 flex items-center gap-1.5 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  ADD NEW SLOT
                </button>
              </div>

              {/* Address Form */}
              {showAddressForm && (
                <form onSubmit={handleAddressSubmit} className="bg-luxury-sand p-6 border border-gray-200 mb-8 space-y-4 text-xs">
                  <h4 className="font-mono font-bold tracking-widest uppercase text-luxury-green border-b border-gray-150 pb-2">
                    NEW SHIPPING RECORD
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-mono tracking-widest uppercase text-gray-400 block mb-1">First Name</label>
                      <input
                        type="text"
                        required
                        value={addrFirstName}
                        onChange={(e) => setAddrFirstName(e.target.value)}
                        placeholder="Recipient first name"
                        className="w-full text-xs bg-white border border-gray-200 px-3 py-2 outline-none focus:border-luxury-gold uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono tracking-widest uppercase text-gray-400 block mb-1">Last Name</label>
                      <input
                        type="text"
                        required
                        value={addrLastName}
                        onChange={(e) => setAddrLastName(e.target.value)}
                        placeholder="Recipient last name"
                        className="w-full text-xs bg-white border border-gray-200 px-3 py-2 outline-none focus:border-luxury-gold uppercase"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-mono tracking-widest uppercase text-gray-400 block mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        required
                        value={addrMobile}
                        onChange={(e) => setAddrMobile(e.target.value)}
                        placeholder="e.g. +94 77 111 2233"
                        className="w-full text-xs bg-white border border-gray-200 px-3 py-2 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono tracking-widest uppercase text-gray-400 block mb-1">Alternative Number</label>
                      <input
                        type="tel"
                        value={addrAltMobile}
                        onChange={(e) => setAddrAltMobile(e.target.value)}
                        placeholder="Alternative contact info"
                        className="w-full text-xs bg-white border border-gray-200 px-3 py-2 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[9px] font-mono tracking-widest uppercase text-gray-400 block mb-1">Email ID</label>
                      <input
                        type="email"
                        value={addrEmail}
                        onChange={(e) => setAddrEmail(e.target.value)}
                        placeholder="Verification invoice copy recipient"
                        className="w-full text-xs bg-white border border-gray-200 px-3 py-2 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-mono tracking-widest uppercase text-gray-400 block mb-1">House Number</label>
                      <input
                        type="text"
                        required
                        value={addrHouse}
                        onChange={(e) => setAddrHouse(e.target.value)}
                        placeholder="House / Unit no"
                        className="w-full text-xs bg-white border border-gray-200 px-3 py-2 outline-none focus:border-luxury-gold uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono tracking-widest uppercase text-gray-400 block mb-1">Apartment Sub-Name</label>
                      <input
                        type="text"
                        value={addrApt}
                        onChange={(e) => setAddrApt(e.target.value)}
                        placeholder="Apartment complexes name"
                        className="w-full text-xs bg-white border border-gray-200 px-3 py-2 outline-none focus:border-luxury-gold uppercase"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[9px] font-mono tracking-widest uppercase text-gray-400 block mb-1">Street name & Lane</label>
                      <input
                        type="text"
                        required
                        value={addrStreet}
                        onChange={(e) => setAddrStreet(e.target.value)}
                        placeholder="e.g. Galle Road, Flower Lane"
                        className="w-full text-xs bg-white border border-gray-200 px-3 py-2 outline-none focus:border-luxury-gold uppercase"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-mono tracking-widest uppercase text-gray-400 block mb-1">Area / Ward</label>
                      <input
                        type="text"
                        value={addrArea}
                        onChange={(e) => setAddrArea(e.target.value)}
                        placeholder="Suburbs name"
                        className="w-full text-xs bg-white border border-gray-200 px-3 py-2 outline-none focus:border-luxury-gold uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono tracking-widest uppercase text-gray-400 block mb-1">Landmark</label>
                      <input
                        type="text"
                        value={addrLandmark}
                        onChange={(e) => setAddrLandmark(e.target.value)}
                        placeholder="Corner shops, museums..."
                        className="w-full text-xs bg-white border border-gray-200 px-3 py-2 outline-none focus:border-luxury-gold uppercase"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-mono tracking-widest uppercase text-gray-400 block mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={addrCity}
                        onChange={(e) => setAddrCity(e.target.value)}
                        placeholder="Colombo, Kandy, Galle..."
                        className="w-full text-xs bg-white border border-gray-200 px-3 py-2 outline-none focus:border-luxury-gold uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono tracking-widest uppercase text-gray-400 block mb-1">District</label>
                      <input
                        type="text"
                        required
                        value={addrDistrict}
                        onChange={(e) => setAddrDistrict(e.target.value)}
                        placeholder="e.g. Colombo District"
                        className="w-full text-xs bg-white border border-gray-200 px-3 py-2 outline-none focus:border-luxury-gold uppercase"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-mono tracking-widest uppercase text-gray-400 block mb-1">State / Province</label>
                      <input
                        type="text"
                        value={addrState}
                        onChange={(e) => setAddrState(e.target.value)}
                        placeholder="e.g. Western Province"
                        className="w-full text-xs bg-white border border-gray-200 px-3 py-2 outline-none focus:border-luxury-gold uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono tracking-widest uppercase text-gray-400 block mb-1">Postal Code</label>
                      <input
                        type="text"
                        value={addrPostal}
                        onChange={(e) => setAddrPostal(e.target.value)}
                        placeholder="Postal numbers"
                        className="w-full text-xs bg-white border border-gray-200 px-3 py-2 outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-mono tracking-widest uppercase text-gray-400 block mb-1">Address Label</label>
                      <div className="flex gap-2">
                        {["Home", "Office", "Other"].map((lbl) => (
                          <button
                            key={lbl}
                            type="button"
                            onClick={() => setAddrType(lbl as "Home" | "Office" | "Other")}
                            className={`flex-grow py-1.5 font-mono text-center border text-[10px] uppercase font-bold tracking-widest ${
                              addrType === lbl
                                ? "bg-luxury-green text-luxury-gold border-luxury-green"
                                : "bg-white text-gray-500 border-gray-200"
                            }`}
                          >
                            {lbl}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-4 border-t border-gray-200 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="px-4 py-2 border border-gray-300 font-mono tracking-widest text-[10px] uppercase font-bold text-gray-500 hover:bg-gray-50 cursor-pointer"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-luxury-green text-luxury-gold font-mono tracking-widest text-[10px] uppercase font-bold border border-luxury-gold/20"
                    >
                      SAVE ADDRESS
                    </button>
                  </div>
                </form>
              )}

              {/* Address List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className="border border-gray-200 p-5 bg-white relative shadow-sm hover:border-luxury-gold transition-colors">
                    
                    {/* Badge */}
                    <span className="absolute top-4 right-4 text-[9px] font-mono font-bold tracking-widest uppercase bg-luxury-gold/15 text-luxury-green border border-luxury-gold/30 px-2 py-0.5">
                      {addr.type}
                    </span>

                    <h4 className="font-bold text-xs text-luxury-green uppercase tracking-wide mb-3">
                      {addr.firstName} {addr.lastName}
                    </h4>

                    {/* Meta coordinates list style layout */}
                    <div className="space-y-1 text-xs text-gray-500 uppercase font-light tracking-wide mb-4">
                      <p>{addr.houseNumber} {addr.apartmentName && `, ${addr.apartmentName}`}</p>
                      <p>{addr.streetName} {addr.area && `, ${addr.area}`}</p>
                      {addr.landmark && <p className="text-gray-400 text-[10px]">Landmark: {addr.landmark}</p>}
                      <p>{addr.city}, {addr.district}</p>
                      <p>{addr.state}, {addr.country} &bull; {addr.postalCode}</p>
                      <p className="text-[10px] font-mono mt-2 font-medium text-gray-500">
                        Contact: {addr.mobile} {addr.altMobile && ` | ${addr.altMobile}`}
                      </p>
                    </div>

                    <button
                      onClick={() => onDeleteAddress(addr.id)}
                      className="text-red-600 hover:text-red-800 flex items-center gap-1 text-[10px] font-mono tracking-widest font-bold uppercase"
                      title="Destroy address record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      DELETE RECORD
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: WISHLIST / SAVED */}
          {activeTab === "wishlist" && (
            <div>
              <div className="border-b border-gray-150 pb-4 mb-6">
                <h3 className="font-luxury-title text-base tracking-widest text-luxury-green uppercase font-semibold">SAVED WOMENS APPARELS</h3>
              </div>

              {wishlist.length === 0 ? (
                <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 uppercase tracking-widest font-mono text-xs">
                  Your wishlist is empty. Discover new luxury arrivals!
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {wishlist.map((wp) => (
                    <div key={wp.id} className="bg-white border border-gray-200 p-3 flex flex-col justify-between shadow-sm relative group">
                      <div className="aspect-[3/4] bg-gray-50 overflow-hidden mb-3.5">
                        <img
                          referrerPolicy="no-referrer"
                          src={wp.images[0] || wp.thumbnail}
                          alt={wp.name}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>

                      <h4 className="text-xs font-semibold text-luxury-charcoal line-clamp-1 uppercase tracking-wide mb-1">
                        {wp.name}
                      </h4>
                      <p className="text-[9px] text-[#C5A85C] uppercase tracking-widest font-mono mb-2">{wp.brand}</p>
                      <p className="text-xs font-semibold text-luxury-green mb-3">
                        LKR {(wp.discountPrice < wp.price ? wp.discountPrice : wp.price).toLocaleString()}
                      </p>

                      <div className="space-y-1.5 mt-auto">
                        {wp.stock > 0 ? (
                          <button
                            onClick={() => onMoveToCart(wp, wp.sizes[0] || "M", wp.colors[0] || "Default")}
                            className="w-full bg-luxury-green hover:bg-luxury-lightgreen text-luxury-gold text-[10px] font-mono font-bold tracking-widest uppercase py-1.5 border border-luxury-gold/15"
                          >
                            MOVE TO BAG
                          </button>
                        ) : (
                          <div className="w-full bg-red-50 text-red-600 text-[10px] font-mono font-bold tracking-widest uppercase py-1.5 border border-red-200 text-center">
                            OUT OF STOCK
                          </div>
                        )}
                        <button
                          onClick={() => onRemoveFromWishlist(wp.id)}
                          className="w-full text-gray-400 hover:text-red-600 text-[9px] font-mono tracking-widest uppercase py-1 flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          REMOVE
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ACCOUNT SECURITY / SETTINGS */}
          {activeTab === "settings" && (
            <div>
              <div className="border-b border-gray-150 pb-4 mb-6">
                <h3 className="font-luxury-title text-base tracking-widest text-luxury-green uppercase font-semibold">ACCOUNT SECURITY & SETTINGS</h3>
              </div>

              <div className="max-w-md space-y-6 text-xs text-gray-700">
                <div className="bg-luxury-sand p-5 border border-gray-200">
                  <h4 className="font-mono font-bold uppercase tracking-widest text-[#072F22] mb-3 pb-1 border-b">SIMULATED CRYPTO HASH UPDATE</h4>
                  <div className="space-y-3">
                    {passwordUpdateSuccess && (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 text-[10px] font-mono uppercase">
                        Password securely updated inside local state layer.
                      </div>
                    )}
                    <div>
                      <label className="text-[9px] font-mono tracking-widest text-gray-500 uppercase block mb-1">Current Password hash</label>
                      <input
                        type="password"
                        disabled
                        value="hashed_by_sha256_kishsashi_auth"
                        className="w-full bg-gray-100 border text-gray-400 px-3 py-2 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono tracking-widest text-gray-500 uppercase block mb-1">New Password string</label>
                      <input
                        type="password"
                        placeholder="••••••••••••••"
                        className="w-full bg-white border border-gray-200 px-3 py-2 outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPasswordUpdateSuccess(true);
                        setTimeout(() => setPasswordUpdateSuccess(false), 3000);
                      }}
                      className="bg-luxury-green text-luxury-gold px-3 py-1.5 text-[10px] font-mono font-bold tracking-widest uppercase border border-lucky-gold/10"
                    >
                      UPDATE PASSWORDS
                    </button>
                  </div>
                </div>

                <div className="bg-luxury-sand p-5 border border-gray-200">
                  <h4 className="font-mono font-bold uppercase tracking-widest text-[#072F22] mb-2">METRIC PREFERENCES</h4>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-3.5">Configure automatic currency displays format.</p>
                  
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-luxury-green flex-shrink-0" />
                    <span className="font-mono font-bold uppercase text-luxury-green">Sri Lankan Rupees (LKR) &bull; LKR Prefix</span>
                  </div>
                  <p className="text-gray-500 text-[10px] font-mono mt-1 pt-1 ml-5">Standard displays pattern: LKR 1,500 || LKR 10,500.</p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
