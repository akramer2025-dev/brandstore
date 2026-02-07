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
  
  events: {
    async createUser({ user }) {
      try {
        console.log('🆕 Event: createUser -', user.email);
        
        // إذا المستخدم جديد، اجعله CUSTOMER افتراضياً
        if (user.id && !user.role) {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: 'CUSTOMER' }
          });
          console.log('✅ Assigned CUSTOMER role to new user:', user.email);
        }
      } catch (error) {
        console.error('❌ Error in createUser event:', error);
      }
    },
    async signIn({ user, account, isNewUser }) {
      console.log('🎉 Event: signIn - User:', user.email, 'Provider:', account?.provider, 'New User:', isNewUser);
    },
    async session({ session, token }) {
      console.log('📝 Event: session - User:', session.user?.email, 'Role:', session.user?.role);
    },
  },
  
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
      try {
        console.log('🔐 SignIn callback - Provider:', account?.provider, 'Email:', user.email);
        
        // للمستخدمين الجدد من Google
        if (account?.provider === "google" && user.email) {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true, role: true, name: true }
          });
          
          if (existingUser) {
            console.log('👤 Existing user found:', existingUser.name, 'Role:', existingUser.role);
            
            // إذا المستخدم موجود لكن ليس لديه role، اجعله CUSTOMER
            if (!existingUser.role) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { role: "CUSTOMER" }
              });
              console.log('✅ تم تعيين role CUSTOMER للمستخدم:', user.email);
            }
          } else {
            console.log('🆕 New user from Google, will be created as CUSTOMER by adapter');
          }
        }
        return true;
      } catch (error) {
        console.error('❌ خطأ في signIn callback:', error);
        return true; // السماح بالدخول حتى لو حصل خطأ
      }
    },
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.role = user.role || "CUSTOMER";
        token.id = user.id;
        token.username = user.username;
        token.phone = user.phone;
        console.log('🎫 JWT created for user:', user.email, 'Role:', token.role);
      }
      
      // جلب الـ role من قاعدة البيانات للتأكد (خاصة للمستخدمين من Google)
      if (token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, name: true }
          });
          
          if (dbUser) {
            // تحديث الـrole في token
            token.role = dbUser.role;
            console.log('✅ JWT updated from DB - User:', dbUser.name, 'Role:', dbUser.role);
            
            // إذا المستخدم جديد من Google وليس لديه role، اجعله CUSTOMER
            if (!dbUser.role && account?.provider === "google") {
              await prisma.user.update({
                where: { id: token.id as string },
                data: { role: "CUSTOMER" }
              });
              token.role = "CUSTOMER";
              console.log('🆕 New Google user assigned CUSTOMER role');
            }
          }
        } catch (error) {
          console.error('❌ Error fetching user role:', error);
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
    async redirect({ url, baseUrl }) {
      console.log('🔄 Redirect callback - URL:', url, 'BaseURL:', baseUrl);
      
      // إذا كان URL يبدأ بـ baseUrl، استخدمه كما هو
      if (url.startsWith(baseUrl)) {
        console.log('✅ Redirecting to:', url);
        return url;
      }
      
      // إذا كان callbackUrl محدد كمسار نسبي
      if (url.startsWith('/')) {
        const fullUrl = `${baseUrl}${url}`;
        console.log('✅ Redirecting to relative path:', fullUrl);
        return fullUrl;
      }
      
      // التوجيه الافتراضي إلى الصفحة الرئيسية
      console.log('✅ Redirecting to baseUrl:', baseUrl);
      return baseUrl;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
});
