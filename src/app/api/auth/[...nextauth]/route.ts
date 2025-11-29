import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // This is a MOCK implementation for the MVP/Prototype
                // In a real app, verify password hash
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                if (user) {
                    return user;
                }

                // If user doesn't exist, create one for testing (Auto-signup)
                // This is ONLY for the prototype to make it easy to test
                const newUser = await prisma.user.create({
                    data: {
                        email: credentials.email,
                        name: credentials.email.split('@')[0],
                        role: "CREATOR", // Default to creator
                    }
                });

                return newUser;
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
                // @ts-ignore
                session.user.role = token.role;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
                // @ts-ignore
                token.role = user.role;
            }
            return token;
        }
    },
    pages: {
        signIn: '/login',
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
