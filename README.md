# Book My Show - Local Setup Guide

This project is a simple seat booking app with:
- A Node.js + Express backend
- A PostgreSQL database
- A static frontend served by the backend

## Prerequisites

Make sure you have these installed:
- Docker Desktop (running)
- Node.js 18+ and npm

## 1. Clone and install dependencies

From the project root:

```bash
npm install
```

## 2. Start PostgreSQL in Docker

The backend is currently configured to use:
- Host: localhost
- Port: 5432
- User: postgres
- Password: postgres
- Database: sql_class_2_db

Run this command once to create and start the container:

```bash
docker run -d \
  --name postgres-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=sql_class_2_db \
  -p 5432:5432 \
  postgres:17
```

If you already created the container earlier and it is stopped, start it again:

```bash
docker start postgres-db
```

Check container status:

```bash
docker ps -a
```

## 3. Initialize database tables and seed data

Run this from the project root:

```bash
docker exec -i postgres-db psql -U postgres -d sql_class_2_db < seed.sql
```

Optional: open interactive PostgreSQL shell:

```bash
docker exec -it postgres-db psql -U postgres -d sql_class_2_db
```

Inside psql, you can verify tables:

```sql
\dt
SELECT COUNT(*) FROM seats;
SELECT * FROM users;
```

Exit psql:

```sql
\q
```

## 4. Start the application

From the project root:

```bash
node backend/index.js
```

Server runs on:
- http://localhost:8080

Open these pages:
- Login/Signup: http://localhost:8080/login.html
- Main app: http://localhost:8080/index.html

## 5. How to use the app

1. Create an account on the signup form.
2. Log in.
3. Click an available seat to book it.

## Common Docker commands

Stop database container:

```bash
docker stop postgres-db
```

Start database container:

```bash
docker start postgres-db
```

View running containers only:

```bash
docker ps
```

View all containers:

```bash
docker ps -a
```

Remove container (only if you want a fresh setup):

```bash
docker rm -f postgres-db
```

## Project structure

- backend: Express server and API routes
- frontend: Static HTML/CSS/JS UI
- seed.sql: Database schema and seed data
