# Hotel Booking System – CI/CD Automation

## 1. Project Title
Hotel Booking System – CI/CD Automation

## 2. Assignment Requirement
This project demonstrates a hotel booking application with a full CI/CD pipeline, Dockerized deployment, Kubernetes deployment strategy, monitoring, health checks, security validation, and GitHub Actions automation.

## 3. Project Objective
Build a beginner-friendly hotel booking system with frontend, backend, database, auth, admin actions, tests, and deployment automation.

## 4. Features
- User login and registration
- Hotel search and listings
- Hotel details and room availability
- Booking flow with validation
- My bookings and cancellation
- Admin dashboard for hotels, rooms, and bookings
- JWT-based authentication
- SQLite database with SQLAlchemy
- FastAPI backend with REST APIs
- Docker and Compose support
- Kubernetes deployment manifests
- Prometheus and Grafana monitoring
- Bandit and pip-audit checks
- GitHub Actions CI/CD workflow

## 5. Frontend
The frontend is a React + Vite app built with JavaScript, CSS, and React Router.

## 6. Backend
The backend is built with Python, FastAPI, SQLAlchemy, Pydantic, SQLite, and JWT.

## 7. Database
SQLite is used for the assignment. The database file is created locally in the project root.

## 8. Architecture
Frontend -> FastAPI Backend -> SQLite Database

## 9. Folder Structure
- app/
- tests/
- frontend/
- k8s/
- monitoring/
- .github/workflows/
- Dockerfile
- docker-compose.yml
- README.md

## 10. User Flow
1. Register
2. Login
3. Search hotel
4. View details
5. Select room
6. Book room
7. View booking confirmation
8. View my bookings
9. Cancel booking
10. Logout

## 11. Admin Flow
1. Login as admin
2. Open admin dashboard
3. Manage hotels
4. Manage rooms
5. View bookings
6. Update booking status

## 12. API List
- POST /auth/register
- POST /auth/login
- GET /auth/me
- GET /hotels
- GET /hotels/{hotel_id}
- POST /hotels
- PUT /hotels/{hotel_id}
- DELETE /hotels/{hotel_id}
- GET /hotels/{hotel_id}/rooms
- GET /rooms/{room_id}
- GET /rooms/{room_id}/availability
- POST /hotels/{hotel_id}/rooms
- PUT /rooms/{room_id}
- DELETE /rooms/{room_id}
- POST /bookings
- GET /bookings/me
- GET /bookings/{booking_id}
- PATCH /bookings/{booking_id}/cancel
- GET /bookings
- PATCH /bookings/{booking_id}/status
- GET /health
- GET /metrics

## 13. Frontend Routes
- /
- /login
- /register
- /hotels/:hotelId
- /booking
- /my-bookings
- /profile
- /admin
- /admin/hotels
- /admin/rooms
- /admin/bookings

## 14. Authentication
JWT tokens are used for protected routes. Passwords are hashed before storage.

## 15. Local Setup
### Windows PowerShell
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Windows Command Prompt (FastAPI and Swagger)
Open Command Prompt in the project root. If this is your first setup, create the virtual environment and install dependencies once:
```cmd
py -3.11 -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

To start the backend, activate the environment and run Uvicorn. Keep this Command Prompt window open:
```cmd
.venv\Scripts\activate
set SECRET_KEY=local-development-key-change-before-deploying
set ADMIN_REGISTRATION_KEY=local-admin-key
uvicorn app.main:app --reload
```
These values are for local development only. Use secure secrets for deployment.

After the server starts, open a second Command Prompt in the project root and run this command to open Swagger UI in your default browser:
```cmd
start http://127.0.0.1:8000/docs
```

### Frontend
```powershell
cd frontend
npm install
npm run dev
```

## 16. Environment Variables
Create a `.env` file or use `.env.example` values.

Required backend variables:
- SECRET_KEY=
- ADMIN_REGISTRATION_KEY=
- DATABASE_URL=sqlite:///./hotel_booking.db

Frontend example:
- VITE_API_URL=http://localhost:8000

## 17. Running Application
- Backend: http://localhost:8000
- Frontend: http://localhost:5173

### Swagger API Documentation
Swagger API Docs:
http://127.0.0.1:8000/docs

CMD Command:
```cmd
start http://127.0.0.1:8000/docs
```

## 18. Testing
```powershell
pytest -q
pytest --cov=app --cov-report=term-missing
```

## 19. Coverage
Coverage is generated with pytest-cov.

## 20. Bandit
```powershell
bandit -r app
```

## 21. pip-audit
```powershell
python -m pip_audit -r requirements.txt
```

## 22. Docker
```powershell
docker build -t hotel-booking-backend .
docker run -p 8000:8000 hotel-booking-backend
```

## 23. Docker Compose
```powershell
docker compose up --build
```

## 24. Prometheus
Open http://localhost:9090

## 25. Grafana
- Open http://localhost:3000
- Login with default admin credentials if configured
- Add Prometheus data source using http://prometheus:9090

## 26. Kubernetes
```powershell
kubectl apply -f k8s/
kubectl get pods -n hotel-booking
kubectl get services -n hotel-booking
kubectl rollout status deployment/backend -n hotel-booking
```

## 27. Health Checks
The backend exposes `/health` and Kubernetes uses readiness/liveness probes with this endpoint.

## 28. RollingUpdate and Rollback
The deployment uses RollingUpdate strategy with maxUnavailable 0 and maxSurge 1. Rollback is done with `kubectl rollout undo`.

## 29. Git Workflow
- main
- develop
- feature/*

Example:
```powershell
git checkout -b feature/hotel-search
git add .
git commit -m "Add hotel search frontend"
git push origin feature/hotel-search
```

## 30. GitHub Actions
The workflow runs tests, Bandit, pip-audit, and builds backend/frontend Docker images before pushing to GHCR.

## 31. GHCR
Images can be pushed to ghcr.io/<owner>/hotel-booking-backend:latest and ghcr.io/<owner>/hotel-booking-frontend:latest.

## 32. Production Deployment
Production deployment requires a real Kubernetes cluster and required GitHub secrets.

## 33. Logging
The backend logs major events, but never logs passwords, password hashes, or JWT tokens.

## 34. Security
Security features:
- JWT auth
- Secure password hashing
- Environment variables
- No secrets committed to Git
- Bandit security scan
- pip-audit dependency check

## 35. SQLite/Kubernetes Limitation
SQLite is required for the assignment. With multiple Kubernetes replicas, a local SQLite file can create separate database copies per pod. For real production, a shared database is recommended.

## 36. Troubleshooting
- If backend fails to start, check the virtual environment and dependencies.
- If frontend fails, ensure Node.js is installed and `npm install` has run.
- If Docker fails, ensure Docker Desktop/Engine is running.
- If Kubernetes resources fail, verify cluster access and manifests.

## 37. Assignment Demo Flow
1. Open frontend
2. Register
3. Login
4. Home page opens
5. Search hotel
6. Select hotel
7. View hotel details
8. Select room
9. Enter booking details
10. Confirm booking
11. View my bookings
12. Cancel booking
13. Login as admin
14. Manage hotels, rooms, and bookings

## 38. Viva Questions and Answers
### Q1. What is FastAPI?
A: FastAPI is a Python web framework used to build APIs quickly with Python type hints and automatic validation.

### Q2. Why React?
A: React is popular for building interactive user interfaces with reusable components.

### Q3. Why SQLite?
A: SQLite is lightweight and suitable for college projects and local development.

### Q4. What is JWT?
A: JWT is a token used to securely authenticate users between frontend and backend.

### Q5. What is Docker?
A: Docker packages applications and dependencies into containers for consistent running.

### Q6. What is Docker Compose?
A: Docker Compose runs multiple services together with one configuration file.

### Q7. What is Kubernetes?
A: Kubernetes is a container orchestration platform for deployment, scaling, and management.

### Q8. What is a Pod?
A: A pod is the smallest deployable unit in Kubernetes.

### Q9. What is a Deployment?
A: A deployment manages and updates application replicas in Kubernetes.

### Q10. What is a Service?
A: A Kubernetes Service exposes pods internally or externally.

### Q11. What is RollingUpdate?
A: RollingUpdate gradually replaces old pods with new ones without downtime.

### Q12. What is a readiness probe?
A: Readiness probe checks whether a pod is ready to receive traffic.

### Q13. What is a liveness probe?
A: Liveness probe checks whether a container is still alive and restarts it if needed.

### Q14. What is Prometheus?
A: Prometheus is a monitoring system that collects application and infrastructure metrics.

### Q15. What is Grafana?
A: Grafana visualizes monitoring metrics with dashboards.

### Q16. What is CI?
A: CI means continuous integration, where code is tested and validated automatically.

### Q17. What is CD?
A: CD means continuous delivery or deployment, where code is released automatically after passing checks.

### Q18. What is GitHub Actions?
A: GitHub Actions automates CI/CD workflows directly in GitHub.

### Q19. What is GHCR?
A: GHCR is GitHub Container Registry used to store Docker images.

### Q20. Why use Bandit?
A: Bandit detects common security issues in Python code.

### Q21. Why use pip-audit?
A: pip-audit checks installed Python packages for known vulnerabilities.

### Q22. Why hash passwords?
A: Password hashing avoids storing plain-text passwords and protects user data.

### Q23. Why use environment variables?
A: Environment variables keep secrets and configuration out of source code.

### Q24. Why is SQLite a limitation with multiple Kubernetes replicas?
A: A SQLite file stored in each pod is not shared, so replicas may not see the same data.

## 39. Final Note
This project is suitable for a college assignment demo and can be extended for real-world deployment with a managed database and proper cluster setup.
