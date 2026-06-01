# ThreadFront

A fullstack social thread app built to practice React, REST APIs, and Docker.

## ✨ Features

- **Authentication**: Register and log in with JWT-based sessions.
- **Feed**: Browse all posts in an infinite-scroll feed.
- **Create Posts**: Share new threads directly from the feed.
- **Post Details**: View a single post with full details.
- **User Profile**: See a user's posts grouped on their profile page.
- **Logout**: Secure session termination.

## 🛠️ Tech Stack

- **Frontend**: React 19, React Router, Vite, CSS3.
- **Backend**: Node.js, Express 5, Sequelize ORM.
- **Database**: MySQL 8.
- **Auth**: JWT + bcrypt.
- **Containerization**: Docker + Docker Compose + Apache HTTP Server 2.4.

## ⚙️ Prerequisites

- Docker and Docker Compose.

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/LuzRivera154/module5-react-threadfront.git
cd module5-react-threadfront
```

### 2. Build and start all services

```bash
docker compose up --build
```

This starts three containers:
- `web` — React frontend served by Apache on port 8080
- `api` — Express backend on port 3000
- `bdd` — MySQL 8 database

## ▶️ Open the app

```
http://localhost:8080
```

## ⏹️ Stop the app

```bash
docker compose down
```

## 🗑️ Remove containers and volumes

```bash
docker compose down -v
```
