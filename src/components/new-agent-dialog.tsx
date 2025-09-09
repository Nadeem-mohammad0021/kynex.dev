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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Plus, Sparkles, Wand2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader } from './ui/loader';
import { generateAgentBehavior } from '@/ai/flows/generate-ai-agent-from-prompt';

const formSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  prompt: z.string().min(10, { message: "Behavior prompt must be at least 10 characters." }),
});

async function addAgent(agentData: { name: string; description: string; behavior: string; }) {
    // This is a mock function. In a real app, you would save this to a database.
    console.log("Creating new agent:", agentData);
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
}

export function NewAgentDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      prompt: "",
    },
  });

  const generateBehavior = async () => {
    const description = form.getValues("description");
    if (description.length < 10) {
      form.setError("description", {
        type: "manual",
        message: "Please enter a description of at least 10 characters to generate behavior.",
      });
      return;
    }
    
    setIsGenerating(true);
    try {
      const result = await generateAgentBehavior({ description });
      form.setValue("prompt", result as string, { shouldValidate: true });
      toast({
        title: "Behavior Generated!",
        description: "The agent's behavior has been populated for you.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: `Could not generate agent behavior: ${error.message}`,
      });
    } finally {
      setIsGenerating(false);
    }
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsCreating(true);
    try {
      await addAgent({
          name: values.name,
          description: values.description,
          behavior: values.prompt,
      });

      toast({
        title: "Agent Created!",
        description: "Your new AI agent has been saved.",
      });

      form.reset();
      setIsOpen(false);
      router.refresh();

    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || "There was a problem creating the agent.";
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: errorMessage,
      });
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
            form.reset();
        }
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2" />
          New Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Create New AI Agent</DialogTitle>
          <DialogDescription>
            Fill in the details below to create your new AI agent.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agent Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Customer Support Pro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agent Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A short summary of what this agent does."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Agent Behavior (System Prompt)</FormLabel>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={generateBehavior}
                        disabled={isGenerating}
                      >
                         {isGenerating ? (
                           <>
                            <Loader className="mr-2 h-4 w-4 text-sm" />
                            Generating...
                           </>
                         ) : (
                           <>
                            <Wand2 className="mr-2 h-4 w-4" />
                            Generate with AI
                           </>
                         )}
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., You are a friendly and helpful customer support assistant. You must always be polite and professional..."
                        className="min-h-[150px] font-code text-xs"
                        {...field}
                      />
                    </FormControl>
                     <FormDescription>
                       This is the core instruction that defines how your agent will behave.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <DialogFooter>
              <Button type="submit" disabled={isCreating || isGenerating}>
                {isCreating ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 text-sm" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create Agent
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
