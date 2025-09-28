import api from "./api";
export const addTodo = async (todoData) => {
    return await api.post('/todos/', todoData);
}
export const getTodos = async (userId) => {
    
    console.log('Attempting to fetch todos with different API patterns...')
    
    try {
        
        console.log('🔄 Trying: /todos?userId=' + userId)
        return await api.get(`/todos?userId=${userId}`);
    } catch (error1) {
        console.log('❌ Query parameter approach failed:', error1.response?.status)
        
        try {
           
            console.log('🔄 Trying: /todos/' + userId)
            return await api.get(`/todos/${userId}`);
        } catch (error2) {
            console.log(' Path parameter approach failed:', error2.response?.status)
            
            try {
               
                console.log(' Trying: /todos (get all and filter)')
                const response = await api.get('/todos');
                
                
                if (response.data && Array.isArray(response.data)) {
                    const userTodos = response.data.filter(todo => 
                        todo.userId === userId || todo.user === userId || todo.user?._id === userId
                    );
                    return { ...response, data: userTodos };
                }
                return response;
            } catch (error3) {
                console.log(' All API approaches failed')
                
                throw error1;
            }
        }
    }
}
export const updateTodo = async (id, updatedData) => {
    return await api.put(`/todos/${id}`, updatedData);
}   
export const deleteTodo = async (id) => {
    return await api.delete(`/todos/${id}`);
}
export const toggleTodoCompletion = async (id, isCompleted) => {
    return await api.patch(`/todos/${id}/${isCompleted ? 'done' : 'undone'}`, {});
}