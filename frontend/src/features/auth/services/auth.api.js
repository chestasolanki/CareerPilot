import axios from 'axios'

const api=axios.create({
    baseURL: "http://localhost:3000",
    withCredentials:true
})

export async function register({username,email,password}){
    try {    
        const response=await api.post('/api/auth/register',{
            username,
            email,
            password
        })
        return response.data
    } catch(err) {
        const msg = err.response?.data?.message || err.message || "Registration request failed"
        console.error("Register API error:", msg)
        throw new Error(msg)
    }
}

export async function login({email,password}){
    try {
        const response=await api.post('/api/auth/login',{
            email,password
        })
        return response.data
    } catch(err) {
        const msg = err.response?.data?.message || err.message || "Login request failed"
        console.error("Login API error:", msg)
        throw new Error(msg)
    }
} 

export async function logout(){
    try {
        const response=await api.get('/api/auth/logout')
        return response.data
    } catch(err) {
        const msg = err.response?.data?.message || err.message || "Logout request failed"
        console.error("Logout API error:", msg)
        throw new Error(msg)
    }
}

export async function getMe(){
    try {
        const response=await api.get('/api/auth/get-me')
        return response.data
    } catch(err) {
        const msg = err.response?.data?.message || err.message || "GetMe request failed"
        console.error("GetMe API error:", msg)
        throw new Error(msg)
    }
}

