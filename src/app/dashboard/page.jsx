'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '../../components/ProtectedRoute'
import { getTodos, addTodo as addTodoAPI, deleteTodo, updateTodo, toggleTodoCompletion } from '../../services/todoServices'
import { MESSAGES } from '../../constants/messages'


const useAuth = () => {
  const [userId, setUserId] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId')
    const token = localStorage.getItem('token')

    if (storedUserId && token) {
      setUserId(storedUserId)
    } else {
      router.push('/') // Redirect if not logged in
    }
  }, [router])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    router.push('/')
  }

  return { userId, logout }
}


const useMessage = () => {
  const [message, setMessage] = useState({ text: '', type: '', show: false })

  const showMessage = (text, type = 'info', duration = 3000) => {
    setMessage({ text, type, show: true })
    setTimeout(() => setMessage({ text: '', type: '', show: false }), duration)
  }

  return { message, showMessage }
}

export default function Dashboard() {
  const { userId, logout } = useAuth()
  const { message, showMessage } = useMessage()
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isUrgent, setIsUrgent] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editIsUrgent, setEditIsUrgent] = useState(false)
  const [filter, setFilter] = useState('all')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showAddForm, setShowAddForm] = useState(false)

  
  const getStats = () => {
    if (!Array.isArray(todos)) return { total: 0, completed: 0, pending: 0, urgent: 0, completionRate: 0 }
    
    const total = todos.length
    const completed = todos.filter(todo => todo.completed === true).length
    const pending = todos.filter(todo => todo.completed === false).length
    const urgent = todos.filter(todo => todo.isUrgent === true && !todo.completed).length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    
    return { total, completed, pending, urgent, completionRate }
  }

  const stats = getStats()

 
  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return '🌅 Good Morning'
    if (hour < 17) return '☀️ Good Afternoon'
    return '🌙 Good Evening'
  }

  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])


  useEffect(() => {
    if (userId) fetchTodos()
  }, [userId])

  const fetchTodos = async () => {
    try {
      const response = await getTodos(userId)
      let todosData = response?.data?.todos || response?.data || []

      const storedUrgent = JSON.parse(localStorage.getItem('urgentTasks') || '[]')
      const todosWithUrgent = todosData.map(todo => ({
        ...todo,
        isUrgent: todo.isUrgent ?? storedUrgent.includes(todo._id || todo.id)
      }))

      setTodos(todosWithUrgent)
      showMessage(MESSAGES.TODOS_LOADED(todosWithUrgent.length), 'success', 2000)
    } catch (error) {
      console.error(error)
      showMessage('Failed to fetch todos. Please login again.', 'error')
    }
  }

  const addTodo = async () => {
    if (!title.trim() || !description.trim()) {
      showMessage(MESSAGES.VALIDATION_EMPTY, 'error')
      return
    }

    const todoData = { title, description, isUrgent, userId }

    try {
      const response = await addTodoAPI(todoData)
      const newTodo = response.data.todo || response.data

     
      if (newTodo.isUrgent) {
        const urgentTasks = JSON.parse(localStorage.getItem('urgentTasks') || '[]')
        const todoId = newTodo._id || newTodo.id
        if (!urgentTasks.includes(todoId)) {
          urgentTasks.push(todoId)
          localStorage.setItem('urgentTasks', JSON.stringify(urgentTasks))
        }
      }

      setTodos(prev => [...prev, { ...newTodo, isUrgent: newTodo.isUrgent ?? isUrgent }])
      showMessage(response.data.message || MESSAGES.TODO_ADDED, 'success')

      setTitle('')
      setDescription('')
      setIsUrgent(false)
    } catch (error) {
      console.error(error)
      showMessage(error.response?.data?.message || MESSAGES.ADD_TODO_ERROR, 'error')
    }
  }

  const updateTodoHandler = async (todoId) => {
    if (!editTitle.trim() || !editDescription.trim()) {
      showMessage(MESSAGES.VALIDATION_EMPTY, 'error')
      return
    }

    const updatedData = { title: editTitle, description: editDescription, isUrgent: editIsUrgent }

    try {
      await updateTodo(todoId, updatedData)

      
      const urgentTasks = JSON.parse(localStorage.getItem('urgentTasks') || '[]')
      const todoIndex = urgentTasks.indexOf(todoId)
      if (editIsUrgent && todoIndex === -1) urgentTasks.push(todoId)
      if (!editIsUrgent && todoIndex !== -1) urgentTasks.splice(todoIndex, 1)
      localStorage.setItem('urgentTasks', JSON.stringify(urgentTasks))

      setTodos(prev => prev.map(todo => (todo._id || todo.id) === todoId ? { ...todo, ...updatedData } : todo))
      cancelEdit()
      showMessage(MESSAGES.TODO_UPDATED, 'success')
    } catch (error) {
      console.error(error)
      showMessage(error.response?.data?.message || MESSAGES.UPDATE_TODO_ERROR, 'error')
    }
  }

  const toggleComplete = async (todoId, currentCompleted) => {
    try {
      await toggleTodoCompletion(todoId, !currentCompleted)
      setTodos(prev => prev.map(todo => (todo._id || todo.id) === todoId ? { ...todo, completed: !currentCompleted } : todo))
      showMessage(!currentCompleted ? MESSAGES.TODO_COMPLETED : MESSAGES.TODO_UNCOMPLETED, 'success')
    } catch (error) {
      console.error(error)
      showMessage(MESSAGES.TOGGLE_TODO_ERROR, 'error')
    }
  }

  const deleteTodoHandler = async (todoId) => {
    if (!confirm(MESSAGES.DELETE_CONFIRM)) return
    try {
      await deleteTodo(todoId)
      setTodos(prev => prev.filter(todo => (todo._id || todo.id) !== todoId))

      
      const urgentTasks = JSON.parse(localStorage.getItem('urgentTasks') || '[]')
      localStorage.setItem('urgentTasks', JSON.stringify(urgentTasks.filter(id => id !== todoId)))

      showMessage(MESSAGES.TODO_DELETED, 'success')
    } catch (error) {
      console.error(error)
      showMessage(MESSAGES.DELETE_TODO_ERROR, 'error')
    }
  }

  const startEdit = (todo) => {
    setEditingId(todo._id || todo.id)
    setEditTitle(todo.title)
    setEditDescription(todo.description)
    setEditIsUrgent(todo.isUrgent ?? false)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
    setEditDescription('')
    setEditIsUrgent(false)
  }

  const filteredTodos = todos.filter(todo => {
    if (filter === 'completed') return todo.completed
    if (filter === 'pending') return !todo.completed
    if (filter === 'urgent') return todo.isUrgent
    return true
  })

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: '#D2C1B6' }}>
        
        {message.show && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
            <div className={`max-w-md w-full mx-4 p-6 rounded-lg shadow-xl border-l-8 ${
              message.type === 'success' ? 'border-green-500' : 
              message.type === 'error' ? 'border-red-500' : 'border-blue-500'
            }`} style={{ backgroundColor: 'white' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    message.type === 'success' ? 'bg-green-500' : 
                    message.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  }`}>
                    {message.type === 'success' ? '✓' : message.type === 'error' ? '✕' : 'ℹ'}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${
                      message.type === 'success' ? 'text-green-800' : 
                      message.type === 'error' ? 'text-red-800' : 'text-blue-800'
                    }`}>
                      {message.type === 'success' ? 'Success!' : message.type === 'error' ? 'Error!' : 'Info'}
                    </h3>
                    <p className="text-sm text-gray-600">{message.text}</p>
                  </div>
                </div>
                <button onClick={() => setMessage({ text: '', type: '', show: false })} className="text-gray-400 hover:text-gray-600">×</button>
              </div>
            </div>
          </div>
        )}

       
        <div className="container mx-auto px-4 py-6">
         
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B3C53' }}>
                {getGreeting()}
              </h1>
              <p className="text-lg" style={{ color: '#456882' }}>
                Welcome to your To Do List
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="text-right">
                <p className="text-sm" style={{ color: '#456882' }}>
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-lg font-semibold" style={{ color: '#1B3C53' }}>
                  {currentTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-white"
                style={{ backgroundColor: '#1B3C53' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
           
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: '#1B3C53' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#456882' }}>Total Tasks</p>
                  <p className="text-3xl font-bold" style={{ color: '#1B3C53' }}>{stats.total}</p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: '#1B3C53' }}>
                  📋
                </div>
              </div>
            </div>

          
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#456882' }}>Completed</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
                  ✅
                </div>
              </div>
            </div>

            
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: '#234C6A' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#456882' }}>Pending</p>
                  <p className="text-3xl font-bold" style={{ color: '#234C6A' }}>{stats.pending}</p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: '#234C6A' }}>
                  ⏳
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#456882' }}>Urgent</p>
                  <p className="text-3xl font-bold text-red-600">{stats.urgent}</p>
                </div>
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white">
                  🔥
                </div>
              </div>
            </div>
          </div>

          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold" style={{ color: '#1B3C53' }}>Overall Progress</h3>
              <span className="text-sm font-medium" style={{ color: '#456882' }}>{stats.completionRate}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="h-3 rounded-full transition-all duration-300" style={{ backgroundColor: '#234C6A', width: `${stats.completionRate}%` }}></div>
            </div>
          </div>

          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: '#1B3C53' }}>Add New Task</h3>
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-3 py-1 rounded text-sm font-medium text-white transition-colors"
                    style={{ backgroundColor: showAddForm ? '#456882' : '#234C6A' }}
                  >
                    {showAddForm ? 'Hide' : 'Show'} Form
                  </button>
                </div>
                
                {showAddForm && (
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Task title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#456882' }}
                    />
                    <textarea
                      placeholder="Task description..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 resize-none"
                      style={{ borderColor: '#456882' }}
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="urgentTask"
                        checked={isUrgent}
                        onChange={(e) => setIsUrgent(e.target.checked)}
                        className="w-4 h-4 rounded"
                      />
                      <label htmlFor="urgentTask" className="text-sm font-medium" style={{ color: '#456882' }}>
                        🔥 Mark as urgent
                      </label>
                    </div>
                    <button
                      onClick={addTodo}
                      className="w-full py-3 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: '#1B3C53' }}
                    >
                      ➕ Add Task
                    </button>
                  </div>
                )}
              </div>
            </div>

           
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold" style={{ color: '#1B3C53' }}>Your Tasks</h3>
                  
                 
                  <div className="flex space-x-2">
                    {['all', 'pending', 'completed', 'urgent'].map((filterType) => (
                      <button
                        key={filterType}
                        onClick={() => setFilter(filterType)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          filter === filterType ? 'text-white' : 'hover:opacity-70'
                        }`}
                        style={{
                          backgroundColor: filter === filterType ? '#1B3C53' : 'transparent',
                          color: filter === filterType ? 'white' : '#456882',
                          border: `1px solid ${filter === filterType ? '#1B3C53' : '#456882'}`
                        }}
                      >
                        {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                        {filterType === 'all' && ` (${stats.total})`}
                        {filterType === 'pending' && ` (${stats.pending})`}
                        {filterType === 'completed' && ` (${stats.completed})`}
                        {filterType === 'urgent' && ` (${stats.urgent})`}
                      </button>
                    ))}
                  </div>
                </div>

              
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredTodos.length > 0 ? (
                    filteredTodos.map(todo => (
                      <div
                        key={todo._id || todo.id}
                        className={`p-4 rounded-lg border-l-4 ${
                          todo.isUrgent ? 'border-red-500 bg-red-50' : 
                          todo.completed ? 'border-green-500 bg-green-50' : 
                          'bg-gray-50'
                        }`}
                        style={{ 
                          borderLeftColor: todo.isUrgent ? '#ef4444' : 
                                          todo.completed ? '#10b981' : '#456882' 
                        }}
                      >
                        {editingId === (todo._id || todo.id) ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full p-2 border rounded"
                              style={{ borderColor: '#456882' }}
                            />
                            <textarea
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              className="w-full p-2 border rounded resize-none"
                              rows={2}
                              style={{ borderColor: '#456882' }}
                            />
                            <div className="flex items-center space-x-2 mb-2">
                              <input
                                type="checkbox"
                                checked={editIsUrgent}
                                onChange={(e) => setEditIsUrgent(e.target.checked)}
                                className="w-4 h-4"
                              />
                              <span className="text-sm" style={{ color: '#456882' }}>Mark as urgent</span>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => updateTodoHandler(todo._id || todo.id)}
                                className="px-3 py-1 rounded text-white text-sm"
                                style={{ backgroundColor: '#234C6A' }}
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="px-3 py-1 rounded text-white text-sm"
                                style={{ backgroundColor: '#456882' }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className={`font-semibold ${todo.completed ? 'line-through text-gray-500' : ''}`} 
                                    style={{ color: todo.completed ? '#6b7280' : '#1B3C53' }}>
                                  {todo.title}
                                </h4>
                                {todo.isUrgent && <span className="text-red-500">🔥</span>}
                                {todo.completed && <span className="text-green-500">✅</span>}
                              </div>
                              <p className={`text-sm ${todo.completed ? 'line-through text-gray-400' : ''}`}
                                 style={{ color: todo.completed ? '#9ca3af' : '#456882' }}>
                                {todo.description}
                              </p>
                            </div>
                            <div className="flex space-x-1 ml-4">
                              <button
                                onClick={() => toggleComplete(todo._id || todo.id, todo.completed)}
                                className={`p-2 rounded text-white text-sm ${
                                  todo.completed ? 'hover:opacity-80' : 'hover:opacity-90'
                                }`}
                                style={{ 
                                  backgroundColor: todo.completed ? '#456882' : '#10b981'
                                }}
                                title={todo.completed ? 'Mark as pending' : 'Mark as completed'}
                              >
                                {todo.completed ? '↩️' : '✓'}
                              </button>
                              <button
                                onClick={() => editTodo(todo)}
                                className="p-2 rounded text-white text-sm hover:opacity-90"
                                style={{ backgroundColor: '#234C6A' }}
                                title="Edit task"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => deleteTodoHandler(todo._id || todo.id)}
                                className="p-2 rounded text-white text-sm hover:opacity-90"
                                style={{ backgroundColor: '#ef4444' }}
                                title="Delete task"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">📝</div>
                      <h4 className="text-lg font-medium mb-2" style={{ color: '#1B3C53' }}>
                        No tasks found
                      </h4>
                      <p className="text-sm" style={{ color: '#456882' }}>
                        {filter === 'all' && 'Create your first task to get started!'}
                        {filter === 'completed' && 'Complete some tasks to see them here.'}
                        {filter === 'pending' && 'All your tasks are completed! 🎉'}
                        {filter === 'urgent' && 'Mark some tasks as urgent to see them here.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
