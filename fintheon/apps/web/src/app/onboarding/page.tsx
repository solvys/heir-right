import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DownloadPanel } from "@/components/DownloadPanel";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-up");

  return (
    <div className="page-shell">
      <header className="page-header">
        <Link href="http://127.0.0.1:5180" className="brand">
          Fintheon
        </Link>
      </header>
      <main className="page-main">
        <div className="onboarding-card">
          <div className="progress-bar" aria-hidden="true">
            <span />
          </div>
          <h1>Setting up your workspace</h1>
          <p>
            Your account is ready. While we finish provisioning, download the
            macOS app — install it, and Fintheon will detect Local Hermes on
            your machine automatically.
          </p>
          <DownloadPanel />
          <p className="note">
            <strong>Local Hermes</strong> requires your own Hermes config at{" "}
            <code>~/.hermes/config.json</code>. Cloud Hermes is available from
            the desktop app when Local Hermes is not detected.
          </p>
          <Link href="/dashboard" className="button button-secondary" style={{ marginTop: "1.25rem", display: "inline-flex" }}>
            Continue to dashboard →
          </Link>
        </div>
      </main>
    </div>
  );
}
