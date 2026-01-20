import React, { useState } from 'react'
import axios from 'axios'

const LoginForm = ({ onLogin }) => {
    const [form, setForm] = useState({
        username:'', password:''
    })
    const[ message, setMessage] = useState('')

    const handleChange =(e)=>{
        setForm({...form, [e.target.name]: e.target.value})
    }
const handleSubmit =async(e)=>{
    e.preventDefault()
    try {
    try {
        const csrfResp = await axios.get('/api/csrf/', { withCredentials: true })
        if (csrfResp?.data?.csrfToken) axios.defaults.headers.common['X-CSRFToken'] = csrfResp.data.csrfToken
    } catch (e) {}
    const response = await axios.post('/api/login/', form, { withCredentials: true })
        setMessage('Login Success')

        if (onLogin) {
            onLogin(response.data.user_id)
        }

    } catch (error) {
        setMessage('Login Failed')
    }

}
return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
            <label>Username</label>
            <input type="text" name='username' value={form.username} onChange={handleChange}/><br/>
            <label>password</label>
            <input type="password" name='password' value={form.password} onChange={handleChange}/><br/>
            <button type = 'Submit'>Login</button>
        {message && <p>{message}</p>}
        </div>

      </form>
    </div>
  )
}

export default LoginForm