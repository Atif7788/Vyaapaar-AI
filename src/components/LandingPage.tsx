/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  TrendingUp, 
  Layers, 
  Cpu, 
  Lock, 
  CheckCircle, 
  Check, 
  ShoppingBag, 
  User, 
  Phone, 
  MapPin, 
  ArrowRight,
  ShieldAlert,
  BarChart2,
  Settings
} from "lucide-react";

interface LandingPageProps {
  onEnterApp: () => void;
}

export default function LandingPage({ onEnterApp }: LandingPageProps) {
  const [contactForm, setContactForm] = useState({ name: "", phone: "", shopType: "Grocery Store", message: "" });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.phone) return;
    setFormSubmitted(true);
    setTimeout(() => {
      setContactForm({ name: "", phone: "", shopType: "Grocery Store", message: "" });
    }, 4000);
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 selection:bg-indigo-500 selection:text-white">
      {/* Header Bar */}
      <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white p-2 rounded-xl shadow-md">
                <Layers className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
                Vyaapaar<span className="font-medium text-indigo-500">AI</span>
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <a href="#features" className="hidden md:inline-block text-sm font-medium text-slate-600 hover:text-indigo-600 transition">Features</a>
              <a href="#pricing" className="hidden md:inline-block text-sm font-medium text-slate-600 hover:text-indigo-600 transition">Pricing</a>
              <a href="#developers" className="hidden md:inline-block text-sm font-medium text-slate-600 hover:text-indigo-600 transition">Dev Spec</a>
              <button 
                onClick={onEnterApp}
                id="landing-btn-demo"
                className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition active:scale-95 rounded-xl shadow-md cursor-pointer"
              >
                Launch Dashboard Demo
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative py-12 md:py-20 lg:py-24 overflow-hidden bg-gradient-to-b from-indigo-50/50 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full">
              <Cpu className="w-3.5 h-3.5 animate-spin-slow" />
              AI-Powered Indian Shop Assistant
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
              Transform Your Local Shop into a <span className="text-indigo-600">Smart Store</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
              Tailored for Jodhpur's grocers, medical stores, and retail merchants. Automate sales billing (POS), monitor margin rates, check low-stock triggers, export tax audit sheets, and forecast demand weeks ahead using Gemini GenAI.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={onEnterApp}
                id="landing-btn-start"
                className="px-8 py-4 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition rounded-xl text-center shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                Access Smart Dashboard View
              </button>
              <a
                href="#contact"
                className="px-6 py-4 font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition rounded-xl text-center active:bg-slate-200"
              >
                Request Custom Callback
              </a>
            </div>
            
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200 text-slate-600">
              <div>
                <p className="text-2xl font-bold text-slate-900">₹4.5L+</p>
                <p className="text-xs">Avg Sales Processed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">2.4m</p>
                <p className="text-xs">Inventory Sync Time</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">96.8%</p>
                <p className="text-xs">Forecasting Precision</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 opacity-20 blur-xl"></div>
            <div className="relative bg-white p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4">
              {/* Mini Billing Showcase */}
              <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                <span className="text-xs font-mono text-indigo-500 tracking-wider">SECURE TRANSACTION</span>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">● SUCCESS</span>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-slate-400 font-medium">Billed to: Pooja Bhati (Shastri Nagar)</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Aashirvaad Atta 10kg</span>
                    <span className="font-mono">₹440.00</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Saras Fresh Milk 1L x 4</span>
                    <span className="font-mono">₹216.00</span>
                  </div>
                </div>
                <div className="border-t pt-2 mt-2 border-dashed border-slate-200 space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>GST (CGST+SGST Incl)</span>
                    <span className="font-mono">₹38.44</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-indigo-600 pt-1">
                    <span>Total Bill</span>
                    <span className="font-mono">₹656.00</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                <div className="flex items-center gap-1 text-xs font-medium text-amber-700">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Smart Low Stock Notification
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  <span className="font-semibold text-slate-800">Fortune Mustard Oil</span> is critically down to 6 bottles. Reorder recommended immediately.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={onEnterApp}
                  className="w-full text-center text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
                >
                  Verify interactive UI features →
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Local Shop Relevance / Core Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Engineered Specially for local Indian Retailers
            </h2>
            <p className="text-slate-600">
              Vyaapaar AI addresses the exact friction points faced by Jodhpur businessmen: GST billing paperwork, unrecorded credits, sudden stock exhaustion during festive seasons, and lack of clarity on monthly profitability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Modern POS Billing</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Lightning fast checkout flow which calculates CGST/SGST instantly. Integrates UPI payment confirmation shortcuts and supports single-click physical thermal slip exports with custom discount adjustments.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Intelligent Alert Guard</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Color-coded stock counts automatically light up red when inventory dips below safe reorder levels. Prevents vendor walkaways and lets you suggest restocking packages before clients can search elsewhere.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">AI Deep Forecasting</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Harness linear trajectory regression and Gemini intelligence server-side to predict local stock consumption. Know the recommended purchase volume to hold and forecast accurate out-of-stock calendars.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans suited for merchants */}
      <section id="pricing" className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Simple, Affordable Pricing
            </h2>
            <p className="text-slate-600">
              Perfect for sole proprietorships or scaling grocery hubs. Select the package that aligns with your shop scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Plan 1 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Shubh Aarambh</h3>
                <p className="text-xs text-slate-500">Perfect for single tiny scale stores</p>
                <div className="my-6">
                  <span className="text-3xl font-extrabold text-slate-900">₹0</span>
                  <span className="text-sm text-slate-500 font-medium"> / Free Trial</span>
                </div>
                <ul className="space-y-3.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Up to 50 Products
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Offline Sales Logging
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Manual low stock flags
                  </li>
                </ul>
              </div>
              <button onClick={onEnterApp} className="mt-8 w-full py-3 text-center text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition rounded-xl cursor-pointer">
                Start Trial Account
              </button>
            </div>

            {/* Plan 2 */}
            <div className="bg-white p-8 rounded-2xl border-2 border-indigo-600 shadow-md flex flex-col justify-between relative transform md:-translate-y-2">
              <div className="absolute top-0 right-10 transform -translate-y-1/2 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow">
                POPULAR FOR GROCERS
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Vyapaar Pro</h3>
                <p className="text-xs text-slate-500">Designed for established businesses</p>
                <div className="my-6">
                  <span className="text-3xl font-extrabold text-slate-900">₹499</span>
                  <span className="text-sm text-slate-500 font-medium"> / month</span>
                </div>
                <ul className="space-y-3.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Unlimited products & cataloging
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Full AI Demand Forecasting
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Integrated Gemini Core Insights
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    GST Tax & PDF invoice generation
                  </li>
                </ul>
              </div>
              <button onClick={onEnterApp} className="mt-8 w-full py-3 text-center text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition rounded-xl cursor-pointer shadow-md">
                Get Started
              </button>
            </div>

            {/* Plan 3 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Samraat Enterprise</h3>
                <p className="text-xs text-slate-500">For multi-outlet grocery chains</p>
                <div className="my-6">
                  <span className="text-3xl font-extrabold text-slate-900">₹1,499</span>
                  <span className="text-sm text-slate-500 font-medium"> / month</span>
                </div>
                <ul className="space-y-3.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Multi-location warehouse sync
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Dedicated Account Manager
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Custom API Integrations
                  </li>
                </ul>
              </div>
              <button onClick={onEnterApp} className="mt-8 w-full py-3 text-center text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition rounded-xl cursor-pointer">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Trusted by Local Bazaars
            </h2>
            <p className="text-slate-600">Read what local shopkeepers in Jodhpur say about us</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-neutral-50 border border-slate-100 space-y-4">
              <p className="text-sm italic text-slate-600 leading-relaxed">
                "Earlier, tracking expiry of Saras Milk packs and Amul Butter was chaotic. Now, with the reorder alerts and beautiful dashboard, we save up to 4,000 rupees a week in spoiled products."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                  SS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Sohan Singh</h4>
                  <p className="text-[10px] text-slate-500">Shree Balaji Groceries, Sardarpura</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-50 border border-slate-100 space-y-4">
              <p className="text-sm italic text-slate-600 leading-relaxed">
                "Dolo and Bettadine stocks are critical. In monsoon season, Jodhpur sees higher medical needs. The AI Forecasting predicted our Dolo stock-out exactly, allowing us to restock in time!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                  RP
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Dr. Ranjit Purohit</h4>
                  <p className="text-[10px] text-slate-500">Cactus Pharmaceuticals, Shastri Nagar</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-50 border border-slate-100 space-y-4">
              <p className="text-sm italic text-slate-600 leading-relaxed">
                "Classmate registers and premium ink pens sell heavily during final exams. Vyaapaar AI shows us weekend sales lifts, so we prepare bills in advance to avoid long student queues."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                  KG
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Kailash Gehlot</h4>
                  <p className="text-[10px] text-slate-500">Modern Stationery, Chopasni Industrial Area</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Contact Form */}
      <section id="contact" className="py-16 bg-slate-100 border-t border-slate-200">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Get a Demo for Your Store</h2>
          <p className="text-sm text-slate-600 mt-2">
            Leave your contact info and our field team in Jodhpur will visit your site, provide a robust retail scanner demo, and set up your tax registry.
          </p>

          <form onSubmit={handleContactSubmit} className="mt-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-md text-left space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Your Name</label>
              <input 
                type="text" 
                value={contactForm.name} 
                onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                required 
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition outline-none" 
                placeholder="e.g. Ramesh Chandra" 
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Mobile Number</label>
                <input 
                  type="text" 
                  value={contactForm.phone} 
                  required 
                  onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition outline-none" 
                  placeholder="e.g. +91 98290 XXXXX" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Store Category</label>
                <select 
                  value={contactForm.shopType}
                  onChange={e => setContactForm({ ...contactForm, shopType: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition outline-none"
                >
                  <option value="Grocery Store">Grocery Store</option>
                  <option value="Medical Store">Medical Store</option>
                  <option value="Stationery Shop">Stationery Shop</option>
                  <option value="Restaurant">Restaurant / Sweets</option>
                  <option value="Consumer Retail">Consumer Retail</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Additional Message</label>
              <textarea 
                rows={3} 
                value={contactForm.message}
                onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition outline-none" 
                placeholder="Describe your current software, billing challenges or requirement..."
              ></textarea>
            </div>

            {formSubmitted ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-center text-xs font-semibold">
                ✓ Callback Requested! Shree Balaji team will coordinate with Jodhpur Hub and contact you shortly.
              </div>
            ) : (
              <button 
                type="submit" 
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 transition text-white text-sm font-bold rounded-xl shadow cursor-pointer"
              >
                Submit Demo Request
              </button>
            )}
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500" />
            <span className="text-sm font-bold text-white">Vyaapaar AI — Sardarpura Jodhpur</span>
          </div>
          <p>© 2026 Vyaapaar Smart Systems Pvt Ltd. Built for Indian local merchants and retail businesses.</p>
        </div>
      </footer>
    </div>
  );
}
