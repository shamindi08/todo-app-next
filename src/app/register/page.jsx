'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { registerUser } from '../../services/userServices'

export default function Register() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }
    
    try {
      const userData = {
        userName,
        email,
        password,
        phone
      }
      
      const response = await registerUser(userData)
      
      alert('Registration successful! Please login.')
      router.push('/')
    } catch (error) {
      alert(error.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#D2C1B6'}}>
      <form className="bg-white p-8 rounded shadow-md w-96" onSubmit={handleRegister}>
        <h1 className="text-2xl font-bold mb-6 text-center" style={{color: '#1B3C53'}}>Register</h1>
        
        <input
          type="text"
          placeholder="User Name"
          className="w-full mb-4 p-2 border rounded"
          style={{borderColor: '#456882'}}
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          required
        />
        
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
          type="tel"
          placeholder="Phone Number"
          className="w-full mb-4 p-2 border rounded"
          style={{borderColor: '#456882'}}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
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
        
        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full mb-4 p-2 border rounded"
          style={{borderColor: '#456882'}}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        
        <button 
          type="submit" 
          className="w-full text-white p-2 rounded hover:opacity-90"
          style={{backgroundColor: '#234C6A'}}
        >
          Register
        </button>
        
        <div className="mt-4 text-center">
          <p className="mb-2" style={{color: '#456882'}}>Already have an account?</p>
          <button 
            type="button" 
            onClick={() => router.push('/')} 
            className="w-full text-white p-2 rounded hover:opacity-90"
            style={{backgroundColor: '#1B3C53'}}
          >
            Back to Login
          </button>
        </div>
      </form>
    </div>
  )
}
