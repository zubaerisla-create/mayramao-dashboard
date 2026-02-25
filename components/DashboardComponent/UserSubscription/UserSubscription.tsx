// app/dashboard/user-subscription/page.tsx
"use client";

import { useState } from "react";
import { Search, Crown, Users, ChevronLeft, ChevronRight, X, Calendar, ArrowDownToLine, Ban, Infinity } from "lucide-react";
import { useGetUsersQuery, useExtendSubscriptionMutation, useDowngradeSubscriptionMutation, useCancelSubscriptionMutation } from "@/lib/store/apiSlice";
import toast from 'react-hot-toast';

interface User {
  _id: string
  name: string
  email: string
  verified: boolean
  profile?: {
    subscription?: {
      planId: string
      planName: string
      startedAt: string
      expiresAt: string
      isActive: boolean
    }
  }
}

export default function SubscriptionsPage() {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [extendDays, setExtendDays] = useState("30");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch users with auto-refresh
  const { 
    data: usersData, 
    isLoading, 
    error,
    refetch 
  } = useGetUsersQuery(undefined, {
    pollingInterval: 10000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  // Mutations
  const [extendSubscription] = useExtendSubscriptionMutation();
  const [downgradeSubscription] = useDowngradeSubscriptionMutation();
  const [cancelSubscription] = useCancelSubscriptionMutation();

  // Calculate stats
  const premiumCount = usersData?.users?.filter(u => 
    u.profile?.subscription?.isActive === true
  ).length || 0;
  
  const freeCount = usersData?.users?.filter(u => 
    !u.profile?.subscription?.isActive
  ).length || 0;

  // Filter users based on search
  const filteredUsers = usersData?.users?.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u._id?.toLowerCase().includes(search.toLowerCase()) ||
      u.name?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Handle extend subscription
  const handleExtend = async () => {
    if (!selectedUser) return;
    
    const days = parseInt(extendDays);
    if (isNaN(days) || days <= 0) {
      toast.error('Please enter a valid number of days');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await extendSubscription({
        userId: selectedUser._id,
        extraDays: days
      }).unwrap();

      if (response.success) {
        toast.success(`Subscription extended by ${days} days successfully!`);
        refetch();
        setSelectedUser(null);
      }
    } catch (err: any) {
      console.error('Extend error:', err);
      toast.error(err.data?.message || 'Failed to extend subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle downgrade to free
  const handleDowngrade = async () => {
    if (!selectedUser) return;

    if (!confirm(`Are you sure you want to downgrade ${selectedUser.email} to Free plan?`)) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await downgradeSubscription(selectedUser._id).unwrap();

      if (response.success) {
        toast.success('User downgraded to Free plan successfully!');
        refetch();
        setSelectedUser(null);
      }
    } catch (err: any) {
      console.error('Downgrade error:', err);
      toast.error(err.data?.message || 'Failed to downgrade subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle cancel subscription
  const handleCancel = async () => {
    if (!selectedUser) return;

    if (!confirm(`Are you sure you want to cancel ${selectedUser.email}'s subscription immediately?`)) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await cancelSubscription(selectedUser._id).unwrap();

      if (response.success) {
        toast.success('Subscription cancelled successfully!');
        refetch();
        setSelectedUser(null);
      }
    } catch (err: any) {
      console.error('Cancel error:', err);
      toast.error(err.data?.message || 'Failed to cancel subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Failed to load users</div>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-9xl space-y-8">
        {/* Title with auto-refresh indicator */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[30px] font-bold text-gray-900">User Subscriptions</h1>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>live</span>
              </div>
            </div>
            <p className="mt-1.5 text-sm text-gray-600">
              Manage individual user subscription assignments
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-xl border bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm font-medium text-gray-500">Free Users</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{freeCount}</p>
            </div>
            <div className="rounded-full bg-gray-100 p-4">
              <Users className="h-7 w-7 text-gray-600" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm font-medium text-gray-500">Premium Users</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{premiumCount}</p>
            </div>
            <div className="rounded-full bg-amber-50 p-4">
              <Crown className="h-7 w-7 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          {/* Search */}
          <div className="border-b px-6 py-5">
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email or user ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Subscription</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Start Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Expiry Date</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {user._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {user.name || '-'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {user.profile?.subscription?.isActive ? (
                          <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800">
                            Premium
                            {user.profile.subscription.planName && ` - ${user.profile.subscription.planName}`}
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-700">
                            Free
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {formatDate(user.profile?.subscription?.startedAt)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {formatDate(user.profile?.subscription?.expiresAt)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      {search ? `No users found matching "${search}"` : "No users available"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination info */}
          <div className="flex items-center justify-between border-t px-6 py-4">
            <div className="text-sm text-gray-600">
              Showing {filteredUsers.length} of {usersData?.users?.length || 0} users
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────── */}
      {/*           MANAGE SUBSCRIPTION MODAL       */}
      {/* ──────────────────────────────────────── */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="relative flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Manage Subscription</h2>
                <p className="mt-0.5 text-sm text-gray-600">
                  {selectedUser.name ? `${selectedUser.name} - ` : ''}{selectedUser.email}
                </p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute right-4 top-4 rounded-full p-1 text-gray-500 hover:bg-gray-100"
                disabled={isProcessing}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Current Status */}
              <div className="rounded-lg bg-gray-50 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Current Status</span>
                  {selectedUser.profile?.subscription?.isActive ? (
                    <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800">
                      Premium
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-700">
                      Free
                    </span>
                  )}
                </div>
                {selectedUser.profile?.subscription?.isActive ? (
                  <>
                    <p className="mt-1 text-sm text-gray-600">
                      Plan: {selectedUser.profile.subscription.planName || 'Premium'}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Started: {formatDate(selectedUser.profile.subscription.startedAt)}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Expires: {formatDate(selectedUser.profile.subscription.expiresAt)}
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-gray-600">User is on Free plan</p>
                )}
              </div>

              {/* Extend - Only show for premium users */}
              {selectedUser.profile?.subscription?.isActive && (
                <div className="rounded-lg border p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-blue-100 p-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Extend Premium Duration</h3>
                      <p className="mt-0.5 text-sm text-gray-600">
                        Add more time to the current subscription
                      </p>

                      <div className="mt-4 flex items-center gap-3">
                        <select 
                          value={extendDays}
                          onChange={(e) => setExtendDays(e.target.value)}
                          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                          disabled={isProcessing}
                        >
                          <option value="30">1 Month (30 days)</option>
                          <option value="90">3 Months (90 days)</option>
                          <option value="180">6 Months (180 days)</option>
                          <option value="365">12 Months (365 days)</option>
                        </select>
                        <button
                          onClick={handleExtend}
                          disabled={isProcessing}
                          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? 'Processing...' : 'Extend'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Downgrade - Only show for premium users */}
              {selectedUser.profile?.subscription?.isActive && (
                <div className="rounded-lg border border-gray-200 p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-gray-100 p-2">
                      <ArrowDownToLine className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Downgrade to Free</h3>
                      <p className="mt-0.5 text-sm text-gray-600">
                        Remove Premium access and revert to Free plan
                      </p>
                      <button
                        onClick={handleDowngrade}
                        disabled={isProcessing}
                        className="mt-4 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? 'Processing...' : 'Downgrade to Free'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Cancel - Only show for premium users */}
              {selectedUser.profile?.subscription?.isActive && (
                <div className="rounded-lg border border-red-200 bg-red-50/40 p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-red-100 p-2">
                      <Ban className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-red-800">Cancel Subscription</h3>
                      <p className="mt-0.5 text-sm text-red-700">
                        Immediately cancel Premium access
                      </p>
                      <button
                        onClick={handleCancel}
                        disabled={isProcessing}
                        className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? 'Processing...' : 'Cancel Subscription'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Free user message */}
              {!selectedUser.profile?.subscription?.isActive && (
                <div className="rounded-lg bg-gray-50 p-5 text-center">
                  <p className="text-gray-600">This user is currently on the Free plan.</p>
                  <p className="text-sm text-gray-500 mt-2">No subscription actions available.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 text-right">
              <button
                onClick={() => setSelectedUser(null)}
                disabled={isProcessing}
                className="rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition disabled:opacity-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}