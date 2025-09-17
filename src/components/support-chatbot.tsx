'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { KynexLogo } from './icons/kynex-logo';
import { Loader } from '@/components/ui/loader';
import Link from 'next/link';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface SupportChatbotProps {
  className?: string;
  alwaysOpen?: boolean;
}

export function SupportChatbot({ className, alwaysOpen = false }: SupportChatbotProps) {
  const [isOpen, setIsOpen] = useState(alwaysOpen);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial greeting message
  useEffect(() => {
    if ((isOpen || alwaysOpen) && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `Hi! 👋 I'm your KYNEX.dev support assistant. I'm here to help you with questions about creating AI agents, deployments, billing, or any other platform features. How can I assist you today?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, alwaysOpen, messages.length]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if ((isOpen || alwaysOpen) && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, alwaysOpen]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    const typingMessage: ChatMessage = {
      id: 'typing',
      role: 'assistant',
      content: 'Thinking...',
      timestamp: new Date(),
      isTyping: true
    };

    setMessages(prev => [...prev, userMessage, typingMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId,
          history: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => prev.filter(msg => msg.id !== 'typing').concat(assistantMessage));
      setConversationId(data.conversationId);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
      setError(errorMessage);
      
      const errorResponse: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `I'm sorry, I encountered an error: "${errorMessage}". Please try again or email us at support@kynex.dev for immediate assistance.`,
        timestamp: new Date()
      };

      setMessages(prev => prev.filter(msg => msg.id !== 'typing').concat(errorResponse));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setConversationId(null);
    setError(null);
  };

  const openChat = () => {
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  if (!isOpen && !alwaysOpen) {
    return (
      <Button 
        onClick={openChat}
        className={cn("flex items-center justify-center gap-2 min-h-[40px]", className)}
        variant="outline"
      >
        <MessageCircle className="h-4 w-4 flex-shrink-0" />
        <span className="font-medium">Start Chat</span>
      </Button>
    );
  }

  return (
    <Card className={cn("w-full max-w-md mx-auto shadow-lg h-fit max-h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <KynexLogo width={20} height={20} />
          </div>
          <div>
            <CardTitle className="text-sm font-bold font-headline tracking-tight">
              KYNEX<span className="text-muted-foreground/80 font-normal">.dev</span> Support
            </CardTitle>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              AI Assistant Online
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearChat}
            className="h-7 w-7 p-0"
            title="Clear chat"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={closeChat}
            className="h-7 w-7 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea 
          ref={scrollAreaRef}
          className="h-80 p-4 border-t"
        >
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  message.role === 'user' ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                  message.role === 'user' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {message.role === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                </div>
                <div className={cn(
                  "rounded-lg px-3 py-2 text-sm",
                  message.role === 'user'
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-muted"
                )}>
                  {message.isTyping ? (
                    <div className="flex items-center gap-1">
                      <Loader variant="inline" size="xs" className="h-3 w-3" />
                      <span className="text-xs text-muted-foreground">Thinking...</span>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                  )}
                  <div className={cn(
                    "text-xs mt-1",
                    message.role === 'user' 
                      ? "text-primary-foreground/70" 
                      : "text-muted-foreground"
                  )}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {error && (
          <div className="px-4 py-2 bg-destructive/10 border-t">
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 text-sm"
            />
            <Button 
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="sm"
              className="px-3"
            >
              {isLoading ? (
                <Loader variant="inline" size="xs" className="h-3 w-3" />
              ) : (
                <Send className="h-3 w-3" />
              )}
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs py-0">
                AI Assistant
              </Badge>
              <span>Powered by KYNEX.dev</span>
            </div>
            <Link 
              href="/help" 
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              Help Center
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
