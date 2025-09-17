
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  MoveRight,
  Bot,
  Wand2,
  Rocket,
  LayoutDashboard,
  Zap,
  Code,
  ShieldCheck,
  Heart,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Image from 'next/image';
import { KynexLogo } from '@/components/icons/kynex-logo';
import { KynexDevLogo } from '@/components/kynex-dev-logo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader } from '@/components/ui/loader';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

const timeline: {
  step: number;
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    step: 1,
    title: 'Prompt to Workflow',
    description:
      'Describe your agent’s goal in plain English. Our AI interprets your needs and drafts a complete workflow graph.',
    icon: Wand2,
  },
  {
    step: 2,
    title: 'Review & Refine',
    description:
      'Visually inspect the generated workflow. Use the AI editor to make changes with natural language commands.',
    icon: Bot,
  },
  {
    step: 3,
    title: 'Connect & Deploy',
    description:
      'Select your deployment platform, add your credentials, and deploy your agent with one click.',
    icon: Rocket,
  },
  {
    step: 4,
    title: 'Monitor & Improve',
    description:
      'Track your agent’s performance on the dashboard. Analyze logs and user interactions to continuously improve its logic.',
    icon: LayoutDashboard,
  },
];

const features = [
  {
    icon: Zap,
    title: 'AI-Powered Workflow Generation',
    description:
      'Go from a simple text prompt to a fully functional workflow in seconds. Our AI handles the heavy lifting, so you can focus on the logic.',
  },
  {
    icon: Code,
    title: 'Full Code Ownership',
    description:
      'We generate standard Next.js and Genkit code. You have complete control to customize, extend, and integrate it anywhere.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure and Scalable',
    description:
      'Built on Supabase with Clerk authentication, your agents are deployed to a secure, scalable infrastructure that grows with your needs.',
  },
];

const faqs = [
  {
    question: 'What is KYNEX.dev?',
    answer:
      'KYNEX.dev is a platform for creating, managing, and deploying AI agents. It uses Genkit and Next.js to provide a seamless experience from idea to production, allowing you to generate entire workflows from a simple prompt.',
  },
  {
    question: 'Do I need to know how to code?',
    answer:
      'While the visual editor and AI generation make it easy to get started, having some knowledge of JavaScript/TypeScript, Next.js, and Genkit will allow you to unlock the full potential of the platform and customize your generated agents.',
  },
  {
    question: 'What AI models can I use?',
    answer:
      'KYNEX.dev is built on Genkit, which supports a wide range of models from providers like Google (Gemini), Anthropic (Claude), and various open models through OpenRouter. You can configure and use any model supported by Genkit.',
  },
  {
    question: 'Where are my agents hosted?',
    answer:
      'Agents created with KYNEX.dev are deployed to a serverless environment, providing a secure, scalable, and reliable platform for your applications.',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            // The AppShell now handles redirecting to the dashboard.
            // This page will redirect if a session is found on load.
            setIsAuthenticated(true);
            router.push('/dashboard');
        } else {
            setIsAuthenticated(false);
            setIsLoading(false);
        }
    };
    checkSession();
  }, [router, supabase]);

  const handleLogoClick = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      router.push('/dashboard');
    } else {
      // Already on homepage, scroll to top or do nothing
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };


  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="flex items-center justify-between p-4 border-b">
        <KynexDevLogo logoSize="md" onClick={handleLogoClick} />
        <nav className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="container mx-auto text-center py-20 md:py-32">
          <div className="flex flex-col items-center">
            <h2 className="text-4xl md:text-6xl font-bold font-headline mb-4 tracking-tight max-w-4xl">
              The Ultimate Platform for AI Agent Development
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl">
              KYNEX.dev provides a seamless, powerful, and intuitive platform
              to bring your AI agent ideas to life. From simple bots to
              complex, multi-agent workflows, we give you the tools to build the
              future.
            </p>
            <Button asChild size="lg">
              <Link href="/sign-up">
                Start Building for Free
                <MoveRight className="ml-2" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">
                From Idea to Live Agent in Minutes
              </h2>
              <p className="text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">
                A clear, four-step path to bringing your AI agents to life, with
                a powerful visual editor and AI-assisted workflow creation.
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="space-y-8">
                {timeline.map((item) => (
                  <div
                    key={item.step}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <item.icon className="w-6 h-6" />
                      </div>
                    </div>
                    <Card className="mt-4 w-full hover:shadow-lg hover:-translate-y-1 transition-transform duration-300">
                      <CardHeader>
                        <CardTitle>{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">
                          {item.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">
                Why Choose KYNEX.dev?
              </h2>
              <p className="text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">
                Powerful features designed to streamline your development
                process and bring your ideas to life faster.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="text-center p-4 hover:shadow-xl hover:-translate-y-2 transition-transform duration-300"
                >
                  <CardHeader className="items-center">
                    <div className="p-4 bg-primary/10 rounded-full inline-block">
                      <feature.icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="mt-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-muted-foreground mt-2">
                Find answers to common questions about KYNEX.dev.
              </p>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index + 1}`}>
                  <AccordionTrigger className="text-lg">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>
      <footer className="py-8 border-t text-muted-foreground">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <KynexLogo width={28} height={28} className="h-7 w-7" />
            <span>© {new Date().getFullYear()} KYNEX.dev. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
