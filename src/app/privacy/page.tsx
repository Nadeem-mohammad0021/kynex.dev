
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons/logo';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
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
              <CardTitle className="text-3xl md:text-4xl font-headline">Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm md:prose-base max-w-none text-muted-foreground space-y-4">
              <p>Last updated: {new Date().toLocaleDateString()}</p>
              
              <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
              <p>
                Welcome to AIAgentFlow. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
              </p>

              <h2 className="text-xl font-semibold text-foreground">2. Information We Collect</h2>
              <p>
                We may collect personal information such as your name, email address, and payment information when you register for an account or use our services. We also collect non-personal information, such as browser type, operating system, and website usage data.
              </p>

              <h2 className="text-xl font-semibold text-foreground">3. How We Use Your Information</h2>
              <p>
                We use the information we collect to provide, maintain, and improve our services, to process transactions, to communicate with you, and to protect our rights and the rights of others.
              </p>

              <h2 className="text-xl font-semibold text-foreground">4. Information Sharing</h2>
              <p>
                We do not sell, trade, or otherwise transfer your personal information to outside parties except for trusted third parties who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.
              </p>
                
              <h2 className="text-xl font-semibold text-foreground">5. Data Security</h2>
              <p>
                We implement a variety of security measures to maintain the safety of your personal information. However, no method of transmission over the Internet or method of electronic storage is 100% secure.
              </p>
              
              <h2 className="text-xl font-semibold text-foreground">6. Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
              </p>

              <h2 className="text-xl font-semibold text-foreground">7. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at support@aiagentflow.com.
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
