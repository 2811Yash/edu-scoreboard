
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/main-layout';
import { ResultsCard } from '@/components/dashboard/results-card';
import { PageTransition } from '@/components/ui/page-transition';
import { Button } from '@/components/ui/button';
import { Upload, BookOpen } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');
    
    if (!isLoggedIn) {
      navigate('/');
      return;
    }
    
    setUserRole(role);
    
    // Extract name from email (demo purposes)
    if (email) {
      const name = email.split('@')[0];
      setUserName(name.charAt(0).toUpperCase() + name.slice(1));
    }
  }, [navigate]);

  return (
    <MainLayout>
      <PageTransition>
        <div className="container max-w-6xl py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome back, {userName || 'User'}</h1>
              <p className="text-muted-foreground mt-1">
                {userRole === 'teacher' 
                  ? 'Manage your classes and review student submissions' 
                  : 'View your assignment status and grades'}
              </p>
            </div>
            
            <div className="flex gap-3">
              {userRole === 'teacher' && (
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/teacher')}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Teacher Section
                </Button>
              )}
              <Button onClick={() => navigate('/upload')}>
                <Upload className="mr-2 h-4 w-4" />
                {userRole === 'teacher' ? 'Upload Answer Key' : 'Submit Assignment'}
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            <ResultsCard 
              title={userRole === 'teacher' ? 'Recent Submissions' : 'Your Submissions'} 
              role={userRole || 'student'} 
            />
          </div>
        </div>
      </PageTransition>
    </MainLayout>
  );
};

export default Dashboard;
