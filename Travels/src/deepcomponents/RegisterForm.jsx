import React, { useState } from 'react'
import axios from 'axios'

const RegisterForm = () => {
    const [form, setForm] = useState({
        username: '', email: '', password: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            try {
                const csrfResp = await axios.get('/api/csrf/', { withCredentials: true })
                if (csrfResp?.data?.csrfToken) {
                    axios.defaults.headers.common['X-CSRFToken'] = csrfResp.data.csrfToken
                }
            } catch {}
            await axios.post('/api/register/', form, { withCredentials: true })
            setMessage('Registration successful! You can now login.')
            setForm({ username: '', email: '', password: '' })
        } catch (error) {
            setMessage(
                "Registration failed: " +
                (error.response?.data?.username ||
                 error.response?.data?.email ||
                 error.message)
            )
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-bg flex items-center justify-center px-4">
            <div className="space-card max-w-md w-full p-8" id="regblock">
                <img src="https://www.shutterstock.com/image-vector/bus-ticket-online-pay-smart-600nw-2598472987.jpg"/>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                    Create a new account
                </h2>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-white">
                                Username
                            </label>
                            <input
                                name="username"
                                type="text"
                                placeholder="Enter your username"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                value={form.username}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-white">
                                Email
                            </label>
                            <input
                                name="email"
                                type="email"
                                placeholder="Enter your e-mail"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                value={form.email}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Password with Eye Button */}
                        <div>
                            <label className="block text-sm font-medium text-white">
                                Password
                            </label>

                            <div className="relative mt-1">
                                <input
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    required
                                    className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm"
                                    value={form.password}
                                    onChange={handleChange}
                                />

                                {/* 👁️ Eye Button */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-indigo-500"
                                    tabIndex={-1}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Message */}
                    {message && (
                        <div className={`rounded-md p-4 ${
                            message.includes('successful')
                                ? 'bg-green-50 text-green-800'
                                : 'bg-red-50 text-red-800'
                        }`}>
                            <p className="text-sm">{message}</p>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md font-medium disabled:opacity-50"
                    >
                        {isLoading ? 'Registering...' : 'Register'}
                    </button>
                    <p>Already have an account?
                        <a href="login"><u>Login</u></a>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default RegisterForm
