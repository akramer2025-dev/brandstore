import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, FileText, Award, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PageProps {
  params: Promise<{ assignmentId: string }>;
}

export default async function AssignmentDetailPage({ params }: PageProps) {
  const session = await auth();
  const { assignmentId } = await params;

  if (!session || session.user?.role !== 'MARKETING_STAFF') {
    redirect('/auth/login');
  }

  const staff = await prisma.marketingStaff.findFirst({
    where: { userId: session.user.id },
  });

  if (!staff) {
    return <div className="p-8 text-center">موظف التسويق غير موجود</div>;
  }

  // Get assignment with submission
  const assignment = await prisma.marketingAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      lecture: true,
      submissions: {
        where: { staffId: staff.id }
      }
    }
  });

  if (!assignment) {
    notFound();
  }

  const submission = assignment.submissions[0];
  const isSubmitted = !!submission;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/marketing-staff/training"
            className="text-purple-300 hover:text-purple-200 mb-4 inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة للوحة التدريب
          </Link>
          
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{assignment.title}</h1>
              {assignment.lecture && (
                <Link 
                  href={`/marketing-staff/training/lectures/${assignment.lecture.id}`}
                  className="text-purple-300 hover:text-purple-200 text-sm"
                >
                  المحاضرة: {assignment.lecture.title}
                </Link>
              )}
            </div>
            
            <Badge className={
              isSubmitted
                ? submission.status === 'GRADED'
                  ? 'bg-green-500/20 text-green-300 border-green-500/30 text-lg px-4 py-2'
                  : 'bg-blue-500/20 text-blue-300 border-blue-500/30 text-lg px-4 py-2'
                : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-lg px-4 py-2'
            }>
              {isSubmitted 
                ? submission.status === 'GRADED' 
                  ? `تم التقييم: ${submission.score}/${assignment.totalPoints}`
                  : 'تم التسليم'
                : 'معلق'
              }
            </Badge>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-6 text-purple-200">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              {assignment.totalPoints} نقطة
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {assignment.type === 'INDIVIDUAL_ANALYSIS' ? 'تحليل فردي' : 
               assignment.type === 'CAMPAIGN_PLAN' ? 'خطة حملة' :
               assignment.type === 'SWOT_ANALYSIS' ? 'تحليل SWOT' : 'إنشاء محتوى'}
            </div>
            {assignment.dueDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                الموعد: {new Date(assignment.dueDate).toLocaleDateString('ar-EG')}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white">تفاصيل الواجب</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-100 whitespace-pre-wrap">{assignment.description}</p>
          </CardContent>
        </Card>

        {/* Instructions */}
        {assignment.instructions && assignment.instructions.length > 0 && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                📋 التعليمات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {assignment.instructions.map((instruction, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-purple-100">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-purple-300 text-sm font-semibold">{idx + 1}</span>
                    </div>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Rubric */}
        {assignment.rubric && assignment.rubric.length > 0 && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="h-6 w-6 text-yellow-300" />
                معايير التقييم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assignment.rubric.map((criterion: any, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">{criterion.name}</h4>
                        <p className="text-purple-200 text-sm">{criterion.description}</p>
                      </div>
                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                        {criterion.maxPoints} نقطة
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submission */}
        {isSubmitted ? (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-300" />
                تسليمك
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-purple-200 text-sm mb-2">المحتوى المُسلّم:</p>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-white whitespace-pre-wrap">{submission.content}</p>
                </div>
              </div>

              {submission.attachmentUrl && (
                <div>
                  <p className="text-purple-200 text-sm mb-2">المرفقات:</p>
                  <a 
                    href={submission.attachmentUrl} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-300 hover:text-blue-200 underline"
                  >
                    عرض المرفق
                  </a>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-purple-300">
                <Clock className="h-4 w-4" />
                تم التسليم: {new Date(submission.submittedAt).toLocaleString('ar-EG')}
              </div>

              {submission.status === 'GRADED' && (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="flex items-start gap-3 mb-3">
                    <Award className="h-6 w-6 text-green-300 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-white font-semibold mb-1">النتيجة</p>
                      <p className="text-green-300 text-2xl font-bold">
                        {submission.score} / {assignment.totalPoints}
                      </p>
                    </div>
                  </div>
                  
                  {submission.feedback && (
                    <div className="mt-4 pt-4 border-t border-green-500/20">
                      <p className="text-purple-200 text-sm mb-2">ملاحظات المدرب:</p>
                      <p className="text-white">{submission.feedback}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
            <CardContent className="p-8 text-center">
              <FileText className="h-16 w-16 text-purple-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">جاهز للتسليم؟</h3>
              <p className="text-purple-200 mb-6">
                اقرأ التعليمات جيداً ثم قم بإعداد إجابتك وفقاً لمعايير التقييم
              </p>
              <Button 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg"
              >
                بدء العمل على الواجب
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
