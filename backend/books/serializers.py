from rest_framework import serializers
from .models import Book, Suggestion, Purchase

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = [
            'id', 
            'title', 
            'author', 
            'genre', 
            'isbn', 
            'published_date', 
            'copies_total', 
            'copies_available', 
            'location', 
            'description', 
            'cover_image', 
            'rating'
        ]


class SuggestionSerializer(serializers.ModelSerializer):
    user_id = serializers.CharField(source='requested_by.id', read_only=True)
    username = serializers.CharField(source='requested_by.username', read_only=True)

    class Meta:
        model = Suggestion
        fields = [
            'id',
            'user_id',
            'username',
            'book_name',
            'author',
            'category',
            'message',
            'status',
            'created_at'
        ]
        read_only_fields = ['id', 'user_id', 'username', 'created_at']


class PurchaseSerializer(serializers.ModelSerializer):
    bookId = serializers.CharField(source='book.id', read_only=True)
    bookTitle = serializers.CharField(source='book.title', read_only=True)
    purchaseDate = serializers.SerializerMethodField()
    amount = serializers.FloatField()
    paymentStatus = serializers.CharField(source='payment_status', read_only=True)
    transactionId = serializers.CharField(source='transaction_id', read_only=True)
    userId = serializers.SerializerMethodField()
    username = serializers.CharField(source='user.username', read_only=True)
    userName = serializers.SerializerMethodField()

    class Meta:
        model = Purchase
        fields = [
            'id',
            'bookId',
            'bookTitle',
            'purchaseDate',
            'amount',
            'paymentStatus',
            'transactionId',
            'userId',
            'username',
            'userName'
        ]

    def get_purchaseDate(self, obj):
        return obj.purchased_at.strftime("%b %d, %Y")

    def get_userId(self, obj):
        if hasattr(obj.user, 'profile'):
            return obj.user.profile.member_id
        return obj.user.username

    def get_userName(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username

