// app/dashboard/layout.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Home, Users, Settings, FileText, BarChart3, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute'
import { useAppDispatch } from '@/lib/store/hooks'
import { logout } from '@/lib/store/authSlice'
import toast from 'react-hot-toast'

const sidebarItems = [
  { name: 'Dashboard Overview', href: '/dashboard', icon: Home },
  { name: 'User Management', href: '/dashboard/users', icon: Users },
  { name: 'User Subscription', href: '/dashboard/user-subscription', icon: FileText },
  { name: 'Subscription Plans', href: '/dashboard/subscription-plans', icon: BarChart3 },
  { name: 'Contact & Support', href: '/dashboard/contact-support', icon: BarChart3 },
  { name: 'Admin Profile', href: '/dashboard/admin-profile', icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useAppDispatch()

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Logged out successfully')
    router.push('/login')
  }

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [pathname, isMobile])

  return (
    <div className="flex h-screen bg-[#F9FAFB]">
      {isMobile && !sidebarOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-[#1A2B4A] text-white rounded-lg shadow-lg lg:hidden"
        >
          <Menu size={24} />
        </motion.button>
      )}

      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={false}
        animate={{ 
          x: sidebarOpen ? 0 : (isMobile ? '-100%' : 0),
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-[#1A2B4A] shadow-xl lg:static lg:inset-0"
      >
        <div className="flex items-center justify-between h-16 px-6 bg-[#1A2B4A]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl font-semibold text-white">Finova Admin</h2>
            <p className="text-[#99A1AF] text-sm">Control Panel</p>
          </motion.div>
   
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-300 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          )}
        </div>
        
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="border-t border-[#10B981] border-opacity-30 origin-left"
        />
        
        <nav className="mt-6 h-[calc(100%-5rem)] overflow-y-auto pb-20">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 + 0.2 }}
              >
                <Link
                  href={item.href}
                  className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#10B981] text-white border-l-4 border-[#10B981]' 
                      : ''
                  }`}
                  onClick={() => isMobile && setSidebarOpen(false)}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="mr-4"
                  >
                    <Icon size={20} />
                  </motion.div>
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              </motion.div>
            )
          })}
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-4 left-0 right-0 px-4"
          >
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200 rounded-lg mx-2"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="mr-4"
              >
                <LogOut size={20} />
              </motion.div>
              <span className="text-sm font-medium">Logout</span>
            </button>
          </motion.div>
        </nav>
      </motion.div>

      <motion.div 
        className="flex-1 flex flex-col overflow-hidden"
        animate={{ 
          marginLeft: isMobile ? 0 : 0,
        }}
      >
        <motion.main 
          key={pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8"
        >
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 min-h-full">
            <ProtectedRoute>
              {children}
            </ProtectedRoute>
          </div>
        </motion.main>
      </motion.div>
    </div>
  )
}