'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Check, Clock } from 'lucide-react';
import { StoreSettings } from '@/lib/api';

interface ContactViewProps {
  settings?: StoreSettings | null;
}

export default function ContactView({ settings }: ContactViewProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Order Inquiry',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.message) {
      setSubmitted(true);
    }
  };

  const phone = settings?.phone || '+855 12 345 678';
  const email = settings?.email || 'contact@mystyle.com';
  const address = settings?.address || 'Street 271, Sangkat TTP, Phnom Penh, Cambodia';
  const hours = settings?.businessHours || 'Mon - Sun: 08:00 AM - 09:00 PM';
  const storeName = settings?.storeName || 'My Style Boutique';

  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">
            Contact & Customer Support
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Have questions about orders, sizing, delivery, or returns? Get in touch with our store team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 flex items-start gap-4">
              <div className="p-2.5 bg-zinc-900 text-white rounded-lg shrink-0">
                <Phone className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Phone / Hotline</span>
                <p className="text-sm font-bold text-zinc-900 mt-0.5">{phone}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{hours}</p>
              </div>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 flex items-start gap-4">
              <div className="p-2.5 bg-zinc-900 text-white rounded-lg shrink-0">
                <Mail className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Email Address</span>
                <p className="text-sm font-bold text-zinc-900 mt-0.5">{email}</p>
                <p className="text-xs text-zinc-500 mt-0.5">We reply within 24 hours.</p>
              </div>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 flex items-start gap-4">
              <div className="p-2.5 bg-zinc-900 text-white rounded-lg shrink-0">
                <MapPin className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Store Location</span>
                <p className="text-sm font-bold text-zinc-900 mt-0.5">{address}</p>
                <p className="text-xs text-zinc-500 mt-0.5">Phnom Penh, Cambodia</p>
              </div>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 flex items-start gap-4">
              <div className="p-2.5 bg-zinc-900 text-white rounded-lg shrink-0">
                <Clock className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Business Hours</span>
                <p className="text-sm font-bold text-zinc-900 mt-0.5">{hours}</p>
                <p className="text-xs text-zinc-500 mt-0.5">Open every day for customer support and dispatch.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Message Form */}
          <div className="lg:col-span-7 bg-zinc-50 border border-zinc-200 rounded-xl p-6 sm:p-8">
            {submitted ? (
              <div className="text-center py-10 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900">Thank You, {formData.name}</h3>
                <p className="text-xs text-zinc-600 max-w-sm mx-auto">
                  Your message has been sent successfully. Our team will get back to you shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', subject: 'Order Inquiry', message: '' });
                  }}
                  className="mt-4 px-4 py-2 bg-zinc-900 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 transition"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-base font-bold text-zinc-900">Send Us a Message</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sokha Chan"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 012 345 678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. sokha@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                    >
                      <option value="Order Inquiry">Order Inquiry & Tracking</option>
                      <option value="Size & Fit Advice">Size & Fit Advice</option>
                      <option value="Product Availability">Product Availability</option>
                      <option value="Exchange or Return">Exchange or Return</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="How can we assist you?"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-white border border-zinc-300 rounded-lg p-3 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-zinc-900 text-white font-semibold text-xs rounded-lg hover:bg-zinc-800 transition"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
