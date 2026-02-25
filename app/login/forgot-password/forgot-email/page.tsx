// app/admin/forgot-password/page.tsx
'use client'

import Image from "next/image";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForgotPasswordMutation } from "@/lib/store/apiSlice";
import { useAppDispatch } from "@/lib/store/hooks";
import { setResetEmail, setOtpSent } from "@/lib/store/authSlice";
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      const response = await forgotPassword({ email }).unwrap();
      
      if (response.success) {
        dispatch(setResetEmail(email));
        dispatch(setOtpSent(true));
        toast.success(response.message || 'OTP sent to your email!');
        router.push('/login/forgot-password/reset-password');
      }
    } catch (err: any) {
      const errorMessage = err.data?.message || 'Failed to send OTP. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A2B4A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-lg overflow-hidden">
            <Image src="/logo.jpg" alt="Finova Logo" width={64} height={64} className="object-cover" />
          </div>
          <h1 className="text-2xl font-semibold text-white">Reset Password</h1>
          <p className="text-slate-400 text-sm mt-1">Enter your email to receive OTP</p>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-xl font-medium text-white">Forgot Password?</h2>
            <p className="text-slate-400 text-sm mt-1">We'll send a verification code to your email</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-lg py-3 px-4 pl-11 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  placeholder="Enter your email"
                  required
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Sending OTP...</span>
                </>
              ) : (
                <>
                  <span>Send OTP</span>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </>
              )}
            </button>

            <div className="text-center mt-4">
              <Link href="/login" className="inline-flex items-center text-slate-400 hover:text-white text-sm transition">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Sign In
              </Link>
            </div>
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-8">
          © {new Date().getFullYear()} Finova. All rights reserved.
        </p>
      </div>
    </div>
  );
}