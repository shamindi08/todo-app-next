'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { loginUser } from '../services/userServices'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      router.push('/dashboard')
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const credentials = {
        email,
        password
      }
      
      const response = await loginUser(credentials)
      
      // Save token to localStorage on successful login
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token)
        
        // Also store user data if available
        if (response.data.user) {
          console.log('User data received from login:', response.data.user)
          // Store user ID if available
          if (response.data.user._id || response.data.user.id) {
            const userId = response.data.user._id || response.data.user.id
            localStorage.setItem('userId', userId)
            console.log('Stored userId from login response:', userId)
          }
        }
        
        // Show success message
        setError('') // Clear any previous errors
        
        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        // No token received from server
        setError('Login successful but authentication token not received. Please try again.')
      }
      
    } catch (error) {
      // Suppress any console errors by catching them silently
      try {
        // Show user-friendly error messages instead of technical codes
        let friendlyMessage = 'Login failed. Please try again.'
        
        if (error.response?.status === 401) {
          friendlyMessage = 'Invalid email or password. Please check your credentials.'
        } else if (error.response?.status === 404) {
          friendlyMessage = 'Account not found. Please check your email or register first.'
        } else if (error.response?.status === 500) {
          friendlyMessage = 'Server error. Please try again later.'
        } else if (error.message?.toLowerCase().includes('network')) {
          friendlyMessage = 'Connection error. Please check your internet connection.'
        } else if (error.response?.data?.message) {
          // Only show backend message if it's user-friendly (doesn't contain technical terms)
          const backendMessage = error.response.data.message
          if (!backendMessage.includes('Error:') && !backendMessage.includes('Exception') && 
              !backendMessage.includes('Stack') && backendMessage.length < 100) {
            friendlyMessage = backendMessage
          }
        }
        
        setError(friendlyMessage)
      } catch (innerError) {
        // Even if error parsing fails, show generic message
        setError('Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#D2C1B6'}}>
      <form className="bg-white p-8 rounded shadow-md w-96" onSubmit={handleLogin}>
        <h1 className="text-2xl font-bold mb-6 text-center" style={{color: '#1B3C53'}}>Login</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-2 border rounded"
          style={{borderColor: '#456882'}}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-2 border rounded"
          style={{borderColor: '#456882'}}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button 
          type="submit" 
          disabled={loading}
          className="w-full text-white p-2 rounded hover:opacity-90 disabled:opacity-50"
          style={{backgroundColor: '#234C6A'}}
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>
        <div className="mt-4 text-center">
          <p className="mb-2" style={{color: '#456882'}}>Don't have an account?</p>
          <button 
            type="button" 
            onClick={() => router.push('/register')} 
            className="w-full text-white p-2 rounded hover:opacity-90"
            style={{backgroundColor: '#1B3C53'}}
          >
            Register
          </button>
        </div>
      </form>
    </div>
  )
}
