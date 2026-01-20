import axios from 'axios'
import React, {useState, useEffect} from 'react'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'


const BusSeats = ({ userId }) => {
    const [bus, setBus] = useState(null)
    const [seats, setSeats] = useState([])

    const { busId } = useParams()
    const navigate = useNavigate()

    console.log('Checking bus id number=', busId)

    useEffect(()=>{
        const fetchBusDetails = async()=>{
            try {
                const response = await axios.get(`/api/buses/${busId}`, { withCredentials: true })
                setBus(response.data)
                setSeats(response.data.seats || [])
            } catch (error) {
                console.error('Error in fetching details', error)
            }
        }
        fetchBusDetails()
    }, [busId])

        const handleBook = async(seatId)=>{
        if(!userId){
            alert("Please login for booking a seat")
            navigate('/login')
            return;
        }
        try {
                        const response = await axios.post(`/api/booking/`, { seat: seatId }, { withCredentials: true })
            alert("Booking Successful")
            setSeats((prevSeats) => 
                                prevSeats.map((seat) => {
                                    const id = seat.id ?? seat.pk
                                    return id === seatId ? { ...seat, is_booked: true } : seat
                                })
                            )
              
            
        } catch (error) {
                        console.error('Booking error', error)
                        alert(error.response?.data?.error || error.response?.data?.detail || "Booking failed")
        }
    }

  return (
    <div>
        {bus && (
            <div>
                <div>{bus.bus_name}</div>
                <div>{bus.number}</div>
                <div>{bus.origin}</div>
                <div>{bus.destination}</div>
                <div>{bus.start_time}</div>
                <div>{bus.reach_time}</div>
            </div>
        )}
      <div>
        {seats.map((seat, idx)=>{
            const id = seat.id ?? seat.pk ?? idx
            const number = seat.seat_number ?? seat.number ?? id
            return(
                <div key={id}>
                    <button onClick={()=>handleBook(id)}
                    style={{color:seat.is_booked? 'red':'green'}}
                    >
                        Seat Number {number}
                    </button>
                </div>
            )
        })}
      </div>

    </div>
  )
}

export default BusSeats