export interface Schedule {
  id: string;
  title: string;
  type: "meeting" | "class" | "assignment" | "exam" | "other" | "imported";
  priority: "high" | "medium" | "low";
  date: Date;
  startTime: string;
  endTime: string;
  description: string;
  recurrence: "none" | "daily" | "weekly" | "monthly";
  reminder: boolean;
  reminderTime?: number;
  metadata?: {
    source: 'manual' | 'pdf' | 'google-calendar';
    aiTags?: string[];
  };
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}

export interface DaySchedule {
  date: Date;
  schedules: Schedule[];
} 