from django.contrib import admin
from .models import Borrowing, Reservation, UserProfile, Notification

@admin.register(Borrowing)
class BorrowingAdmin(admin.ModelAdmin):
    list_display = ('id', 'book', 'user', 'borrow_date', 'due_date', 'return_date', 'status', 'fine_paid')
    list_filter = ('status', 'fine_paid', 'borrow_date')
    search_fields = ('id', 'user__username', 'book__title')

@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('id', 'book', 'user', 'reserve_date', 'queue_position', 'status')
    list_filter = ('status', 'reserve_date')
    search_fields = ('id', 'user__username', 'book__title')

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'member_id', 'department', 'join_date')
    list_filter = ('role', 'join_date')
    search_fields = ('user__username', 'member_id', 'department')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('user__username', 'title')
