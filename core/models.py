
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('teacher', 'Teacher'),
    )
    
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.email

class Subject(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20)
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subjects')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.code} - {self.name}"

class Assignment(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='assignments')
    due_date = models.DateTimeField()
    total_points = models.PositiveIntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title
    
    @property
    def is_past_due(self):
        return timezone.now() > self.due_date

class AnswerKey(models.Model):
    assignment = models.OneToOneField(Assignment, on_delete=models.CASCADE, related_name='answer_key')
    file = models.FileField(upload_to='answer_keys/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Answer Key for {self.assignment.title}"

class Submission(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('graded', 'Graded'),
    )
    
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions')
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    file = models.FileField(upload_to='submissions/')
    submitted_at = models.DateTimeField(auto_now_add=True)
    score = models.FloatField(null=True, blank=True)
    feedback = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    
    class Meta:
        unique_together = ('student', 'assignment')
    
    def __str__(self):
        return f"{self.student.username}'s submission for {self.assignment.title}"
