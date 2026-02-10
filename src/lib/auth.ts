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
        console.log('🆕 ========== CREATE USER EVENT ==========');
        console.log('Email:', user.email);
        console.log('Name:', user.name);
        console.log('Current Role:', user.role);
        
        // ⚠️ IMPORTANT: المستخدمين الجدد من Google يكونوا CUSTOMER دائماً
        // فقط المطور يقدر يعمل VENDOR accounts يدوياً
        if (user.id && !user.role) {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: 'CUSTOMER' }
          });
          console.log('✅ New user assigned CUSTOMER role:', user.email);
        }
        console.log('🆕 ========== END CREATE USER ==========\n');
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
        console.log('🔐 ========== SignIn Callback START ==========');
        console.log('Provider:', account?.provider);
        console.log('User Email:', user.email);
        console.log('User Name:', user.name);
        console.log('User Image:', user.image);
        console.log('Account:', account);
        console.log('Profile:', profile);
        
        // التحقق من وجود email
        if (!user.email) {
          console.error('❌ No email provided - BLOCKING SIGNIN');
          return false;
        }
        
        // للمستخدمين من Google
        if (account?.provider === "google") {
          console.log('🔵 Google OAuth detected');
          
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: {
              accounts: true, // جلب الـ accounts المرتبطة
            }
          });
          
          if (existingUser) {
            console.log('✅ Existing user found:', {
              id: existingUser.id,
              name: existingUser.name,
              email: existingUser.email,
              role: existingUser.role,
              accountsCount: existingUser.accounts.length
            });
            console.log('ℹ️  User will keep existing role:', existingUser.role);
            
            // 🔗 التحقق من وجود Google Account
            const googleAccount = existingUser.accounts.find(
              (acc) => acc.provider === "google"
            );

            if (!googleAccount && account) {
              console.log('🔗 Google Account not linked - Linking now...');
              // ربط الـ Google Account باليوزر الموجود
              try {
                await prisma.account.create({
                  data: {
                    userId: existingUser.id,
                    type: account.type || "oauth",
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    access_token: account.access_token,
                    expires_at: account.expires_at,
                    refresh_token: account.refresh_token,
                    id_token: account.id_token,
                    scope: account.scope,
                    token_type: account.token_type,
                  },
                });
                console.log('✅ Google Account linked successfully!');
              } catch (linkError) {
                console.error('❌ Failed to link Google Account:', linkError);
                // لا تمنع تسجيل الدخول - NextAuth سيتعامل معه
                return false;
              }
            } else if (googleAccount) {
              console.log('✅ Google Account already linked');
            }
            
            // إذا المستخدم موجود لكن ليس لديه role، اجعله CUSTOMER
            if (!existingUser.role) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { role: "CUSTOMER" }
              });
              console.log('🆕 Assigned CUSTOMER role to existing user without role:', user.email);
            }
          } else {
            console.log('🆕 ========== NEW GOOGLE USER ==========');
            console.log('Email:', user.email);
            console.log('Name:', user.name);
            console.log('⚠️  Will be created by PrismaAdapter → createUser event → CUSTOMER role');
            console.log('ℹ️  Only developer can manually create VENDOR accounts');
            console.log('🆕 ========== END NEW GOOGLE USER ==========');
          }
        }
        
        console.log('✅ SignIn callback returning TRUE - allowing signin');
        console.log('🔐 ========== SignIn Callback END ==========');
        return true;
      } catch (error) {
        console.error('❌ ========== ERROR in signIn callback ==========');
        console.error('Error:', error);
        console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
        console.error('❌ ========== END ERROR ==========');
        // في حالة الخطأ، نرفض تسجيل الدخول
        return false;
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
            
            // ⚠️ PROTECTION: إذا المستخدم من Google وليس لديه role، اجعله CUSTOMER
            if (!dbUser.role && account?.provider === "google") {
              await prisma.user.update({
                where: { id: token.id as string },
                data: { role: "CUSTOMER" }
              });
              token.role = "CUSTOMER";
              console.log('🛡️  PROTECTION: New Google user forced to CUSTOMER role');
            } else if (dbUser.role) {
              console.log('✅ User has existing role:', dbUser.role, '- Keeping it');
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
          if (vendor && vendor.businessType) {
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
      console.log('🔄 ========== Redirect Callback START ==========');
      console.log('URL:', url);
      console.log('BaseURL:', baseUrl);
      
      // تجاوز أي redirect لو كان فيه "error"
      if (url.includes('error=')) {
        console.log('⚠️ Error detected in redirect URL:', url);
        console.log('🏠 Redirecting to home page');
        return baseUrl;
      }
      
      // إذا كان URL يبدأ بـ baseUrl، استخدمه كما هو
      if (url.startsWith(baseUrl)) {
        console.log('✅ URL starts with baseUrl - using as is:', url);
        console.log('🔄 ========== Redirect Callback END ==========');
        return url;
      }
      
      // إذا كان callbackUrl محدد كمسار نسبي
      if (url.startsWith('/')) {
        const fullUrl = `${baseUrl}${url}`;
        console.log('✅ Relative path detected - converting to full URL:', fullUrl);
        console.log('🔄 ========== Redirect Callback END ==========');
        return fullUrl;
      }
      
      // إذا كان URL خارجي (Google OAuth redirect)
      if (url.startsWith('http')) {
        try {
          const urlObj = new URL(url);
          console.log('🌐 External URL detected - Origin:', urlObj.origin);
          // إذا كان من نفس الـ origin
          if (urlObj.origin === baseUrl) {
            console.log('✅ Same origin - allowing redirect:', url);
            console.log('🔄 ========== Redirect Callback END ==========');
            return url;
          }
          console.log('⚠️ Different origin - redirecting to baseUrl instead');
        } catch (e) {
          console.error('❌ Error parsing URL:', e);
        }
      }
      
      // التوجيه الافتراضي إلى الصفحة الرئيسية
      console.log('🏠 Default redirect to baseUrl:', baseUrl);
      console.log('🔄 ========== Redirect Callback END ==========');
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
