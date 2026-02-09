"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Users, 
  Search, 
  Filter,
  ArrowLeft,
  Mail,
  Calendar,
  Shield,
  ShoppingBag,
  UserX,
  CheckCircle
} from "lucide-react"
import Link from "next/link"

interface User {
  id: string
  name: string | null
  email: string | null
  role: string
  createdAt: string
  _count?: {
    orders: number
  }
}

export default function DeveloperUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("ALL")

  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/auth/login")
      return
    }

    if (session.user.role !== "DEVELOPER") {
      router.push("/")
      return
    }
  }, [session, status, router])

  useEffect(() => {
    if (session?.user.role === "DEVELOPER") {
      fetchUsers()
    }
  }, [session])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/developer/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // Filter by role
    if (roleFilter !== "ALL") {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredUsers(filtered)
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      ADMIN: "bg-red-500/20 text-red-400 border-red-500/30",
      DEVELOPER: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      VENDOR: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      CUSTOMER: "bg-green-500/20 text-green-400 border-green-500/30",
      MARKETING_STAFF: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    }

    const labels = {
      ADMIN: "مدير",
      DEVELOPER: "مطور",
      VENDOR: "شريك بائع",
      CUSTOMER: "عميل",
      MARKETING_STAFF: "تسويق",
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs border ${styles[role as keyof typeof styles] || 'bg-gray-500/20 text-gray-400'}`}>
        {labels[role as keyof typeof labels] || role}
      </span>
    )
  }

  const getStats = () => {
    return {
      total: users.length,
      customers: users.filter(u => u.role === "CUSTOMER").length,
      vendors: users.filter(u => u.role === "VENDOR").length,
      admins: users.filter(u => u.role === "ADMIN").length,
      developers: users.filter(u => u.role === "DEVELOPER").length,
      marketing: users.filter(u => u.role === "MARKETING_STAFF").length,
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!session || session.user.role !== "DEVELOPER") {
    return null
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Link href="/developer">
            <Button variant="outline" size="icon" className="bg-gray-800 border-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              👥 إدارة المستخدمين
            </h1>
            <p className="text-gray-400">عرض وإدارة جميع المستخدمين في النظام</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-400">{stats.total}</p>
              <p className="text-xs text-gray-400">إجمالي</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-500/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{stats.customers}</p>
              <p className="text-xs text-gray-400">عملاء</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-400">{stats.vendors}</p>
              <p className="text-xs text-gray-400">شركاء</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-900/50 to-red-800/30 border-red-500/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-400">{stats.admins}</p>
              <p className="text-xs text-gray-400">مديرين</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-400">{stats.developers}</p>
              <p className="text-xs text-gray-400">مطورين</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border-yellow-500/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400">{stats.marketing}</p>
              <p className="text-xs text-gray-400">تسويق</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="بحث بالاسم أو البريد الإلكتروني..."
                    className="pr-10 bg-gray-800 border-gray-700"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={roleFilter === "ALL" ? "default" : "outline"}
                  onClick={() => setRoleFilter("ALL")}
                  className={roleFilter === "ALL" ? "bg-purple-600" : "bg-gray-800 border-gray-700"}
                >
                  الكل
                </Button>
                <Button
                  variant={roleFilter === "CUSTOMER" ? "default" : "outline"}
                  onClick={() => setRoleFilter("CUSTOMER")}
                  className={roleFilter === "CUSTOMER" ? "bg-green-600" : "bg-gray-800 border-gray-700"}
                >
                  عملاء
                </Button>
                <Button
                  variant={roleFilter === "VENDOR" ? "default" : "outline"}
                  onClick={() => setRoleFilter("VENDOR")}
                  className={roleFilter === "VENDOR" ? "bg-blue-600" : "bg-gray-800 border-gray-700"}
                >
                  شركاء
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-500" />
              قائمة المستخدمين ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <UserX className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>لا يوجد مستخدمين</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-purple-500/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                            {user.name?.charAt(0) || user.email?.charAt(0) || "?"}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{user.name || "بدون اسم"}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Mail className="w-4 h-4" />
                              <span>{user.email || "بدون بريد"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Shield className="w-4 h-4 text-gray-400" />
                            {getRoleBadge(user.role)}
                          </div>
                          
                          <div className="flex items-center gap-1 text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(user.createdAt).toLocaleDateString('ar-EG')}</span>
                          </div>

                          {user._count && (
                            <div className="flex items-center gap-1 text-gray-400">
                              <ShoppingBag className="w-4 h-4" />
                              <span>{user._count.orders} طلب</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
