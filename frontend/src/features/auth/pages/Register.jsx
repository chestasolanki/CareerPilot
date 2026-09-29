import React, { useState } from 'react'
import "../auth.form.scss"
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import PilotLogo from '../../../components/PilotLogo'

const Register = () => {
    const navigate = useNavigate()
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
     
    const { loading, handleRegister } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        const res = await handleRegister({ username, email, password })
        if (res.success) {
            navigate('/planner')
        } else {
            alert(res.error || "Registration failed! Please check your details.")
        }
    }

    if (loading) {
        return (
            <main className="auth-page">
                <div className="form-container" style={{ textAlign: 'center', alignItems: 'center' }}>
                    <p style={{ color: '#94a3b8' }}>Creating your account...</p>
                </div>
            </main>
        )
    }

    return (
        <main className='auth-page'>
            <div className='form-container'>
                <div className="auth-header">
                    <div className="logo-wrapper">
                        <PilotLogo size={42} showText={true} />
                    </div>
                    <h1>Create Your Account</h1>
                    <p className="subtitle">Get started with AI-driven career interview planning</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className='input-group'>
                        <div className="input-field">
                            <label htmlFor='username'>Full Name / Username</label>
                            <input 
                                id='username'
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                type='text' 
                                placeholder='e.g. Alex Morgan'
                                required
                            />
                        </div>

                        <div className="input-field">
                            <label htmlFor='email'>Email Address</label>
                            <input 
                                id='email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type='email' 
                                placeholder='name@company.com'
                                required
                            />
                        </div>
                        
                        <div className="input-field">
                            <label htmlFor='password'>Password</label> 
                            <input
                                id='password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                type='password' 
                                placeholder='Create a strong password'
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className='button accent-button' style={{ width: '100%', marginTop: '0.5rem' }}>
                        Create Account →
                    </button>
                </form>

                <p className="auth-footer-text">
                    Already have an account? <Link to={'/login'}>Sign in</Link>
                </p>
            </div>
        </main>
    )
}

export default Register