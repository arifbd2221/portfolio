import { getContent } from "@/lib/admin/content";
import { GalleryEditor } from "@/components/admin/gallery-editor";
import { rawBase } from "@/lib/admin/raw-base";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const { data, sha } = await getContent("gallery");

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Gallery</h1>
      <p className="mt-2 text-sm text-muted">
        The curated handful. Add photos from media — dimensions and blur
        placeholders are computed automatically. Alt text is required.
      </p>
      <div className="mt-6">
        <GalleryEditor initial={data} sha={sha} rawBase={rawBase()} />
      </div>
    </div>
  );
}
