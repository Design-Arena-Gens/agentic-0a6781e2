# Serenity Reception AI

Serenity Reception AI is a full-stack Next.js experience that delivers a real-time, voice-enabled receptionist. The agent greets guests, answers FAQs, books and reschedules appointments, collects contact details, and escalates complex issues to a human when needed. The interface is optimized for concierge desks, front-office tablets, or embedded web widgets.

## ✨ Highlights

- Real-time voice input and output powered by the Web Speech API with a calm, professional tone.
- Conversational assistant orchestrated by OpenAI function calling with deterministic fallbacks when no API key is configured.
- Built-in knowledge base covering business facts, services, FAQs, and policy language.
- Pluggable calendar integrations (Calendly, Google Calendar, or custom webhook) with graceful error messaging.
- Live action log that surfaces the agent’s scheduling and escalation steps to supervisors.
- Tailwind-enhanced UI designed for clarity in busy front-desk environments.

## 🧱 Tech Stack

- [Next.js 14](https://nextjs.org/) App Router with TypeScript
- Tailwind CSS for styling
- OpenAI Node SDK for LLM orchestration
- Google Calendar + Calendly REST integrations
- Web Speech API (voice capture + speech synthesis)

## 🚀 Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Run the development server**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`.

3. **Production build**

   ```bash
   npm run build
   npm start
   ```

## 🔐 Environment Variables

Create a `.env.local` file when running locally (Vercel environment variables take precedence). Configure only what you need—unused providers degrade gracefully.

| Variable | Description |
| --- | --- |
| `OPENAI_API_KEY` | Enables conversational agent with function calling. Without it, the assistant uses the deterministic fallback responder. |
| `OPENAI_MODEL` | Optional. Defaults to `gpt-4o-mini`. |
| `DEFAULT_CALENDAR_PROVIDER` | `calendly`, `google`, or `custom`. Defaults to `calendly`. |
| `CALENDLY_API_KEY` | Required for Calendly bookings. |
| `CALENDLY_EVENT_TYPE_URI` | Calendly event type link (e.g. `https://api.calendly.com/event_types/...`). |
| `CALENDLY_ORGANIZATION_URI` | Calendly organization URI. |
| `CALENDLY_LOCATION` | Optional human-readable location string. |
| `GOOGLE_CALENDAR_ID` | Calendar ID for Google Calendar integration. |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account email with Calendar access. |
| `GOOGLE_PRIVATE_KEY` | Multiline private key (wrap with quotes; newlines can be literal or escaped). |
| `CUSTOM_SCHEDULER_URL` | Base URL for a custom scheduling service. |
| `CUSTOM_SCHEDULER_TOKEN` | Optional bearer token for custom scheduler auth. |

## 🧠 Agent Behavior

- Maintains a calm, empathetic voice while keeping conversations concise.
- Collects name, contact, desired service, and timing before booking.
- Never fabricates availability; confirms or promises human follow-up instead.
- Escalates immediately for medical/legal questions, urgent complaints, or anything outside policy.
- Logs every scheduling/escalation tool call in the “Agent Actions” sidebar for transparency.

## 🔌 Calendar Integration Notes

- **Calendly**: Requires API key, organization URI, and event type URI. Supports create, reschedule, and cancel flows.
- **Google Calendar**: Uses a service account with Calendar API scope to create, patch, and delete events.
- **Custom**: Sends JSON payloads to `/appointments/create`, `/appointments/reschedule`, and `/appointments/cancel` endpoints on your service.

## 🧪 Testing Voice Features

Voice capture and playback require running in a secure context (https or `localhost`) in a browser that supports the Web Speech API (Chrome-based browsers recommended).

## 📦 Scripts

- `npm run dev` – Start local development.
- `npm run build` – Production build with type-checking.
- `npm start` – Serve the production build.
- `npm run lint` – Run ESLint.
- `npm run typecheck` – Explicit TypeScript check.

## 🛡️ Safety & Escalation

The agent includes guardrails to route complex or sensitive issues to a human. Customize the rules in `lib/agentPrompt.ts` and extend tooling in `lib/agent.ts` to fit your operational playbooks.

---

Made with intention to keep every guest calm, heard, and perfectly scheduled. Serenity is ready to greet your clients.
