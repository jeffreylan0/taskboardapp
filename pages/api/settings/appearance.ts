import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';
import { z } from 'zod';

// Zod schema to validate the incoming request body
const appearanceSchema = z.object({
  theme: z.enum(['system', 'light', 'dark']).optional(),
  taskSpacing: z.enum(['default', 'compact', 'comfortable']).optional(),
});

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const userId = session.user.id;

  const validation = appearanceSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Invalid request body', details: validation.error.flatten() });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: validation.data,
    });
    return res.status(200).json({ success: true, user: { theme: updatedUser.theme, taskSpacing: updatedUser.taskSpacing } });
  } catch (error) {
    console.error('Failed to update appearance settings:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
