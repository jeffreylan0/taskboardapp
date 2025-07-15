import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  /**
   * Extends the default User model to include our custom fields.
   */
  interface User extends DefaultUser {
    streak: number;
  }

  /**
   * Extends the default Session to include our custom fields on the user object.
   */
  interface Session {
    user?: {
      id: string;
      streak: number;
    } & DefaultSession['user'];
  }
}
