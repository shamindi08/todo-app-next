import api from "./api";

export const registerUser = async (userData) => {
    return await api.post('auth/register', userData)

};
export const loginUser = async (credentials) => {
    return await api.post('auth/login', credentials);
}
export const getUserProfile = async (id) => {
    return await api.get(`users/${id}`);
};
export const updateUserProfile = async (id, updatedData) => {
    return await api.put(`users/${id}`, updatedData);
};