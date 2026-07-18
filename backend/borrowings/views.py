from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from django.db import models, transaction
from django.contrib.auth import get_user_model
from collections import defaultdict
import datetime

from .models import Borrowing, Reservation
from books.models import Book
from .serializers import BorrowRecordSerializer, ReservationSerializer

class BorrowViewSet(viewsets.ModelViewSet):
    serializer_class = BorrowRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Row level restriction: Students can only view their own borrow logs
        if user.groups.filter(name='STUDENT').exists() or not user.is_staff:
            return Borrowing.objects.filter(user=user).order_by('-borrow_date')
        # Librarians and Admins can view all checkouts
        return Borrowing.objects.all().order_by('-borrow_date')

    def perform_create(self, serializer):
        # Auto-bind borrowing to the logged-in user
        # Set due date dynamically to 14 days from today
        with transaction.atomic():
            book = serializer.validated_data['book']
            book.copies_available -= 1
            book.save()
            
            # Generate custom unique Char ID sequence for Borrowing PK
            next_num = Borrowing.objects.count() + 901
            custom_id = f"BW-{next_num}"
            
            serializer.save(
                id=custom_id,
                user=self.request.user,
                borrow_date=timezone.now().date(),
                due_date=timezone.now().date() + timedelta(days=14),
                status='ACTIVE'
            )

    @action(detail=True, methods=['post'], url_path='return-book')
    def return_book(self, request, pk=None):
        """
        Discharge checkout and return book to active shelf inventories
        """
        try:
            borrow_record = self.get_object()
        except Borrowing.DoesNotExist:
            return Response({"error": "The specified borrowing record was not found."}, status=status.HTTP_404_NOT_FOUND)

        if borrow_record.status == 'RETURNED':
            return Response({"error": "This book has already been returned and validated."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            today = timezone.now().date()
            borrow_record.return_date = today
            borrow_record.status = 'RETURNED'
            
            # Recalculate and register actual fine at time of check-in
            fine = borrow_record.calculate_fine_for_date(today)
            if fine > 0:
                borrow_record.fine_paid = False  # Log that fees are due
                
            borrow_record.save()
            
            # Restore stock availability
            book = borrow_record.book
            book.copies_available += 1
            book.save()

            serializer = self.get_serializer(borrow_record)
            return Response({
                "message": f"Successfully returned '{book.title}'",
                "fine_incurred": fine,
                "data": serializer.data
            }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='pay-fines')
    def pay_all_fines(self, request):
        """
        Clears all outstanding fines for the authenticated student.
        """
        with transaction.atomic():
            my_records = Borrowing.objects.filter(user=request.user, fine_paid=False)
            count = my_records.count()
            for r in my_records:
                r.fine_paid = True
                r.save()
            return Response({"success": True, "message": f"Successfully cleared {count} outstanding fine ledgers."})

    @action(detail=False, methods=['get'], url_path='my-loans')
    def list_my_loans(self, request):
        """
        Action endpoint to quickly filter active loans for the authenticated student
        """
        active_loans = self.get_queryset().filter(status='ACTIVE')
        serializer = self.get_serializer(active_loans, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ReservationViewSet(viewsets.ModelViewSet):
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Row level restriction: Students can only view their own reservations
        if user.groups.filter(name='STUDENT').exists() or not user.is_staff:
            return Reservation.objects.filter(user=user).order_by('-reserve_date')
        # Librarians and Admins can view all reservations
        return Reservation.objects.all().order_by('-reserve_date')

    def perform_create(self, serializer):
        with transaction.atomic():
            book = serializer.validated_data['book']
            
            # Formulate next Reservation ID
            next_num = Reservation.objects.count() + 101
            custom_id = f"RS-{next_num}"
            
            # Calculate queue position for this book
            current_queue = Reservation.objects.filter(book=book, status='PENDING').count()
            queue_position = current_queue + 1
            
            serializer.save(
                id=custom_id,
                user=self.request.user,
                queue_position=queue_position,
                status='PENDING'
            )

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel_reservation(self, request, pk=None):
        """
        Cancel a pending reservation and update the queue positions of other users holding the same book
        """
        try:
            reservation = self.get_object()
        except Reservation.DoesNotExist:
            return Response({"error": "Reservation record not found."}, status=status.HTTP_404_NOT_FOUND)

        if reservation.status != 'PENDING':
            return Response({"error": "Only pending reservations can be cancelled."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            old_position = reservation.queue_position
            book = reservation.book
            
            # Mark reservation as CANCELLED
            reservation.status = 'CANCELLED'
            reservation.queue_position = 0
            reservation.save()

            # Dynamic shift queue positions of remaining active holds
            Reservation.objects.filter(
                book=book,
                status='PENDING',
                queue_position__gt=old_position
            ).update(queue_position=models.F('queue_position') - 1)

            serializer = self.get_serializer(reservation)
            return Response({
                "message": f"Successfully cancelled reservation for '{book.title}'",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='my-reservations')
    def list_my_reservations(self, request):
        """
        Quick filtering action to get only the active pending reservations of the authenticated student
        """
        active_res = self.get_queryset().filter(status='PENDING')
        serializer = self.get_serializer(active_res, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class IsLibrarianOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.is_staff or 
            request.user.groups.filter(name__in=['LIBRARIAN', 'ADMIN']).exists()
        )


class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsLibrarianOrAdmin]

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """
        Calculates library system telemetry/dashboard statistics for Librarians and Admins.
        """
        total_unique_books = Book.objects.count()
        
        # Total copies across catalog
        copies_aggregates = Book.objects.aggregate(
            total=models.Sum('copies_total'),
            available=models.Sum('copies_available')
        )
        total_copies = copies_aggregates['total'] or 0
        available_copies = copies_aggregates['available'] or 0
        borrowed_copies = total_copies - available_copies

        active_borrowings_count = Borrowing.objects.filter(status='ACTIVE').count()
        overdue_borrowings_count = Borrowing.objects.filter(status='OVERDUE').count()
        
        # Add dynamic double-check for loans that might be active but past due
        dynamic_overdue_count = Borrowing.objects.filter(
            status='ACTIVE', 
            due_date__lt=timezone.now().date()
        ).count()
        
        total_overdue = max(overdue_borrowings_count, dynamic_overdue_count)
        
        pending_reservations_count = Reservation.objects.filter(status='PENDING').count()
        ready_reservations_count = Reservation.objects.filter(status='READY').count()
        
        # Calculate active members from the database
        User = get_user_model()
        total_members = User.objects.count()
        student_members = User.objects.filter(groups__name='STUDENT').count()
        staff_members = User.objects.filter(groups__name__in=['LIBRARIAN', 'ADMIN']).count()

        # Outstanding unpaid fines sum
        unpaid_loans = Borrowing.objects.filter(fine_paid=False)
        total_unpaid_fines = 0.00
        for b in unpaid_loans:
            total_unpaid_fines += b.current_fine

        data = {
            "total_books_titles": total_unique_books,
            "total_copies_inventory": total_copies,
            "available_copies": available_copies,
            "borrowed_copies": borrowed_copies,
            "circulation_percentage": round((borrowed_copies / total_copies * 100) if total_copies > 0 else 0, 1),
            "active_loans": active_borrowings_count,
            "overdue_loans": total_overdue,
            "pending_holds": pending_reservations_count,
            "ready_holds_collection": ready_reservations_count,
            "total_members": total_members,
            "student_members": student_members,
            "staff_members": staff_members,
            "total_unpaid_fines": round(total_unpaid_fines, 2),
            "system_health": "SECURE/SYNCHRONIZED",
            "db_engine": "SQLITE3_LOCAL_LEDGER_POOL"
        }
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='reports')
    def reports(self, request):
        """
        Produces custom system reports: Most Borrowed Books ranking & monthly transaction trends.
        """
        # 1. Most Borrowed Books Report (top 5)
        top_books_queryset = Book.objects.annotate(
            borrow_count=models.Count('borrowings')
        ).order_by('-borrow_count')[:5]

        most_borrowed_list = []
        for b in top_books_queryset:
            most_borrowed_list.append({
                "book_id": b.id if hasattr(b, 'id') else b.pk,
                "title": b.title,
                "author": b.author,
                "genre": b.genre,
                "borrow_count": b.borrow_count
            })

        # 2. Monthly Borrowing Trends (last 6 months counting back)
        six_months_ago = timezone.now().date() - datetime.timedelta(days=180)
        recent_loans = Borrowing.objects.filter(borrow_date__gte=six_months_ago)

        trends_map = defaultdict(int)
        for loan in recent_loans:
            month_key = loan.borrow_date.strftime("%Y-%m")
            trends_map[month_key] += 1

        # Populate missing months if needed, sort keys
        sorted_trends = []
        for k in sorted(trends_map.keys()):
            # Parse key to human format like "May 2026"
            try:
                date_obj = datetime.datetime.strptime(k, "%Y-%m")
                month_name = date_obj.strftime("%B %Y")
            except Exception:
                month_name = k
            sorted_trends.append({
                "month_code": k,
                "month_name": month_name,
                "transaction_count": trends_map[k]
            })

        # Fallback if no transactions recorded
        if not sorted_trends:
            # Seed standard current month info
            curr_month = timezone.now().date().strftime("%B %Y")
            sorted_trends.append({
                "month_code": timezone.now().date().strftime("%Y-%m"),
                "month_name": curr_month,
                "transaction_count": 0
            })

        data = {
            "most_borrowed_books": most_borrowed_list,
            "monthly_borrowing_trends": sorted_trends,
            "report_timestamp": timezone.now().isoformat()
        }
        return Response(data, status=status.HTTP_200_OK)

