import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentName: { type: String, required: true },
  answers: [{ type: Number, required: true }],
  score: { type: Number, required: true },
  startTime: { type: Date },
  endTime: { type: Date },
  timeSpent: { type: Number },
  submittedAt: { type: Date, default: Date.now }
});

export const Submission = mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);
