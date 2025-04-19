# Lecturer-Student Linking Feature

## Overview

The Lecturer-Student Linking feature allows students to connect with their lecturers through a unique ID system. This document outlines how this feature works and provides implementation details for both frontend and backend components.

## Frontend Implementation

The frontend implementation consists of:

1. A "Link Lecturer" button on each subject/course card
2. A modal popup where students can enter the lecturer's unique ID
3. A confirmation mechanism once the linking is successful

## Backend Implementation

The backend implementation requires several components:

### 1. Database Schema

The database should include the following tables:

**Users Table**
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  role ENUM('student', 'lecturer', 'admin') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Lecturers Table**
```sql
CREATE TABLE lecturers (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  lecturer_code VARCHAR(20) NOT NULL UNIQUE,
  department VARCHAR(100),
  specialization VARCHAR(100),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Students Table**
```sql
CREATE TABLE students (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  student_id VARCHAR(20) NOT NULL UNIQUE,
  program VARCHAR(100),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Courses Table**
```sql
CREATE TABLE courses (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Lecturer_Courses Table**
```sql
CREATE TABLE lecturer_courses (
  lecturer_id VARCHAR(36) NOT NULL,
  course_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (lecturer_id, course_id),
  FOREIGN KEY (lecturer_id) REFERENCES lecturers(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
```

**Student_Lecturer_Links Table**
```sql
CREATE TABLE student_lecturer_links (
  id VARCHAR(36) PRIMARY KEY,
  student_id VARCHAR(36) NOT NULL,
  lecturer_id VARCHAR(36) NOT NULL,
  course_id VARCHAR(36) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (lecturer_id) REFERENCES lecturers(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE KEY (student_id, lecturer_id, course_id)
);
```

### 2. API Endpoints

The following RESTful API endpoints are required:

**Lecturer Endpoints**

- `POST /api/lecturers/register` - Register as a lecturer and generate a unique lecturer code
- `GET /api/lecturers/profile` - Get lecturer profile information
- `GET /api/lecturers/students` - Get all students linked to the lecturer
- `PUT /api/lecturers/links/:linkId/approve` - Approve a student link request
- `PUT /api/lecturers/links/:linkId/reject` - Reject a student link request

**Student Endpoints**

- `POST /api/students/links` - Create a new lecturer-student link
  ```json
  {
    "lecturerCode": "LECT-12345",
    "courseId": "course-uuid-here"
  }
  ```
- `GET /api/students/lecturers` - Get all lecturers linked to the student
- `DELETE /api/students/links/:linkId` - Remove a lecturer link

### 3. Lecturer ID Generation

When a lecturer registers, the system automatically generates a unique identifier:

```javascript
// Example code for generating a lecturer code
function generateLecturerCode() {
  const prefix = 'LECT-';
  const randomDigits = Math.floor(10000 + Math.random() * 90000); // 5-digit number
  return `${prefix}${randomDigits}`;
}
```

### 4. Authentication & Authorization

- JWT-based authentication for all API endpoints
- Role-based access control to ensure students can only link lecturers and lecturers can only approve/reject their own link requests

### 5. Notification System

- WebSocket implementation to provide real-time notifications when:
  - A student requests to link with a lecturer
  - A lecturer approves/rejects a link request

### 6. Implementation Plan

1. Set up the database schema
2. Implement the user, lecturer, and student authentication systems
3. Add the lecturer code generation during registration
4. Create the link request API endpoints
5. Implement the approval/rejection flow
6. Add WebSocket notifications
7. Create admin tools for managing links and codes

## Security Considerations

1. Lecturer codes should be treated as sensitive information
2. Rate limiting should be implemented on the link request endpoint to prevent brute force attacks
3. IP-based rate limiting for failed linking attempts
4. All API endpoints must be protected with proper authentication
5. Validate that students can only request links for courses they are enrolled in

## Testing

1. Unit tests for the lecturer code generation
2. Integration tests for the link request flow
3. Security tests to ensure unauthorized users cannot create links

## Future Enhancements

1. QR code generation for easy lecturer code sharing
2. Bulk linking via CSV upload
3. Temporary link requests that expire after a certain period
4. Analytics dashboard for lecturers to see link statistics 