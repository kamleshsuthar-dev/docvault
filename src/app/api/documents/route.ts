import { connectDB } from '@/lib/db';
import Document from '@/models/Document';
import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = user.emailAddresses[0]?.emailAddress;
    const name = user.fullName || user.firstName || 'Anonymous';

    await connectDB();
    const { title, content = '' } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const document = new Document({
      title,
      content,
      ownerId: userId,
      ownerEmail: email,
      ownerName: name,
      orgId: orgId || null, // Links to active Clerk organization/team if selected
      collaborators: [],
    });

    await document.save();

    return NextResponse.json({
      message: 'Document created successfully',
      document,
    });
  } catch (error) {
    console.error('Create document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = user.emailAddresses[0]?.emailAddress.toLowerCase();

    await connectDB();

    // Query documents:
    // 1. User is the owner
    // 2. Document is shared directly via the user's email
    // 3. Document belongs to the active organization selected in the header
    const queryConditions: any[] = [
      { ownerId: userId },
      { 'collaborators.email': email },
    ];

    if (orgId) {
      queryConditions.push({ orgId: orgId });
    }

    const documents = await Document.find({
      $or: queryConditions,
    }).sort({ updatedAt: -1 });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Get documents error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
