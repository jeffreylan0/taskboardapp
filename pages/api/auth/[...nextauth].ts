import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '../../../lib/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'database',
  },
  events: {
    // This event is triggered when a new user is created in the database.
    createUser: async ({ user }) => {
      // Seed initial tasks for the new user
      if (user.id) {
        await prisma.task.createMany({
          data: [
            { title: "review project requirements", duration: 45, userId: user.id },
            { title: "plan the week ahead", duration: 30, userId: user.id },
            { title: "go for a 15-minute walk", duration: 15, userId: user.id },
          ],
        });
      }
    },
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.streak = user.streak;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
