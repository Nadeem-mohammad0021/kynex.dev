'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bot, 
  Wand2, 
  Rocket, 
  MessageSquare, 
  CheckCircle, 
  ArrowRight, 
  Play, 
  BookOpen,
  Target,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { KynexLogo } from './icons/kynex-logo';
import { KynexDevLogo } from './kynex-dev-logo';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: {
    text: string;
    href: string;
  };
  completed?: boolean;
}

interface OnboardingWelcomeProps {
  onDismiss?: () => void;
  completedSteps?: string[];
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to KYNEX.dev',
    description: 'Learn about the platform and explore the dashboard',
    icon: <Sparkles className="h-5 w-5" />,
    action: {
      text: 'Explore Dashboard',
      href: '/dashboard'
    }
  },
  {
    id: 'first-workflow',
    title: 'Create Your First AI Agent',
    description: 'Use our AI-powered workflow generator to build your first agent',
    icon: <Wand2 className="h-5 w-5" />,
    action: {
      text: 'Generate with AI',
      href: '/agents/editor/new'
    }
  },
  {
    id: 'customize',
    title: 'Customize Your Agent',
    description: 'Fine-tune your agent\'s behavior and responses in the visual editor',
    icon: <Bot className="h-5 w-5" />,
    action: {
      text: 'View My Agents',
      href: '/my-agents'
    }
  },
  {
    id: 'deploy',
    title: 'Deploy to Platforms',
    description: 'Deploy your agent to WhatsApp, Telegram, or your website',
    icon: <Rocket className="h-5 w-5" />,
    action: {
      text: 'View Deployments',
      href: '/deployments'
    }
  },
  {
    id: 'learn',
    title: 'Learn Advanced Features',
    description: 'Discover tutorials and guides to get the most out of KYNEX.dev',
    icon: <BookOpen className="h-5 w-5" />,
    action: {
      text: 'Browse Help Center',
      href: '/help'
    }
  }
];

const features = [
  {
    icon: <Bot className="h-8 w-8 text-blue-600" />,
    title: 'AI-Powered Agents',
    description: 'Create intelligent agents that understand and respond naturally to user queries'
  },
  {
    icon: <MessageSquare className="h-8 w-8 text-green-600" />,
    title: 'Multi-Platform Support',
    description: 'Deploy to WhatsApp, Telegram, websites, and more with a single workflow'
  },
  {
    icon: <Target className="h-8 w-8 text-purple-600" />,
    title: 'Visual Workflow Builder',
    description: 'Design complex conversation flows with our intuitive drag-and-drop editor'
  }
];

export function OnboardingWelcome({ onDismiss, completedSteps = [] }: OnboardingWelcomeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const completedCount = completedSteps.length;
  const totalSteps = onboardingSteps.length;
  const progress = (completedCount / totalSteps) * 100;

  return (
    <div className="space-y-6">
      {/* Welcome Hero */}
      <Card className="border-0 bg-gradient-to-r from-primary/10 via-purple-50/50 to-blue-50/50 dark:from-primary/20 dark:via-purple-950/20 dark:to-blue-950/20 shadow-xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <KynexLogo width={48} height={48} />
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Welcome to KYNEX.dev
                  </h1>
                  <p className="text-lg text-muted-foreground mt-1">
                    Your AI agent platform is ready to go!
                  </p>
                </div>
              </div>
              
              <p className="text-muted-foreground max-w-2xl">
                KYNEX.dev makes it easy to create, customize, and deploy AI agents across multiple platforms. 
                Get started by following our quick setup guide below, or jump straight into building your first agent.
              </p>
              
              <div className="flex gap-3 pt-2">
                <Button asChild className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                  <Link href="/agents/editor/new">
                    <Wand2 className="mr-2 h-4 w-4" />
                    Create First Agent
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/help">
                    <BookOpen className="mr-2 h-4 w-4" />
                    View Tutorials
                  </Link>
                </Button>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground"
            >
              Dismiss
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Getting Started Progress
              </CardTitle>
              <CardDescription>
                Complete these steps to get the most out of KYNEX.dev
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-sm">
              {completedCount} of {totalSteps} completed
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Setup Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="grid gap-4">
            {onboardingSteps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = !isCompleted && index === currentStep;
              
              return (
                <div 
                  key={step.id} 
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 ${
                    isCompleted 
                      ? 'bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-800' 
                      : isCurrent 
                      ? 'bg-primary/5 border-primary/20 ring-2 ring-primary/10' 
                      : 'bg-muted/20 border-border'
                  }`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                      : isCurrent 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold ${
                      isCompleted ? 'text-green-700 dark:text-green-300' : 'text-foreground'
                    }`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  
                  {!isCompleted && (
                    <Button 
                      asChild 
                      variant={isCurrent ? "default" : "outline"} 
                      size="sm"
                      className="flex-shrink-0"
                    >
                      <Link href={step.action.href}>
                        {step.action.text}
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  )}
                  
                  {isCompleted && (
                    <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800">
                      Complete
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Feature Highlights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            What You Can Build
          </CardTitle>
          <CardDescription>
            Explore the powerful features available in KYNEX.dev
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center">
                  {feature.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <Alert className="mt-6">
            <Play className="h-4 w-4" />
            <AlertDescription>
              <strong>Pro tip:</strong> Start with the AI-powered workflow generator to create your first agent in minutes. 
              You can always customize and refine it later in the visual editor.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
