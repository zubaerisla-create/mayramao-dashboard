import UserSubscription from '@/components/DashboardComponent/UserSubscription/UserSubscription'
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute'
import React from 'react'

const page = () => {
  return (
    <div>
        <ProtectedRoute>
          <UserSubscription/>
        </ProtectedRoute>
    </div>
  )
}

export default page