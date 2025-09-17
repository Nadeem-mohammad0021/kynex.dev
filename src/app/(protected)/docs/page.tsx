'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  BookOpen, 
  Rocket, 
  Bot, 
  Zap, 
  Globe, 
  MessageCircle, 
  Settings, 
  Code,
  PlayCircle,
  FileText,
  HelpCircle,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  Compass,
  Folders,
  TestTube,
  Smartphone,
  Monitor,
  Database,
  GitBranch,
  Users,
  Cloud,
  Server,
  Shield,
  Key,
  Link,
  Terminal,
  Layers,
  Package,
  Search,
  Video,
  BookMarked,
  Workflow,
  AlertTriangle,
  Info,
  Copy,
  Eye,
  Download,
  Upload,
  Webhook,
  Lock,
  Unlock,
  Activity,
  BarChart3,
  TrendingUp,
  Mail,
  Calendar,
  FileText as FileIcon
} from 'lucide-react';

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('getting-started');

  const navigationSections = [
    { id: 'getting-started', title: 'Getting Started', icon: PlayCircle },
    { id: 'tutorials', title: 'Tutorials', icon: Video },
    { id: 'agents', title: 'AI Agents', icon: Bot },
    { id: 'workflows', title: 'Workflows', icon: GitBranch },
    { id: 'deployments', title: 'Deployments', icon: Rocket },
    { id: 'integrations', title: 'Integrations', icon: Globe },
    { id: 'api', title: 'API Reference', icon: Code },
    { id: 'troubleshooting', title: 'Troubleshooting', icon: HelpCircle },
  ];

  const features = [
    { icon: Bot, title: 'AI Agent Builder', description: 'Create intelligent agents with visual workflow editor' },
    { icon: Zap, title: 'AI-Powered Generation', description: 'Generate workflows automatically using AI assistance' },
    { icon: Globe, title: 'Multi-Platform Deployment', description: 'Deploy to WhatsApp, Telegram, websites, and more' },
    { icon: TestTube, title: 'Built-in Testing', description: 'Test your agents before deployment with integrated tools' },
    { icon: Database, title: 'Data Integration', description: 'Connect to APIs, databases, and external services' },
    { icon: Users, title: 'Team Collaboration', description: 'Share and collaborate on agent development' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold font-headline">Documentation</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Learn how to build, deploy, and manage AI agents with KYNEX.dev. From your first agent to advanced integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">Contents</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {navigationSections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-colors ${
                        activeSection === section.id ? 'bg-muted text-primary border-r-2 border-primary' : ''
                      }`}
                      aria-current={activeSection === section.id ? 'page' : undefined}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="text-sm font-medium">{section.title}</span>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Getting Started Section */}
          {activeSection === 'getting-started' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-4">Getting Started</h2>
                <p className="text-muted-foreground mb-6">
                  Welcome to KYNEX.dev! Follow our interactive onboarding flow to build your first AI agent in minutes.
                </p>
              </div>

              {/* Interactive Onboarding Checklist */}
              <Card className="bg-card border border-primary/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Interactive Tutorial Checklist
                  </CardTitle>
                  <CardDescription>
                    Track your progress as you complete each step of the setup process
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-sm text-primary font-semibold">0 of 8 completed</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 shadow-inner">
                      <div className="bg-primary h-3 rounded-full transition-all duration-500" style={{width: '0%'}}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { 
                        id: 'welcome', 
                        title: 'Welcome to KYNEX.dev', 
                        description: 'Complete platform overview and account setup',
                        completed: false,
                        link: '/dashboard',
                        icon: PlayCircle,
                        estimated: '2 min'
                      },
                      { 
                        id: 'explore', 
                        title: 'Explore Agent Templates', 
                        description: 'Browse pre-built agents in the Explore section',
                        completed: false,
                        link: '/agents',
                        icon: Compass,
                        estimated: '3 min'
                      },
                      { 
                        id: 'create', 
                        title: 'Create Your First Agent', 
                        description: 'Use AI generation or templates to build an agent',
                        completed: false,
                        link: '/my-agents',
                        icon: Bot,
                        estimated: '5 min'
                      },
                      { 
                        id: 'customize', 
                        title: 'Customize Agent Workflow', 
                        description: 'Edit nodes, add logic, and configure responses',
                        completed: false,
                        link: '/agents/editor',
                        icon: Settings,
                        estimated: '8 min'
                      },
                      { 
                        id: 'test', 
                        title: 'Test Your Agent', 
                        description: 'Use built-in testing tools to verify functionality',
                        completed: false,
                        link: null,
                        icon: TestTube,
                        estimated: '3 min'
                      },
                      { 
                        id: 'integrate', 
                        title: 'Add External Integration', 
                        description: 'Connect to APIs, databases, or third-party services',
                        completed: false,
                        link: null,
                        icon: Globe,
                        estimated: '10 min'
                      },
                      { 
                        id: 'deploy', 
                        title: 'Deploy Your Agent', 
                        description: 'Choose platform and deploy to production',
                        completed: false,
                        link: '/deployments',
                        icon: Rocket,
                        estimated: '5 min'
                      },
                      { 
                        id: 'monitor', 
                        title: 'Monitor Performance', 
                        description: 'View analytics and optimize agent performance',
                        completed: false,
                        link: '/deployments',
                        icon: BarChart3,
                        estimated: '2 min'
                      }
                    ].map((item, index) => {
                      const IconComponent = item.icon;
                      return (
                        <div key={item.id} className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-md ${
                          item.completed 
                            ? 'border-primary/50 bg-primary/5' 
                            : 'border-border bg-card hover:border-primary/30 hover:bg-muted/50'
                        }`}>
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors shadow-sm ${
                            item.completed 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {item.completed ? <CheckCircle className="h-4 w-4" /> : index + 1}
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-1">
                              <IconComponent className={`h-4 w-4 ${
                                item.completed ? 'text-primary' : 'text-muted-foreground'
                              }`} />
                              <h4 className={`font-semibold ${
                                item.completed ? 'text-primary' : 'text-foreground'
                              }`}>{item.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {item.estimated}
                              </Badge>
                            </div>
                            <p className={`text-sm ${
                              item.completed ? 'text-primary/80' : 'text-muted-foreground'
                            }`}>{item.description}</p>
                          </div>
                          <div className="flex-shrink-0">
                            {item.link ? (
                              <Button 
                                size="sm" 
                                variant={item.completed ? "outline" : "default"}
                                className={`transition-all hover:scale-105 ${item.completed ? "border-primary text-primary hover:bg-primary/10" : ""}`}
                              >
                                {item.completed ? 'Revisit' : 'Start'}
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </Button>
                            ) : (
                              <Button size="sm" variant="ghost" disabled>
                                In Editor
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="bg-primary/10 p-5 rounded-xl border border-primary/30 mt-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">Next Recommended Step</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Start by exploring our agent templates to understand the possibilities, then create your first agent!</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Start Guide */}
              <Card className="border border-primary/20 shadow-lg bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    5-Minute Quick Start
                  </CardTitle>
                  <CardDescription>
                    The fastest way to get your first agent running
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    {[
                      { 
                        step: 1, 
                        title: 'Choose a Template', 
                        description: 'Browse our library of pre-built agent templates',
                        action: 'Browse Templates',
                        link: '/agents',
                        icon: Package
                      },
                      { 
                        step: 2, 
                        title: 'Customize Your Agent', 
                        description: 'Modify the template to match your specific needs',
                        action: 'Open Editor',
                        link: '/my-agents',
                        icon: Bot
                      },
                      { 
                        step: 3, 
                        title: 'Test & Deploy', 
                        description: 'Test your agent and deploy to your chosen platform',
                        action: 'View Deployments',
                        link: '/deployments',
                        icon: Rocket
                      },
                    ].map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <div key={item.step} className="flex gap-4 p-6 rounded-lg border hover:shadow-lg transition-all bg-muted/30 hover:bg-muted/50 border-border">
                          <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                            {item.step}
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-2">
                              <IconComponent className="h-4 w-4 text-primary" />
                              <h4 className="font-semibold">{item.title}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                            <Button size="sm" variant="outline" className="border-primary/30 hover:bg-primary/10 hover:scale-105 transition-all">
                              {item.action}
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Platform Overview */}
              <Card className="border border-primary/20 shadow-lg bg-card">
                <CardHeader>
                  <CardTitle>Platform Features</CardTitle>
                  <CardDescription>
                    Discover what makes KYNEX.dev powerful for AI agent development
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {features.map((feature, index) => {
                      const IconComponent = feature.icon;
                      return (
                        <div key={index} className="flex gap-3 p-5 rounded-lg border hover:shadow-md transition-all bg-muted/20 hover:bg-muted/40 border-border">
                          <IconComponent className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium mb-1">{feature.title}</h4>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Learning Resources */}
              <Card className="bg-primary/5 border border-primary/30 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookMarked className="h-5 w-5 text-primary" />
                    Continue Learning
                  </CardTitle>
                  <CardDescription>
                    Ready to dive deeper? Explore our comprehensive learning resources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        title: 'Video Tutorials',
                        description: 'Step-by-step video guides',
                        action: 'Watch Now',
                        icon: Video,
                        color: 'bg-red-100 text-red-700'
                      },
                      {
                        title: 'Interactive Labs',
                        description: 'Hands-on coding exercises',
                        action: 'Start Lab',
                        icon: Terminal,
                        color: 'bg-green-100 text-green-700'
                      },
                      {
                        title: 'API Documentation',
                        description: 'Complete developer reference',
                        action: 'View Docs',
                        icon: Code,
                        color: 'bg-purple-100 text-purple-700'
                      }
                    ].map((resource, index) => {
                      const IconComponent = resource.icon;
                      return (
                        <div key={index} className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-all hover:scale-105 hover:border-primary/30">
                          <div className={`w-12 h-12 rounded-xl ${resource.color} flex items-center justify-center mb-4 shadow-md`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <h4 className="font-medium text-foreground mb-1">{resource.title}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                          <Button size="sm" variant="outline" className="border-primary/30 hover:bg-primary/10 hover:scale-105 transition-all shadow-sm">
                            {resource.action}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tutorials Section */}
          {activeSection === 'tutorials' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-4">Tutorials & Guides</h2>
                <p className="text-muted-foreground mb-6">
                  Step-by-step tutorials and video guides to master KYNEX.dev. From beginner basics to advanced techniques.
                </p>
              </div>

              <div className="grid gap-6">
                {/* Learning Paths */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookMarked className="h-5 w-5" />
                      Learning Paths
                    </CardTitle>
                    <CardDescription>
                      Structured learning journeys tailored to your experience level
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        {
                          title: 'Beginner Path',
                          description: 'Perfect for first-time users',
                          duration: '2-3 hours',
                          lessons: ['Platform Overview', 'First Agent Creation', 'Basic Testing', 'Simple Deployment'],
                          difficulty: 'Beginner',
                          icon: PlayCircle,
                          color: 'bg-green-50 border-green-200'
                        },
                        {
                          title: 'Advanced Builder',
                          description: 'Complex workflows and integrations',
                          duration: '4-6 hours',
                          lessons: ['Advanced Workflows', 'API Integrations', 'Custom Logic', 'Performance Optimization'],
                          difficulty: 'Advanced',
                          icon: Workflow,
                          color: 'bg-blue-50 border-blue-200'
                        },
                        {
                          title: 'Enterprise Deployment',
                          description: 'Scale and enterprise features',
                          duration: '3-4 hours',
                          lessons: ['Multi-platform Deploy', 'Security & Compliance', 'Team Management', 'Analytics'],
                          difficulty: 'Expert',
                          icon: Shield,
                          color: 'bg-purple-50 border-purple-200'
                        }
                      ].map((path, index) => {
                        const IconComponent = path.icon;
                        const difficultyColors: Record<string, string> = {
                          'Beginner': 'bg-green-100 text-green-800',
                          'Advanced': 'bg-blue-100 text-blue-800',
                          'Expert': 'bg-purple-100 text-purple-800'
                        };
                        return (
                          <Card key={index} className={`${path.color} hover:shadow-lg transition-all`}>
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <CardTitle className="flex items-center gap-2">
                                  <IconComponent className="h-5 w-5 text-primary" />
                                  {path.title}
                                </CardTitle>
                                <Badge className={difficultyColors[path.difficulty]} variant="secondary">
                                  {path.difficulty}
                                </Badge>
                              </div>
                              <CardDescription>{path.description}</CardDescription>
                              <div className="text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4 inline mr-1" />
                                {path.duration}
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-2">
                                {path.lessons.map((lesson, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-sm">
                                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-medium border">
                                      {idx + 1}
                                    </div>
                                    <span>{lesson}</span>
                                  </div>
                                ))}
                              </div>
                              <Button className="w-full">
                                <PlayCircle className="h-4 w-4 mr-2" />
                                Start Learning Path
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Video Tutorials */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5" />
                      Video Tutorials
                    </CardTitle>
                    <CardDescription>
                      Watch and learn with our comprehensive video library
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        {
                          title: 'Building Your First Agent',
                          description: 'Complete walkthrough from creation to deployment',
                          duration: '12 minutes',
                          thumbnail: '🤖',
                          views: '12.5k',
                          category: 'Getting Started'
                        },
                        {
                          title: 'Advanced Workflow Patterns',
                          description: 'Complex logic and conditional flows',
                          duration: '18 minutes',
                          thumbnail: '🔄',
                          views: '8.2k',
                          category: 'Advanced'
                        },
                        {
                          title: 'API Integration Masterclass',
                          description: 'Connect to external services and APIs',
                          duration: '25 minutes',
                          thumbnail: '🔗',
                          views: '15.1k',
                          category: 'Integrations'
                        },
                        {
                          title: 'WhatsApp Business Setup',
                          description: 'Deploy your agent to WhatsApp Business',
                          duration: '15 minutes',
                          thumbnail: '💬',
                          views: '9.8k',
                          category: 'Deployment'
                        },
                        {
                          title: 'Testing & Debugging Tips',
                          description: 'Best practices for agent testing',
                          duration: '20 minutes',
                          thumbnail: '🐛',
                          views: '6.4k',
                          category: 'Testing'
                        },
                        {
                          title: 'Performance Optimization',
                          description: 'Make your agents faster and more efficient',
                          duration: '16 minutes',
                          thumbnail: '⚡',
                          views: '7.9k',
                          category: 'Optimization'
                        }
                      ].map((video, index) => (
                        <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer group">
                          <div className="relative">
                            <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center rounded-t-lg group-hover:from-primary/30 group-hover:to-primary/10 transition-colors">
                              <div className="text-6xl">{video.thumbnail}</div>
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-black/50 rounded-full p-3">
                                  <PlayCircle className="h-8 w-8 text-white" />
                                </div>
                              </div>
                            </div>
                            <div className="absolute top-2 left-2">
                              <Badge variant="secondary" className="bg-black/70 text-white">
                                {video.duration}
                              </Badge>
                            </div>
                            <div className="absolute top-2 right-2">
                              <Badge variant="outline" className="bg-white/90 text-xs">
                                {video.category}
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h4 className="font-semibold mb-2 group-hover:text-primary transition-colors">{video.title}</h4>
                            <p className="text-sm text-muted-foreground mb-3">{video.description}</p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {video.views} views
                              </div>
                              <Button size="sm" variant="ghost" className="h-6 px-2">
                                <BookMarked className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Interactive Tutorials */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Terminal className="h-5 w-5" />
                      Interactive Tutorials
                    </CardTitle>
                    <CardDescription>
                      Hands-on practice with guided steps and immediate feedback
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {[
                        {
                          title: 'Agent Builder Workshop',
                          description: 'Build a customer service agent step-by-step',
                          completionTime: '30 min',
                          steps: 8,
                          difficulty: 'Intermediate',
                          icon: Bot
                        },
                        {
                          title: 'Database Integration Lab',
                          description: 'Connect your agent to a database and query data',
                          completionTime: '45 min',
                          steps: 12,
                          difficulty: 'Advanced',
                          icon: Database
                        },
                        {
                          title: 'Multi-Platform Deployment',
                          description: 'Deploy the same agent across multiple channels',
                          completionTime: '25 min',
                          steps: 6,
                          difficulty: 'Intermediate',
                          icon: Globe
                        },
                        {
                          title: 'Webhook & API Challenge',
                          description: 'Master real-time integrations with webhooks',
                          completionTime: '40 min',
                          steps: 10,
                          difficulty: 'Advanced',
                          icon: Webhook
                        }
                      ].map((tutorial, index) => {
                        const IconComponent = tutorial.icon;
                        const difficultyColor = tutorial.difficulty === 'Intermediate' ? 
                          'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
                        return (
                          <div key={index} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                <IconComponent className="h-6 w-6 text-primary" />
                              </div>
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{tutorial.title}</h4>
                                <Badge className={difficultyColor} variant="secondary">
                                  {tutorial.difficulty}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{tutorial.description}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>⏱️ {tutorial.completionTime}</span>
                                <span>📋 {tutorial.steps} steps</span>
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              <Button>
                                <ArrowRight className="h-4 w-4 mr-2" />
                                Start Tutorial
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Community Resources */}
                <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-orange-600" />
                      Community Resources
                    </CardTitle>
                    <CardDescription>
                      Learn from the community and share your knowledge
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {
                          title: 'Community Templates',
                          description: 'Ready-to-use agent templates created by the community',
                          action: 'Browse Templates',
                          icon: Package
                        },
                        {
                          title: 'User Showcases',
                          description: 'Real-world examples and case studies from other users',
                          action: 'View Showcases',
                          icon: Eye
                        },
                        {
                          title: 'Discussion Forum',
                          description: 'Ask questions, share tips, and connect with other builders',
                          action: 'Join Discussion',
                          icon: MessageCircle
                        },
                        {
                          title: 'Weekly Challenges',
                          description: 'Participate in coding challenges and win prizes',
                          action: 'View Challenges',
                          icon: TrendingUp
                        }
                      ].map((resource, index) => {
                        const IconComponent = resource.icon;
                        return (
                          <div key={index} className="bg-white p-4 rounded-lg border border-orange-200 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-3">
                              <IconComponent className="h-5 w-5 text-orange-600 flex-shrink-0 mt-1" />
                              <div className="flex-grow">
                                <h4 className="font-medium text-orange-900 mb-1">{resource.title}</h4>
                                <p className="text-sm text-orange-700 mb-3">{resource.description}</p>
                                <Button size="sm" variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                                  {resource.action}
                                  <ExternalLink className="h-3 w-3 ml-2" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* AI Agents Section */}
          {activeSection === 'agents' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-4">AI Agents</h2>
                <p className="text-muted-foreground mb-6">
                  Learn how to create, customize, and manage your AI agents effectively.
                </p>
              </div>

              <Tabs defaultValue="creating" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="creating">Creating</TabsTrigger>
                  <TabsTrigger value="customizing">Customizing</TabsTrigger>
                  <TabsTrigger value="testing">Testing</TabsTrigger>
                  <TabsTrigger value="managing">Managing</TabsTrigger>
                </TabsList>

                <TabsContent value="creating" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Creating Your First Agent</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <h4 className="font-medium">Method 1: Generate with AI</h4>
                        <p className="text-sm text-muted-foreground">
                          The fastest way to create an agent. Simply describe what you want your agent to do, and our AI will generate a complete workflow.
                        </p>
                        <div className="bg-muted p-4 rounded-lg">
                          <code className="text-sm">
                            Example: "Create a customer support agent that can answer questions about our product features and pricing"
                          </code>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium">Method 2: Use Templates</h4>
                        <p className="text-sm text-muted-foreground">
                          Start with pre-built templates from our Explore section. These are professionally designed workflows for common use cases.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium">Method 3: Build from Scratch</h4>
                        <p className="text-sm text-muted-foreground">
                          For complete control, build your agent workflow from the ground up using our visual editor.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="customizing" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Customizing Agent Behavior</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Accordion type="single" collapsible>
                        <AccordionItem value="personality">
                          <AccordionTrigger>Agent Personality & Tone</AccordionTrigger>
                          <AccordionContent>
                            <p className="text-sm text-muted-foreground mb-3">
                              Define how your agent communicates with users. Set the tone, style, and personality that matches your brand.
                            </p>
                            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                              <li>Professional and formal</li>
                              <li>Friendly and casual</li>
                              <li>Technical and precise</li>
                              <li>Custom personality traits</li>
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="knowledge">
                          <AccordionTrigger>Knowledge Base Integration</AccordionTrigger>
                          <AccordionContent>
                            <p className="text-sm text-muted-foreground mb-3">
                              Connect your agent to various data sources and knowledge bases.
                            </p>
                            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                              <li>Upload documents and files</li>
                              <li>Connect to databases</li>
                              <li>Integrate with APIs</li>
                              <li>Web scraping capabilities</li>
                            </ul>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="responses">
                          <AccordionTrigger>Response Customization</AccordionTrigger>
                          <AccordionContent>
                            <p className="text-sm text-muted-foreground mb-3">
                              Control how your agent responds to different types of queries.
                            </p>
                            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                              <li>Custom response templates</li>
                              <li>Fallback responses</li>
                              <li>Multi-language support</li>
                              <li>Rich media responses</li>
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="testing" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Testing Your Agent</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4">
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" />
                            Interactive Testing
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Test your agent in real-time with our built-in chat interface. Send messages and see how your agent responds.
                          </p>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Batch Testing
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Upload a set of test questions and see how your agent handles them all at once.
                          </p>
                        </div>

                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Performance Analytics
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Monitor response times, accuracy, and user satisfaction metrics.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="managing" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Managing Your Agents</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Versioning</h4>
                          <p className="text-sm text-muted-foreground">
                            Keep track of different versions of your agents. Create backups before making changes and easily roll back if needed.
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Sharing & Collaboration</h4>
                          <p className="text-sm text-muted-foreground">
                            Share agents with team members, set permissions, and collaborate on agent development.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Performance Monitoring</h4>
                          <p className="text-sm text-muted-foreground">
                            Monitor your deployed agents' performance, usage statistics, and user interactions.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Workflows Section */}
          {activeSection === 'workflows' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-4">Workflows</h2>
                <p className="text-muted-foreground mb-6">
                  Master advanced workflow patterns, conditional logic, and complex agent behaviors using our visual editor.
                </p>
              </div>

              <Tabs defaultValue="basics" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basics">Basics</TabsTrigger>
                  <TabsTrigger value="patterns">Patterns</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  <TabsTrigger value="examples">Examples</TabsTrigger>
                </TabsList>

                <TabsContent value="basics" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Workflow className="h-5 w-5" />
                        Workflow Components
                      </CardTitle>
                      <CardDescription>
                        The essential building blocks of your AI agents
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          { 
                            icon: MessageCircle, 
                            title: 'Input Nodes', 
                            description: 'Receive user messages and data',
                            features: ['Text input', 'File uploads', 'Voice messages', 'Structured data']
                          },
                          { 
                            icon: Bot, 
                            title: 'AI Processing', 
                            description: 'Process inputs with AI models',
                            features: ['GPT models', 'Custom prompts', 'Context memory', 'Response formatting']
                          },
                          { 
                            icon: Database, 
                            title: 'Data Sources', 
                            description: 'Connect to external data',
                            features: ['Database queries', 'File systems', 'APIs', 'Knowledge bases']
                          },
                          { 
                            icon: Code, 
                            title: 'Logic Nodes', 
                            description: 'Add custom code and functions',
                            features: ['JavaScript code', 'Conditional logic', 'Data transformation', 'Calculations']
                          },
                          { 
                            icon: Globe, 
                            title: 'API Integrations', 
                            description: 'Integrate with external services',
                            features: ['HTTP requests', 'Authentication', 'Error handling', 'Response parsing']
                          },
                          { 
                            icon: CheckCircle, 
                            title: 'Output Nodes', 
                            description: 'Send responses to users',
                            features: ['Text responses', 'Rich media', 'Actions', 'Redirects']
                          },
                        ].map((component, index) => {
                          const IconComponent = component.icon;
                          return (
                            <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
                              <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                  <IconComponent className="h-6 w-6 text-primary" />
                                  {component.title}
                                </CardTitle>
                                <CardDescription>{component.description}</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <ul className="space-y-1">
                                  {component.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-sm">
                                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                      <span className="text-muted-foreground">{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Workflow Best Practices</CardTitle>
                      <CardDescription>
                        Essential principles for building maintainable and efficient workflows
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          {
                            title: 'Design Principles',
                            practices: [
                              { text: 'Start with a clear goal and user journey', icon: CheckCircle },
                              { text: 'Keep workflows simple and focused', icon: CheckCircle },
                              { text: 'Use descriptive names for nodes and variables', icon: CheckCircle },
                              { text: 'Group related functionality together', icon: CheckCircle }
                            ]
                          },
                          {
                            title: 'Technical Best Practices',
                            practices: [
                              { text: 'Implement comprehensive error handling', icon: Shield },
                              { text: 'Test workflows with edge cases', icon: TestTube },
                              { text: 'Monitor performance and optimize bottlenecks', icon: Activity },
                              { text: 'Document complex logic and decisions', icon: FileText }
                            ]
                          }
                        ].map((section, index) => (
                          <div key={index} className="space-y-4">
                            <h4 className="font-semibold text-lg border-b pb-2">{section.title}</h4>
                            <div className="space-y-3">
                              {section.practices.map((practice, idx) => {
                                const IconComponent = practice.icon;
                                return (
                                  <div key={idx} className="flex gap-3">
                                    <IconComponent className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-muted-foreground">{practice.text}</p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="patterns" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GitBranch className="h-5 w-5" />
                        Common Workflow Patterns
                      </CardTitle>
                      <CardDescription>
                        Proven patterns for building robust and scalable agents
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      {[
                        {
                          pattern: 'Linear Flow',
                          description: 'Simple sequential processing',
                          useCase: 'Basic Q&A, form filling, simple tasks',
                          complexity: 'Beginner',
                          diagram: 'Input → AI Processing → Output',
                          pros: ['Easy to understand', 'Quick to build', 'Reliable'],
                          cons: ['Limited flexibility', 'No branching logic'],
                          icon: ArrowRight
                        },
                        {
                          pattern: 'Conditional Branching',
                          description: 'Different paths based on conditions',
                          useCase: 'Multi-intent handling, routing, decision trees',
                          complexity: 'Intermediate',
                          diagram: 'Input → Condition → Branch A/B/C → Output',
                          pros: ['Flexible responses', 'Intent-based routing', 'Personalization'],
                          cons: ['More complex logic', 'Testing complexity'],
                          icon: GitBranch
                        },
                        {
                          pattern: 'Loop with State',
                          description: 'Iterative processing with memory',
                          useCase: 'Multi-turn conversations, data collection, workflows',
                          complexity: 'Advanced',
                          diagram: 'Input → Process → Update State → Loop/Continue',
                          pros: ['Stateful conversations', 'Complex interactions', 'Memory retention'],
                          cons: ['State management', 'Memory usage', 'Debugging difficulty'],
                          icon: Workflow
                        },
                        {
                          pattern: 'Parallel Processing',
                          description: 'Multiple operations simultaneously',
                          useCase: 'API aggregation, multi-source data, performance optimization',
                          complexity: 'Expert',
                          diagram: 'Input → Split → Parallel Tasks → Merge → Output',
                          pros: ['High performance', 'Concurrent operations', 'Efficiency'],
                          cons: ['Complex synchronization', 'Error handling', 'Resource management'],
                          icon: Layers
                        }
                      ].map((pattern, index) => {
                        const IconComponent = pattern.icon;
                        const complexityColors: Record<string, string> = {
                          'Beginner': 'bg-green-100 text-green-800 border-green-200',
                          'Intermediate': 'bg-blue-100 text-blue-800 border-blue-200',
                          'Advanced': 'bg-yellow-100 text-yellow-800 border-yellow-200',
                          'Expert': 'bg-red-100 text-red-800 border-red-200'
                        };
                        return (
                          <Card key={index} className="border-2">
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <CardTitle className="flex items-center gap-2">
                                  <IconComponent className="h-5 w-5 text-primary" />
                                  {pattern.pattern}
                                </CardTitle>
                                <Badge className={complexityColors[pattern.complexity]} variant="outline">
                                  {pattern.complexity}
                                </Badge>
                              </div>
                              <CardDescription className="text-base">{pattern.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="bg-muted p-4 rounded-lg">
                                <h5 className="font-medium mb-2">Flow Diagram</h5>
                                <code className="text-sm font-mono">{pattern.diagram}</code>
                              </div>
                              
                              <div>
                                <h5 className="font-medium mb-2">Best Used For</h5>
                                <p className="text-sm text-muted-foreground">{pattern.useCase}</p>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h5 className="font-medium mb-2 text-green-700">Advantages</h5>
                                  <ul className="space-y-1">
                                    {pattern.pros.map((pro, idx) => (
                                      <li key={idx} className="flex items-center gap-2 text-sm">
                                        <CheckCircle className="h-3 w-3 text-green-500" />
                                        <span className="text-muted-foreground">{pro}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h5 className="font-medium mb-2 text-orange-700">Considerations</h5>
                                  <ul className="space-y-1">
                                    {pattern.cons.map((con, idx) => (
                                      <li key={idx} className="flex items-center gap-2 text-sm">
                                        <AlertTriangle className="h-3 w-3 text-orange-500" />
                                        <span className="text-muted-foreground">{con}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                              
                              <Button size="sm" variant="outline" className="w-full">
                                <Eye className="h-4 w-4 mr-2" />
                                View Implementation Example
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Advanced Techniques
                      </CardTitle>
                      <CardDescription>
                        Professional-grade workflow features for complex use cases
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {[
                        {
                          technique: 'Dynamic Node Generation',
                          description: 'Create workflow nodes programmatically based on runtime conditions',
                          example: 'Generate API calls based on user input or external configuration',
                          code: `// Dynamic API endpoint generation
const endpoints = await getAvailableAPIs();
for (const endpoint of endpoints) {
  createAPINode({
    url: endpoint.url,
    method: endpoint.method,
    auth: endpoint.auth
  });
}`,
                          icon: Code
                        },
                        {
                          technique: 'Workflow Composition',
                          description: 'Combine multiple sub-workflows into complex orchestrated flows',
                          example: 'Customer service flow that includes authentication, query processing, and follow-up',
                          code: `// Compose multiple workflows
const mainFlow = composeWorkflows([
  authenticationFlow,
  queryProcessingFlow,
  followUpFlow
], {
  onError: errorHandlingFlow,
  onSuccess: completionFlow
});`,
                          icon: Layers
                        },
                        {
                          technique: 'Context-Aware Routing',
                          description: 'Route conversations based on user context, history, and preferences',
                          example: 'Different conversation paths for new vs. returning users',
                          code: `// Context-based routing
if (userContext.isFirstTime) {
  route(onboardingWorkflow);
} else if (userContext.hasIssue) {
  route(supportWorkflow);
} else {
  route(mainWorkflow);
}`,
                          icon: GitBranch
                        },
                        {
                          technique: 'Real-time Adaptation',
                          description: 'Modify workflow behavior based on real-time metrics and feedback',
                          example: 'Adjust response style based on user satisfaction scores',
                          code: `// Adaptive behavior
const satisfaction = await getSatisfactionScore();
if (satisfaction < 0.7) {
  workflow.responseStyle = 'detailed';
  workflow.empathyLevel = 'high';
} else {
  workflow.responseStyle = 'concise';
}`,
                          icon: Activity
                        }
                      ].map((technique, index) => {
                        const IconComponent = technique.icon;
                        return (
                          <Card key={index} className="border-l-4 border-l-primary">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <IconComponent className="h-5 w-5 text-primary" />
                                {technique.technique}
                              </CardTitle>
                              <CardDescription className="text-base">
                                {technique.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <h5 className="font-medium mb-2">Use Case Example</h5>
                                <p className="text-sm text-muted-foreground">{technique.example}</p>
                              </div>
                              
                              <div>
                                <h5 className="font-medium mb-2">Implementation</h5>
                                <div className="bg-black text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
                                  <pre>{technique.code}</pre>
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy Code
                                </Button>
                                <Button size="sm" variant="ghost">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Full Tutorial
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="examples" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Real-World Examples
                      </CardTitle>
                      <CardDescription>
                        Complete workflow examples for common business scenarios
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {[
                        {
                          title: 'E-commerce Support Agent',
                          description: 'Handle order inquiries, returns, and customer support',
                          complexity: 'Intermediate',
                          steps: ['Intent Classification', 'Order Lookup', 'Policy Check', 'Action Execution', 'Follow-up'],
                          features: ['Multi-turn conversations', 'Database integration', 'Policy enforcement', 'Escalation handling'],
                          icon: '🛒',
                          category: 'Customer Service'
                        },
                        {
                          title: 'Lead Qualification Bot',
                          description: 'Qualify sales leads and route to appropriate team members',
                          complexity: 'Advanced',
                          steps: ['Lead Capture', 'Qualification Questions', 'Scoring Algorithm', 'CRM Integration', 'Team Routing'],
                          features: ['Progressive disclosure', 'Scoring system', 'CRM sync', 'Team notifications'],
                          icon: '📊',
                          category: 'Sales'
                        },
                        {
                          title: 'IT Helpdesk Assistant',
                          description: 'Diagnose technical issues and provide solutions or escalate',
                          complexity: 'Advanced',
                          steps: ['Issue Classification', 'Diagnostic Tree', 'Solution Matching', 'Knowledge Base', 'Ticket Creation'],
                          features: ['Decision trees', 'Knowledge base search', 'Ticket management', 'Auto-resolution'],
                          icon: '🔧',
                          category: 'Support'
                        },
                        {
                          title: 'HR Onboarding Guide',
                          description: 'Guide new employees through onboarding process',
                          complexity: 'Intermediate',
                          steps: ['Welcome Message', 'Document Collection', 'Task Assignment', 'Progress Tracking', 'Check-ins'],
                          features: ['Document handling', 'Task tracking', 'Scheduled follow-ups', 'Progress visualization'],
                          icon: '👥',
                          category: 'HR'
                        }
                      ].map((example, index) => {
                        const complexityColor = example.complexity === 'Intermediate' ? 
                          'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
                        return (
                          <Card key={index} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="text-3xl">{example.icon}</div>
                                  <div>
                                    <CardTitle>{example.title}</CardTitle>
                                    <CardDescription className="text-base">{example.description}</CardDescription>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                  <Badge className={complexityColor} variant="secondary">
                                    {example.complexity}
                                  </Badge>
                                  <Badge variant="outline">{example.category}</Badge>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <h5 className="font-medium mb-3">Workflow Steps</h5>
                                <div className="flex flex-wrap gap-2">
                                  {example.steps.map((step, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-sm">
                                      <div className="w-2 h-2 bg-primary rounded-full" />
                                      {step}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <h5 className="font-medium mb-3">Key Features</h5>
                                <div className="grid grid-cols-2 gap-2">
                                  {example.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                      <CheckCircle className="h-3 w-3 text-green-500" />
                                      <span className="text-muted-foreground">{feature}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="flex gap-2 pt-2">
                                <Button size="sm" variant="outline" className="flex-1">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Workflow
                                </Button>
                                <Button size="sm" variant="ghost">
                                  <Download className="h-4 w-4 mr-2" />
                                  Clone
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Deployments Section */}
          {activeSection === 'deployments' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-4">Deployments</h2>
                <p className="text-muted-foreground mb-6">
                  Deploy your AI agents to multiple platforms and channels with ease.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    icon: Smartphone,
                    title: 'WhatsApp Business',
                    description: 'Deploy to WhatsApp Business API',
                    features: ['Automated responses', 'Rich media support', 'Business verification', 'Analytics dashboard'],
                    badge: 'Popular'
                  },
                  {
                    icon: MessageCircle,
                    title: 'Telegram Bot',
                    description: 'Create Telegram bots instantly',
                    features: ['Inline keyboards', 'File sharing', 'Group support', 'Custom commands'],
                    badge: 'Easy Setup'
                  },
                  {
                    icon: Monitor,
                    title: 'Website Widget',
                    description: 'Embed chat widget on your site',
                    features: ['Customizable design', 'Mobile responsive', 'Lead capture', 'Conversation history'],
                    badge: 'Versatile'
                  },
                  {
                    icon: Code,
                    title: 'API Endpoint',
                    description: 'RESTful API for custom integrations',
                    features: ['Webhook support', 'Rate limiting', 'Authentication', 'Real-time responses'],
                    badge: 'Developer Friendly'
                  },
                ].map((platform, index) => {
                  const IconComponent = platform.icon;
                  return (
                    <Card key={index} className="relative">
                      {platform.badge && (
                        <Badge className="absolute top-4 right-4" variant="secondary">
                          {platform.badge}
                        </Badge>
                      )}
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <IconComponent className="h-6 w-6 text-primary" />
                          {platform.title}
                        </CardTitle>
                        <CardDescription>{platform.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {platform.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <Button className="w-full mt-4" variant="outline">
                          Learn More <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Deployment Process</CardTitle>
                  <CardDescription>
                    Step-by-step guide to deploying your agent
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { step: 1, title: 'Test Your Agent', description: 'Ensure your agent works correctly before deployment' },
                      { step: 2, title: 'Choose Platform', description: 'Select the platform where you want to deploy' },
                      { step: 3, title: 'Configure Settings', description: 'Set up platform-specific configurations' },
                      { step: 4, title: 'Deploy & Monitor', description: 'Deploy your agent and monitor its performance' },
                    ].map((item) => (
                      <div key={item.step} className="flex gap-4 p-4 rounded-lg border">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                          {item.step}
                        </div>
                        <div>
                          <h4 className="font-semibold">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Integrations Section */}
          {activeSection === 'integrations' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-4">Integrations</h2>
                <p className="text-muted-foreground mb-6">
                  Connect your AI agents to external services, APIs, databases, and enterprise tools with comprehensive guides and examples.
                </p>
              </div>

              <Tabs defaultValue="apis" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="apis">APIs & Services</TabsTrigger>
                  <TabsTrigger value="databases">Databases</TabsTrigger>
                  <TabsTrigger value="tools">Business Tools</TabsTrigger>
                  <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
                </TabsList>

                <TabsContent value="apis" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        API Integrations
                      </CardTitle>
                      <CardDescription>
                        Connect to REST APIs, GraphQL endpoints, and webhooks with authentication support
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          { 
                            name: 'REST APIs', 
                            icon: Link,
                            description: 'Connect to any REST API endpoint', 
                            features: ['GET/POST/PUT/DELETE', 'Custom headers', 'Query parameters', 'Response parsing'],
                            difficulty: 'Easy'
                          },
                          { 
                            name: 'GraphQL', 
                            icon: Code,
                            description: 'Query GraphQL endpoints efficiently', 
                            features: ['Query builder', 'Variable support', 'Schema introspection', 'Fragments'],
                            difficulty: 'Medium'
                          },
                          { 
                            name: 'Webhooks', 
                            icon: Webhook,
                            description: 'Receive real-time data updates', 
                            features: ['Event triggers', 'Payload validation', 'Retry logic', 'Security headers'],
                            difficulty: 'Medium'
                          },
                          { 
                            name: 'OAuth 2.0', 
                            icon: Shield,
                            description: 'Secure authentication flows', 
                            features: ['Authorization code', 'Client credentials', 'Refresh tokens', 'PKCE support'],
                            difficulty: 'Advanced'
                          },
                          { 
                            name: 'OpenAPI/Swagger', 
                            icon: FileIcon,
                            description: 'Auto-import API specifications', 
                            features: ['Schema validation', 'Code generation', 'Documentation', 'Testing'],
                            difficulty: 'Easy'
                          },
                          { 
                            name: 'Custom Headers', 
                            icon: Key,
                            description: 'Add authentication and custom headers', 
                            features: ['API keys', 'Bearer tokens', 'Custom auth', 'Dynamic headers'],
                            difficulty: 'Easy'
                          },
                        ].map((integration, index) => {
                          const IconComponent = integration.icon;
                          const difficultyColor = integration.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                                                 integration.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                                                 'bg-red-100 text-red-800';
                          return (
                            <Card key={index} className="relative hover:shadow-lg transition-shadow">
                              <Badge className={`absolute top-3 right-3 ${difficultyColor}`} variant="secondary">
                                {integration.difficulty}
                              </Badge>
                              <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                  <IconComponent className="h-5 w-5 text-primary" />
                                  {integration.name}
                                </CardTitle>
                                <CardDescription>{integration.description}</CardDescription>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <ul className="space-y-1 mb-4">
                                  {integration.features.slice(0, 3).map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <CheckCircle className="h-3 w-3 text-green-500" />
                                      {feature}
                                    </li>
                                  ))}
                                  {integration.features.length > 3 && (
                                    <li className="text-xs text-muted-foreground">+{integration.features.length - 3} more features</li>
                                  )}
                                </ul>
                                <Button size="sm" variant="outline" className="w-full">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Guide
                                </Button>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                      
                      <div className="bg-muted p-6 rounded-lg">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Terminal className="h-4 w-4" />
                          Quick Setup Example
                        </h4>
                        <div className="bg-black text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
                          <pre className="text-green-400">{`// Connect to a REST API
const response = await fetch('https://api.example.com/data', {
  method: 'GET',
  headers: {
    'Authorization': \`Bearer \${apiKey}\`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();`}</pre>
                        </div>
                        <Button size="sm" variant="ghost" className="mt-3">
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Code
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="databases" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Database Connections
                      </CardTitle>
                      <CardDescription>
                        Connect to SQL and NoSQL databases with secure connection pooling and query optimization
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          { 
                            name: 'PostgreSQL', 
                            icon: Server,
                            description: 'Advanced open-source relational database', 
                            features: ['ACID compliance', 'JSON support', 'Advanced indexing', 'Full-text search'],
                            connectionString: 'postgresql://user:pass@host:5432/db'
                          },
                          { 
                            name: 'MySQL', 
                            icon: Database,
                            description: 'Popular relational database system', 
                            features: ['High performance', 'Scalability', 'Data security', 'On-demand flexibility'],
                            connectionString: 'mysql://user:pass@host:3306/db'
                          },
                          { 
                            name: 'MongoDB', 
                            icon: Layers,
                            description: 'Document-based NoSQL database', 
                            features: ['Flexible schema', 'Horizontal scaling', 'Rich queries', 'Aggregation framework'],
                            connectionString: 'mongodb://user:pass@host:27017/db'
                          },
                          { 
                            name: 'Redis', 
                            icon: Activity,
                            description: 'In-memory data structure store', 
                            features: ['Caching', 'Session storage', 'Real-time analytics', 'Pub/Sub messaging'],
                            connectionString: 'redis://user:pass@host:6379/0'
                          },
                          { 
                            name: 'Supabase', 
                            icon: Cloud,
                            description: 'Open-source Firebase alternative', 
                            features: ['Real-time subscriptions', 'Row-level security', 'Auto APIs', 'Built-in auth'],
                            connectionString: 'postgresql://[ref]:[pass]@db.[ref].supabase.co:5432/postgres'
                          },
                          { 
                            name: 'SQLite', 
                            icon: Package,
                            description: 'Lightweight embedded database', 
                            features: ['Zero-configuration', 'Self-contained', 'Cross-platform', 'ACID transactions'],
                            connectionString: 'sqlite:///path/to/database.db'
                          },
                        ].map((db, index) => {
                          const IconComponent = db.icon;
                          return (
                            <Card key={index} className="hover:shadow-lg transition-shadow">
                              <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2">
                                  <IconComponent className="h-5 w-5 text-primary" />
                                  {db.name}
                                </CardTitle>
                                <CardDescription>{db.description}</CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="space-y-2">
                                  {db.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                      <CheckCircle className="h-3 w-3 text-green-500" />
                                      {feature}
                                    </div>
                                  ))}
                                </div>
                                <div className="bg-muted p-3 rounded">
                                  <p className="text-xs text-muted-foreground mb-1">Connection String Example:</p>
                                  <code className="text-xs font-mono">{db.connectionString}</code>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" className="flex-1">
                                    <Eye className="h-4 w-4 mr-1" />
                                    Setup Guide
                                  </Button>
                                  <Button size="sm" variant="ghost">
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="tools" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Business & Productivity Tools
                      </CardTitle>
                      <CardDescription>
                        Integrate with popular business tools, CRMs, and productivity suites
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          { 
                            name: 'Slack', 
                            icon: MessageCircle,
                            description: 'Team communication platform', 
                            features: ['Bot integration', 'Slash commands', 'Interactive messages', 'File sharing'],
                            category: 'Communication'
                          },
                          { 
                            name: 'Microsoft 365', 
                            icon: Mail,
                            description: 'Office suite and productivity tools', 
                            features: ['Outlook integration', 'Teams bots', 'SharePoint', 'OneDrive access'],
                            category: 'Productivity'
                          },
                          { 
                            name: 'Google Workspace', 
                            icon: Cloud,
                            description: 'Gmail, Drive, Calendar integration', 
                            features: ['Gmail API', 'Google Drive', 'Calendar events', 'Sheets integration'],
                            category: 'Productivity'
                          },
                          { 
                            name: 'Salesforce', 
                            icon: BarChart3,
                            description: 'Leading CRM platform', 
                            features: ['Lead management', 'Opportunity tracking', 'Custom objects', 'Apex integration'],
                            category: 'CRM'
                          },
                          { 
                            name: 'HubSpot', 
                            icon: TrendingUp,
                            description: 'CRM and marketing automation', 
                            features: ['Contact management', 'Deal pipelines', 'Email campaigns', 'Analytics'],
                            category: 'CRM'
                          },
                          { 
                            name: 'Zapier', 
                            icon: Zap,
                            description: 'Connect to 5000+ apps', 
                            features: ['Automated workflows', 'Multi-step zaps', 'Webhooks', 'Filters & formatters'],
                            category: 'Automation'
                          },
                        ].map((tool, index) => {
                          const IconComponent = tool.icon;
                          const categoryColors: Record<string, string> = {
                            'Communication': 'bg-blue-100 text-blue-800',
                            'Productivity': 'bg-green-100 text-green-800',
                            'CRM': 'bg-purple-100 text-purple-800',
                            'Automation': 'bg-orange-100 text-orange-800'
                          };
                          return (
                            <Card key={index} className="hover:shadow-lg transition-all hover:scale-105">
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <CardTitle className="flex items-center gap-2 text-base">
                                    <IconComponent className="h-5 w-5 text-primary" />
                                    {tool.name}
                                  </CardTitle>
                                  <Badge className={`${categoryColors[tool.category]} text-xs`} variant="secondary">
                                    {tool.category}
                                  </Badge>
                                </div>
                                <CardDescription className="text-sm">{tool.description}</CardDescription>
                              </CardHeader>
                              <CardContent className="pt-0 space-y-3">
                                <div className="space-y-1">
                                  {tool.features.slice(0, 3).map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs">
                                      <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                                      <span className="text-muted-foreground">{feature}</span>
                                    </div>
                                  ))}
                                  {tool.features.length > 3 && (
                                    <div className="text-xs text-muted-foreground ml-5">+{tool.features.length - 3} more</div>
                                  )}
                                </div>
                                <Button size="sm" variant="outline" className="w-full">
                                  <Link className="h-3 w-3 mr-2" />
                                  Connect
                                </Button>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="enterprise" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Enterprise Integrations
                      </CardTitle>
                      <CardDescription>
                        Enterprise-grade integrations with cloud providers, analytics platforms, and security tools
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-6">
                        {[
                          {
                            category: 'Cloud Providers',
                            icon: Cloud,
                            integrations: [
                              { name: 'AWS', description: 'Amazon Web Services integration', features: ['Lambda functions', 'S3 storage', 'RDS databases', 'CloudWatch'] },
                              { name: 'Azure', description: 'Microsoft Azure services', features: ['Functions', 'Blob storage', 'SQL Database', 'Monitor'] },
                              { name: 'Google Cloud', description: 'Google Cloud Platform', features: ['Cloud Functions', 'Cloud Storage', 'BigQuery', 'Monitoring'] }
                            ]
                          },
                          {
                            category: 'Analytics & BI',
                            icon: BarChart3,
                            integrations: [
                              { name: 'Tableau', description: 'Business intelligence platform', features: ['Data visualization', 'Dashboard creation', 'Real-time analytics', 'Custom reports'] },
                              { name: 'Power BI', description: 'Microsoft business analytics', features: ['Interactive reports', 'Data modeling', 'AI insights', 'Mobile access'] },
                              { name: 'Looker', description: 'Modern BI and data platform', features: ['SQL-based modeling', 'Embedded analytics', 'Data governance', 'API access'] }
                            ]
                          },
                          {
                            category: 'Security & Compliance',
                            icon: Lock,
                            integrations: [
                              { name: 'Okta', description: 'Identity and access management', features: ['Single sign-on', 'Multi-factor auth', 'User provisioning', 'API access'] },
                              { name: 'Auth0', description: 'Authentication and authorization', features: ['Universal login', 'Social connections', 'JWT tokens', 'Rules engine'] },
                              { name: 'Azure AD', description: 'Microsoft identity platform', features: ['Directory services', 'Conditional access', 'B2B/B2C', 'Graph API'] }
                            ]
                          }
                        ].map((section, index) => {
                          const IconComponent = section.icon;
                          return (
                            <div key={index} className="space-y-4">
                              <div className="flex items-center gap-3 pb-2 border-b">
                                <IconComponent className="h-6 w-6 text-primary" />
                                <h3 className="text-xl font-semibold">{section.category}</h3>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {section.integrations.map((integration, idx) => (
                                  <Card key={idx} className="border-2 border-dashed hover:border-solid hover:shadow-md transition-all">
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                                      <CardDescription>{integration.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="space-y-2 mb-4">
                                        {integration.features.map((feature, fidx) => (
                                          <div key={fidx} className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="h-3 w-3 text-green-500" />
                                            <span className="text-muted-foreground">{feature}</span>
                                          </div>
                                        ))}
                                      </div>
                                      <Button size="sm" variant="outline" className="w-full">
                                        <Shield className="h-3 w-3 mr-2" />
                                        Enterprise Setup
                                      </Button>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-blue-600" />
                            Enterprise Support
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-muted-foreground">
                            Need help with enterprise integrations? Our dedicated support team can assist with:
                          </p>
                          <ul className="text-sm space-y-1">
                            {[
                              'Custom integration development',
                              'Security compliance consultation',
                              'Performance optimization',
                              'Dedicated account management'
                            ].map((item, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                                {item}
                              </li>
                            ))}
                          </ul>
                          <Button className="mt-4">
                            <Mail className="h-4 w-4 mr-2" />
                            Contact Enterprise Sales
                          </Button>
                        </CardContent>
                      </Card>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* API Reference Section */}
          {activeSection === 'api' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-4">API Reference</h2>
                <p className="text-muted-foreground mb-6">
                  Complete REST API documentation with interactive examples, SDKs, and comprehensive guides for integrating with KYNEX.dev.
                </p>
              </div>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="authentication">Auth</TabsTrigger>
                  <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
                  <TabsTrigger value="sdks">SDKs</TabsTrigger>
                  <TabsTrigger value="errors">Errors</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5" />
                        API Overview
                      </CardTitle>
                      <CardDescription>
                        RESTful API with JSON responses, comprehensive error handling, and rate limiting
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          {
                            title: 'Base URL',
                            value: 'https://api.kynex.dev/v1',
                            description: 'All API requests use this base URL',
                            icon: Globe
                          },
                          {
                            title: 'Format',
                            value: 'JSON',
                            description: 'All requests and responses use JSON',
                            icon: Code
                          },
                          {
                            title: 'Rate Limit',
                            value: '1000/hour',
                            description: 'Standard rate limit for Pro users',
                            icon: Activity
                          }
                        ].map((item, index) => {
                          const IconComponent = item.icon;
                          return (
                            <Card key={index} className="bg-muted/30">
                              <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base">
                                  <IconComponent className="h-4 w-4 text-primary" />
                                  {item.title}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-lg font-mono font-semibold mb-1">{item.value}</div>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Terminal className="h-4 w-4 text-blue-600" />
                          Quick Start Example
                        </h4>
                        <div className="bg-black text-green-400 p-4 rounded font-mono text-sm overflow-x-auto mb-4">
                          <pre className="text-green-400">{`// Install the SDK
npm install @kynex/sdk

// Initialize and use
import { KynexClient } from '@kynex/sdk';

const client = new KynexClient('your-api-key');
const agents = await client.agents.list();`}</pre>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Code
                          </Button>
                          <Button size="sm">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Full Example
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="authentication" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Authentication Methods
                      </CardTitle>
                      <CardDescription>
                        Secure your API requests with multiple authentication options
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-6">
                        {[
                          {
                            method: 'API Key (Recommended)',
                            description: 'Use API keys for server-to-server authentication',
                            example: 'Authorization: Bearer kynx_sk_1234567890abcdef',
                            icon: Key,
                            security: 'High'
                          },
                          {
                            method: 'OAuth 2.0',
                            description: 'For user-facing applications with delegated access',
                            example: 'Authorization: Bearer oauth_access_token',
                            icon: Lock,
                            security: 'High'
                          },
                          {
                            method: 'JWT Tokens',
                            description: 'For temporary access and webhook verification',
                            example: 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...',
                            icon: FileIcon,
                            security: 'Medium'
                          }
                        ].map((auth, index) => {
                          const IconComponent = auth.icon;
                          const securityColor = auth.security === 'High' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
                          return (
                            <Card key={index} className="border-2">
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <CardTitle className="flex items-center gap-2">
                                    <IconComponent className="h-5 w-5 text-primary" />
                                    {auth.method}
                                  </CardTitle>
                                  <Badge className={securityColor} variant="secondary">
                                    {auth.security} Security
                                  </Badge>
                                </div>
                                <CardDescription>{auth.description}</CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="bg-muted p-3 rounded">
                                  <p className="text-xs text-muted-foreground mb-1">Example Header:</p>
                                  <code className="text-sm font-mono">{auth.example}</code>
                                </div>
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4 mr-2" />
                                  Setup Guide
                                </Button>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>

                      <Card className="bg-yellow-50 border-yellow-200">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-yellow-800">
                            <AlertTriangle className="h-5 w-5" />
                            Security Best Practices
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {[
                            'Never expose API keys in client-side code',
                            'Rotate API keys regularly (every 90 days)',
                            'Use environment variables for key storage',
                            'Implement proper error handling for auth failures',
                            'Monitor API usage for unusual patterns'
                          ].map((tip, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-yellow-700 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-yellow-800">{tip}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="endpoints" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Terminal className="h-5 w-5" />
                        API Endpoints
                      </CardTitle>
                      <CardDescription>
                        Interactive documentation with request/response examples
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {[
                        {
                          category: 'Agents',
                          endpoints: [
                            {
                              method: 'GET',
                              endpoint: '/v1/agents',
                              description: 'List all your agents with pagination',
                              parameters: ['page', 'limit', 'search'],
                              request: null,
                              response: `{
  "agents": [
    {
      "id": "agent_123",
      "name": "Customer Support Bot",
      "status": "active",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "total": 25,
    "has_more": true
  }
}`
                            },
                            {
                              method: 'POST',
                              endpoint: '/v1/agents',
                              description: 'Create a new agent',
                              parameters: [],
                              request: `{
  "name": "New Agent",
  "description": "A helpful assistant",
  "workflow": {
    "nodes": [...],
    "edges": [...]
  }
}`,
                              response: `{
  "agent": {
    "id": "agent_456",
    "name": "New Agent",
    "status": "draft",
    "created_at": "2024-01-15T11:00:00Z"
  }
}`
                            },
                            {
                              method: 'POST',
                              endpoint: '/v1/agents/{id}/chat',
                              description: 'Send a message to an agent',
                              parameters: ['id'],
                              request: `{
  "message": "Hello, how can you help me?",
  "session_id": "session_789",
  "context": {
    "user_id": "user_123"
  }
}`,
                              response: `{
  "response": "Hi! I'm here to help. What can I assist you with today?",
  "session_id": "session_789",
  "metadata": {
    "response_time_ms": 245,
    "tokens_used": 28
  }
}`
                            }
                          ]
                        },
                        {
                          category: 'Deployments',
                          endpoints: [
                            {
                              method: 'GET',
                              endpoint: '/v1/deployments',
                              description: 'List all deployments',
                              parameters: ['agent_id', 'platform', 'status'],
                              request: null,
                              response: `{
  "deployments": [
    {
      "id": "deploy_123",
      "agent_id": "agent_123",
      "platform": "whatsapp",
      "status": "active",
      "url": "https://wa.me/1234567890"
    }
  ]
}`
                            },
                            {
                              method: 'POST',
                              endpoint: '/v1/deployments',
                              description: 'Create a new deployment',
                              parameters: [],
                              request: `{
  "agent_id": "agent_123",
  "platform": "telegram",
  "config": {
    "bot_token": "your_bot_token",
    "webhook_url": "https://yourapp.com/webhook"
  }
}`,
                              response: `{
  "deployment": {
    "id": "deploy_456",
    "status": "deploying",
    "estimated_completion": "2024-01-15T11:05:00Z"
  }
}`
                            }
                          ]
                        }
                      ].map((category, categoryIndex) => (
                        <div key={categoryIndex} className="space-y-4">
                          <h3 className="text-xl font-semibold border-b pb-2">{category.category}</h3>
                          <div className="space-y-4">
                            {category.endpoints.map((endpoint, index) => {
                              const methodColors: Record<string, string> = {
                                'GET': 'bg-green-100 text-green-800 border-green-200',
                                'POST': 'bg-blue-100 text-blue-800 border-blue-200',
                                'PUT': 'bg-yellow-100 text-yellow-800 border-yellow-200',
                                'DELETE': 'bg-red-100 text-red-800 border-red-200'
                              };
                              return (
                                <Card key={index} className="border-2">
                                  <CardHeader className="pb-3">
                                    <div className="flex items-center gap-3 mb-2">
                                      <Badge className={`${methodColors[endpoint.method]} font-mono`} variant="outline">
                                        {endpoint.method}
                                      </Badge>
                                      <code className="text-lg font-mono font-semibold">{endpoint.endpoint}</code>
                                    </div>
                                    <CardDescription className="text-base">{endpoint.description}</CardDescription>
                                    {endpoint.parameters.length > 0 && (
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {endpoint.parameters.map((param, pidx) => (
                                          <Badge key={pidx} variant="secondary" className="text-xs">
                                            {param}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <Tabs defaultValue="response" className="w-full">
                                      <TabsList className="grid w-full grid-cols-3">
                                        {endpoint.request && <TabsTrigger value="request">Request</TabsTrigger>}
                                        <TabsTrigger value="response">Response</TabsTrigger>
                                        <TabsTrigger value="try">Try It</TabsTrigger>
                                      </TabsList>
                                      
                                      {endpoint.request && (
                                        <TabsContent value="request">
                                          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
                                            <pre>{endpoint.request}</pre>
                                          </div>
                                        </TabsContent>
                                      )}
                                      
                                      <TabsContent value="response">
                                        <div className="bg-black text-blue-400 p-4 rounded font-mono text-sm overflow-x-auto">
                                          <pre>{endpoint.response}</pre>
                                        </div>
                                      </TabsContent>
                                      
                                      <TabsContent value="try">
                                        <div className="bg-muted p-4 rounded">
                                          <p className="text-sm text-muted-foreground mb-3">Interactive API testing coming soon!</p>
                                          <Button size="sm" disabled>
                                            <PlayCircle className="h-4 w-4 mr-2" />
                                            Test Endpoint
                                          </Button>
                                        </div>
                                      </TabsContent>
                                    </Tabs>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="sdks" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Official SDKs
                      </CardTitle>
                      <CardDescription>
                        Pre-built libraries for popular programming languages
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          {
                            language: 'Node.js / JavaScript',
                            package: '@kynex/sdk',
                            version: 'v2.1.0',
                            install: 'npm install @kynex/sdk',
                            example: `import { KynexClient } from '@kynex/sdk';

const client = new KynexClient('your-api-key');
const agents = await client.agents.list();`,
                            icon: '🟨',
                            downloads: '15.2k/week'
                          },
                          {
                            language: 'Python',
                            package: 'kynex-python',
                            version: 'v1.8.3',
                            install: 'pip install kynex',
                            example: `from kynex import KynexClient

client = KynexClient('your-api-key')
agents = client.agents.list()`,
                            icon: '🐍',
                            downloads: '8.7k/week'
                          },
                          {
                            language: 'Go',
                            package: 'github.com/kynex/go-sdk',
                            version: 'v1.3.1',
                            install: 'go get github.com/kynex/go-sdk',
                            example: `import "github.com/kynex/go-sdk"

client := kynex.NewClient("your-api-key")
agents, err := client.Agents.List()`,
                            icon: '🔵',
                            downloads: '2.1k/week'
                          },
                          {
                            language: 'PHP',
                            package: 'kynex/kynex-php',
                            version: 'v1.5.2',
                            install: 'composer require kynex/kynex-php',
                            example: `use Kynex\KynexClient;

$client = new KynexClient('your-api-key');
$agents = $client->agents->list();`,
                            icon: '🟣',
                            downloads: '3.4k/week'
                          }
                        ].map((sdk, index) => (
                          <Card key={index} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                  <span className="text-2xl">{sdk.icon}</span>
                                  {sdk.language}
                                </CardTitle>
                                <Badge variant="outline">{sdk.version}</Badge>
                              </div>
                              <CardDescription>
                                <code className="text-sm">{sdk.package}</code>
                              </CardDescription>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Download className="h-3 w-3" />
                                {sdk.downloads}
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <h5 className="font-medium mb-2">Installation</h5>
                                <div className="bg-black text-green-400 p-3 rounded font-mono text-sm">
                                  {sdk.install}
                                </div>
                              </div>
                              <div>
                                <h5 className="font-medium mb-2">Quick Example</h5>
                                <div className="bg-black text-blue-400 p-3 rounded font-mono text-xs overflow-x-auto">
                                  <pre>{sdk.example}</pre>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4 mr-2" />
                                  Documentation
                                </Button>
                                <Button size="sm" variant="ghost">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  GitHub
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="errors" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Error Handling
                      </CardTitle>
                      <CardDescription>
                        Comprehensive error codes and troubleshooting guide
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {[
                        {
                          category: 'Authentication Errors',
                          color: 'border-red-200 bg-red-50',
                          errors: [
                            { code: 401, name: 'UNAUTHORIZED', message: 'Invalid API key or token', solution: 'Check your API key and ensure it\'s properly formatted' },
                            { code: 403, name: 'FORBIDDEN', message: 'Insufficient permissions', solution: 'Verify your API key has the required permissions' },
                            { code: 429, name: 'RATE_LIMITED', message: 'Too many requests', solution: 'Implement exponential backoff and respect rate limits' }
                          ]
                        },
                        {
                          category: 'Client Errors',
                          color: 'border-yellow-200 bg-yellow-50',
                          errors: [
                            { code: 400, name: 'BAD_REQUEST', message: 'Invalid request format', solution: 'Check request body and parameters' },
                            { code: 404, name: 'NOT_FOUND', message: 'Resource not found', solution: 'Verify the resource ID exists' },
                            { code: 422, name: 'VALIDATION_ERROR', message: 'Request validation failed', solution: 'Check required fields and data types' }
                          ]
                        },
                        {
                          category: 'Server Errors',
                          color: 'border-gray-200 bg-gray-50',
                          errors: [
                            { code: 500, name: 'INTERNAL_ERROR', message: 'Internal server error', solution: 'Retry the request or contact support' },
                            { code: 503, name: 'SERVICE_UNAVAILABLE', message: 'Service temporarily unavailable', solution: 'Wait and retry with exponential backoff' },
                            { code: 504, name: 'TIMEOUT', message: 'Request timeout', solution: 'Retry the request or increase timeout' }
                          ]
                        }
                      ].map((category, categoryIndex) => (
                        <Card key={categoryIndex} className={category.color}>
                          <CardHeader>
                            <CardTitle className="text-lg">{category.category}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {category.errors.map((error, errorIndex) => (
                                <div key={errorIndex} className="bg-white p-4 rounded border">
                                  <div className="flex items-center gap-3 mb-2">
                                    <Badge variant="outline" className="font-mono">
                                      {error.code}
                                    </Badge>
                                    <code className="font-semibold">{error.name}</code>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{error.message}</p>
                                  <div className="text-sm">
                                    <strong>Solution:</strong> {error.solution}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      <Card className="bg-blue-50 border-blue-200">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-blue-800">
                            <Info className="h-5 w-5" />
                            Error Response Format
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-blue-700 mb-3">All API errors follow this consistent format:</p>
                          <div className="bg-black text-red-400 p-4 rounded font-mono text-sm">
{`{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "name",
      "issue": "Field is required"
    },
    "request_id": "req_123456789"
  }
}`}
                          </div>
                        </CardContent>
                      </Card>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Troubleshooting Section */}
          {activeSection === 'troubleshooting' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-4">Troubleshooting</h2>
                <p className="text-muted-foreground mb-6">
                  Find solutions to common issues with our searchable knowledge base and diagnostic tools.
                </p>
              </div>

              {/* Search Bar */}
              <Card>
                <CardContent className="p-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search for solutions, error codes, or keywords..."
                      className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Badge variant="secondary" className="text-xs">
                        Ctrl + K
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                    <span>Popular searches:</span>
                    {['deployment failed', 'API error', 'agent not responding', 'slow performance'].map((term, idx) => (
                      <button key={idx} className="px-2 py-1 bg-muted rounded hover:bg-muted/80 transition-colors">
                        {term}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="issues" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="issues">Common Issues</TabsTrigger>
                  <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
                  <TabsTrigger value="status">System Status</TabsTrigger>
                  <TabsTrigger value="support">Get Help</TabsTrigger>
                </TabsList>

                <TabsContent value="issues" className="space-y-6">
                  {/* Issue Categories */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {[
                      { category: 'Agent Issues', count: 12, icon: Bot, color: 'bg-blue-100 text-blue-800' },
                      { category: 'Deployment', count: 8, icon: Rocket, color: 'bg-green-100 text-green-800' },
                      { category: 'Integrations', count: 15, icon: Globe, color: 'bg-purple-100 text-purple-800' },
                    ].map((cat, index) => {
                      const IconComponent = cat.icon;
                      return (
                        <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="flex items-center gap-3 p-4">
                            <div className={`p-2 rounded-lg ${cat.color}`}>
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-medium">{cat.category}</h3>
                              <p className="text-sm text-muted-foreground">{cat.count} articles</p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5" />
                        Frequently Asked Questions
                      </CardTitle>
                      <CardDescription>
                        Quick solutions to the most common problems
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {[
                          {
                            id: 'agent-not-responding',
                            question: 'My agent is not responding to messages',
                            category: 'Agent Issues',
                            priority: 'High',
                            solution: {
                              description: 'This usually indicates a deployment or workflow configuration issue.',
                              steps: [
                                'Check if your agent deployment status is "Active"',
                                'Verify all workflow nodes are properly connected',
                                'Ensure API keys and integrations are configured correctly',
                                'Test your agent using the built-in testing environment',
                                'Review deployment logs for error messages'
                              ],
                              additionalHelp: 'If the issue persists, check our agent debugging guide or contact support.'
                            },
                            tags: ['deployment', 'workflow', 'testing']
                          },
                          {
                            id: 'slow-responses',
                            question: 'Agent responses are taking too long',
                            category: 'Performance',
                            priority: 'Medium',
                            solution: {
                              description: 'Slow response times can be caused by workflow complexity or external API delays.',
                              steps: [
                                'Optimize workflow by removing unnecessary nodes',
                                'Implement caching for frequently accessed data',
                                'Use asynchronous operations where possible',
                                'Check external API response times',
                                'Consider upgrading your plan for better performance'
                              ],
                              additionalHelp: 'Monitor your agent\'s performance metrics in the dashboard for detailed insights.'
                            },
                            tags: ['performance', 'optimization', 'workflow']
                          },
                          {
                            id: 'deployment-failed',
                            question: 'Agent deployment keeps failing',
                            category: 'Deployment',
                            priority: 'High',
                            solution: {
                              description: 'Deployment failures are often due to configuration errors or missing requirements.',
                              steps: [
                                'Check deployment logs for specific error messages',
                                'Verify all required configuration fields are completed',
                                'Ensure your account has sufficient permissions',
                                'Test your agent locally before deployment',
                                'Validate all API keys and external service connections'
                              ],
                              additionalHelp: 'For persistent deployment issues, our technical support team can review your configuration.'
                            },
                            tags: ['deployment', 'configuration', 'permissions']
                          },
                          {
                            id: 'integration-errors',
                            question: 'External integrations are not working',
                            category: 'Integrations',
                            priority: 'High',
                            solution: {
                              description: 'Integration issues usually stem from authentication or configuration problems.',
                              steps: [
                                'Verify API credentials and endpoint URLs',
                                'Check rate limits and usage quotas',
                                'Ensure proper authentication method is selected',
                                'Test the integration connection independently',
                                'Review integration logs for detailed error information'
                              ],
                              additionalHelp: 'Each integration has specific setup requirements detailed in our integration guides.'
                            },
                            tags: ['integrations', 'api', 'authentication']
                          },
                          {
                            id: 'workflow-errors',
                            question: 'Workflow is throwing errors during execution',
                            category: 'Workflow',
                            priority: 'Medium',
                            solution: {
                              description: 'Workflow errors can occur due to data format issues or node configuration problems.',
                              steps: [
                                'Check the workflow execution logs for specific error details',
                                'Verify data types and formats between connected nodes',
                                'Ensure all required node parameters are configured',
                                'Test individual workflow segments to isolate the issue',
                                'Use the workflow debugger to step through execution'
                              ],
                              additionalHelp: 'The visual workflow editor provides error indicators to help identify problematic nodes.'
                            },
                            tags: ['workflow', 'debugging', 'execution']
                          },
                          {
                            id: 'billing-questions',
                            question: 'Questions about billing and usage limits',
                            category: 'Account',
                            priority: 'Low',
                            solution: {
                              description: 'Billing and usage information is available in your account dashboard.',
                              steps: [
                                'Visit the Billing section in your account settings',
                                'Review your current plan and usage metrics',
                                'Check for any outstanding invoices or payment issues',
                                'Compare your usage against plan limits',
                                'Consider upgrading if you\'re approaching limits regularly'
                              ],
                              additionalHelp: 'For billing disputes or payment issues, contact our billing support team directly.'
                            },
                            tags: ['billing', 'account', 'limits']
                          }
                        ].map((faq, index) => {
                          const priorityColors: Record<string, string> = {
                            'High': 'bg-red-100 text-red-800',
                            'Medium': 'bg-yellow-100 text-yellow-800',
                            'Low': 'bg-green-100 text-green-800'
                          };
                          return (
                            <AccordionItem key={faq.id} value={faq.id}>
                              <AccordionTrigger className="text-left">
                                <div className="flex items-center gap-3 flex-1">
                                  <span>{faq.question}</span>
                                  <div className="flex gap-2">
                                    <Badge className={priorityColors[faq.priority]} variant="secondary">
                                      {faq.priority}
                                    </Badge>
                                    <Badge variant="outline">{faq.category}</Badge>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 pt-2">
                                  <p className="text-sm text-muted-foreground">{faq.solution.description}</p>
                                  
                                  <div>
                                    <h5 className="font-medium mb-2">Solution Steps:</h5>
                                    <ol className="space-y-2">
                                      {faq.solution.steps.map((step, idx) => (
                                        <li key={idx} className="flex gap-3 text-sm">
                                          <span className="flex-shrink-0 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                                            {idx + 1}
                                          </span>
                                          <span className="text-muted-foreground">{step}</span>
                                        </li>
                                      ))}
                                    </ol>
                                  </div>
                                  
                                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                                    <div className="flex items-start gap-2">
                                      <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                      <p className="text-sm text-blue-800">{faq.solution.additionalHelp}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-2">
                                    {faq.tags.map((tag, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        #{tag}
                                      </Badge>
                                    ))}
                                  </div>
                                  
                                  <div className="flex gap-2 pt-2">
                                    <Button size="sm" variant="outline">
                                      <Eye className="h-4 w-4 mr-2" />
                                      Detailed Guide
                                    </Button>
                                    <Button size="sm" variant="ghost">
                                      <MessageCircle className="h-4 w-4 mr-2" />
                                      Still Need Help?
                                    </Button>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="diagnostics" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TestTube className="h-5 w-5" />
                        Diagnostic Tools
                      </CardTitle>
                      <CardDescription>
                        Automated tools to help identify and resolve issues
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {[
                        {
                          tool: 'Agent Health Check',
                          description: 'Comprehensive analysis of your agent\'s configuration and performance',
                          features: ['Workflow validation', 'Performance metrics', 'Configuration audit', 'Deployment status'],
                          icon: Activity,
                          color: 'bg-green-50 border-green-200'
                        },
                        {
                          tool: 'Integration Tester',
                          description: 'Test all external integrations and API connections',
                          features: ['Connection testing', 'Authentication validation', 'Response time analysis', 'Error detection'],
                          icon: Globe,
                          color: 'bg-blue-50 border-blue-200'
                        },
                        {
                          tool: 'Workflow Debugger',
                          description: 'Step-through debugging for complex workflows',
                          features: ['Step-by-step execution', 'Variable inspection', 'Error tracing', 'Performance profiling'],
                          icon: Code,
                          color: 'bg-purple-50 border-purple-200'
                        },
                        {
                          tool: 'Log Analyzer',
                          description: 'AI-powered analysis of system logs and error patterns',
                          features: ['Error pattern detection', 'Performance insights', 'Anomaly detection', 'Trend analysis'],
                          icon: BarChart3,
                          color: 'bg-orange-50 border-orange-200'
                        }
                      ].map((tool, index) => {
                        const IconComponent = tool.icon;
                        return (
                          <Card key={index} className={`${tool.color} hover:shadow-md transition-shadow`}>
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <div className="p-3 bg-white rounded-lg shadow-sm">
                                  <IconComponent className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-grow">
                                  <h3 className="font-semibold text-lg mb-2">{tool.tool}</h3>
                                  <p className="text-muted-foreground mb-4">{tool.description}</p>
                                  <div className="grid grid-cols-2 gap-2 mb-4">
                                    {tool.features.map((feature, idx) => (
                                      <div key={idx} className="flex items-center gap-2 text-sm">
                                        <CheckCircle className="h-3 w-3 text-green-500" />
                                        <span>{feature}</span>
                                      </div>
                                    ))}
                                  </div>
                                  <Button size="sm">
                                    <PlayCircle className="h-4 w-4 mr-2" />
                                    Run Diagnostic
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="status" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        System Status
                      </CardTitle>
                      <CardDescription>
                        Real-time status of KYNEX.dev services and infrastructure
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Overall Status */}
                        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                          <div>
                            <h3 className="font-medium text-green-900">All Systems Operational</h3>
                            <p className="text-sm text-green-700">All services are running normally</p>
                          </div>
                        </div>

                        {/* Service Status */}
                        <div className="grid gap-4">
                          {[
                            { service: 'Agent Runtime', status: 'operational', uptime: '99.99%', responseTime: '120ms' },
                            { service: 'API Gateway', status: 'operational', uptime: '99.97%', responseTime: '85ms' },
                            { service: 'Database', status: 'operational', uptime: '99.95%', responseTime: '45ms' },
                            { service: 'File Storage', status: 'operational', uptime: '99.98%', responseTime: '200ms' },
                            { service: 'Authentication', status: 'operational', uptime: '99.99%', responseTime: '90ms' },
                            { service: 'Deployment Engine', status: 'maintenance', uptime: '99.92%', responseTime: '150ms' },
                          ].map((service, index) => {
                            const statusColors: Record<string, string> = {
                              'operational': 'text-green-600 bg-green-100',
                              'maintenance': 'text-yellow-600 bg-yellow-100',
                              'degraded': 'text-orange-600 bg-orange-100',
                              'outage': 'text-red-600 bg-red-100'
                            };
                            return (
                              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className={`w-2 h-2 rounded-full ${
                                    service.status === 'operational' ? 'bg-green-500' :
                                    service.status === 'maintenance' ? 'bg-yellow-500' :
                                    service.status === 'degraded' ? 'bg-orange-500' : 'bg-red-500'
                                  }`} />
                                  <h4 className="font-medium">{service.service}</h4>
                                  <Badge className={statusColors[service.status]} variant="secondary">
                                    {service.status === 'maintenance' ? 'Scheduled Maintenance' : 'Operational'}
                                  </Badge>
                                </div>
                                <div className="flex gap-6 text-sm text-muted-foreground">
                                  <span>Uptime: {service.uptime}</span>
                                  <span>Response: {service.responseTime}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Recent Incidents */}
                        <div>
                          <h4 className="font-medium mb-3">Recent Incidents</h4>
                          <div className="space-y-3">
                            {[
                              {
                                date: '2024-01-14',
                                title: 'Scheduled maintenance - Deployment Engine',
                                status: 'resolved',
                                duration: '2 hours'
                              },
                              {
                                date: '2024-01-10',
                                title: 'Intermittent API response delays',
                                status: 'resolved',
                                duration: '45 minutes'
                              }
                            ].map((incident, index) => (
                              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <div className="flex-grow">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{incident.title}</span>
                                    <Badge variant="outline">Resolved</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {incident.date} • Duration: {incident.duration}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="support" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Get Help & Support
                      </CardTitle>
                      <CardDescription>
                        Multiple ways to get the help you need
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          {
                            title: 'Live Chat Support',
                            description: 'Get instant help from our support team',
                            availability: '24/7',
                            responseTime: '< 2 minutes',
                            icon: MessageCircle,
                            action: 'Start Chat',
                            color: 'bg-blue-50 border-blue-200 text-blue-900'
                          },
                          {
                            title: 'Community Forum',
                            description: 'Connect with other developers and share knowledge',
                            availability: 'Always open',
                            responseTime: 'Community driven',
                            icon: Users,
                            action: 'Join Forum',
                            color: 'bg-green-50 border-green-200 text-green-900'
                          },
                          {
                            title: 'Submit a Ticket',
                            description: 'For complex technical issues requiring detailed investigation',
                            availability: 'Business hours',
                            responseTime: '< 4 hours',
                            icon: FileText,
                            action: 'Create Ticket',
                            color: 'bg-purple-50 border-purple-200 text-purple-900'
                          },
                          {
                            title: 'Schedule a Call',
                            description: 'One-on-one consultation with our technical experts',
                            availability: 'By appointment',
                            responseTime: 'Same day',
                            icon: Calendar,
                            action: 'Book Call',
                            color: 'bg-orange-50 border-orange-200 text-orange-900'
                          }
                        ].map((support, index) => {
                          const IconComponent = support.icon;
                          return (
                            <Card key={index} className={`${support.color} hover:shadow-lg transition-shadow`}>
                              <CardContent className="p-6">
                                <div className="flex items-start gap-3 mb-4">
                                  <IconComponent className="h-6 w-6 flex-shrink-0 mt-1" />
                                  <div>
                                    <h3 className="font-semibold mb-1">{support.title}</h3>
                                    <p className="text-sm opacity-80">{support.description}</p>
                                  </div>
                                </div>
                                <div className="space-y-2 mb-4">
                                  <div className="flex justify-between text-sm">
                                    <span>Availability:</span>
                                    <span className="font-medium">{support.availability}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Response Time:</span>
                                    <span className="font-medium">{support.responseTime}</span>
                                  </div>
                                </div>
                                <Button className="w-full" size="sm">
                                  {support.action}
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                      
                      {/* Contact Information */}
                      <Card className="mt-6 bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
                        <CardContent className="p-6">
                          <div className="text-center">
                            <h3 className="font-semibold mb-2">Enterprise Support</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Need dedicated support for your team? Contact our enterprise team for custom support plans.
                            </p>
                            <Button variant="outline">
                              <Mail className="h-4 w-4 mr-2" />
                              Contact Enterprise Sales
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
