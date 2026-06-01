import { NextResponse } from "next/server";

const GITHUB_OWNER = process.env.GITHUB_RELEASE_OWNER ?? "solvys";
const GITHUB_REPO = process.env.GITHUB_RELEASE_REPO ?? "heir-right";

type GitHubAsset = {
  name: string;
  browser_download_url: string;
  size: number;
};

type GitHubRelease = {
  tag_name: string;
  name: string;
  published_at: string;
  assets: GitHubAsset[];
};

export async function GET() {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "fintheon-web"
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`,
      { headers, next: { revalidate: 300 } }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "No releases found", tag: null, name: null, dmg: null, publishedAt: null },
        { status: 404 }
      );
    }

    const release = (await response.json()) as GitHubRelease;
    const dmg =
      release.assets.find((asset) => asset.name.endsWith(".dmg") && asset.name.includes("Fintheon")) ??
      release.assets.find((asset) => asset.name.endsWith(".dmg")) ??
      null;

    return NextResponse.json({
      tag: release.tag_name,
      name: release.name,
      publishedAt: release.published_at,
      dmg
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Release fetch failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
