Student Progress Tracker
A full-stack classroom observation application for tracking daily student progress, homework, classroom behaviour, participation, and extra-credit achievements.
The application currently supports two Grade 6 classrooms:
Classroom Students
Class 6-1 38
Class 6-2 33
Total 71

The interface provides a classroom dashboard, searchable rosters, individual student profiles, a calendar highlighting dates with saved records, and on-demand performance summaries. Access is protected by an administrator login using Spring Security sessions and BCrypt password hashing. JWT is not used.
Technology stack
Backend

- Java 17
- Spring Boot 3.3.5
- Maven
- Spring Web (REST APIs)
- Spring Data JPA / Hibernate
- Bean Validation
- Spring Security
- BCrypt password encoder
  Database
- MySQL 8+
  Frontend
- React 18 (JSX)
- Vite 5
- React Router 6
- Bootstrap 5
- lucide-react for icons
- react-calendar for daily observation navigation
  Prerequisites
- JDK 17+
- Maven 3.9+
- Node.js 20+ (use a version compatible with your installed Vite release)
- npm
- MySQL 8+
  Project structure
  student-progress-tracker/
  ├── backend/
  │ ├── pom.xml
  │ └── src/main/
  │ ├── java/com/studenttracker/
  │ │ ├── auth/ # Admin entity, repository, auth DTO and controller
  │ │ ├── config/ # Spring Security and CORS configuration
  │ │ └── ... # Student, record, service and repository layers
  │ └── resources/
  │ ├── application.properties
  │ └── students.csv # Initial class rosters
  ├── frontend/
  │ ├── package.json
  │ ├── .env.example
  │ └── src/
  │ ├── api.js
  │ ├── App.jsx
  │ ├── main.jsx
  │ ├── style.css
  │ ├── components/
  │ │ ├── Navbar.jsx
  │ │ ├── LogoutButton.jsx
  │ │ ├── ProtectedRoute.jsx
  │ │ └── ChoiceGroup.jsx
  │ └── pages/
  │ ├── Login.jsx
  │ ├── Home.jsx
  │ ├── ClassPage.jsx
  │ └── StudentPage.jsx
  └── README.md
  The layout above highlights the main files; your backend may contain additional packages and classes.

1. Create the MySQL database
   Start MySQL and run:
   CREATE DATABASE IF NOT EXISTS student_tracker;
   Alternatively, a JDBC connection configured with createDatabaseIfNotExist=true can create the database if the MySQL account has sufficient privileges.
   The backend uses MySQL to persist administrators, students, daily records, and selected behaviours.
2. Start the Spring Boot backend
   From the project root, on macOS or Linux:
   cd backend
   export DB_USER=root
   export DB_PASSWORD='your-mysql-password'
   mvn spring-boot:run
   On Windows PowerShell:
   cd backend
   $env:DB_USER='root'
$env:DB_PASSWORD='your-mysql-password'
   mvn spring-boot:run
   The backend listens on http://localhost:8080 by default.
   Ensure your application.properties uses the corresponding database environment variables and database name. The exact JDBC connection settings depend on your existing backend configuration.
3. Start the React frontend
   In a separate terminal, from the project root:
   cd frontend
   npm install
   cp .env.example .env
   npm run dev
   For Windows PowerShell, use Copy-Item .env.example .env instead of cp if needed.
   Example frontend .env:
   VITE_API_BASE_URL=http://localhost:8080/api
   The Vite development server normally opens at http://localhost:5173.
   Important: For local session authentication, use the same hostname consistently (for example, localhost for both frontend and backend), and keep credentials: 'include' in frontend API requests.
4. Create the first administrator
   The backend provides an initial registration endpoint. Registration is designed to succeed only while no administrator exists.
   POST /api/auth/register
   Request body (Postman → Body → raw → JSON):
   {
   "username": "admin",
   "password": "replace-with-a-strong-password"
   }
   Expected successful response: 201 Created.
   Passwords are hashed using BCrypt before being stored in the admin_users table. The plaintext password is not stored.
   After the first administrator exists, further registration attempts are rejected. The initial-registration check is intended for controlled setup; it is not a concurrency-safe provisioning mechanism for a public deployment.
5. Log in and log out
   Log in
   POST /api/auth/login
   {
   "username": "admin",
   "password": "replace-with-a-strong-password"
   }
   On success, the backend verifies the BCrypt password, creates or uses an HTTP session, and stores the Spring Security authentication context. The browser or Postman retains the session cookie (JSESSIONID).
   Example response:
   {
   "message": "Login successful",
   "username": "admin"
   }
   The React application starts at the login page for unauthenticated users. After login, it navigates to the classroom dashboard.
   Check the active session
   GET /api/auth/me
   Returns the authenticated username when the session is valid. React uses this endpoint to protect the homepage, classroom roster, and student profile routes.
   Log out
   POST /api/auth/logout
   Invalidates the session and returns the user to the login page.
   Authentication design: This project uses session-based authentication, not JWT, OAuth tokens, or bearer tokens. The frontend includes cookies in requests with:
   credentials: 'include'
6. Classroom and student features
   Classroom dashboard

- Choose Class 6-1 or Class 6-2.
- See the corresponding student counts.
- Use the shared navigation bar and Logout button.
  Classroom roster
- Browse students by class.
- Search by first name, last name, or roll number.
- Open an individual student profile.
  Daily observation
  Select a date and record any of the following:
  Section Input type Options
  Homework Single choice, optional Not done; Partially done; Well done
  Class behaviour Multiple choice, optional Talking; Distracted; Zoned out; Distracting others
  Class participation Single choice, optional Taking initiative; Answers when prompted; Reluctant to answer; Unable after multiple prompts; Unable to remedy after explanation
  Extra credits Optional text Teacher-entered positive achievement or note

- Dates containing saved observations are marked with a dot in the calendar.
- Choose an unrecorded date to Save a new observation.
- Choose an existing date to Update or Delete its observation.
- The Save button is disabled and visibly dimmed when a record already exists for that date.
- Deleting an observation requires confirmation in the UI.
- Blank sections are not automatically treated as negative results.
  Consolidated performance
  Generate a report for:
- All recorded dates, or
- A custom date range.
  The report is calculated only when the teacher clicks Consolidate; it is not saved as a separate report record.
  The summary includes recorded days, homework entries, participation entries, counts for each option, and dated extra-credit notes.
  Percentages use these denominators:
  Section Denominator
  Homework Number of saved records with a homework selection
  Class behaviour Total number of recorded days in the selected range
  Class participation Number of saved records with a participation selection

For example, if Well done is selected on 2 of 4 homework-recorded days, the UI displays 2 of 4, 50%. Behaviour selections can overlap because multiple behaviours may be selected on the same date; their percentages therefore need not sum to 100%. 7. REST API reference
All student and classroom endpoints require a valid authenticated session.
Authentication
Method Endpoint Description
POST /api/auth/register Create the initial administrator
POST /api/auth/login Authenticate username and password
GET /api/auth/me Get the currently authenticated administrator
POST /api/auth/logout Invalidate the session

Students and observations
Method Endpoint Description
GET /api/classes/6-1/students Class 6-1 roster
GET /api/classes/6-2/students Class 6-2 roster
GET /api/students/{id} Student details
GET /api/students/{id}/records?from=2026-09-01&to=2026-10-17 Saved observations in a date range
POST /api/students/{id}/records Create a daily observation
PUT /api/students/{id}/records Update an existing daily observation
DELETE /api/students/{id}/records?date=2026-10-17 Delete the observation for a date
GET /api/students/{id}/consolidate?from=2026-09-01&to=2026-10-17 Calculate a performance summary

Example daily observation JSON:
{
"date": "2026-10-17",
"homework": "WELL_DONE",
"behaviours": ["TALKING", "DISTRACTED"],
"participation": "TAKING_INITIATIVE",
"extraCredit": "Helped classmates"
}
The frontend uses POST for new records and PUT for existing records. The backend should enforce one observation per student and date. 8. Database design
The 71 students are seeded automatically from backend/src/main/resources/students.csv at startup. Existing students are not duplicated by the seed process.

- students.id is a generated, globally unique primary key.
- (class_code, roll_number) is unique, allowing roll numbers to repeat across different classes.
- The original roster numbers are preserved: 1–38 for Class 6-1 and 1–33 for Class 6-2.
- daily_records stores each student's dated observation, optional homework, optional participation, and optional extra-credit text.
- daily_behaviours stores the selected behaviour values for a daily observation.
- admin_users stores administrator usernames and BCrypt password hashes.
  The database should enforce uniqueness for (student_id, date) in daily_records to prevent duplicate observations.

9. Frontend routing
   Route Page Access
   /login Administrator login Public
   / Classroom dashboard Authenticated
   /class/:code Classroom roster Authenticated
   /student/:id Student observation profile Authenticated

ProtectedRoute checks /api/auth/me before rendering protected content. BrowserRouter should appear once in the React application (typically in main.jsx), not in both main.jsx and App.jsx.
The :code route parameter must match const { code } = useParams() in ClassPage.jsx. 10. Configuration and deployment
Typical backend environment variables:
Variable Purpose
DB_URL JDBC connection URL, if referenced by your backend configuration
DB_USER MySQL username
DB_PASSWORD MySQL password
CORS_ORIGIN Allowed frontend origin, if referenced by your security/CORS configuration

Frontend environment variable:
Variable Purpose
VITE_API_BASE_URL Backend API base URL, ending in /api

Before deploying:

1. Serve frontend and backend over HTTPS.
2. Use a persistent, backed-up MySQL database.
3. Restrict and secure initial administrator provisioning.
4. Enable and correctly integrate CSRF protection for session-based authentication; do not rely on a development-only csrf.disable() configuration.
5. Configure secure session cookies, session expiration, appropriate CORS origins, and authentication failure handling.
6. Configure the frontend host to rewrite SPA routes to index.html.
7. Replace Hibernate ddl-auto=update with managed migrations such as Flyway or Liquibase.
8. Review school policy, student privacy, consent, retention, and access requirements before storing or hosting identifiable student information.
9. Never commit database credentials, session cookies, .env secrets, or real student observations to Git.
   Privacy warning: Even with a login screen, this application should not be exposed publicly with real student names until its security, privacy, and operational controls have been reviewed and tested. CORS is not an authentication or authorization mechanism.
10. Troubleshooting
    Login returns 403
    Inspect Chrome DevTools → Network to identify which request failed. If login fails before reaching the controller, check Spring Security rules and CSRF settings. If it fails inside the controller, inspect backend logs. Ensure a session exists before calling request.changeSessionId().
    Login succeeds but protected routes redirect back to login
    Check that the frontend uses credentials: 'include', the backend allows credentialed CORS for the correct origin, and GET /api/auth/me returns 200 with the session cookie.
    You cannot render a <Router> inside another <Router>
    Remove the duplicate BrowserRouter; keep one router around the application.
    GET /api/classes/undefined/students or Unknown class
    Ensure App.jsx defines /class/:code and ClassPage.jsx reads const { code } = useParams().
    Calendar does not show saved-record dots
    Check that the date-range API returns records for the displayed calendar month and that the frontend's date comparisons use consistent YYYY-MM-DD values.
    CORS or preflight failure
    Verify the frontend origin in backend CORS settings, allow the required methods and headers, and allow credentials when using cookie sessions.
11. Current scope and future improvements
    Implemented: Administrator registration and login, BCrypt password hashing, session-based authentication, logout, protected routes, two seeded class rosters, searchable student lists, daily observation creation/update/deletion, calendar record indicators, disabled Save state for existing records, and consolidated reporting.
    Potential future enhancements: Audit trail, administrator password reset, multiple teacher accounts and role-based access, PDF/CSV exports, automated tests, database migrations, backup/restore tooling, and offline synchronization.
    Built for practical classroom observation and student progress tracking.
