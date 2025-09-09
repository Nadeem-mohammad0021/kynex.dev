
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Play, 
  Zap, 
  Users, 
  Settings, 
  MessageCircle,
  Search,
  ChevronRight,
  ExternalLink,
  Lightbulb,
  Target,
  Workflow,
  Bot,
  Rocket,
  HelpCircle,
  Video,
  FileText,
  Code,
  Globe,
  Mail
} from 'lucide-react';
import Link from 'next/link';
import { SupportChatbot } from '@/components/support-chatbot';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: React.ReactNode;
  steps: string[];
}

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const tutorials: Tutorial[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with KYNEX.dev',
    description: 'Learn the basics of creating your first AI workflow',
    duration: '5 min',
    difficulty: 'Beginner',
    icon: <Play className="h-5 w-5" />,
    steps: [
      'Sign up for a KYNEX account',
      'Navigate to the Dashboard',
      'Click "Generate with AI" to create your first workflow',
      'Describe what you want your AI agent to do',
      'Review and customize the generated workflow',
      'Test your workflow in the editor'
    ]
  },
  {
    id: 'create-workflow',
    title: 'Creating Custom Workflows',
    description: 'Build sophisticated AI workflows from scratch',
    duration: '10 min',
    difficulty: 'Intermediate',
    icon: <Workflow className="h-5 w-5" />,
    steps: [
      'Go to the Workflow Editor',
      'Add trigger conditions for your workflow',
      'Define workflow steps and logic',
      'Configure AI model parameters',
      'Set up data transformations',
      'Test and validate your workflow',
      'Save and publish your workflow'
    ]
  },
  {
    id: 'deploy-agent',
    title: 'Deploying Your AI Agent',
    description: 'Deploy your agent to various platforms',
    duration: '8 min',
    difficulty: 'Intermediate',
    icon: <Rocket className="h-5 w-5" />,
    steps: [
      'Complete your workflow design',
      'Navigate to the Deployments page',
      'Select your target platform (WhatsApp, Telegram, Web, etc.)',
      'Configure platform-specific credentials',
      'Set deployment parameters',
      'Deploy and test your agent',
      'Monitor performance and usage'
    ]
  },
  {
    id: 'advanced-features',
    title: 'Advanced Agent Features',
    description: 'Leverage advanced capabilities and integrations',
    duration: '15 min',
    difficulty: 'Advanced',
    icon: <Zap className="h-5 w-5" />,
    steps: [
      'Set up custom API integrations',
      'Configure conditional logic branches',
      'Implement error handling and fallbacks',
      'Use variables and dynamic content',
      'Set up webhooks and external triggers',
      'Implement user session management',
      'Monitor and optimize performance'
    ]
  }
];

const faqs: FAQ[] = [
  {
    question: 'What is KYNEX.dev and how does it work?',
    answer: 'KYNEX.dev is a powerful platform for creating, managing, and deploying AI agents and workflows. It uses advanced AI models to help you build intelligent automation that can handle customer interactions, process data, and perform complex tasks across multiple platforms.',
    category: 'Getting Started'
  },
  {
    question: 'How do I create my first AI agent?',
    answer: 'Creating your first AI agent is simple! Just click "Generate with AI" on the dashboard, describe what you want your agent to do in plain English, and KYNEX.dev will automatically generate a workflow for you. You can then customize it in the visual editor.',
    category: 'Getting Started'
  },
  {
    question: 'What platforms can I deploy my agents to?',
    answer: 'KYNEX.dev supports deployment to multiple platforms including WhatsApp Business API, Telegram, websites (via widget), API webhooks, and more. Each platform has its own configuration requirements and capabilities.',
    category: 'Deployment'
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes! Your data is stored securely in a Supabase database with Row-Level Security (RLS) policies that ensure only you can access your workflows and agent data. All communications are encrypted and we follow industry best practices for data protection.',
    category: 'Security'
  },
  {
    question: 'Can I customize my agent\'s responses?',
    answer: 'Absolutely! You can fully customize your agent\'s behavior, responses, and logic using the visual workflow editor. You can set up conditional responses, integrate with external APIs, and create complex conversation flows.',
    category: 'Customization'
  },
  {
    question: 'What AI models does KYNEX use?',
    answer: 'KYNEX.dev integrates with various state-of-the-art AI models including Llama 3.3, Mistral, and other leading models through OpenRouter. Different models are optimized for different tasks like planning, conversation, and data processing.',
    category: 'Technical'
  },
  {
    question: 'How much does KYNEX cost?',
    answer: 'KYNEX.dev offers a free tier to get you started, with paid plans for advanced features and higher usage limits. Check our subscription page for detailed pricing information and plan comparisons.',
    category: 'Pricing'
  },
  {
    question: 'Can I integrate KYNEX with my existing systems?',
    answer: 'Yes! KYNEX.dev supports webhook integrations, REST API connections, and can be embedded into existing applications. You can connect your agents to CRMs, databases, and other business tools.',
    category: 'Integration'
  },
  {
    question: 'How do I monitor my agent\'s performance?',
    answer: 'KYNEX.dev provides comprehensive analytics and monitoring tools. You can track response times, success rates, user interactions, and other key metrics from the deployments dashboard.',
    category: 'Monitoring'
  },
  {
    question: 'What kind of support is available?',
    answer: 'We offer documentation, video tutorials, community forums, and email support. Premium plan subscribers get priority support and access to one-on-one consultation sessions.',
    category: 'Support'
  }
];

const quickLinks = [
  { title: 'Dashboard', href: '/dashboard', icon: <Target className="h-4 w-4" /> },
  { title: 'Create Workflow', href: '/agents/editor/new', icon: <Workflow className="h-4 w-4" /> },
  { title: 'My Agents', href: '/my-agents', icon: <Bot className="h-4 w-4" /> },
  { title: 'Deployments', href: '/deployments', icon: <Rocket className="h-4 w-4" /> },
  { title: 'Settings', href: '/settings', icon: <Settings className="h-4 w-4" /> }
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  
  const filteredFAQs = faqs.filter(
    faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const faqCategories = [...new Set(faqs.map(faq => faq.category))];
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  if (selectedTutorial) {
    return (
      <div className="container max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => setSelectedTutorial(null)}
            className="flex items-center gap-2"
          >
            ← Back to Help
          </Button>
          <Badge className={getDifficultyColor(selectedTutorial.difficulty)}>
            {selectedTutorial.difficulty}
          </Badge>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              {selectedTutorial.icon}
              <div>
                <CardTitle className="text-2xl">{selectedTutorial.title}</CardTitle>
                <CardDescription className="text-lg mt-2">
                  {selectedTutorial.description}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
              <span>📖 {selectedTutorial.duration} read</span>
              <span>🎯 {selectedTutorial.difficulty} level</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Step-by-step guide:</h3>
              <ol className="space-y-3">
                {selectedTutorial.steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-relaxed pt-1">{step}</p>
                  </li>
                ))}
              </ol>
              
              <Alert className="mt-6">
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
              <strong>Tip:</strong> Take your time with each step and don't hesitate to explore the interface. 
                  KYNEX.dev is designed to be intuitive, and you can always return to this tutorial if needed.
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-3 pt-4">
                <Button asChild className="flex items-center gap-2">
                  <Link href="/dashboard">
                    <Play className="h-4 w-4" />
                    Start Tutorial
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/help">
                    View More Tutorials
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Everything you need to know to get started with KYNEX.dev and build amazing AI agents
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Jump straight to common tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {quickLinks.map((link) => (
              <Button key={link.href} variant="outline" asChild className="h-auto p-4 flex-col gap-2">
                <Link href={link.href}>
                  {link.icon}
                  <span className="text-sm">{link.title}</span>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tutorials" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tutorials" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Tutorials
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Resources
          </TabsTrigger>
        </TabsList>

        {/* Tutorials Tab */}
        <TabsContent value="tutorials" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {tutorials.map((tutorial) => (
              <Card key={tutorial.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedTutorial(tutorial)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {tutorial.icon}
                      <div>
                        <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {tutorial.description}
                        </CardDescription>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge className={getDifficultyColor(tutorial.difficulty)}>
                      {tutorial.difficulty}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      📖 {tutorial.duration}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-6">
          <div className="space-y-6">
            {faqCategories.map((category) => {
              const categoryFAQs = filteredFAQs.filter(faq => faq.category === category);
              if (categoryFAQs.length === 0) return null;
              
              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle>{category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {categoryFAQs.map((faq, index) => (
                        <AccordionItem key={index} value={`${category}-${index}`}>
                          <AccordionTrigger className="text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Video Tutorials
                </CardTitle>
                <CardDescription>
                  Step-by-step video guides
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Watch comprehensive video tutorials covering all aspects of KYNEX.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="#">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Coming Soon
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  API Documentation
                </CardTitle>
                <CardDescription>
                  Technical integration guides
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Detailed API documentation for custom integrations and advanced usage.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="#">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Docs
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Community Forum
                </CardTitle>
                <CardDescription>
                  Connect with other users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Join our community to ask questions, share tips, and get help from other users.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="#">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Join Community
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Need More Help?
              </CardTitle>
              <CardDescription>
                Can't find what you're looking for? We're here to help!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">Email Support</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Get help via email. We typically respond within 24 hours.
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="mailto:support@kynex.dev">
                      <Mail className="h-4 w-4 mr-2" />
                      Contact Support
                    </Link>
                  </Button>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Live Chat</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Chat with our AI support assistant for immediate help.
                  </p>
                  <SupportChatbot />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
