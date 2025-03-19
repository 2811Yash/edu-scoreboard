
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  score?: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  
  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const role = localStorage.getItem('userRole');
    
    if (!isLoggedIn) {
      navigate('/');
      return;
    }
    
    setUserRole(role);
    
    // Mock data
    const mockAssignments: Assignment[] = [
      {
        id: '1',
        title: 'Mathematics Final Exam',
        dueDate: '2023-06-15',
        status: 'pending',
      },
      {
        id: '2',
        title: 'Physics Lab Report',
        dueDate: '2023-06-10',
        status: 'submitted',
      },
      {
        id: '3',
        title: 'History Essay',
        dueDate: '2023-06-05',
        status: 'graded',
        score: 85,
      },
    ];
    
    setAssignments(mockAssignments);
  }, [navigate]);
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            {userRole === 'student'
              ? 'Manage your assignments and submissions'
              : 'Review and grade student submissions'
            }
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader className="pb-2">
              <CardTitle>Welcome back!</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                {userRole === 'student'
                  ? 'You have 2 pending assignments'
                  : 'You have 5 submissions to grade'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {userRole === 'student' ? '67%' : '8'}
              </div>
              <p className="text-primary-foreground/80 text-sm mt-1">
                {userRole === 'student'
                  ? 'Current average score'
                  : 'Submissions awaiting review'
                }
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => navigate('/upload')}
              >
                {userRole === 'student'
                  ? 'Upload New Submission'
                  : 'Review Submissions'
                }
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Completed</div>
                <div className="font-bold">
                  {userRole === 'student' ? '3/5' : '12/20'}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Pending</div>
                <div className="font-bold">
                  {userRole === 'student' ? '2' : '8'}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">
                  {userRole === 'student' ? 'Average Score' : 'Graded Today'}
                </div>
                <div className="font-bold">
                  {userRole === 'student' ? '78%' : '5'}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-muted-foreground">
                {userRole === 'student'
                  ? 'History Essay was graded (85%)'
                  : 'You graded Mathematics Final for Jane Doe (92%)'
                }
                <p className="text-xs mt-1">2 hours ago</p>
              </div>
              <div className="text-sm text-muted-foreground">
                {userRole === 'student'
                  ? 'Physics Lab Report submitted'
                  : 'Physics Lab Report received from John Smith'
                }
                <p className="text-xs mt-1">Yesterday at 4:30 PM</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">
            {userRole === 'student' ? 'Your Assignments' : 'Recent Submissions'}
          </h2>
          
          <motion.div 
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {assignments.map((assignment) => (
              <motion.div key={assignment.id} variants={item}>
                <Card className="document-card h-full flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{assignment.title}</CardTitle>
                    <CardDescription>
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="flex items-center">
                      <span className="text-sm">Status:</span>
                      <span className={`text-sm font-medium ml-2 px-2 py-1 rounded-full ${
                        assignment.status === 'graded'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : assignment.status === 'submitted'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                      }`}>
                        {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                      </span>
                    </div>
                    
                    {assignment.status === 'graded' && assignment.score !== undefined && (
                      <div className="mt-4">
                        <div className="text-sm text-muted-foreground">Score:</div>
                        <div className="text-2xl font-bold">{assignment.score}%</div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate('/upload')}
                    >
                      {assignment.status === 'pending'
                        ? 'Submit Assignment'
                        : assignment.status === 'submitted'
                        ? 'View Submission'
                        : 'View Feedback'
                      }
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
