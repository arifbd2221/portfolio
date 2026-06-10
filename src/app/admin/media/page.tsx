import { MediaLibrary } from "@/components/admin/media-library";

export const dynamic = "force-dynamic";

export default function AdminMediaPage() {
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH ?? "main";
  const rawBase =
    process.env.GITHUB_TOKEN && repo
      ? `https://raw.githubusercontent.com/${repo}/${branch}`
      : null;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Media</h1>
      <p className="mt-2 text-sm text-muted">
        Images are resized and stripped of EXIF in your browser, then committed
        to the repo. Click a filename to copy its path.
      </p>
      <div className="mt-6">
        <MediaLibrary rawBase={rawBase} />
      </div>
    </div>
  );
}
