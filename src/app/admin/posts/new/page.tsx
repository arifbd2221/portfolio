import { PostEditor } from "@/components/admin/post-editor";

export const dynamic = "force-dynamic";

export default function NewPostPage() {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">New post</h1>
      <div className="mt-6">
        <PostEditor
          isNew
          slug=""
          sha={null}
          initialMeta={{
            title: "",
            date: today,
            description: "",
            tags: [],
            draft: true,
          }}
          initialBody={"Write the post here.\n\n## A heading\n\n<Callout>\n  Callouts work in the preview too.\n</Callout>\n"}
        />
      </div>
    </div>
  );
}
