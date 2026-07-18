from rest_framework import serializers
from .models import Borrowing, Reservation
from books.models import Book
from django.utils import timezone

class BorrowRecordSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True, required=False)
    book_author = serializers.CharField(source='book.author', read_only=True, required=False)
    user_email = serializers.EmailField(source='user.email', read_only=True, required=False)
    user_name = serializers.CharField(source='user.first_name', read_only=True, required=False)
    fine_amount = serializers.SerializerMethodField()

    class Meta:
        model = Borrowing
        fields = [
            'id', 
            'book', 
            'book_title', 
            'book_author', 
            'user', 
            'user_email', 
            'user_name', 
            'borrow_date', 
            'due_date', 
            'return_date', 
            'status', 
            'fine_amount'
        ]
        read_only_fields = ['borrow_date', 'status', 'fine_amount', 'user']

    def get_fine_amount(self, obj):
        if obj.return_date:
            # Already returned
            return obj.calculate_fine_for_date(obj.return_date)
        # Outstanding
        return obj.calculate_fine_for_date(timezone.now().date())

    def validate(self, data):
        # Validate book availability on creation hook
        book = data.get('book')
        if not self.instance:  # If creating a new record
            if book.copies_available <= 0:
                raise serializers.ValidationError({"book": "All visual and physical copies of this book are currently checked out."})
        return data


class ReservationSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True, required=False)
    book_author = serializers.CharField(source='book.author', read_only=True, required=False)
    user_email = serializers.EmailField(source='user.email', read_only=True, required=False)
    user_name = serializers.CharField(source='user.first_name', read_only=True, required=False)

    class Meta:
        model = Reservation
        fields = [
            'id',
            'book',
            'book_title',
            'book_author',
            'user',
            'user_email',
            'user_name',
            'reserve_date',
            'queue_position',
            'status'
        ]
        read_only_fields = ['id', 'user', 'reserve_date', 'queue_position', 'status']

    def validate(self, data):
        book = data.get('book')
        # DRF passes request object in the context
        user = self.context['request'].user if self.context and 'request' in self.context else None

        if not self.instance and book and user:
            # 1. Check if resources are actually fully checked out (Hold reservation should only be made if book is NOT available)
            if book.copies_available > 0:
                raise serializers.ValidationError({
                    "book": "This book is currently available in physical catalog stock. Please borrow it directly instead of placing a hold reservation."
                })

            # 2. Prevent a duplication: cannot reserve are active borrowers
            if Borrowing.objects.filter(book=book, user=user, status='ACTIVE').exists():
                raise serializers.ValidationError({
                    "book": "You currently hold an active borrowing transaction for this book."
                })

            # 3. Prevent duplicate active holding queues
            if Reservation.objects.filter(book=book, user=user, status='PENDING').exists():
                raise serializers.ValidationError({
                    "book": "You already have an active pending reservation for this book."
                })

        return data

