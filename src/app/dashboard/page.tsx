'use client';

import DocumentList from '@/components/DocumentList';
import DocumentForm from '@/components/DocumentForm';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUser, useOrganizationList, useAuth } from '@clerk/nextjs';
import { Plus, X } from 'lucide-react';

// Track initialization attempts per user to prevent duplicate creations
// during React Strict Mode double-renders or component remounts.
const orgInitAttempts = new Set<string>();

export default function DashboardPage() {
  const router = useRouter();
  const { isLoaded, user } = useUser();
  const { orgId } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [creatingDoc, setCreatingDoc] = useState(false);
  const [isInitializingOrg, setIsInitializingOrg] = useState(false);

  // Get organization list hook
  const { 
    isLoaded: listLoaded, 
    userMemberships, 
    createOrganization, 
    setActive 
  } = useOrganizationList({
    userMemberships: {
      keepPreviousData: true,
    },
  });

  // Auto-initialize a default workspace (organization) for new signups
  useEffect(() => {
    if (!user?.id) return;

    if (
      isLoaded && 
      listLoaded && 
      !userMemberships.isLoading &&
      userMemberships.data && 
      userMemberships.data.length === 0 && 
      createOrganization && 
      setActive &&
      !isInitializingOrg &&
      !orgInitAttempts.has(user.id)
    ) {
      orgInitAttempts.add(user.id);
      const initDefaultOrg = async () => {
        setIsInitializingOrg(true);
        try {
          const orgName = `${user.firstName || user.username || 'My'}'s Workspace`;
          const newOrg = await createOrganization({ name: orgName });
          if (newOrg) {
            await setActive({ organization: newOrg.id });
          }
        } catch (e) {
          console.error("Auto-workspace creation failed:", e);
          orgInitAttempts.delete(user.id);
        } finally {
          setIsInitializingOrg(false);
        }
      };
      initDefaultOrg();
    }
  }, [isLoaded, listLoaded, userMemberships.isLoading, userMemberships.data, user, createOrganization, setActive, isInitializingOrg]);

  const handleCreateDocument = async (data: { title: string; content: string }) => {
    setCreatingDoc(true);
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create document');
      }

      const result = await response.json();
      router.push(`/documents/${result.document._id}`);
    } catch (error) {
      alert('Failed to create document');
    } finally {
      setCreatingDoc(false);
    }
  };

  if (!isLoaded || (listLoaded && userMemberships.data && userMemberships.data.length === 0 && isInitializingOrg)) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-background gap-4 transition-colors duration-slow">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand"></div>
        <p className="text-muted-text text-sm">Initializing your workspace environment...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-[calc(100vh-65px)] bg-background transition-colors duration-slow">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-text mt-1">
              Welcome back, <span className="font-semibold text-foreground">{user.fullName || user.firstName}</span>!
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? 'outline' : 'default'}
            className="flex items-center gap-2 self-start sm:self-auto shadow-sm"
          >
            {showForm ? (
              <>
                <X className="h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                New Document
              </>
            )}
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8 border-border bg-card shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Create New Document</CardTitle>
              <CardDescription className="text-xs text-muted-text">
                This document will be saved in your active workspace (
                <span className="font-medium text-foreground">
                  {orgId ? 'Organization Workspace' : 'Personal Documents'}
                </span>
                ).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentForm onSubmit={handleCreateDocument} loading={creatingDoc} />
            </CardContent>
          </Card>
        )}

        <div className="bg-card rounded-md border border-border p-6 shadow-sm">
          <DocumentList />
        </div>
      </div>
    </main>
  );
}
