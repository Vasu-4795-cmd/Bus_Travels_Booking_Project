import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const BusSeats = ({ userId }) => {
  const [bus, setBus] = useState(null)
  const [seats, setSeats] = useState([])
  const [selectedSeat, setSelectedSeat] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [seatError, setSeatError] = useState('')
  const [isListening, setIsListening] = useState(false)

  const { busId } = useParams()
  const navigate = useNavigate()

  // Initialize speech recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const recognitionRef = React.useRef(null)

  useEffect(() => {
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('')
          .toLowerCase()
          setSeatError('')
          const showDetailsMatch = transcript.match(/show\s+details/i)
          if (showDetailsMatch) {
            navigate('/my-bookings')
            return
          }
        const match = transcript.match(/book\s+seat\s+([a-z0-9]+)/i)
        if (match) {
          const seatIdentifier = match[1]
          const foundSeat = (seats || []).find(s => {
            const seatNum = s?.seat_number ?? s?.id ?? s?.pk
            return String(seatNum).toLowerCase() === seatIdentifier ||
                   Number(seatNum) === Number(seatIdentifier)
          })
          if (foundSeat) {
            handleBook(foundSeat?.id ?? foundSeat?.pk ?? foundSeat?.seat_number)
          } else {
            setSeatError(`Seat ${seatIdentifier} not found`)
          }
        }
      }

      recognitionRef.current.onerror = (event) => {
        setSeatError(`Speech recognition error: ${event.error}`)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [seats])

  const toggleVoiceRecognition = () => {
    if (!recognitionRef.current) {
      setSeatError('Speech recognition not supported in your browser')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      setSeatError('')
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  useEffect(() => {
    let mounted = true

    const fetchBusDetails = async () => {
      try {
        // First try numeric PK endpoint (Django expects int PK)
        const numericId = Number(busId)
        if (!Number.isNaN(numericId)) {
          try {
            const resp = await axios.get(`/api/buses/${numericId}`)
            const data = resp.data || {}
            if (!mounted) return
            setBus(data)
            setSeats(data.seats || data.seat_list || data.seat || [])
            return
          } catch (err) {
            // continue to fallbacks
            console.warn('Numeric lookup failed, falling back', err)
          }
        }

        // Try direct GET with busId (in case API supports string identifier)
        try {
          const resp = await axios.get(`/api/buses/${encodeURIComponent(busId)}`)
          const data = resp.data || {}
          if (!mounted) return
          setBus(data)
          setSeats(data.seats || data.seat_list || data.seat || [])
          return
        } catch (err) {
          // fallback to list search
          console.warn('Direct lookup failed, trying list search', err)
        }

        // Fallback: fetch all buses and find by bus_id or route
        try {
          const listResp = await axios.get('/api/buses/')
          const list = Array.isArray(listResp.data) ? listResp.data : []
          const found = list.find(b => {
            if (!b) return false
            const bid = b.bus_id ?? b.id ?? b.pk
            if (bid && String(bid).toLowerCase() === String(busId).toLowerCase()) return true
            if (b.route && String(b.route).toLowerCase() === String(busId).toLowerCase()) return true
            return false
          })
          if (found) {
            if (!mounted) return
            setBus(found)
            setSeats(found.seats || found.seat_list || found.seat || [])
            return
          }
        } catch (err) {
          console.error('List lookup failed', err)
        }

        // If nothing found, ensure bus is null
        if (mounted) {
          setBus(null)
          setSeats([])
        }
      } catch (error) {
        console.error('Error fetching bus details', error)
        if (mounted) {
          setBus(null)
          setSeats([])
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    if (busId) fetchBusDetails()
    return () => {
      mounted = false
    }
  }, [busId])

  const handleBook = async (seatId) => {
    if (!userId) {
      alert('Please login to book a seat')
      navigate('/login')
      return
    }

    setSelectedSeat(seatId)
    setSeatError('')
    setBookingLoading(true)

    try {
      // Determine actual seat id to send to backend
      const foundSeat = (seats || []).find((s, i) => s?.id === seatId || s?.pk === seatId || i === seatId)
      const payloadSeatId = foundSeat?.id ?? foundSeat?.pk ?? (Number.isFinite(Number(seatId)) ? Number(seatId) : seatId)

      await axios.post(
        '/api/booking/',
        { seat: payloadSeatId },
        { withCredentials: true }
      )

      alert('🎉 Booking Successful!')
      setSeats(prev =>
        prev.map(seat =>
          (seat?.id === payloadSeatId || seat?.pk === payloadSeatId) ? { ...seat, is_booked: true } : seat
        )
      )
    } catch (error) {
      let msg = 'Booking failed. Please try again.'
      const respData = error.response?.data
      if (respData) {
        // handle standard DRF messages
        msg = respData.error || respData.detail || JSON.stringify(respData)
      } else if (error.message) {
        msg = error.message
      }

      setSeatError(msg)
      alert(msg)

      // If token invalid/expired, clear and redirect to login quickly
      const status = error.response?.status
      if (status === 401) {
        navigate('/login')
      }
    } finally {
      setBookingLoading(false)
      setSelectedSeat(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!bus) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-700">Bus not found</h2>
      </div>
    )
  }

  const availableSeats = (seats || []).filter(seat => !seat?.is_booked).length
  const totalSeats = (seats || []).length

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6" id='seat'>
      {/* Bus Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl shadow-xl p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div>
          <h1 className="text-3xl font-bold mb-1">{bus.route}</h1>
          <p className="text-indigo-100">
            Bus ID: {bus.bus_id} | {bus.bus_type}
          </p>
          <p className="text-indigo-100">Depot: {bus.depot}</p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col gap-3 items-end">
          <div className="bg-white bg-opacity-20 rounded-lg px-6 py-3">
            <p className="text-lg font-bold">{availableSeats} seats available</p>
            <p className="text-sm">Out of {totalSeats}</p>
          </div>
          <button
            onClick={toggleVoiceRecognition}
            className={`px-4 py-2 rounded-lg font-semibold ${
              isListening
            ? 'bg-red-600 text-white'
            : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isListening ? '🎤 Listening...' : '🎤 Voice Book'}
          </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
          <p className="text-sm text-indigo-200">Date</p>
          <p className="text-xl font-bold">{bus.date}</p>
            </div>
            <div>
          <p className="text-sm text-indigo-200">Day</p>
          <p className="text-xl font-bold">{bus.day_of_week}</p>
            </div>
            <div>
          <p className="text-sm text-indigo-200">Distance</p>
          <p className="text-xl font-bold">{bus.distance_km} km</p>
            </div>
            <div>
          <p className="text-sm text-indigo-200">Fare</p>
          <p className="text-xl font-bold">₹{bus.fare_per_passenger}</p>
            </div>
          </div>
        </div>

        {/* Seat Layout */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-center">
            <div className="flex flex-col gap-4">
              {(() => {
                const rows = []
                for (let i = 0; i < (seats || []).length; i += 5) {
                  rows.push((seats || []).slice(i, i + 5))
                }

                return rows.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex justify-center gap-4">
                    {/* Left side (2 seats) */}
                    <div className="flex gap-4">
                      {row.slice(0, 2).map((seat, idx) => {
                        const seatId = seat?.id ?? seat?.pk ?? rowIndex * 5 + idx
                        const isBooked = Boolean(seat?.is_booked)
                        const isSelected = selectedSeat === seatId
                        const seatNumber = seat?.seat_number ?? seatId

                        const btnClass = isBooked
                          ? 'bg-red-500 text-white cursor-not-allowed'
                          : isSelected
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-500 text-white hover:bg-emerald-600'

                        return (
                          <button
                            key={seatId}
                            onClick={() => !isBooked && handleBook(seatId)}
                            disabled={isBooked || bookingLoading}
                            className={`w-14 h-14 flex items-center justify-center rounded-lg font-bold ${btnClass}`}
                          >
                            {seatNumber}
                          </button>
                        )
                      })}
                    </div>

                    {/* Aisle Space */}
                    <div className="w-16"></div>

                    {/* Right side (3 seats) */}
                    <div className="flex gap-4">
                      {row.slice(2).map((seat, idx) => {
                        const seatId = seat?.id ?? seat?.pk ?? rowIndex * 5 + idx + 2
                        const isBooked = Boolean(seat?.is_booked)
                        const isSelected = selectedSeat === seatId
                        const seatNumber = seat?.seat_number ?? seatId

                        const btnClass = isBooked
                          ? 'bg-red-500 text-white cursor-not-allowed'
                          : isSelected
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-500 text-white hover:bg-emerald-600'

                        return (
                          <button
                            key={seatId}
                            onClick={() => !isBooked && handleBook(seatId)}
                            disabled={isBooked || bookingLoading}
                            className={`w-14 h-14 flex items-center justify-center rounded-lg font-bold ${btnClass}`}
                          >
                            {seatNumber}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))
              })()}
            </div>
          </div>

          {seatError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {seatError}
            </div>
          )}

          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-blue-900 mb-2">
              Voice Transcription:
            </p>
            <p className="text-gray-700">
              {isListening ? 'Listening...' : 'Click "Voice Book" button to start speaking'}
            </p>
          </div>

          <div className="text-center">
            {!userId ? (
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg"
              >
                Login to Book Seats
              </button>
            ) : availableSeats === 0 ? (
              <p className="text-red-600 font-semibold">All seats are booked</p>
            ) : (
              <p className="text-gray-600">
                Capacity: {bus.capacity} | Passengers: {bus.passengers} |
                Occupancy: {bus.occupancy_rate}%
              </p>
            )}
          </div>
        </div>


      <button
        onClick={() => navigate('/my-bookings')}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        View Booking Details
      </button>
    </div>
  )
}

export default BusSeats
