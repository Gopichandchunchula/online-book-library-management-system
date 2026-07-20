from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, viewsets, serializers, permissions
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.models import Group
from borrowings.models import UserProfile, Notification
from books.models import Purchase
from books.serializers import PurchaseSerializer
from .auth import generate_jwt
import time
import datetime

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Authenticates a library member and generates a custom JWT token containing the security claims.
    """
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '').strip()
    
    if not username or not password:
        return Response({"error": "Please provide both academic username and password."}, status=status.HTTP_400_BAD_REQUEST)
    
    # Authenticate standard user
    user = authenticate(username=username, password=password)
    if not user:
        return Response({"error": "Access Denied: The password or username you entered is incorrect."}, status=status.HTTP_401_UNAUTHORIZED)
        
    try:
        profile = user.profile
        role = profile.role
    except Exception:
        # Fallback if profile doesn't exist yet
        role = 'STUDENT'
        if user.is_staff:
            role = 'ADMIN'
        # Auto-create fallback profile
        next_num = UserProfile.objects.count() + 1001
        profile = UserProfile.objects.create(
            user=user,
            role=role,
            member_id=f"LM-FALLBACK-{next_num}",
            avatar_seed=username[:2].upper()
        )
        
    # Generate token payload
    payload = {
        "username": user.username,
        "email": user.email,
        "role": role,
        "user_id": user.id,
        "exp": int(time.time()) + 86400  # 24 hours expiry
    }
    token = generate_jwt(payload)
    
    purchased_bids = list(Purchase.objects.filter(user=user, payment_status='SUCCESS').values_list('book_id', flat=True))
    
    return Response({
        "token": token,
        "user": {
            "name": f"{user.first_name} {user.last_name}".strip() or user.username,
            "email": user.email,
            "memberId": profile.member_id,
            "joinDate": profile.join_date or "May 20, 2026",
            "role": profile.role,
            "avatarSeed": profile.avatar_seed or "Gc",
            "phone": profile.phone or "",
            "department": profile.department or "",
            "purchasedBooks": [str(bid) for bid in purchased_bids]
        }
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    Registers a new user and syncs a custom UserProfile table.
    """
    username = request.data.get('username', '').strip().lower()
    password = request.data.get('password', '').strip()
    email = request.data.get('email', '').strip()
    name = request.data.get('name', '').strip()
    phone = request.data.get('phone', '').strip()
    department = request.data.get('department', '').strip()
    role = request.data.get('role', 'STUDENT').strip().upper()
    
    if not username or not password or not email or not name:
        return Response({"error": "Name, username, email, and password are required fields."}, status=status.HTTP_400_BAD_REQUEST)
        
    User = get_user_model()
    if User.objects.filter(username=username).exists():
        return Response({"error": "That active username is already taken. Please choose another."}, status=status.HTTP_400_BAD_REQUEST)
        
    # Split first and last names
    name_parts = name.split(' ', 1)
    first_name = name_parts[0]
    last_name = name_parts[1] if len(name_parts) > 1 else ""
    
    # Create main user
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name
    )
    
    # Create matching django group if it exists, or flag staff state
    if role in ['ADMIN', 'LIBRARIAN']:
        user.is_staff = True
        user.save()
        
    group, _ = Group.objects.get_or_create(name=role)
    user.groups.add(group)
    
    # Seed custom UserProfile
    next_num = UserProfile.objects.count() + 1010
    seed_role_prefix = "LM-ADMIN-" if role == 'ADMIN' else "LM-STAFF-" if role == 'LIBRARIAN' else "LM-2026-"
    member_id = f"{seed_role_prefix}{next_num}"
    
    avatar_seed = "".join([part[0] for part in name.split()]).upper()[:2] or "NB"
    
    # Format current date context
    join_date = f"{datetime.date.today().strftime('%b %d, %Y')}"
    
    profile = UserProfile.objects.create(
        user=user,
        role=role,
        member_id=member_id,
        phone=phone,
        department=department,
        join_date=join_date,
        avatar_seed=avatar_seed
    )
    
    # Log JWT immediately
    payload = {
        "username": user.username,
        "email": user.email,
        "role": role,
        "user_id": user.id,
        "exp": int(time.time()) + 86450
    }
    token = generate_jwt(payload)
    
    return Response({
        "token": token,
        "user": {
            "name": name,
            "email": email,
            "memberId": member_id,
            "joinDate": join_date,
            "role": role,
            "avatarSeed": avatar_seed,
            "phone": phone,
            "department": department,
            "purchasedBooks": []
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    """
    Returns authentic user demographics from current bearer token.
    """
    user = request.user
    try:
        profile = user.profile
    except Exception:
        return Response({"error": "UserProfile associated with session context not found."}, status=status.HTTP_404_NOT_FOUND)
        
    purchased_bids = list(Purchase.objects.filter(user=user, payment_status='SUCCESS').values_list('book_id', flat=True))
    
    return Response({
        "name": f"{user.first_name} {user.last_name}".strip() or user.username,
        "email": user.email,
        "memberId": profile.member_id,
        "joinDate": profile.join_date or "May 20, 2026",
        "role": profile.role,
        "avatarSeed": profile.avatar_seed or "Gc",
        "phone": profile.phone or "",
        "department": profile.department or "",
        "purchasedBooks": [str(bid) for bid in purchased_bids]
    }, status=status.HTTP_200_OK)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def me_update_view(request):
    """
    Updates the authenticated profile.
    """
    user = request.user
    try:
        profile = user.profile
    except Exception:
        return Response({"error": "UserProfile associated with session context not found."}, status=status.HTTP_404_NOT_FOUND)
        
    name = request.data.get('name', '').strip()
    if name:
        name_parts = name.split(' ', 1)
        user.first_name = name_parts[0]
        user.last_name = name_parts[1] if len(name_parts) > 1 else ""
        user.save()
        
    profile.phone = request.data.get('phone', profile.phone)
    profile.department = request.data.get('department', profile.department)
    profile.avatar_seed = request.data.get('avatarSeed', profile.avatar_seed)
    profile.save()
    
    purchased_bids = list(Purchase.objects.filter(user=user, payment_status='SUCCESS').values_list('book_id', flat=True))
    
    return Response({
        "name": f"{user.first_name} {user.last_name}".strip() or user.username,
        "email": user.email,
        "memberId": profile.member_id,
        "joinDate": profile.join_date,
        "role": profile.role,
        "avatarSeed": profile.avatar_seed,
        "phone": profile.phone,
        "department": profile.department,
        "purchasedBooks": [str(bid) for bid in purchased_bids]
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def purchases_profile_view(request):
    purchases = Purchase.objects.filter(user=request.user, payment_status='SUCCESS').order_by('-purchased_at')
    serializer = PurchaseSerializer(purchases, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def purchases_all_view(request):
    try:
        is_admin = request.user.profile.role == 'ADMIN' or request.user.is_superuser
    except Exception:
        is_admin = request.user.is_superuser
        
    if not is_admin:
        return Response({"error": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)
        
    purchases = Purchase.objects.all().order_by('-purchased_at')
    serializer = PurchaseSerializer(purchases, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notifications_view(request):
    notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
    data = []
    for n in notifications:
        data.append({
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "isRead": n.is_read,
            "createdAt": n.created_at.isoformat()
        })
    return Response(data, status=status.HTTP_200_OK)


class UserManagementSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    profile = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = get_user_model()
        fields = ['id', 'username', 'email', 'name', 'role', 'profile', 'password']

    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username

    def get_role(self, obj):
        if hasattr(obj, 'profile'):
            return obj.profile.role
        return 'STUDENT'

    def get_profile(self, obj):
        if hasattr(obj, 'profile'):
            p = obj.profile
            return {
                "phone": p.phone or "",
                "department": p.department or "",
                "member_id": p.member_id or "",
                "avatar_seed": p.avatar_seed or "",
                "join_date": p.join_date or "May 20, 2026"
            }
        return {
            "phone": "",
            "department": "",
            "member_id": "",
            "avatar_seed": "",
            "join_date": "May 20, 2026"
        }

    def create(self, validated_data):
        request = self.context.get('request')
        data = request.data
        
        username = data.get('username', '').strip().lower()
        email = data.get('email', '').strip()
        password = data.get('password', '').strip() or "Password123"
        name = data.get('name', '').strip()
        phone = data.get('phone', '').strip()
        department = data.get('department', '').strip()
        role = data.get('role', 'STUDENT').strip().upper()
        
        User = get_user_model()
        name_parts = name.split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ""
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        
        if role in ['ADMIN', 'LIBRARIAN']:
            user.is_staff = True
            user.save()
            
        group, _ = Group.objects.get_or_create(name=role)
        user.groups.add(group)
        
        next_num = UserProfile.objects.count() + 1010
        seed_role_prefix = "LM-ADMIN-" if role == 'ADMIN' else "LM-STAFF-" if role == 'LIBRARIAN' else "LM-2026-"
        member_id = f"{seed_role_prefix}{next_num}"
        avatar_seed = "".join([part[0] for part in name.split()]).upper()[:2] or "NB"
        
        join_date = f"{datetime.date.today().strftime('%b %d, %Y')}"
        
        UserProfile.objects.create(
            user=user,
            role=role,
            member_id=member_id,
            phone=phone,
            department=department,
            join_date=join_date,
            avatar_seed=avatar_seed
        )
        return user

    def update(self, instance, validated_data):
        request = self.context.get('request')
        data = request.data
        
        username = data.get('username')
        if username:
            instance.username = username.strip().lower()
            
        email = data.get('email')
        if email is not None:
            instance.email = email.strip()
            
        password = data.get('password')
        if password:
            instance.set_password(password)
            
        name = data.get('name')
        if name is not None:
            name_parts = name.strip().split(' ', 1)
            instance.first_name = name_parts[0]
            instance.last_name = name_parts[1] if len(name_parts) > 1 else ""
            
        role = data.get('role')
        if role:
            role = role.strip().upper()
            if role in ['ADMIN', 'LIBRARIAN']:
                instance.is_staff = True
            else:
                instance.is_staff = False
                
            instance.groups.clear()
            group, _ = Group.objects.get_or_create(name=role)
            instance.groups.add(group)
            
        instance.save()
        
        profile, created = UserProfile.objects.get_or_create(
            user=instance,
            defaults={
                'member_id': f"LM-{instance.id}",
                'role': role or 'STUDENT'
            }
        )
        
        if role:
            profile.role = role
            
        phone = data.get('phone')
        if phone is not None:
            profile.phone = phone.strip()
            
        department = data.get('department')
        if department is not None:
            profile.department = department.strip()
            
        profile.save()
        return instance


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        try:
            return request.user.profile.role == 'ADMIN'
        except Exception:
            return request.user.is_superuser


class UserManagementViewSet(viewsets.ModelViewSet):
    queryset = get_user_model().objects.all().order_by('username')
    serializer_class = UserManagementSerializer
    permission_classes = [IsAdminRole]

