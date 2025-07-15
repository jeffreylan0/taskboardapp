import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import prisma from '../../lib/prisma';
import { z } from 'zod';

// Define the schema for creating a task
const createTaskSchema = z.object({
  title: z.string().min(1, 'title is required').max(150),
  duration: z.number().int().positive('duration must be a positive number'),
});

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.id) {
    return res.status(401).json({ message: 'unauthorized' });
  }

  const userId = session.user.id;

  if (req.method === 'POST') {
    // Validate the request body against the schema
    const validation = createTaskSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'invalid request body', details: validation.error.flatten() });
    }

    // Use the validated data
    const { title, duration } = validation.data;

    const result = await prisma.task.create({
      data: {
        title: title,
        duration: duration,
        user: { connect: { id: userId } },
      },
    });
    return res.status(201).json(result);
  }

  if (req.method === 'GET') {
    const tasks = await prisma.task.findMany({ where: { userId: userId, completed: false }, orderBy: { createdAt: 'desc' } });
    const completedTasks = await prisma.task.findMany({ where: { userId: userId, completed: true }, orderBy: { createdAt: 'desc' } });
    return res.json({ active: tasks, completed: completedTasks });
  }

  if (req.method === 'PUT') {
    // ... (PUT logic remains the same)
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT']);
  res.status(405).end(`method ${req.method} not allowed`);
}
