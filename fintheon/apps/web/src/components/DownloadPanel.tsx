"use client";

import { useEffect, useState } from "react";

type ReleaseAsset = {
  name: string;
  browser_download_url: string;
  size: number;
};

type ReleaseInfo = {
  tag: string;
  name: string;
  dmg: ReleaseAsset | null;
  publishedAt: string;
};

type Props = {
  compact?: boolean;
};

export function DownloadPanel({ compact = false }: Props) {
  const [release, setRelease] = useState<ReleaseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/releases/latest")
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch release");
        return res.json() as Promise<ReleaseInfo>;
      })
      .then(setRelease)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="download-panel">
        <h2>{compact ? "Download" : "Download Fintheon for macOS"}</h2>
        <p>Fetching latest release…</p>
      </div>
    );
  }

  if (error || !release?.dmg) {
    return (
      <div className="download-panel">
        <h2>{compact ? "Download" : "Download Fintheon for macOS"}</h2>
        <p>
          {error ??
            "No DMG found in the latest GitHub release yet. Build and publish via GitHub Releases to enable downloads."}
        </p>
      </div>
    );
  }

  const sizeMb = (release.dmg.size / (1024 * 1024)).toFixed(1);

  return (
    <div className="download-panel">
      <h2>{compact ? "Download" : "Download Fintheon for macOS"}</h2>
      <p>
        {release.name} ({release.tag}) — {sizeMb} MB DMG. Signed with Apple Developer ID.
      </p>
      <a
        className="button button-primary"
        href={release.dmg.browser_download_url}
        download
        rel="noopener noreferrer"
      >
        Download DMG
      </a>
    </div>
  );
}
