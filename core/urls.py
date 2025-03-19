
from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('', views.home, name='home'),
    path('login/', views.login_view, name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='home'), name='logout'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('upload/<int:assignment_id>/', views.upload_submission, name='upload_submission'),
    
    # Teacher specific URLs
    path('teacher/', views.teacher_section, name='teacher_section'),
    path('teacher/subjects/', views.subject_list, name='subject_list'),
    path('teacher/subjects/add/', views.add_subject, name='add_subject'),
    path('teacher/assignments/add/<int:subject_id>/', views.add_assignment, name='add_assignment'),
    path('teacher/answer-key/upload/<int:assignment_id>/', views.upload_answer_key, name='upload_answer_key'),
    path('teacher/review-submissions/<int:assignment_id>/', views.review_submissions, name='review_submissions'),
    path('teacher/grade-submission/<int:submission_id>/', views.grade_submission, name='grade_submission'),
]
