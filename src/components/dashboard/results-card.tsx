
import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface ResultsCardProps {
  studentName: string;
  studentEmail: string;
  submissionDate: string;
  score: number;
  totalPoints: number;
  fileUrl?: string;
}

export function ResultsCard({
  studentName,
  studentEmail,
  submissionDate,
  score,
  totalPoints,
  fileUrl,
}: ResultsCardProps) {
  const scorePercentage = (score / totalPoints) * 100;
  
  let scoreColor = 'text-red-500';
  if (scorePercentage >= 90) {
    scoreColor = 'text-green-500';
  } else if (scorePercentage >= 70) {
    scoreColor = 'text-blue-500';
  } else if (scorePercentage >= 50) {
    scoreColor = 'text-yellow-500';
  }

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium">{studentName}</h3>
            <p className="text-sm text-muted-foreground">{studentEmail}</p>
          </div>
          <div className={`text-xl font-semibold ${scoreColor}`}>
            {score}/{totalPoints}
          </div>
        </div>
        
        <div className="mt-4">
          <div className="w-full bg-muted rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                scorePercentage >= 90 ? 'bg-green-500' : 
                scorePercentage >= 70 ? 'bg-blue-500' : 
                scorePercentage >= 50 ? 'bg-yellow-500' : 
                'bg-red-500'
              }`} 
              style={{ width: `${scorePercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-right mt-1 text-muted-foreground">
            {scorePercentage.toFixed(1)}% Score
          </p>
        </div>
        
        <div className="mt-5 text-sm text-muted-foreground">
          Submitted: {submissionDate}
        </div>
        
        <div className="mt-4">
          <Button 
            variant="outline" 
            className="text-xs w-full bg-background/50"
            onClick={() => fileUrl && window.open(fileUrl)}
            disabled={!fileUrl}
          >
            View Submission
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
