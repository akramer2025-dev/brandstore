import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { BookOpen, Target, CheckCircle2, Clock, Award, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default async function TrainingPage() {
  const session = await auth();

  if (!session || session.user?.role !== 'MARKETING_STAFF') {
    redirect('/auth/login');
  }

  // Get marketing staff
  const staff = await prisma.marketingStaff.findFirst({
    where: { userId: session.user.id },
  });

  if (!staff) {
    return <div>موظف التسويق غير موجود</div>;
  }

  // Get all lectures
  const lectures = await prisma.marketingLecture.findMany({
    where: { isPublished: true },
    orderBy: [{ week: 'asc' }, { orderIndex: 'asc' }],
    include: {
      progress: {
        where: { staffId: staff.id }
      },
      assignments: true
    }
  });

  // Get progress stats
  const totalLectures = lectures.length;
  const completedLectures = lectures.filter(l => l.progress[0]?.isCompleted).length;
  const progressPercentage = totalLectures > 0 ? (completedLectures / totalLectures) * 100 : 0;

  // Get assignments
  const assignments = await prisma.marketingAssignment.findMany({
    where: {
      OR: [
        { staffId: staff.id },
        { staffId: null }  // Public assignments
      ],
      status: 'ACTIVE'
    },
    include: {
      submissions: {
        where: { staffId: staff.id }
      },
      lecture: true
    },
    orderBy: { dueDate: 'asc' }
  });

  const pendingAssignments = assignments.filter(a => !a.submissions.length);

  // Calculate total time spent
  const totalTimeSpent = lectures.reduce((sum, lecture) => {
    return sum + (lecture.progress[0]?.timeSpent || 0);
  }, 0);

  // Calculate average quiz score
  const quizScores = lectures
    .filter(l => l.progress[0]?.quizScore !== null)
    .map(l => l.progress[0]?.quizScore || 0);
  const averageScore = quizScores.length > 0
    ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">🎓 مركز التدريب التسويقي</h1>
          <p className="text-purple-100 text-lg">من الصفر للاحتراف - دورة رمضان 2026</p>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <span>👤 {staff.name}</span>
            <span>📧 {staff.email}</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">
              💼 Media Buyer
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-8 h-8" />
                <div>
                  <p className="text-sm opacity-90">المحاضرات المكتملة</p>
                  <p className="text-3xl font-bold">{completedLectures}/{totalLectures}</p>
                </div>
              </div>
              <Progress value={progressPercentage} className="h-2 bg-blue-300" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8" />
                <div>
                  <p className="text-sm opacity-90"> الواجبات المعلقة</p>
                  <p className="text-3xl font-bold">{pendingAssignments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8" />
                <div>
                  <p className="text-sm opacity-90">الوقت المستغرق</p>
                  <p className="text-3xl font-bold">{Math.floor(totalTimeSpent / 60)}h</p>
                  <p className="text-xs opacity-75">{totalTimeSpent % 60} دقيقة</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8" />
                <div>
                  <p className="text-sm opacity-90">متوسط الدرجات</p>
                  <p className="text-3xl font-bold">{averageScore.toFixed(0)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/marketing-staff/training/lectures">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-purple-200 hover:border-purple-400">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">المحاضرات</h3>
                    <p className="text-sm text-gray-600">استعرض وتعلم</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/marketing-staff/training/assignments">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-green-200 hover:border-green-400">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">الواجبات</h3>
                    <p className="text-sm text-gray-600">{pendingAssignments.length} معلق</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/marketing-staff/tools">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-200 hover:border-blue-400">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">الأدوات</h3>
                    <p className="text-sm text-gray-600">SWOT, Funnel, 4Ps</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Lectures List */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">📚 المحاضرات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lectures.map((lecture) => {
                const progress = lecture.progress[0];
                const isCompleted = progress?.isCompleted || false;
                const quizPassed = progress?.quizPassed || false;

                return (
                  <Link
                    key={lecture.id}
                    href={`/marketing-staff/training/lectures/${lecture.id}`}
                  >
                    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-purple-300">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                              الأسبوع {lecture.week}
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {lecture.level === 'BEGINNER' ? 'مبتدئ' : lecture.level === 'INTERMEDIATE' ? 'متوسط' : 'متقدم'}
                            </span>
                            {isCompleted && (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            )}
                          </div>
                          <h3 className="font-bold text-lg">{lecture.titleAr}</h3>
                          <p className="text-sm text-gray-600">{lecture.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>⏱ {lecture.duration} دقيقة</span>
                            {lecture.hasQuiz && <span>📝 اختبار</span>}
                            {lecture.assignments.length > 0 && (
                              <span>✏️ {lecture.assignments.length} واجب</span>
                            )}
                          </div>
                        </div>
                        {progress && (
                          <div className="text-left min-w-[100px]">
                            <div className="text-sm font-medium text-gray-700">
                              التقدم: {progress.progress}%
                            </div>
                            {progress.quizScore !== null && (
                              <div className={`text-sm ${quizPassed ? 'text-green-600' : 'text-orange-600'}`}>
                                الدرجة: {progress.quizScore}%
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {progress && progress.progress > 0 && progress.progress < 100 && (
                        <Progress value={progress.progress} className="h-2" />
                      )}
                    </div>
                  </Link>
                );
              })}

              {lectures.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>لا توجد محاضرات متاحة حالياً</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Assignments */}
        {pendingAssignments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">✏️ الواجبات المعلقة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingAssignments.map((assignment) => (
                  <Link
                    key={assignment.id}
                    href={`/marketing-staff/training/assignments/${assignment.id}`}
                  >
                    <div className="border border-orange-200 bg-orange-50 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold">{assignment.titleAr}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {assignment.description.substring(0, 100)}...
                          </p>
                          {assignment.lecture && (
                            <p className="text-xs text-purple-600 mt-2">
                              📚 {assignment.lecture.titleAr}
                            </p>
                          )}
                        </div>
                        {assignment.dueDate && (
                          <div className="text-left">
                            <span className="text-xs text-orange-600 font-medium">
                              📅 {new Date(assignment.dueDate).toLocaleDateString('ar-EG')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
