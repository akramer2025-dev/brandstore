'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'

export default function VendorRegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    storeName: '',
    storeNameAr: '',
    phone: '',
    address: '',
    city: '',
    description: '',
    descriptionAr: '',
    bankName: '',
    accountNumber: '',
    iban: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/vendor-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'فشل التسجيل')
      }

      alert('تم التسجيل بنجاح! سيتم مراجعة طلبك والموافقة عليه قريباً')
      router.push('/auth/login')
    } catch (error: any) {
      setError(error.message || 'حدث خطأ ما')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8 bg-white p-8 rounded-xl shadow-2xl">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity group">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-2xl border-2 border-purple-200 transition-all duration-300 group-hover:scale-110">
              <img 
                src="/logo.png?v=2026" 
                alt="BS Brand Store" 
                className="w-20 h-20 rounded-full object-contain drop-shadow-lg"
              />
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                براند ستور
              </h1>
              <p className="text-sm text-gray-600">منصة البائعين</p>
            </div>
          </Link>
          
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
            انضم كبائع
          </h2>
          <p className="text-gray-600">
            سجل متجرك وابدأ البيع على منصتنا
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* معلومات الحساب */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-xl font-bold text-gray-900 border-b pb-2">
                معلومات الحساب
              </h3>
            </div>

            <div>
              <Label htmlFor="email">البريد الإلكتروني *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1"
                placeholder="vendor@example.com"
              />
            </div>

            <div>
              <Label htmlFor="username">اسم المستخدم *</Label>
              <Input
                id="username"
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="mt-1"
                placeholder="vendor_username"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="password">كلمة المرور *</Label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            {/* معلومات المتجر */}
            <div className="space-y-4 md:col-span-2 mt-6">
              <h3 className="text-xl font-bold text-gray-900 border-b pb-2">
                معلومات المتجر
              </h3>
            </div>

            <div>
              <Label htmlFor="storeName">اسم المتجر (English) *</Label>
              <Input
                id="storeName"
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="mt-1"
                placeholder="My Store"
              />
            </div>

            <div>
              <Label htmlFor="storeNameAr">اسم المتجر (العربية) *</Label>
              <Input
                id="storeNameAr"
                type="text"
                required
                value={formData.storeNameAr}
                onChange={(e) => setFormData({ ...formData, storeNameAr: e.target.value })}
                className="mt-1"
                placeholder="متجري"
              />
            </div>

            <div>
              <Label htmlFor="phone">رقم الهاتف *</Label>
              <Input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1"
                placeholder="+20 100 000 0000"
              />
            </div>

            <div>
              <Label htmlFor="city">المدينة *</Label>
              <Input
                id="city"
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="mt-1"
                placeholder="القاهرة"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address">العنوان الكامل *</Label>
              <Textarea
                id="address"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-1"
                placeholder="العنوان التفصيلي للمتجر"
                rows={2}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">وصف المتجر (English)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1"
                placeholder="Describe your store..."
                rows={3}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="descriptionAr">وصف المتجر (العربية)</Label>
              <Textarea
                id="descriptionAr"
                value={formData.descriptionAr}
                onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                className="mt-1"
                placeholder="صف متجرك..."
                rows={3}
              />
            </div>

            {/* معلومات البنك */}
            <div className="space-y-4 md:col-span-2 mt-6">
              <h3 className="text-xl font-bold text-gray-900 border-b pb-2">
                معلومات البنك (للمدفوعات)
              </h3>
            </div>

            <div>
              <Label htmlFor="bankName">اسم البنك *</Label>
              <Input
                id="bankName"
                type="text"
                required
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="mt-1"
                placeholder="البنك الأهلي المصري"
              />
            </div>

            <div>
              <Label htmlFor="accountNumber">رقم الحساب *</Label>
              <Input
                id="accountNumber"
                type="text"
                required
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                className="mt-1"
                placeholder="123456789"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="iban">IBAN (اختياري)</Label>
              <Input
                id="iban"
                type="text"
                value={formData.iban}
                onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                className="mt-1"
                placeholder="EG123456789012345678901234"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-6">
            <Link
              href="/auth/login"
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              لديك حساب بالفعل؟ تسجيل الدخول
            </Link>

            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8"
            >
              {loading ? 'جاري التسجيل...' : 'تسجيل كبائع'}
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            * سيتم مراجعة طلبك والموافقة عليه من قبل الإدارة قبل تفعيل حسابك
          </p>
        </form>
      </div>
    </div>
  )
}
