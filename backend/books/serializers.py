from rest_framework import serializers
from .models import Book

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
