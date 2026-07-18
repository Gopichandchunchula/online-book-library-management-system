from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

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
