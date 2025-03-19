
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils import timezone
from django.db.models import Avg, Count
from .models import User, Subject, Assignment, Submission, AnswerKey
from .forms import LoginForm, SubjectForm, AssignmentForm, SubmissionForm, AnswerKeyForm, GradeSubmissionForm

# AI grading function (placeholder - would be replaced with actual ML model)
def ai_grade_submission(submission, answer_key):
    """
    This is a placeholder for the AI grading functionality.
    In a real application, this would use ML to compare submission with answer key.
    """
    # Placeholder - returns a random score between 60 and 100
    import random
    return round(random.uniform(60, 100), 2)

def home(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    return render(request, 'core/home.html')

def login_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    
    if request.method == 'POST':
        form = LoginForm(request, data=request.POST)
        if form.is_valid():
            email = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=email, password=password)
            if user is not None:
                login(request, user)
                return redirect('dashboard')
            else:
                messages.error(request, "Invalid email or password.")
        else:
            messages.error(request, "Invalid email or password.")
    else:
        form = LoginForm()
    
    return render(request, 'core/login.html', {'form': form})

@login_required
def dashboard(request):
    user = request.user
    context = {}
    
    if user.role == 'student':
        # Get all submissions by this student
        submissions = Submission.objects.filter(student=user).select_related('assignment')
        assignments = Assignment.objects.filter(subject__in=Subject.objects.all())
        
        context = {
            'submissions': submissions,
            'assignments': assignments,
        }
    else:  # Teacher
        # Get subjects taught by this teacher
        subjects = Subject.objects.filter(teacher=user)
        recent_submissions = Submission.objects.filter(
            assignment__subject__teacher=user
        ).order_by('-submitted_at')[:10]
        
        # Stats for dashboard
        total_students = User.objects.filter(role='student').count()
        total_submissions = Submission.objects.filter(assignment__subject__teacher=user).count()
        average_score = Submission.objects.filter(
            assignment__subject__teacher=user,
            score__isnull=False
        ).aggregate(avg_score=Avg('score'))['avg_score'] or 0
        
        context = {
            'subjects': subjects,
            'recent_submissions': recent_submissions,
            'total_students': total_students,
            'total_submissions': total_submissions,
            'average_score': average_score,
        }
    
    return render(request, 'core/dashboard.html', context)

@login_required
def upload_submission(request, assignment_id):
    if request.user.role != 'student':
        messages.error(request, "Only students can submit assignments.")
        return redirect('dashboard')
    
    assignment = get_object_or_404(Assignment, id=assignment_id)
    
    # Check if assignment is past due
    if assignment.is_past_due:
        messages.error(request, "This assignment is past due and no longer accepting submissions.")
        return redirect('dashboard')
    
    # Check if student has already submitted
    existing_submission = Submission.objects.filter(student=request.user, assignment=assignment).first()
    
    if request.method == 'POST':
        form = SubmissionForm(request.POST, request.FILES, instance=existing_submission)
        if form.is_valid():
            submission = form.save(commit=False)
            submission.student = request.user
            submission.assignment = assignment
            submission.status = 'pending'
            submission.save()
            
            # Check if there's an answer key and auto-grade
            answer_key = getattr(assignment, 'answer_key', None)
            if answer_key:
                score = ai_grade_submission(submission, answer_key)
                submission.score = score
                submission.status = 'graded'
                submission.save()
                messages.success(request, f"Your submission has been auto-graded. Score: {score}")
            else:
                messages.success(request, "Your submission has been uploaded and is pending grading.")
            
            return redirect('dashboard')
    else:
        form = SubmissionForm(instance=existing_submission)
    
    return render(request, 'core/upload_submission.html', {
        'form': form, 
        'assignment': assignment,
        'existing_submission': existing_submission
    })

@login_required
def teacher_section(request):
    if request.user.role != 'teacher':
        messages.error(request, "Access denied. Only teachers can access this section.")
        return redirect('dashboard')
    
    return render(request, 'core/teacher_section.html')

@login_required
def subject_list(request):
    if request.user.role != 'teacher':
        messages.error(request, "Access denied. Only teachers can access this section.")
        return redirect('dashboard')
    
    subjects = Subject.objects.filter(teacher=request.user)
    
    # Get assignment counts for each subject
    for subject in subjects:
        subject.assignment_count = Assignment.objects.filter(subject=subject).count()
        subject.submission_count = Submission.objects.filter(assignment__subject=subject).count()
    
    return render(request, 'core/subject_list.html', {'subjects': subjects})

@login_required
def add_subject(request):
    if request.user.role != 'teacher':
        messages.error(request, "Access denied. Only teachers can add subjects.")
        return redirect('dashboard')
    
    if request.method == 'POST':
        form = SubjectForm(request.POST)
        if form.is_valid():
            subject = form.save(commit=False)
            subject.teacher = request.user
            subject.save()
            messages.success(request, f"Subject '{subject.name}' added successfully.")
            return redirect('subject_list')
    else:
        form = SubjectForm()
    
    return render(request, 'core/add_subject.html', {'form': form})

@login_required
def add_assignment(request, subject_id):
    if request.user.role != 'teacher':
        messages.error(request, "Access denied. Only teachers can add assignments.")
        return redirect('dashboard')
    
    subject = get_object_or_404(Subject, id=subject_id, teacher=request.user)
    
    if request.method == 'POST':
        form = AssignmentForm(request.POST)
        if form.is_valid():
            assignment = form.save(commit=False)
            assignment.subject = subject
            assignment.save()
            messages.success(request, f"Assignment '{assignment.title}' added successfully.")
            return redirect('upload_answer_key', assignment_id=assignment.id)
    else:
        form = AssignmentForm()
    
    return render(request, 'core/add_assignment.html', {'form': form, 'subject': subject})

@login_required
def upload_answer_key(request, assignment_id):
    if request.user.role != 'teacher':
        messages.error(request, "Access denied. Only teachers can upload answer keys.")
        return redirect('dashboard')
    
    assignment = get_object_or_404(Assignment, id=assignment_id, subject__teacher=request.user)
    
    try:
        answer_key = AnswerKey.objects.get(assignment=assignment)
    except AnswerKey.DoesNotExist:
        answer_key = None
    
    if request.method == 'POST':
        form = AnswerKeyForm(request.POST, request.FILES, instance=answer_key)
        if form.is_valid():
            answer_key = form.save(commit=False)
            answer_key.assignment = assignment
            answer_key.save()
            
            # Auto-grade any existing submissions
            submissions = Submission.objects.filter(assignment=assignment, status='pending')
            for submission in submissions:
                score = ai_grade_submission(submission, answer_key)
                submission.score = score
                submission.status = 'graded'
                submission.save()
            
            messages.success(request, "Answer key uploaded successfully. Any pending submissions have been auto-graded.")
            return redirect('subject_list')
    else:
        form = AnswerKeyForm(instance=answer_key)
    
    return render(request, 'core/upload_answer_key.html', {
        'form': form, 
        'assignment': assignment,
        'existing_key': answer_key
    })

@login_required
def review_submissions(request, assignment_id):
    if request.user.role != 'teacher':
        messages.error(request, "Access denied. Only teachers can review submissions.")
        return redirect('dashboard')
    
    assignment = get_object_or_404(Assignment, id=assignment_id, subject__teacher=request.user)
    submissions = Submission.objects.filter(assignment=assignment).order_by('-submitted_at')
    
    return render(request, 'core/review_submissions.html', {
        'assignment': assignment,
        'submissions': submissions
    })

@login_required
def grade_submission(request, submission_id):
    if request.user.role != 'teacher':
        messages.error(request, "Access denied. Only teachers can grade submissions.")
        return redirect('dashboard')
    
    submission = get_object_or_404(Submission, id=submission_id, assignment__subject__teacher=request.user)
    
    if request.method == 'POST':
        form = GradeSubmissionForm(request.POST, instance=submission)
        if form.is_valid():
            submission = form.save(commit=False)
            submission.status = 'graded'
            submission.save()
            messages.success(request, f"Submission by {submission.student.username} has been graded.")
            return redirect('review_submissions', assignment_id=submission.assignment.id)
    else:
        # If submission is not graded yet, try AI grading
        if submission.status == 'pending' and hasattr(submission.assignment, 'answer_key'):
            score = ai_grade_submission(submission, submission.assignment.answer_key)
            form = GradeSubmissionForm(instance=submission, initial={'score': score})
        else:
            form = GradeSubmissionForm(instance=submission)
    
    return render(request, 'core/grade_submission.html', {
        'form': form,
        'submission': submission
    })
