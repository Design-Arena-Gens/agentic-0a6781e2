import { memo } from "react";
import classNames from "classnames";

interface MessageBubbleProps {
  role: "assistant" | "user" | "system";
  content: string;
  timestamp: string;
}

function MessageBubbleComponent({
  role,
  content,
  timestamp
}: MessageBubbleProps) {
  const isAgent = role === "assistant" || role === "system";

  return (
    <div
      className={classNames("flex w-full gap-3", {
        "justify-end": !isAgent
      })}
    >
      <div
        className={classNames(
          "max-w-2xl rounded-2xl border px-4 py-3 text-sm shadow-lg transition",
          {
            "border-slate-800 bg-slate-900/80 text-slate-100": isAgent,
            "border-teal-500/40 bg-teal-500/10 text-teal-100 backdrop-blur":
              !isAgent
          }
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
        <span className="mt-2 block text-xs text-slate-400">{timestamp}</span>
      </div>
    </div>
  );
}

export const MessageBubble = memo(MessageBubbleComponent);
