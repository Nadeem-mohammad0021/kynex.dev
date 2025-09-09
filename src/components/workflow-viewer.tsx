
'use client';

import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { GenerateWorkflowFromPromptOutput } from '@/ai/flows/generate-workflow-from-prompt';
import { useEffect, useState } from 'react';

type WorkflowSpec = GenerateWorkflowFromPromptOutput['spec'];

interface WorkflowViewerProps {
    spec?: WorkflowSpec | null;
}

const initialNodes: Node[] = [
  { id: '1', type: 'input', data: { label: 'Start Trigger' }, position: { x: 250, y: 5 } },
  { id: '2', data: { label: 'Analyze Input' }, position: { x: 250, y: 100 } },
  { id: '3', data: { label: 'Call Gemini' }, position: { x: 250, y: 200 } },
  { id: '4', type: 'output', data: { label: 'End' }, position: { x: 250, y: 300 } },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
    { id: 'e3-4', source: '3', target: '4' }
];

export function WorkflowViewer({ spec }: WorkflowViewerProps) {
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);

    useEffect(() => {
        if (spec && spec.trigger && spec.steps) {
            const triggerNode: Node = {
                id: 'trigger',
                type: 'input',
                data: { label: spec.trigger.label },
                position: { x: 250, y: 5 },
            };
            const stepNodes: Node[] = spec.steps.map((step, index) => ({
                id: `step-${index}`,
                data: { label: step.label },
                position: { x: 250, y: (index + 1) * 100 },
            }));

            const allNodes = [triggerNode, ...stepNodes];
            const newEdges: Edge[] = [];
            
            if (allNodes.length > 1) {
                newEdges.push({ id: `e-trigger-step-0`, source: 'trigger', target: 'step-0' });
                for (let i = 0; i < stepNodes.length - 1; i++) {
                    newEdges.push({
                        id: `e-step-${i}-step-${i + 1}`,
                        source: `step-${i}`,
                        target: `step-${i + 1}`,
                    });
                }
            }
            
            setNodes(allNodes);
            setEdges(newEdges);
        }
    }, [spec]);


    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            proOptions={{ hideAttribution: true }}
            nodesDraggable={false}
            nodesConnectable={false}
            >
            <Background />
            <Controls showInteractive={false} />
        </ReactFlow>
    )
}
