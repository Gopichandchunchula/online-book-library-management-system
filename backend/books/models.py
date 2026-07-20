from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings

class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    genre = models.CharField(max_length=100)
    isbn = models.CharField(max_length=50, unique=True)
    published_date = models.DateField()
    copies_total = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    copies_available = models.PositiveIntegerField()
    location = models.CharField(max_length=100, help_text="Physical location coordinates on shelves, e.g. 'Rack A-3, Shelf 2'")
    description = models.TextField(blank=True, null=True)
    cover_image = models.URLField(max_length=500, blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.00, validators=[MinValueValidator(0.0), MaxValueValidator(5.0)])

    def __str__(self):
        return f"{self.title} by {self.author}"

    def save(self, *args, **kwargs):
        # Enforce that available copies never exceeds total catalog stock on creation
        if not self.pk and getattr(self, 'copies_available', None) is None:
            self.copies_available = self.copies_total
        super().save(*args, **kwargs)


class BookPreview(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='book_previews')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='previews')
    previewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'book')

    def __str__(self):
        return f"{self.user.username} previewed {self.book.title}"


class Purchase(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='purchases')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='purchases')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    purchased_at = models.DateTimeField(auto_now_add=True)
    payment_status = models.CharField(max_length=20, default='SUCCESS')
    transaction_id = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.user.username} purchased {self.book.title} (ID: {self.id})"


class Suggestion(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('ADDED_TO_LIBRARY', 'Added to Library'),
    ]

    book_name = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    message = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='suggestions')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.book_name} by {self.author} (Requested by: {self.requested_by.username})"

