import { PrismaClient } from '@prisma/client'

// This setup prevents creating new Prisma Client instances during hot-reloading
// in development, which would exhaust the database connection limit.

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
