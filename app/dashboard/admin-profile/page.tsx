import AdminProfile from '@/components/DashboardComponent/AdminProfile/AdminProfile'
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute'
import React from 'react'

const page = () => {
  return (
    <div>
      <ProtectedRoute>
          <AdminProfile/>
      </ProtectedRoute>
    </div>
  )
}

export default page