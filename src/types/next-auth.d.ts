import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      vendorType?: string
      username?: string
      phone?: string
    } & DefaultSession["user"]
  }

  interface User {
    role: string
    vendorType?: string
    username?: string
    phone?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    vendorType?: string
  }
}
