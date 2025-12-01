"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { VoiceState } from "@/types/conversation";

type RecognitionEvent = {
  results: ArrayLike<{
    0: {
      transcript: string;
    };
  }>;
};

type SpeechRecognitionExtended = {
  lang?: string;
  interimResults?: boolean;
  continuous?: boolean;
  start: () => void;
  stop: () => void;
  abort?: () => void;
  onstart?: () => void;
  onend?: () => void;
  onerror?: (event: { error: string }) => void;
  onresult?: (event: RecognitionEvent) => void;
};

interface UseVoiceAgentOptions {
  autoStopSilenceMs?: number;
}

export function useVoiceAgent(options: UseVoiceAgentOptions = {}) {
  const recognitionRef = useRef<SpeechRecognitionExtended | null>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [state, setState] = useState<VoiceState>({
    listening: false,
    speaking: false,
    supported: false
  });
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const RecognitionCtor =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!RecognitionCtor) {
      setState((prev) => ({ ...prev, supported: false }));
      return;
    }

    const recognition = new RecognitionCtor() as SpeechRecognitionExtended;
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () =>
      setState((prev) => ({ ...prev, listening: true, error: undefined }));
    recognition.onend = () => {
      setState((prev) => ({ ...prev, listening: false }));
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
    };

    recognition.onerror = (event) => {
      setState((prev) => ({
        ...prev,
        listening: false,
        error: event.error
      }));
    };

    recognition.onresult = (event) => {
      const finalTranscript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");
      setTranscript(finalTranscript);
      setState((prev) => ({
        ...prev,
        lastTranscript: finalTranscript
      }));
      if (options.autoStopSilenceMs) {
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current);
        }
        speechTimeoutRef.current = setTimeout(() => {
          recognition.stop();
        }, options.autoStopSilenceMs);
      }
    };

    recognitionRef.current = recognition;
    setState((prev) => ({ ...prev, supported: true }));

    return () => {
      recognition.stop();
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
    };
  }, [options.autoStopSilenceMs]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setTranscript("");
    recognitionRef.current.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const speak = useCallback(async (text: string) => {
    if (typeof window === "undefined") return;
    if (!window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () =>
      setState((prev) => ({ ...prev, speaking: true, error: undefined }));
    utterance.onend = () =>
      setState((prev) => ({ ...prev, speaking: false }));
    utterance.onerror = (event) =>
      setState((prev) => ({
        ...prev,
        speaking: false,
        error: event.error
      }));

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, []);

  return {
    transcript,
    voiceState: state,
    startListening,
    stopListening,
    speak,
    resetTranscript: () => setTranscript(""),
    setVoiceError: (error: string) =>
      setState((prev) => ({ ...prev, error, listening: false, speaking: false }))
  };
}
