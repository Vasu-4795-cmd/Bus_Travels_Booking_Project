import React, { useEffect, useState } from 'react';

const UserBookings = ({ userId }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    fetch(`/api/user/${userId}/bookings/`, {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch bookings');
        }
        return res.json();
      })
      .then((data) => {
        setBookings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div id='bus'>
    <div className="max-w-5xl mx-auto mt-8 p-4" >
      <h2 className="text-2xl font-bold mb-6">My Bookings</h2>

      {bookings.length === 0 ? (
        <p className="text-gray-600">No bookings found.</p>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="border rounded-xl p-6 shadow-md bg-white"
            >
              {/* Bus Info */}
              <h3 className="text-xl font-semibold mb-2">
                {booking.bus?.route}
              </h3>

              <p className="text-gray-700">
                <strong>Bus ID:</strong> {booking.bus?.bus_id}
              </p>
              <p className="text-gray-700">
                <strong>Bus Type:</strong> {booking.bus?.bus_type}
              </p>
              <p className="text-gray-700">
                <strong>Depot:</strong> {booking.bus?.depot}
              </p>

              {/* Travel Info */}
              {/* <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                <p>
                  <strong>Date:</strong> {new Date(booking.bus?.date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Day:</strong> {booking.bus?.day_of_week}
                </p>
                <p>
                  <strong>Distance:</strong> {booking.bus?.distance_km} km
                </p>
                <p>
                  <strong>Fare:</strong> ₹{booking.price}
                </p>
              </div> */}

              {/* Seat & Booking Info */}
              <div className="mt-4">
                <p>
                  <strong>Seat Number:</strong>{' '}
                  {booking.seat?.seat_number}
                </p>
                <p>
                  <strong>Booked At:</strong>{' '}
                  {new Date(booking.booking_time).toLocaleString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    timeZone: 'IST'
                  })}
                </p>
               <p>
                  <strong>Booked Day at:</strong>{' '}
                  {new Date(booking.booking_time).toLocaleString('en-IN', {
                    weekday: 'long',
                    timeZone: 'IST'
                  })}
                </p>

                <p>
                  <strong>Fare:</strong> ₹{booking.bus.fare_per_passenger}
                </p>
              </div>

              {/* Payment Button */}
              <button
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={() =>
                  console.log(`Payment completed for booking ${booking.id}`)
                }
              >
                Payment Successful
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
  
};

export default UserBookings;
