# Software Requirements Specification (SRS)
## AI-Based Job Recommendation System (AI Job Matcher)

**Version:** 2.0
**Date:** March 2026
**Prepared by:** AI Job Matcher Team

---

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to detail the software requirements for the AI-Based Job Recommendation System (AI Job Matcher). It provides a comprehensive overview of the system's intended capabilities, features, and constraints. This document serves as a guideline for developers, testers, and stakeholders throughout the development lifecycle.

### 1.2 Scope
The AI Job Matcher is a web-based application designed to bridge the gap between job seekers and employers by leveraging Artificial Intelligence. The system parses resumes, evaluates candidate skills, and recommends the most suitable job descriptions using AI algorithms. It streamlines the recruitment process, making it more efficient and accurate.

### 1.3 Project Team & Roles

The project is developed collaboratively by the following team members:

*   **24DIT009 (Manthan Chavda) - Backend Developer & Security**
    *   **Role:** Lead Backend Developer and Security Analyst
    *   **Features/Responsibilities:** 
        *   Developing the core RESTful APIs (Express.js/Node.js).
        *   Implementing backend business logic and routing (e.g., jobs, resumes, applications, admin).
        *   Handling security measures: CORS configuration, environment variable management, centralized error handling, input validation, and secure API endpoints.
*   **24DIT030 (Astha Makwana) - Database Administrator & Authentication**
    *   **Role:** DBA and Identity Access Management
    *   **Features/Responsibilities:** 
        *   Designing MongoDB schemas (User, Resume, Job, Application, ActivityLog).
        *   Implementing secure User Login and Registration flows.
        *   Managing JWT (JSON Web Tokens) based authentication and authorization.
        *   Ensuring secure password hashing (Bcrypt) and maintaining session integrity.
*   **24DIT004 (Yashvi Bhadani) - AI Integration Specialist**
    *   **Role:** Core AI Feature Developer
    *   **Features/Responsibilities:** 
        *   Developing and integrating the AI endpoints (`/api/ai`).
        *   Implementing AI-driven logic for intelligent resume parsing and skill extraction.
        *   Creating the recommendation engine to match extracted candidate profiles with optimal job postings.
*   **24DIT014 (Shivansh Dalvadi) - Frontend Developer**
    *   **Role:** Lead Frontend Engineer
    *   **Features/Responsibilities:** 
        *   Building the interactive user interface using React and Vite.
        *   Translating design wireframes into responsive, high-quality code utilizing Tailwind CSS.
        *   Integrating frontend components and pages to consume backend REST APIs efficiently.
        *   Ensuring an intuitive and smooth user experience across all devices.

---

## 2. Overall Description

### 2.1 Product Perspective
The AI Job Matcher operates as a distributed web application consisting of a React-based frontend client, a Node.js/Express.js backend server, and a MongoDB database for persistent data storage. It interfaces with AI models to perform its core recommendation functionalities.

### 2.2 Product Features
*   **User Management:** Registration, authentication, and role-based access control (Admin, Job Seeker, Employer).
*   **Resume Parsing:** Automated extraction of skills, experience, and education from uploaded resumes using AI.
*   **Job Management:** Employers can post, edit, and manage job listings.
*   **AI Job Recommendation:** System intelligently matches job seekers with relevant job postings based on resume analysis.
*   **Application Tracking:** Users can track the status of jobs they have applied for, and employers can manage received applications.
*   **Admin Dashboard:** Centralized control panel for platform administration and analytics.

### 2.3 Operating Environment
*   **Client:** Modern Web Browsers (Chrome, Firefox, Safari, Edge)
*   **Server Processing:** Node.js environment
*   **Database:** MongoDB
*   **Hosting:** Cross-platform compatibility (Windows, Linux, macOS)

---

## 3. System Features

### 3.1 Authentication & Security (Managed by Astha & Manthan)
*   **Description:** Secure access to the system through credential verification and token management.
*   **Functional Requirements:**
    *   The system shall allow users to securely register and log in.
    *   The system shall encrypt user passwords upon creation.
    *   The system shall issue a JWT for successful logins to maintain session state.
    *   The system shall employ CORS policies to prevent unauthorized cross-origin requests.

### 3.2 AI Recommendation Engine (Managed by Yashvi)
*   **Description:** The core intelligent module that bridges resumes and job descriptions.
*   **Functional Requirements:**
    *   The system shall receive resume text or files and extract actionable data points (skills, experience).
    *   The system shall score job postings against parsed resume profiles to determine match percentages.
    *   The system shall present the top matching jobs to the user efficiently.

### 3.3 Application & Job Management (Backend by Manthan, UI by Shivansh)
*   **Description:** Workflows handling the creation and lifecycle of job postings and user applications.
*   **Functional Requirements:**
    *   Employers shall be able to create, read, update, and delete job postings.
    *   Job seekers shall be able to apply to active job postings.
    *   The system shall maintain the status of applications (e.g., Pending, Reviewed, Accepted).
    *   The UI shall provide responsive dashboards tailored to the user's role.

---

## 4. Non-Functional Requirements

### 4.1 Performance Requirements
*   API response times should optimally be under 500ms for standard CRUD operations.
*   The AI parsing process should complete asynchronously without blocking the main event loop.

### 4.2 Security Requirements
*   All sensitive data must be transmitted over HTTPS.
*   Database credentials and JWT secrets must be stored securely in environment variables (`.env`).
*   Passwords must never be stored in plaintext.

### 4.3 Reliability
*   The system shall include centralized error handling to prevent server crashes on unhandled exceptions.

---

## 5. User Interfaces (Frontend by Shivansh)
*   **Dashboard:** Tailored views for Admin, Employer, and Job Seeker.
*   **Job Feed:** Attractive, paginated or infinitely scrolled list of job postings.
*   **Profile Page:** Interface for managing user details and uploaded resumes.

---
**End of Document**
