
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/login-form';
import { Logo } from '@/components/ui/logo';
import { motion } from 'framer-motion';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 md:p-10">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-slate-950">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)]"></div>
        <div className="absolute right-0 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[100px]"></div>
        <div className="absolute left-0 bottom-0 -z-10 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[100px]"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto flex flex-col items-center gap-8"
      >
        <div className="text-center space-y-2">
          <Logo size="lg" className="mx-auto" />
          <h1 className="text-3xl font-bold tracking-tight mt-6">Welcome to GradeSync</h1>
          <p className="text-muted-foreground">Sign in to access your account</p>
        </div>
        
        <LoginForm />
        
        <div className="text-center text-sm text-muted-foreground">
          <p className="mb-1">Student demo login: student@example.com / password</p>
          <p>Teacher demo login: teacher@example.com / password</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
