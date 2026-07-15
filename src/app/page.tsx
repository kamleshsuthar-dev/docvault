import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@clerk/nextjs/server';
import { FileText, Users, ShieldCheck, ArrowRight } from 'lucide-react';

export default async function Home() {
  const { userId } = await auth();

  return (
    <main className="min-h-[calc(100vh-65px)] bg-background text-foreground flex flex-col justify-center transition-colors duration-slow">
      <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <Badge className="bg-brand/10 text-brand hover:bg-brand/20 border-brand/20 text-xs px-3 py-1 font-medium rounded-full">
            Semester Homework RBAC Project
          </Badge>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight bg-gradient-to-r from-brand via-brand-hover to-foreground bg-clip-text text-transparent pb-1">
            DocVault
          </h1>
          <p className="text-lg sm:text-xl text-muted-text max-w-2xl mx-auto font-light leading-relaxed">
            A collaborative document workspace powered by Clerk. Experience real-time organization-wide workspaces, default teams, and Google-Docs-style email sharing.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 pt-12">
            <Card className="bg-card border-border text-left hover:border-brand/40 hover:shadow-md transition-all duration-fast">
              <CardHeader className="pb-3">
                <FileText className="h-6 w-6 text-brand mb-2" />
                <CardTitle className="text-foreground text-lg">Document CRUD</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-text text-sm">
                Create, edit, delete, and view documents. Dynamic access controls apply instantly in real-time.
              </CardContent>
            </Card>

            <Card className="bg-card border-border text-left hover:border-brand/40 hover:shadow-md transition-all duration-fast">
              <CardHeader className="pb-3">
                <Users className="h-6 w-6 text-brand mb-2" />
                <CardTitle className="text-foreground text-lg">Teams & Workspaces</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-text text-sm">
                Organize documents under default teams or custom organizations. Managed natively through Clerk.
              </CardContent>
            </Card>

            <Card className="bg-card border-border text-left hover:border-brand/40 hover:shadow-md transition-all duration-fast">
              <CardHeader className="pb-3">
                <ShieldCheck className="h-6 w-6 text-success mb-2" />
                <CardTitle className="text-foreground text-lg">Granular RBAC</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-text text-sm">
                Share privately with direct emails as Editor or Viewer. Clerk org membership roles sync automatically.
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4 justify-center pt-8">
            {userId ? (
              <Link href="/dashboard">
                <Button size="lg" className="px-8 rounded-sm bg-brand hover:bg-brand-hover active:bg-brand-active text-white font-medium shadow-md hover:shadow-lg flex items-center gap-2 transition-all duration-fast">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signup">
                  <Button size="lg" className="px-8 rounded-sm bg-brand hover:bg-brand-hover active:bg-brand-active text-white font-medium shadow-md hover:shadow-lg transition-all duration-fast">
                    Get Started
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="px-8 rounded-sm border-border bg-transparent text-foreground hover:bg-card-hover hover:text-foreground transition-all duration-fast">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// Local mock Badge component since we only need it for decoration
function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border ${className}`}>
      {children}
    </span>
  );
}
