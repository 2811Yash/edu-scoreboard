
import os
import django
import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gradesync.settings')
django.setup()

from django.contrib.auth import get_user_model
from core.models import Subject, Assignment, AnswerKey, Submission
from django.utils import timezone

User = get_user_model()

def create_demo_data():
    # Create demo users if they don't exist
    if not User.objects.filter(email='teacher@example.com').exists():
        teacher = User.objects.create_user(
            username='teacher',
            email='teacher@example.com',
            password='password',
            role='teacher'
        )
        print("Created teacher user")
    else:
        teacher = User.objects.get(email='teacher@example.com')
        print("Teacher user already exists")
    
    if not User.objects.filter(email='student@example.com').exists():
        student = User.objects.create_user(
            username='student',
            email='student@example.com',
            password='password',
            role='student'
        )
        print("Created student user")
    else:
        student = User.objects.get(email='student@example.com')
        print("Student user already exists")
    
    # Create a demo subject
    subject, created = Subject.objects.get_or_create(
        name='Introduction to Python',
        code='PY101',
        teacher=teacher
    )
    if created:
        print(f"Created subject: {subject.name}")
    else:
        print(f"Subject {subject.name} already exists")
    
    # Create a demo assignment
    assignment, created = Assignment.objects.get_or_create(
        title='Python Basics Quiz',
        defaults={
            'description': 'A basic quiz covering Python fundamentals including variables, data types, and control flow.',
            'subject': subject,
            'due_date': timezone.now() + datetime.timedelta(days=7),
            'total_points': 100
        }
    )
    if created:
        print(f"Created assignment: {assignment.title}")
    else:
        print(f"Assignment {assignment.title} already exists")
    
    print("Demo data creation completed!")

if __name__ == '__main__':
    create_demo_data()
