// app/admin/subscriptions/page.tsx
"use client";

import { useState } from "react";
import { Search, Crown, Users, ChevronLeft, ChevronRight, X, Calendar, ArrowDownToLine, Ban } from "lucide-react";

type Subscription = "Free" | "Premium";

interface UserSub {
  id: string;
  email: string;
  subscription: Subscription;
  startDate: string;
  expiryDate: string;
}

const mockData: UserSub[] = [
  { id: "USR-1001", email: "john.doe@email.com",     subscription: "Premium", startDate: "2024-01-15", expiryDate: "2026-01-15" },
  { id: "USR-1004", email: "emma.wilson@email.com",  subscription: "Premium", startDate: "2024-02-10", expiryDate: "2026-02-10" },
  { id: "USR-1006", email: "lisa.davis@email.com",   subscription: "Premium", startDate: "2023-09-30", expiryDate: "2025-09-30" },
  { id: "USR-1002", email: "sarah.smith@email.com",  subscription: "Free",    startDate: "-",       expiryDate: "-" },
  { id: "USR-1005", email: "alex.brown@email.com",   subscription: "Free",    startDate: "-",       expiryDate: "-" },
];

export default function SubscriptionsPage() {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserSub | null>(null);

  const premiumCount = mockData.filter((u) => u.subscription === "Premium").length;
  const freeCount = mockData.filter((u) => u.subscription === "Free").length;

  const filteredUsers = mockData.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-9xl space-y-8">
        {/* Title */}
        <div>
          <h1 className="text-[30px] font-bold text-gray-900">User Subscriptions</h1>
          <p className="mt-1.5 text-sm text-gray-600">
            Manage individual user subscription assignments
          </p>
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
                placeholder="Search by email or user ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Subscription</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Start Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Expiry Date</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{user.id}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.subscription === "Premium"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user.subscription}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{user.startDate}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{user.expiryDate}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="rounded-md bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination (static for now) */}
          <div className="flex items-center justify-between border-t px-6 py-4">
            <div className="hidden text-sm text-gray-600 sm:block">
              Showing 1–{filteredUsers.length} of {mockData.length} users
            </div>
            <div className="flex items-center gap-2">
              <button disabled className="flex h-9 w-9 items-center justify-center rounded border text-gray-400">
                <ChevronLeft size={16} />
              </button>
              <button className="h-9 w-9 rounded bg-indigo-600 text-sm font-medium text-white">1</button>
              <button className="h-9 w-9 rounded border text-gray-700 hover:bg-gray-50">2</button>
              <button className="h-9 w-9 rounded border text-gray-700 hover:bg-gray-50">3</button>
              <span className="px-2 text-gray-500">...</span>
              <button className="h-9 w-9 rounded border text-gray-700 hover:bg-gray-50">18</button>
              <button className="flex h-9 w-9 items-center justify-center rounded border text-gray-700 hover:bg-gray-50">
                <ChevronRight size={16} />
              </button>
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
                <p className="mt-0.5 text-sm text-gray-600">{selectedUser.email}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute right-4 top-4 rounded-full p-1 text-gray-500 hover:bg-gray-100"
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
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      selectedUser.subscription === "Premium"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {selectedUser.subscription}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Expires: {selectedUser.expiryDate === "-" ? "—" : selectedUser.expiryDate}
                </p>
              </div>

              {/* Extend */}
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
                      <select className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500">
                        <option>1 Month</option>
                        <option>3 Months</option>
                        <option>6 Months</option>
                        <option>12 Months</option>
                      </select>
                      <button className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition">
                        Extend
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Downgrade */}
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
                    <button className="mt-4 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                      Downgrade
                    </button>
                  </div>
                </div>
              </div>

              {/* Cancel */}
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
                    <button className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition">
                      Cancel Subscription
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 text-right">
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
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