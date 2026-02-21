import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { BookOpen, Clock, CheckCircle2, PlayCircle, Award, Target, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface PageProps {
  params: Promise<{ lectureId: string }>;
}

export default async function LectureDetailPage({ params }: PageProps) {
  const session = await auth();
  const { lectureId } = await params;

  if (!session || session.user?.role !== 'MARKETING_STAFF') {
    redirect('/auth/login');
  }

  const staff = await prisma.marketingStaff.findFirst({
    where: { userId: session.user.id },
  });

  if (!staff) {
    return <div className="p-8 text-center">موظف التسويق غير موجود</div>;
  }

  // Get lecture with progress
  const lecture = await prisma.marketingLecture.findUnique({
    where: { id: lectureId },
    include: {
      progress: {
        where: { staffId: staff.id }
      },
      assignments: {
        where: { status: 'ACTIVE' },
        include: {
          submissions: {
            where: { staffId: staff.id }
          }
        }
      }
    }
  });

  if (!lecture) {
    notFound();
  }

  const progress = lecture.progress[0];
  const progressPercent = progress?.progressPercentage || 0;
  const isCompleted = progress?.isCompleted || false;

  // Safe array access
  const quizLength = Array.isArray(lecture.quiz) ? lecture.quiz.length : 0;
  const topicsLength = Array.isArray(lecture.topics) ? lecture.topics.length : 0;
  const objectives = Array.isArray(lecture.learningObjectives) ? lecture.learningObjectives : [];
  const topics = Array.isArray(lecture.topics) ? lecture.topics : [];
  const quiz = Array.isArray(lecture.quiz) ? lecture.quiz : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/marketing-staff/training/lectures"
            className="text-purple-300 hover:text-purple-200 mb-4 inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة لقائمة المحاضرات
          </Link>
          
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  الأسبوع {lecture.week}
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  {lecture.level === 'BEGINNER' ? 'مبتدئ' : lecture.level === 'INTERMEDIATE' ? 'متوسط' : 'متقدم'}
                </Badge>
                {isCompleted && (
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    مكتمل
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">{lecture.title}</h1>
              {lecture.description && (
                <p className="text-purple-200 text-lg">{lecture.description}</p>
              )}
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-6 mt-4 text-purple-200">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {lecture.duration} دقيقة
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {topicsLength} موضوع
            </div>
            {quizLength > 0 && (
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                {quizLength} سؤال
              </div>
            )}
          </div>

          {/* Progress */}
          {progressPercent > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-purple-200">التقدم الكلي</span>
                <span className="text-white font-semibold">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-3" />
            </div>
          )}
        </div>

        {/* Learning Objectives */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-6 w-6 text-purple-300" />
              الأهداف التعليمية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {objectives.map((objective, idx) => (
                <li key={idx} className="flex items-start gap-3 text-purple-100">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-300 text-sm font-semibold">{idx + 1}</span>
                  </div>
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Topics */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-300" />
              المواضيع ({topicsLength})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topics.map((topic, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-300 font-bold">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-1">{topic.title}</h4>
                      {topic.duration && (
                        <div className="flex items-center gap-2 text-sm text-purple-300">
                          <Clock className="h-4 w-4" />
                          {topic.duration} دقائق
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quiz */}
        {quizLength > 0 && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="h-6 w-6 text-yellow-300" />
                الاختبار ({quizLength} سؤال)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quiz.map((question: any, idx) => (
                  <div 
                    key={idx}
                    className="p-4 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-yellow-300 font-bold">{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium mb-2">{question.question}</p>
                        <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                          {question.type === 'MULTIPLE_CHOICE' ? 'اختيار من متعدد' : 
                           question.type === 'TEXT' ? 'نص' :
                           question.type === 'ORDERING' ? 'ترتيب' : 'مقال'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {progress?.quizScore !== undefined && progress.quizScore > 0 && (
                <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="flex items-center gap-3">
                    <Award className="h-8 w-8 text-green-300" />
                    <div>
                      <p className="text-white font-semibold">درجتك في الاختبار</p>
                      <p className="text-green-300 text-2xl font-bold">{progress.quizScore}%</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Assignments */}
        {lecture.assignments.length > 0 && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                📝 الواجبات ({lecture.assignments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lecture.assignments.map((assignment) => {
                  const submission = assignment.submissions[0];
                  const isSubmitted = !!submission;
                  
                  return (
                    <Link 
                      key={assignment.id}
                      href={`/marketing-staff/training/assignments/${assignment.id}`}
                    >
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="text-white font-semibold mb-1">{assignment.title}</h4>
                            <p className="text-purple-200 text-sm mb-2">{assignment.description}</p>
                            <div className="flex items-center gap-3 text-sm">
                              <Badge className="bg-purple-500/20 text-purple-300">
                                {assignment.totalPoints} نقطة
                              </Badge>
                              {assignment.dueDate && (
                                <span className="text-purple-300">
                                  الموعد: {new Date(assignment.dueDate).toLocaleDateString('ar-EG')}
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge className={
                            isSubmitted
                              ? submission.status === 'GRADED'
                                ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                              : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                          }>
                            {isSubmitted 
                              ? submission.status === 'GRADED' 
                                ? `تم التقييم (${submission.score}/${assignment.totalPoints})`
                                : 'تم التسليم'
                              : 'معلق'
                            }
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Button */}
        <div className="flex gap-4">
          <Button 
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 text-lg"
            onClick={() => {/* Start lecture */}}
          >
            <PlayCircle className="h-6 w-6 mr-2" />
            {isCompleted ? 'مراجعة المحاضرة' : progressPercent > 0 ? 'متابعة المحاضرة' : 'بدء المحاضرة'}
          </Button>
        </div>
      </div>
    </div>
  );
}
