from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.models import Group
from borrowings.models import UserProfile
from .auth import generate_jwt
import time

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
            "department": profile.department or ""
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
    import datetime
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
            "department": department
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
        
    return Response({
        "name": f"{user.first_name} {user.last_name}".strip() or user.username,
        "email": user.email,
        "memberId": profile.member_id,
        "joinDate": profile.join_date or "May 20, 2026",
        "role": profile.role,
        "avatarSeed": profile.avatar_seed or "Gc",
        "phone": profile.phone or "",
        "department": profile.department or ""
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
    
    return Response({
        "name": f"{user.first_name} {user.last_name}".strip() or user.username,
        "email": user.email,
        "memberId": profile.member_id,
        "joinDate": profile.join_date,
        "role": profile.role,
        "avatarSeed": profile.avatar_seed,
        "phone": profile.phone,
        "department": profile.department
    }, status=status.HTTP_200_OK)
