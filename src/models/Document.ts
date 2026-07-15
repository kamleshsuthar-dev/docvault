import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
  title: string;
  content: string;
  ownerId: string;       // Clerk User ID
  ownerEmail: string;    // Owner email
  ownerName: string;     // Owner name
  orgId: string | null;  // Clerk Org ID (null if personal document)
  collaborators: Array<{
    email: string;       // Collaborator email address
    role: 'viewer' | 'editor';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    title: { type: String, required: true },
    content: { type: String, default: '' },
    ownerId: { type: String, required: true, index: true },
    ownerEmail: { type: String, required: true },
    ownerName: { type: String, required: true },
    orgId: { type: String, default: null, index: true },
    collaborators: [
      {
        email: { type: String, required: true, lowercase: true },
        role: { type: String, enum: ['viewer', 'editor'], default: 'viewer' },
      },
    ],
  },
  { timestamps: true }
);

// Compound indexes for faster lookup
DocumentSchema.index({ 'collaborators.email': 1 });

export default mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);
