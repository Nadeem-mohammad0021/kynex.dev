'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, X, Play, Book, MessageCircle } from 'lucide-react';
import { useTutorial } from './tutorial-provider';
import { usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

export function FloatingHelpButton() {
  const { startTutorial, isRunning } = useTutorial();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (isRunning) {
    return null; // Hide during tutorial
  }

  const getCurrentPageName = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/agents') return 'Explore Agents';
    if (pathname === '/my-agents') return 'My Agents';
    if (pathname.includes('/agents/editor/')) return 'Agent Editor';
    if (pathname === '/deployments') return 'Deployments';
    if (pathname === '/help') return 'Help & Support';
    if (pathname === '/settings') return 'Settings';
    if (pathname === '/subscription') return 'Subscription';
    if (pathname === '/my-account') return 'My Account';
    return 'Current Page';
  };

  const getCurrentTutorialName = () => {
    if (pathname === '/dashboard') return 'dashboard';
    if (pathname === '/agents') return 'agents';
    if (pathname === '/my-agents') return 'my-agents';
    if (pathname.includes('/agents/editor/')) return 'editor';
    if (pathname === '/deployments') return 'deployments';
    if (pathname === '/help') return 'help';
    if (pathname === '/settings') return 'settings';
    if (pathname === '/subscription') return 'subscription';
    if (pathname === '/my-account') return 'settings'; // Use settings tutorial for my-account
    return 'dashboard';
  };

  const handleStartTutorial = () => {
    const tutorialName = getCurrentTutorialName();
    startTutorial(tutorialName);
    setIsOpen(false);
  };

  const helpLinks = [
    { label: 'Dashboard Tutorial', tutorial: 'dashboard', icon: Book },
    { label: 'Explore Agents Tutorial', tutorial: 'agents', icon: Book },
    { label: 'My Agents Tutorial', tutorial: 'my-agents', icon: Book },
    { label: 'Editor Tutorial', tutorial: 'editor', icon: Book },
    { label: 'Deployments Tutorial', tutorial: 'deployments', icon: Book },
    { label: 'Help Center Tutorial', tutorial: 'help', icon: Book },
    { label: 'Settings Tutorial', tutorial: 'settings', icon: Book },
    { label: 'Subscription Tutorial', tutorial: 'subscription', icon: Book },
  ];

  return (
    <div className="fixed bottom-4 right-20 z-40">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className="rounded-full w-12 h-12 shadow-lg hover:shadow-xl transition-all duration-200 bg-primary/90 hover:bg-primary"
            title="Get help and tutorials"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 mb-2">
          <DropdownMenuLabel className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Help & Tutorials
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleStartTutorial} className="flex items-center gap-2">
            <Play className="h-4 w-4 text-primary" />
            <div>
              <div className="font-medium">Start {getCurrentPageName()} Tutorial</div>
              <div className="text-xs text-muted-foreground">Get guided help for this page</div>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground">Other Tutorials</DropdownMenuLabel>
          
          {helpLinks
            .filter(link => link.tutorial !== getCurrentTutorialName())
            .slice(0, 3)
            .map((link) => (
            <DropdownMenuItem 
              key={link.tutorial}
              onClick={() => {
                startTutorial(link.tutorial);
                setIsOpen(false);
              }}
              className="flex items-center gap-2 text-sm"
            >
              <link.icon className="h-3 w-3 text-muted-foreground" />
              {link.label}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex items-center gap-2 text-sm">
            <MessageCircle className="h-3 w-3 text-muted-foreground" />
            Contact Support
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
