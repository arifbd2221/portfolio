import { getContent } from "@/lib/admin/content";
import { ProjectsEditor } from "@/components/admin/projects-editor";
import { rawBase } from "@/lib/admin/raw-base";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const { data, sha } = await getContent("projects");

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
      <p className="mt-2 text-sm text-muted">
        Ids are the AI&apos;s focusProject handles and the 3D scene&apos;s
        targets — they lock after the first save.
      </p>
      <div className="mt-6">
        <ProjectsEditor initial={data} sha={sha} rawBase={rawBase()} />
      </div>
    </div>
  );
}
