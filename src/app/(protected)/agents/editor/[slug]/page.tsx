
'use client';

import { notFound, useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bot,
  MessageSquare,
  Play,
  Save,
  Rocket,
  Trash2,
  Wand2,
  Database,
  MessageCircle,
  Sheet as SheetIcon,
  ArrowRight,
  GitBranchPlus,
  Webhook,
  Edit,
  Sparkles,
  Maximize2,
  Minimize2,
  Menu,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Connection,
  Controls,
  addEdge,
  useEdgesState,
  useNodesState,
  Node,
  Edge,
  useReactFlow,
  ReactFlowProvider,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Button } from '@/components/ui/button';
import { NewWorkflowDialog } from '@/components/new-workflow-dialog';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { NewAgentDialog } from '@/components/new-agent-dialog';
import { GenerateWorkflowFromPromptOutput } from '@/ai/flows/generate-workflow-from-prompt';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { editWorkflowFromPrompt } from '@/ai/flows/edit-workflow-from-prompt';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader } from '@/components/ui/loader';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Agent, WorkflowSpec } from '@/types/agent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentEditorTestingTab } from '@/components/agent-editor-testing-tab';
import { EditWorkflowPanel } from '@/components/edit-workflow-panel';


let nodeIdCounter = 0;
const getNewNodeId = () => `node-${++nodeIdCounter}`;

function AgentWorkflowEditor() {
  const params = useParams();
  const slug = params.slug as string;
  const isNewAgent = slug === 'new';

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflowId, setWorkflowId] = useState<string | null>(isNewAgent ? null : slug);
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowSpec | null>(null);
  
  const [agent, setAgent] = useState<Agent>({
      agent_id: '',
      workflow_id: '',
      name: 'New Agent',
      platform: 'api_webhook',
      status: 'inactive',
      created_at: '',
      behavior: 'You are a helpful assistant.',
      spec: {
        name: 'New Agent',
        description: 'This workflow is empty.',
        trigger: { label: 'Manual Trigger', description: 'Starts when manually run.' },
        steps: [],
      }
  });

  const [isLoading, setIsLoading] = useState(!isNewAgent);
  const [user, setUser] = useState<User | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { toast } = useToast();
  const reactFlowInstance = useReactFlow();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
        const supabase = getSupabaseBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    }
    fetchUser();
  }, []);

  const updateCanvas = useCallback((workflowSpec: WorkflowSpec) => {
    // This function is the single source of truth for updating the UI with a new workflow spec.
    // It updates the currentWorkflow state, the overall agent state, and the ReactFlow nodes/edges.
    console.log('updateCanvas called with:', workflowSpec);
    
    setCurrentWorkflow(workflowSpec);
    setAgent(prev => ({
      ...prev,
      spec: workflowSpec,
    }));
  
    if (!workflowSpec) {
      console.log('No workflow spec provided');
      setNodes([]);
      setEdges([]);
      return;
    }
    
    if (!workflowSpec.trigger) {
      console.log('No trigger found in workflow spec');
      setNodes([]);
      setEdges([]);
      return;
    }
  
    const triggerNode: Node = {
      id: 'trigger',
      type: 'input',
      data: { label: workflowSpec.trigger.label || 'Trigger' },
      position: { x: 250, y: 5 },
    };
  
    const stepNodes: Node[] = (workflowSpec.steps || []).map((step, index) => ({
      id: `step-${index + 1}`,
      data: { label: step.label || `Step ${index + 1}` },
      position: { x: 250, y: (index + 1) * 100 },
    }));
  
    const allNodes = [triggerNode, ...stepNodes];
    nodeIdCounter = allNodes.length;
  
    const newEdges: Edge[] = [];
    if (allNodes.length > 1) {
      // Connect trigger to the first step
      if (stepNodes.length > 0) {
        newEdges.push({ id: `e-trigger-step-1`, source: 'trigger', target: 'step-1' });
      }
      // Connect sequential steps
      for (let i = 0; i < stepNodes.length - 1; i++) {
        newEdges.push({
          id: `e-step-${i + 1}-step-${i + 2}`,
          source: `step-${i + 1}`,
          target: `step-${i + 2}`,
        });
      }
    }
  
    console.log('Setting nodes:', allNodes);
    console.log('Setting edges:', newEdges);
    
    setNodes(allNodes);
    setEdges(newEdges);
  
    // Use a short timeout to ensure the DOM has updated before fitting the view.
    setTimeout(() => {
      if (reactFlowInstance) {
        reactFlowInstance.fitView({ duration: 500 });
      }
    }, 50);
  
  }, [setNodes, setEdges, reactFlowInstance]);

  useEffect(() => {
    if (isNewAgent) {
      setIsLoading(false);
      updateCanvas(agent.spec!);
    } else {
      const fetchWorkflow = async () => {
        const supabase = getSupabaseBrowserClient();
        
        console.log('Editor: Attempting to load workflow with ID:', slug);
        
        // First try to find workflow with this ID
        const { data, error } = await supabase
          .from('workflows')
          .select('workflow_id, config, description, name') 
          .eq('workflow_id', slug)
          .single();

        if (error || !data) {
          console.log('Workflow not found with ID:', slug);
          console.log('Error:', error);
          
          // Check if this might be a deployment_id or agent_id
          const { data: deploymentData } = await supabase
            .from('deployments')
            .select('deployment_id, agent_id')
            .eq('deployment_id', slug)
            .single();
            
          if (deploymentData) {
            console.log('Found deployment with this ID:', deploymentData);
            
            // Get the agent and its workflow
            const { data: agentData } = await supabase
              .from('agents')
              .select('agent_id, workflow_id')
              .eq('agent_id', deploymentData.agent_id)
              .single();
              
            if (agentData?.workflow_id) {
              console.log('Found workflow_id via agent:', agentData.workflow_id);
              // Redirect to the correct workflow_id
              router.replace(`/agents/editor/${agentData.workflow_id}`);
              return;
            }
          }
          
          // Check if this might be an agent_id directly
          const { data: agentData } = await supabase
            .from('agents')
            .select('agent_id, workflow_id')
            .eq('agent_id', slug)
            .single();
            
          if (agentData?.workflow_id) {
            console.log('Found workflow_id via direct agent lookup:', agentData.workflow_id);
            // Redirect to the correct workflow_id
            router.replace(`/agents/editor/${agentData.workflow_id}`);
            return;
          }
          
          toast({
            variant: "destructive",
            title: "Workflow not found",
            description: `Could not find workflow with ID: ${slug}. This might be a deployment ID or agent ID instead of a workflow ID.`,
          });
          router.push('/my-agents');
          return;
        }
        
        console.log('Workflow found successfully:', data);
        console.log('Raw config data:', data.config);
        
        // The config column is the source of truth
        let fetchedSpec = data.config as WorkflowSpec;
        
        // If config is null or empty, create a default workflow structure
        if (!fetchedSpec || typeof fetchedSpec !== 'object') {
          console.log('Config is null/empty, creating default workflow structure');
          fetchedSpec = {
            name: data.name || data.description || "Untitled Agent",
            description: data.description || "No description provided.",
            trigger: {
              label: "Manual Trigger",
              description: "Starts when manually run."
            },
            steps: []
          };
        } else {
          // Ensure spec has name and description, using fallbacks if necessary.
          if (!fetchedSpec.name) {
             fetchedSpec.name = data.name || data.description || "Untitled Agent";
          }
          if (!fetchedSpec.description) {
             fetchedSpec.description = data.description || "No description provided.";
          }
          
          // Ensure spec has required workflow structure
          if (!fetchedSpec.trigger) {
            fetchedSpec.trigger = {
              label: "Manual Trigger",
              description: "Starts when manually run."
            };
          }
          if (!fetchedSpec.steps) {
            fetchedSpec.steps = [];
          }
        }
        
        console.log('Processed workflow spec:', fetchedSpec);


        // Set the workflow ID to enable saving
        setWorkflowId(slug);
        
        setAgent(prev => ({
          ...prev,
          behavior: 'You are a helpful assistant.', // This could also be stored in the DB in the future
          spec: fetchedSpec,
        }));

        updateCanvas(fetchedSpec);
        setIsLoading(false);
      }
      fetchWorkflow();
    }
  }, [isNewAgent, slug, toast, router, updateCanvas]);
  
  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onAddNode = (type: string, label: string) => {
    const newNode: Node = {
      id: getNewNodeId(),
      data: { label },
      position: {
        x: Math.random() * 400,
        y: Math.random() * 400,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const onWorkflowGenerated = (workflow: GenerateWorkflowFromPromptOutput) => {
    if (workflow.spec) {
        updateCanvas(workflow.spec);
    }
    toast({
        title: "Workflow Generated",
        description: "The new workflow has been created and displayed on the canvas.",
    });
    setWorkflowId(workflow.workflowId);
    router.replace(`/agents/editor/${workflow.workflowId}`, { scroll: false });
  }

  const onSave = useCallback(async () => {
    if (!workflowId || !currentWorkflow || !user) {
        toast({
            variant: "destructive",
            title: "Cannot Save",
            description: "Missing workflow ID, data, or user session.",
        });
        return;
    }

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
        .from('workflows')
        .update({ 
            config: currentWorkflow, // Use 'config' instead of 'spec'
            description: currentWorkflow.description,
            updated_at: new Date().toISOString() 
        })
        .eq('workflow_id', workflowId);
    
    if (error) {
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: error.message,
        });
    } else {
        toast({
            title: "Workflow Saved!",
            description: "Your changes have been saved successfully.",
        });
    }
  }, [workflowId, currentWorkflow, user, toast]);

  const onDelete = useCallback(() => {
    if (!reactFlowInstance) return;
    const selectedNodes = reactFlowInstance.getNodes().filter(node => node.selected);
    const selectedEdges = reactFlowInstance.getEdges().filter(edge => edge.selected);
    
    if (selectedNodes.length === 0 && selectedEdges.length === 0) {
      toast({
        variant: "destructive",
        title: "Nothing to delete",
        description: "Please select a block or an edge to delete.",
      });
      return;
    }

    reactFlowInstance.deleteElements({ nodes: selectedNodes, edges: selectedEdges });
    toast({
      title: "Block(s) Deleted",
      description: "The selected blocks have been removed from the workflow.",
    });
  }, [reactFlowInstance, toast]);

  if (isLoading) {
    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-1 overflow-auto">
                 <aside className="w-80 border-r p-4 space-y-4">
                    <Skeleton className="h-8 w-24 mb-4" />
                    <Skeleton className="h-10 w-full mb-2" />
                    <Skeleton className="h-10 w-full" />
                 </aside>
                 <main className="flex-1 relative flex items-center justify-center">
                    <Loader size="lg" />
                 </main>
            </div>
        </div>
    )
  }

  return (
    <div className={`flex flex-col h-full overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      <div className="flex items-center justify-between border-b p-2 md:p-4 flex-shrink-0 bg-background editor-header">
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="sm" asChild className="md:size-default">
            <Link href="/my-agents">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to My Agents</span>
            </Link>
          </Button>
          {!isFullscreen && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          )}
          <h1 className="text-lg md:text-xl font-bold font-headline truncate max-w-[200px] md:max-w-none">
            {agent.spec?.name || 'Unnamed Agent'}
          </h1>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
            <div className="hidden md:block">
              <NewWorkflowDialog onWorkflowGenerated={onWorkflowGenerated} userId={user?.id} />
            </div>
            <Button variant="outline" size="sm" className="hidden sm:flex md:size-default" onClick={onDelete}>
                <Trash2 className="mr-1 md:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Delete</span>
            </Button>
            <Button size="sm" className="md:size-default" onClick={onSave} data-tutorial="save-btn">
                <Save className="mr-1 md:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Save</span>
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex md:size-default" asChild>
                <Link href="/deployments">
                  <Rocket className="mr-1 md:mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Deploy</span>
                </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="md:size-default" 
              onClick={() => setIsFullscreen(!isFullscreen)}
              data-tutorial="fullscreen-btn"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="mr-1 md:mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="mr-1 md:mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Fullscreen</span>
                </>
              )}
            </Button>
        </div>
      </div>
      <div className="flex flex-1 overflow-auto">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        <aside className={`
          w-80 border-r p-4 space-y-4 overflow-y-auto flex-shrink-0
          md:block
          ${isFullscreen ? 'hidden' : ''}
          ${isSidebarOpen && !isFullscreen
            ? 'fixed left-0 top-0 h-full bg-background z-50 block shadow-lg' 
            : !isFullscreen ? 'hidden md:block' : 'hidden'
          }
        `} data-tutorial="blocks-sidebar">
            <div className="flex items-center justify-between md:block">
              <h2 className="text-lg font-semibold">Blocks</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="md:hidden" 
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground px-2">Triggers</p>
                <Button variant="outline" className="w-full justify-start" onClick={() => onAddNode('Trigger', 'WhatsApp Trigger')}>
                    <Webhook className="mr-2" />
                    WhatsApp Trigger
                </Button>
            </div>
            <Separator />
             <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground px-2">Logic</p>
                <Button variant="outline" className="w-full justify-start" onClick={() => onAddNode('Logic', 'AI Agent')}>
                    <Bot className="mr-2" />
                    AI Agent
                </Button>
                 <Button variant="outline" className="w-full justify-start" onClick={() => onAddNode('Logic', 'Custom Prompt')}>
                    <MessageCircle className="mr-2" />
                    Custom Prompt
                </Button>
                 <Button variant="outline" className="w-full justify-start" onClick={() => onAddNode('Logic', 'Conditional Branch')}>
                    <GitBranchPlus className="mr-2" />
                    Conditional Branch
                </Button>
            </div>
             <Separator />
             <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground px-2">Actions</p>
                <Button variant="outline" className="w-full justify-start" onClick={() => onAddNode('Action', 'Response')}>
                    <ArrowRight className="mr-2" />
                    Response
                </Button>
                 <Button variant="outline" className="w-full justify-start" onClick={() => onAddNode('Action', 'Memory')}>
                    <Database className="mr-2" />
                    Memory
                </Button>
            </div>
            <Separator />
            <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground px-2">Tools</p>
                <Button variant="outline" className="w-full justify-start" onClick={() => onAddNode('Tool', 'Google Sheet')}>
                    <SheetIcon className="mr-2" />
                    Google Sheet
                </Button>
            </div>
        </aside>
        <main className="flex-1 relative">
          <Tabs defaultValue="editor" className="h-full flex flex-col">
            <div className="px-2 md:px-4 pt-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
              <TabsList className="mb-2 w-full md:w-auto">
                <TabsTrigger value="editor" className="flex-1 md:flex-none text-xs md:text-sm">
                  <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Editor</span>
                </TabsTrigger>
                <TabsTrigger value="testing" className="flex-1 md:flex-none text-xs md:text-sm" data-tutorial="testing-tab">
                  <Bot className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Testing</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="editor" className="flex-1 m-0">

           {(() => {
             console.log('Render condition check:', {
               isNewAgent,
               nodesLength: nodes.length,
               showNewAgent: isNewAgent && nodes.length === 0
             });
             
             return isNewAgent && nodes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="max-w-md p-8">
                        <Bot className="w-20 h-20 mx-auto text-muted-foreground" />
                        <h2 className="mt-6 text-2xl font-semibold">Create Your New Agent</h2>
                        <p className="mt-2 text-muted-foreground">
                            Start by defining your agent's purpose, then build its workflow using blocks from the sidebar or generate one with AI.
                        </p>
                        <div className="mt-6 flex justify-center gap-4">
                           <NewWorkflowDialog onWorkflowGenerated={onWorkflowGenerated} userId={user?.id} />
                        </div>
                    </div>
                </div>
           ) : (
             <div data-tutorial="editor-canvas" style={{ height: '100%', width: '100%', position: 'relative' }}>
               {console.log('Rendering ReactFlow with:', { nodes, edges })}
               
               {/* Debug info overlay */}
               <div style={{
                 position: 'absolute',
                 top: 10,
                 left: 10,
                 background: 'rgba(0,0,0,0.8)',
                 color: 'white',
                 padding: '10px',
                 borderRadius: '5px',
                 fontSize: '12px',
                 zIndex: 10,
                 pointerEvents: 'none'
               }}>
                 <div>Nodes: {nodes.length}</div>
                 <div>Edges: {edges.length}</div>
                 <div>Workflow: {currentWorkflow ? 'Loaded' : 'None'}</div>
                 <div>IsNewAgent: {isNewAgent.toString()}</div>
               </div>
               
               <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  fitView
                  deleteKeyCode={['Backspace', 'Delete']}
                  >
                <Background />
                <Controls />
               </ReactFlow>
             </div>
           );
           })()}
            </TabsContent>
            
            <TabsContent value="testing" className="flex-1 m-0">
              {currentWorkflow ? (
                <AgentEditorTestingTab 
                  agentId={workflowId || ''} 
                  workflowSpec={currentWorkflow}
                  userName={user?.user_metadata?.full_name || 'there'}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="max-w-md p-8">
                    <Bot className="w-20 h-20 mx-auto text-muted-foreground" />
                    <h2 className="mt-6 text-2xl font-semibold">No Workflow Available</h2>
                    <p className="mt-2 text-muted-foreground">
                      Create a workflow first to test your agent.
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
            
          </Tabs>
        </main>
        {currentWorkflow && workflowId && !isFullscreen && (
            <aside className="w-80 border-l p-4 space-y-4 overflow-y-auto flex-shrink-0 hidden lg:block">
                <EditWorkflowPanel 
                    workflowId={workflowId}
                    currentWorkflow={currentWorkflow}
                    onWorkflowUpdated={updateCanvas}
                    userId={user?.id}
                />
            </aside>
        )}
        
        {/* Mobile Floating Action Button for Workflow Generation */}
        {!isFullscreen && (
          <div className="md:hidden fixed bottom-4 right-4 z-40">
            <NewWorkflowDialog onWorkflowGenerated={onWorkflowGenerated} userId={user?.id} />
          </div>
        )}
        
        {/* Mobile Edit Workflow Panel */}
        {currentWorkflow && workflowId && !isFullscreen && (
          <div className="lg:hidden fixed bottom-16 right-4 z-40">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-background shadow-lg"
              onClick={() => {
                // You could open a modal here for mobile workflow editing
                // For now, we'll just show a toast
                toast({
                  title: "Edit on Desktop",
                  description: "Workflow editing is optimized for desktop. Please use a larger screen for the best experience.",
                });
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function EditWorkflowPanel({ workflowId, currentWorkflow, onWorkflowUpdated, userId }: { workflowId: string, currentWorkflow: WorkflowSpec, onWorkflowUpdated: (workflow: any) => void, userId?: string }) {
    const [editPrompt, setEditPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleEdit = async () => {
        if (!userId) {
            toast({
                variant: "destructive",
                title: "Authentication Error",
                description: "You must be logged in to edit a workflow.",
            });
            return;
        }

        setIsLoading(true);
        try {
            const updatedWorkflowSpec = await editWorkflowFromPrompt({
                prompt: editPrompt,
                currentWorkflow,
                userId,
                workflowId,
            });

            onWorkflowUpdated(updatedWorkflowSpec);
            toast({
                title: "Workflow Updated!",
                description: "The AI has modified your workflow.",
            });

        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: `Could not edit workflow: ${error.message}`,
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center"><Edit className="mr-2"/>Edit Workflow</h2>
            <p className="text-sm text-muted-foreground">
                Describe the changes you want to make, and the AI will update the workflow for you.
            </p>
            <div className="grid w-full gap-2">
                <Label htmlFor="edit-prompt">Edit Instruction</Label>
                <Textarea 
                    id="edit-prompt"
                    placeholder="e.g., 'Add a step to send a Slack message after classifying.'"
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    className="min-h-[120px]"
                />
            </div>
            <Button onClick={handleEdit} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader variant="inline" size="xs" className="mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Update Workflow
                  </>
                )}
              </Button>
        </div>
    )
}


export default function AgentEditorPage() {
    return (
        <ReactFlowProvider>
            <AgentWorkflowEditor />
        </ReactFlowProvider>
    );
}

    