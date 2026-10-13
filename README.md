# 🚗 Car Rental System

A production-ready full-stack Car Rental Web Application built with Spring Boot 3 + React.

## Tech Stack
________________________________________________________
| Layer      | Technology                              |
|------------|-----------------------------------------|
| Backend    | Java 25, Spring Boot 3.4.5, Maven       |
| Security   | Spring Security, JWT, Refresh Tokens    |
| Database   | MySQL 8, Spring Data JPA, Hibernate     |
| Frontend   | React, Vite, Tailwind CSS, Redux Toolkit|
| Docs       | OpenAPI 3 / Swagger UI                  |
| Images     | Cloudinary                              |
| Deployment | Backend → Render, Frontend → Vercel     |
________________________________________________________
## Getting Started

### Prerequisites
- Java 25
- Maven 3.9+
- MySQL 8
- Node.js 20+

### Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/car-rental-system.git
cd car-rental-system

# 2. Create your local secrets file
cp src/main/resources/application-local.properties.example \
   src/main/resources/application-local.properties
# Set the environment variables referenced by application-local.properties

# 3. Run the application
mvn spring-boot:run
```

### API Documentation
Once running, visit: `http://localhost:8080/swagger-ui.html`

## Branch Strategy
--------------------------------------------------
| Branch      | Purpose                          |
|-------------|----------------------------------|
| `main`      | Production-ready code only       |
| `develop`   | Integration branch               |
| `feature/*` | New features (e.g. feature/auth) |
| `fix/*`     | Bug fixes                        |
| `release/*` | Release preparation              |
--------------------------------------------------
## Commit Convention

```
feat:     New feature
fix:      Bug fix
refactor: Code restructure without behavior change
docs:     Documentation only
test:     Adding or updating tests
chore:    Build, config, dependency changes
```

## Modules

- [x] Project Setup
- [x] Git Repository
- [ ] Database Design
- [ ] Authentication
- [ ] Role Management
- [ ] User Module
- [ ] Brand Module
- [ ] Category Module
- [ ] Car Module
- [ ] Car Image Module
- [ ] Search & Filters
- [ ] Booking Module
- [ ] Payment Module
- [ ] Review Module
- [ ] Dashboard & Analytics
- [ ] Email Notifications
- [ ] Deployment
- [ ] Testing

## License
MIT
