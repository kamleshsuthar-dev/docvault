'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Edit, FileText, Share2, Users } from 'lucide-react';
import { useAuth, useUser } from '@clerk/nextjs';
import { Badge } from '@/components/ui/badge';

interface Document {
  _id: string;
  title: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  orgId: string | null;
  collaborators: Array<{ email: string; role: string }>;
  createdAt: string;
  updatedAt: string;
}

export default function DocumentList() {
  const { orgId, userId } = useAuth();
  const { user } = useUser();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDocuments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/documents');
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (err) {
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch documents whenever organization changes
  useEffect(() => {
    if (userId) {
      fetchDocuments();
    }
  }, [orgId, userId]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDocuments(documents.filter((doc) => doc._id !== id));
      } else {
        const errData = await response.json();
        setError(errData.error || 'Failed to delete document');
      }
    } catch (err) {
      setError('Failed to delete document');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
        <p className="text-muted-text text-sm">Loading workspace documents...</p>
      </div>
    );
  }

  // Filter documents into owned/org vs shared
  const userEmail = user?.emailAddresses[0]?.emailAddress?.toLowerCase() || '';
  
  const workspaceDocs = documents.filter(doc => 
    orgId ? doc.orgId === orgId : (doc.orgId === null && doc.ownerId === userId)
  );

  const sharedDocs = documents.filter(doc => 
    doc.ownerId !== userId && 
    doc.collaborators.some(c => c.email?.toLowerCase() === userEmail) &&
    (orgId ? doc.orgId !== orgId : doc.orgId === null)
  );

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-error/10 text-error px-4 py-3 rounded-md border border-error/20 text-sm">
          {error}
        </div>
      )}

      {/* Workspace Documents */}
      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2 text-foreground">
          <Users className="h-5 w-5 text-brand" />
          {orgId ? 'Organization Workspace' : 'Personal Documents'}
        </h2>
        {workspaceDocs.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-md text-muted-text text-sm">
            No documents in this workspace yet. Create one above!
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaceDocs.map((doc) => {
              const isOwner = doc.ownerId === userId;
              return (
                <Card key={doc._id} className="group hover:border-brand/50 hover:shadow-md transition-all duration-fast bg-card border-border flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <div className="p-2 bg-brand/10 rounded-sm text-brand">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {isOwner ? (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">Owner</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">Org Doc</Badge>
                        )}
                        {doc.collaborators.length > 0 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 bg-brand/10 text-brand border-brand/20 flex items-center gap-1">
                            <Share2 className="h-2.5 w-2.5" />
                            {doc.collaborators.length}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="line-clamp-1 text-base font-semibold group-hover:text-brand transition-colors duration-fast">
                      {doc.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-text">
                      Created by {isOwner ? 'you' : doc.ownerName} • {new Date(doc.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-2 justify-end border-t border-border pt-3">
                      <Link href={`/documents/${doc._id}`}>
                        <Button variant="outline" size="sm" className="h-8 text-xs">
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Open
                        </Button>
                      </Link>
                      {isOwner && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-error hover:text-error hover:bg-error/10"
                          onClick={(e) => handleDelete(doc._id, e)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Shared With Me Documents */}
      {sharedDocs.length > 0 && (
        <div>
          <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2 text-foreground">
            <Share2 className="h-5 w-5 text-brand" />
            Shared With Me
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sharedDocs.map((doc) => {
              const collabInfo = doc.collaborators.find(c => c.email.toLowerCase() === userEmail);
              const userRole = collabInfo?.role || 'viewer';

              return (
                <Card key={doc._id} className="group hover:border-brand/50 hover:shadow-md transition-all duration-fast bg-card border-border flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <div className="p-2 bg-brand/10 rounded-sm text-brand">
                        <Share2 className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className="capitalize text-[10px] px-1.5 py-0.5 bg-card">
                        {userRole}
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-1 text-base font-semibold group-hover:text-brand transition-colors duration-fast">
                      {doc.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-text">
                      by {doc.ownerName} ({doc.ownerEmail}) • {new Date(doc.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-2 justify-end border-t border-border pt-3">
                      <Link href={`/documents/${doc._id}`}>
                        <Button variant="outline" size="sm" className="h-8 text-xs">
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          {userRole === 'editor' ? 'Edit' : 'View'}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
