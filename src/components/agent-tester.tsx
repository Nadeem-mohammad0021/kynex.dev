'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Play, Square, RotateCcw, Clock } from 'lucide-react';
import type { WorkflowSpec } from '@/types/agent';
import { executeWorkflowAction } from '@/app/actions/test-workflow';
import type { TestMessage } from '@/ai/workflow-executor';


interface AgentTesterProps {
  workflowSpec: WorkflowSpec;
  userName: string;
}

export function AgentTester({ workflowSpec, userName }: AgentTesterProps) {
  const [messages, setMessages] = useState<TestMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isProcessing) return;

    const userMessage: TestMessage = {
      id: Date.now().toString(),
      content: currentMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = currentMessage;
    setCurrentMessage('');
    setIsProcessing(true);

    try {
      // Call the server action instead of the local executor
      const result = await executeWorkflowAction({
        workflowSpec,
        userMessage: messageToSend,
        userName,
      });

      if (result.error) {
        throw new Error(result.error);
      }
      
      const agentMessage: TestMessage = {
        id: (Date.now() + 1).toString(),
        content: result.response!,
        sender: 'agent',
        timestamp: new Date(),
        step: result.step?.label,
        stepIndex: result.stepIndex,
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error: any) {
      const errorMessage: TestMessage = {
        id: (Date.now() + 1).toString(),
        content: `Error: ${error.message}`,
        sender: 'agent',
        timestamp: new Date(),
        step: 'Error',
        stepIndex: -1
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const addSampleMessage = (message: string) => {
    setCurrentMessage(message);
  };

  const sampleMessages = [
    "I need help with my account",
    "How do I reset my password?", 
    "I want to speak to a human agent",
    "Can you guide me through the setup process?",
    "I'm having trouble with the application"
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-blue-500" />
          <h3 className="font-medium text-gray-900 dark:text-white">
            Testing: {workflowSpec.name}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearChat}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            title="Clear chat"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Start testing your agent</p>
            <p className="text-sm mb-4">Send a message to see how your workflow responds</p>
            
            {/* Sample Messages */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">Try these sample messages:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {sampleMessages.map((sample, index) => (
                  <button
                    key={index}
                    onClick={() => addSampleMessage(sample)}
                    className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    "{sample}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'user'
                      ? 'bg-blue-500'
                      : 'bg-gray-500 dark:bg-gray-600'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className={`px-3 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.sender === 'agent' && message.step && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-xs opacity-70">
                          <Clock className="h-3 w-3 inline mr-1" />
                          Executed: {message.step}
                        </p>
                      </div>
                    )}
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your test message..."
              className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={1}
              disabled={isProcessing}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || isProcessing}
            className="flex-shrink-0 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <Square className="h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        
        {/* Workflow Info */}
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          <p>Workflow: {workflowSpec.description}</p>
          <p>Steps: {workflowSpec.steps.map(step => step.label).join(' → ')}</p>
        </div>
      </div>
    </div>
  );
}
