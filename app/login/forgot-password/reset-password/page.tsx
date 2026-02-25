// app/admin/reset-password/page.tsx
'use client'

import Image from "next/image";
import Link from "next/link";
import { Mail, Lock, Eye, ArrowLeft, KeyRound } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useResetPasswordMutation, useResendOtpMutation } from "@/lib/store/apiSlice";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { clearResetState } from "@/lib/store/authSlice";
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { resetEmail } = useAppSelector((state) => state.auth);
  
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();
  
  const [formData, setFormData] = useState({
    email: resetEmail || '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(120);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  // CRITICAL FIX: Ensure OTP is handled as a string
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only digits, but keep as string
    const value = e.target.value.replace(/\D/g, '');
    setFormData({
      ...formData,
      otp: value, // This remains a string, not converted to number
    });
  };

  const handleResendOtp = async () => {
    if (!formData.email) {
      toast.error('Email is required');
      return;
    }

    try {
      const response = await resendOtp({ email: formData.email }).unwrap();
      
      if (response.success) {
        toast.success(response.message || 'OTP resent successfully!');
        setResendTimer(120);
      }
    } catch (err: any) {
      const errorMessage = err.data?.message || 'Failed to resend OTP';
      toast.error(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.otp || !formData.newPassword || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate OTP is exactly 6 digits
    if (formData.otp.length !== 6) {
      toast.error('OTP must be 6 digits');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      // CRITICAL FIX: Create payload that EXACTLY matches your working API test
      const payload = {
        email: formData.email,
        otp: formData.otp,           // Send as string, just like "710337" in your test
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      };

      console.log('Sending payload:', payload); // Debug: verify format in console

      const response = await resetPassword(payload).unwrap();

      if (response.success) {
        toast.success(response.message || 'Password reset successfully!');
        dispatch(clearResetState());
        
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Reset password error:', err);
      const errorMessage = err.data?.message || 'Failed to reset password';
      toast.error(errorMessage);
      
      // Clear OTP field on error for retry
      if (errorMessage.includes('Invalid OTP')) {
        setFormData(prev => ({ ...prev, otp: '' }));
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-[#1A2B4A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-lg overflow-hidden">
            <Image src="/logo.jpg" alt="Finova Logo" width={64} height={64} className="object-cover" />
          </div>
          <h1 className="text-2xl font-semibold text-white">Set New Password</h1>
          <p className="text-slate-400 text-sm mt-1">Enter OTP and create new password</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-xl font-medium text-white">Reset Password</h2>
            <p className="text-slate-400 text-sm mt-1">Please enter all the details below</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email (pre-filled) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-lg py-3 px-4 pl-11 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  placeholder="Enter your email"
                  required
                  readOnly={!!resetEmail}
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              </div>
            </div>

            {/* OTP - Fixed to handle as string */}
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-slate-300 mb-1.5">
                OTP Code
              </label>
              <div className="relative">
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={formData.otp}
                  onChange={handleOtpChange}
                  className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-lg py-3 px-4 pl-11 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  placeholder="Enter 6-digit OTP"
                  required
                />
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              </div>
              <p className="text-xs text-slate-400 mt-1">Enter the 6-digit code sent to your email</p>
            </div>

            {/* Resend OTP */}
            <div className="flex items-center justify-between">
              {resendTimer > 0 ? (
                <span className="text-slate-400 text-sm">
                  Resend OTP in {formatTime(resendTimer)}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium disabled:opacity-50"
                >
                  {isResending ? 'Sending...' : 'Resend OTP'}
                </button>
              )}
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-slate-300 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-lg py-3 px-4 pl-11 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-lg py-3 px-4 pl-11 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  placeholder="Confirm new password"
                  required
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Resetting...</span>
                </>
              ) : (
                <>
                  <span>Reset Password</span>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </>
              )}
            </button>

            {/* Back to Login */}
            <div className="text-center mt-4">
              <Link href="/login" className="inline-flex items-center text-slate-400 hover:text-white text-sm transition">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Sign In
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-8">
          © {new Date().getFullYear()} Finova. All rights reserved.
        </p>
      </div>
    </div>
  );
}