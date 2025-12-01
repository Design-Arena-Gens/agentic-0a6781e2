"use client";

import { useRef } from "react";
import type { FormEvent } from "react";

interface ComposerProps {
  disabled?: boolean;
  placeholder?: string;
  onSubmit: (value: string) => void;
}

export function Composer({
  disabled,
  placeholder = "Ask Serenity to schedule, answer questions, or share updates…",
  onSubmit
}: ComposerProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = inputRef.current?.value?.trim();
    if (!value) return;
    onSubmit(value);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 shadow-lg backdrop-blur"
    >
      <textarea
        ref={inputRef}
        className="h-14 w-full resize-none bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none"
        placeholder={placeholder}
        disabled={disabled}
        rows={2}
      />
      <button
        type="submit"
        className="rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        disabled={disabled}
      >
        Send
      </button>
    </form>
  );
}
