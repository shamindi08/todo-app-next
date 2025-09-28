'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const ProtectedRoute = ({ children }) => {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      
      const token = localStorage.getItem('token')
      
      if (token) {
        
        setIsAuthenticated(true)
      } else {
        
        router.push('/')
        return
      }
      
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#D2C1B6'}}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 mb-4" style={{borderColor: '#1B3C53'}}></div>
          <p className="text-lg font-medium" style={{color: '#1B3C53'}}>Verifying authentication...</p>
        </div>
      </div>
    )
  }


  return isAuthenticated ? children : null
}

export default ProtectedRoute