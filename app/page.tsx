"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Composer } from "@/components/chat/Composer";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { VoiceControl } from "@/components/chat/VoiceControl";
import { useVoiceAgent } from "@/hooks/useVoiceAgent";
import { businessInfo } from "@/lib/businessInfo";
import type { AgentMessage } from "@/types/conversation";

interface ToolExecution {
  tool: string;
  content: string;
}

export default function HomePage() {
  const [messages, setMessages] = useState<AgentMessage[]>(() => [
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content:
        "Welcome to Serenity Wellness Studio. I’m Serenity, your studio receptionist. How can I support your visit today—would you like help scheduling, adjusting an appointment, or learning more about our services?",
      createdAt: Date.now()
    }
  ]);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toolExecutions, setToolExecutions] = useState<ToolExecution[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  const {
    transcript,
    voiceState,
    startListening,
    stopListening,
    speak,
    resetTranscript
  } = useVoiceAgent({ autoStopSilenceMs: 1500 });

  const handleSend = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    const userMessage: AgentMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      createdAt: Date.now()
    };
    setMessages((previous) => [...previous, userMessage]);
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          clientContext: {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            channel: "web"
          }
        })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Agent unavailable");
      }

      const assistantMessage: AgentMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.message,
        createdAt: Date.now()
      };
      setMessages((previous) => [...previous, assistantMessage]);
      setToolExecutions((prev) => [
        ...prev,
        ...(Array.isArray(result.toolExecutions)
          ? (result.toolExecutions as ToolExecution[])
          : [])
      ]);
      speak(result.message);
    } catch (agentError) {
      console.error(agentError);
      const fallbackMessage: AgentMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "I’m so sorry—I wasn’t able to take care of that just now. I’ve alerted a human coordinator to follow up with you directly.",
        createdAt: Date.now()
      };
      setMessages((previous) => [...previous, fallbackMessage]);
      setError(
        agentError instanceof Error ? agentError.message : "Unknown error"
      );
    } finally {
      setPending(false);
    }
  };

  useEffect(() => {
    if (!voiceState.listening && transcript) {
      handleSend(transcript);
      resetTranscript();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceState.listening]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages]);

  const upcomingServices = useMemo(
    () =>
      businessInfo.services.map((service) => ({
        id: service.id,
        title: service.name,
        duration: `${service.durationMinutes} min`,
        price: service.priceDescription,
        summary: service.summary
      })),
    []
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10 lg:flex-row">
        <section className="flex-1 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-2xl backdrop-blur">
          <header className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
            <div>
              <h1 className="text-xl font-semibold text-slate-50">
                Serenity Reception
              </h1>
              <p className="text-sm text-slate-400">
                Calm, reliable scheduling and guest care.
              </p>
            </div>
            <VoiceControl
              listening={voiceState.listening}
              speaking={voiceState.speaking}
              supported={voiceState.supported}
              onToggle={() =>
                voiceState.listening ? stopListening() : startListening()
              }
              onStopSpeaking={() => window.speechSynthesis?.cancel()}
            />
          </header>
          <div
            ref={containerRef}
            className="flex max-h-[65vh] flex-col gap-4 overflow-y-auto px-6 py-6"
          >
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                role={
                  message.role === "assistant" || message.role === "system"
                    ? "assistant"
                    : "user"
                }
                content={message.content}
                timestamp={new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              />
            ))}
          </div>
          <footer className="flex flex-col gap-4 border-t border-slate-800 px-6 py-5">
            {error ? (
              <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs text-rose-200">
                {error}
              </div>
            ) : null}
            <Composer disabled={pending} onSubmit={handleSend} />
            <p className="text-xs text-slate-500">
              Serenity follows studio policies strictly and escalates complex
              issues to a human coordinator instantly.
            </p>
          </footer>
        </section>
        <aside className="flex w-full flex-col gap-5 rounded-3xl border border-slate-800 bg-slate-900/40 px-6 py-6 text-sm text-slate-200 lg:w-80">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Studio Snapshot
            </h2>
            <p className="mt-2 text-slate-400">{businessInfo.description}</p>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-wide text-slate-500">
              Address
            </h3>
            <p className="mt-1 text-sm text-slate-200">
              {businessInfo.location.address}
            </p>
            <a
              href={businessInfo.location.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-teal-300 hover:text-teal-200"
            >
              View map
            </a>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-wide text-slate-500">
              Hours
            </h3>
            <ul className="mt-2 space-y-1">
              {Object.entries(businessInfo.hours).map(([day, hours]) => (
                <li key={day} className="flex justify-between text-xs">
                  <span className="text-slate-400">{day}</span>
                  <span className="text-slate-200">{hours}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-wide text-slate-500">
              Feature Services
            </h3>
            <ul className="mt-2 space-y-3">
              {upcomingServices.map((service) => (
                <li
                  key={service.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/50 p-3"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{service.duration}</span>
                    <span>{service.price}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-slate-100">
                    {service.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {service.summary}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          {toolExecutions.length > 0 ? (
            <div>
              <h3 className="text-xs uppercase tracking-wide text-slate-500">
                Agent Actions
              </h3>
              <ul className="mt-2 space-y-2 text-xs text-slate-400">
                {toolExecutions.slice(-4).map((execution, index) => (
                  <li
                    key={`${execution.tool}-${index}`}
                    className="rounded-lg border border-slate-800 bg-slate-900/40 p-2"
                  >
                    <span className="font-semibold text-teal-200">
                      {execution.tool}
                    </span>
                    <pre className="mt-1 whitespace-pre-wrap text-[11px] leading-snug text-slate-400">
                      {execution.content}
                    </pre>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 text-xs text-slate-400">
            Serenity never improvises availability or policies. When unsure,
            she promises to confirm with a human specialist.
          </div>
        </aside>
      </div>
    </main>
  );
}
