// app/api/chat/route.ts

import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY!,
})

export const runtime = 'edge'

// Build a prompt from the messages
function buildPrompt(messages: { content: string; role: 'system' | 'user' | 'assistant' }[]) {
  return (
    messages
      .map(({ content, role }) => {
        if (role === 'user') {
          return `Human: ${content}`;
        } else {
          return `Assistant: ${content}`;
        }
      })
      .join('\n\n') + 'Assistant:'
  );
}

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const { messages } = await req.json();

  // Request the Replicate API for the response based on the prompt
  const response = await replicate.run('replicate:a16z-infra/llama13b-v2-chat:df7690f1994d94e96', {
    input: {
      prompt: buildPrompt(messages),
      temperature: 0.75,
      top_p: 1,
      max_length: 500,
      repetition_penalty: 1,
    },
    wait: true,
  })

  const completion = (response as string[]).join('')

  return new Response(completion)
}
