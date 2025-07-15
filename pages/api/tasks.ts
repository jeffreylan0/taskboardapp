import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import prisma from '../../lib/prisma';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.id) {
    return res.status(401).json({ message: 'unauthorized' });
  }

  const userId = session.user.id;

  if (req.method === 'GET') {
    const tasks = await prisma.task.findMany({
      where: { userId: userId, completed: false },
      orderBy: { createdAt: 'desc' },
    });
    const completedTasks = await prisma.task.findMany({
      where: { userId: userId, completed: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ active: tasks, completed: completedTasks });
  } else if (req.method === 'POST') {
    const { title, duration } = req.body;
    const result = await prisma.task.create({
      data: {
        title: title,
        duration: parseInt(duration, 10),
        user: { connect: { id: userId } },
      },
    });
    res.status(201).json(result);
  } else if (req.method === 'PUT') {
    const { id, completed } = req.body;
    const updatedTask = await prisma.task.updateMany({
      where: { id: id, userId: userId },
      data: { completed: completed },
    });
    res.json(updatedTask);
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    res.status(405).end(`method ${req.method} not allowed`);
  }
}
