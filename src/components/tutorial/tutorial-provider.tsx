'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { usePathname } from 'next/navigation';

interface TutorialContextType {
  startTutorial: (tutorialName: string) => void;
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  skipTutorial: () => void;
  currentTutorial: string | null;
  resetTutorialStatus: () => void;
}

const TutorialContext = createContext<TutorialContextType | null>(null);

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};

interface TutorialProviderProps {
  children: React.ReactNode;
}

// Define the comprehensive tutorial steps for the entire app
const tutorialSteps: Record<string, Step[]> = {
  complete: [
    {
      target: 'body',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Welcome to KYNEX.dev! 🎉</h3>
          <p>Let's take a complete tour of the platform! This tutorial will guide you step-by-step through creating, building, testing, and deploying your first AI agent. Ready to get started?</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: 'body',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Navigation Hub 🧭</h3>
          <p>Use the sidebar to navigate between different sections. Let's start by going to "My Agents" to create your first AI agent!</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: 'body',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Step 1: Go to My Agents 📁</h3>
          <p><strong>Click on "My Agents"</strong> in the sidebar to access your agent workspace where you can create and manage all your AI agents.</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: 'body',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Step 2: Create New Agent ➕</h3>
          <p>Now you should see the My Agents page. <strong>Look for and click the "New Agent" button</strong> to start creating your first AI agent.</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: 'body',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Step 3: Generate with AI 🤖</h3>
          <p>Perfect! You should now see agent creation options. <strong>Click on "Generate with AI"</strong> to let our AI help you build your agent automatically.</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: 'body',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Step 4: Review Generated Workflow 📋</h3>
          <p>Excellent! The AI has generated a workflow for your agent. Review the generated workflow, nodes, and connections. You can customize it if needed, then proceed to the next step.</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: 'body',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Step 5: Test Your Agent 🧪</h3>
          <p>Now it's time to test your agent! <strong>Look for the "Test" or "Try Agent" button</strong> to test your agent's functionality before deploying it.</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: 'body',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Step 6: Deploy Your Agent 🚀</h3>
          <p>Great! Your agent is tested and ready. <strong>Click on "Deployments"</strong> in the sidebar to deploy your agent to various platforms like WhatsApp, Telegram, or your website.</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: 'body',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Step 7: Choose Deployment Platform 🌐</h3>
          <p>In the Deployments section, you can deploy your agent to multiple platforms. Choose your preferred platform (WhatsApp, Telegram, Website Widget, etc.) and follow the setup instructions.</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: 'body',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Tutorial Complete! 🎆</h3>
          <p>Congratulations! You now know the complete workflow: My Agents → New Agent → Generate with AI → Review Workflow → Test → Deploy. You can restart this tutorial anytime using the "Tutorial" button in the header.</p>
        </div>
      ),
      placement: 'center',
    },
    {
      target: 'body',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Ready to Build! 🚀</h3>
          <p>You're now ready to create amazing AI agents! Remember the workflow: <strong>My Agents → New Agent → Generate with AI → Review → Test → Deploy</strong>. Happy building!</p>
        </div>
      ),
      placement: 'center',
    },
  ],
};

export function TutorialProvider({ children }: TutorialProviderProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTutorial, setCurrentTutorial] = useState<string | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const pathname = usePathname();

  // Remove auto-start tutorial on page load - tutorials should only be started manually via button
  // useEffect(() => {
  //   const hasSeenTutorial = localStorage.getItem('kynex-tutorial-completed');
  //   if (!hasSeenTutorial && pathname === '/dashboard') {
  //     setTimeout(() => {
  //       startTutorial('complete');
  //     }, 1000);
  //   }
  // }, [pathname]);

  const startTutorial = useCallback((tutorialName: string) => {
    const tutorialStepList = tutorialSteps[tutorialName];
    if (tutorialStepList) {
      
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        setSteps(tutorialStepList);
        setCurrentTutorial(tutorialName);
        setIsRunning(true);
      }, 100);
    }
  }, []);

  const skipTutorial = () => {
    setIsRunning(false);
    setCurrentTutorial(null);
    localStorage.setItem('kynex-tutorial-completed', 'true');
  };

  const resetTutorialStatus = () => {
    localStorage.removeItem('kynex-tutorial-completed');
    console.log('Tutorial status reset - tutorial will show again on dashboard visit');
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
      setIsRunning(false);
      setCurrentTutorial(null);
      localStorage.setItem('kynex-tutorial-completed', 'true');
    }
  };

  return (
    <TutorialContext.Provider value={{ startTutorial, isRunning, setIsRunning, skipTutorial, currentTutorial, resetTutorialStatus }}>
      {children}
      <Joyride
        steps={steps}
        run={isRunning}
        continuous={true}
        showProgress={true}
        showSkipButton={true}
        disableOverlayClose={false}
        disableCloseOnEsc={false}
        spotlightClicks={false}
        hideBackButton={false}
        scrollToFirstStep={true}
        scrollOffset={100}
        spotlightPadding={4}
        floaterProps={{
          disableAnimation: false,
          styles: {
            floater: {
              filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
            }
          }
        }}
        styles={{
          options: {
            primaryColor: '#75f9f1', // Your app's primary color
            backgroundColor: '#1f2937',
            textColor: '#f9fafb',
            overlayColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 50000,
            arrowColor: '#1f2937',
            beaconSize: 36,
            spotlightShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
          },
          tooltip: {
            borderRadius: '8px',
            padding: '20px',
            maxWidth: '400px',
            fontSize: '14px',
            lineHeight: '1.4',
          },
          tooltipContainer: {
            textAlign: 'left',
          },
          spotlight: {
            borderRadius: '4px',
          },
          buttonNext: {
            backgroundColor: '#75f9f1',
            color: '#0f172a',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '500',
          },
          buttonBack: {
            color: '#9ca3af',
            marginLeft: '8px',
            marginRight: '8px',
          },
          buttonSkip: {
            color: '#9ca3af',
          },
          buttonClose: {
            display: 'none',
          },
        }}
        callback={handleJoyrideCallback}
        locale={{
          back: '← Back',
          close: 'Close',
          last: 'Finish Tutorial',
          next: 'Next →',
          skip: 'Skip Tutorial',
        }}
      />
    </TutorialContext.Provider>
  );
}
