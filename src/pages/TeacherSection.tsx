
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/main-layout';
import { SubjectList } from '@/components/teacher/subject-list';
import { PageTransition } from '@/components/ui/page-transition';
import { useToast } from '@/components/ui/use-toast';

const TeacherSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in and is a teacher
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userRole = localStorage.getItem('userRole');
    
    if (!isLoggedIn) {
      navigate('/');
      return;
    }
    
    if (userRole !== 'teacher') {
      toast({
        title: "Access denied",
        description: "Only teachers can access this section",
        variant: "destructive",
      });
      navigate('/dashboard');
      return;
    }
    
    setIsLoading(false);
  }, [navigate, toast]);

  if (isLoading) {
    return null;
  }

  return (
    <MainLayout>
      <PageTransition>
        <div className="container py-8 max-w-6xl">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Teacher Management</h1>
          <SubjectList />
        </div>
      </PageTransition>
    </MainLayout>
  );
};

export default TeacherSection;
