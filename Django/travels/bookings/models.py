from django.db import models
from django.contrib.auth.models import User


class Bus(models.Model):
    id = models.BigAutoField(primary_key=True)  # REQUIRED for Django admin

    bus_id = models.CharField(max_length=50, unique=True)
    route = models.CharField(max_length=100)
    bus_type = models.CharField(max_length=50)
    depot = models.CharField(max_length=100)
    date = models.DateField()

    capacity = models.PositiveIntegerField()
    passengers = models.PositiveIntegerField()

    occupancy_rate = models.FloatField()
    distance_km = models.FloatField()

    fare_per_passenger = models.DecimalField(max_digits=8, decimal_places=2)
    revenue = models.DecimalField(max_digits=10, decimal_places=2)

    fuel_consumed_liters = models.FloatField()
    month = models.CharField(max_length=20)
    day_of_week = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.bus_id} - {self.route}"


class Seat(models.Model):
    bus = models.ForeignKey(
        Bus,
        on_delete=models.CASCADE,
        related_name='seats'
    )
    seat_number = models.CharField(max_length=10)
    is_booked = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.bus.bus_id} - Seat {self.seat_number}"


class Booking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE)
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE)
    booking_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.bus.bus_id} - {self.seat.seat_number}"

    @property
    def fare_per_passenger(self):
        return self.bus.fare_per_passenger

    @property
    def route(self):
        return self.bus.route
