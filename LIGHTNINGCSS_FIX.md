# Fix for lightningcss Error

## Problem

```
Error: Cannot find module '../lightningcss.linux-arm64-musl.node'
```

This error occurs because:

- Tailwind CSS 4 uses `lightningcss` for CSS processing
- The Alpine Linux (musl) version doesn't have pre-built binaries for ARM64
- Next.js can't find the native module

## Solution Applied

Changed the Next.js Dockerfile from Alpine to Debian-based Node image:

**Before:**

```dockerfile
FROM node:20-alpine
```

**After:**

```dockerfile
FROM node:20
```

## Rebuild Command

```bash
cd /Users/tripklik/myProject/documentApp
docker-compose down document-spa
docker-compose up -d --build document-spa
```

## Why This Works

- `node:20` uses Debian Linux (glibc) instead of Alpine (musl)
- Debian has better compatibility with native Node modules
- `lightningcss` has pre-built binaries for Debian ARM64

## Alternative Solutions (if needed)

### Option 1: Downgrade Tailwind CSS

```bash
npm install tailwindcss@3
```

### Option 2: Use PostCSS instead

Update `tailwind.config.ts`:

```typescript
export default {
  // ... your config
  future: {
    hoverOnlyWhenSupported: true,
  },
};
```

### Option 3: Force rebuild native modules

```bash
docker-compose exec document-spa npm rebuild
```

## Current Status

✅ Dockerfile updated to use `node:20` (Debian-based)
🔄 Rebuilding container (this may take 2-3 minutes)
✅ Should resolve the lightningcss error

## After Rebuild

Access your app at: `http://localhost:4001`

The error should be resolved!
