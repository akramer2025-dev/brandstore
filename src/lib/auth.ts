import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  debug: process.env.NODE_ENV === 'development',
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username ?? undefined,
          phone: user.phone ?? undefined,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // إذا كان تسجيل دخول بـ Google
      if (account?.provider === "google") {
        try {
          // البحث عن المستخدم
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          // إذا كان مستخدم جديد، قم بإنشائه كعميل
          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || "",
                image: user.image || null,
                role: "CUSTOMER", // العملاء الجدد من Google يكونون CUSTOMER
                emailVerified: new Date(),
              },
            });
          }
        } catch (error) {
          console.error("Error in Google sign in:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.username = user.username;
        token.phone = user.phone;
      }
      
      // جلب الـ role من قاعدة البيانات للتأكد
      if (token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true }
          });
          if (dbUser) {
            token.role = dbUser.role;
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      }
      
      // جلب vendor type من قاعدة البيانات
      if (token.id && token.role === 'VENDOR') {
        try {
          const vendor = await prisma.vendor.findUnique({
            where: { userId: token.id as string },
            select: { businessType: true }
          });
          if (vendor) {
            token.vendorType = vendor.businessType;
          }
        } catch (error) {
          console.error('Error fetching vendor:', error);
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.sub as string;
        session.user.username = token.username as string;
        session.user.phone = token.phone as string;
        if (token.vendorType) {
          session.user.vendorType = token.vendorType as string;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
});
