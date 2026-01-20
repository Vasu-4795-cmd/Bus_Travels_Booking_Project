import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const BusList = () => {
    const [buses, setBuses] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterDepot, setFilterDepot] = useState('')
    const [filterBusType, setFilterBusType] = useState('')
    const [speechSupported, setSpeechSupported] = useState(false)

    const navigate = useNavigate()

    const [isListening, setIsListening] = useState(false)
    const recognitionRef = useRef(null)

    useEffect(() => {
        // Initialize SpeechRecognition if available
        if (typeof window !== 'undefined' && !recognitionRef.current) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            if (SpeechRecognition) {
                setSpeechSupported(true)
                const recognition = new SpeechRecognition()
                recognition.lang = 'en-US'
                recognition.interimResults = false
                recognition.maxAlternatives = 1
                recognition.continuous = false

                recognition.onstart = () => {
                    setIsListening(true)
                }

                recognition.onresult = (event) => {
                    if (event.results && event.results.length > 0) {
                        let transcript = ''
                        for (let i = 0; i < event.results.length; i++) {
                            transcript += event.results[i][0].transcript
                            if (event.results[i].isFinal) break
                        }
                        setSearchTerm(transcript.toLowerCase().replace(/\s+to\s+/g, '-'))
                    }
                }

                recognition.onend = () => {
                    setIsListening(false)
                }

                recognition.onerror = (err) => {
                    console.error('Speech recognition error:', err.error)
                    setIsListening(false)
                }

                recognitionRef.current = recognition
            }
        }

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop()
                } catch (e) {
                    // ignore
                }
            }
        }
    }, [])

    useEffect(() => {
        const fetchBuses = async () => {
            try {
                const response = await axios.get("/api/buses/")
                setBuses(response.data)
            } catch (error) {
                console.error(error)
                setError('Failed to load buses')
            } finally {
                setIsLoading(false)
            }
        }
        fetchBuses()
    }, [])

    const handleViewSeats = (id) => {
        navigate(`/bus/${id}`)
    }

    const filteredBuses = buses.filter(bus => {
        const route = (bus.route || '').toLowerCase()
        const type = (bus.bus_type || '').toLowerCase()
        const search = (searchTerm || '').toLowerCase()

        const matchesSearch = route.includes(search) || type.includes(search)

        const matchesDepot = filterDepot
            ? (bus.depot || '').toLowerCase() === filterDepot.toLowerCase()
            : true

        const matchesBusType = filterBusType
            ? type === filterBusType.toLowerCase()
            : true

        return matchesSearch && matchesDepot && matchesBusType
    })

    const toggleListening = () => {
        if (!speechSupported || !recognitionRef.current) {
            alert('Speech Recognition not supported in this browser')
            return
        }
        if (isListening) {
            try {
                recognitionRef.current.abort()
                setIsListening(false)
            } catch (err) {
                console.error('Could not stop recognition', err)
            }
        } else {
            try {
                setSearchTerm('')
                recognitionRef.current.start()
            } catch (err) {
                console.error('Could not start recognition', err)
                setIsListening(false)
            }
        }
    }

    const uniqueDepots = [...new Set(buses.map(bus => bus.depot).filter(Boolean))]
    const uniqueBusTypes = [...new Set(buses.map(bus => bus.bus_type).filter(Boolean))]

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-4 max-w-4xl mx-auto text-red-600 font-semibold">
                {error}
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8" id='bus'>
            <h1 className="text-3xl font-bold text-center mb-8"><u>Available Buses</u></h1>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center border px-3 py-2 rounded">
                        <input
                            type="text"
                            placeholder="Search route or bus type..."
                            className="flex-1 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {speechSupported && (
                            <button
                                onClick={toggleListening}
                                aria-pressed={isListening}
                                aria-label={isListening ? 'Stop listening' : 'Start listening'}
                                className={`ml-2 p-1 rounded ${isListening ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                                title={isListening ? 'Listening...' : 'Click to use voice search'}
                            >
                                {isListening ? '🔴' : '🎙'}
                            </button>
                        )}
                    </div>

                    <select
                        className="border px-3 py-2 rounded"
                        value={filterDepot}
                        onChange={(e) => setFilterDepot(e.target.value)}
                    >
                        <option value="">All Depots</option>
                        {uniqueDepots.map(depot => (
                            <option key={depot} value={depot}>{depot}</option>
                        ))}
                    </select>

                    <select
                        className="border px-3 py-2 rounded"
                        value={filterBusType}
                        onChange={(e) => setFilterBusType(e.target.value)}
                    >
                        <option value="">All Bus Types</option>
                        {uniqueBusTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>

                    <button
                        className="bg-gray-200 rounded font-bold"
                        id='clrbtn'
                        onClick={() => {
                            setSearchTerm('')
                            setFilterDepot('')
                            setFilterBusType('')
                        }}
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Bus Cards */}
            {filteredBuses.length === 0 ? (
                <p className="text-center text-white-600">No buses found</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBuses.map((bus, idx) => (
                        <div key={bus.id ?? bus.bus_id ?? `bus-${idx}`} className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold mb-1">{bus.route}</h2>
                            <p className="text-gray-600 mb-2">
                                {bus.bus_type} | Depot: {bus.depot}
                            </p>

                            <p><strong>Date:</strong> {bus.date}</p>
                            <p><strong>Day:</strong> {bus.day_of_week}</p>
                            <p><strong>Capacity:</strong> {bus.capacity}</p>
                            <p><strong>Passengers:</strong> {bus.passengers}</p>
                            <p><strong>Occupancy:</strong> {bus.occupancy_rate}%</p>
                            <p><strong>Distance:</strong> {bus.distance_km} km</p>
                            <p><strong>Fare:</strong> ₹{bus.fare_per_passenger}</p>
                            <p><strong>Revenue:</strong> ₹{bus.revenue}</p>

                            <button
                                onClick={() => handleViewSeats(bus.bus_id)}
                                className="mt-4 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
                            >
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default BusList
