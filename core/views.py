
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate,logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils import timezone
from django.db.models import Avg, Count
from .models import User, Subject, Assignment, Submission, AnswerKey
from .forms import LoginForm, SubjectForm, AssignmentForm, SubmissionForm, AnswerKeyForm, GradeSubmissionForm ,RegisterForm
import os
import pdf2image
import moondream as md 
from groq import Groq
from PIL import Image
import json
from dotenv import load_dotenv
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import simpleSplit
from django.core.files.base import ContentFile
load_dotenv()

# Initialize Moondream AI
# model = md.vl(api_key=os.getenv("MOONDREAM_API_KEY"))
# client = Groq(api_key=os.getenv("GROQ_API_KEY"))


model = md.vl(api_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlfaWQiOiJmOWFhNmE4NS1lZTAwLTQwN2QtYTU1OC1jYjZlMzMyZGQ4NDIiLCJpYXQiOjE3MzgwNTA1NDN9.8QYSLbRCCF_JFDUfPQwesCRcvkzwFdZlQHFj2Hm6Oco")
client = Groq(api_key=os.environ.get("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"))


# Function to convert PDF to images
def convert_pdf_to_images(pdf_file):
    # print("I am in converting")
    try:
        images = pdf2image.convert_from_bytes(pdf_file.read())
        return images
    except Exception as e:
        return f"Error converting PDF to images: {e}"

# Function to save image temporarily
def save_temp_image(image, filename):
    print("I am in temp images")
    temp_dir = "temp_images"
    os.makedirs(temp_dir, exist_ok=True)
    
    temp_path = os.path.join(temp_dir, filename)
    
    if isinstance(image, str):  # If `image` is a path, open it
        image = Image.open(image)
    
    image.save(temp_path, format="JPEG")
    # print(temp_path)
    return temp_path

# Function to extract text from image using Moondream AI
def get_text_from_image(image, index, doc_type):
    print("I am in images")
    try:
        image_path = save_temp_image(image, f"{doc_type}_page_{index}.jpeg")
        
        # Ensure `image` is an Image object
        image = Image.open(image_path)
        
        encoded_image = model.encode_image(image)
        response = model.query(encoded_image, "Extract the text from the image.")
        # print(response)
        
        return response["answer"].replace("\n", " ") if response else "Error: AI did not return text."
    except Exception as e:
        return f"Error extracting text: {e}"

from itertools import islice

# Function to divide student responses into chunks of 5 pages
def chunk_data(data, chunk_size=5):
    """Splits the given list into chunks of `chunk_size`."""
    for i in range(0, len(data), chunk_size):
        yield data[i:i + chunk_size]

def final(response):
    if not response:
        return "Error: Missing text input for evaluation."

    prompt = f"""
    you have to evaluate this response and give me the output by calculating score of each question output should be clear and accurate all the scores are out of 6 
    now review this response and extract total score by extracting each question marks
    text to evaluate:{response}
    now give me the output as the each question with their score and finally calculate the total score 
    output should be strictly in json
    The JSON should contain:
        - "questions": A list of question-wise feedback with:
        - "question_number"   
        - "feedback"
        - "score":for a single question  
        - total score: (calculate the accurate score)
    """
    try:
        chat = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="gemma2-9b-it",
        )
        ai_reply = chat.choices[0].message.content.strip()
        print(ai_reply)
        return ai_reply
        
    except Exception as e:  
        # st.error(f"Error evaluating answer: {e}")
        return "Error: Unable to calculate score."
    
# Function to evaluate the student's submission
def evaluate_answer(teacher_text, student_text):
    print("I am in evaluate")
    if not teacher_text or not student_text:
        return "Error: Missing text input for evaluation."

    prompt = f"""
    You are a teacher evaluating student answers.
    Compare the student's response with the teacher's responses form teachers answersheet and calculate a percentage-based score.
    Provide question-wise scores and the total score out of the score mention in the teacher's answer paper 
    dont consider the optional question if there is mention in the teacher's answer sheet and calculate the score based on the similarity between teacher and student answers.
    each question is of 6 marks total so calculate on that basis

    Teacher's Answer:
    {teacher_text}

    Student's Answer:
    {student_text}
     give me the proper json format output 
    in given format always 
    The JSON should contain:
    - "questions": A list of question-wise feedback with:
      - "question_number"   
      - "feedback"
      - "score":for a single question 
    - "total_score": Overall score percentage.
    """

    # prompt=f"""You are an AI exam evaluator responsible for assessing student answer sheets based on a predefined marking scheme. Your task includes:

    #     Evaluating Answers: check each student’s response and assign marks accordingly.

    #     Handling Extra Questions: If the student attempts more than the required number of questions, follow these rules:

    #     Select the highest-scoring answers and ignore the extra ones.

    #     Ensure the final score does not exceed the total possible marks.

    #     Marking Scheme: Deduct marks for incorrect, incomplete, or partially correct answers based on the given rubric.

    #     Feedback & Explanation: Provide concise feedback for each answer, mentioning key mistakes, missing points, or areas of improvement.
    #     student answer with question paper{student_text}
    #     sometimes question shuld be like q1a,q1b,q1c so handle those types and according to the student given answers take the question numbers .
    #     each question is of 6 marks each so give marks according to it .and dont give total score in percentage
    #     The JSON should contain:
    #     - "questions": A list of question-wise feedback with:
    #     - "question_number"   
    #     - "feedback"
    #     - "score":for a single question 
    # it should be the strict json format """
    # print(prompt)
    try:
        chat = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="qwen-2.5-32b",
        )
        response=chat.choices[0].message.content.strip()
        # print(response)
        return response
        # return chat.choices[0].message.content.strip()
    except Exception as e:
        return f"Error evaluating answer: {e}"
import re
import json
def extract_json(text):
    match = re.search(r'\{.*\}', text, re.DOTALL)  # Extract content inside { }
    if match:
        json_content = match.group(0)
        try:
            parsed_json = json.loads(json_content)  # Ensure it's valid JSON
            return parsed_json
        except json.JSONDecodeError:
            return "Invalid JSON format"
    return "No JSON found"
# Main fhunction to process grading
def ai_grade_submission(submission, answer_key):
    # Convert PDFs to images
    teacher_images = convert_pdf_to_images(answer_key)
    student_images = convert_pdf_to_images(submission)

    if not teacher_images or not student_images:
        return "Error: Failed to process PDF files."
    else:
        # print(len(teacher_images))
        teacher_texts = [get_text_from_image(img, i, "teacher") for i, img in enumerate(teacher_images)]
        student_texts = [get_text_from_image(img, i, "student") for i, img in enumerate(student_images)]

        teacher_text = "\n".join(filter(None, teacher_texts))
        student_text = "\n".join(filter(None, student_texts))

        if not teacher_text or not student_text:
            return "Error: No text extracted from images."
        else:
            # st.subheader("Evaluating Answers with LLM...")

            # Process student responses in chunks of 5 pages
            student_chunks = list(chunk_data(student_texts, 5))
            scores = []

            for index, student_chunk in enumerate(student_chunks):
                student_text = "\n".join(student_chunk)
                # st.write(f"Evaluating batch {index+1}...")

                score = evaluate_answer(teacher_text, student_text)
                scores.append(score)

            # Combine and display results

            final_score = "\n".join(scores)
            response1=final(final_score)
            
            extracted_json = extract_json(response1)
            print(extracted_json)
            # print(response1)

            # st.success(f"Final Evaluation:\n{response1}")
            return extracted_json

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
def generate_feedback_pdf(feedback_data):
    """
    Generate a PDF file from the JSON feedback data.
    Returns the PDF file as a Django ContentFile.
    """
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    c.setFont("Courier", 10)

    x, y = 50, height - 50  # Start position

    c.drawString(x, y, "Assignment Feedback")
    y -= 20

    for question in feedback_data:
        question_text = f"Q{question['question_number']}: {question['feedback']}"
        if y <= 50:
            c.showPage()
            c.setFont("Courier", 10)
            y = height - 50
        c.drawString(x, y, question_text)
        y -= 15

    c.save()
    buffer.seek(0)
    return ContentFile(buffer.getvalue(), name="feedback.pdf")

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
            try:
                answer_key = AnswerKey.objects.get(assignment=assignment)
            except AnswerKey.DoesNotExist:
                answer_key = None

            if answer_key:
                score_json = ai_grade_submission(submission.file, answer_key.file)
                try:
                    score_data = score_json
                except json.JSONDecodeError as e:
                    print(f"JSONDecodeError: {e}")  # Debugging
                    messages.error(request, "Error processing grading results. Please contact support.")
                    print(e)
                    return redirect('dashboard')            
                score = score_data.get("total_score", 0)
                feedback_json = score_data.get("questions", [])
                pdf_file = generate_feedback_pdf(feedback_json)
                submission.feedback.save(f"feedback_{submission.id}.pdf", pdf_file)
                submission.score = score
                print(score)
                percentage_score = (int(score) / int(submission.assignment.total_points)) * 100
                print(percentage_score)
                submission.score=percentage_score
                # Adjust score if it's 26% or 27%
                if percentage_score in [26, 27]:
                    percentage_score = 28
                    submission.score = round((percentage_score / 100) * submission.assignment.total_points)
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
def register_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.username = user.email  # Ensure a username is set
            user.save()
            messages.success(request, "Account created successfully! You can now log in.")
            return redirect('login')
        else:
            messages.error(request, "Error creating account. Please check the form.")
    else:
        form = RegisterForm()

    return render(request, 'core/register.html', {'form': form})
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
    # print(submission.assignment.id)
    if request.method == 'POST':
        form = GradeSubmissionForm(request.POST, instance=submission)
        if form.is_valid():
            submission = form.save(commit=False)
            submission.status = 'graded'
            submission.save()
            messages.success(request, f"Submission by {submission.student.username} has been graded.")
            return redirect('review_submissions', assignment_id=submission.assignment.id)

        # If submission is not graded yet, try AI grading
    if request.method == 'POST':
        form = GradeSubmissionForm(request.POST, request.FILES, instance=submission)

        # ✅ Prevent overwriting feedback if no new file is uploaded
        if 'feedback' not in request.FILES:
            form.fields.pop('feedback', None)

        if form.is_valid():
            submission = form.save(commit=False)
            submission.status = 'graded'  # ✅ Mark as graded when teacher updates score manually
            submission.save()
            messages.success(request, f"Submission by {submission.student.username} has been graded.")
            return redirect('review_submissions', assignment_id=submission.assignment.id)
    else:
        # ✅ Load the form without applying AI grading
        form = GradeSubmissionForm(instance=submission)
    
    return render(request, 'core/grade_submission.html', {
        'form': form,
        'submission': submission
    })
def evaluate_student_only_answer(student_text):
    print("Evaluating with LLM (student-only)...")
    
    if not student_text:
        return "Error: Missing student submission for evaluation."

    prompt = f"""
    You are a highly skilled AI teacher evaluating a student's written answer sheet.
    There is no teacher answer provided. You must evaluate based on the structure, coherence, correctness, and subject relevance of the answers.

    Guidelines:
    - Evaluate each answer individually.
    - Each question carries 6 marks.
    - Deduct marks for vague, incorrect, or poorly structured answers.
    - If the answer is off-topic or incorrect, give appropriate feedback and score.
    - If the student has written multiple parts (like Q1a, Q1b, etc.), treat them separately.

    Student's Answer Sheet:
    {student_text}

    Provide your response in strict JSON format as follows:
    {{
        "questions": [
            {{
                "question_number": "Q1a",
                "feedback": "Answer is mostly correct but lacks explanation.",
                "score": 4
            }},
            ...
        ]
        
    }}
    """

    try:
        chat = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="qwen-2.5-32b",
        )
        return chat.choices[0].message.content.strip()
    except Exception as e:
        return f"Error evaluating answer: {e}"
def ai_grade_student_only_submission(submission):
    # Convert student PDF to images
    student_images = convert_pdf_to_images(submission)

    if not student_images:
        return "Error: Failed to process student PDF."
    
    # Extract text from student images
    student_texts = [get_text_from_image(img, i, "student") for i, img in enumerate(student_images)]
    student_texts = list(filter(None, student_texts))  # Remove empty strings

    if not student_texts:
        return "Error: No text extracted from student submission."

    # Process student responses in chunks (e.g., 5 pages per chunk)
    student_chunks = list(chunk_data(student_texts, 5))
    scores = []

    for index, student_chunk in enumerate(student_chunks):
        student_text = "\n".join(student_chunk)
        print(f"Evaluating chunk {index+1} with LLM...")
        
        score = evaluate_student_only_answer(student_text)  # New prompt version
        scores.append(score)

    # Combine all LLM responses
    final_score = "\n".join(scores)

    # Optionally clean/merge or process responses
    response1 = final(final_score)  # Assumes final() formats or merges multiple JSONs
    extracted_json = extract_json(response1)

    print(extracted_json)  # Debug
    return extracted_json


@login_required
def check_with_llm(request, submission_id):
    if request.user.role != 'teacher':
        messages.error(request, "Only teachers can use AI grading.")
        return redirect('dashboard')

    submission = get_object_or_404(Submission, id=submission_id)

    if request.method == 'POST':
        try:
            # Grade only using student's submitted file
            score_json = ai_grade_student_only_submission(submission.file)  # assume second argument can be optional or None
            score_data = score_json

            score = score_data.get("total_score", 0)
            feedback_json = score_data.get("questions", [])

            # Generate PDF feedback
            pdf_file = generate_feedback_pdf(feedback_json)
            submission.feedback.save(f"llm_feedback_{submission.id}.pdf", pdf_file)

            # Calculate percentage score
            percentage_score = (int(score) / int(submission.assignment.total_points)) * 100
            submission.score = percentage_score

            # Adjust score if it falls under edge cases
            if percentage_score in [26, 27]:
                percentage_score = 28
                submission.score = round((percentage_score / 100) * submission.assignment.total_points,2)

            submission.status = 'graded'
            submission.save()

            messages.success(request, f"AI grading complete. Score: {submission.score}")
        except Exception as e:
            print(f"LLM grading error: {e}")
            messages.error(request, "There was an error during AI grading. Please try again later.")

    return redirect('grade_submission', submission_id=submission.id)

def logout_view(request):
    logout(request)
    return render(request, 'core/home.html')