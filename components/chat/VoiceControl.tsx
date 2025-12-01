"use client";

import classNames from "classnames";
import { Mic, MicOff, Volume2 } from "lucide-react";

interface VoiceControlProps {
  listening: boolean;
  speaking: boolean;
  supported: boolean;
  onToggle: () => void;
  onStopSpeaking: () => void;
}

export function VoiceControl({
  listening,
  speaking,
  supported,
  onToggle,
  onStopSpeaking
}: VoiceControlProps) {
  if (!supported) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2 text-xs text-slate-400">
        Voice features require a browser that supports the Web Speech API.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2 text-xs text-slate-200">
      <button
        type="button"
        onClick={onToggle}
        className={classNames(
          "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition",
          listening
            ? "bg-rose-500/20 text-rose-200 ring-1 ring-rose-500"
            : "bg-teal-500/20 text-teal-200 hover:bg-teal-500/30"
        )}
      >
        {listening ? <MicOff size={14} /> : <Mic size={14} />}
        {listening ? "Stop Listening" : "Start Listening"}
      </button>
      <div className="flex items-center gap-1 text-slate-400">
        <Volume2 size={14} />
        <span>{speaking ? "Responding…" : "Ready"}</span>
      </div>
      {speaking ? (
        <button
          type="button"
          className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300 transition hover:bg-slate-700"
          onClick={onStopSpeaking}
        >
          Mute
        </button>
      ) : null}
    </div>
  );
}
