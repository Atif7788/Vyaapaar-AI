/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail 
} from "firebase/auth";
import { auth, isUserSeeded, seedNewUserWorkspace } from "../lib/firebase";
import { ShieldCheck, Sparkles, Store, Lock, Mail, ChevronRight, RefreshCw, Key } from "lucide-react";

interface AuthScreenProps {
  onAuthSuccess: (uid: string) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");
    setLoading(true);

    if (isForgot) {
      if (!email) {
        setErrorMsg("Please enter your registered email address.");
        setLoading(false);
        return;
      }
      try {
        await sendPasswordResetEmail(auth, email);
        setInfoMsg("A password reset link has been dispatched to your email address!");
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to submit password reset request.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!email || !password) {
      setErrorMsg("Please fill in all core credentials.");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        if (!businessName) {
          setErrorMsg("Please provide a name for your local shop/supermarket.");
          setLoading(false);
          return;
        }
        
        // 1. Create firebase auth user
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        
        // 2. Provision and seed user space synchronously with defaults
        await seedNewUserWorkspace(credential.user.uid, email, businessName);
        
        onAuthSuccess(credential.user.uid);
      } else {
        // Standard Sign In
        const credential = await signInWithEmailAndPassword(auth, email, password);
        
        // Double check if space has been seeded, otherwise seed default datasets
        const seeded = await isUserSeeded(credential.user.uid);
        if (!seeded) {
          await seedNewUserWorkspace(credential.user.uid, email, "Shree Balaji Wholesalers");
        }
        
        onAuthSuccess(credential.user.uid);
      }
    } catch (err: any) {
      let friendlyError = err.message;
      if (err.code === "auth/invalid-credential") {
        friendlyError = "Incorrect email address or password combination.";
      } else if (err.code === "auth/email-already-in-use") {
        friendlyError = "This email is already linked to another retail account.";
      } else if (err.code === "auth/weak-password") {
        friendlyError = "Security warning: Password must exceed 6 characters.";
      }
      setErrorMsg(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-[85vh] bg-[#F8FAFC] py-8 px-4 animate-fade-in">
      <div className="w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden">
        
        {/* Sleek Top Banner decoration */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6.5 text-center text-white relative">
          <div className="absolute top-3 right-3 bg-white/10 text-[9px] px-2 py-0.5 rounded font-mono font-bold tracking-widest uppercase">
            SECURED ENDPOINT
          </div>
          <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center mx-auto mb-3 shadow shadow-blue-900/40 border border-white/10">
            <Store className="w-5.5 h-5.5 text-white" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">VyaapaarAI Enterprise</h2>
          <p className="text-xs text-blue-100/90 font-medium mt-1">Smart Cloud Inventory & GST-POS Dashboard</p>
        </div>

        {/* Auth Body Forms UI */}
        <div className="p-6.5 sm:p-8 space-y-6">
          
          {/* Validation Indicators */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg text-xs font-semibold leading-relaxed">
              ⚠️ {errorMsg}
            </div>
          )}

          {infoMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg text-xs font-semibold leading-relaxed">
              📬 {infoMsg}
            </div>
          )}

          <div className="text-center">
            <h3 className="text-base font-bold text-slate-850">
              {isForgot ? "Recover Admin Account" : isSignUp ? "Register Store Administrator" : "Sign In to Store Dashboard"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isForgot 
                ? "Enter your email to obtain password reset triggers" 
                : "Manage isolated warehouses and sales margins securely"}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            
            {/* Input Shop Display Name (Sign Up only) */}
            {isSignUp && !isForgot && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Shop Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Store className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Shree Balaji Supermarket"
                    className="w-full pl-9.5 pr-4 py-2.2 text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-blue-500 outline-none rounded-lg transition"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@balaji-mart.com"
                  className="w-full pl-9.5 pr-4 py-2.2 text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-blue-500 outline-none rounded-lg transition"
                />
              </div>
            </div>

            {/* Password (Hidden during Forgot Reset flow) */}
            {!isForgot && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Security Password</label>
                  {!isSignUp && (
                    <button 
                      type="button"
                      onClick={() => { setIsForgot(true); setErrorMsg(""); setInfoMsg(""); }}
                      className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9.5 pr-4 py-2.2 text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-blue-500 outline-none rounded-lg transition"
                  />
                </div>
              </div>
            )}

            {/* Submit Action Block */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 transition text-white font-bold text-sm rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/10 mt-5 focus:ring-2 focus:ring-blue-500/20"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processing Transaction...
                </>
              ) : isForgot ? (
                <>
                  <Key className="w-4 h-4" />
                  Dispatched Password Reset Link
                </>
              ) : isSignUp ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Register Core Account
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Unlock Smart Dashboard
                </>
              )}
            </button>
          </form>

          {/* Toggle flows block */}
          <div className="border-t border-slate-150 pt-4 flex flex-col items-center gap-2 text-xs">
            {isForgot ? (
              <button
                onClick={() => { setIsForgot(false); setErrorMsg(""); setInfoMsg(""); }}
                className="text-blue-600 hover:underline font-semibold cursor-pointer"
              >
                Back to Sign In page
              </button>
            ) : (
              <div className="text-slate-500 text-center">
                {isSignUp ? "Already registered your local store?" : "Don't have a supermarket account yet?"}{" "}
                <button
                  onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(""); setInfoMsg(""); }}
                  className="font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  {isSignUp ? "Log In here" : "Sign Up free"}
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
