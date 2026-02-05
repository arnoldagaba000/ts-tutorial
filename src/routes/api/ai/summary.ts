import { createFileRoute } from "@tanstack/react-router";
import { streamText } from "ai";
import { prisma } from "@/db";
import { openrouter } from "@/lib/openRouter";

export const Route = createFileRoute("/api/ai/summary")({
    server: {
        handlers: {
            POST: async ({ context, request }) => {
                const { itemId, prompt } = await request.json();

                if (!(itemId || prompt)) {
                    return new Response("Missing itemId or prompt", {
                        status: 400,
                    });
                }

                const item = await prisma.savedItem.findUnique({
                    where: {
                        id: itemId,
                        userId: context?.session.user.id,
                    },
                });

                if (!item) {
                    return new Response("Item not found", {
                        status: 404,
                    });
                }

                // Stream summary
                const result = streamText({
                    model: openrouter.chat(
                        "arcee-ai/trinity-large-preview:free"
                    ),
                    system: `You are a helpful assistant that creates concise, informative summaries of web content.
                    Your summaries should:
                    - Be 2-3 paragraphs long
                    - Capture the main points and key takeaways
                    - Be written in a clear, professional tone
                    - Not include any mrkdown formatting`,
                    prompt: `Please summarise the following content:\n\n${prompt}`,
                });
                
                // Return the stream in the format useCompletion expects
                return result.toTextStreamResponse();
            },
        },
    },
});
