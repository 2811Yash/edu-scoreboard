
# GradeSync - AI-Powered Grading Platform

GradeSync is a Django-based web application that automates the grading process for teachers and students. Teachers can upload answer keys, and the system uses AI to grade student submissions automatically.

## Features

- **Role-based Authentication**: Separate interfaces for teachers and students
- **Teacher Features**:
  - Create and manage subjects
  - Create assignments with due dates
  - Upload answer keys
  - Review and grade student submissions (manual and AI-assisted)
- **Student Features**:
  - View assignments
  - Submit answers
  - Track grades and progress
- **AI Grading**: Automatically grades student submissions by comparing with answer keys

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/2811Yash/edu-scoreboard.git
   cd gradesync
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```
   python manage.py makemigrations
   python manage.py migrate
   ```

5. Create demo data (optional):
   ```
   python initialize_db.py
   ```

6. Create a superuser (for admin access):
   ```
   python manage.py createsuperuser
   ```

7. Run the development server:
   ```
   python manage.py runserver
   ```

8. Access the application at http://127.0.0.1:8000/

## Demo Accounts

After running the `initialize_db.py` script, you can use these demo accounts:

- **Teacher**:
  - Email: teacher@example.com
  - Password: password

- **Student**:
  - Email: student@example.com
  - Password: password

## Customizing the AI Grading

The current implementation uses a placeholder AI grading function. To implement actual AI grading:

1. Open `core/views.py`
2. Replace the `ai_grade_submission` function with your ML model implementation
3. Make sure to properly compare the submission with the answer key

## Project Structure

- `gradesync/` - Project configuration
- `core/` - Main application
  - `models.py` - Database models
  - `views.py` - View functions
  - `forms.py` - Form definitions
  - `urls.py` - URL routes
- `templates/` - HTML templates
- `static/` - Static files (CSS, JS, images)
- `media/` - User-uploaded files

## License

This project is licensed under the MIT License - see the LICENSE file for details.
