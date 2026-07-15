# DocVault

A full-stack document management system with role-based access control (RBAC), built with Next.js, TypeScript, MongoDB, and Better-Auth.

## Features

- 📄 **Document Management**: Create, read, update, and delete text documents
- 👥 **Collaboration**: Invite collaborators with specific roles
- 🔐 **RBAC**: Role-based access control (Viewer, Editor, Admin)
- 🔑 **Authentication**: Secure user registration and login with JWT
- 📧 **Invitations**: Invite users with expiring tokens and role assignment
- 💾 **MongoDB Integration**: Persistent data storage

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, TypeScript
- **Database**: MongoDB
- **Authentication**: Custom JWT-based auth with bcryptjs
- **Utilities**: Better-Auth, Mongoose, dotenv

## Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- npm or yarn

## Setup Instructions

### 1. Clone/Setup the Project

```bash
cd /home/kamlesh/Desktop/Web/docvault
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/docvault
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-in-production
JWT_SECRET=your-jwt-secret-key-change-in-production
```

**For production, change the secrets to strong, random values.**

### 3. Install MongoDB

#### Option A: Local MongoDB
```bash
# On Ubuntu/Debian
sudo apt-get install -y mongodb

# Start MongoDB
sudo systemctl start mongodb

# Verify it's running
mongo
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env.local`

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

The application will start at `http://localhost:3000`

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/
│   │   └── auth/               # Authentication endpoints
│   │       ├── signup/
│   │       ├── login/
│   │       ├── logout/
│   │       └── me/
│   │   ├── documents/          # Document management endpoints
│   │   │   ├── route.ts        # Create, list documents
│   │   │   └── [id]/route.ts   # Get, update, delete documents
│   │   └── invitations/        # Invitation endpoints
│   │       ├── route.ts        # Create, list invitations
│   │       └── [token]/route.ts # Accept invitations
│   ├── layout.tsx
│   ├── page.tsx                # Home page
│   ├── login/
│   ├── signup/
│   ├── dashboard/
│   ├── documents/
│   │   └── [id]/
│   └── invitations/
├── lib/
│   ├── db.ts                   # MongoDB connection
│   ├── auth.ts                 # Password hashing utilities
│   └── jwt.ts                  # JWT token handling
├── models/
│   ├── User.ts                 # User schema & model
│   ├── Document.ts             # Document schema & model
│   └── Invitation.ts           # Invitation schema & model
└── components/
    ├── Navbar.tsx
    ├── LoginForm.tsx
    ├── SignupForm.tsx
    ├── DocumentForm.tsx
    ├── DocumentList.tsx
    └── InviteForm.tsx
```

## API Endpoints

### Authentication

- **POST** `/api/auth/signup` - Register a new user
  ```json
  { "email": "user@example.com", "name": "John", "password": "pass123" }
  ```

- **POST** `/api/auth/login` - Login user
  ```json
  { "email": "user@example.com", "password": "pass123" }
  ```

- **POST** `/api/auth/logout` - Logout user

- **GET** `/api/auth/me` - Get current user info

### Documents

- **POST** `/api/documents` - Create new document
  ```json
  { "title": "My Doc", "content": "Content here" }
  ```

- **GET** `/api/documents` - List all documents accessible to user

- **GET** `/api/documents/[id]` - Get specific document

- **PATCH** `/api/documents/[id]` - Update document
  ```json
  { "title": "Updated Title", "content": "Updated content" }
  ```

- **DELETE** `/api/documents/[id]` - Delete document

### Invitations

- **POST** `/api/invitations` - Send invitation
  ```json
  { "email": "collaborator@example.com", "documentId": "...","role": "editor" }
  ```

- **GET** `/api/invitations` - List pending invitations

- **POST** `/api/invitations/[token]` - Accept invitation

## User Roles

- **Viewer**: Read-only access to documents
- **Editor**: Can view and edit documents
- **Admin**: Full access including managing collaborators

## Features Breakdown

### 1. User Authentication
- Users can sign up with email and password
- Passwords are hashed using bcryptjs
- JWT tokens are issued upon login
- Sessions persist via HTTP-only cookies

### 2. Document Management
- Users can create text documents
- Full CRUD operations with permission checks
- Documents store metadata (owner, creation date, etc.)

### 3. Collaboration
- Document owners can invite collaborators via email
- Invitations include a unique token and expire after 7 days
- Collaborators can accept invitations to gain access
- Access levels can be assigned (Viewer, Editor, Admin)

### 4. RBAC Implementation
- Permission checks at API level
- Only document owners can delete documents
- Viewers can only read, editors can read/write
- Admin has full control

## Development

### Running Tests

Currently, tests are not configured. You can add Jest and React Testing Library:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom ts-jest
```

### Building for Production

```bash
npm run build
npm start
```

### Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/docvault |
| NEXTAUTH_URL | Application URL | http://localhost:3000 |
| NEXTAUTH_SECRET | Secret for next-auth | random-secret |
| JWT_SECRET | Secret for JWT tokens | random-secret |

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `sudo systemctl status mongodb`
- Check connection string in `.env.local`
- Verify MongoDB is listening on port 27017

### Port Already in Use
```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

### Dependency Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Future Enhancements

- Document version history
- Real-time collaboration with WebSockets
- Document sharing via links
- Advanced permission controls
- User profiles and avatars
- Document templates
- Search functionality
- Export documents to PDF/Word
- Audit logs
- Two-factor authentication

## Security Considerations

- Always use HTTPS in production
- Change JWT_SECRET and NEXTAUTH_SECRET to strong values
- Enable MongoDB authentication in production
- Use environment variables for all secrets
- Implement rate limiting for API endpoints
- Add CORS configuration if needed
- Keep dependencies updated

## License

MIT

## Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ using Next.js and MongoDB**

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
