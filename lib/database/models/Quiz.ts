import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  choices: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true, min: 0, max: 3 }
});

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  displayName: { type: String },
  thumbnail: { type: String },
  questions: [QuestionSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  linkToken: { type: String, required: true, unique: true },
  timeLimit: { type: Number, min: 1, max: 300 }, // in minutes
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', QuizSchema);
