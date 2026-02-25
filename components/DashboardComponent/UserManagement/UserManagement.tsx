"use client"
import { useState } from "react";
import { Eye, Ban, CheckCircle, X } from "lucide-react";

type User = {
  id: string;
  email: string;
  status: "Active" | "Blocked";
  subscription: "Free" | "Premium";
  signupDate: string;
  lastLogin?: string;
  totalSimulationsUsed?: number;
};

const mockUsers: User[] = [
  { id: "USR-1001", email: "john.doe@email.com",     status: "Active",  subscription: "Premium", signupDate: "2024-01-15", lastLogin: "2026-02-05", totalSimulationsUsed: 47 },
  { id: "USR-1002", email: "sarah.smith@email.com",  status: "Active",  subscription: "Free",    signupDate: "2024-03-22" },
  { id: "USR-1003", email: "mike.johnson@email.com", status: "Blocked", subscription: "Free",    signupDate: "2023-11-08" },
  { id: "USR-1004", email: "emma.wilson@email.com",  status: "Active",  subscription: "Premium", signupDate: "2024-02-10" },
  { id: "USR-1005", email: "alex.brown@email.com",   status: "Active",  subscription: "Free",    signupDate: "2024-04-18" },
  { id: "USR-1006", email: "lisa.davis@email.com",   status: "Active",  subscription: "Premium", signupDate: "2023-09-30" },
  { id: "USR-1007", email: "tom.miller@email.com",   status: "Active",  subscription: "Free",    signupDate: "2024-05-12" },
  { id: "USR-1008", email: "rachel.moore@email.com", status: "Blocked", subscription: "Free",    signupDate: "2024-04-25" },
];

export default function UserManagement() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter users based on search query
  const filteredUsers = mockUsers.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-9xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-[30px] font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-600">View and manage user accounts</p>
        </div>

        {/* Card */}
        <div className="rounded-xl border bg-white shadow-sm">
          {/* Search */}
          <div className="border-b px-6 py-4">
            <input
              type="text"
              placeholder="Search by email or user ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">User ID</th>
                  <th className="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">Account Status</th>
                  <th className="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">Subscription</th>
                  <th className="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">Signup Date</th>
                  <th className="px-6 py-3.5 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {user.id}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            user.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.status === "Active" ? (
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                          ) : (
                            <span className="h-2 w-2 rounded-full bg-red-500" />
                          )}
                          {user.status}
                        </span>
                      </td>
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
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {user.signupDate}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            title="View details"
                            onClick={() => setSelectedUser(user)}
                            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
                          >
                            <Eye size={18} />
                          </button>

                          {user.status === "Active" ? (
                            <button
                              title="Block user"
                              className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 transition"
                            >
                              <Ban size={18} />
                            </button>
                          ) : (
                            <button
                              title="Unblock user"
                              className="rounded-lg p-1.5 text-green-600 hover:bg-green-50 hover:text-green-700 transition"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                      No users found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t px-6 py-4">
            <div className="text-sm text-gray-600">
              Showing {filteredUsers.length} of {mockUsers.length} users
            </div>
            <div className="flex items-center gap-1">
              <button className="flex h-9 w-9 items-center justify-center rounded-md border text-gray-500 hover:bg-gray-50 disabled:opacity-40">
                ←
              </button>

              {[1, 2, 3, "...", 10].map((page, i) => (
                <button
                  key={i}
                  className={`flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium ${
                    page === 1
                      ? "bg-indigo-600 text-white"
                      : "border hover:bg-gray-50 text-gray-700"
                  }`}
                  disabled={page === "..."}
                >
                  {page}
                </button>
              ))}

              <button className="flex h-9 w-9 items-center justify-center rounded-md border text-gray-500 hover:bg-gray-50">
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="font-medium text-gray-700">User ID</div>
                <div className="text-gray-900">{selectedUser.id}</div>

                <div className="font-medium text-gray-700">Email</div>
                <div className="text-gray-900">{selectedUser.email}</div>

                <div className="font-medium text-gray-700">Account Status</div>
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      selectedUser.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        selectedUser.status === "Active" ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    {selectedUser.status}
                  </span>
                </div>

                <div className="font-medium text-gray-700">Subscription Type</div>
                <div>
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

                <div className="font-medium text-gray-700">Signup Date</div>
                <div className="text-gray-900">{selectedUser.signupDate}</div>

                <div className="font-medium text-gray-700">Last Login</div>
                <div className="text-gray-900">
                  {selectedUser.lastLogin ?? "—"}
                </div>

                <div className="font-medium text-gray-700">Total Simulations Used</div>
                <div className="text-gray-900">
                  {selectedUser.totalSimulationsUsed ?? "—"}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t px-6 py-4">
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
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