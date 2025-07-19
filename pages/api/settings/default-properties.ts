import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';
import { z } from 'zod';
import { propertyTypes } from '@/lib/constants';

// Zod schema for validating the structure of a property
const propertySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name cannot be empty'),
  type: z.enum(propertyTypes),
  options: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, 'Option name cannot be empty')
  })).optional(),
  value: z.any().optional(),
});

const updateDefaultPropertiesSchema = z.array(propertySchema);

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const userId = session.user.id;

  try {
    // GET: Fetch all default properties for the user
    if (req.method === 'GET') {
      const defaultProperties = await prisma.defaultProperty.findMany({
        where: { userId },
        orderBy: { order: 'asc' },
      });
      return res.status(200).json(defaultProperties);
    }
    // PUT: Replace the entire set of default properties
    else if (req.method === 'PUT') {
        const validation = updateDefaultPropertiesSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: 'Invalid request body', details: validation.error.flatten() });
        }
        const newProperties = validation.data;

        // Use a transaction to ensure atomicity: delete all old, then create all new
        await prisma.$transaction(async (tx) => {
            await tx.defaultProperty.deleteMany({ where: { userId } });

            if (newProperties.length > 0) {
                await tx.defaultProperty.createMany({
                    data: newProperties.map((prop, index) => ({
                        name: prop.name,
                        type: prop.type,
                        options: prop.options || [],
                        order: index,
                        userId,
                    })),
                });
            }
        });

        const updatedProperties = await prisma.defaultProperty.findMany({
            where: { userId },
            orderBy: { order: 'asc' },
        });

        return res.status(200).json(updatedProperties);
    }
    else {
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error handling default property request:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
