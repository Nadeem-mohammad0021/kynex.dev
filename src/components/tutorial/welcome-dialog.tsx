'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTutorial } from './tutorial-provider';
import { Play, Sparkles, Rocket, Users, Zap } from 'lucide-react';

export function WelcomeDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { startTutorial } = useTutorial();

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('kynex-welcome-seen');
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleStartTutorial = () => {
    setIsOpen(false);
    localStorage.setItem('kynex-welcome-seen', 'true');
    setTimeout(() => {
      startTutorial('complete');
    }, 300);
  };

  const handleSkip = () => {
    setIsOpen(false);
    localStorage.setItem('kynex-welcome-seen', 'true');
  };

  const features = [
    {
      icon: Rocket,
      title: 'Visual Workflow Builder',
      description: 'Create AI agents with drag-and-drop simplicity',
    },
    {
      icon: Users,
      title: 'Multi-Platform Deployment',
      description: 'Deploy to WhatsApp, Telegram, websites, and more',
    },
    {
      icon: Zap,
      title: 'Instant Integration',
      description: 'Get your agents live in minutes, not hours',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-full max-w-[95%] sm:max-w-lg md:max-w-2xl rounded-xl p-4 sm:p-6">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 text-center sm:text-left">
            <div className="w-12 h-12 mx-auto sm:mx-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-bold">Welcome to KYNEX.dev!</DialogTitle>
              <DialogDescription className="text-sm sm:text-base mt-1">
                The ultimate platform for building and deploying AI agents
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 sm:py-6 space-y-6">
          <div className="text-center px-2">
            <h3 className="text-base sm:text-lg font-semibold mb-2">Ready to build your first AI agent?</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              With KYNEX.dev, you can create powerful AI agents and deploy them anywhere in just a few clicks.
            </p>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center p-3 sm:p-4">
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-sm sm:text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-xs sm:text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tutorial section */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mx-auto sm:mx-0">
                <Play className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm sm:text-base">Take the guided tutorial</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Learn how to create, configure, and deploy your first AI agent in under 5 minutes
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <Button variant="outline" onClick={handleSkip} className="w-full sm:w-auto">
            Skip for now
          </Button>
          <Button onClick={handleStartTutorial} className="gap-2 w-full sm:w-auto">
            <Play className="h-4 w-4" />
            Start Guided Tutorial
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
