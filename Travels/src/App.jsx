import React, { useState, useEffect } from 'react'
import RegisterForm from './deepcomponents/RegisterForm'
import axios from 'axios'
import { Routes, Route } from 'react-router-dom'
import LoginForm from './deepcomponents/LoginForm'
import BusList from './deepcomponents/BusList'
import BusSeats from './deepcomponents/BusSeats'
import UserBookings from './deepcomponents/UserBookings'
import Wrapper from './deepcomponents/Wrapper'
import Contact from "./deepcomponents/Contact";
import About from "./deepcomponents/About";
import { Navigate } from 'react-router-dom'


const App = () => {
  const [userId, setUserId] = useState(null)

  const handleLogin = (userId) => {
    setUserId(userId)
  }

  const handleLogout = async () => {
    // attempt server-side logout (optional)
    try { await axios.post('/api/logout/', {}, { withCredentials: true }) } catch (e) {}
    setUserId(null)
  }

  useEffect(() => {
    // ensure axios sends cookies for session auth
    axios.defaults.withCredentials = true
    axios.defaults.xsrfCookieName = 'csrftoken'
    axios.defaults.xsrfHeaderName = 'X-CSRFToken'
  }, [])

  return (
    <div>
      <Wrapper userId={userId} handleLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Navigate to="/buses" replace />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />

          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />

          <Route path="/buses" element={<BusList userId={userId} />} />
          <Route path="/bus/:busId" element={<BusSeats userId={userId} />} />
          <Route path="/my-bookings" element={<UserBookings userId={userId} />} />
        </Routes>
      </Wrapper>
    </div>
  );
};

export default App;
