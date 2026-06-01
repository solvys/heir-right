import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <Link href="http://127.0.0.1:5180" className="brand">
          Fintheon
        </Link>
        <Link href="/sign-up">Sign up</Link>
      </header>
      <main className="page-main">
        <div className="auth-card">
          <h1>Welcome back</h1>
          <p>Sign in to access your Fintheon workspace and downloads.</p>
          <div className="clerk-root">
            <SignIn
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              forceRedirectUrl="/dashboard"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
