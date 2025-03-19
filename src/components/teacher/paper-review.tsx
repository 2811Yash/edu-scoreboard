
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { type Subject } from './subject-list';
import { motion } from 'framer-motion';

interface Submission {
  id: string;
  subjectId: string;
  studentName: string;
  studentId: string;
  submissionDate: string;
  score: number | null;
  status: 'pending' | 'reviewed';
}

export function PaperReview({ subject }: { subject: Subject }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewProgress, setReviewProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Load submissions from localStorage
    const allSubmissions = JSON.parse(localStorage.getItem('submissions') || '{}');
    const subjectSubmissions = allSubmissions[subject.id] || [];
    setSubmissions(subjectSubmissions);
  }, [subject]);

  const handleReviewPaper = (submission: Submission) => {
    setSelectedSubmission(submission);
    setIsReviewing(true);
    setReviewProgress(0);
    
    // Simulate AI reviewing process
    const interval = setInterval(() => {
      setReviewProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          completeReview(submission);
          return 100;
        }
        return prev + 2; // Slower progress for review
      });
    }, 100);
  };

  const completeReview = (submission: Submission) => {
    setTimeout(() => {
      // Generate a random score between 60 and 100
      const score = Math.floor(Math.random() * 41) + 60;
      
      // Update the submission in state and localStorage
      const updatedSubmission = { 
        ...submission, 
        score, 
        status: 'reviewed' as const 
      };
      
      const updatedSubmissions = submissions.map(s => 
        s.id === submission.id ? updatedSubmission : s
      );
      
      setSubmissions(updatedSubmissions);
      
      // Update localStorage
      const allSubmissions = JSON.parse(localStorage.getItem('submissions') || '{}');
      allSubmissions[subject.id] = updatedSubmissions;
      localStorage.setItem('submissions', JSON.stringify(allSubmissions));
      
      setIsReviewing(false);
      setSelectedSubmission(updatedSubmission);
      
      toast({
        title: "Paper Review Complete",
        description: `${submission.studentName}'s paper has been graded with a score of ${score}%`,
      });
    }, 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "bg-gray-200 text-gray-700";
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 75) return "bg-blue-100 text-blue-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };
  
  const getScoreDescription = (score: number | null) => {
    if (score === null) return "Not reviewed";
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Good";
    if (score >= 60) return "Satisfactory";
    return "Needs improvement";
  };

  return (
    <div className="space-y-6 pt-4">
      {submissions.length === 0 ? (
        <div className="text-center p-8">
          <h3 className="text-lg font-medium mb-2">No submissions available</h3>
          <p className="text-muted-foreground">
            There are no student submissions for this subject yet.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium">Student Submissions</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {submissions.map((submission) => (
                <Card 
                  key={submission.id}
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    selectedSubmission?.id === submission.id ? 'ring-1 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{submission.studentName}</h4>
                        <p className="text-sm text-muted-foreground">ID: {submission.studentId}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Submitted: {formatDate(submission.submissionDate)}
                        </p>
                      </div>
                      <Badge 
                        variant="secondary"
                        className={`${
                          submission.status === 'reviewed' 
                            ? submission.score !== null 
                              ? getScoreColor(submission.score) 
                              : '' 
                            : ''
                        }`}
                      >
                        {submission.status === 'reviewed' 
                          ? submission.score !== null 
                            ? `${submission.score}%` 
                            : 'Reviewed' 
                          : 'Pending'
                        }
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <div>
            {selectedSubmission ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">Submission Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Student</p>
                      <p className="font-medium">{selectedSubmission.studentName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Student ID</p>
                      <p className="font-medium">{selectedSubmission.studentId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Submitted On</p>
                      <p className="font-medium">{formatDate(selectedSubmission.submissionDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{selectedSubmission.status}</p>
                    </div>
                  </div>
                  
                  {selectedSubmission.status === 'reviewed' ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <div className="flex justify-between mb-1">
                          <p className="font-medium">Score:</p>
                          <p className="font-bold">{selectedSubmission.score}%</p>
                        </div>
                        <Progress value={selectedSubmission.score || 0} className="h-2" />
                        <p className="text-sm mt-1 font-medium text-right">
                          {getScoreDescription(selectedSubmission.score)}
                        </p>
                      </div>
                      
                      <div className="pt-2">
                        <h4 className="font-medium mb-2">AI Feedback</h4>
                        <Card className="bg-muted/50">
                          <CardContent className="p-4 text-sm">
                            <p className="mb-2">The student's answer sheet shows {selectedSubmission.score && selectedSubmission.score >= 80 ? 'excellent' : selectedSubmission.score && selectedSubmission.score >= 70 ? 'good' : 'adequate'} understanding of the subject matter.</p>
                            <ul className="list-disc pl-5 space-y-1">
                              {selectedSubmission.score && selectedSubmission.score >= 85 && (
                                <li>Strong grasp of key concepts and their applications.</li>
                              )}
                              {selectedSubmission.score && selectedSubmission.score >= 75 && (
                                <li>Well-structured responses with clear reasoning.</li>
                              )}
                              {selectedSubmission.score && selectedSubmission.score < 75 && (
                                <li>Some concepts need further clarification.</li>
                              )}
                              {selectedSubmission.score && selectedSubmission.score < 70 && (
                                <li>Review of fundamental principles recommended.</li>
                              )}
                              <li>Overall {selectedSubmission.score && selectedSubmission.score >= 80 ? 'excellent' : selectedSubmission.score && selectedSubmission.score >= 70 ? 'good' : 'fair'} performance compared to expected outcomes.</li>
                            </ul>
                          </CardContent>
                        </Card>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="pt-4">
                      {isReviewing ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                              <span className="text-sm">AI is reviewing this paper...</span>
                            </div>
                            <Progress value={reviewProgress} className="h-1" />
                          </div>
                          <div className="bg-muted/50 p-4 rounded-md text-sm">
                            <p>The AI is analyzing the student's answers against the answer key.</p>
                            <p className="mt-2">This usually takes 15-30 seconds.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-center pt-4">
                          <Button onClick={() => handleReviewPaper(selectedSubmission)}>
                            Start AI Review
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="h-full flex items-center justify-center border rounded-lg p-8">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Select a submission</h3>
                  <p className="text-muted-foreground text-sm">
                    Select a student submission from the list to view details and start AI review.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
