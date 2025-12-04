# Container Issues - Fixed

## Problems Found

### 1. Next.js Container (document-spa)

**Error:** `sh: 1: next: not found`

**Cause:**

- `node_modules` directory wasn't installed in the container
- The Dockerfile runs `npm install` but the container was crashing before completion

**Solution:**

- Rebuilt container with `--no-cache` flag
- Ensures fresh `npm install` runs completely

### 2. Nginx Container

**Error:** `host not found in upstream "php"`

**Cause:**

- `default.conf` still referenced old chat app configuration
- Tried to connect to `php` container which doesn't exist

**Solution:**

- Updated `default.conf` to minimal configuration
- Removed references to old chat app
- Document editor uses separate nginx configs:
  - `document-app.conf` - Laravel backend
  - `document-spa.conf` - Next.js frontend
  - `document-socket.conf` - Socket.io server

## Current Status

✅ **Fixed:**

- nginx container running
- default.conf cleaned up
- document-spa rebuilding with dependencies

🔄 **In Progress:**

- document-spa container rebuilding (2-3 minutes)

## Verification Steps

Once rebuild completes:

```bash
# Check all containers
docker-compose ps

# Should see all containers "Up"
# - nginx
# - document-php
# - document-spa
# - document-socket
# - db
# - redis
# - phpmyadmin

# Check Next.js logs
docker-compose logs document-spa --tail=20

# Should see:
# ✓ Ready in X ms
# ○ Local: http://localhost:4001

# Access the app
open http://localhost:4001
```

## Container Ports

| Service          | Port | URL                   |
| ---------------- | ---- | --------------------- |
| Next.js Frontend | 4001 | http://localhost:4001 |
| Laravel API      | 8001 | http://localhost/api  |
| Socket.io        | 6002 | http://localhost:6002 |
| phpMyAdmin       | 9099 | http://localhost:9099 |
| MySQL            | 3306 | localhost:3306        |
| Redis            | 6379 | localhost:6379        |

## If Issues Persist

### Restart All Containers

```bash
docker-compose down
docker-compose up -d
```

### Rebuild Specific Container

```bash
docker-compose down document-spa
docker-compose build --no-cache document-spa
docker-compose up -d document-spa
```

### View Logs

```bash
# All containers
docker-compose logs

# Specific container
docker-compose logs document-spa -f

# Last 50 lines
docker-compose logs document-spa --tail=50
```

### Clean Everything

```bash
# Stop and remove all containers
docker-compose down

# Remove volumes (WARNING: deletes data!)
docker-compose down -v

# Rebuild everything
docker-compose build --no-cache
docker-compose up -d
```

## Files Modified

1. ✅ `devops/nginx/config/default.conf` - Removed old chat app config
2. ✅ `documentSPA/package.json` - Downgraded Tailwind to v3
3. ✅ `documentSPA/Dockerfile` - Changed to Debian-based Node

## Next Steps

1. Wait for rebuild to complete (2-3 min)
2. Check containers: `docker-compose ps`
3. Access app: `http://localhost:4001`
4. Test features:
   - Register account
   - Create document
   - Test real-time sync
   - Generate share link
