import { NextResponse } from "next/server";
import { z } from "zod";

import { runAgent } from "@/lib/agent";

export const dynamic = "force-dynamic";

const messageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system", "tool"]),
  content: z.string(),
  createdAt: z.number(),
  name: z.string().optional()
});

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1),
  clientContext: z
    .object({
      conversationId: z.string().optional(),
      timezone: z.string().optional(),
      channel: z.string().optional()
    })
    .optional()
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { messages } = requestSchema.parse(json);
    const agentReply = await runAgent(messages);
    return NextResponse.json(
      {
        success: true,
        message: agentReply.content,
        toolExecutions: agentReply.toolExecutions
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Agent error", error);
    return NextResponse.json(
      {
        success: false,
        message:
          "I'm unable to complete that just now, so I'll have a coordinator reach out to help directly.",
        error:
          error instanceof Error ? error.message : "Unknown agent failure"
      },
      { status: 500 }
    );
  }
}
