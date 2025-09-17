
'use client';

import { MoreVertical, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Agent, AgentTemplate } from '@/types/agent';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { templates } from '@/data/agent-templates';

export default function AgentsTemplatesPage() {

  return (
    <div className="p-4 md:p-6 space-y-8">
        <div>
            <h2 className="text-xl font-semibold mb-1">Explore Agents</h2>
            <p className="text-muted-foreground mb-4">Click on an agent to see its workflow and test it out.</p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
                <Link href={`/agents/${template.templateId}`} key={template.templateId}>
                    <Card 
                        className="h-full hover:border-primary transition-colors cursor-pointer flex flex-col" 
                    >
                        <CardHeader className="flex flex-row items-start justify-between">
                            <div className="space-y-1.5">
                            <CardTitle>{template.spec.name}</CardTitle>
                            <CardDescription>{template.spec.description}</CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" asChild onClick={(e) => e.preventDefault()}>
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="flex-grow">
                        {/* Content can be added here if needed, like categories */}
                        </CardContent>
                    </Card>
                </Link>
            ))}
            </div>
        </div>
    </div>
  );
}
