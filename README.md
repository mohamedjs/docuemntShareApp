# 📝 Document Editor - Real-Time Collaborative Platform

A full-stack real-time collaborative document editing platform with user authentication, document sharing, version control, and WebSocket-based live collaboration.

## 🎥 Demo Video

https://github.com/user-attachments/assets/documentApp.mov

> **Note**: Watch the demo video to see the application in action with real-time collaboration features.

---

## 📑 Table of Contents

### Quick Start
- [🏗️ Architecture](#️-architecture)
- [✨ Features](#-features)
- [🚀 Installation & Setup](#-installation--setup)
  - [Prerequisites](#prerequisites)
  - [Step 1: Clone Repository](#step-1-clone-the-repository)
  - [Step 2: Environment Configuration](#step-2-configure-environment-variables)
  - [Step 3: Hosts File Setup](#step-3-configure-hosts-file)
  - [Step 4: Install Dependencies](#step-4-install-dependencies)
  - [Step 5: Docker Setup](#step-5-build-and-start-docker-containers)
  - [Step 6: Database Setup](#step-6-database-setup)
  - [Step 7: Verify Installation](#step-7-verify-installation)

### Usage & Configuration
- [🌐 Access URLs](#-access-the-application)
- [📖 Usage Guide](#-usage-guide)
- [🔌 API Endpoints](#-api-endpoints)
- [🔐 JWT Authentication Flow](#-jwt-authentication-flow)
- [🔐 Security Notes](#-security-notes)

### Development & Maintenance
- [🔧 Development](#-development)
- [🐛 Troubleshooting](#-troubleshooting)
  - [WebSocket Connection Issues](#websocket-connection-failed)
  - [Unknown User Problem](#unknown-user-in-collaboration)
  - [Database Connection](#database-connection-error)
  - [Port Conflicts](#port-already-in-use)
  - [Auto-save Issues](#auto-save-not-working)

### Reference
- [📁 Project Structure](#-project-structure)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [👥 Support](#-support)

---

## 🏗️ Architecture

This project consists of three main services:

```
documentApp/
├── documentDashboard/    # Laravel 10 Backend API
├── documentSPA/          # Next.js 14 Frontend
├── SocketServer/         # Node.js WebSocket Server
└── devops/              # Docker & Nginx Configuration
```

### Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Backend API** | Laravel 10 + PHP 8.2 | REST API, Authentication, Business Logic |
| **Frontend** | Next.js 14 + React 18 + TypeScript | User Interface |
| **WebSocket Server** | Node.js + Socket.IO + Express | Real-time Collaboration |
| **Database** | MySQL 8.0 | Data Persistence |
| **Cache/Queue** | Redis | Caching, Broadcasting, Sessions |
| **Web Server** | Nginx | Reverse Proxy, Load Balancing |
| **Authentication** | JWT (tymon/jwt-auth) | Secure Token-based Auth |

## ✨ Features

- 🔐 **User Authentication** - JWT-based secure authentication
- 📄 **Document Management** - Create, edit, delete documents
- 👥 **Real-time Collaboration** - Multiple users editing simultaneously
- 🔗 **Document Sharing** - Share documents with view/edit permissions
- 📜 **Version Control** - Track document changes and restore versions
- 👤 **Active Users Display** - See who's currently editing
- 💾 **Auto-save** - Automatic document saving with debounce
- 🎨 **Modern UI** - Beautiful, responsive interface with TailwindCSS

## 🚀 Installation & Setup

### Prerequisites

- Docker & Docker Compose
- Git
- macOS/Linux (for hosts file configuration)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd documentApp
```

### Step 2: Configure Environment Variables

Copy the example environment files and configure them:

#### Root Directory
```bash
cp .env.example .env
```

Edit `.env` and set your paths:
```env
DOCUMENT_APP_PATH=./documentDashboard
DOCUMENT_SPA_PATH=./documentSPA
DOCUMENT_SOCKET_PATH=./SocketServer
APP_PORT=8000
```

#### Laravel Backend
```bash
cd documentDashboard
cp .env.example .env
```

Edit `documentDashboard/.env`:
```env
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=document_editor
DB_USERNAME=root
DB_PASSWORD=root

REDIS_HOST=redis
REDIS_PORT=6379

JWT_SECRET=your-generated-secret-here
BROADCAST_DRIVER=redis
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
```

**Generate and Configure JWT Secret:**

1. Generate JWT secret in Laravel:
```bash
cd documentDashboard
php artisan jwt:secret
```

This command will:
- Generate a random secure secret
- Automatically add it to your `documentDashboard/.env` file as `JWT_SECRET`

2. Copy the generated JWT secret:
```bash
# View the generated secret
cat .env | grep JWT_SECRET
```

You'll see something like:
```
JWT_SECRET=ZhffC7kKRq7MSf9zl1KngCy8ahPUB4ia5iBlY8cipxjXqPhupToPpJYikpPllfjc
```

3. **IMPORTANT**: Copy this exact JWT_SECRET value to the Socket Server configuration:
```bash
cd ../SocketServer
nano .env
```

Replace the JWT_SECRET value with the one from Laravel:
```env
JWT_SECRET=ZhffC7kKRq7MSf9zl1KngCy8ahPUB4ia5iBlY8cipxjXqPhupToPpJYikpPllfjc
```

⚠️ **Critical**: The JWT_SECRET must be **exactly the same** in both Laravel and Socket Server. If they don't match, users will appear as "Guest" or "Unknown User" in real-time collaboration.

#### Next.js Frontend
```bash
cd ../documentSPA
cp .env.example .env
```

Edit `documentSPA/.env`:
```env
NEXT_PUBLIC_API_URL="http://document-app.local:8001"
NEXT_PUBLIC_APP_URL="http://localhost:4001"
NEXT_PUBLIC_SOCKET_URL="http://document-socket.local:8000"
```

#### Socket Server
```bash
cd ../SocketServer
cp .env.example .env
```

Edit `SocketServer/.env` and **match the JWT_SECRET from Laravel**:
```env
PORT=6002
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=<same-as-laravel-jwt-secret>
NODE_ENV=development
```

### Step 3: Configure Hosts File

Add these entries to your `/etc/hosts` file:

```bash
sudo nano /etc/hosts
```

Add the following lines:
```
127.0.0.1    document-app.local
127.0.0.1    document-socket.local
127.0.0.1    document-spa.local
```

Save and exit (Ctrl+X, then Y, then Enter).

### Step 4: Install Dependencies

#### Laravel Dependencies
```bash
cd documentDashboard
composer install
```

#### Next.js Dependencies
```bash
cd ../documentSPA
npm install
```

#### Socket Server Dependencies
```bash
cd ../SocketServer
npm install
```

### Step 5: Build and Start Docker Containers

```bash
cd ..  # Back to root directory
docker-compose up -d --build
```

This will start:
- **nginx** - Port 8000 (Main entry point)
- **document-php** - PHP-FPM for Laravel
- **document-spa** - Port 4001 (Next.js)
- **document-socket** - Port 6002 (WebSocket)
- **db** - Port 3306 (MySQL)
- **redis** - Port 6379
- **phpmyadmin** - Port 9099

### Step 6: Database Setup

Run migrations and seeders:

```bash
docker-compose exec document-php php artisan migrate
docker-compose exec document-php php artisan db:seed  # Optional
```

### Step 7: Verify Installation

Check that all services are running:
```bash
docker-compose ps
```

All services should show status as "Up" or "Up (healthy)".

## 🌐 Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:4001 | Main application UI |
| **Backend API** | http://document-app.local:8001 | Laravel API |
| **Socket Server** | http://document-socket.local:8000 | WebSocket server |
| **PHPMyAdmin** | http://localhost:9099 | Database management |

## 📖 Usage Guide

### 1. Register/Login

1. Navigate to http://localhost:4001
2. Click "Register" to create a new account
3. Login with your credentials

### 2. Create a Document

1. Click "New Document" button
2. Enter a title
3. Start typing in the editor
4. Document auto-saves every second

### 3. Share a Document

1. Open a document
2. Click the "Share" button
3. Choose permission level (View/Edit)
4. Copy the share link
5. Send to collaborators

### 4. Real-time Collaboration

1. Open the same document in multiple browser windows
2. Type in one window
3. See changes appear instantly in other windows
4. View active users in the top-right corner

### 5. Version History

1. Open a document
2. Click "Versions" (if available)
3. View previous versions
4. Restore a specific version

## 🔧 Development

### Running Services Individually

#### Laravel Backend (Development)
```bash
cd documentDashboard
php artisan serve --host=0.0.0.0 --port=8001
```

#### Next.js Frontend (Development)
```bash
cd documentSPA
npm run dev
```

#### Socket Server (Development)
```bash
cd SocketServer
npm run dev
```

### Useful Commands

```bash
# View logs
docker-compose logs -f [service-name]

# Restart a service
docker-compose restart [service-name]

# Stop all services
docker-compose down

# Rebuild a specific service
docker-compose up -d --build [service-name]

# Clear Laravel cache
docker-compose exec document-php php artisan cache:clear
docker-compose exec document-php php artisan config:clear

# Run migrations
docker-compose exec document-php php artisan migrate

# Access MySQL
docker-compose exec db mysql -u root -p
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### Documents
- `GET /api/documents` - List all documents
- `POST /api/documents` - Create document
- `GET /api/documents/{id}` - Get document
- `PUT /api/documents/{id}` - Update document
- `DELETE /api/documents/{id}` - Delete document

### Sharing
- `POST /api/documents/{id}/share` - Generate share link
- `DELETE /api/documents/{id}/share` - Revoke share link
- `GET /api/share/{token}` - Access shared document
- `PUT /api/share/{token}` - Update shared document

### Versions
- `GET /api/documents/{id}/versions` - Get version history
- `POST /api/documents/{id}/versions/{versionId}/restore` - Restore version

## 🔐 JWT Authentication Flow

Understanding how JWT works in this application:

```
┌─────────────┐         ┌──────────────┐         ┌────────────────┐
│   Browser   │         │   Laravel    │         │ Socket Server  │
│  (Next.js)  │         │   Backend    │         │   (Node.js)    │
└──────┬──────┘         └──────┬───────┘         └────────┬───────┘
       │                       │                          │
       │  1. Login Request     │                          │
       │──────────────────────>│                          │
       │                       │                          │
       │  2. JWT Token         │                          │
       │   (signed with        │                          │
       │    JWT_SECRET)        │                          │
       │<──────────────────────│                          │
       │                       │                          │
       │  3. WebSocket Connect │                          │
       │   (with JWT token)    │                          │
       │───────────────────────────────────────────────>│
       │                       │                          │
       │                       │  4. Verify Token         │
       │                       │     (using same          │
       │                       │      JWT_SECRET)         │
       │                       │                          │
       │  5. Authenticated     │                          │
       │     Connection        │                          │
       │<───────────────────────────────────────────────│
       │                       │                          │
```

**Key Points:**
- Laravel generates JWT tokens using `JWT_SECRET`
- Socket Server verifies tokens using the **same** `JWT_SECRET`
- If secrets don't match → Token verification fails → User appears as "Guest"
- Both services must use the **identical** JWT_SECRET value

## 🔐 Security Notes

1. **JWT Secret Synchronization**: 
   - **Critical**: `JWT_SECRET` must be identical in Laravel and Socket Server
   - Use `php artisan jwt:secret` to generate a secure secret
   - Copy the generated secret to Socket Server `.env`
   - Never share or commit JWT secrets

2. **Environment Files**: Never commit `.env` files to version control

3. **Production Security**:
   - Change all default passwords and secrets
   - Use strong, unique JWT secrets (64+ characters)
   - Enable HTTPS for all services
   - Configure CORS properly for production domains

4. **Token Management**:
   - JWT tokens expire after 60 minutes (configurable via `JWT_TTL`)
   - Use refresh tokens for extended sessions
   - Clear tokens on logout

5. **Database Security**:
   - Use strong database passwords
   - Restrict database access to application services only
   - Regular backups

## 🐛 Troubleshooting

### WebSocket Connection Failed

**Problem**: `WebSocket connection to 'ws://document-socket.local' failed`

**Solution**:
1. Check `/etc/hosts` has the entry
2. Verify Socket Server is running: `docker-compose ps document-socket`
3. Check JWT_SECRET matches between Laravel and Socket Server
4. Restart nginx: `docker-compose restart nginx`

### "Unknown User" in Collaboration

**Problem**: Users show as "Unknown User" or "Guest" in real-time collaboration

**Root Cause**: JWT_SECRET mismatch between Laravel and Socket Server

**Solution**:

1. **Verify JWT secrets match**:
```bash
# Check Laravel JWT secret
cd documentDashboard
cat .env | grep JWT_SECRET

# Check Socket Server JWT secret
cd ../SocketServer
cat .env | grep JWT_SECRET
```

Both should output the **exact same value**.

2. **If they don't match**, copy the Laravel JWT_SECRET to Socket Server:
```bash
# Get Laravel JWT secret
LARAVEL_JWT=$(cd documentDashboard && cat .env | grep JWT_SECRET | cut -d '=' -f2)

# Update Socket Server
cd SocketServer
sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=$LARAVEL_JWT/" .env
```

3. **Restart the Socket Server**:
```bash
docker-compose restart document-socket
```

4. **Clear browser storage and login again**:
- Open browser DevTools (F12)
- Go to Application/Storage tab
- Clear Local Storage and Session Storage
- Logout and login again to get a new JWT token

5. **Verify the fix**:
- Check Socket Server logs: `docker-compose logs -f document-socket`
- Look for "JWT verified successfully" messages
- User name should appear instead of "Guest"

### Database Connection Error

**Problem**: Cannot connect to database

**Solution**:
1. Verify MySQL container is running: `docker-compose ps db`
2. Check database credentials in `.env`
3. Wait for MySQL to fully initialize (first run takes longer)

### Port Already in Use

**Problem**: Port 8000, 4001, or 6002 already in use

**Solution**:
1. Change ports in `.env` file
2. Update `docker-compose.yml` port mappings
3. Restart containers: `docker-compose down && docker-compose up -d`

### Auto-save Not Working

**Problem**: Documents not saving automatically

**Solution**:
1. Check browser console for errors
2. Verify API connection
3. Check Laravel logs: `docker-compose logs document-php`

## 📁 Project Structure

```
documentApp/
├── documentDashboard/           # Laravel Backend
│   ├── app/
│   │   └── Models/             # Eloquent Models
│   ├── Modules/
│   │   ├── Auth/               # Authentication Module
│   │   └── Document/           # Document Module
│   │       ├── App/
│   │       │   ├── Controllers/
│   │       │   ├── Services/
│   │       │   ├── Repositories/
│   │       │   └── Events/
│   │       └── routes/
│   └── database/
│       └── migrations/
│
├── documentSPA/                 # Next.js Frontend
│   ├── app/                    # App Router
│   │   ├── documents/          # Document pages
│   │   ├── share/              # Share pages
│   │   └── login/              # Auth pages
│   ├── src/
│   │   ├── components/         # React Components
│   │   ├── hooks/              # Custom Hooks
│   │   ├── services/           # API Services
│   │   └── store/              # Redux Store
│   └── public/
│
├── SocketServer/                # WebSocket Server
│   ├── server.js               # Main server file
│   └── package.json
│
└── devops/                      # DevOps Configuration
    ├── nginx/
    │   └── config/             # Nginx configs
    ├── php-fpm/
    └── hosts                   # Container hosts file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is open-source and available under the MIT License.

## 👥 Support

For issues and questions:
- Create an issue in the repository
- Check existing documentation
- Review troubleshooting section

---

**Built with ❤️ using Laravel, Next.js, and Socket.IO**
