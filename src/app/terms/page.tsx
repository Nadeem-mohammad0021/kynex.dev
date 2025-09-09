
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons/logo';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Logo className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-bold font-headline">AIAgentFlow</h1>
        </div>
        <nav className="flex items-center gap-4">
          <Button asChild variant="outline">
            <Link href="/auth">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl font-headline">Terms of Service</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm md:prose-base max-w-none text-muted-foreground space-y-4">
              <p>Last updated: {new Date().toLocaleDateString()}</p>
              
              <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the AIAgentFlow service, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
              </p>

              <h2 className="text-xl font-semibold text-foreground">2. Use License</h2>
              <p>
                Permission is granted to temporarily download one copy of the materials (information or software) on AIAgentFlow's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
              </p>

              <h2 className="text-xl font-semibold text-foreground">3. Disclaimer</h2>
              <p>
                The materials on AIAgentFlow's website are provided on an 'as is' basis. AIAgentFlow makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>

              <h2 className="text-xl font-semibold text-foreground">4. Limitations</h2>
              <p>
                In no event shall AIAgentFlow or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on AIAgentFlow's website.
              </p>
                
              <h2 className="text-xl font-semibold text-foreground">5. Governing Law</h2>
              <p>
                These terms and conditions are governed by and construed in accordance with the laws of our state and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
              </p>
              
              <h2 className="text-xl font-semibold text-foreground">6. Modifications</h2>
              <p>
                AIAgentFlow may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
              </p>

            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="py-8 border-t text-muted-foreground">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm">
            <div className="flex items-center gap-2">
                <Logo className="h-5 w-5" />
                <span>© {new Date().getFullYear()} AIAgentFlow. All rights reserved.</span>
            </div>
             <div className="flex items-center gap-4 mt-4 md:mt-0">
                <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
            </div>
         </div>
      </footer>
    </div>
  );
}
