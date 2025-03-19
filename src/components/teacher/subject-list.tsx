
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Book, FileCheck, FileText } from 'lucide-react';
import { AnswerKeyUpload } from './answer-key-upload';
import { PaperReview } from './paper-review';

export type Subject = {
  id: string;
  name: string;
  description: string;
  hasAnswerKey: boolean;
  submissions: number;
};

export function SubjectList() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubject, setNewSubject] = useState({ name: '', description: '' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showAnswerKeyDialog, setShowAnswerKeyDialog] = useState<Subject | null>(null);
  const [showPaperReviewDialog, setShowPaperReviewDialog] = useState<Subject | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load subjects from localStorage
    const storedSubjects = localStorage.getItem('teacherSubjects');
    if (storedSubjects) {
      setSubjects(JSON.parse(storedSubjects));
    }
  }, []);

  // Save subjects to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('teacherSubjects', JSON.stringify(subjects));
  }, [subjects]);

  const handleAddSubject = () => {
    if (!newSubject.name.trim()) {
      toast({
        title: "Subject name required",
        description: "Please enter a subject name",
        variant: "destructive",
      });
      return;
    }

    const newSubjectItem: Subject = {
      id: Date.now().toString(),
      name: newSubject.name,
      description: newSubject.description || "No description provided",
      hasAnswerKey: false,
      submissions: 0,
    };

    setSubjects([...subjects, newSubjectItem]);
    setNewSubject({ name: '', description: '' });
    setIsDialogOpen(false);
    
    toast({
      title: "Subject added",
      description: `${newSubject.name} has been added successfully`,
    });
  };

  const handleAnswerKeyUploaded = (subjectId: string) => {
    setSubjects(subjects.map(subject => 
      subject.id === subjectId ? { ...subject, hasAnswerKey: true } : subject
    ));
    setShowAnswerKeyDialog(null);
    
    toast({
      title: "Answer key uploaded",
      description: "The answer key has been uploaded successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Your Subjects</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
              <DialogDescription>
                Create a new subject for students to submit their answer sheets.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Subject Name</Label>
                <Input 
                  id="name" 
                  value={newSubject.name} 
                  onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                  placeholder="e.g., Mathematics, Physics"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input 
                  id="description" 
                  value={newSubject.description} 
                  onChange={(e) => setNewSubject({...newSubject, description: e.target.value})}
                  placeholder="Brief description of the subject"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddSubject}>Add Subject</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {subjects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center p-10">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Book className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">No subjects yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding your first subject to upload answer keys and review student submissions.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Subject
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Card key={subject.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle>{subject.name}</CardTitle>
                <CardDescription>{subject.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Answer Key:</span>
                  <span className={`text-sm font-medium ${subject.hasAnswerKey ? 'text-green-500' : 'text-yellow-500'}`}>
                    {subject.hasAnswerKey ? 'Uploaded' : 'Not Uploaded'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Student Submissions:</span>
                  <span className="text-sm font-medium">{subject.submissions}</span>
                </div>
              </CardContent>
              <CardFooter className="pt-2 flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowAnswerKeyDialog(subject)}
                >
                  <FileCheck className="mr-2 h-4 w-4" />
                  {subject.hasAnswerKey ? 'Update Key' : 'Upload Key'}
                </Button>
                <Button 
                  variant={subject.hasAnswerKey ? "default" : "secondary"} 
                  className="flex-1"
                  disabled={!subject.hasAnswerKey || subject.submissions === 0}
                  onClick={() => setShowPaperReviewDialog(subject)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Review Papers
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog for uploading answer key */}
      {showAnswerKeyDialog && (
        <Dialog open={!!showAnswerKeyDialog} onOpenChange={() => setShowAnswerKeyDialog(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Upload Answer Key for {showAnswerKeyDialog.name}</DialogTitle>
              <DialogDescription>
                Upload the answer key to automatically grade student submissions.
              </DialogDescription>
            </DialogHeader>
            <AnswerKeyUpload 
              subject={showAnswerKeyDialog} 
              onUploadComplete={() => handleAnswerKeyUploaded(showAnswerKeyDialog.id)} 
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog for reviewing papers */}
      {showPaperReviewDialog && (
        <Dialog 
          open={!!showPaperReviewDialog} 
          onOpenChange={() => setShowPaperReviewDialog(null)}
        >
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review Papers - {showPaperReviewDialog.name}</DialogTitle>
              <DialogDescription>
                AI-assisted review of student submissions.
              </DialogDescription>
            </DialogHeader>
            <PaperReview subject={showPaperReviewDialog} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
