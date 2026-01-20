from django.contrib import admin
from .models import Bus, Seat, Booking


@admin.register(Bus)
class BusAdmin(admin.ModelAdmin):
    list_display = (
        'bus_id',
        'route',
        'bus_type',
        'depot',
        'date',
        'capacity',
        'passengers',
        'occupancy_rate',
        'distance_km',
        'fare_per_passenger',
        'revenue',
        'fuel_consumed_liters',
        'month',
        'day_of_week',
    )


@admin.register(Seat)
class SeatAdmin(admin.ModelAdmin):
    list_display = (
        'seat_number',
        'bus',
        'is_booked',
    )


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'bus',
        'seat',
        'booking_time',
        'get_route',
        'get_fare',
    )

    def get_route(self, obj):
        return obj.bus.route
    get_route.short_description = "Route"

    def get_fare(self, obj):
        return obj.bus.fare_per_passenger
    get_fare.short_description = "Fare"
