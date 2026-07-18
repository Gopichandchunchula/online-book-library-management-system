import os
import sys
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'library_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from books.models import Book
from borrowings.models import UserProfile, Borrowing, Reservation

def seed_database():
    print("Starting Django backend database seeding...")
    
    # 1. Create standard Group roles
    groups = ['STUDENT', 'LIBRARIAN', 'ADMIN']
    group_instances = {}
    for g_name in groups:
        group, _ = Group.objects.get_or_create(name=g_name)
        group_instances[g_name] = group
        
    User = get_user_model()
    
    # 2. Seed Default User Accounts and matching profiles
    users_data = [
        {
            "username": "gopichand",
            "email": "gopichand@nhclindia.com",
            "password": "password",
            "first_name": "Gopichand",
            "last_name": "NHCL",
            "role": "STUDENT",
            "is_staff": False,
            "profile": {
                "member_id": "LM-2026-8902",
                "phone": "+91 98765 43210",
                "department": "Computer Science & Engineering",
                "join_date": "Sept 12, 2024",
                "avatar_seed": "Gc"
            }
        },
        {
            "username": "student",
            "email": "gopichand@nhclindia.com",
            "password": "password",
            "first_name": "Gopichand",
            "last_name": "Student",
            "role": "STUDENT",
            "is_staff": False,
            "profile": {
                "member_id": "LM-2026-8903",
                "phone": "+91 98765 43210",
                "department": "Computer Science & Engineering",
                "join_date": "Sept 12, 2024",
                "avatar_seed": "Gc"
            }
        },
        {
            "username": "sarah",
            "email": "s.jenkins@libramanage.com",
            "password": "password",
            "first_name": "Sarah",
            "last_name": "Jenkins",
            "role": "LIBRARIAN",
            "is_staff": True,
            "profile": {
                "member_id": "LM-STAFF-023",
                "phone": "+1 (555) 732-8910",
                "department": "Cataloging & Preservation",
                "join_date": "Jan 05, 2021",
                "avatar_seed": "Sj"
            }
        },
        {
            "username": "librarian",
            "email": "s.jenkins@libramanage.com",
            "password": "password",
            "first_name": "Sarah",
            "last_name": "Librarian",
            "role": "LIBRARIAN",
            "is_staff": True,
            "profile": {
                "member_id": "LM-STAFF-024",
                "phone": "+1 (555) 732-8910",
                "department": "Cataloging & Preservation",
                "join_date": "Jan 05, 2021",
                "avatar_seed": "Sj"
            }
        },
        {
            "username": "admin",
            "email": "a.vance@libramanage.com",
            "password": "password",
            "first_name": "Dr. Alistair",
            "last_name": "Vance",
            "role": "ADMIN",
            "is_staff": True,
            "is_superuser": True,
            "profile": {
                "member_id": "LM-ADMIN-001",
                "phone": "+1 (555) 100-2000",
                "department": "Library Operations & IT Director",
                "join_date": "July 15, 2018",
                "avatar_seed": "Av"
            }
        }
    ]
    
    for u_info in users_data:
        user_qs = User.objects.filter(username=u_info["username"])
        if not user_qs.exists():
            user = User.objects.create_user(
                username=u_info["username"],
                email=u_info["email"],
                password=u_info["password"],
                first_name=u_info["first_name"],
                last_name=u_info["last_name"],
                is_staff=u_info.get("is_staff", False),
                is_superuser=u_info.get("is_superuser", False)
            )
            user.groups.add(group_instances[u_info["role"]])
            
            p_info = u_info["profile"]
            UserProfile.objects.create(
                user=user,
                role=u_info["role"],
                member_id=p_info["member_id"],
                phone=p_info["phone"],
                department=p_info["department"],
                join_date=p_info["join_date"],
                avatar_seed=p_info["avatar_seed"]
            )
            print(f"Created user + profile: {u_info['username']}")
        else:
            user = user_qs.first()
            user.set_password(u_info["password"])
            user.email = u_info["email"]
            user.first_name = u_info["first_name"]
            user.last_name = u_info["last_name"]
            user.is_staff = u_info.get("is_staff", False)
            user.is_superuser = u_info.get("is_superuser", False)
            user.save()
            
            # Ensure group
            user.groups.clear()
            user.groups.add(group_instances[u_info["role"]])
            
            # Ensure Profile
            p_info = u_info["profile"]
            profile, created = UserProfile.objects.get_or_create(user=user, defaults={
                "role": u_info["role"],
                "member_id": p_info["member_id"],
                "phone": p_info["phone"],
                "department": p_info["department"],
                "join_date": p_info["join_date"],
                "avatar_seed": p_info["avatar_seed"]
            })
            if not created:
                profile.role = u_info["role"]
                profile.phone = p_info["phone"]
                profile.department = p_info["department"]
                profile.save()
            print(f"Force-updated and synced user + profile: {u_info['username']}")
            
    # 3. Seed Books Catalog if empty
    if Book.objects.count() == 0:
        books_data = [
            {
                "pk": 201, # Keep matching key reference
                "title": "Introduction to Algorithms",
                "author": "Thomas H. Cormen",
                "genre": "Technology",
                "isbn": "978-0262033848",
                "published_date": "2009-07-31",
                "copies_total": 5,
                "copies_available": 3,
                "location": "Rack A-3, Shelf 2",
                "description": "A comprehensive covers-all-foundations textbook on computer algorithms, designed specifically for students and professionals. Includes extensive pseudocode and deep complexity theory.",
                "cover_image": "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=400&q=80",
                "rating": 4.8
            },
            {
                "pk": 202,
                "title": "Dune",
                "author": "Frank Herbert",
                "genre": "Sci-Fi",
                "isbn": "978-0441172719",
                "published_date": "1965-06-01",
                "copies_total": 8,
                "copies_available": 7,
                "location": "Rack D-1, Shelf 4",
                "description": "Set in the far future amidst a sprawling feudal interstellar empire, Dune tells the story of Paul Atreides, whose family accepts the stewardship of the desert planet Arrakis.",
                "cover_image": "https://images.unsplash.com/photo-1509316975850-ff9c5edd0cd9?auto=format&fit=crop&w=400&q=80",
                "rating": 4.9
            },
            {
                "pk": 203,
                "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
                "author": "Robert C. Martin",
                "genre": "Technology",
                "isbn": "978-0132350884",
                "published_date": "2008-08-11",
                "copies_total": 10,
                "copies_available": 8,
                "location": "Rack A-3, Shelf 5",
                "description": "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. Uncle Bob presents a revolutionary paradigm for structural cleanliness and software craftsmanship.",
                "cover_image": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80",
                "rating": 4.7
            },
            {
                "pk": 204,
                "title": "The Critique of Pure Reason",
                "author": "Immanuel Kant",
                "genre": "Philosophy",
                "isbn": "978-0521657471",
                "published_date": "1781-05-01",
                "copies_total": 3,
                "copies_available": 2,
                "location": "Rack P-2, Shelf 1",
                "description": "One of the most influential works in the history of philosophy, establishing transcendental idealism and exploring the limits of human knowledge and metaphysical claims.",
                "cover_image": "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=400&q=80",
                "rating": 4.5
            },
            {
                "pk": 205,
                "title": "Brief History of Time",
                "author": "Stephen Hawking",
                "genre": "Science",
                "isbn": "978-0553380163",
                "published_date": "1988-03-01",
                "copies_total": 6,
                "copies_available": 4,
                "location": "Rack S-1, Shelf 3",
                "description": "A landmark volume written by one of the premier minds of science, explaining black holes, the big bang, cosmological frameworks, and modern quantum gravity for mainstream audiences.",
                "cover_image": "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=400&q=80",
                "rating": 4.8
            },
            {
                "pk": 206,
                "title": "To Kill a Mockingbird",
                "author": "Harper Lee",
                "genre": "Literature",
                "isbn": "978-0060935467",
                "published_date": "1960-07-11",
                "copies_total": 10,
                "copies_available": 8,
                "location": "Rack L-4, Shelf 1",
                "description": "A classic of modern American literature, exploring issues of racial injustice, moral courage, compassion, and childhood innocence in a small Southern town during the Great Depression.",
                "cover_image": "https://images.unsplash.com/photo-1474932430478-367db26836c1?auto=format&fit=crop&w=400&q=80",
                "rating": 4.9
            },
            {
                "pk": 207,
                "title": "Sapiens: A Brief History of Humankind",
                "author": "Yuval Noah Harari",
                "genre": "History",
                "isbn": "978-0062316097",
                "published_date": "2011-04-01",
                "copies_total": 7,
                "copies_available": 5,
                "location": "Rack H-1, Shelf 2",
                "description": "Sapiens integrates history and science to reconsider common narratives, tracing the evolution of Homo Sapiens from insignificant apes to rulers of the planet through powerful social myths.",
                "cover_image": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=80",
                "rating": 4.6
            },
            {
                "pk": 208,
                "title": "Deep Work: Rules for Focused Success",
                "author": "Cal Newport",
                "genre": "Technology",
                "isbn": "978-1455586691",
                "published_date": "2016-01-05",
                "copies_total": 6,
                "copies_available": 6,
                "location": "Rack A-2, Shelf 1",
                "description": "Deep work is the ability to focus without distraction on a cognitively demanding task. It is a skill that allows you to quickly master complicated details and achieve superior outputs.",
                "cover_image": "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=400&q=80",
                "rating": 4.7
            }
        ]
        
        for b_data in books_data:
            Book.objects.create(
                id=b_data["pk"],
                title=b_data["title"],
                author=b_data["author"],
                genre=b_data["genre"],
                isbn=b_data["isbn"],
                published_date=b_data["published_date"],
                copies_total=b_data["copies_total"],
                copies_available=b_data["copies_available"],
                location=b_data["location"],
                description=b_data["description"],
                cover_image=b_data["cover_image"],
                rating=b_data["rating"]
            )
        print(f"Successfully seeded {len(books_data)} default books to SQLite library catalog.")

if __name__ == '__main__':
    seed_database()
