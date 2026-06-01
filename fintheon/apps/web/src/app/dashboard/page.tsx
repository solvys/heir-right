import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DownloadPanel } from "@/components/DownloadPanel";
import { HermesStatus } from "@/components/HermesStatus";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="page-shell">
      <header className="page-header">
        <Link href="http://127.0.0.1:5180" className="brand">
          Fintheon
        </Link>
      </header>
      <main className="page-main" style={{ alignItems: "flex-start", paddingTop: "3rem" }}>
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <span className="badge badge-local">Local Hermes</span>
            <h2>Desktop app</h2>
            <p>
              Install Fintheon from the DMG. On first launch, the app scans your
              Hermes config and connects to Local Hermes for all on-device agentic
              actions.
            </p>
            <DownloadPanel compact />
          </div>
          <div className="dashboard-card">
            <span className="badge badge-cloud">Cloud Hermes</span>
            <h2>Hosted runtime</h2>
            <p>
              When Local Hermes is unavailable, the agentic layer falls back to
              Cloud Hermes using your authenticated session.
            </p>
          </div>
          <HermesStatus />
        </div>
      </main>
    </div>
  );
}
