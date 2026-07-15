'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface DocumentFormProps {
  onSubmit: (data: { title: string; content: string }) => Promise<void>;
  loading?: boolean;
  initialTitle?: string;
  initialContent?: string;
  readOnly?: boolean;
}

export default function DocumentForm({
  onSubmit,
  loading = false,
  initialTitle = '',
  initialContent = '',
  readOnly = false,
}: DocumentFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      await onSubmit({ title, content });
    } catch (err) {
      setError('Failed to save document');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Enter document title"
          disabled={readOnly}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter document content"
          className="min-h-[400px] font-mono"
          disabled={readOnly}
        />
      </div>

      {!readOnly && (
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Document'}
        </Button>
      )}
    </form>
  );
}
