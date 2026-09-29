import React, { useState } from 'react'
import "../auth.form.scss"
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import PilotLogo from '../../../components/PilotLogo'

const Login = () => {
    const navigate = useNavigate()
    const { loading, handleLogin } = useAuth()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        const res = await handleLogin({ email, password })
        if (res.success) {
            navigate('/planner')
        } else {
            alert(res.error || "Login failed! Please check your credentials.")
        }
    }

    if (loading) {
        return (
            <main className="auth-page">
                <div className="form-container" style={{ textAlign: 'center', alignItems: 'center' }}>
                    <p style={{ color: '#94a3b8' }}>Authenticating...</p>
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
                    <h1>Welcome Back</h1>
                    <p className="subtitle">Sign in to access your interview preparation dashboard</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className='input-group'>
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
                                placeholder='••••••••'
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className='button accent-button' style={{ width: '100%', marginTop: '0.5rem' }}>
                        Sign In →
                    </button>
                </form>

                <p className="auth-footer-text">
                    Don't have an account? <Link to={'/register'}>Register now</Link>
                </p>
            </div>
        </main>
    )
}

export default Login