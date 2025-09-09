'use client';

import { MoreVertical, Plus, AlertCircle, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Loader } from '@/components/ui/loader';
import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { WorkflowSpec } from '@/types/agent';


// This should match the structure of the data returned from your 'workflows' table
interface MyAgent {
    id: string;
    name: string;
    description: string | null;
    status: 'draft' | 'confirmed';
    lastUpdated: string;
}

export default function MyAgentsPage() {
  const [myAgents, setMyAgents] = useState<MyAgent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  const fetchAgents = useCallback(async (userId: string) => {
      const supabase = getSupabaseBrowserClient();
      setIsLoading(true);
      setError(null);

      try {
        // RLS policy on 'workflows' table will ensure only user's agents are fetched.
        const { data, error: dbError } = await supabase
          .from('workflows')
          .select('workflow_id, name, config, updated_at, description')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });

        if (dbError) {
          throw dbError;
        }
        
        if (data) {
          const mappedAgents = data.map((agent) => {
            const config: WorkflowSpec | null = agent.config as any;
            
            const agentName = agent.name || config?.name || agent.description || 'Untitled Agent';
            const agentDescription = config?.description || agent.description || 'No description provided.';
            
            return {
              id: agent.workflow_id,
              name: agentName,
              description: agentDescription,
              status: 'draft' as const, // Default to draft since status field structure changed
              lastUpdated: new Date(agent.updated_at).toLocaleDateString(),
            };
          });
          setMyAgents(mappedAgents);
        }

      } catch (e: any) {
        console.error("Error fetching agents:", e);
        setError(`Failed to load agents. Please check RLS policies. Error: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
  }, []);

  const deleteAgent = useCallback(async (agentId: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to delete an agent.",
      });
      return;
    }

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('workflow_id', agentId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Update the UI by removing the deleted agent
      setMyAgents((prevAgents) => prevAgents.filter((agent) => agent.id !== agentId));
      
      toast({
        title: "Agent Deleted",
        description: "The agent has been successfully deleted.",
      });
    } catch (e: any) {
      console.error("Error deleting agent:", e);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: e.message || "Failed to delete the agent. Please try again.",
      });
    }
  }, [user, toast]);

  useEffect(() => {
    const checkUserAndFetchAgents = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        fetchAgents(session.user.id);
      } else {
        // If no session, stop loading and show sign-in prompt
        setIsLoading(false);
        setUser(null);
      }
    };
    checkUserAndFetchAgents();
  }, [fetchAgents]);

  if (isLoading) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
        <Loader />
        <p className="mt-4 text-muted-foreground">Loading your agents...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-8">
        <div className="flex justify-between items-center">
            <div>
                 <h2 className="text-xl font-semibold">My Agents</h2>
                 <p className="text-muted-foreground">Manage your saved agents or create a new one.</p>
            </div>
            <Button asChild>
                <Link href="/agents/editor/new">
                    <Plus className="mr-2" />
                    New Agent
                </Link>
            </Button>
        </div>
        {error ? (
            <div className="col-span-full flex flex-1 items-center justify-center h-full bg-destructive/10 text-destructive border-2 border-dashed border-destructive/50 rounded-lg p-4 text-center">
                <div className="flex flex-col items-center">
                    <AlertCircle className="w-12 h-12 mb-2" />
                    <h2 className="text-2xl font-semibold">Error Loading Agents</h2>
                    <p className="mt-2">{error}</p>
                </div>
            </div>
        ) : !user || myAgents.length === 0 ? (
            <div className="col-span-full flex flex-1 items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg">
                <div className="flex flex-col items-center">
                    <h2 className="text-2xl font-semibold">{!user ? "Please sign in" : "You have no agents yet."}</h2>
                    <p className="text-muted-foreground mt-2 mb-4">{!user ? "You need to be logged in to view your agents." : "Create your first AI agent or start from a template."}</p>
                    <div className='flex flex-col sm:flex-row gap-2'>
                        <Button asChild>
                           <Link href="/agents/editor/new">
                                <Plus className="mr-2" />
                                New Agent
                           </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/agents">Explore Templates</Link>
                        </Button>
                    </div>
                </div>
            </div>
        ) : (
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {myAgents.map((agent) => (
                    <Link href={`/agents/editor/${agent.id}`} key={agent.id}>
                        <Card className="h-full hover:border-primary transition-colors">
                        <CardHeader className="flex flex-row items-start justify-between">
                            <div className="space-y-1.5">
                            <CardTitle>{agent.name}</CardTitle>
                            <CardDescription>{agent.description}</CardDescription>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (confirm(`Are you sure you want to delete "${agent.name}"?`)) {
                                      deleteAgent(agent.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <div>
                                    <Badge variant={agent.status === 'confirmed' ? 'default' : 'secondary'}>
                                    {agent.status}
                                    </Badge>
                                </div>
                                <div className="text-right">
                                    <span>Last updated: {agent.lastUpdated}</span>
                                </div>
                            </div>
                        </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        )}
      </div>
  );
}
