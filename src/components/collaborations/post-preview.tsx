import { Globe, MessageSquare, Repeat2, Send, ThumbsUp } from "lucide-react";
import { CreatorAvatar } from "@/components/common/avatars";
import type { Creator } from "@/lib/domain/types";
import { formatCompact } from "@/lib/format";

const POST_ACTIONS = [
  { icon: ThumbsUp, label: "Like" },
  { icon: MessageSquare, label: "Comment" },
  { icon: Repeat2, label: "Repost" },
  { icon: Send, label: "Send" },
];

/** A LinkedIn-style rendering of a draft or a published post. */
export function PostPreview({
  creator,
  text,
  meta,
  reactions,
  comments,
}: {
  creator: Pick<Creator, "name" | "hue" | "headline" | "followers">;
  text: string;
  meta: string;
  reactions?: number;
  comments?: number;
}) {
  return (
    <article className="rounded-xl border bg-white">
      <header className="flex items-start gap-3 p-4 pb-2">
        <CreatorAvatar creator={creator} size="md" className="ring-0" />
        <div className="min-w-0 text-sm">
          <p className="font-semibold leading-tight">{creator.name}</p>
          <p className="truncate text-xs text-muted-foreground">{creator.headline}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            {meta} · <Globe className="size-3" aria-label="Public" />
          </p>
        </div>
      </header>
      <p className="px-4 pb-3 text-sm leading-relaxed whitespace-pre-line">{text}</p>
      {reactions !== undefined && (
        <p className="flex justify-between border-t px-4 py-2 text-xs text-muted-foreground">
          <span>{formatCompact(reactions)} reactions</span>
          <span>{formatCompact(comments ?? 0)} comments</span>
        </p>
      )}
      <div className="grid grid-cols-4 border-t text-xs font-semibold text-muted-foreground" aria-hidden>
        {POST_ACTIONS.map(({ icon: Icon, label }) => (
          <span key={label} className="flex items-center justify-center gap-1.5 py-2.5">
            <Icon className="size-4" /> {label}
          </span>
        ))}
      </div>
    </article>
  );
}
