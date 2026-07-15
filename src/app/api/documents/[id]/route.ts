import { connectDB } from '@/lib/db';
import Document from '@/models/Document';
import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    await connectDB();

    const document = await Document.findById(id);
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Permission check:
    const isOwner = document.ownerId === userId;
    const isOrgMember = document.orgId && document.orgId === orgId;
    const collaborator = document.collaborators.find(
      (c: any) => c.email.toLowerCase() === email
    );

    if (!isOwner && !isOrgMember && !collaborator) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Return document details + user role context for client consumption
    let userRole = 'viewer';
    if (isOwner) {
      userRole = 'owner';
    } else if (isOrgMember) {
      userRole = 'editor'; // org members have write access by default
    } else if (collaborator) {
      userRole = collaborator.role;
    }

    return NextResponse.json({ document, userRole });
  } catch (error) {
    console.error('Get document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, orgId, orgRole } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const email = user.emailAddresses[0]?.emailAddress.toLowerCase();

    const { id } = await params;
    await connectDB();

    const document = await Document.findById(id);
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Permission checks
    const isOwner = document.ownerId === userId;
    const isOrgMember = document.orgId && document.orgId === orgId;
    const collaborator = document.collaborators.find(
      (c: any) => c.email.toLowerCase() === email
    );

    // Can only edit if owner, org member, or editor collaborator
    const canEdit = isOwner || isOrgMember || (collaborator && collaborator.role === 'editor');
    if (!canEdit) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, content, collaborators } = await request.json();

    if (title !== undefined) document.title = title;
    if (content !== undefined) document.content = content;

    // Only Owner or Org Admin can manage collaborators (direct sharing)
    let newCollabs: Array<{ email: string; role: 'viewer' | 'editor' }> = [];
    if (collaborators !== undefined) {
      // Check if there are actual changes to the collaborators list
      const existingCollabs = document.collaborators || [];
      const isCollaboratorsListChanged =
        collaborators.length !== existingCollabs.length ||
        collaborators.some((c: any) => {
          const matched = existingCollabs.find(
            (ec: any) => ec.email.toLowerCase() === c.email.toLowerCase()
          );
          return !matched || matched.role !== c.role;
        });

      if (isCollaboratorsListChanged) {
        const isOrgAdmin = isOrgMember && orgRole === 'org:admin';
        if (!isOwner && !isOrgAdmin) {
          return NextResponse.json(
            { error: 'Only owners or organization admins can manage collaborators' },
            { status: 403 }
          );
        }

        // Find newly added collaborators to send email invites
        const logPath = path.join(process.cwd(), 'email-debug.log');
        fs.appendFileSync(
          logPath,
          `[${new Date().toISOString()}] PATCH/PUT Request. DB Collabs: ${JSON.stringify(document.collaborators)}, Body Collabs: ${JSON.stringify(collaborators)}\n`
        );

        const existingEmails = new Set(
          existingCollabs.map((c: any) => c.email.toLowerCase())
        );
        newCollabs = collaborators.filter(
          (c: any) => !existingEmails.has(c.email.toLowerCase())
        );

        fs.appendFileSync(
          logPath,
          `[${new Date().toISOString()}] Calculated newCollabs: ${JSON.stringify(newCollabs)}\n`
        );

        document.collaborators = collaborators;
      }
    }

    await document.save();

    // Send emails to newly added collaborators if SMTP or Resend is configured
    if (newCollabs.length > 0) {
      const logPath = path.join(process.cwd(), 'email-debug.log');
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        fs.appendFileSync(
          logPath,
          `[${new Date().toISOString()}] SMTP settings detected. SMTP_USER: ${process.env.SMTP_USER}\n`
        );
        // Send email via SMTP (e.g. Gmail) using Nodemailer
        try {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          for (const collab of newCollabs) {
            try {
              fs.appendFileSync(
                logPath,
                `[${new Date().toISOString()}] Sending email to ${collab.email}...\n`
              );
              const info = await transporter.sendMail({
                from: `"DocVault" <${process.env.SMTP_USER}>`,
                to: collab.email,
                subject: `Invitation to collaborate: ${document.title}`,
                html: `<p>Hello,</p>
                       <p>You have been invited to collaborate as a <strong>${collab.role}</strong> on the document: <strong>${document.title}</strong>.</p>
                       <p><a href="${appUrl}/documents/${document._id}">Click here to access the document</a>.</p>`,
              });
              fs.appendFileSync(
                logPath,
                `[${new Date().toISOString()}] Email sent successfully! Info: ${JSON.stringify(info)}\n`
              );
            } catch (collabErr: any) {
              console.error('Failed to send SMTP invite to:', collab.email, collabErr);
              fs.appendFileSync(
                logPath,
                `[${new Date().toISOString()}] SMTP send error for ${collab.email}: ${collabErr?.message || collabErr}\n`
              );
            }
          }
        } catch (smtpInitErr: any) {
          console.error('SMTP initialization or execution error:', smtpInitErr);
          fs.appendFileSync(
            logPath,
            `[${new Date().toISOString()}] SMTP Init/Exec error: ${smtpInitErr?.message || smtpInitErr}\n`
          );
        }
      } else if (process.env.RESEND_API_KEY) {
        fs.appendFileSync(
          logPath,
          `[${new Date().toISOString()}] Resend API Key detected.\n`
        );
        // Fallback: Send email via Resend API
        for (const collab of newCollabs) {
          try {
            const res = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'DocVault <onboarding@resend.dev>',
                to: collab.email,
                subject: `Invitation to collaborate: ${document.title}`,
                html: `<p>Hello,</p>
                       <p>You have been invited to collaborate as a <strong>${collab.role}</strong> on the document: <strong>${document.title}</strong>.</p>
                       <p><a href="${appUrl}/documents/${document._id}">Click here to access the document</a>.</p>`,
              }),
            });
            const resData = await res.json();
            fs.appendFileSync(
              logPath,
              `[${new Date().toISOString()}] Resend response: ${JSON.stringify(resData)}\n`
            );
          } catch (emailErr: any) {
            console.error('Failed to send Resend invitation email to:', collab.email, emailErr);
            fs.appendFileSync(
              logPath,
              `[${new Date().toISOString()}] Resend send error for ${collab.email}: ${emailErr?.message || emailErr}\n`
            );
          }
        }
      } else {
        fs.appendFileSync(
          logPath,
          `[${new Date().toISOString()}] Neither SMTP nor Resend is configured.\n`
        );
      }
    }

    return NextResponse.json({
      message: 'Document updated successfully',
      document,
    });
  } catch (error) {
    console.error('Update document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, orgId, orgRole } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const document = await Document.findById(id);
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Only owner or org admin can delete documents
    const isOwner = document.ownerId === userId;
    const isOrgAdmin = document.orgId && document.orgId === orgId && orgRole === 'org:admin';

    if (!isOwner && !isOrgAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await Document.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export { PATCH as PUT };
