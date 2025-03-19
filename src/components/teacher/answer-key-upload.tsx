
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { type Subject } from './subject-list';
import { motion } from 'framer-motion';

interface AnswerKeyUploadProps {
  subject: Subject;
  onUploadComplete: () => void;
}

export function AnswerKeyUpload({ subject, onUploadComplete }: AnswerKeyUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    // Check file type
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    const validTypes = ['pdf', 'doc', 'docx'];
    
    if (!validTypes.includes(fileExt)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF or DOC file',
        variant: 'destructive',
      });
      return;
    }

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 10MB',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleButtonClick = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx';
    fileInput.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    };
    fileInput.click();
  };

  const simulateUpload = () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          simulateAiProcessing();
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const simulateAiProcessing = () => {
    setAiProcessing(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      setAiProcessing(false);
      
      // Save the answer key data in localStorage (in a real app, this would be uploaded to a server)
      const answerKeyData = {
        subjectId: subject.id,
        fileName: selectedFile?.name,
        uploadDate: new Date().toISOString(),
        questions: Math.floor(Math.random() * 20) + 10, // Random number of questions (10-30)
      };
      
      const answerKeys = JSON.parse(localStorage.getItem('answerKeys') || '{}');
      answerKeys[subject.id] = answerKeyData;
      localStorage.setItem('answerKeys', JSON.stringify(answerKeys));
      
      toast({
        title: 'Answer key processed',
        description: 'The answer key has been successfully processed by the AI',
      });
      
      // Generate some mock student submissions for demo purposes
      const mockSubmissions = Array.from({ length: Math.floor(Math.random() * 5) + 3 }, (_, i) => ({
        id: `submission-${Date.now()}-${i}`,
        subjectId: subject.id,
        studentName: `Student ${i + 1}`,
        studentId: `STU${1000 + i}`,
        submissionDate: new Date().toISOString(),
        score: null, // Will be calculated when reviewed
        status: 'pending', // pending, reviewed
      }));
      
      const submissions = JSON.parse(localStorage.getItem('submissions') || '{}');
      submissions[subject.id] = [...(submissions[subject.id] || []), ...mockSubmissions];
      localStorage.setItem('submissions', JSON.stringify(submissions));
      
      // Update subject submissions count in localStorage
      const storedSubjects = JSON.parse(localStorage.getItem('teacherSubjects') || '[]');
      const updatedSubjects = storedSubjects.map((s: Subject) => 
        s.id === subject.id ? { ...s, submissions: mockSubmissions.length } : s
      );
      localStorage.setItem('teacherSubjects', JSON.stringify(updatedSubjects));
      
      onUploadComplete();
    }, 2000);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`border-2 border-dashed rounded-xl p-8 text-center ${
            isDragging ? 'border-primary bg-primary/5' : 'border-border'
          } transition-all duration-200`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="rounded-full bg-primary/10 p-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Upload Answer Key</h3>
              <p className="text-sm text-muted-foreground mt-1">Drag and drop or click to upload</p>
            </div>
            <Button onClick={handleButtonClick}>Select Answer Key</Button>
            <p className="text-xs text-muted-foreground">
              Supported formats: pdf, doc, docx (Max: 10MB)
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="border rounded-xl p-6 space-y-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium">{selectedFile.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            {!isUploading && !aiProcessing && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRemoveFile}
                className="h-8 w-8 p-0 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            )}
          </div>
          
          {isUploading ? (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-1" />
            </div>
          ) : aiProcessing ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                <span className="text-sm">AI processing answer key...</span>
              </div>
              <Progress value={70} className="h-1" />
            </div>
          ) : (
            <Button 
              onClick={simulateUpload} 
              className="w-full"
            >
              Upload Answer Key
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
}
