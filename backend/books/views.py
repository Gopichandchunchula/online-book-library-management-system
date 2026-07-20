from rest_framework import viewsets, permissions
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Book, Suggestion
from .serializers import BookSerializer, SuggestionSerializer

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all().order_by('title')
    serializer_class = BookSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['genre']
    search_fields = ['title', 'author', 'isbn']

    def get_permissions(self):
        # Allow unauthorized / read-only actions for students to explore catalog,
        # but require staff permissions (librarian or admin) for writing/modifying
        if self.action in ["preview", "purchase"]:
            permission_classes = [permissions.IsAuthenticated]
        elif self.request.method in permissions.SAFE_METHODS:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAdminUser]

        return [permission() for permission in permission_classes]
    
    

    @action(detail=True, methods=['POST'], permission_classes=[permissions.IsAuthenticated])
    def preview(self, request, pk=None):
        book = self.get_object()
        user = request.user
        
        from .models import Purchase, BookPreview
        already_purchased = Purchase.objects.filter(user=user, book=book, payment_status='SUCCESS').exists()
        
        previews_qs = BookPreview.objects.filter(user=user)
        previewed_book_ids = list(previews_qs.values_list('book_id', flat=True))
        current_count = len(previewed_book_ids)
        max_previews = 5
        remaining = max(0, max_previews - current_count)
        
        if already_purchased:
            snippet = book.description[:500] if book.description else "No description available for " + book.title
            return Response({
                "allowed": True,
                "bookId": str(book.id),
                "remaining": remaining,
                "snippet": snippet,
                "alreadyPurchased": True,
                "message": "Full book unlocked via purchase!"
            })
            
        is_already_previewed = book.id in previewed_book_ids
        
        if not is_already_previewed:
            if current_count >= max_previews:
                return Response({
                    "allowed": False,
                    "bookId": str(book.id),
                    "remaining": 0,
                    "message": "Free preview limit reached. Please purchase the book to unlock full reading access."
                }, status=200)
                
            BookPreview.objects.create(user=user, book=book)
            remaining = max_previews - (current_count + 1)
            
        snippet = book.description[:500] if book.description else "No description available for " + book.title
        return Response({
            "allowed": True,
            "bookId": str(book.id),
            "remaining": remaining,
            "snippet": snippet,
            "message": f"Initializing Preview Reader ({remaining} slots remain)"
        })

    @action(detail=True, methods=['POST'], permission_classes=[permissions.IsAuthenticated])
    def purchase(self, request, pk=None):
        book = self.get_object()
        user = request.user
        amount = request.data.get('amount', 9.99)
        
        import uuid
        purchase_id = "PR-" + str(uuid.uuid4().hex[:8].upper())
        transaction_id = "TXN-" + str(uuid.uuid4().hex[:12].upper())
        
        from .models import Purchase
        purchase, created = Purchase.objects.get_or_create(
            user=user,
            book=book,
            payment_status='SUCCESS',
            defaults={
                'id': purchase_id,
                'amount': amount,
                'transaction_id': transaction_id
            }
        )
        
        return Response({
            "success": True,
            "message": "Book purchased successfully",
            "purchase": {
                "id": purchase.id,
                "purchaseDate": purchase.purchased_at.strftime("%b %d, %Y") if hasattr(purchase, 'purchased_at') and purchase.purchased_at else "May 20, 2026",
                "transactionId": purchase.transaction_id
            }
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def preview_status_view(request):
    user = request.user
    from .models import BookPreview
    previewed_book_ids = list(BookPreview.objects.filter(user=user).values_list('book_id', flat=True))
    current_count = len(previewed_book_ids)
    max_previews = 5
    remaining = max(0, max_previews - current_count)
    exceeded = current_count >= max_previews
    
    return Response({
        "previewedBookIds": [str(bid) for bid in previewed_book_ids],
        "currentCount": current_count,
        "maxPreviews": max_previews,
        "remaining": remaining,
        "exceeded": exceeded
    })


class SuggestionViewSet(viewsets.ModelViewSet):
    queryset = Suggestion.objects.all().order_by('-created_at')
    serializer_class = SuggestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)

