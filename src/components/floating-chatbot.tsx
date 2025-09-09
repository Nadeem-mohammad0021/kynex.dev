'use client';

import { useState } from 'react';
import { SupportChatbot } from './support-chatbot';
import { Button } from './ui/button';
import { MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingChatbotProps {
  className?: string;
}

export function FloatingChatbot({ className }: FloatingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      {isOpen ? (
        <div className="relative">
          <div className="absolute bottom-16 right-0 w-96 max-w-[calc(100vw-3rem)] max-h-[calc(100vh-8rem)] sm:max-w-[90vw]">
            <SupportChatbot alwaysOpen />
          </div>
          <Button
            onClick={() => setIsOpen(false)}
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 border-2 border-white/20"
          >
            <X className="h-6 w-6 text-white" strokeWidth={2} />
          </Button>
        </div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 border-2 border-white/20"
        >
          <MessageCircle className="h-6 w-6 text-white" strokeWidth={2} />
        </Button>
      )}
    </div>
  );
}
