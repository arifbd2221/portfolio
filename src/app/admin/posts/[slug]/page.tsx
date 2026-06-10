import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminPost, parseMetadata, splitBody } from "@/lib/admin/posts";
import { PostEditor } from "@/components/admin/post-editor";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const file = await getAdminPost(slug).catch(() => null);
  if (!file) notFound();

  const meta = parseMetadata(file.source);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="truncate text-2xl font-semibold tracking-tight">
          Edit: {meta?.title ?? slug}
        </h1>
        <Link
          href={`/blog/${slug}`}
          target="_blank"
          className="shrink-0 text-sm text-muted underline-offset-2 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          View live ↗
        </Link>
      </div>

      {meta ? (
        <div className="mt-6">
          <PostEditor
            isNew={false}
            slug={slug}
            sha={file.sha}
            initialMeta={meta}
            initialBody={splitBody(file.source)}
          />
        </div>
      ) : (
        <p className="mt-6 text-sm text-amber-500">
          This post&apos;s metadata block isn&apos;t in the canonical format the
          editor understands — edit the file directly in the repo, or recreate
          it from the admin.
        </p>
      )}
    </div>
  );
}
