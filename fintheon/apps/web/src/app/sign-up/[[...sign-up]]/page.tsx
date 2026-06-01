import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <Link href="http://127.0.0.1:5180" className="brand">
          Fintheon
        </Link>
        <Link href="/sign-in">Sign in</Link>
      </header>
      <main className="page-main">
        <div className="auth-card">
          <h1>Create your account</h1>
          <p>
            Sign up with Google or email to get your Fintheon workspace. After
            registration, download the macOS DMG and connect to Local Hermes.
          </p>
          <div className="clerk-root">
            <SignUp
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              forceRedirectUrl="/onboarding"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
