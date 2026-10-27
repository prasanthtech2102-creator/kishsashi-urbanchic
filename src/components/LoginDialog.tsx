/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User } from "../types";
import { BRAND_LOGO_URL } from "../mockData";
import brandLogo from "../assets/logo.jpeg";
import { X, Lock, Mail, Sparkles, Image as ImageIcon } from "lucide-react";
import {
  getFirebaseErrorMessage,
  loginWithEmailAndPassword,
  registerWithEmailAndPassword
} from "../firebase";

interface LoginDialogProps {
  onClose: () => void;
  onLoginAdminSuccess: () => void;
  onLoginUserSuccess: (user: User) => void;
  isCompulsory?: boolean;
}

export default function LoginDialog({
  onClose,
  onLoginAdminSuccess,
  onLoginUserSuccess,
  isCompulsory = false
}: LoginDialogProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  
  // Login Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Register Form States
  const [regFirst, setRegFirst] = useState("");
  const [regLast, setRegLast] = useState("");
  const [regUser, setRegUser] = useState("");
  const [regGender, setRegGender] = useState("Female");
  const [regDob, setRegDob] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regAltPhone, setRegAltPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regPassConf, setRegPassConf] = useState("");
  const [regProfileImg, setRegProfileImg] = useState("https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200");
  const [regSuccessMsg, setRegSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setRegSuccessMsg("");

    setIsSubmitting(true);
    try {
      const result = await loginWithEmailAndPassword(email, password);
      if (result.isAdmin) {
        onLoginAdminSuccess();
      } else {
        onLoginUserSuccess(result.profile);
      }
      onClose();
    } catch (error) {
      setLoginError(getFirebaseErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setRegSuccessMsg("");

    if (regPass !== regPassConf) {
      setLoginError("Password confirmation mismatch. Please re-enter.");
      return;
    }

    const newProfile: Omit<User, "id"> = {
      firstName: regFirst,
      lastName: regLast,
      username: regUser,
      gender: regGender,
      dob: regDob,
      mobile: regPhone,
      alternativeMobile: regAltPhone,
      email: regEmail.trim().toLowerCase(),
      profileImage: regProfileImg || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
      verified: false
    };

    setIsSubmitting(true);
    try {
      const createdPatron = await registerWithEmailAndPassword(newProfile, regPass);
      setRegSuccessMsg("Registration complete. Logging into your account now...");
      onLoginUserSuccess(createdPatron);
      onClose();
    } catch (error) {
      setLoginError(getFirebaseErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in text-xs font-mono uppercase select-none font-sans"
    >
      <div className="relative w-full max-w-lg bg-[#FBF9F4] p-6 sm:p-7 shadow-2xl rounded border border-gray-200 text-[#121212] max-h-[92vh] overflow-y-auto">
        
        {/* Prominent, working Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close Login Modal"
          className="absolute top-4 right-4 z-20 p-2 text-gray-400 hover:text-luxury-charcoal hover:bg-gray-200/50 rounded-full transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand visual header inside dialog with updated user logo link */}
        <div className="text-center mb-6 flex flex-col items-center">
          <img
            src={BRAND_LOGO_URL}
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== brandLogo) {
                target.src = brandLogo;
              }
            }}
            alt="KISHSASHI URBANCHIC Logo"
            className="h-[68px] w-auto object-contain mb-3 drop-shadow-sm rounded"
          />
          <span className="font-luxury-title text-base sm:text-lg tracking-[0.25em] text-luxury-green uppercase leading-none">
            KISHSASHI URBANCHIC
          </span>
          <span className="text-[8px] tracking-[0.45em] text-gray-400 block uppercase font-bold pl-0.5 mt-1">
            HAUTE COUTURE ACCOUNT ACCESS
          </span>
        </div>

        {/* Tab switchers */}
        <div className="flex gap-4 border-b border-gray-200 mb-6">
          <button
            type="button"
            onClick={() => { setActiveTab("login"); setLoginError(""); }}
            className={`flex-grow pb-2 text-center text-[10px] tracking-widest font-bold uppercase border-b-2 transition-colors cursor-pointer ${
              activeTab === "login" ? "border-luxury-gold text-luxury-green" : "border-transparent text-gray-400 hover:text-[#121212]"
            }`}
          >
            PATRON LOG IN
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("register"); setLoginError(""); }}
            className={`flex-grow pb-2 text-center text-[10px] tracking-widest font-bold uppercase border-b-2 transition-colors cursor-pointer ${
              activeTab === "register" ? "border-luxury-gold text-luxury-green" : "border-transparent text-gray-400 hover:text-[#121212]"
            }`}
          >
            REGISTER NEW PATRON
          </button>
        </div>

        {/* Notifications and errors */}
        {loginError && (
          <div className="bg-red-50 text-red-800 p-3 text-[10px] uppercase font-semibold font-mono border border-red-200 mb-4 rounded-none">
            {loginError}
          </div>
        )}

        {regSuccessMsg && (
          <div className="bg-emerald-50 text-emerald-800 p-3 text-[10px] uppercase font-semibold font-mono border border-emerald-200 mb-4 rounded-none">
            {regSuccessMsg}
          </div>
        )}

        {/* TAB 1: LOGIN SECURE FORM */}
        {activeTab === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-[9px] text-gray-400 tracking-widest uppercase block mb-1 font-mono">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. client@domain.com"
                  className="w-full bg-white text-xs border border-gray-200 pl-9 pr-3.5 py-2.5 outline-none focus:border-luxury-gold text-[#121212]"
                />
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="text-[9px] text-gray-400 tracking-widest uppercase block mb-1 font-mono">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••"
                  className="w-full bg-white text-xs border border-gray-200 pl-9 pr-3.5 py-2.5 outline-none focus:border-luxury-gold text-[#121212]"
                />
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 text-xs tracking-widest font-mono font-bold uppercase transition-all border border-gray-300 text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] bg-luxury-green hover:bg-luxury-lightgreen text-[#E2CC91] py-3 text-xs tracking-widest font-mono font-bold uppercase transition-all shadow border border-luxury-gold/25 cursor-pointer"
              >
                {isSubmitting ? "SIGNING IN..." : "LOG IN"}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: REGISTER SYSTEM */}
        {activeTab === "register" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs font-mono uppercase">
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[8px] text-gray-400 block mb-0.5">First name</label>
                <input
                  type="text"
                  required
                  value={regFirst}
                  onChange={(e) => setRegFirst(e.target.value)}
                  placeholder="First name"
                  className="w-full bg-white text-xs border border-gray-200 px-3 py-1.5 outline-none focus:border-luxury-gold"
                />
              </div>
              <div>
                <label className="text-[8px] text-gray-400 block mb-0.5">Last name</label>
                <input
                  type="text"
                  required
                  value={regLast}
                  onChange={(e) => setRegLast(e.target.value)}
                  placeholder="Last name"
                  className="w-full bg-white text-xs border border-gray-200 px-3 py-1.5 outline-none focus:border-luxury-gold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[8px] text-gray-400 block mb-0.5">Username</label>
                <input
                  type="text"
                  required
                  value={regUser}
                  onChange={(e) => setRegUser(e.target.value)}
                  placeholder="e.g. minoli_w"
                  className="w-full bg-white text-xs border border-gray-200 px-3 py-1.5 outline-none focus:border-luxury-gold"
                />
              </div>
              <div>
                <label className="text-[8px] text-gray-400 block mb-0.5">Gender</label>
                <select
                  value={regGender}
                  onChange={(e) => setRegGender(e.target.value)}
                  className="w-full bg-white text-xs border border-gray-200 px-2 py-1.5 outline-none focus:border-luxury-gold"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[8px] text-gray-400 block mb-0.5">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+94 77 111 2233"
                  className="w-full bg-white text-xs border border-gray-200 px-3 py-1.5 outline-none"
                />
              </div>
              <div>
                <label className="text-[8px] text-gray-400 block mb-0.5">Alternative Contact</label>
                <input
                  type="tel"
                  value={regAltPhone}
                  onChange={(e) => setRegAltPhone(e.target.value)}
                  placeholder="Optional line"
                  className="w-full bg-white text-xs border border-gray-200 px-3 py-1.5 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[8px] text-gray-400 block mb-0.5">Email Address</label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="client@kishsashi.com"
                className="w-full bg-white text-xs border border-gray-200 px-3 py-1.5 outline-none lowercase focus:border-luxury-gold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[8px] text-gray-400 block mb-0.5">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={regDob}
                  onChange={(e) => setRegDob(e.target.value)}
                  className="w-full bg-white text-xs border border-gray-200 px-2 py-1.5 outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-[8px] text-gray-400 block mb-0.5">Profile Avatar URL (Optional)</label>
                <input
                  type="url"
                  value={regProfileImg}
                  onChange={(e) => setRegProfileImg(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white text-xs border border-gray-200 px-2 py-1.5 outline-none font-mono lowercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[8px] text-gray-400 block mb-0.5">Password</label>
                <input
                  type="password"
                  required
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  className="w-full bg-white text-xs border border-gray-200 px-3 py-1.5 outline-none"
                />
              </div>
              <div>
                <label className="text-[8px] text-gray-400 block mb-0.5">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={regPassConf}
                  onChange={(e) => setRegPassConf(e.target.value)}
                  className="w-full bg-white text-xs border border-gray-200 px-3 py-1.5 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-gray-300 font-mono tracking-widest text-[10px] uppercase font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] bg-luxury-green hover:bg-luxury-lightgreen text-[#E2CC91] py-2.5 border border-luxury-gold/15 font-mono text-xs font-bold tracking-widest uppercase shadow cursor-pointer"
              >
                {isSubmitting ? "CREATING ACCOUNT..." : "CREATE PATRON ACCOUNT"}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
