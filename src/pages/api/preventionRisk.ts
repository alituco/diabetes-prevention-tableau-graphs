import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';

type PreventionResponse = {
  multiplier?: string; // e.g. "1.3"
  direction?: string;  // "more" or "less"
  error?: string;
};

export default async function preventionRisk(
  req: NextApiRequest,
  res: NextApiResponse<PreventionResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }

  try {
    const { currentLifestyle, plannedLifestyle } = req.body;

    if (!currentLifestyle || !plannedLifestyle) {
      return res.status(400).json({
        error: 'Missing currentLifestyle or plannedLifestyle in request.',
      });
    }

    // Updated prompt to ask for the exact sentence:
    // "You are XX (more/less) likely to get diabetes after the proposed changes"
    const userPrompt = `
      You are a health expert. The user currently has these lifestyle factors:
      ${JSON.stringify(currentLifestyle)}

      They are considering a lifestyle change that might decrease OR possibly increase their risk of diabetes,
      specifically: ${JSON.stringify(plannedLifestyle)}

      Please estimate how many times more or less likely they are to get diabetes 
      compared to a person who does not adopt these changes.

      Return ONLY a single line in this exact format (no extra text):

      You are XX more likely to get diabetes after the proposed changes

      or

      You are XX less likely to get diabetes after the proposed changes

      Where XX is a numeric multiplier (e.g., 1.3). 
      If it’s less likely, use "less" in place of "more".
    `;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });

    // Use the Chat Completions endpoint for GPT-3.5-Turbo
    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful medical assistant focusing on diabetes risk prevention.',
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      max_tokens: 50,
      temperature: 0.7,
    });

    const text = chatResponse.choices?.[0]?.message?.content?.trim() ?? '';
    // Expecting something like:
    // "You are 1.3 more likely to get diabetes after the proposed changes"
    // or
    // "You are 0.8 less likely to get diabetes after the proposed changes"

    // Regex to parse the numeric multiplier and "more"/"less"
    // Example match groups:
    // match[1] = "1.3"
    // match[2] = "more" or "less"
    const match = text.match(
      /^You are\s+(\d+(\.\d+)?)\s+(more|less)\s+likely to get diabetes after the proposed changes$/i
    );

    if (!match) {
      return res.status(500).json({
        error: `GPT returned an unexpected format: "${text}". Please try again.`,
      });
    }

    const multiplier = match[1]; // e.g. "1.3"
    const direction = match[3].toLowerCase(); // "more" or "less"

    return res.status(200).json({ multiplier, direction });
  } catch (err: any) {
    console.error('OpenAI Error:', err?.message || err);
    return res.status(500).json({
      error: 'An error occurred while fetching risk multiplier.',
    });
  }
}
