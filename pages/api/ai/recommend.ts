import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Rate Limiter: Allows 5 requests per user per 10 seconds.
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '10 s'),
  analytics: true,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

async function getGeminiRecommendation(title: string): Promise<{ duration: number; confidence: number }> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const prompt = `Given the task title "${title}", estimate the time in minutes it would take to complete. Return ONLY a valid JSON object with two keys: "duration" (an integer, e.g., 15, 30, 45) and "confidence" (a float between 0 and 1). Example: {"duration": 45, "confidence": 0.8}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini API Error:', error);
    return { duration: 30, confidence: 0.5 };
  }
}

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ message: 'unauthorized' });
  }

  // Rate limit the user based on their unique ID.
  const { success } = await ratelimit.limit(session.user.id);
  if (!success) {
    return res.status(429).json({ message: 'too many requests' });
  }

  if (req.method === 'POST') {
    const { title } = req.body;
    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      return res.status(400).json({ message: 'a valid title is required' });
    }
    const recommendation = await getGeminiRecommendation(title.trim());
    res.status(200).json(recommendation);
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`method ${req.method} not allowed`);
  }
}
