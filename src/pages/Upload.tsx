
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/main-layout';
import { FileUpload } from '@/components/upload/file-upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

const Upload = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const role = localStorage.getItem('userRole');
    
    if (!isLoggedIn) {
      navigate('/');
      return;
    }
    
    setUserRole(role);
  }, [navigate]);
  
  const handleUploadComplete = (file: File) => {
    setTimeout(() => {
      toast({
        title: 'File processed',
        description: userRole === 'teacher' 
          ? 'Answer key processed. Ready to grade student submissions.'
          : 'Your submission has been received and will be graded soon.',
      });
      
      if (userRole === 'teacher') {
        // Simulate redirect to results page for teachers
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    }, 1000);
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-3xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            {userRole === 'student' ? 'Submit Assignment' : 'Upload Answer Key'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {userRole === 'student'
              ? 'Upload your completed assignment for grading'
              : 'Upload the answer key to grade student submissions'
            }
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {userRole === 'student' ? 'Assignment Submission' : 'Answer Key Upload'}
            </CardTitle>
            <CardDescription>
              {userRole === 'student'
                ? 'Please upload your completed assignment in PDF or DOC format'
                : 'Upload the answer key to automatically grade student submissions'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              title={userRole === 'student' ? 'Upload Assignment' : 'Upload Answer Key'}
              description={
                userRole === 'student'
                  ? 'Drag and drop your assignment file here'
                  : 'Drag and drop the answer key file here'
              }
              acceptedFileTypes=".pdf,.doc,.docx"
              maxSizeMB={10}
              onUploadComplete={handleUploadComplete}
            />
          </CardContent>
        </Card>
        
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Guide to Submission Format</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <p>
                  For best results, please ensure your submission follows these guidelines:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Use clear handwriting or typed text</li>
                  <li>Number your answers to match the question numbers</li>
                  <li>Save your file as PDF for best compatibility</li>
                  <li>Ensure all pages are properly oriented</li>
                  <li>Include your name and student ID on all pages</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  {userRole === 'student'
                    ? 'After submission, your assignment will be automatically graded against the answer key.'
                    : 'After uploading the answer key, the system will automatically grade all student submissions.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default Upload;
