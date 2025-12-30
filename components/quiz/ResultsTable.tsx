'use client';

import { Submission, Quiz } from '@/types';
import { useUIStore } from '@/store/uiStore';
import { translations } from '@/lib/i18n';
import { Eye, Download, BarChart2, Clock, FileSpreadsheet, FileText, User, Calendar, Award } from 'lucide-react';
import { useState } from 'react';
import type { jsPDF } from 'jspdf';

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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<string | null>(null);

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
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

  const getGrade = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Average';
    if (score >= 50) return 'Poor';
    return 'Fail';
  };

  const downloadStudentExcel = async (submission: Submission) => {
    try {
      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Quiz System';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Result');

      const stripHtml = (html: string) => {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
      };

      worksheet.mergeCells('A1:E1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = quiz.title;
      titleCell.font = {
        size: 18,
        bold: true,
        color: { argb: 'FF2E5BFF' },
        name: 'Calibri'
      };
      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };

      worksheet.addRow([]);

      const infoRow1 = worksheet.addRow([
        'Student Name:',
        submission.studentName,
        '',
        'Date:',
        formatDate(submission.submittedAt)
      ]);

      const infoRow2 = worksheet.addRow([
        'Score:',
        `${submission.score}%`,
        '',
        'Grade:',
        getGrade(submission.score)
      ]);

      [infoRow1, infoRow2].forEach(row => {
        row.eachCell((cell, colNumber) => {
          if (colNumber === 1 || colNumber === 4) {
            cell.font = { bold: true };
          }
          if (colNumber === 2 || colNumber === 5) {
            cell.font = { bold: true, color: { argb: 'FF2E5BFF' } };
          }
        });
      });

      worksheet.addRow([]);

      const headers = ['#', 'Question', 'Student Answer', 'Correct Answer', 'Status'];
      const headerRow = worksheet.addRow(headers);
      headerRow.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' },
        name: 'Calibri'
      };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2E5BFF' }
      };
      headerRow.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true
      };
      headerRow.height = 25;

      quiz.questions.forEach((q, idx) => {
        const answerIdx = submission.answers?.[idx] ?? -1;
        const studentAnswer = answerIdx >= 0 ? q.choices[answerIdx] : 'No Answer';
        const correctAnswer = q.choices[q.correctAnswer];
        const isCorrect = answerIdx === q.correctAnswer;

        const row = worksheet.addRow([
          idx + 1,
          stripHtml(q.questionText),
          studentAnswer,
          correctAnswer,
          isCorrect ? '✅ Correct' : '❌ Incorrect'
        ]);

        const statusCell = row.getCell(5);
        statusCell.font = {
          color: { argb: isCorrect ? 'FF00A859' : 'FFF44336' },
          bold: true
        };
        statusCell.alignment = { horizontal: 'center' };
      });

      worksheet.getColumn(1).width = 10;
      worksheet.getColumn(2).width = 50; 
      worksheet.getColumn(3).width = 40;  
      worksheet.getColumn(4).width = 40;  
      worksheet.getColumn(5).width = 20;

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 5) {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
              left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
              bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
              right: { style: 'thin', color: { argb: 'FFDDDDDD' } },
            };
            cell.alignment = {
              vertical: 'middle',
              horizontal: 'left',
              wrapText: true
            };
          });
        }
      });

      worksheet.addRow([]);
      
      const correctAnswers = quiz.questions.filter((q, idx) => {
        const answerIdx = submission.answers?.[idx] ?? -1;
        return answerIdx === q.correctAnswer;
      }).length;

      const summaryRow = worksheet.addRow([
        'Summary:',
        '',
        '',
        '',
        `${correctAnswers}/${quiz.questions.length}`
      ]);
      
      summaryRow.getCell(1).font = { bold: true };
      summaryRow.getCell(5).font = { bold: true, color: { argb: 'FF2E5BFF' } };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Result_${submission.studentName}_${quiz.title}.xlsx`
        .replace(/[^a-zA-Z0-9_\-]/g, '_');
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Excel export error:', error);
      alert('Failed to export file');
    }
  };

  const downloadStudentPDF = async (submission: Submission) => {
    setIsGeneratingPDF(submission.id);
    try {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();

      const stripHtml = (html: string) => {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
      };

      const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
      };

      pdf.setFontSize(22);
      pdf.setTextColor(46, 91, 255); 
      pdf.setFont('helvetica', 'bold');
      const title = truncateText(quiz.title, 80);
      pdf.text(title, pageWidth / 2, 20, { align: 'center' });

      if (quiz.description) {
        pdf.setFontSize(11);
        pdf.setTextColor(100, 100, 100);
        pdf.setFont('helvetica', 'normal');
        const description = truncateText(stripHtml(quiz.description), 120);
        pdf.text(description, pageWidth / 2, 28, { align: 'center' });
      }

      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Student Information', 15, 45);

      pdf.setDrawColor(200, 200, 200);
      pdf.line(15, 48, pageWidth - 15, 48);

      pdf.setFontSize(11);
      pdf.setTextColor(80, 80, 80);
      pdf.setFont('helvetica', 'normal');

      const studentInfoData = [
        ['Student Name:', truncateText(submission.studentName, 50)],
        ['Score:', `${submission.score}%`],
        ['Grade:', getGrade(submission.score)],
        ['Time Taken:', formatTimeSpent(submission.timeSpent)],
        ['Submission Date:', formatDate(submission.submittedAt)]
      ];

      let yPos = 55;
      studentInfoData.forEach(([label, value]) => {
        pdf.text(label, 15, yPos);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(46, 91, 255);
        pdf.text(value, 70, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(80, 80, 80);
        yPos += 8;
      });

      const scoreX = pageWidth - 50;
      const scoreY = 55;
      
      pdf.setFillColor(240, 240, 245);
      pdf.roundedRect(scoreX, scoreY, 40, 25, 2, 2, 'F');
      
      pdf.setFontSize(20);
      pdf.setTextColor(46, 91, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${submission.score}%`, scoreX + 20, scoreY + 15, { align: 'center' });
      
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Score', scoreX + 20, scoreY + 22, { align: 'center' });

      const progressWidth = 40;
      const progressFilled = (submission.score / 100) * progressWidth;
      
      pdf.setFillColor(230, 230, 230);
      pdf.roundedRect(scoreX, scoreY + 28, progressWidth, 5, 2, 2, 'F');
      
      let progressColor: [number, number, number];
      if (submission.score >= 70) {
        progressColor = [0, 168, 89];
      } else if (submission.score >= 50) {
        progressColor = [255, 152, 0]; 
      } else {
        progressColor = [244, 67, 54];
      }
      
      pdf.setFillColor(progressColor[0], progressColor[1], progressColor[2]);
      pdf.roundedRect(scoreX, scoreY + 28, progressFilled, 5, 2, 2, 'F');

      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Questions & Answers', 15, 95);

      pdf.line(15, 98, pageWidth - 15, 98);

      const tableData = quiz.questions.map((q, idx) => {
        const answerIdx = submission.answers?.[idx] ?? -1;
        const studentAnswer = answerIdx >= 0 ?
          q.choices[answerIdx] :
          '-- No Answer --';
        const isCorrect = answerIdx === q.correctAnswer;

        return [
          (idx + 1).toString(),
          truncateText(stripHtml(q.questionText), 150),
          truncateText(studentAnswer, 80),
          truncateText(q.choices[q.correctAnswer], 80),
          isCorrect ? '✓' : '✗'
        ];
      });

      autoTable(pdf, {
        startY: 102,
        head: [['#', 'Question', 'Student Answer', 'Correct Answer', 'Result']],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 2,
          overflow: 'linebreak',
          textColor: [60, 60, 60],
          font: 'helvetica',
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [46, 91, 255],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center',
          lineWidth: 0.1,
        },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          1: { cellWidth: 75 },  
          2: { cellWidth: 40 },  
          3: { cellWidth: 40 },  
          4: { cellWidth: 20, halign: 'center' }
        },
        margin: { left: 15, right: 15 },
        didParseCell: function(data) {
          if (data.column.index === 4 && data.cell.raw) {
            const isCorrect = data.cell.raw === '✓';
            data.cell.styles.textColor = isCorrect ? 
              [0, 168, 89] : 
              [244, 67, 54];  
            data.cell.styles.fontStyle = 'normal';
            data.cell.styles.fontSize = 10;
          }
          if (data.column.index === 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fontSize = 8.5;
          }
        },
        willDrawCell: function(data) {
          if (data.row.index % 2 === 0 && data.row.index > 0) {
            data.doc.setFillColor(250, 250, 250);
            data.doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
          }
        }
      });

      
      const finalY = (pdf as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
      
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Results Summary', 15, finalY);

      pdf.line(15, finalY + 3, pageWidth - 15, finalY + 3);

      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      pdf.setFont('helvetica', 'normal');

      const correctAnswers = quiz.questions.filter((q, idx) => {
        const answerIdx = submission.answers?.[idx] ?? -1;
        return answerIdx === q.correctAnswer;
      }).length;

      const wrongAnswers = quiz.questions.length - correctAnswers;
      const successRate = Math.round((correctAnswers / quiz.questions.length) * 100);

      const summaryData = [
        ['Total Questions:', quiz.questions.length.toString()],
        ['Correct Answers:', correctAnswers.toString()],
        ['Wrong Answers:', wrongAnswers.toString()],
        ['Success Rate:', `${successRate}%`],
        ['Score:', `${submission.score}%`],
        ['Grade:', getGrade(submission.score)]
      ];

      let summaryY = finalY + 12;
      summaryData.forEach(([label, value]) => {
        pdf.text(label, 15, summaryY);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(46, 91, 255);
        pdf.text(value, 70, summaryY);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(80, 80, 80);
        summaryY += 6;
      });

      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.setFont('helvetica', 'italic');
      pdf.text(
        `Generated by Mokta'b Quiz System • ${new Date().toLocaleDateString('en-US')}`,
        pageWidth / 2,
        pdf.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );

      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - 20,
          pdf.internal.pageSize.getHeight() - 10
        );
      }

      const fileName = `Result_${submission.studentName}_${quiz.title}.pdf`
        .replace(/[^a-zA-Z0-9_\-]/g, '_')
        .substring(0, 100);
      
      pdf.save(fileName);

    } catch (error) {
      console.error('PDF export error:', error);
      alert('Failed to create PDF file');
    } finally {
      setIsGeneratingPDF(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-175">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-center py-4 px-6 text-sm font-semibold text-foreground/80">
              #
            </th>
            <th className="text-center py-4 px-6 text-sm font-semibold text-foreground/80">
              {t.results.studentName}
            </th>
            <th className="text-center py-4 px-6 text-sm font-semibold text-foreground/80">
              {t.results.score}
            </th>
            <th className="text-center whitespace-nowrap py-4 px-6 text-sm font-semibold text-foreground/80">
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
              className="border-b border-border text-center hover:bg-muted/30 transition-colors"
            >
              <td className="py-4 px-6 text-sm text-foreground/80 font-medium">
                {startIndex + index + 1}
              </td>
              <td className="py-4 px-6">
                <div className="font-medium text-foreground flex items-center justify-center gap-2">
                  <User className="w-4 h-4 text-primary/60" />
                  {submission.studentName}
                </div>
              </td>
              <td className="py-4 px-6">
                <div className="flex flex-col items-center gap-2">
                  <div className={`text-xl font-bold ${getScoreColor(submission.score)} flex items-center gap-2`}>
                    <Award className="w-5 h-5" />
                    {submission.score}%
                  </div>
                  <div className="w-24 h-2 bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(submission.score)} transition-all duration-500`}
                      style={{ width: `${submission.score}%` }}
                    />
                  </div>
                  <span className="text-xs text-foreground/60">
                    {getGrade(submission.score)}
                  </span>
                </div>
              </td>
              <td className="py-4 px-6">
                <div className="flex items-center justify-center gap-2 text-foreground/80">
                  <Clock className="w-4 h-4 text-primary/60" />
                  <span className="font-mono font-medium">
                    {formatTimeSpent(submission.timeSpent)}
                  </span>
                </div>
              </td>
              <td className="py-4 px-6 text-sm">
                <div className="flex items-center justify-center gap-2 text-foreground/70">
                  <Calendar className="w-4 h-4 text-primary/60" />
                  {formatDate(submission.submittedAt)}
                </div>
              </td>
              <td className="py-4 px-6">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => onViewDetails(submission)}
                    className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors tooltip"
                    title={t.results.viewDetails}
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => downloadStudentExcel(submission)}
                    className="p-2 rounded-lg hover:bg-green-500/10 text-green-600 dark:text-green-400 transition-colors tooltip"
                    title="Download Excel"
                  >
                    <FileSpreadsheet className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => downloadStudentPDF(submission)}
                    disabled={isGeneratingPDF === submission.id}
                    className={`p-2 rounded-lg transition-colors tooltip ${isGeneratingPDF === submission.id
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}
                    title="Download PDF"
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                </div>
                {isGeneratingPDF === submission.id && (
                  <div className="text-xs text-foreground/60 mt-1">
                    Generating PDF...
                  </div>
                )}
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
        <div className="p-6 border-t border-border flex justify-end bg-muted/30">
          <button
            onClick={onExport}
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-primary to-primary-dark text-white rounded-xl hover:from-primary-hover hover:to-primary-dark transition-all shadow-md hover:shadow-primary/30"
          >
            <Download className="w-5 h-5" />
            {t.common.downloadCSV}
          </button>
        </div>
      )}
    </div>
  );
}
