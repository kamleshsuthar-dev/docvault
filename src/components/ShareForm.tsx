'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Trash2, UserPlus, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Collaborator {
  email: string;
  role: 'viewer' | 'editor';
}

interface ShareFormProps {
  documentId: string;
  collaborators: Collaborator[];
  onUpdate: (newCollaborators: Collaborator[]) => Promise<void>;
}

export default function ShareForm({ documentId, collaborators, onUpdate }: ShareFormProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor'>('viewer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    // Check if already a collaborator
    if (collaborators.some((c) => c.email.toLowerCase() === targetEmail)) {
      setError('This user is already a collaborator');
      setLoading(false);
      return;
    }

    const updatedList: Collaborator[] = [...collaborators, { email: targetEmail, role }];

    try {
      await onUpdate(updatedList);
      setSuccess(`Added ${targetEmail} as ${role}`);
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to add collaborator');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (collabEmail: string) => {
    if (!confirm(`Are you sure you want to remove ${collabEmail}?`)) return;
    
    const updatedList = collaborators.filter(
      (c) => c.email.toLowerCase() !== collabEmail.toLowerCase()
    );

    try {
      await onUpdate(updatedList);
      setSuccess(`Removed collaborator ${collabEmail}`);
    } catch (err: any) {
      setError(err.message || 'Failed to remove collaborator');
    }
  };

  return (
    <div className="space-y-6">
      {/* Invite collaborator form */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <UserPlus className="h-5 w-5 text-brand" />
            Share with people
          </CardTitle>
          <CardDescription className="text-xs">
            Add collaborators directly by entering their email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddCollaborator} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="py-2.5">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="py-2.5 bg-success/10 text-success border-success/20">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription className="text-xs">{success}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="invite-email" className="text-xs text-foreground">Email Address</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="collaborator@example.com"
                  className="h-9 text-sm"
                />
              </div>

              <div className="w-32 space-y-1.5">
                <Label htmlFor="role" className="text-xs text-foreground">Access Level</Label>
                <Select value={role} onValueChange={(value: any) => setRole(value)}>
                  <SelectTrigger id="role" className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" disabled={loading} className="h-9 px-4 rounded-sm">
                Share
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Collaborators list */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <Shield className="h-5 w-5 text-brand" />
            Who has access
          </CardTitle>
        </CardHeader>
        <CardContent>
          {collaborators.length === 0 ? (
            <p className="text-center py-4 text-xs text-muted-text">
              Only you and organization members can access this document.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {collaborators.map((collab) => (
                <div
                  key={collab.email}
                  className="flex justify-between items-center py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium truncate max-w-[200px] sm:max-w-md text-foreground">
                      {collab.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize text-[10px] px-2">
                      {collab.role}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-error hover:text-error hover:bg-error/10"
                      onClick={() => handleRemoveCollaborator(collab.email)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
