
"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Plus, Sparkles, Wand2 } from "lucide-react";
import { GenerateWorkflowFromPromptOutput } from "@/ai/flows/generate-workflow-from-prompt";
import { useToast } from '@/hooks/use-toast';
import { Loader } from './ui/loader';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

const formSchema = z.object({
  prompt: z.string().min(10, {
    message: "Prompt must be at least 10 characters.",
  }),
});

interface NewWorkflowDialogProps {
    onWorkflowGenerated: (workflow: GenerateWorkflowFromPromptOutput) => void;
    userId?: string;
}

export function NewWorkflowDialog({ onWorkflowGenerated, userId }: NewWorkflowDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Client-side check for user ID
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to create a workflow. Please sign in and try again.",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get current session to send auth token
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No valid session found. Please sign in again.');
      }

      const response = await fetch('/api/workflows/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          prompt: values.prompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle user creation timing issues with auto-retry
        if (response.status === 503 && errorData.error?.includes('being created')) {
          toast({
            title: "Setting up your profile...",
            description: "Please wait a moment while we complete your setup.",
          });
          
          // Wait 2 seconds and try again automatically
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Retry the request
          const retryResponse = await fetch('/api/workflows/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              prompt: values.prompt,
            }),
          });
          
          if (!retryResponse.ok) {
            const retryErrorData = await retryResponse.json();
            throw new Error(retryErrorData.error || 'Failed to generate workflow after retry');
          }
          
          const retryResult: GenerateWorkflowFromPromptOutput = await retryResponse.json();
          onWorkflowGenerated(retryResult);
          
          toast({
            title: "Workflow Generated!",
            description: "Your new workflow has been created successfully.",
          });
          setIsOpen(false);
          form.reset();
          return; // Exit early since retry succeeded
        }
        
        throw new Error(errorData.error || 'Failed to generate workflow');
      }

      const result: GenerateWorkflowFromPromptOutput = await response.json();
      onWorkflowGenerated(result);
      toast({
        title: "Workflow Generated!",
        description: "Your new workflow has been created as a draft.",
      });
      setIsOpen(false);
      form.reset();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem generating the workflow.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
            <Wand2 className="mr-2" />
            Generate with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
            <DialogTitle>Generate Workflow with AI</DialogTitle>
            <DialogDescription>
            Describe the workflow you want to create. Our AI will build it for you on the canvas.
            </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workflow Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., A workflow to handle customer support tickets. It should first analyze the ticket, then route it to the correct agent."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader variant="inline" size="xs" className="mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Workflow
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
