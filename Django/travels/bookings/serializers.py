
from rest_framework import serializers
from .models import Bus, Seat, Booking
from django.contrib.auth.models import User

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only = True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validate_date):
        user = User.objects.create_user(
            username = validate_date['username'],
            email = validate_date['email'],
            password= validate_date['password']
        )
        return user
    

# class BusSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Bus
#         fields = '__all__'

# class SeatSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Seat
#         fields = ['id','seat_number', 'is_booked']

class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = ['id','seat_number', 'is_booked']

class BusSerializer(serializers.ModelSerializer):
    seats = SeatSerializer(many=True, read_only=True)

    class Meta:
        model = Bus
        fields = '__all__'

class BusSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Bus
        # use actual Bus model fields
        fields = ['bus_id', 'route', 'depot', 'date', 'fare_per_passenger', 'bus_type', 'day_of_week']

class BookingSerializer(serializers.ModelSerializer):
    # bus = serializers.StringRelatedField()
    # seat = SeatSerializer
    # user = serializers.StringRelatedField()
    bus = BusSummarySerializer(read_only=True)
    seat = SeatSerializer(read_only=True)
    user = serializers.StringRelatedField()
    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['user', 'booking_time', 'bus', 'seat', 'fare_per_passenger', 'day_of_week']