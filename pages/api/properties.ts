import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import prisma from '../../lib/prisma';
import { z } from 'zod';
import { PropertyType } from '@prisma/client';

const createPropertySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  type: z.nativeEnum(PropertyType),
});

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const userId = session.user.id;

  if (req.method === 'GET') {
    const properties = await prisma.property.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
    return res.status(200).json(properties);
  }

  if (req.method === 'POST') {
    const validation = createPropertySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid request body', details: validation.error.flatten() });
    }
    const { name, type } = validation.data;

    const newProperty = await prisma.property.create({
      data: { name, type, userId },
    });
    return res.status(201).json(newProperty);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
