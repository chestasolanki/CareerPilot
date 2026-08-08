import React, { useState } from 'react'
import "../auth.form.scss"
import { useNavigate,Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'




const Login = () => {

    const navigate = useNavigate();

    const {loading,handleLogin}=useAuth()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await handleLogin({ email, password });
        if (res.success) {
            navigate('/');
        } else {
            alert(res.error || "Login failed! Please check your credentials.");
        }
    };

    if(loading){
        return (<main><h1>Loading....</h1></main>)
    }
  return (
    <main className='auth-page'>
        <div className='form-container'>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <div className='input-group'>

                <label htmlFor='email'>Email: </label>
                <input 
                id='email'
                onChange={(e)=>{
                    setEmail(e.target.value)
                }}
                type='email' placeholder='Enter email address'/>
                
                <label htmlFor='password'>Password: </label> 
                <input
                id='password'
                onChange={(e)=>{
                    setPassword(e.target.value)
                }}
                 type='password' placeholder='Enter password'/>
                </div>
                <button className='button primary-button'>Login</button>
            </form>
            <p>Don't have an account? <Link to={'/register'}>Register</Link></p>
        </div>
    </main>
  )
}

export default Login