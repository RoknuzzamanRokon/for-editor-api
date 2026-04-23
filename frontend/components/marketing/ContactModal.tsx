"use client";

import { useState } from "react";
import { useMarketingTheme } from "@/config/marketingTheme";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
}

export default function ContactModal({ isOpen, onClose, planName }: ContactModalProps) {
  const { theme: t } = useMarketingTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: { name?: string; email?: string; phone?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitted(true);
  };

  const handleClose = () => {
    setName("");
    setEmail("");
    setPhone("");
    setErrors({});
    setSubmitted(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: "rgba(2,6,23,0.75)" }}
      />
      
      <div
        className="relative w-full max-w-md rounded-3xl border p-8 shadow-2xl"
        style={{
          background: t.card,
          borderColor: t.border,
          boxShadow: t.elevatedCardShadow,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
          style={{ color: t.textMuted }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${t.primary}18`;
            e.currentTarget.style.color = t.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = t.textMuted;
          }}
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {!submitted ? (
          <>
            <h2
              className="text-2xl font-black"
              style={{ color: t.heading }}
            >
              Contact for {planName} Plan
            </h2>
            <p
              className="mt-3 text-sm leading-relaxed"
              style={{ color: t.text }}
            >
              Submit your details and our super admin will contact you to discuss {planName} plan access and pricing.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-sm font-semibold mb-2"
                  style={{ color: t.heading }}
                >
                  Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none"
                  style={{
                    background: t.surface,
                    borderColor: errors.name ? t.error : t.border,
                    color: t.heading,
                  }}
                  placeholder="Your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-xs" style={{ color: t.error }}>
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-sm font-semibold mb-2"
                  style={{ color: t.heading }}
                >
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none"
                  style={{
                    background: t.surface,
                    borderColor: errors.email ? t.error : t.border,
                    color: t.heading,
                  }}
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs" style={{ color: t.error }}>
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contact-phone"
                  className="block text-sm font-semibold mb-2"
                  style={{ color: t.heading }}
                >
                  Phone Number
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none"
                  style={{
                    background: t.surface,
                    borderColor: errors.phone ? t.error : t.border,
                    color: t.heading,
                  }}
                  placeholder="+1 (555) 000-0000"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs" style={{ color: t.error }}>
                    {errors.phone}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full rounded-xl py-3 text-sm font-bold transition-all hover:opacity-90"
                style={{
                  background: t.buttonBg,
                  color: t.buttonText,
                  boxShadow: t.actionShadow,
                }}
              >
                Submit Contact Request
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-4"
              style={{ background: `${t.success}18`, color: t.success }}
            >
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <h3
              className="text-xl font-black mb-2"
              style={{ color: t.heading }}
            >
              Request Submitted
            </h3>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: t.text }}
            >
              Thank you for your interest in the {planName} plan. Our super admin will review your request and contact you shortly.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border px-6 py-2.5 text-sm font-bold transition-all hover:opacity-90"
              style={{
                background: t.surface,
                color: t.text,
                borderColor: t.border,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = t.buttonBg;
                e.currentTarget.style.color = t.buttonText;
                e.currentTarget.style.borderColor = t.buttonBg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = t.surface;
                e.currentTarget.style.color = t.text;
                e.currentTarget.style.borderColor = t.border;
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
