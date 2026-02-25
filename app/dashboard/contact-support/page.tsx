import ContactSupport from '@/components/DashboardComponent/ContactSupport/ContactSupport'
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute'
import React from 'react'

const page = () => {
  return (
    <div>
      <ProtectedRoute>
          <ContactSupport/>
      </ProtectedRoute>
    </div>
  )
}

export default page