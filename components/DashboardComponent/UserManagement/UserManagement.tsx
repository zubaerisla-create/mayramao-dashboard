// app/dashboard/users/page.tsx
"use client";

import { useState } from "react";
import { Eye, Ban, CheckCircle, X, Search } from "lucide-react";
import { useGetUsersQuery, useUpdateUserStatusMutation } from "@/lib/store/apiSlice";
import toast from 'react-hot-toast';

interface User {
  _id: string
  name: string
  email: string
  isActive?: boolean
  __v: number
  profile?: {
    _id: string
    userId: string
    createdAt: string
    updatedAt: string
    fullName?: string
    email?: string
    subscription?: {
      planId: string
      planName: string
      startedAt: string
      expiresAt: string
      isActive: boolean
    }
    lastLogin?: string
    totalSimulationsUsed?: number
  }
}

export default function UserManagement() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [userToToggle, setUserToToggle] = useState<User | null>(null);
  const [toggleAction, setToggleAction] = useState<'block' | 'unblock'>('block');
  const itemsPerPage = 10;

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

  // Update user status mutation (Block/Unblock)
  const [updateUserStatus, { isLoading: isUpdating }] = useUpdateUserStatusMutation();

  // Transform API users to match frontend User type
  const transformUser = (apiUser: any): User => {
    return {
      _id: apiUser._id,
      name: apiUser.name || '',
      email: apiUser.email || '',
      isActive: apiUser.isActive ?? true,
      __v: apiUser.__v || 0,
      profile: apiUser.profile ? {
        _id: apiUser.profile._id,
        userId: apiUser.profile.userId,
        createdAt: apiUser.profile.createdAt,
        updatedAt: apiUser.profile.updatedAt,
        fullName: apiUser.profile.fullName || apiUser.name,
        email: apiUser.profile.email || apiUser.email,
        subscription: apiUser.profile.subscription ? {
          planId: apiUser.profile.subscription.planId,
          planName: apiUser.profile.subscription.planName,
          startedAt: apiUser.profile.subscription.startedAt,
          expiresAt: apiUser.profile.subscription.expiresAt,
          isActive: apiUser.profile.subscription.isActive
        } : undefined,
        lastLogin: apiUser.profile.lastLogin,
        totalSimulationsUsed: apiUser.profile.totalSimulationsUsed
      } : undefined
    };
  };

  const users = usersData?.users?.map(transformUser) || [];

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.profile?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

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

  // Get user status based on isActive field
  const getUserStatus = (user: User): "Active" | "Blocked" => {
    return user.isActive === false ? "Blocked" : "Active";
  };

  // Get subscription type
  const getSubscriptionType = (user: User): "Free" | "Premium" => {
    return user.profile?.subscription?.isActive ? "Premium" : "Free";
  };

  // Open status confirmation modal
  const openStatusModal = (user: User, action: 'block' | 'unblock') => {
    setUserToToggle(user);
    setToggleAction(action);
    setShowStatusModal(true);
  };

  // Handle block/unblock user
  const handleToggleUserStatus = async () => {
    if (!userToToggle) return;
    
    const action = toggleAction;
    const newStatus = action === 'unblock'; // If unblocking, set to true; if blocking, set to false

    try {
      const response = await updateUserStatus({
        userId: userToToggle._id,
        isActive: newStatus
      }).unwrap();

      if (response.success) {
        toast.success(`User ${action}ed successfully!`);
        refetch();
        
        if (selectedUser?._id === userToToggle._id) {
          setSelectedUser(null);
        }
        
        setShowStatusModal(false);
        setUserToToggle(null);
      }
    } catch (err: any) {
      console.error('Update status error:', err);
      toast.error(err.data?.message || `Failed to ${action} user`);
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
      <div className="mx-auto max-w-9xl space-y-6">
        {/* Header with auto-refresh indicator */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[30px] font-bold text-gray-900">User Management</h1>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>live</span>
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-600">View and manage user accounts</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-xl border bg-white shadow-sm">
          {/* Search */}
          <div className="border-b px-6 py-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email, name or user ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
              />
            </div>
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
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => {
                    const status = getUserStatus(user);
                    const subscription = getSubscriptionType(user);
                    
                    return (
                      <tr key={user._id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          {user._id.slice(-8).toUpperCase()}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {user.email}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              status === "Active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${
                                status === "Active" ? "bg-green-500" : "bg-red-500"
                              }`}
                            />
                            {status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              subscription === "Premium"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {subscription}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {formatDate(user.profile?.createdAt)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              title="View details"
                              onClick={() => setSelectedUser(user)}
                              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
                              disabled={isUpdating}
                            >
                              <Eye size={18} />
                            </button>

                            {status === "Active" ? (
                              <button
                                title="Block user"
                                onClick={() => openStatusModal(user, 'block')}
                                className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 transition"
                                disabled={isUpdating}
                              >
                                <Ban size={18} />
                              </button>
                            ) : (
                              <button
                                title="Unblock user"
                                onClick={() => openStatusModal(user, 'unblock')}
                                className="rounded-lg p-1.5 text-green-600 hover:bg-green-50 hover:text-green-700 transition"
                                disabled={isUpdating}
                              >
                                <CheckCircle size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                      {searchQuery 
                        ? `No users found matching "${searchQuery}"` 
                        : "No users available"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div className="flex items-center justify-between border-t px-6 py-4">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-md border text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                >
                  ←
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium ${
                        currentPage === pageNum
                          ? "bg-emerald-600 text-white"
                          : "border hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-md border text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                >
                  →
                </button>
              </div>
            </div>
          )}
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
                disabled={isUpdating}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="font-medium text-gray-700">User ID</div>
                <div className="text-gray-900">{selectedUser._id}</div>

                <div className="font-medium text-gray-700">Name</div>
                <div className="text-gray-900">{selectedUser.profile?.fullName || selectedUser.name || '-'}</div>

                <div className="font-medium text-gray-700">Email</div>
                <div className="text-gray-900">{selectedUser.email}</div>

                <div className="font-medium text-gray-700">Account Status</div>
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      getUserStatus(selectedUser) === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        getUserStatus(selectedUser) === "Active" ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    {getUserStatus(selectedUser)}
                  </span>
                </div>

                <div className="font-medium text-gray-700">Subscription Type</div>
                <div>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      getSubscriptionType(selectedUser) === "Premium"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {getSubscriptionType(selectedUser)}
                  </span>
                </div>

                {selectedUser.profile?.subscription?.isActive && (
                  <>
                    <div className="font-medium text-gray-700">Plan Name</div>
                    <div className="text-gray-900">{selectedUser.profile.subscription.planName || '-'}</div>

                    <div className="font-medium text-gray-700">Started At</div>
                    <div className="text-gray-900">{formatDate(selectedUser.profile.subscription.startedAt)}</div>

                    <div className="font-medium text-gray-700">Expires At</div>
                    <div className="text-gray-900">{formatDate(selectedUser.profile.subscription.expiresAt)}</div>
                  </>
                )}

                <div className="font-medium text-gray-700">Signup Date</div>
                <div className="text-gray-900">{formatDate(selectedUser.profile?.createdAt)}</div>

                <div className="font-medium text-gray-700">Last Login</div>
                <div className="text-gray-900">{selectedUser.profile?.lastLogin || '-'}</div>

                <div className="font-medium text-gray-700">Total Simulations Used</div>
                <div className="text-gray-900">{selectedUser.profile?.totalSimulationsUsed || '-'}</div>
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

      {/* Status Change Confirmation Modal */}
      {showStatusModal && userToToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {toggleAction === 'block' ? 'Block User' : 'Unblock User'}
              </h2>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setUserToToggle(null);
                }}
                className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
                disabled={isUpdating}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className={`p-3 rounded-full ${
                  toggleAction === 'block' ? 'bg-red-100' : 'bg-green-100'
                }`}>
                  {toggleAction === 'block' ? (
                    <Ban size={32} className="text-red-600" />
                  ) : (
                    <CheckCircle size={32} className="text-green-600" />
                  )}
                </div>
              </div>
              
              <p className="text-center text-gray-700 mb-2">
                Are you sure you want to <span className="font-semibold">{toggleAction}</span> this user?
              </p>
              <p className="text-center text-sm text-gray-500 mb-6">
                User: <span className="font-medium">{userToToggle.email}</span>
              </p>
              
              {toggleAction === 'block' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                  <p className="text-sm text-yellow-800">
                    <span className="font-semibold">Warning:</span> Blocked users will not be able to access their account or use any services.
                  </p>
                </div>
              )}
              
              {toggleAction === 'unblock' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Note:</span> Unblocked users will regain full access to their account.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setUserToToggle(null);
                }}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                onClick={handleToggleUserStatus}
                disabled={isUpdating}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition flex items-center gap-2 ${
                  toggleAction === 'block' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{toggleAction === 'block' ? 'Block User' : 'Unblock User'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}