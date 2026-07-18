'use client';

import { use, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { ArrowLeft, FileText, Share2, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import DocumentForm from '@/components/DocumentForm';
import ShareForm from '@/components/ShareForm';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Collaborator {
  email: string;
  role: 'viewer' | 'editor';
}

interface Document {
  _id: string;
  title: string;
  content: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  orgId: string | null;
  collaborators: Collaborator[];
  createdAt: string;
  updatedAt: string;
}

export default function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { userId, orgId } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const [document, setDocument] = useState<Document | null>(null);
  const [userRole, setUserRole] = useState<string>('viewer');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDocument = async () => {
    try {
      const response = await fetch(`/api/documents/${id}`);
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access Denied: You do not have permission to view this document.');
        }
        throw new Error('Document not found');
      }
      const data = await response.json();
      setDocument(data.document);
      setUserRole(data.userRole || 'viewer');
    } catch (err: any) {
      setError(err.message || 'Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchDocument();
    }
  }, [id, userId, orgId]);

  const handleUpdateContent = async (formData: { title: string; content: string }) => {
    if (!document) return;
    setSaving(true);
    setSaveSuccess(false);
    setError('');

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save document');
      }

      const result = await response.json();
      setDocument(result.document);
      setSaveSuccess(true);
      
      // Auto-hide success message after 3 seconds
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCollaborators = async (newCollaborators: Collaborator[]) => {
    if (!document) return;
    setError('');
    
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: document.title,
          content: document.content,
          collaborators: newCollaborators,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to update collaborators');
      }

      const result = await response.json();
      setDocument(result.document);
    } catch (err: any) {
      throw err;
    }
  };

  // Clean up auto-save success timer
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, []);

  if (loading || !userLoaded) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-background gap-4 transition-colors duration-slow">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand"></div>
        <p className="text-muted-text text-sm">Opening document...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-error mx-auto" />
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Unable to Open Document</h2>
        <p className="text-muted-text max-w-md mx-auto">{error || 'This document could not be retrieved.'}</p>
        <div className="pt-4">
          <Link href="/dashboard">
            <Button variant="outline" className="flex items-center gap-2 mx-auto">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Determine user authorization role
  const isOwner = userRole === 'owner';
  const isEditor = isOwner || userRole === 'editor';
  const userEmail = user?.emailAddresses[0]?.emailAddress?.toLowerCase() || '';
  const collaboratorInfo = document.collaborators.find((c) => c.email?.toLowerCase() === userEmail);

  return (
    <main className="min-h-[calc(100vh-65px)] bg-background transition-colors duration-slow py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-text hover:text-foreground transition-colors duration-fast gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs text-success bg-success/10 border border-success/20 px-2.5 py-1 rounded-sm flex items-center gap-1.5 animate-fade-in">
                <CheckCircle2 className="h-3.5 w-3.5" />
                All changes saved
              </span>
            )}
            {saving && (
              <span className="text-xs text-muted-text flex items-center gap-1.5">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-brand"></div>
                Saving...
              </span>
            )}
          </div>
        </div>

        {/* Read-Only Warning Alert */}
        {!isEditor && (
          <div className="border border-warning/30 bg-warning/10 text-warning px-4 py-3 rounded-md text-sm flex items-start gap-2.5">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Read-Only Mode</p>
              <p className="text-xs mt-0.5 opacity-90">
                You are currently viewing this document as a Viewer. Any edits you make will not be saved.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Document Editing Card */}
          <div className="lg:col-span-2">
            <Card className="border-border bg-card shadow-sm rounded-md">
              <CardContent className="p-6">
                <DocumentForm
                  initialTitle={document.title}
                  initialContent={document.content}
                  onSubmit={handleUpdateContent}
                  loading={saving}
                  readOnly={!isEditor}
                />
              </CardContent>
            </Card>
          </div>

          {/* Side Panels - Workspace details & sharing */}
          <div className="space-y-6">
            <Card className="border-border bg-card shadow-sm rounded-md p-6">
              <h2 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-2 text-foreground border-b border-border pb-2">
                <FileText className="h-5 w-5 text-brand" />
                Document Metadata
              </h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-text block uppercase tracking-wider">Owner</span>
                  <span className="text-sm font-medium text-foreground block">{document.ownerName}</span>
                  <span className="text-xs text-muted-text block">{document.ownerEmail}</span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-text block uppercase tracking-wider">Workspace Scope</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {document.orgId ? (
                      <Badge variant="outline" className="bg-card text-foreground border-border text-xs px-2 py-0.5">
                        Organization Workspace
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-brand/10 text-brand border-brand/20 text-xs px-2 py-0.5">
                        Personal Document
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-text block uppercase tracking-wider">Your Access Level</span>
                  <Badge className="bg-brand text-white text-xs px-2.5 py-0.5 capitalize shadow-sm">
                    {isOwner ? 'Owner' : (userRole === 'editor' ? 'Editor' : 'Viewer')}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Sharing Interface (Only visible to Document Owners) */}
            {isOwner ? (
              <ShareForm
                documentId={document._id}
                collaborators={document.collaborators}
                onUpdate={handleUpdateCollaborators}
              />
            ) : (
              <Card className="border-border bg-card shadow-sm rounded-md p-6">
                <h2 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-2 text-foreground border-b border-border pb-2">
                  <Share2 className="h-5 w-5 text-brand" />
                  Access List
                </h2>
                {document.collaborators.length === 0 ? (
                  <p className="text-xs text-muted-text">This document has not been shared with any direct emails.</p>
                ) : (
                  <div className="space-y-2.5">
                    {document.collaborators.map((c) => (
                      <div key={c.email} className="flex justify-between items-center py-1">
                        <span className="text-xs font-medium text-foreground truncate max-w-[150px]">{c.email}</span>
                        <Badge variant="outline" className="capitalize text-[10px] px-1.5 py-0">
                          {c.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
