import { getContent } from "@/lib/admin/content";
import { StoryEditor } from "@/components/admin/story-editor";
import { rawBase } from "@/lib/admin/raw-base";

export const dynamic = "force-dynamic";

export default async function AdminStoryPage() {
  const { data, sha } = await getContent("story");

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Story</h1>
      <p className="mt-2 text-sm text-muted">
        The scrollytelling beats, in order. The engine never needs editing —
        only this data.
      </p>
      <div className="mt-6">
        <StoryEditor initial={data.beats} sha={sha} rawBase={rawBase()} />
      </div>
    </div>
  );
}
