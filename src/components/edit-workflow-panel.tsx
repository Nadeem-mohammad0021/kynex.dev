'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { WorkflowSpec } from '@/types/agent';
import { Save, Wand2 } from 'lucide-react';

interface EditWorkflowPanelProps {
  workflowId: string;
  currentWorkflow: WorkflowSpec;
  onWorkflowUpdated: (workflow: WorkflowSpec) => void;
  userId?: string;
}

export function EditWorkflowPanel({ 
  workflowId, 
  currentWorkflow, 
  onWorkflowUpdated, 
  userId 
}: EditWorkflowPanelProps) {
  const [name, setName] = useState(currentWorkflow?.name || '');
  const [description, setDescription] = useState(currentWorkflow?.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!workflowId || !userId) {
      toast({
        variant: "destructive",
        title: "Cannot Save",
        description: "Missing workflow ID or user session.",
      });
      return;
    }

    setIsSaving(true);

    try {
      const updatedWorkflow: WorkflowSpec = {
        ...currentWorkflow,
        name: name.trim() || 'Untitled Workflow',
        description: description.trim() || 'No description provided',
      };

      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from('workflows')
        .update({ 
          name: updatedWorkflow.name,
          description: updatedWorkflow.description,
          config: updatedWorkflow,
          updated_at: new Date().toISOString() 
        })
        .eq('workflow_id', workflowId)
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }

      onWorkflowUpdated(updatedWorkflow);
      
      toast({
        title: "Workflow Updated!",
        description: "Your workflow changes have been saved successfully.",
      });
    } catch (error: any) {
      console.error('Error saving workflow:', error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error.message || "Failed to save workflow changes.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Workflow Settings</CardTitle>
          <CardDescription>
            Configure your workflow's basic information and behavior.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workflow-name">Name</Label>
            <Input
              id="workflow-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter workflow name..."
              maxLength={100}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="workflow-description">Description</Label>
            <Textarea
              id="workflow-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this workflow does..."
              rows={3}
              maxLength={500}
            />
          </div>
          
          <Separator />
          
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Workflow Structure</CardTitle>
          <CardDescription>
            Current workflow has {currentWorkflow?.steps?.length || 0} steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-sm">
              <strong>Trigger:</strong> {currentWorkflow?.trigger?.label || 'None'}
            </div>
            {currentWorkflow?.steps && currentWorkflow.steps.length > 0 && (
              <div className="text-sm">
                <strong>Steps:</strong>
                <ul className="list-disc list-inside ml-2 mt-1">
                  {currentWorkflow.steps.map((step, index) => (
                    <li key={index} className="text-muted-foreground">
                      {step.label || `Step ${index + 1}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
