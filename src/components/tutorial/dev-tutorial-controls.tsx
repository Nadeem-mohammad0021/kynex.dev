'use client';

import { Button } from '@/components/ui/button';
import { useTutorial } from './tutorial-provider';

/**
 * Development helper component for testing tutorial functionality
 * Only shows in development mode
 */
export function DevTutorialControls() {
  const { startTutorial, isRunning, resetTutorialStatus } = useTutorial();

  // Only render in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const checkElements = () => {
    const selectors = [
      '[data-tutorial="sidebar-nav"]',
      '#explore-agents-menu',
      '[data-tutorial="explore-agents"]',
      '[data-tutorial="explore-agents-link"]',
      '#my-agents-menu',
      '[data-tutorial="my-agents"]',
      '[data-tutorial="my-agents-link"]',
      '#deployments-menu',
      '[data-tutorial="deployments"]',
      '[data-tutorial="deployments-link"]',
      'a[href="/agents"]',
      'a[href="/my-agents"]',
      'a[href="/deployments"]',
      'header'
    ];
    
    console.log('🔍 Element Check Results:');
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        console.log(`✅ Found ${elements.length} element(s) for: ${selector}`);
        // Show element details
        elements.forEach((el, idx) => {
          const rect = el.getBoundingClientRect();
          const text = el.textContent?.trim() || 'No text';
          console.log(`  Element ${idx + 1}: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}" at (${Math.round(rect.x)}, ${Math.round(rect.y)})`);
        });
      } else {
        console.log(`❌ Not found: ${selector}`);
      }
    });
    
    // Special check for menu items
    console.log('\n🗄️ Sidebar Menu Items:');
    const menuItems = document.querySelectorAll('[data-sidebar="menu-item"]');
    menuItems.forEach((item, idx) => {
      const text = item.textContent?.trim() || 'No text';
      const id = item.id || 'No ID';
      const dataTutorial = item.getAttribute('data-tutorial') || 'No data-tutorial';
      console.log(`  Menu ${idx + 1}: ID="${id}" data-tutorial="${dataTutorial}" text="${text}"`);  
    });
  };

  const testSelector = (selector: string) => {
    console.log(`\n🗺️ Testing selector: "${selector}"`);
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      elements.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        const text = el.textContent?.trim() || 'No text';
        console.log(`  Element ${i + 1}: "${text.substring(0, 40)}" at (${Math.round(rect.x)}, ${Math.round(rect.y)})`);
        // Highlight the element temporarily
        el.style.border = '3px solid red';
        el.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
        setTimeout(() => {
          el.style.border = '';
          el.style.backgroundColor = '';
        }, 3000);
      });
    } else {
      console.log('  No elements found!');
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-background border rounded-lg p-4 shadow-lg max-w-xs">
      <h4 className="text-sm font-semibold mb-2">Dev Tutorial Controls</h4>
      <div className="flex flex-col gap-2">
        <Button 
          size="sm" 
          onClick={() => startTutorial('complete')} 
          disabled={isRunning}
        >
          Start Tutorial
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={resetTutorialStatus}
        >
          Reset Tutorial Status
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={checkElements}
        >
          Check Elements
        </Button>
        <div className="grid grid-cols-2 gap-1">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => testSelector('#explore-agents-menu')}
          >
            Test Explore
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => testSelector('#my-agents-menu')}
          >
            Test My Agents
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => testSelector('#deployments-menu')}
          >
            Test Deploy
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => testSelector('[data-tutorial="sidebar-nav"]')}
          >
            Test Sidebar
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Status: {isRunning ? 'Running' : 'Stopped'}
        </p>
      </div>
    </div>
  );
}
