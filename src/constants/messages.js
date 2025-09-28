// Customizable Messages - Edit these to change all app messages
export const MESSAGES = {
  // Success Messages
  TODO_ADDED: 'Todo added successfully! 🎉',
  TODO_UPDATED: 'Todo updated successfully! ✏️',
  TODO_DELETED: 'Todo deleted successfully! 🗑️',
  TODO_COMPLETED: 'Great job! Todo marked as completed! ✅',
  TODO_UNCOMPLETED: 'Todo marked as incomplete! ↩️',
  TODOS_LOADED: (count) => `Loaded ${count} todo${count === 1 ? '' : 's'} 📋`,
  
  // Error Messages  
  VALIDATION_EMPTY: 'Please fill in both title and description! 📝',
  ADD_TODO_ERROR: 'Failed to add todo. Please try again! ❌',
  UPDATE_TODO_ERROR: 'Failed to update todo. Please try again! ❌',
  DELETE_TODO_ERROR: 'Failed to delete todo. Please try again! ❌',
  TOGGLE_TODO_ERROR: 'Failed to update todo status. Please try again! ❌',
  FETCH_TODOS_ERROR: 'Failed to load todos. Please refresh the page! ❌',
  
  // Info Messages
  NO_TODOS: 'No todos yet. Create your first todo above! 💡',
  LOADING_TODOS: 'Loading your todos... ⏳',
  EDIT_MODE_ACTIVE: 'Click anywhere to edit this todo ✏️',
  
  // Confirmation Messages
  DELETE_CONFIRM: 'Are you sure you want to delete this todo? This action cannot be undone.',
  UNSAVED_CHANGES: 'You have unsaved changes. Are you sure you want to cancel?',
  
  // Custom Success Messages (you can add more here)
  WELCOME_BACK: 'Welcome back! Ready to be productive? 🚀',
  FIRST_TODO: 'Congratulations on creating your first todo! 🎊',
  ALL_COMPLETED: 'Amazing! You completed all your todos! 🏆',
  PRODUCTIVE_DAY: 'You\'re having a productive day! Keep it up! 💪',
  
  // Additional customizable messages
  NETWORK_ERROR: 'Network connection failed. Please check your internet! 🌐',
  SERVER_ERROR: 'Server is temporarily unavailable. Please try again later! ⚠️',
  UNAUTHORIZED: 'Session expired. Please login again! 🔐',
  PERMISSION_DENIED: 'You don\'t have permission to perform this action! 🚫',
  
  // Motivational messages
  MORNING_GREETING: 'Good morning! Let\'s make today productive! ☀️',
  EVENING_GREETING: 'Good evening! Wrapping up your day? 🌅',
  WEEKEND_MOTIVATION: 'Weekend productivity mode activated! 🎯',
  TASK_STREAK: (count) => `${count} todos completed in a row! You\'re on fire! 🔥`,
}

// You can also create different message themes
export const FORMAL_MESSAGES = {
  TODO_ADDED: 'Task has been successfully added to your list.',
  TODO_UPDATED: 'Task has been updated successfully.',
  TODO_DELETED: 'Task has been removed from your list.',
  TODO_COMPLETED: 'Task has been marked as completed.',
  TODO_UNCOMPLETED: 'Task has been marked as incomplete.',
  VALIDATION_EMPTY: 'Please ensure both title and description fields are completed.',
  // Add more formal versions...
}

export const CASUAL_MESSAGES = {
  TODO_ADDED: 'Sweet! New todo added! 🤘',
  TODO_UPDATED: 'Nice! Todo updated! 👍',
  TODO_DELETED: 'Boom! Todo deleted! 💥',
  TODO_COMPLETED: 'Awesome! One more down! 🎯',
  TODO_UNCOMPLETED: 'No worries, marked as incomplete! 👌',
  VALIDATION_EMPTY: 'Oops! Don\'t forget to fill everything out! 😅',
  // Add more casual versions...
}

// Export the default theme
export default MESSAGES