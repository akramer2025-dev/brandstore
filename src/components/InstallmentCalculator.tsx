'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

interface InstallmentCalculatorProps {
  totalAmount: number
  onSelect?: (plan: InstallmentPlan) => void
}

interface InstallmentPlan {
  months: 4 | 6 | 12 | 24
  downPaymentPercentage: number
  interestRate: number
  downPayment: number
  monthlyAmount: number
  totalWithInterest: number
  totalInterest: number
}

const installmentPlans = {
  4: { downPayment: 0.25, interestRate: 0.05 }, // 25% دفعة مقدمة، 5% فائدة
  6: { downPayment: 0.20, interestRate: 0.08 }, // 20% دفعة مقدمة، 8% فائدة
  12: { downPayment: 0.15, interestRate: 0.12 }, // 15% دفعة مقدمة، 12% فائدة
  24: { downPayment: 0.10, interestRate: 0.18 }, // 10% دفعة مقدمة، 18% فائدة
}

export default function InstallmentCalculator({
  totalAmount,
  onSelect,
}: InstallmentCalculatorProps) {
  const [selectedMonths, setSelectedMonths] = useState<4 | 6 | 12 | 24>(4)
  const [calculations, setCalculations] = useState<Record<number, InstallmentPlan>>({})

  useEffect(() => {
    const newCalculations: Record<number, InstallmentPlan> = {}

    Object.entries(installmentPlans).forEach(([months, rates]) => {
      const monthsNum = parseInt(months) as 4 | 6 | 12 | 24
      const downPayment = totalAmount * rates.downPayment
      const remainingAmount = totalAmount - downPayment
      const totalWithInterest = remainingAmount * (1 + rates.interestRate)
      const monthlyAmount = totalWithInterest / monthsNum
      const totalInterest = totalWithInterest - remainingAmount

      newCalculations[monthsNum] = {
        months: monthsNum,
        downPaymentPercentage: rates.downPayment * 100,
        interestRate: rates.interestRate * 100,
        downPayment,
        monthlyAmount,
        totalWithInterest: downPayment + totalWithInterest,
        totalInterest,
      }
    })

    setCalculations(newCalculations)
  }, [totalAmount])

  const handleSelectPlan = (plan: InstallmentPlan) => {
    setSelectedMonths(plan.months)
    onSelect?.(plan)
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          💳 خطط الدفع بالتقسيط
        </h3>
        <p className="text-gray-700">
          المبلغ الإجمالي: <span className="font-bold text-2xl">{totalAmount.toFixed(2)}</span> ج.م
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.values(calculations).map((plan) => (
          <Card
            key={plan.months}
            className={`p-6 cursor-pointer transition-all hover:shadow-xl border-2 ${
              selectedMonths === plan.months
                ? 'border-purple-600 bg-purple-50 shadow-lg'
                : 'border-gray-200 hover:border-purple-300'
            }`}
            onClick={() => handleSelectPlan(plan)}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-2xl font-bold text-gray-900">
                {plan.months} شهر
              </h4>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedMonths === plan.months
                    ? 'border-purple-600 bg-purple-600'
                    : 'border-gray-300'
                }`}
              >
                {selectedMonths === plan.months && (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <span className="text-gray-600">دفعة مقدمة ({plan.downPaymentPercentage}%)</span>
                <span className="font-bold text-lg text-purple-600">
                  {plan.downPayment.toFixed(2)} ج.م
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <span className="text-gray-600">قسط شهري</span>
                <span className="font-bold text-xl text-green-600">
                  {plan.monthlyAmount.toFixed(2)} ج.م
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-gray-600">نسبة الفائدة</span>
                <span className="font-semibold text-orange-600">
                  {plan.interestRate}%
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">إجمالي الفائدة</span>
                <span className="font-semibold text-gray-700">
                  {plan.totalInterest.toFixed(2)} ج.م
                </span>
              </div>

              <div className="border-t-2 border-dashed pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-semibold">المبلغ النهائي</span>
                  <span className="font-bold text-2xl text-gray-900">
                    {plan.totalWithInterest.toFixed(2)} ج.م
                  </span>
                </div>
              </div>
            </div>

            {selectedMonths === plan.months && (
              <div className="mt-4 p-3 bg-purple-600 text-white rounded-lg text-center font-semibold">
                ✓ الخطة المختارة
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded">
        <p className="text-sm text-blue-800">
          <strong>ملاحظة:</strong> يتم دفع المقدم عند الطلب، ثم الأقساط الشهرية في مواعيدها المحددة.
          عدم السداد في الموعد قد يؤدي إلى تعليق الخدمة.
        </p>
      </div>
    </div>
  )
}
