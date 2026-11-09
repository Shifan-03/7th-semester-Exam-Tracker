export interface Chapter {
  id: string;
  title: string;
  completed: boolean;
  revised: boolean;
  revisionCount: number; // 0, 1, 2, 3+
}

export type ExamUrgency = 'urgent' | 'mid' | 'ok' | 'done' | 'none';

export interface Exam {
  id: number; // 0 to 5
  name: string;
  subjectCode: string;
  date: string; // ISO string e.g. "2026-11-15T09:00"
  targetScore: number;
  color: string; // accent color identifier
  notes: string;
  chapters: Chapter[];
}

export interface ExamCountdown {
  urgency: ExamUrgency;
  totalHours: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isOverdue: boolean;
  hasDate: boolean;
  label: string;
}

export interface ExamProgress {
  total: number;
  completed: number;
  revised: number;
  totalRevisions: number;
  completionPercent: number;
  revisionPercent: number;
  readinessScore: number; // weighted formula
}

export interface ParticleConfig {
  sakuraEnabled: boolean;
  embersEnabled: boolean;
  density: 'low' | 'medium' | 'high';
  speed: number;
  backdropBrightness: 'dim' | 'balanced' | 'vivid';
  backdropBlur: boolean;
}

export type ThemeType = 'dark' | 'midnight' | 'light';
