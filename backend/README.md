# AI Bug Triage Agent - Backend (Phase 1)

This folder contains the Spring Boot backend skeleton for the AI Bug Triage Agent project.

What was created (Phase 1 starter):
- Maven project (pom.xml)
- Spring Boot application class
- JPA entities: User, Bug, TriageLog
- Enums: BugStatus, BugPriority
- Spring Data JPA repositories for User, Bug, TriageLog
- Global exception handler (ControllerAdvice)
- application.properties with PostgreSQL placeholder config

How to run:
1. Ensure PostgreSQL is running and create a database `aibugtriage` (or update the URL in application.properties).
2. From the `backend` directory run:

   mvn spring-boot:run

Next steps (Phase 1 remaining):
- Add unit tests and integration tests
- Add DTOs and controllers for CRUD endpoints
- Add validation and error responses
- Configure Docker for the DB and app

Proceed to Phase 2 (authentication & security) or request controllers for CRUD endpoints when ready.
