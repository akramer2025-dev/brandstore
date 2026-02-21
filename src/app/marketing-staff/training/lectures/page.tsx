import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { BookOpen, Clock, CheckCircle2, PlayCircle, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default async function LecturesPage() {
  const session = await auth();

  if (!session || session.user?.role !== 'MARKETING_STAFF') {
    redirect('/auth/login');
  }

  const staff = await prisma.marketingStaff.findFirst({
    where: { userId: session.user.id },
  });

  if (!staff) {
    return <div className="p-8 text-center">موظف التسويق غير موجود</div>;
  }

  // Get all lectures with progress
  const lectures = await prisma.marketingLecture.findMany({
    where: { isPublished: true },
    orderBy: [{ week: 'asc' }, { orderIndex: 'asc' }],
    include: {
      progress: {
        where: { staffId: staff.id }
      },
      assignments: {
        where: { status: 'ACTIVE' }
      }
    }
  });

  // Group by week
  const lecturesByWeek = lectures.reduce((acc, lecture) => {
    const week = lecture.week;
    if (!acc[week]) acc[week] = [];
    acc[week].push(lecture);
    return acc;
  }, {} as Record<number, typeof lectures>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/marketing-staff/training"
            className="text-purple-300 hover:text-purple-200 mb-4 inline-block"
          >
            ← العودة للوحة التدريب
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">📚 المحاضرات التدريبية</h1>
          <p className="text-purple-200">برنامج تدريب Media Buyer - من الصفر للاحتراف</p>
        </div>

        {/* Lectures by Week */}
        {Object.entries(lecturesByWeek).map(([week, weekLectures]) => (
          <div key={week} className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                {week}
              </div>
              الأسبوع {week}
            </h2>

            <div className="grid gap-6">
              {weekLectures.map((lecture) => {
                const progress = lecture.progress[0];
                const progressPercent = progress?.progressPercentage || 0;
                const isCompleted = progress?.isCompleted || false;
                const quizScore = progress?.quizScore || 0;
                const quizLength = Array.isArray(lecture.quiz) ? lecture.quiz.length : 0;
                const topicsLength = Array.isArray(lecture.topics) ? lecture.topics.length : 0;
                const objectives = Array.isArray(lecture.learningObjectives) ? lecture.learningObjectives : [];

                return (
                  <Link 
                    key={lecture.id} 
                    href={`/marketing-staff/training/lectures/${lecture.id}`}
                  >
                    <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isCompleted 
                              ? 'bg-green-500/20 text-green-300' 
                              : progressPercent > 0 
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-purple-500/20 text-purple-300'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle2 className="h-8 w-8" />
                            ) : progressPercent > 0 ? (
                              <PlayCircle className="h-8 w-8" />
                            ) : (
                              <BookOpen className="h-8 w-8" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div>
                                <h3 className="text-xl font-bold text-white mb-1">
                                  {lecture.title}
                                </h3>
                                {lecture.description && (
                                  <p className="text-purple-200 text-sm line-clamp-2">
                                    {lecture.description}
                                  </p>
                                )}
                              </div>
                              
                              {/* Status Badge */}
                              <Badge 
                                variant={isCompleted ? 'default' : progressPercent > 0 ? 'secondary' : 'outline'}
                                className={
                                  isCompleted 
                                    ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                    : progressPercent > 0
                                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                    : 'bg-white/10 text-white border-white/20'
                                }
                              >
                                {isCompleted ? 'مكتمل' : progressPercent > 0 ? 'جاري' : 'جديد'}
                              </Badge>
                            </div>

                            {/* Meta Info */}
                            <div className="flex items-center gap-6 text-sm text-purple-200 mb-3">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {lecture.duration} دقيقة
                              </div>
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                {topicsLength} موضوع
                              </div>
                              {quizLength > 0 && (
                                <div className="flex items-center gap-2">
                                  <Award className="h-4 w-4" />
                                  {quizLength} سؤال
                                </div>
                              )}
                              {lecture.assignments.length > 0 && (
                                <div className="flex items-center gap-2 text-yellow-300">
                                  📝 {lecture.assignments.length} واجب
                                </div>
                              )}
                            </div>

                            {/* Progress Bar */}
                            {progressPercent > 0 && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-purple-200">التقدم</span>
                                  <span className="text-white font-semibold">{progressPercent}%</span>
                                </div>
                                <Progress value={progressPercent} className="h-2" />
                                
                                {quizScore > 0 && (
                                  <div className="text-sm text-green-300 flex items-center gap-2">
                                    <Award className="h-4 w-4" />
                                    درجة الاختبار: {quizScore}%
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Learning Objectives Preview */}
                            {objectives.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-white/10">
                                <p className="text-xs text-purple-300 mb-2">الأهداف التعليمية:</p>
                                <ul className="text-xs text-purple-200 space-y-1">
                                  {objectives.slice(0, 2).map((obj, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <span className="text-purple-400">•</span>
                                      <span>{obj}</span>
                                    </li>
                                  ))}
                                  {objectives.length > 2 && (
                                    <li className="text-purple-400">
                                      +{objectives.length - 2} المزيد...
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {lectures.length === 0 && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-purple-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">لا توجد محاضرات متاحة حالياً</h3>
              <p className="text-purple-200">سيتم إضافة المحاضرات قريباً</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
