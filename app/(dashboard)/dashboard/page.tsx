"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { translations } from "@/lib/i18n";
import { Quiz, SubmissionWithQuiz, Question } from "@/types";
import {
  Copy,
  Eye,
  Plus,
  Trash2,
  Edit3,
  Loader2,
  BarChart3,
  Users,
  FileText,
  Calendar,
  Clock as ClockIcon,
  User as UserIcon,
  FileSpreadsheet,
  Check,
  X,
} from "lucide-react";
import Image from "next/image";

const MySwal = withReactContent(Swal);

export default function DashboardPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionWithQuiz[]>([]);
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionWithQuiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<string | null>(null);

  const { language } = useUIStore();
  const { user } = useAuthStore();
  const t = translations[language];
  const isRTL = language === "ar";

  const fetchQuizzes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/quiz/my-quizzes", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(t.dashboard.fetchError || "Failed to fetch quizzes");
      }

      const data = await response.json();

      if (data.success) {
        setQuizzes(data.quizzes);
      } else {
        throw new Error(
          data.message || t.dashboard.fetchError || "Failed to fetch quizzes"
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t.dashboard.fetchError;
      setError(errorMessage);

      MySwal.fire({
        icon: "error",
        title: (
          <span className="text-red-600 dark:text-red-400">
            {t.common.error}
          </span>
        ),
        text: errorMessage,
        confirmButtonText: t.common.ok,
        confirmButtonColor: "var(--color-primary)",
        background: "var(--color-card)",
        color: "var(--color-foreground)",
        showClass: {
          popup: "animate__animated animate__fadeInDown",
        },
      });
    } finally {
      setIsLoading(false);
    }
  }, [t.dashboard.fetchError, t.common.error, t.common.ok]);

  const fetchSubmissions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/submissions/my-submissions", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          t.dashboard.fetchError || "Failed to fetch submissions"
        );
      }

      const data = await response.json();

      if (data.success) {
        setSubmissions(data.submissions);
      } else {
        throw new Error(
          data.message ||
            t.dashboard.fetchError ||
            "Failed to fetch submissions"
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t.dashboard.fetchError;
      setError(errorMessage);

      MySwal.fire({
        icon: "error",
        title: (
          <span className="text-red-600 dark:text-red-400">
            {t.common.error}
          </span>
        ),
        text: errorMessage,
        confirmButtonText: t.common.ok,
        confirmButtonColor: "var(--color-primary)",
        background: "var(--color-card)",
        color: "var(--color-foreground)",
        showClass: {
          popup: "animate__animated animate__fadeInDown",
        },
      });
    } finally {
      setIsLoading(false);
    }
  }, [t.dashboard.fetchError, t.common.error, t.common.ok]);

  useEffect(() => {
    if (user?.role === "student") {
      fetchSubmissions();
    } else {
      fetchQuizzes();
    }
  }, [fetchQuizzes, fetchSubmissions, user]);

  const copyQuizLink = (quiz: Quiz) => {
    const quizIdentifier = quiz.slug || quiz.id;
    const link = `${window.location.origin}/quiz/${quizIdentifier}`;
    navigator.clipboard
      .writeText(link)
      .then(() => {
        MySwal.fire({
          icon: "success",
          title: (
            <span className="text-primary dark:text-primary-light">
              {isRTL ? "✅ تم النسخ!" : "✅ Copied!"}
            </span>
          ),
          html: (
            <div className="text-center">
              <p className="text-foreground dark:text-foreground mb-3">
                {isRTL
                  ? "تم نسخ رابط الاختبار بنجاح"
                  : "Quiz link copied successfully"}
              </p>
              <div className="dark:bg-primary-dark p-3 rounded-lg">
                <code className="text-xl text-primary dark:text-primary-light break-all">
                  {quiz.title}
                </code>
              </div>
              <p className="text-sm text-foreground/70 dark:text-foreground/70 mt-2">
                {isRTL
                  ? "يمكنك مشاركته مع الطلاب الآن"
                  : "You can now share it with students"}
              </p>
            </div>
          ),
          background: "var(--color-card)",
          color: "var(--color-foreground)",
          confirmButtonColor: "var(--color-primary)",
          confirmButtonText: t.common.ok,
          timer: 2000,
          showClass: {
            popup: "animate__animated animate__fadeInDown",
          },
        });
      })
      .catch(() => {
        MySwal.fire({
          icon: "error",
          title: (
            <span className="text-red-600 dark:text-red-400">
              {t.common.error}
            </span>
          ),
          text: isRTL ? "فشل في نسخ الرابط" : "Failed to copy link",
          confirmButtonText: t.common.ok,
          confirmButtonColor: "var(--color-primary)",
          color: "var(--color-foreground)",
        });
      });
  };

  const deleteQuiz = async (quiz: Quiz) => {
    const result = await MySwal.fire({
      icon: "warning",
      title: (
        <span className="text-yellow-600 dark:text-yellow-400">
          {isRTL ? "⚠️ تأكيد الحذف" : "⚠️ Confirm Delete"}
        </span>
      ),
      html: (
        <div className="text-center">
          <p className="text-foreground dark:text-foreground mb-2">
            {isRTL
              ? "هل أنت متأكد من حذف هذا الاختبار؟"
              : "Are you sure you want to delete this quiz?"}
          </p>
          <p className="text-lg font-semibold text-primary dark:text-primary-light">
            {quiz.title}
          </p>
          <p className="text-sm text-foreground/70 dark:text-foreground/70 mt-2">
            {isRTL
              ? `سيتم حذف ${quiz.questions.length} سؤال و${
                  quiz.submissionsCount || 0
                } إجابة`
              : `This will delete ${quiz.questions.length} questions and ${
                  quiz.submissionsCount || 0
                } submissions`}
          </p>
        </div>
      ),
      background: "var(--color-card)",
      color: "var(--color-foreground)",
      showCancelButton: true,
      confirmButtonText: isRTL ? "نعم، احذف" : "Yes, Delete",
      cancelButtonText: isRTL ? "إلغاء" : "Cancel",
      confirmButtonColor: "var(--color-red-500)",
      cancelButtonColor: "var(--color-muted)",
      reverseButtons: isRTL,
      showClass: {
        popup: "animate__animated animate__fadeInDown",
      },
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/quiz/${quiz.id}`, {
          method: "DELETE",
          credentials: "include",
        });

        const data = await response.json();

        if (data.success) {
          setQuizzes(quizzes.filter((q) => q.id !== quiz.id));

          MySwal.fire({
            icon: "success",
            title: (
              <span className="text-green-600 dark:text-green-400">
                {isRTL ? "✅ تم الحذف" : "✅ Deleted"}
              </span>
            ),
            text: isRTL ? "تم حذف الاختبار بنجاح" : "Quiz deleted successfully",
            confirmButtonText: t.common.ok,
            confirmButtonColor: "var(--color-primary)",
            background: "var(--color-card)",
            color: "var(--color-foreground)",
            timer: 1500,
            showClass: {
              popup: "animate__animated animate__fadeInDown",
            },
          });
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        MySwal.fire({
          icon: "error",
          title: (
            <span className="text-red-600 dark:text-red-400">
              {t.common.error}
            </span>
          ),
          text: error instanceof Error ? error.message : t.common.deleteError,
          confirmButtonText: t.common.ok,
          confirmButtonColor: "var(--color-primary)",
          background: "var(--color-card)",
          color: "var(--color-foreground)",
        });
      }
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === "ar" ? "ar" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const formatTimeSpent = (seconds: number | undefined) => {
    if (seconds == null) return "--";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getGrade = (score: number): string => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Average";
    if (score >= 50) return "Poor";
    return "Fail";
  };

  const downloadStudentExcel = async (submission: SubmissionWithQuiz) => {
    try {
      const ExcelJS = (await import("exceljs")).default;
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Quiz System";
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet("Result");

      const stripHtml = (html: string) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
      };

      worksheet.mergeCells("A1:E1");
      const titleCell = worksheet.getCell("A1");
      titleCell.value = submission.quiz.title;
      titleCell.font = {
        size: 18,
        bold: true,
        color: { argb: "FF2E5BFF" },
        name: "Calibri",
      };
      titleCell.alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      worksheet.addRow([]);

      const infoRow1 = worksheet.addRow([
        "Student Name:",
        submission.studentName,
        "",
        "Date:",
        formatDate(submission.submittedAt),
      ]);

      const infoRow2 = worksheet.addRow([
        "Score:",
        `${submission.score}%`,
        "",
        "Grade:",
        getGrade(submission.score),
      ]);

      [infoRow1, infoRow2].forEach((row) => {
        row.eachCell((cell, colNumber) => {
          if (colNumber === 1 || colNumber === 4) {
            cell.font = { bold: true };
          }
          if (colNumber === 2 || colNumber === 5) {
            cell.font = { bold: true, color: { argb: "FF2E5BFF" } };
          }
        });
      });

      worksheet.addRow([]);

      const headers = [
        "#",
        "Question",
        "Student Answer",
        "Correct Answer",
        "Status",
      ];
      const headerRow = worksheet.addRow(headers);
      headerRow.font = {
        bold: true,
        color: { argb: "FFFFFFFF" },
        name: "Calibri",
      };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2E5BFF" },
      };
      headerRow.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      headerRow.height = 25;

      submission.quiz.questions?.forEach((q: Question, idx: number) => {
        const answerIdx = submission.answers?.[idx] ?? -1;
        const studentAnswer =
          answerIdx >= 0 ? q.choices[answerIdx] : "No Answer";
        const correctAnswer = q.choices[q.correctAnswer];
        const isCorrect = answerIdx === q.correctAnswer;

        const row = worksheet.addRow([
          idx + 1,
          stripHtml(q.questionText),
          studentAnswer,
          correctAnswer,
          isCorrect ? "✅ Correct" : "❌ Incorrect",
        ]);

        const statusCell = row.getCell(5);
        statusCell.font = {
          color: { argb: isCorrect ? "FF00A859" : "FFF44336" },
          bold: true,
        };
        statusCell.alignment = { horizontal: "center" };
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
              top: { style: "thin", color: { argb: "FFDDDDDD" } },
              left: { style: "thin", color: { argb: "FFDDDDDD" } },
              bottom: { style: "thin", color: { argb: "FFDDDDDD" } },
              right: { style: "thin", color: { argb: "FFDDDDDD" } },
            };
            cell.alignment = {
              vertical: "middle",
              horizontal: "left",
              wrapText: true,
            };
          });
        }
      });

      // Summary
      worksheet.addRow([]);

      const correctAnswers =
        submission.quiz.questions?.filter((q: Question, idx: number) => {
          const answerIdx = submission.answers?.[idx] ?? -1;
          return answerIdx === q.correctAnswer;
        }).length || 0;

      const summaryRow = worksheet.addRow([
        "Summary:",
        "",
        "",
        "",
        `${correctAnswers}/${submission.quiz.questions?.length || 0}`,
      ]);

      summaryRow.getCell(1).font = { bold: true };
      summaryRow.getCell(5).font = { bold: true, color: { argb: "FF2E5BFF" } };

      // Download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        `Result_${submission.studentName}_${submission.quiz.title}.xlsx`.replace(
          /[^a-zA-Z0-9_\-]/g,
          "_"
        );
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Excel export error:", error);
      alert("Failed to export file");
    }
  };

  const downloadStudentPDF = async (submission: SubmissionWithQuiz) => {
    setIsGeneratingPDF(submission.id);
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();

      const stripHtml = (html: string) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
      };

      const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
      };

      pdf.setFontSize(22);
      pdf.setTextColor(46, 91, 255);
      pdf.setFont("helvetica", "bold");
      const title = truncateText(submission.quiz.title, 80);
      pdf.text(title, pageWidth / 2, 20, { align: "center" });

      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "bold");
      pdf.text("Student Information", 15, 40);

      pdf.setDrawColor(200, 200, 200);
      pdf.line(15, 43, pageWidth - 15, 43);

      pdf.setFontSize(11);
      pdf.setTextColor(80, 80, 80);
      pdf.setFont("helvetica", "normal");

      const studentInfoData = [
        ["Student Name:", truncateText(submission.studentName, 50)],
        ["Score:", `${submission.score}%`],
        ["Grade:", getGrade(submission.score)],
        ["Time Taken:", formatTimeSpent(submission.timeSpent)],
        ["Submission Date:", formatDate(submission.submittedAt)],
      ];

      let yPos = 50;
      studentInfoData.forEach(([label, value]) => {
        pdf.text(label, 15, yPos);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(46, 91, 255);
        pdf.text(value, 70, yPos);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(80, 80, 80);
        yPos += 7;
      });

      const scoreX = pageWidth - 50;
      const scoreY = 50;

      pdf.setFillColor(240, 240, 245);
      pdf.roundedRect(scoreX, scoreY, 40, 25, 2, 2, "F");

      pdf.setFontSize(20);
      pdf.setTextColor(46, 91, 255);
      pdf.setFont("helvetica", "bold");
      pdf.text(`${submission.score}%`, scoreX + 20, scoreY + 15, {
        align: "center",
      });

      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text("Score", scoreX + 20, scoreY + 22, { align: "center" });

      const progressWidth = 40;
      const progressFilled = (submission.score / 100) * progressWidth;

      pdf.setFillColor(230, 230, 230);
      pdf.roundedRect(scoreX, scoreY + 28, progressWidth, 5, 2, 2, "F");

      let progressColor: [number, number, number];
      if (submission.score >= 70) {
        progressColor = [0, 168, 89];
      } else if (submission.score >= 50) {
        progressColor = [255, 152, 0];
      } else {
        progressColor = [244, 67, 54];
      }

      pdf.setFillColor(progressColor[0], progressColor[1], progressColor[2]);
      pdf.roundedRect(scoreX, scoreY + 28, progressFilled, 5, 2, 2, "F");

      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "bold");
      pdf.text("Questions & Answers", 15, 85);

      pdf.line(15, 88, pageWidth - 15, 88);

      const tableData =
        submission.quiz.questions?.map((q: Question, idx: number) => {
          const answerIdx = submission.answers?.[idx] ?? -1;
          const studentAnswer =
            answerIdx >= 0 ? q.choices[answerIdx] : "-- No Answer --";
          const isCorrect = answerIdx === q.correctAnswer;

          return [
            (idx + 1).toString(),
            truncateText(stripHtml(q.questionText), 150),
            truncateText(studentAnswer, 80),
            truncateText(q.choices[q.correctAnswer], 80),
            isCorrect ? "✓" : "✗",
          ];
        }) || [];

      autoTable(pdf, {
        startY: 92,
        head: [["#", "Question", "Student Answer", "Correct Answer", "Result"]],
        body: tableData,
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 4,
          overflow: "linebreak",
          textColor: [60, 60, 60],
          font: "helvetica",
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [46, 91, 255],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: "bold",
          halign: "center",
          lineWidth: 0.1,
        },
        columnStyles: {
          0: { cellWidth: 15, halign: "center" },
          1: { cellWidth: 75 },
          2: { cellWidth: 40 },
          3: { cellWidth: 40 },
          4: { cellWidth: 20, halign: "center" },
        },
        margin: { left: 15, right: 15 },
        didParseCell: function (data) {
          if (data.column.index === 4 && data.cell.raw) {
            const isCorrect = data.cell.raw === "✓";
            data.cell.styles.textColor = isCorrect
              ? [0, 168, 89]
              : [244, 67, 54];
            data.cell.styles.fontStyle = "normal";
            data.cell.styles.fontSize = 10;
          }
          if (data.column.index === 1) {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fontSize = 12;
          }
        },
        willDrawCell: function (data) {
          if (data.row.index % 2 === 0 && data.row.index > 0) {
            data.doc.setFillColor(250, 250, 250);
            data.doc.rect(
              data.cell.x,
              data.cell.y,
              data.cell.width,
              data.cell.height,
              "F"
            );
          }
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const finalY = (pdf as any).lastAutoTable.finalY + 15;

      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "bold");
      pdf.text("Results Summary", 15, finalY);

      pdf.line(15, finalY + 3, pageWidth - 15, finalY + 3);

      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      pdf.setFont("helvetica", "normal");

      const correctAnswers =
        submission.quiz.questions?.filter((q: Question, idx: number) => {
          const answerIdx = submission.answers?.[idx] ?? -1;
          return answerIdx === q.correctAnswer;
        }).length || 0;

      const wrongAnswers =
        (submission.quiz.questions?.length || 0) - correctAnswers;
      const successRate = Math.round(
        (correctAnswers / (submission.quiz.questions?.length || 1)) * 100
      );

      const summaryData = [
        [
          "Total Questions:",
          (submission.quiz.questions?.length || 0).toString(),
        ],
        ["Correct Answers:", correctAnswers.toString()],
        ["Wrong Answers:", wrongAnswers.toString()],
        ["Success Rate:", `${successRate}%`],
        ["Score:", `${submission.score}%`],
        ["Grade:", getGrade(submission.score)],
      ];

      let summaryY = finalY + 12;
      summaryData.forEach(([label, value]) => {
        pdf.text(label, 15, summaryY);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(46, 91, 255);
        pdf.text(value, 70, summaryY);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(80, 80, 80);
        summaryY += 6;
      });

      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.setFont("helvetica", "italic");
      pdf.text(
        `Generated by Mokta'b Quiz System • ${new Date().toLocaleDateString(
          "en-US"
        )}`,
        pageWidth / 2,
        pdf.internal.pageSize.getHeight() - 10,
        { align: "center" }
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

      const fileName =
        `Result_${submission.studentName}_${submission.quiz.title}.pdf`
          .replace(/[^a-zA-Z0-9_\-]/g, "_")
          .substring(0, 100);

      pdf.save(fileName);
    } catch (error) {
      console.error("PDF export error:", error);
      alert("Failed to create PDF file");
    } finally {
      setIsGeneratingPDF(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-foreground/70">{t.common.loading}...</p>
      </div>
    );
  }

  const isStudent = user?.role === "student";

  return (
    <div className={`space-y-8 ${isRTL ? "rtl" : "ltr"}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            {isStudent
              ? isRTL
                ? "لوحة التحكم"
                : "Dashboard"
              : t.dashboard.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <p className="text-lg text-foreground/80">
              {isStudent
                ? `${isRTL ? "امتحاناتي" : "My Submissions"} • ${
                    submissions.length
                  } ${submissions.length === 1 ? "submission" : "submissions"}`
                : `${t.dashboard.myQuizzes} • ${quizzes.length} ${
                    quizzes.length === 1
                      ? t.dashboard.quiz
                      : t.dashboard.quizzes
                  }`}
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
            <span>{isRTL ? "الملف الشخصي" : "Profile"}</span>
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
                {isRTL ? "لا توجد تسليمات" : "No Submissions Yet"}
              </h3>
              <p className="text-foreground/70 mb-8">
                {isRTL
                  ? "لم تقم بتسليم أي امتحانات بعد"
                  : "You haven't submitted any quizzes yet"}
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
                          {submission.quiz.questions?.length || 0}{" "}
                          {t.quiz.questions}
                        </span>
                        <div
                          className={`px-4 py-2 rounded-full text-sm font-medium ${
                            submission.score >= 90
                              ? "bg-green-500/20 text-green-700 dark:text-green-300"
                              : submission.score >= 70
                              ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300"
                              : submission.score >= 50
                              ? "bg-orange-500/20 text-orange-700 dark:text-orange-300"
                              : "bg-red-500/20 text-red-700 dark:text-red-300"
                          }`}
                        >
                          <div className="font-semibold">{submission.score}%</div>
                        </div>
                        <div className="px-4 py-2 bg-foreground/10 text-foreground/80 rounded-full text-sm font-medium border border-foreground/20">
                          {submission.quiz.questions && (
                            <span className="text-xs font-semibold">
                              {
                                submission.quiz.questions.filter(
                                  (q, idx) =>
                                    submission.answers?.[idx] ===
                                    q.correctAnswer
                                ).length
                              }{" "}
                              / {submission.quiz.questions.length}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-foreground/70">
                          <Calendar className="w-4 h-4" />
                          {formatDate(submission.submittedAt)}
                        </div>
                        {submission.timeSpent && (
                          <div className="flex items-center gap-2 text-foreground/70">
                            <ClockIcon className="w-4 h-4" />
                            {formatTimeSpent(submission.timeSpent)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 justify-end">
                    <button
                      onClick={() => setSelectedSubmission(submission)}
                      className="group flex items-center gap-2 px-5 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all duration-200 hover:shadow-md"
                      title={isRTL ? "عرض التفاصيل" : "View Details"}
                    >
                      <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="hidden sm:inline">{t.common.view}</span>
                    </button>
                    <button
                      onClick={() => downloadStudentExcel(submission)}
                      className="group flex items-center gap-2 px-5 py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 rounded-xl transition-all duration-200 hover:shadow-md"
                      title="Download Excel"
                    >
                      <FileSpreadsheet className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="hidden sm:inline">Excel</span>
                    </button>
                    <button
                      onClick={() => downloadStudentPDF(submission)}
                      disabled={isGeneratingPDF === submission.id}
                      className={`group flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-200 hover:shadow-md ${
                        isGeneratingPDF === submission.id
                          ? "opacity-50 cursor-not-allowed bg-red-500/10 text-red-600/50"
                          : "bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
                      }`}
                      title="Download PDF"
                    >
                      <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="hidden sm:inline">PDF</span>
                    </button>
                  </div>
                </div>
                {isGeneratingPDF === submission.id && (
                  <div className="text-xs text-foreground/60 mt-2 text-center">
                    Generating PDF...
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : quizzes.length === 0 ? (
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
                      <Image
                        src={quiz.thumbnail}
                        alt={quiz.displayName || quiz.title}
                        width={80}
                        height={80}
                        loading="eager"
                        className="w-20 h-20 object-cover rounded-xl shadow-md"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
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
                          {isRTL ? "بواسطة" : "by"} {quiz.creatorName}
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
                          {isRTL ? "محدث" : "Updated"}{" "}
                          {formatDate(quiz.updatedAt)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 justify-end">
                  <button
                    onClick={() => copyQuizLink(quiz)}
                    className="group flex items-center gap-2 px-5 py-2.5 bg-muted/50 hover:bg-muted rounded-xl transition-all duration-200 text-foreground/90 hover:shadow-md"
                    title={isRTL ? "نسخ رابط الاختبار" : "Copy quiz link"}
                  >
                    <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="hidden sm:inline">
                      {t.dashboard.copyLink}
                    </span>
                  </button>

                  <Link
                    href={`/quiz/${quiz.slug || quiz.id}/submissions`}
                    className="group flex items-center gap-2 px-5 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all duration-200 hover:shadow-md"
                  >
                    <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="hidden sm:inline">
                      {t.dashboard.viewSubmissions}
                    </span>
                  </Link>

                  <Link
                    href={`/quiz/${quiz.slug || quiz.id}/edit`}
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
                <div className="text-center p-4 bg-linear-to-br from-primary/5 to-transparent rounded-2xl">
                  <div className="text-2xl font-bold flex items-center justify-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    {quiz.submissionsCount || 0}
                  </div>
                  <div className="text-sm text-foreground/70 mt-2">
                    {t.dashboard.submissions}
                  </div>
                </div>
                <div className="text-center p-4 bg-linear-to-br from-green-500/5 to-transparent rounded-2xl">
                  <div className="text-2xl font-bold flex items-center justify-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    {quiz.averageScore ? `${quiz.averageScore}%` : "--"}
                  </div>
                  <div className="text-sm text-foreground/70 mt-2">
                    {t.dashboard.avgScore}
                  </div>
                </div>
                <div className="text-center p-4 bg-linear-to-br from-purple-500/5 to-transparent rounded-2xl">
                  <div className="text-2xl font-bold">
                    {quiz.questions.length}
                  </div>
                  <div className="text-sm text-foreground/70 mt-2">
                    {t.quiz.questions}
                  </div>
                </div>
                <div className="text-center p-4 bg-linear-to-br from-yellow-500/5 to-transparent rounded-2xl">
                  <div className="text-2xl font-bold">
                    {quiz.timeLimit
                      ? `${quiz.timeLimit} ${t.quiz.minutes}`
                      : "∞"}
                  </div>
                  <div className="text-sm text-foreground/70 mt-2">
                    {t.dashboard.timeLimit}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {!isStudent && quizzes.length > 0 && (
        <div className="bg-card rounded-3xl shadow-lg p-8 border border-border/50">
          <h3 className="text-2xl font-semibold mb-8 text-center md:text-left">
            {t.dashboard.summary}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-linear-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20">
              <div className="text-3xl font-bold text-primary">
                {quizzes.length}
              </div>
              <div className="text-sm text-foreground/70 mt-2">
                {t.dashboard.totalQuizzes}
              </div>
            </div>
            <div className="text-center p-6 bg-linear-to-br from-green-500/10 to-green-500/5 rounded-2xl border border-green-500/20">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {quizzes.reduce((sum, q) => sum + q.questions.length, 0)}
              </div>
              <div className="text-sm text-foreground/70 mt-2">
                {t.dashboard.totalQuestions}
              </div>
            </div>
            <div className="text-center p-6 bg-linear-to-br from-purple-500/10 to-purple-500/5 rounded-2xl border border-purple-500/20">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {quizzes.reduce((sum, q) => sum + (q.submissionsCount || 0), 0)}
              </div>
              <div className="text-sm text-foreground/70 mt-2">
                {t.dashboard.totalSubmissions}
              </div>
            </div>
            <div className="text-center p-6 bg-linear-to-br from-yellow-500/10 to-yellow-500/5 rounded-2xl border border-yellow-500/20">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {quizzes.filter((q) => (q.submissionsCount || 0) > 0).length}
              </div>
              <div className="text-sm text-foreground/70 mt-2">
                {t.dashboard.activeQuizzes}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips for Teachers/Admins */}
      {!isStudent && (
        <div className="bg-linear-to-r from-primary/5 to-primary-dark/5 rounded-3xl p-6 border border-primary/20">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-primary">💡</span>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">
                {isRTL ? "نصائح سريعة" : "Quick Tips"}
              </h4>
              <ul className="space-y-2 text-foreground/70">
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  {isRTL
                    ? "انقر على أيقونة النسخ لمشاركة رابط الاختبار مع الطلاب"
                    : "Click the copy icon to share quiz link with students"}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  {isRTL
                    ? "يمكنك تعديل الاختبار في أي وقت عن طريق زر التعديل"
                    : "You can edit the quiz anytime using the edit button"}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  {isRTL
                    ? "عرض الإجابات لرؤية أداء الطلاب وتحليل النتائج"
                    : "View submissions to see student performance and analyze results"}
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tips for Students */}
      {isStudent && (
        <div className="bg-linear-to-r from-green-500/5 to-blue-500/5 rounded-3xl p-6 border border-green-500/20">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <span className="text-green-600">📊</span>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2 text-green-700 dark:text-green-300">
                {isRTL ? "نصائح للنتائج" : "Results Tips"}
              </h4>
              <ul className="space-y-2 text-foreground/70">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">•</span>
                  {isRTL
                    ? 'انقر على زر "عرض" لرؤية تفاصيل إجابتك على كل سؤال'
                    : 'Click "View" to see detailed answers for each question'}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">•</span>
                  {isRTL
                    ? "يمكنك تحميل نتيجتك بتنسيق Excel للحفظ أو المشاركة"
                    : "Download your results in Excel format for saving or sharing"}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">•</span>
                  {isRTL
                    ? "احصل على تقرير PDF شامل يحتوي على جميع التفاصيل"
                    : "Get a comprehensive PDF report with all the details"}
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Submission Details Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-3xl shadow-2xl border border-border/50 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <div>
                <h3 className="text-2xl font-bold bg-linear-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                  {isRTL ? "تفاصيل الامتحان" : "Quiz Details"}
                </h3>
                <p className="text-lg text-foreground/80 mt-1">
                  {selectedSubmission.studentName} •{" "}
                  {isRTL ? "الدرجة" : "Score"}: {selectedSubmission.score}%
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
              {selectedSubmission.quiz.questions?.map(
                (question: Question, index: number) => {
                  const studentAnswer =
                    selectedSubmission.answers?.[index] ?? -1;
                  const isCorrect = studentAnswer === question.correctAnswer;

                  return (
                    <div
                      key={index}
                      className={`p-6 rounded-2xl border ${
                        isCorrect
                          ? "bg-green-500/5 border-green-500/30"
                          : "bg-red-500/5 border-red-500/30"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              isCorrect
                                ? "bg-green-500 text-white"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <span className="font-semibold text-foreground">
                            {question.questionText}
                          </span>
                        </div>
                        <span
                          className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                            isCorrect
                              ? "bg-green-500/20 text-green-700 dark:text-green-300"
                              : "bg-red-500/20 text-red-700 dark:text-red-300"
                          }`}
                        >
                          {isCorrect
                            ? isRTL
                              ? "صحيح"
                              : "Correct"
                            : isRTL
                            ? "خطأ"
                            : "Incorrect"}
                        </span>
                      </div>

                      <div className="space-y-3 ml-0 sm:ml-11">
                        {question.choices.map(
                          (choice: string, choiceIndex: number) => {
                            let bgClass = "bg-muted/50 border-border";
                            let textClass = "text-foreground/90";
                            let mark = null;

                            if (choiceIndex === question.correctAnswer) {
                              bgClass = "bg-green-500/10 border-green-500/30";
                              textClass = "text-green-700 dark:text-green-300";
                              mark = (
                                <Check className="w-4 h-4 text-green-600" />
                              );
                            } else if (choiceIndex === studentAnswer) {
                              bgClass = "bg-red-500/10 border-red-500/30";
                              textClass = "text-red-700 dark:text-red-300";
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
                          }
                        )}
                      </div>
                    </div>
                  );
                }
              )}
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
