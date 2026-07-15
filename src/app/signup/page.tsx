import { SignUp } from "@clerk/nextjs";

export default function SignupPage() {
  return (
    <main className="min-h-[calc(100vh-65px)] flex items-center justify-center bg-[var(--app-bg)] text-[var(--app-fg)] transition-colors duration-slow py-12 px-4 sm:px-6 lg:px-8">
      <SignUp routing="hash" />
    </main>
  );
}
