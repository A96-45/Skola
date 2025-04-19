// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'lecturer';
}

export interface University {
  id: string;
  name: string;
  location: string;
  created_at: string;
}

export interface Course {
  id: string;
  university_id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Homework {
  id: string;
  university_id: string;
  course_id: string;
  teacher_id: string;
  description: string;
  due_date: string;
  created_at: string;
}

export interface Submission {
  id: string;
  homework_id: string;
  student_id: string;
  file_url: string;
  submitted_at: string;
  grade?: number;
  feedback?: string;
}

export interface Feedback {
  id: string;
  university_id: string;
  course_id: string;
  student_id: string;
  teacher_id: string;
  feedback: string;
  created_at: string;
}

export interface Assignment {
  id: string;
  university_id: string;
  course_id: string;
  title: string;
  description: string;
  due_date: string;
  max_points: number;
  lecturer_id: string;
  published: boolean;
  created_at: string;
}

// Mock Data
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'lecturer@example.com',
    name: 'John Doe',
    role: 'lecturer'
  },
  {
    id: '2',
    email: 'student@example.com',
    name: 'Jane Smith',
    role: 'student'
  }
];

export const mockUniversities: University[] = [
  {
    id: '1',
    name: 'Example University',
    location: 'Example City',
    created_at: '2024-01-01T00:00:00Z'
  }
];

export const mockCourses: Course[] = [
  {
    id: '1',
    university_id: '1',
    name: 'Introduction to Computer Science',
    description: 'Basic concepts of computer science',
    created_at: '2024-01-01T00:00:00Z'
  }
];

export const mockHomework: Homework[] = [
  {
    id: '1',
    university_id: '1',
    course_id: '1',
    teacher_id: '1',
    description: 'Complete chapter 1 exercises',
    due_date: '2024-03-30T23:59:59Z',
    created_at: '2024-03-01T00:00:00Z'
  }
];

export const mockSubmissions: Submission[] = [
  {
    id: '1',
    homework_id: '1',
    student_id: '2',
    file_url: 'mock://example.com/submission.pdf',
    submitted_at: '2024-03-15T14:30:00Z'
  }
];

export const mockFeedback: Feedback[] = [
  {
    id: '1',
    university_id: '1',
    course_id: '1',
    student_id: '2',
    teacher_id: '1',
    feedback: 'Good work on the assignment',
    created_at: '2024-03-16T10:00:00Z'
  }
];

export const mockAssignments: Assignment[] = [
  {
    id: '1',
    university_id: '1',
    course_id: '1',
    title: 'Midterm Project',
    description: 'Build a simple web application',
    due_date: '2024-04-15T23:59:59Z',
    max_points: 100,
    lecturer_id: '1',
    published: true,
    created_at: '2024-03-01T00:00:00Z'
  }
]; 