from django.contrib import admin
from .models import Book, BookPreview, Purchase, Suggestion

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'genre', 'isbn', 'copies_total', 'copies_available')
    search_fields = ('title', 'author', 'isbn')

@admin.register(BookPreview)
class BookPreviewAdmin(admin.ModelAdmin):
    list_display = ('user', 'book', 'previewed_at')
    list_filter = ('previewed_at',)

@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'book', 'amount', 'purchased_at', 'payment_status', 'transaction_id')
    list_filter = ('payment_status', 'purchased_at')
    search_fields = ('user__username', 'book__title', 'transaction_id')

@admin.register(Suggestion)
class SuggestionAdmin(admin.ModelAdmin):
    list_display = ('book_name', 'author', 'category', 'status', 'requested_by', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('book_name', 'author', 'requested_by__username')
