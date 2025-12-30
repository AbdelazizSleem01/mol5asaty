import mongoose from 'mongoose';
import slugify from 'slugify';

export async function generateUniqueSlug(title: string): Promise<string> {
  let baseSlug = slugify(title, {
    lower: true,
    strict: true,
    locale: 'en'
  });

  baseSlug = baseSlug.replace(/[أإآ]/g, 'a')
                      .replace(/[ة]/g, 'h')
                      .replace(/[ى]/g, 'a')
                      .replace(/[ئءؤ]/g, 'a')
                      .replace(/[ش]/g, 'sh')
                      .replace(/[ع]/g, 'a')
                      .replace(/[غ]/g, 'gh')
                      .replace(/[ف]/g, 'f')
                      .replace(/[ق]/g, 'q')
                      .replace(/[ك]/g, 'k')
                      .replace(/[ل]/g, 'l')
                      .replace(/[م]/g, 'm')
                      .replace(/[ن]/g, 'n')
                      .replace(/[ه]/g, 'h')
                      .replace(/[و]/g, 'w')
                      .replace(/[ي]/g, 'y')
                      .replace(/[ز]/g, 'z')
                      .replace(/[ر]/g, 'r')
                      .replace(/[ت]/g, 't')
                      .replace(/[د]/g, 'd')
                      .replace(/[خ]/g, 'kh')
                      .replace(/[ج]/g, 'j')
                      .replace(/[ث]/g, 'th')
                      .replace(/[ص]/g, 's')
                      .replace(/[ض]/g, 'd')
                      .replace(/[ط]/g, 't')
                      .replace(/[ظ]/g, 'z')
                      .replace(/[ب]/g, 'b');

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existingQuiz = await mongoose.models.Quiz.findOne({ slug });
    if (!existingQuiz) {
      break;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

const QuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  choices: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true, min: 0, max: 3 }
});

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  displayName: { type: String },
  slug: { type: String, unique: true, sparse: true },
  thumbnail: { type: String },
  questions: [QuestionSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  linkToken: { type: String, required: true, unique: true },
  timeLimit: { type: Number, min: 1, max: 300 },
  hashedPassword: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', QuizSchema);
