import { detectLocalHermesPort } from "@fintheon/hermes";

export async function HermesStatus() {
  const port = await detectLocalHermesPort();

  return (
    <div className="dashboard-card">
      <h2>Hermes detection (this server)</h2>
      <div className="hermes-status">
        {port ? (
          <>
            <strong>Local Hermes detected</strong> on{" "}
            <code>127.0.0.1:{port}</code>
            <br />
            Your desktop app will use the same discovery logic on your machine.
          </>
        ) : (
          <>
            <strong>No Local Hermes detected</strong> from this environment.
            <br />
            Configure Hermes at <code>~/.hermes/config.json</code> on your Mac,
            then launch the Fintheon desktop app.
          </>
        )}
      </div>
    </div>
  );
}
