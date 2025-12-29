'use client';

import { Submission, Quiz } from '@/types';
import { useUIStore } from '@/store/uiStore';
import { translations } from '@/lib/i18n';
import { Eye, Download, BarChart2, Clock, FileSpreadsheet, FileText } from 'lucide-react';

interface ResultsTableProps {
  submissions: Submission[];
  quiz: Quiz;
  onViewDetails: (submission: Submission) => void;
  onExport?: () => void;
  startIndex?: number;
}

export function ResultsTable({ submissions, quiz, onViewDetails, onExport, startIndex = 0 }: ResultsTableProps) {
  const { language } = useUIStore();
  const t = translations[language];
  const isArabic = language === 'ar';

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatTimeSpent = (seconds: number | undefined) => {
    if (seconds == null) return '--';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 50) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    if (score >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const downloadStudentExcel = async (submission: Submission) => {
    try {
      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      workbook.creator = isArabic ? 'نظام الاختبارات' : 'Quiz System';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet(isArabic ? 'النتيجة' : 'Result');

      // Helper to strip HTML tags if present
      const stripHtml = (html: string) => {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
      };

      // Header Info
      worksheet.mergeCells('A1:D1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = quiz.title;
      titleCell.font = { size: 16, bold: true, color: { argb: 'FF2E5BFF' } };
      titleCell.alignment = { horizontal: 'center' };

      worksheet.addRow([isArabic ? 'الطالب:' : 'Student:', submission.studentName]);
      worksheet.addRow([isArabic ? 'الدرجة:' : 'Score:', `${submission.score}%`]);
      worksheet.addRow([isArabic ? 'التاريخ:' : 'Date:', formatDate(submission.submittedAt)]);
      worksheet.addRow([]); // Gap

      // Table Headers
      const headers = isArabic
        ? ['السؤال', 'إجابة الطالب', 'الإجابة الصحيحة', 'الحالة']
        : ['Question', 'Student Answer', 'Correct Answer', 'Status'];

      const headerRow = worksheet.addRow(headers);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E5BFF' } };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

      // Data Rows
      quiz.questions.forEach((q, idx) => {
        const answerIdx = submission.answers?.[idx] ?? -1;
        const studentAnswer = answerIdx >= 0 ? q.choices[answerIdx] : (isArabic ? 'لم يجب' : 'No Answer');
        const correctAnswer = q.choices[q.correctAnswer];
        const isCorrect = answerIdx === q.correctAnswer;

        const row = worksheet.addRow([
          stripHtml(q.questionText),
          studentAnswer,
          correctAnswer,
          isCorrect ? (isArabic ? 'صحيح' : 'Correct') : (isArabic ? 'خطأ' : 'Incorrect')
        ]);

        // Color status cell
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
        if (rowNumber > 5) { // Skip header info
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
      a.download = `result-${submission.studentName}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Excel export error:', error);
      alert(isArabic ? 'فشل التصدير' : 'Export failed');
    }
  };

  const downloadStudentPDF = async (submission: Submission) => {
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

      doc.setFontSize(18);
      doc.setTextColor(46, 91, 255);
      doc.setFont('Amiri', 'normal');

      // Align right for Arabic, Center for English
      const titleAlign = isArabic ? 'right' : 'center';
      const titleX = isArabic ? 200 : 105;
      doc.text(quiz.title, titleX, 20, { align: titleAlign });

      doc.setFontSize(12);
      doc.setTextColor(0);

      const startX = isArabic ? 190 : 14;
      const align = isArabic ? 'right' : 'left';

      doc.text(`${isArabic ? 'الطالب' : 'Student'}: ${submission.studentName}`, startX, 30, { align });
      doc.text(`${isArabic ? 'الدرجة' : 'Score'}: ${submission.score}%`, startX, 38, { align });
      doc.text(`${isArabic ? 'التاريخ' : 'Date'}: ${formatDate(submission.submittedAt)}`, startX, 46, { align });

      const tableData = quiz.questions.map((q, idx) => {
        const answerIdx = submission.answers?.[idx] ?? -1;
        const studentAnswer = answerIdx >= 0 ? q.choices[answerIdx] : '--';
        const isCorrect = answerIdx === q.correctAnswer;

        return [
          q.questionText,
          studentAnswer,
          isCorrect ? (isArabic ? 'صحيح' : 'Correct') : (isArabic ? 'خطأ' : 'Incorrect')
        ];
      });

      autoTable(doc, {
        startY: 55,
        head: [[
          isArabic ? 'السؤال' : 'Question',
          isArabic ? 'إجابة الطالب' : 'Student Answer',
          isArabic ? 'الحالة' : 'Status'
        ]],
        body: tableData,
        headStyles: {
          fillColor: [46, 91, 255],
          font: 'Amiri',
          halign: isArabic ? 'right' : 'left'
        },
        styles: {
          font: 'Amiri',
          halign: isArabic ? 'right' : 'left',
          overflow: 'linebreak'
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 60 },
          2: { cellWidth: 40 }
        }
      });

      doc.save(`result-${submission.studentName}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
      alert(isArabic ? 'فشل التصدير' : 'Export failed');
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-border">
            <th className="text-center py-4 px-6 text-sm font-semibold text-foreground/80">
              #
            </th>
            <th className="text-center py-4 px-6 text-sm font-semibold text-foreground/80">
              {t.results.studentName}
            </th>
            <th className="text-center py-4 px-6 text-sm font-semibold text-foreground/80">
              {t.results.score}
            </th>
            <th className="text-center py-4 px-6 text-sm font-semibold text-foreground/80">
              {t.quiz.timeTaken || 'Time Taken'}
            </th>
            <th className="text-center py-4 px-6 text-sm font-semibold text-foreground/80">
              {t.results.submittedAt}
            </th>
            <th className="text-center py-4 px-6 text-sm font-semibold text-foreground/80">
              {t.results.actions}
            </th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission, index) => (
            <tr
              key={submission.id}
              className="border-b border-border text-center hover:bg-muted/50 transition-colors"
            >
              <td className="py-4 px-6 text-sm text-foreground/80">
                {startIndex + index + 1}
              </td>
              <td className="py-4 px-6">
                <div className="font-medium text-foreground">
                  {submission.studentName}
                </div>
              </td>
              <td className="py-4 px-6">
                <div className="flex items-center gap-4 justify-center">
                  <div className={`text-xl font-bold ${getScoreColor(submission.score)}`}>
                    {submission.score}%
                  </div>
                  <div className="w-24 h-2 bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(submission.score)} transition-all duration-500`}
                      style={{ width: `${submission.score}%` }}
                    />
                  </div>
                </div>
              </td>
              <td className="py-4 px-6">
                <div className="flex items-center justify-center gap-2 text-foreground/80">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono">
                    {formatTimeSpent(submission.timeSpent)}
                  </span>
                </div>
              </td>
              <td className="py-4 px-6 text-sm text-foreground/80">
                {formatDate(submission.submittedAt)}
              </td>
              <td className="py-4 px-6 mx-auto">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => onViewDetails(submission)}
                    className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                    title={t.results.viewDetails}
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => downloadStudentExcel(submission)}
                    className="p-2 rounded-lg hover:bg-green-500/10 text-green-600 dark:text-green-400 transition-colors"
                    title={isArabic ? 'تحميل Excel' : 'Download Excel'}
                  >
                    <FileSpreadsheet className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => downloadStudentPDF(submission)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors"
                    title={isArabic ? 'تحميل PDF' : 'Download PDF'}
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {submissions.length === 0 && (
        <div className="py-16 text-center">
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
      )}

      {onExport && submissions.length > 0 && (
        <div className="p-6 border-t border-border flex justify-end">
          <button
            onClick={onExport}
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-primary to-gradient-end text-white rounded-xl hover:from-primary-hover hover:to-gradient-end transition-all shadow-md hover:shadow-primary/30"
          >
            <Download className="w-5 h-5" />
            {t.common.downloadCSV}
          </button>
        </div>
      )}
    </div>
  );
}
