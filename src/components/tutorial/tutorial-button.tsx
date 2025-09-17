'use client';

import { Button } from '@/components/ui/button';
import { HelpCircle, Play } from 'lucide-react';
import { useTutorial } from './tutorial-provider';
import { usePathname } from 'next/navigation';

interface TutorialButtonProps {
  variant?: 'outline' | 'ghost' | 'default';
  size?: 'sm' | 'lg' | 'default' | 'icon';
  className?: string;
  tutorialName?: string;
}

export function TutorialButton({ 
  variant = 'outline', 
  size = 'sm', 
  className = '',
  tutorialName 
}: TutorialButtonProps) {
  const { startTutorial, isRunning } = useTutorial();
  const pathname = usePathname();

  // Use the single comprehensive tutorial
  const getTutorialName = () => {
    if (tutorialName) return tutorialName;
    return 'complete'; // Always use the complete tutorial
  };

  const handleStartTutorial = () => {
    const currentTutorialName = getTutorialName();
    startTutorial(currentTutorialName);
  };

  if (isRunning) {
    return null; // Hide button during tutorial
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleStartTutorial}
      className={`gap-2 ${className}`}
      title="Start guided tutorial"
    >
      <Play className="h-4 w-4" />
      <span className="hidden sm:inline">Tutorial</span>
    </Button>
  );
}

// Component for help menu or floating help button
export function HelpButton() {
  const { startTutorial, isRunning } = useTutorial();
  const pathname = usePathname();

  const handleStartTutorial = () => {
    startTutorial('complete');
  };

  if (isRunning) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleStartTutorial}
      className="gap-2 text-muted-foreground hover:text-foreground"
      title="Get help with this page"
    >
      <HelpCircle className="h-4 w-4" />
      Help & Tutorial
    </Button>
  );
}
