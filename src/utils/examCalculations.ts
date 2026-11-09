import { Exam, ExamCountdown, ExamProgress } from '../types';

export function calculateCountdown(dateStr: string, now: Date = new Date()): ExamCountdown {
  if (!dateStr) {
    return {
      urgency: 'none',
      totalHours: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isOverdue: false,
      hasDate: false,
      label: 'Date not set',
    };
  }

  const target = new Date(dateStr).getTime();
  const diffMs = target - now.getTime();

  if (isNaN(target)) {
    return {
      urgency: 'none',
      totalHours: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isOverdue: false,
      hasDate: false,
      label: 'Invalid date',
    };
  }

  if (diffMs <= 0) {
    return {
      urgency: 'done',
      totalHours: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isOverdue: true,
      hasDate: true,
      label: 'Exam completed',
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const totalHours = Math.floor(totalSeconds / 3600);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let urgency: ExamCountdown['urgency'] = 'ok';
  if (totalHours <= 72) {
    urgency = 'urgent';
  } else if (totalHours <= 168) {
    urgency = 'mid';
  }

  return {
    urgency,
    totalHours,
    days,
    hours,
    minutes,
    seconds,
    isOverdue: false,
    hasDate: true,
    label: `${totalHours} hrs left`,
  };
}

export function calculateProgress(exam: Exam): ExamProgress {
  const total = exam.chapters.length;
  if (total === 0) {
    return {
      total: 0,
      completed: 0,
      revised: 0,
      totalRevisions: 0,
      completionPercent: 0,
      revisionPercent: 0,
      readinessScore: 0,
    };
  }

  const completed = exam.chapters.filter((c) => c.completed).length;
  const revised = exam.chapters.filter((c) => c.revised || c.revisionCount > 0).length;
  const totalRevisions = exam.chapters.reduce((sum, c) => sum + (c.revisionCount || 0), 0);

  const completionPercent = Math.round((completed / total) * 100);
  const revisionPercent = Math.round((revised / total) * 100);

  // Readiness score: rewards completion + deep revision iterations
  const baseScore = completionPercent * 0.5 + revisionPercent * 0.35;
  const masteryBonus = Math.min(15, totalRevisions * 2.5); // bonus for multiple revision rounds
  const readinessScore = Math.min(100, Math.round(baseScore + masteryBonus));

  return {
    total,
    completed,
    revised,
    totalRevisions,
    completionPercent,
    revisionPercent,
    readinessScore,
  };
}

export function formatExamDate(dateStr: string): string {
  if (!dateStr) return 'Unscheduled';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}
