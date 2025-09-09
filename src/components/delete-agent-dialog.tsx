'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Trash2, AlertTriangle } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface DeleteAgentDialogProps {
  agentId: string;
  agentName: string;
  platform: string;
  children: React.ReactNode;
  onDeleted: () => void;
}

export function DeleteAgentDialog({ 
  agentId, 
  agentName, 
  platform, 
  children, 
  onDeleted 
}: DeleteAgentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!agentId) return;

    setIsDeleting(true);
    
    try {
      const supabase = getSupabaseBrowserClient();
      
      // First delete all related deployments
      const { error: deploymentError } = await supabase
        .from('deployments')
        .delete()
        .eq('agent_id', agentId);

      if (deploymentError) {
        console.warn('Error deleting deployments:', deploymentError);
        // Continue anyway, as the agent deletion will cascade
      }

      // Delete all related conversations
      const { error: conversationError } = await supabase
        .from('conversations')
        .delete()
        .eq('agent_id', agentId);

      if (conversationError) {
        console.warn('Error deleting conversations:', conversationError);
        // Continue anyway, as the agent deletion will cascade
      }

      // Delete all related logs
      const { error: logsError } = await supabase
        .from('logs')
        .delete()
        .eq('agent_id', agentId);

      if (logsError) {
        console.warn('Error deleting logs:', logsError);
        // Continue anyway
      }

      // Finally delete the agent
      const { error: agentError } = await supabase
        .from('agents')
        .delete()
        .eq('agent_id', agentId);

      if (agentError) {
        throw new Error(`Failed to delete agent: ${agentError.message}`);
      }

      toast({
        title: 'Agent Deleted',
        description: `${agentName} (${platform}) has been successfully removed.`,
      });

      setIsOpen(false);
      onDeleted();

    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete Failed',
        description: error.message || 'Unable to delete agent. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Agent
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this agent? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-2">Agent to be deleted:</h4>
            <div className="text-sm space-y-1">
              <div><strong>Name:</strong> {agentName}</div>
              <div><strong>Platform:</strong> {platform}</div>
              <div><strong>ID:</strong> <code className="text-xs">{agentId}</code></div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2">This will also delete:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• All deployments for this agent</li>
              <li>• Conversation history</li>
              <li>• Activity logs</li>
              <li>• Integration webhooks</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-2"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete Agent
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
