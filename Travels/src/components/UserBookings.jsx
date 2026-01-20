
import React, { useState, useEffect } from 'react'

const UserBookings = ({ userId }) => {
    const [bookings, setBookings] = useState([])
    const [bookingError, setBookingError] = useState(null)

useEffect(()=>{
    const fetchBookings = async()=>{
        if(!userId){
            return
        }
        try {
            const response = await fetch(`/api/user/${userId}/bookings/`, { credentials: 'include' })
            if (!response.ok) throw new Error('Failed to fetch bookings')
            const data = await response.json()
            setBookings(data)

        } catch (error) {
            console.log("fetching details failed", error)
            setBookingError(
                error.message
            )
        }
    }
    fetchBookings()
}, [userId])
    
  return (
    <div>
      {bookingError && <p className="text-red-500">{bookingError}</p>}
      {bookings.map((item)=>{
        return(
            <div key={item.id}>
                {item.user}-
                {item.bus?.route || item.bus}-
                {item.seat?.seat_number || item.seat}-
                {item.booking_time}
            </div>
        )
      })}
    </div>
  )
}

export default UserBookings
