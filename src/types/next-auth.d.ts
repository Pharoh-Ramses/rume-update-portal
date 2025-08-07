import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      needsPasswordSetup?: boolean;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    needsPasswordSetup?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    needsPasswordSetup?: boolean;
  }
}