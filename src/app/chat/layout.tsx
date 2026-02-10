import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'مساعد ريمو الذكي | Remo Store AI Assistant',
  description: 'تواصل مع مساعد ريمو الذكي للإجابة على جميع استفساراتك عن المنتجات، الأسعار، الشحن، والمزيد - متاح 24/7!',
  openGraph: {
    title: 'مساعد ريمو الذكي 🤖',
    description: 'للرد على كل استفساراتك بدون انتظار! اضغط هنا وتكلم مع مساعدنا الذكي',
    siteName: 'Remo Store',
    type: 'website',
    images: ['/logo.png'],
  },
}

export const viewport: Viewport = {
  themeColor: '#0d9488',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // No Header, no InstallPWA, no CustomerAssistant - clean chat experience
  return <>{children}</>
}
