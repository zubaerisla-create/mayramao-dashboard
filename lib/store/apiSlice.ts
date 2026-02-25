// lib/store/apiSlice.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from './store'

// Interfaces
interface LoginRequest {
  email: string
  password: string
}

interface ForgotPasswordRequest {
  email: string
}

interface ResetPasswordRequest {
  email: string
  otp: string
  newPassword: string
  confirmPassword: string
}

interface ResendOtpRequest {
  email: string
}

interface User {
  id: string
  email: string
  role: string
  is_user_info_complete: boolean
  is_profile_info_complete: boolean
  is_verified: boolean
}

interface LoginResponse {
  success: boolean
  message: string
  admin: User
  accessToken: string
  refreshToken: string
}

interface ForgotPasswordResponse {
  success: boolean
  message: string
}

interface ResetPasswordResponse {
  success: boolean
  message: string
}

interface ResendOtpResponse {
  success: boolean
  message: string
}


// Add these new interfaces
interface AdminProfileResponse {
  success: boolean
  admin: {
    _id: string
    email: string
    role: string
    isActive: boolean
    createdAt: string
    updatedAt: string
    __v: number
  }
}

interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface ChangePasswordResponse {
  success: boolean
  message: string
}

// Add these new interfaces for tickets
interface Ticket {
  _id: string
  userId: string
  userEmail: string
  subject: string
  status: 'new' | 'replied' | 'open' | 'closed'
  adminId: string | null
  adminTicketId: string
  reply: string
  ticketId: string
  dateSubmitted: string
  createdAt: string
  updatedAt: string
  closeAt: string | null
  __v: number
}

interface TicketsResponse {
  success: boolean
  tickets: Ticket[]
}

interface SingleTicketResponse {
  success: boolean
  ticket: Ticket
}

interface ReplyRequest {
  reply: string
}

interface ReplyResponse {
  success: boolean
  ticket: Ticket
}

// Add these new interfaces for subscriptions
interface Subscription {
  _id: string
  planName: string
  planType: 'monthly' | 'yearly' | 'forever'
  price: number
  duration: number // in days
    simulationsLimit?:  number
  simulationsUnlimited?: boolean
  features: string[]
  isActive: boolean
  activePlan: boolean
  createdAt: string
  updatedAt: string
}

interface SubscriptionsResponse {
  success: boolean
  subscriptions: Subscription[]
}

interface SubscriptionResponse {
  success: boolean
  subscription: Subscription
}

interface CreateSubscriptionRequest {
  planName: string
  planType: 'monthly' | 'yearly' | 'forever'
  price: number
  duration: number
   simulationsLimit?:  number  // Make optional
  // simulationsUnlimited?: boolean // Remove if not needed
  features: string[]
  activePlan: boolean
}

interface UpdateSubscriptionRequest {
  price?: number
  planName?: string
  planType?: string
  duration?: number
   simulationsLimit?:  number
  // simulationsUnlimited?: boolean // Remove if not needed
  features?: string[]
  activePlan?: boolean
}

interface UserProfile {
  _id: string
  userId: string
  __v: number
  createdAt: string
  currentSavings: number
  dependents: string[]
  existingLoans: boolean | number
  fixedExpenses: {
    rent: number
    utilities: number
    subscriptions?: number
    subscriptionsInsurance?: number
  }
  householdResponsibilityLevel: string
  incomeStability: string
  monthlyIncome: number
  riskTolerance: string
  totalMonthlyLoanPayments: number
  updatedAt: string
  variableExpenses?: number
  dateOfBirth?: string
  fullName?: string
  gender?: string
  email?: string
  goalDescription?: string
  planName?: string
  targetAmount?: number
  targetDate?: string
  profileImage?: string
  contact?: {
    fullName: string
    email: string
    description: string
  }
  subscription?: {
    planId: string
    planName: string
    startedAt: string
    expiresAt: string
    stripePaymentIntentId: string
    isActive: boolean
    stripeChargeId: string
    stripeCustomerId: string
    stripePriceId: string
    stripeSubscriptionId: string
  }
  purchaseSimulation?: {
    purchaseAmount: number
    paymentType: string
    loanDuration: number
    interestRate: number
  }
}


interface User {
  _id: string
  name: string
  email: string
  verified: boolean
  __v: number
  profile?: UserProfile
}

interface UsersResponse {
  success: boolean
  users: User[]
}

interface ExtendSubscriptionRequest {
  extraDays: number
}

interface ExtendSubscriptionResponse {
  success: boolean
  subscription: UserProfile['subscription']
}

interface DowngradeResponse {
  success: boolean
  message?: string
}

interface CancelResponse {
  success: boolean
  message?: string
}

// Add interface for update user status
interface UpdateUserStatusRequest {
  isActive: boolean
}

interface UpdateUserStatusResponse {
  success: boolean
  user: {
    id: string
    email: string
    isActive: boolean
  }
}


// Base query with CSRF token
const baseQuery = fetchBaseQuery({
  baseUrl: 'https://mayramao-backend-five.vercel.app',
  prepareHeaders: (headers, { getState }) => {
    const csrfToken = 'ZEoVg1VUNKpv7AZwD9GCZMK4kjWO7j5riRPX3uo7cUwcNrNxQxD6GAvPCPBL7Tuh'
    const token = (getState() as RootState).auth.accessToken
    
    if (csrfToken) {
      headers.set('X-CSRFTOKEN', csrfToken)
    }
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    
    headers.set('Content-Type', 'application/json')
    return headers
  },
})

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQuery,
  tagTypes:['Admin','Tickets', 'Subscriptions','Users'],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/api/v1/admin/login/',
        method: 'POST',
        body: credentials,
      }),
    }),

    // Get all subscriptions
    getSubscriptions: builder.query<SubscriptionsResponse, void>({
      query: () => ({
        url: '/api/v1/subscriptions',
        method: 'GET',
      }),
      providesTags: ['Subscriptions'],
    }),

    // Get single subscription by ID
    getSubscriptionById: builder.query<SubscriptionResponse, string>({
      query: (id) => ({
        url: `/api/v1/subscriptions/${id}`,
        method: 'GET',
      }),
      providesTags: ['Subscriptions'],
    }),

    // Create new subscription
    createSubscription: builder.mutation<SubscriptionResponse, CreateSubscriptionRequest>({
      query: (data) => ({
        url: '/api/v1/subscriptions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Subscriptions'],
    }),

    // Update subscription
    updateSubscription: builder.mutation<SubscriptionResponse, { id: string; data: UpdateSubscriptionRequest }>({
      query: ({ id, data }) => ({
        url: `/api/v1/subscriptions/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Subscriptions'],
    }),

    // Delete subscription
    deleteSubscription: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/api/v1/subscriptions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Subscriptions'],
    }),

    // Get all tickets
    getTickets: builder.query<TicketsResponse, void>({
      query: () => ({
        url: '/api/v1/tickets',
        method: 'GET',
      }),
      providesTags: ['Tickets'],
    }),
    
    // Get single ticket by ticketId
    getTicketById: builder.query<SingleTicketResponse, string>({
      query: (ticketId) => ({
        url: `/api/v1/tickets/${ticketId}`,
        method: 'GET',
      }),
      providesTags: ['Tickets'],
    }),

    // Reply to a ticket
    replyToTicket: builder.mutation<ReplyResponse, { ticketId: string; reply: string }>({
      query: ({ ticketId, reply }) => ({
        url: `/api/v1/tickets/${ticketId}/reply`,
        method: 'PUT',
        body: { reply },
      }),
      invalidatesTags: ['Tickets'],
    }),

    // Get admin profile by ID
    getAdminProfile: builder.query<AdminProfileResponse, string>({
      query: (adminId) => ({
        url: `/api/v1/admin/admins/${adminId}`,
        method: 'GET',
      }),
      providesTags: ['Admin'],
    }),
    
    // Change password
    changePassword: builder.mutation<ChangePasswordResponse, ChangePasswordRequest>({
      query: (data) => ({
        url: '/api/v1/admin/change-password',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Admin'],
    }),

    // Get all users with their subscription data
    getUsers: builder.query<UsersResponse, void>({
      query: () => ({
        url: '/api/v1/admin/users',
        method: 'GET',
      }),
      providesTags: ['Users'],
    }),

    // FIXED: Update user status (Block/Unblock)
    updateUserStatus: builder.mutation<UpdateUserStatusResponse, { userId: string; isActive: boolean }>({
      query: ({ userId, isActive }) => ({
        url: `/api/v1/admin/users/${userId}`,
        method: 'PUT',
        body: { isActive },
      }),
      invalidatesTags: ['Users'],
    }),

    // Extend user subscription
    extendSubscription: builder.mutation<ExtendSubscriptionResponse, { userId: string; extraDays: number }>({
      query: ({ userId, extraDays }) => ({
        url: `/api/v1/admin/users/${userId}/subscription/extend`,
        method: 'PUT',
        body: { extraDays },
      }),
      invalidatesTags: ['Users'],
    }),

    // Downgrade user subscription to free
    downgradeSubscription: builder.mutation<DowngradeResponse, string>({
      query: (userId) => ({
        url: `/api/v1/admin/users/${userId}/subscription/downgrade`,
        method: 'PUT',
      }),
      invalidatesTags: ['Users'],
    }),

    // Cancel user subscription
    cancelSubscription: builder.mutation<CancelResponse, string>({
      query: (userId) => ({
        url: `/api/v1/admin/users/${userId}/subscription/cancel`,
        method: 'PUT',
      }),
      invalidatesTags: ['Users'],
    }),

    forgotPassword: builder.mutation<ForgotPasswordResponse, ForgotPasswordRequest>({
      query: (data) => ({
        url: '/api/v1/admin/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),
    
    resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordRequest>({
      query: (data) => ({
        url: '/api/v1/admin/reset-password',
        method: 'POST',
        body: {
          email: data.email,
          otp: data.otp,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        },
      }),
    }),

    resendOtp: builder.mutation<ResendOtpResponse, ResendOtpRequest>({
      query: (data) => ({
        url: '/api/v1/admin/resend-otp',
        method: 'POST',
        body: data,
      }),
    }),
  }),
})

export const {
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useResendOtpMutation,
  useGetAdminProfileQuery,
  useChangePasswordMutation,
  useGetTicketsQuery,
  useGetTicketByIdQuery,
  useReplyToTicketMutation,
  useGetSubscriptionsQuery,
  useGetSubscriptionByIdQuery,
  useCreateSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useDeleteSubscriptionMutation,
  useGetUsersQuery,
  useExtendSubscriptionMutation,
  useDowngradeSubscriptionMutation,
  useCancelSubscriptionMutation,
  useUpdateUserStatusMutation, // This is now properly defined
} = api