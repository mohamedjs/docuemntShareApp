# Git Setup Guide

## Initialize Git Repository

```bash
cd /Users/tripklik/myProject/documentApp

# Initialize git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Real-time collaborative document editor"
```

## Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository (e.g., `document-editor`)
3. **Don't** initialize with README, .gitignore, or license
4. Copy the repository URL

## Push to GitHub

```bash
# Add remote origin (replace with your URL)
git remote add origin https://github.com/YOUR_USERNAME/document-editor.git

# Push to main branch
git branch -M main
git push -u origin main
```

## What's Included in Git

✅ **Source Code:**

- Laravel backend (`documentDashboard/`)
- Next.js frontend (`documentSPA/`)
- Socket.io server (`SocketServer/`)
- Docker configurations
- Nginx configs

✅ **Documentation:**

- README.md
- QUICK_START.md
- SHARE_LINKS_GUIDE.md
- CLEANUP_SUMMARY.md
- This file (GIT_SETUP.md)

✅ **Configuration Files:**

- docker-compose.yml
- Dockerfiles
- package.json files
- composer.json
- tailwind.config.ts
- tsconfig.json

## What's Excluded (via .gitignore)

❌ **Sensitive Data:**

- `.env` files (environment variables)
- API keys and secrets
- Database credentials

❌ **Dependencies:**

- `node_modules/` (npm packages)
- `vendor/` (Composer packages)

❌ **Build Artifacts:**

- `.next/` (Next.js build)
- `storage/logs/` (Laravel logs)
- `bootstrap/cache/` (Laravel cache)

❌ **IDE & OS Files:**

- `.vscode/`, `.idea/`
- `.DS_Store`
- `Thumbs.db`

## Environment Variables Setup

After cloning, team members need to create `.env` files:

### 1. Root `.env`

```bash
cp .env.example .env
# Edit with your local paths and ports
```

### 2. Laravel `.env`

```bash
cd documentDashboard
cp .env.docker .env
# Edit database credentials, JWT secret, etc.
```

### 3. Next.js `.env.local`

```bash
cd documentSPA
cp env.docker .env.local
# Edit API and Socket.io URLs
```

### 4. Socket.io `.env`

```bash
cd SocketServer
cp .env.example .env
# Edit Redis and JWT settings
```

## Recommended .env.example Files

Create example files for team members:

**Root `.env.example`:**

```env
# Chat Application (existing)
CHAT_APP_PORT=3000
CHAT_APP_PATH=./chat-application/pro-chat
# ... etc

# Document Editor
DOCUMENT_APP_PORT=8001
DOCUMENT_APP_PATH=./documentDashboard
DOCUMENT_SPA_PORT=4001
DOCUMENT_SPA_PATH=./documentSPA
DOCUMENT_SOCKET_PORT=6002
DOCUMENT_SOCKET_PATH=./SocketServer
```

**documentDashboard/.env.example:**

```env
APP_NAME=DocumentEditor
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://document-app.local

DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=document_editor
DB_USERNAME=root
DB_PASSWORD=root

REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379

JWT_SECRET=your-secret-key-here
JWT_TTL=60

BROADCAST_DRIVER=redis
QUEUE_CONNECTION=redis
```

**documentSPA/env.example:**

```env
NEXT_PUBLIC_API_URL=http://document-app.local
NEXT_PUBLIC_SOCKET_URL=http://document-socket.local
```

**SocketServer/.env.example:**

```env
PORT=6002
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=your-secret-key-here
```

## Git Workflow

### Daily Development

```bash
# Check status
git status

# Add changes
git add .

# Commit
git commit -m "Add feature: share links"

# Push
git push
```

### Create Feature Branch

```bash
# Create and switch to new branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Implement new feature"

# Push branch
git push -u origin feature/new-feature

# Create Pull Request on GitHub
```

### Update from Main

```bash
# Switch to main
git checkout main

# Pull latest
git pull

# Switch back to feature branch
git checkout feature/new-feature

# Merge main into feature
git merge main
```

## Useful Git Commands

```bash
# View commit history
git log --oneline

# View changes
git diff

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard local changes
git checkout -- .

# View remote URL
git remote -v

# Create .gitignore after initial commit
git rm -r --cached .
git add .
git commit -m "Update .gitignore"
```

## GitHub Repository Settings

### Recommended Settings:

1. **Branch Protection:**

   - Protect `main` branch
   - Require pull request reviews
   - Require status checks to pass

2. **Secrets:**

   - Add environment variables as GitHub Secrets
   - Use in GitHub Actions for CI/CD

3. **README Badges:**
   ```markdown
   ![Laravel](https://img.shields.io/badge/Laravel-10.x-red)
   ![Next.js](https://img.shields.io/badge/Next.js-14.x-black)
   ![Socket.io](https://img.shields.io/badge/Socket.io-4.x-blue)
   ```

## Team Collaboration

### For New Team Members:

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/document-editor.git
cd document-editor

# Create .env files (see above)
# ...

# Start Docker containers
docker-compose up -d

# Install dependencies (if needed)
docker-compose exec document-php composer install
docker-compose exec document-spa npm install

# Run migrations
docker-compose exec document-php php artisan migrate

# Access app
open http://localhost:4001
```

## CI/CD with GitHub Actions

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Build Docker images
        run: docker-compose build

      - name: Start services
        run: docker-compose up -d

      - name: Run Laravel tests
        run: docker-compose exec -T document-php php artisan test

      - name: Run Next.js build
        run: docker-compose exec -T document-spa npm run build
```

## Deployment

### Production Checklist:

- [ ] Set `APP_ENV=production` in Laravel
- [ ] Set `APP_DEBUG=false`
- [ ] Generate strong `APP_KEY` and `JWT_SECRET`
- [ ] Use production database credentials
- [ ] Configure CORS for production domains
- [ ] Set up SSL certificates
- [ ] Configure production Redis
- [ ] Set up monitoring and logging
- [ ] Create database backups
- [ ] Test all features in production

## Summary

✅ `.gitignore` created - excludes sensitive and generated files
✅ Ready to initialize git repository
✅ Ready to push to GitHub
✅ Team collaboration setup documented
✅ Environment variables documented

**Next Steps:**

1. Run `git init`
2. Run `git add .`
3. Run `git commit -m "Initial commit"`
4. Create GitHub repository
5. Push to GitHub
