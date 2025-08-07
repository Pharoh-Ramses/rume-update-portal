import { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getPatientByEmail, getPatientById, getMagicLinkByToken, markMagicLinkAsUsed, logPatientAction } from '@/lib/db/queries';
import bcrypt from 'bcryptjs';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.needsPasswordSetup = user.needsPasswordSetup;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.needsPasswordSetup = token.needsPasswordSetup as boolean | undefined;
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      id: 'magic-link',
      name: 'Magic Link',
      credentials: {
        token: { label: 'Token', type: 'text' },
      },
      async authorize(credentials) {
        console.log('🔍 Magic link authorize called with:', credentials);
        
        if (!credentials?.token) {
          console.log('❌ No token provided');
          return null;
        }

        try {
          console.log('🔍 Looking up magic link token:', credentials.token);
          
          // Verify magic link token
          const magicLink = await getMagicLinkByToken(credentials.token as string);
          console.log('🔍 Magic link result:', magicLink);
          
          if (!magicLink) {
            console.log('❌ Magic link not found');
            return null;
          }

          // Check if token is expired
          const now = new Date();
          const isExpired = now > magicLink.expiresAt;
          console.log('🔍 Expiration check:', { now, expiresAt: magicLink.expiresAt, isExpired });
          
          if (isExpired) {
            console.log('❌ Magic link expired');
            return null;
          }

          // Check if token is already used
          if (magicLink.used) {
            console.log('❌ Magic link already used');
            return null;
          }

          // Get patient
          console.log('🔍 Looking up patient:', magicLink.patientId);
          const patient = await getPatientById(magicLink.patientId);
          console.log('🔍 Patient result:', patient);
          
          if (!patient) {
            console.log('❌ Patient not found');
            return null;
          }

          // Mark magic link as used
          console.log('✅ Marking magic link as used');
          await markMagicLinkAsUsed(credentials.token as string);

          // Log the login action
          await logPatientAction(patient.id, 'magic_link_login', `Used token: ${credentials.token}`);

          const user = {
            id: patient.id,
            email: patient.email,
            name: `${patient.firstName} ${patient.lastName}`,
            needsPasswordSetup: !patient.passwordHash,
          };
          
          console.log('✅ Magic link authorization successful:', user);
          return user;
        } catch (error) {
          console.error('❌ Magic link authorization error:', error);
          return null;
        }
      },
    }),
    CredentialsProvider({
      id: 'credentials',
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const patient = await getPatientByEmail(credentials.email as string);
          if (!patient || !patient.passwordHash) return null;

          const isValidPassword = await bcrypt.compare(
            credentials.password as string,
            patient.passwordHash
          );

          if (!isValidPassword) return null;

          // Log the login action
          await logPatientAction(patient.id, 'password_login', 'Successful login');

          return {
            id: patient.id,
            email: patient.email,
            name: `${patient.firstName} ${patient.lastName}`,
            needsPasswordSetup: false,
          };
        } catch (error) {
          console.error('Credentials authorization error:', error);
          return null;
        }
      },
    }),
  ],
};