from django.db import models
from django.conf import settings
from books.models import Book

class Borrowing(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active Loan'),
        ('RETURNED', 'Returned/Discharged'),
        ('OVERDUE', 'Overdue past due date'),
    ]

    id = models.CharField(max_length=50, primary_key=True, help_text="Custom unique transaction ID, e.g., 'BW-901'")
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='borrowings')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='borrowings')
    borrow_date = models.DateField()
    due_date = models.DateField()
    return_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    fine_paid = models.BooleanField(default=False)

    def calculate_fine_for_date(self, evaluation_date):
        """
        Calculates library overdue fines at a rate of $1.00 per late day
        """
        # If already returned, check if returned after due date
        end_date = self.return_date if self.return_date else evaluation_date
        
        if end_date > self.due_date:
            delta = end_date - self.due_date
            return float(delta.days) * 1.00
        return 0.00

    @property
    def current_fine(self):
        from django.utils import timezone
        if self.status == 'RETURNED':
            return self.calculate_fine_for_date(self.return_date)
        return self.calculate_fine_for_date(timezone.now().date())

    def __str__(self):
        return f"Checkout {self.id} for {self.book.title} (User: {self.user.username})"


class Reservation(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending Hold'),
        ('READY', 'Ready for Collection'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed Hold'),
    ]

    id = models.CharField(max_length=50, primary_key=True, help_text="Custom unique reservation ID, e.g., 'RS-301'")
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='reservations')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reservations')
    reserve_date = models.DateField(auto_now_add=True)
    queue_position = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')

    def __str__(self):
        return f"Reservation {self.id} for {self.book.title} (User: {self.user.username})"


class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, default='STUDENT')
    member_id = models.CharField(max_length=50, unique=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    department = models.CharField(max_length=255, blank=True, null=True)
    join_date = models.CharField(max_length=50, blank=True, null=True)
    avatar_seed = models.CharField(max_length=10, default='Gc')

    def __str__(self):
        return f"Library Profile for {self.user.username} ({self.role})"


class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username}: {self.title}"



