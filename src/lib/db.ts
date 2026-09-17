import Dexie, { type Table } from "dexie";

export interface QuizResultRow {
  id?: number;
  chapterId: string;
  chapterTitleAr: string;
  chapterTitleFr: string;
  score: number;
  total: number;
  createdAt: number;
}

export interface QuizAnswerRow {
  id?: number;
  quizId: number;
  questionId: string;
  correct: boolean;
}

export interface ProfileRow {
  key: string;
  branchSlug: string;
  studyLang: "ar" | "fr";
  updatedAt: number;
}

export class NajihDB extends Dexie {
  results!: Table<QuizResultRow, number>;
  answers!: Table<QuizAnswerRow, number>;
  profile!: Table<ProfileRow, string>;

  constructor() {
    super("najih-db");
    this.version(1).stores({
      results: "++id, chapterId, createdAt",
      answers: "++id, quizId",
    });
    this.version(2).stores({
      results: "++id, chapterId, createdAt",
      answers: "++id, quizId",
      profile: "key",
    });
  }
}

export const db = new NajihDB();