import { getContent } from "@/lib/admin/content";
import { BioEditor } from "@/components/admin/bio-editor";
import { rawBase } from "@/lib/admin/raw-base";

export const dynamic = "force-dynamic";

export default async function AdminBioPage() {
  const { data, sha } = await getContent("bio");

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Bio</h1>
      <p className="mt-2 text-sm text-muted">
        Shown in the hero and About — and it grounds the AI guide&apos;s answers.
      </p>
      <div className="mt-6">
        <BioEditor initial={data} sha={sha} rawBase={rawBase()} />
      </div>
    </div>
  );
}
