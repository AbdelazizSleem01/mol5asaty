'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';
import { translations } from '@/lib/i18n';
import { ResultsTable } from '@/components/quiz/ResultsTable';
import { Download, ArrowLeft, BarChart2, X, Loader2, Check } from 'lucide-react';
import { Submission, Quiz, Question } from '@/types';

export default function QuizSubmissionsPage() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [pageSize] = useState(10);

  const params = useParams();
  const router = useRouter();
  const { language } = useUIStore();
  const t = translations[language];
  const isArabic = language === 'ar';

  const fetchQuizData = useCallback(async () => {
    try {
      const quizRes = await fetch(`/api/quiz/${params.slug}`);
      const quizData = await quizRes.json();
      if (quizData.success) setQuiz(quizData.quiz);
    } catch (error) { 
      console.error('Failed to fetch quiz data:', error); 
    }
  }, [params.slug]);

  const fetchSubmissions = useCallback(async () => {
    try {
      setIsLoading(true);
      const submissionsRes = await fetch(`/api/quiz/${params.slug}/submissions?page=${currentPage}&limit=${pageSize}`);
      const submissionsData = await submissionsRes.json();

      if (submissionsData.success) {
        setSubmissions(submissionsData.submissions);
        setTotalPages(submissionsData.pagination.totalPages);
        setTotalSubmissions(submissionsData.pagination.totalSubmissions);
      }

      if (allSubmissions.length === 0) {
        const allSubmissionsRes = await fetch(`/api/quiz/${params.slug}/submissions?page=1&limit=10000`);
        const allSubmissionsData = await allSubmissionsRes.json();
        if (allSubmissionsData.success) {
          setAllSubmissions(allSubmissionsData.submissions);
        }
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [params.slug, currentPage, pageSize, allSubmissions.length]);

  useEffect(() => {
    fetchQuizData();
  }, [fetchQuizData]);

  useEffect(() => {
    if (quiz) {
      fetchSubmissions();
    }
  }, [fetchSubmissions, quiz]);

  const downloadExcel = async () => {
    try {
      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();

      workbook.creator = isArabic ? 'نظام الاختبارات' : 'Quiz System';
      workbook.lastModifiedBy = isArabic ? 'نظام الاختبارات' : 'Quiz System';
      workbook.created = new Date();
      workbook.modified = new Date();

      const worksheet = workbook.addWorksheet(isArabic ? 'التسليمات' : 'Submissions');

      const columnsConfig = isArabic
        ? [
          { header: 'م', key: 'index', width: 8 },
          { header: 'اسم الطالب', key: 'name', width: 35 },
          { header: 'الدرجة الكلية', key: 'totalScore', width: 20 },
          { header: 'الدرجة (%)', key: 'score', width: 15 },
          { header: 'الوقت المستغرق (د:ث)', key: 'time', width: 20 },
          { header: 'تاريخ التسليم', key: 'date', width: 25 },
          { header: 'الحالة', key: 'status', width: 15 }
        ]
        : [
          { header: '#', key: 'index', width: 8 },
          { header: 'Student Name', key: 'name', width: 35 },
          { header: 'Total Score', key: 'totalScore', width: 20 },
          { header: 'Score (%)', key: 'score', width: 15 },
          { header: 'Time Taken (m:s)', key: 'time', width: 20 },
          { header: 'Submitted At', key: 'date', width: 25 },
          { header: 'Status', key: 'status', width: 15 }
        ];

      worksheet.columns = columnsConfig;

      const formatTimeSpent = (seconds: number | null | undefined) => {
        if (seconds == null) return isArabic ? '--:--' : '--:--';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
      };

      const sourceData = allSubmissions.length > 0 ? allSubmissions : submissions;

      sourceData.forEach((sub, index) => {
        worksheet.addRow({
          index: index + 1,
          name: sub.studentName || (isArabic ? 'غير محدد' : 'Not specified'),
          totalScore: quiz?.questions?.length || 0,
          score: sub.score,
          time: formatTimeSpent(sub.timeSpent),
          date: new Date(sub.submittedAt).toLocaleString(isArabic ? 'ar-SA' : 'en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          status: sub.score >= 50 ? (isArabic ? 'ناجح' : 'Pass') : (isArabic ? 'راسب' : 'Fail')
        });
      });

      const headerRow = worksheet.getRow(1);
      headerRow.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' },
        size: 12,
        name: isArabic ? 'Arial' : 'Calibri'
      };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2E5BFF' }
      };
      headerRow.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true
      };
      headerRow.height = 30;

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          const scoreCell = row.getCell('score');
          const score = scoreCell.value;
          if (typeof score === 'number') {
            if (score >= 90) {
              scoreCell.font = { color: { argb: 'FF00A859' }, bold: true };
            } else if (score >= 70) {
              scoreCell.font = { color: { argb: 'FFFFC107' }, bold: true };
            } else if (score >= 50) {
              scoreCell.font = { color: { argb: 'FFFF9800' }, bold: true };
            } else {
              scoreCell.font = { color: { argb: 'FFF44336' }, bold: true };
            }
          }
        }

        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
          };
          cell.alignment = {
            vertical: 'middle',
            horizontal: 'center',
            wrapText: true
          };
        });
      });

      worksheet.getColumn('score').numFmt = '0.00';

      const statsRow = worksheet.addRow([]);
      statsRow.getCell(1).value = isArabic ? 'إحصائيات:' : 'Statistics:';
      statsRow.getCell(1).font = { bold: true, size: 12 };
      statsRow.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF0F7FF' }
      };

      worksheet.addRow([
        isArabic ? 'متوسط الدرجات:' : 'Average Score:',
        '',
        '',
        '',
        `${(sourceData.reduce((sum, sub) => sum + sub.score, 0) / sourceData.length).toFixed(2)}%`
      ]);

      worksheet.addRow([
        isArabic ? 'عدد التسليمات:' : 'Total Submissions:',
        '',
        '',
        '',
        sourceData.length
      ]);

      const buffer = await workbook.xlsx.writeBuffer();

      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quiz-submissions-${quiz?.title || 'quiz'}-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert(isArabic ? 'فشل في إنشاء ملف Excel. يرجى المحاولة مرة أخرى.' : 'Failed to generate Excel file. Please try again.');
    }
  };


  const getScoreDistribution = () => {
    const distribution = {
      '90-100': 0,
      '80-89': 0,
      '70-79': 0,
      '60-69': 0,
      '0-59': 0,
    };

    allSubmissions.forEach((sub) => {
      if (sub.score >= 90) distribution['90-100']++;
      else if (sub.score >= 80) distribution['80-89']++;
      else if (sub.score >= 70) distribution['70-79']++;
      else if (sub.score >= 60) distribution['60-69']++;
      else distribution['0-59']++;
    });

    return distribution;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          {t.quiz.notFound || 'Quiz not found'}
        </h2>
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-primary to-primary-dark text-white rounded-xl hover:from-primary-hover hover:to-primary-dark transition-all shadow-md hover:shadow-primary/30"
        >
          <ArrowLeft className="w-5 h-5" />
          {t.dashboard.backToDashboard}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-3 rounded-xl hover:bg-muted/50 transition-colors"
            title={t.common.back}
          >
            <ArrowLeft className="w-6 h-6 text-foreground/80" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              {quiz.title}
            </h1>
            <p className="text-lg text-foreground/80 mt-1">
              {totalSubmissions} {t.results.submissions.toLowerCase()} • {quiz.questions.length}{' '}
              {t.quiz.questions.toLowerCase()}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={downloadExcel}
            disabled={submissions.length === 0}
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition-all shadow-md hover:shadow-green-500/30"
          >
            <Download className="w-5 h-5" />
            {isArabic ? 'تصدير Excel' : 'Export Excel'}
          </button>

          <button
            onClick={() => {
              const link = `${window.location.origin}/quiz/${params.slug}`;
              navigator.clipboard.writeText(link);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-primary to-primary-dark text-white rounded-xl hover:from-primary-hover hover:to-primary-dark transition-all shadow-md hover:shadow-primary/30"
          >
            <span>{t.dashboard.copyLink}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        <div className="bg-card rounded-2xl shadow-md p-6 text-center border border-border/50">
          <div className="text-3xl md:text-4xl font-bold text-primary">{totalSubmissions}</div>
          <div className="text-sm text-foreground/80 mt-2">{t.results.totalSubmissions}</div>
        </div>
        <div className="bg-card rounded-2xl shadow-md p-6 text-center border border-border/50">
          <div className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400">
            {allSubmissions.length > 0 ? Math.round(allSubmissions.reduce((sum, sub) => sum + sub.score, 0) / allSubmissions.length) : 0}%
          </div>
          <div className="text-sm text-foreground/80 mt-2">{t.results.averageScore}</div>
        </div>
        <div className="bg-card rounded-2xl shadow-md p-6 text-center border border-border/50">
          <div className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400">
            {quiz.questions.length}
          </div>
          <div className="text-sm text-foreground/80 mt-2">{t.quiz.questions}</div>
        </div>
        <div className="bg-card rounded-2xl shadow-md p-6 text-center border border-border/50">
          <div className="text-xl md:text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {new Date(quiz.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
          </div>
          <div className="text-sm text-foreground/80 mt-2">{t.quiz.createdAt}</div>
        </div>
      </div>

      {submissions.length > 0 && (
        <div className="bg-card rounded-3xl shadow-xl border border-border/50 p-8">
          <div className="flex items-center gap-3 mb-6">
            <BarChart2 className="w-6 h-6 text-primary" />
            <h3 className="text-xl md:text-2xl font-semibold text-foreground">
              {t.results.scoreDistribution}
            </h3>
          </div>

          <div className="space-y-4">
            {Object.entries(getScoreDistribution()).map(([range, count]) => (
              <div key={range} className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium text-foreground/90">
                  {range}%
                </div>
                <div className="flex-1 h-5 bg-muted/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-primary to-primary-dark rounded-full transition-all duration-500"
                    style={{ width: `${allSubmissions.length > 0 ? (count / allSubmissions.length) * 100 : 0}%` }}
                  />
                </div>
                <div className="w-12 text-right text-sm font-medium text-foreground">
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card rounded-3xl shadow-xl border border-border/50 overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-xl font-semibold text-foreground">
            {t.results.submissions} ({submissions.length})
          </h3>
        </div>

        {submissions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart2 className="w-10 h-10 text-primary" />
            </div>
            <h4 className="text-xl font-medium text-foreground mb-3">
              {t.results.noSubmissions}
            </h4>
            <p className="text-foreground/80 max-w-md mx-auto">
              {t.results.shareLinkDesc || 'Share the quiz link with students to start receiving submissions'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <ResultsTable
              submissions={submissions}
              quiz={quiz}
              onViewDetails={(submission) => setSelectedSubmission(submission)}
              startIndex={(currentPage - 1) * pageSize}
            />
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-card border border-border rounded-xl hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isArabic ? 'السابق' : 'Previous'}
          </button>

          <div className="flex items-center gap-2">
            <select
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              className="px-3 py-2 bg-card border border-border rounded-xl text-sm"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <option key={page} value={page}>
                  {isArabic ? `صفحة ${page}` : `Page ${page}`}
                </option>
              ))}
            </select>
            <span className="text-sm text-foreground/80">
              {isArabic ? 'من' : 'of'} {totalPages}
            </span>
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-card border border-border rounded-xl hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isArabic ? 'التالي' : 'Next'}
          </button>
        </div>
      )}

      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-3xl shadow-2xl border border-border/50 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <div>
                <h3 className="text-2xl font-bold bg-linear-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                  {t.results.details}
                </h3>
                <p className="text-lg text-foreground/80 mt-1">
                  {selectedSubmission.studentName} • {t.results.score}: {selectedSubmission.score}%
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-3 rounded-full hover:bg-muted/50 transition-colors"
              >
                <X className="w-6 h-6 text-foreground/70 hover:text-foreground" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {quiz.questions.map((question: Question, index: number) => {
                const studentAnswer = selectedSubmission.answers?.[index] ?? -1;
                const isCorrect = studentAnswer === question.correctAnswer;

                return (
                  <div
                    key={index}
                    className={`p-6 rounded-2xl border ${isCorrect
                      ? 'bg-green-500/5 border-green-500/30'
                      : 'bg-red-500/5 border-red-500/30'
                      }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                            }`}
                        >
                          {index + 1}
                        </div>
                        <span className="font-semibold text-foreground">{question.questionText}</span>
                      </div>
                      <span
                        className={`px-4 py-1.5 rounded-full text-sm font-medium ${isCorrect
                          ? 'bg-green-500/20 text-green-700 dark:text-green-300'
                          : 'bg-red-500/20 text-red-700 dark:text-red-300'
                          }`}
                      >
                        {isCorrect ? t.results.correct : t.results.incorrect}
                      </span>
                    </div>

                    <div className="space-y-3 ml-0 sm:ml-11">
                      {question.choices.map((choice: string, choiceIndex: number) => {
                        let bgClass = 'bg-muted/50 border-border';
                        let textClass = 'text-foreground/90';
                        let mark = null;

                        if (choiceIndex === question.correctAnswer) {
                          bgClass = 'bg-green-500/10 border-green-500/30';
                          textClass = 'text-green-700 dark:text-green-300';
                          mark = <Check className="w-4 h-4 text-green-600" />;
                        } else if (choiceIndex === studentAnswer) {
                          bgClass = 'bg-red-500/10 border-red-500/30';
                          textClass = 'text-red-700 dark:text-red-300';
                          mark = <X className="w-4 h-4 text-red-600" />;
                        }

                        return (
                          <div
                            key={choiceIndex}
                            className={`p-4 rounded-xl border ${bgClass} ${textClass}`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold">
                                  {String.fromCharCode(65 + choiceIndex)}
                                </div>
                                <span>{choice}</span>
                              </div>
                              {mark && <div>{mark}</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-6 border-t border-border flex justify-end">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-8 py-3 bg-linear-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:from-primary-hover hover:to-primary-dark transition-all shadow-md hover:shadow-primary/30"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
