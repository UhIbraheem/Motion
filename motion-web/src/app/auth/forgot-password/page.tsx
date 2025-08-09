"use client";

import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      const redirectUrl =
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000/auth/callback?type=recovery"
          : `${window.location.origin}/auth/callback?type=recovery`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-sage-50 via-white to-gold-50 p-4">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-lg shadow-2xl rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold text-[#3c7660] mb-2">Check your email</h1>
          <p className="text-[#4d987b] mb-6">We sent a password reset link to {email}</p>
          <Link href="/auth/signin" className="text-[#3c7660] hover:underline font-medium">
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-sage-50 via-white to-gold-50 p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-lg shadow-2xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-[#3c7660] mb-2">Forgot password</h1>
        <p className="text-[#4d987b] mb-6">Enter your email and we’ll send you a reset link.</p>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#3c7660]"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3c7660] hover:bg-[#2d5a48] text-white rounded px-3 py-3 font-medium disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
        <div className="mt-6 text-center text-sm">
          <Link href="/auth/signin" className="text-[#3c7660] hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
