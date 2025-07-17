import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import prisma from '../../lib/prisma';
import { z } from 'zod';

// --- Manual Type Definition to Bypass Build Error ---
const propertyTypes = ["TEXT", "NUMBER", "CHECKBOX", "SELECT", "MULTI_SELECT", "DATE", "URL", "EMAIL", "PHONE"] as const;
type PropertyType = typeof propertyTypes[number];

// --- Zod Schemas for Input Validation ---
const propertySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(propertyTypes), // Use the manually defined types for validation
  value: z.any(),
});

const createTaskSchema = z.object({
  title: z.string().min(1, 'title is required').max(150),
  duration: z.number().int().positive(),
  properties: z.array(propertySchema).optional(),
});

const updateTaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(150).optional(),
  duration: z.number().int().positive().optional(),
  completed: z.boolean().optional(),
  properties: z.array(propertySchema).optional(),
});


// --- Helper Functions for Streak Calculation ---
function areConsecutiveDays(date1: Date, date2: Date): boolean {
  const oneDay = 24 * 60 * 60 * 1000;
  const d1 = new Date(date1.toDateString());
  const d2 = new Date(date2.toDateString());
  return d1.getTime() - d2.getTime() === oneDay;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString();
}


// --- Main API Route Handler ---
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const userId = session.user.id;

  // --- GET a user's tasks ---
  if (req.method === 'GET') {
    const activeTasks = await prisma.task.findMany({
      where: { userId: userId, completed: false },
      orderBy: { createdAt: 'desc' },
    });
    const completedTasks = await prisma.task.findMany({
      where: { userId: userId, completed: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ active: activeTasks, completed: completedTasks });
  }

  // --- POST a new task ---
  if (req.method === 'POST') {
    const validation = createTaskSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'invalid request body', details: validation.error.flatten() });
    }
    const { title, duration, properties } = validation.data;
    const result = await prisma.task.create({
      data: { title, duration, properties, user: { connect: { id: userId } } },
    });
    return res.status(201).json(result);
  }

  // --- PUT (edit OR complete) a task ---
  if (req.method === 'PUT') {
    const validation = updateTaskSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'invalid request body', details: validation.error.flatten() });
    }
    const { id, title, duration, completed, properties } = validation.data;

    const task = await prisma.task.findFirst({ where: { id, userId } });
    if (!task) {
      return res.status(404).json({ message: 'Task not found or you do not have permission' });
    }

    if (completed === true) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return res.status(404).json({ message: 'User not found' });

      let newStreak = user.streak;
      const today = new Date();
      if (user.lastCompletedAt) {
        if (areConsecutiveDays(today, user.lastCompletedAt)) newStreak++;
        else if (!isSameDay(today, user.lastCompletedAt)) newStreak = 1;
      } else {
        newStreak = 1;
      }

      await prisma.user.update({ where: { id: userId }, data: { streak: newStreak, lastCompletedAt: today } });
      const updatedTask = await prisma.task.update({ where: { id }, data: { completed: true } });
      return res.status(200).json(updatedTask);
    }

    const updatedTask = await prisma.task.update({
      where: { id: id },
      data: { title, duration, completed, properties },
    });
    return res.status(200).json(updatedTask);
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
