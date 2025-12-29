'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { translations } from '@/lib/i18n';
import { Quiz } from '@/types';
import { Copy, Eye, Plus, Trash2, Edit3, Loader2, BarChart3, Users, FileText, Calendar, Link as LinkIcon, Download, Clock, User as UserIcon, FileSpreadsheet } from 'lucide-react';

const MySwal = withReactContent(Swal);

export default function DashboardPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { language } = useUIStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const t = translations[language];
  const isRTL = language === 'ar';

  useEffect(() => {
    if (user?.role === 'student') {
      fetchSubmissions();
    } else {
      fetchQuizzes();
    }
  }, [user]);

  const fetchQuizzes = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/quiz/my-quizzes', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(t.dashboard.fetchError || 'Failed to fetch quizzes');
      }

      const data = await response.json();

      if (data.success) {
        setQuizzes(data.quizzes);
      } else {
        throw new Error(data.message || t.dashboard.fetchError || 'Failed to fetch quizzes');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t.dashboard.fetchError;
      setError(errorMessage);

      // إشعار SweetAlert عند وجود خطأ
      MySwal.fire({
        icon: 'error',
        title: <span className="text-red-600 dark:text-red-400">{t.common.error}</span>,
        text: errorMessage,
        confirmButtonText: t.common.ok,
        confirmButtonColor: 'var(--color-primary)',
        background: 'var(--color-card)',
        color: 'var(--color-foreground)',
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/submissions/my-submissions', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(t.dashboard.fetchError || 'Failed to fetch submissions');
      }

      const data = await response.json();

      if (data.success) {
        setSubmissions(data.submissions);
      } else {
        throw new Error(data.message || t.dashboard.fetchError || 'Failed to fetch submissions');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t.dashboard.fetchError;
      setError(errorMessage);

      MySwal.fire({
        icon: 'error',
        title: <span className="text-red-600 dark:text-red-400">{t.common.error}</span>,
        text: errorMessage,
        confirmButtonText: t.common.ok,
        confirmButtonColor: 'var(--color-primary)',
        background: 'var(--color-card)',
        color: 'var(--color-foreground)',
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyQuizLink = (quiz: Quiz) => {
    const link = `${window.location.origin}/quiz/${quiz.id}`;
    navigator.clipboard.writeText(link).then(() => {
      MySwal.fire({
        icon: 'success',
        title: <span className="text-primary dark:text-primary-light">
          {isRTL ? '✅ تم النسخ!' : '✅ Copied!'}
        </span>,
        html: (
          <div className="text-center">
            <p className="text-foreground dark:text-foreground mb-3">
              {isRTL ? 'تم نسخ رابط الاختبار بنجاح' : 'Quiz link copied successfully'}
            </p>
            <div className=" dark:bg-primary-dark p-3  rounded-lg">
              <code className="text-xl text-primary dark:text-primary-light break-all">
                {quiz.title}
              </code>
            </div>
            <p className="text-sm text-foreground/70 dark:text-foreground/70 mt-2">
              {isRTL ? 'يمكنك مشاركته مع الطلاب الآن' : 'You can now share it with students'}
            </p>
          </div>
        ),
        background: 'var(--color-card)',
        color: 'var(--color-foreground)',
        confirmButtonColor: 'var(--color-primary)',
        confirmButtonText: t.common.ok,
        timer: 2000,
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        }
      });
    }).catch(() => {
      MySwal.fire({
        icon: 'error',
        title: <span className="text-red-600 dark:text-red-400">{t.common.error}</span>,
        text: isRTL ? 'فشل في نسخ الرابط' : 'Failed to copy link',
        confirmButtonText: t.common.ok,
        confirmButtonColor: 'var(--color-primary)',
        color: 'var(--color-foreground)'
      });
    });
  };

  const deleteQuiz = async (quiz: Quiz) => {
    const result = await MySwal.fire({
      icon: 'warning',
      title: <span className="text-yellow-600 dark:text-yellow-400">
        {isRTL ? '⚠️ تأكيد الحذف' : '⚠️ Confirm Delete'}
      </span>,
      html: (
        <div className="text-center">
          <p className="text-foreground dark:text-foreground mb-2">
            {isRTL ? 'هل أنت متأكد من حذف هذا الاختبار؟' : 'Are you sure you want to delete this quiz?'}
          </p>
          <p className="text-lg font-semibold text-primary dark:text-primary-light">
            {quiz.title}
          </p>
          <p className="text-sm text-foreground/70 dark:text-foreground/70 mt-2">
            {isRTL
              ? `سيتم حذف ${quiz.questions.length} سؤال و${quiz.submissionsCount || 0} إجابة`
              : `This will delete ${quiz.questions.length} questions and ${quiz.submissionsCount || 0} submissions`
            }
          </p>
        </div>
      ),
      background: 'var(--color-card)',
      color: 'var(--color-foreground)',
      showCancelButton: true,
      confirmButtonText: isRTL ? 'نعم، احذف' : 'Yes, Delete',
      cancelButtonText: isRTL ? 'إلغاء' : 'Cancel',
      confirmButtonColor: 'var(--color-red-500)',
      cancelButtonColor: 'var(--color-muted)',
      reverseButtons: isRTL,
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      }
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/quiz/${quiz.id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        const data = await response.json();

        if (data.success) {
          setQuizzes(quizzes.filter((q) => q.id !== quiz.id));

          // إشعار النجاح
          MySwal.fire({
            icon: 'success',
            title: <span className="text-green-600 dark:text-green-400">
              {isRTL ? '✅ تم الحذف' : '✅ Deleted'}
            </span>,
            text: isRTL ? 'تم حذف الاختبار بنجاح' : 'Quiz deleted successfully',
            confirmButtonText: t.common.ok,
            confirmButtonColor: 'var(--color-primary)',
            background: 'var(--color-card)',
            color: 'var(--color-foreground)',
            timer: 1500,
            showClass: {
              popup: 'animate__animated animate__fadeInDown'
            }
          });
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        MySwal.fire({
          icon: 'error',
          title: <span className="text-red-600 dark:text-red-400">{t.common.error}</span>,
          text: error instanceof Error ? error.message : t.common.deleteError,
          confirmButtonText: t.common.ok,
          confirmButtonColor: 'var(--color-primary)',
          background: 'var(--color-card)',
          color: 'var(--color-foreground)'
        });
      }
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...(language === 'ar' ? { calendar: 'gregory' } : {})
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-foreground/70">{t.common.loading}...</p>
      </div>
    );
  }

  const isStudent = user?.role === 'student';

  return (
    <div className={`space-y-8 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            {isStudent ? (isRTL ? 'لوحة التحكم' : 'Dashboard') : t.dashboard.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <p className="text-lg text-foreground/80">
              {isStudent
                ? `${isRTL ? 'امتحاناتي' : 'My Submissions'} • ${submissions.length} ${isRTL ? 'تسليم' : 'submission'}${submissions.length !== 1 ? 's' : ''}`
                : `${t.dashboard.myQuizzes} • ${quizzes.length} ${quizzes.length === 1 ? t.dashboard.quiz : t.dashboard.quizzes}`
              }
            </p>
            {user && (
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {user.name || user.email}
              </span>
            )}
          </div>
        </div>

        {isStudent ? (
          <Link
            href="/profile"
            className="group inline-flex items-center gap-3 px-7 py-3.5 bg-linear-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:from-primary-hover hover:to-primary-dark transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/25 transform hover:scale-[1.02] active:scale-95"
          >
            <UserIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>{isRTL ? 'الملف الشخصي' : 'Profile'}</span>
          </Link>
        ) : (
          <Link
            href="/quiz/new"
            className="group inline-flex items-center gap-3 px-7 py-3.5 bg-linear-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:from-primary-hover hover:to-primary-dark transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/25 transform hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span>{t.dashboard.createNewQuiz}</span>
          </Link>
        )}
      </div>

      {isStudent ? (
        // Student submissions view
        submissions.length === 0 ? (
          <div className="bg-card rounded-3xl shadow-lg p-10 text-center border border-border/50">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-linear-to-br from-primary/20 to-primary-dark/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">
                {isRTL ? 'لا توجد تسليمات' : 'No Submissions Yet'}
              </h3>
              <p className="text-foreground/70 mb-8">
                {isRTL ? 'لم تقم بتسليم أي امتحانات بعد' : 'You haven\'t submitted any quizzes yet'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="group bg-card rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 hover:border-primary/30 p-6 md:p-8"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-6 flex-1">
                    <div className="shrink-0 w-20 h-20 bg-linear-to-br from-primary/20 to-primary-dark/20 rounded-xl flex items-center justify-center shadow-md">
                      <FileText className="w-10 h-10 text-primary" />
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl md:text-2xl font-semibold">
                          {submission.quiz.title}
                        </h3>
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                          {submission.quiz.questionsCount} {t.quiz.questions}
                        </span>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${submission.score >= 90 ? 'bg-green-500/20 text-green-700 dark:text-green-300' :
                          submission.score >= 70 ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300' :
                            submission.score >= 50 ? 'bg-orange-500/20 text-orange-700 dark:text-orange-300' :
                              'bg-red-500/20 text-red-700 dark:text-red-300'
                          }`}>
                          {submission.score}%
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-foreground/70">
                          <Calendar className="w-4 h-4" />
                          {formatDate(submission.submittedAt)}
                        </div>
                        {submission.timeSpent && (
                          <div className="flex items-center gap-2 text-foreground/70">
                            <Clock className="w-4 h-4" />
                            {Math.floor(submission.timeSpent / 60)}:{(submission.timeSpent % 60).toString().padStart(2, '0')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 justify-end">
                    <button
                      onClick={async () => {
                        try {
                          const ExcelJS = (await import('exceljs')).default;
                          const workbook = new ExcelJS.Workbook();
                          workbook.creator = isRTL ? 'نظام الاختبارات' : 'Quiz System';
                          workbook.created = new Date();

                          const worksheet = workbook.addWorksheet(isRTL ? 'النتيجة' : 'Result');

                          // Helper to strip HTML tags
                          const stripHtml = (html: string) => {
                            const tmp = document.createElement('DIV');
                            tmp.innerHTML = html;
                            return tmp.textContent || tmp.innerText || '';
                          };

                          // Header Info
                          worksheet.mergeCells('A1:D1');
                          const titleCell = worksheet.getCell('A1');
                          titleCell.value = submission.quiz.title;
                          titleCell.font = { size: 16, bold: true, color: { argb: 'FF2E5BFF' } };
                          titleCell.alignment = { horizontal: 'center' };

                          worksheet.addRow([isRTL ? 'الطالب:' : 'Student:', submission.studentName]);
                          worksheet.addRow([isRTL ? 'الدرجة:' : 'Score:', `${submission.score}%`]);
                          worksheet.addRow([isRTL ? 'التاريخ:' : 'Date:', formatDate(submission.submittedAt)]);
                          worksheet.addRow([]); // Gap

                          // Table Headers
                          const headers = isRTL
                            ? ['السؤال', 'إجابة الطالب', 'الإجابة الصحيحة', 'الحالة']
                            : ['Question', 'Student Answer', 'Correct Answer', 'Status'];

                          const headerRow = worksheet.addRow(headers);
                          headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                          headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E5BFF' } };
                          headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

                          // Data Rows
                          submission.quiz.questions?.forEach((q: any, idx: number) => {
                            const answerIdx = submission.answers?.[idx] ?? -1;
                            const studentAnswer = answerIdx >= 0 ? q.choices[answerIdx] : (isRTL ? 'لم يجب' : 'No Answer');
                            const correctAnswer = q.choices[q.correctAnswer];
                            const isCorrect = answerIdx === q.correctAnswer;

                            const row = worksheet.addRow([
                              stripHtml(q.questionText),
                              studentAnswer,
                              correctAnswer,
                              isCorrect ? (isRTL ? 'صحيح' : 'Correct') : (isRTL ? 'خطأ' : 'Incorrect')
                            ]);

                            const statusCell = row.getCell(4);
                            statusCell.font = { color: { argb: isCorrect ? 'FF00A859' : 'FFF44336' }, bold: true };
                          });

                          // Columns Width
                          worksheet.getColumn(1).width = 40;
                          worksheet.getColumn(2).width = 25;
                          worksheet.getColumn(3).width = 25;
                          worksheet.getColumn(4).width = 15;

                          // Borders
                          worksheet.eachRow((row, rowNumber) => {
                            if (rowNumber > 5) {
                              row.eachCell((cell) => {
                                cell.border = {
                                  top: { style: 'thin' },
                                  left: { style: 'thin' },
                                  bottom: { style: 'thin' },
                                  right: { style: 'thin' },
                                };
                                cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                              });
                            }
                          });

                          const buffer = await workbook.xlsx.writeBuffer();
                          const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `result-${submission.quiz.title}.xlsx`;
                          a.click();
                          window.URL.revokeObjectURL(url);
                        } catch (error) {
                          console.error('Excel export error:', error);
                          alert(isRTL ? 'فشل التصدير' : 'Export failed');
                        }
                      }}
                      className="group flex items-center gap-2 px-5 py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 rounded-xl transition-all duration-200 hover:shadow-md"
                      title={isRTL ? 'تحميل Excel' : 'Download Excel'}
                    >
                      <FileSpreadsheet className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="hidden sm:inline">Excel</span>
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          const jsPDF = (await import('jspdf')).default;
                          const autoTable = (await import('jspdf-autotable')).default;

                          const doc = new jsPDF();

                          // Load Arabic Font (Amiri)
                          try {
                            const fontUrl = 'https://raw.githubusercontent.com/google/fonts/main/ofl/amiri/Amiri-Regular.ttf';
                            const response = await fetch(fontUrl);
                            const blob = await response.blob();
                            const reader = new FileReader();

                            await new Promise((resolve) => {
                              reader.onloadend = () => {
                                const base64data = reader.result?.toString().split(',')[1];
                                if (base64data) {
                                  doc.addFileToVFS('Amiri-Regular.ttf', base64data);
                                  doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
                                  doc.setFont('Amiri');
                                }
                                resolve(true);
                              };
                              reader.readAsDataURL(blob);
                            });
                          } catch (e) {
                            console.error('Failed to load Arabic font', e);
                          }

                          // Header
                          doc.setFontSize(18);
                          doc.setTextColor(46, 91, 255);
                          doc.setFont('Amiri', 'normal'); // Apply font

                          const titleAlign = isRTL ? 'right' : 'center';
                          const titleX = isRTL ? 200 : 105;
                          doc.text(submission.quiz.title, titleX, 20, { align: titleAlign }); // Simple RTL alignment attempt

                          doc.setFontSize(12);
                          doc.setTextColor(0);


                          const startX = isRTL ? 190 : 14;
                          const align = isRTL ? 'right' : 'left';

                          doc.text(`${isRTL ? 'الطالب' : 'Student'}: ${submission.studentName}`, startX, 30, { align });
                          doc.text(`${isRTL ? 'الدرجة' : 'Score'}: ${submission.score}%`, startX, 38, { align });
                          doc.text(`${isRTL ? 'التاريخ' : 'Date'}: ${formatDate(submission.submittedAt)}`, startX, 46, { align });

                          // Map Questions
                          const questions = submission.quiz.questions || [];
                          const tableData = questions.map((q: any, idx: number) => {
                            const answerIdx = submission.answers?.[idx] ?? -1;
                            const studentAnswer = answerIdx >= 0 ? q.choices[answerIdx] : (isRTL ? '--' : '--');
                            const isCorrect = answerIdx === q.correctAnswer;

                            return [
                              q.questionText,
                              studentAnswer,
                              isCorrect ? (isRTL ? 'صحيح' : 'Correct') : (isRTL ? 'خطأ' : 'Incorrect')
                            ];
                          });

                          autoTable(doc, {
                            startY: 55,
                            head: [[
                              isRTL ? 'السؤال' : 'Question',
                              isRTL ? 'إجابة الطالب' : 'Student Answer',
                              isRTL ? 'الحالة' : 'Status'
                            ]],
                            body: tableData,
                            headStyles: {
                              fillColor: [46, 91, 255],
                              font: 'Amiri', // Use Arabic font in header
                              halign: isRTL ? 'right' : 'left'
                            },
                            styles: {
                              font: 'Amiri', // Use Arabic font in body
                              halign: isRTL ? 'right' : 'left',
                              overflow: 'linebreak'
                            },
                            columnStyles: {
                              0: { cellWidth: 80 }, // Question
                              1: { cellWidth: 60 }, // Answer
                              2: { cellWidth: 40 }  // Status
                            }
                          });

                          doc.save(`result-${submission.quiz.title}.pdf`);
                        } catch (error) {
                          console.error('PDF export error:', error);
                          alert(isRTL ? 'فشل التصدير' : 'Export failed');
                        }
                      }}
                      className="group flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl transition-all duration-200 hover:shadow-md"
                      title={isRTL ? 'تحميل PDF' : 'Download PDF'}
                    >
                      <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="hidden sm:inline">PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        quizzes.length === 0 ? (
          <div className="bg-card rounded-3xl shadow-lg p-10 text-center border border-border/50">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-linear-to-br from-primary/20 to-primary-dark/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">
                {t.dashboard.noQuizzes}
              </h3>
              <p className="text-foreground/70 mb-8">
                {t.dashboard.createFirstQuizDesc}
              </p>
              <Link
                href="/quiz/new"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-linear-to-r from-primary to-primary-dark text-white rounded-xl hover:from-primary-hover hover:to-primary-dark transition-all shadow-lg hover:shadow-xl hover:shadow-primary/30"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                <span>{t.dashboard.createNewQuiz}</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="group bg-card rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 hover:border-primary/30 p-6 md:p-8"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-6 flex-1">
                    {quiz.thumbnail ? (
                      <div className="shrink-0">
                        <img
                          src={quiz.thumbnail}
                          alt={quiz.displayName || quiz.title}
                          className="w-20 h-20 object-cover rounded-xl shadow-md"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="shrink-0 w-20 h-20 bg-linear-to-br from-primary/20 to-primary-dark/20 rounded-xl flex items-center justify-center shadow-md">
                        <FileText className="w-10 h-10 text-primary" />
                      </div>
                    )}

                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl md:text-2xl font-semibold">
                          {quiz.title}
                        </h3>
                        {quiz.creatorName && (
                          <span className="px-3 py-1 bg-muted text-foreground/70 rounded-full text-sm">
                            {isRTL ? 'بواسطة' : 'by'} {quiz.creatorName}
                          </span>
                        )}
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                          {quiz.questions.length} {t.quiz.questions}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm">

                        <div className="flex items-center gap-2 text-foreground/70">
                          <Calendar className="w-4 h-4" />
                          {formatDate(quiz.createdAt)}
                        </div>
                        {quiz.updatedAt && (
                          <div className="flex items-center gap-2 text-foreground/70 text-xs">
                            <span>🔄</span>
                            {isRTL ? 'محدث' : 'Updated'} {formatDate(quiz.updatedAt)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 justify-end">
                    <button
                      onClick={() => copyQuizLink(quiz)}
                      className="group flex items-center gap-2 px-5 py-2.5 bg-muted/50 hover:bg-muted rounded-xl transition-all duration-200 text-foreground/90  hover:shadow-md"
                      title={isRTL ? 'نسخ رابط الاختبار' : 'Copy quiz link'}
                    >
                      <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="hidden sm:inline">{t.dashboard.copyLink}</span>
                    </button>

                    <Link
                      href={`/quiz/${quiz.id}/submissions`}
                      className="group flex items-center gap-2 px-5 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all duration-200 hover:shadow-md"
                    >
                      <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="hidden sm:inline">{t.dashboard.viewSubmissions}</span>
                    </Link>

                    <Link
                      href={`/quiz/${quiz.id}/edit`}
                      className="group flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl transition-all duration-200 hover:shadow-md"
                    >
                      <Edit3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="hidden sm:inline">{t.common.edit}</span>
                    </Link>

                    <button
                      onClick={() => deleteQuiz(quiz)}
                      className="group flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl transition-all duration-200 hover:shadow-md"
                    >
                      <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="hidden sm:inline">{t.common.delete}</span>
                    </button>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="mt-6 pt-6 border-t border-border/50 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-linear-to-br from-primary/5 to-transparent dark: rounded-2xl">
                    <div className="text-2xl font-bold flex items-center justify-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      {quiz.submissionsCount || 0}
                    </div>
                    <div className="text-sm text-foreground/70 mt-2">{t.dashboard.submissions}</div>
                  </div>
                  <div className="text-center p-4 bg-linear-to-br from-green-500/5 to-transparent rounded-2xl">
                    <div className="text-2xl font-bold flex items-center justify-center gap-2">
                      <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      {quiz.averageScore ? `${quiz.averageScore}%` : '--'}
                    </div>
                    <div className="text-sm text-foreground/70 mt-2">{t.dashboard.avgScore}</div>
                  </div>
                  <div className="text-center p-4 bg-linear-to-br from-purple-500/5 to-transparent rounded-2xl">
                    <div className="text-2xl font-bold">{quiz.questions.length}</div>
                    <div className="text-sm text-foreground/70 mt-2">{t.quiz.questions}</div>
                  </div>
                  <div className="text-center p-4 bg-linear-to-br from-yellow-500/5 to-transparent rounded-2xl">
                    <div className="text-2xl font-bold">
                      {quiz.timeLimit ? `${quiz.timeLimit} ${t.quiz.minutes}` : '∞'}
                    </div>
                    <div className="text-sm text-foreground/70 mt-2">{t.dashboard.timeLimit}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )
      }

      {/* Stats Summary */}
      {
        !isStudent && quizzes.length > 0 && (
          <div className="bg-card rounded-3xl shadow-lg p-8 border border-border/50">
            <h3 className="text-2xl font-semibold mb-8 text-center md:text-left">
              {t.dashboard.summary}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-linear-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20">
                <div className="text-3xl font-bold text-primary">{quizzes.length}</div>
                <div className="text-sm text-foreground/70 mt-2">{t.dashboard.totalQuizzes}</div>
              </div>
              <div className="text-center p-6 bg-linear-to-br from-green-500/10 to-green-500/5 rounded-2xl border border-green-500/20">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {quizzes.reduce((sum, q) => sum + q.questions.length, 0)}
                </div>
                <div className="text-sm text-foreground/70 mt-2">{t.dashboard.totalQuestions}</div>
              </div>
              <div className="text-center p-6 bg-linear-to-br from-purple-500/10 to-purple-500/5 rounded-2xl border border-purple-500/20">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {quizzes.reduce((sum, q) => sum + (q.submissionsCount || 0), 0)}
                </div>
                <div className="text-sm text-foreground/70 mt-2">{t.dashboard.totalSubmissions}</div>
              </div>
              <div className="text-center p-6 bg-linear-to-br from-yellow-500/10 to-yellow-500/5 rounded-2xl border border-yellow-500/20">
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {quizzes.filter((q) => (q.submissionsCount || 0) > 0).length}
                </div>
                <div className="text-sm text-foreground/70 mt-2">{t.dashboard.activeQuizzes}</div>
              </div>
            </div>
          </div>
        )
      }

      {/* Tips */}
      <div className="bg-linear-to-r from-primary/5 to-primary-dark/5 rounded-3xl p-6 border border-primary/20">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            <span className="text-primary">💡</span>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">
              {isRTL ? 'نصائح سريعة' : 'Quick Tips'}
            </h4>
            <ul className="space-y-2 text-foreground/70">
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                {isRTL
                  ? 'انقر على أيقونة النسخ لمشاركة رابط الاختبار مع الطلاب'
                  : 'Click the copy icon to share quiz link with students'
                }
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                {isRTL
                  ? 'يمكنك تعديل الاختبار في أي وقت عن طريق زر التعديل'
                  : 'You can edit the quiz anytime using the edit button'
                }
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                {isRTL
                  ? 'عرض الإجابات لرؤية أداء الطلاب وتحليل النتائج'
                  : 'View submissions to see student performance and analyze results'
                }
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div >
  );
}
