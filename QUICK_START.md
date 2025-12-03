# 🎯 Quick Start Guide

## Open in Browser

```
http://localhost:4001
```

## What You'll See

### 1. Login/Register Screen

- Beautiful gradient background
- Login or Register option
- Form validation

### 2. Documents Dashboard

- Grid of your documents
- "+ New Document" button
- Each card shows:
  - Title
  - Last updated time
  - Collaborator count

### 3. Document Editor

- Clean, minimal interface
- Auto-save indicator
- Active user avatars
- Real-time updates

## Test Real-Time Collaboration

1. Open `http://localhost:4001` in **Chrome**
2. Login and create a document
3. Open `http://localhost:4001` in **Firefox** (or incognito)
4. Login with **same account**
5. Open the **same document**
6. **Type in one browser** → See it appear **instantly** in the other!

## Features to Try

✅ **Create** - Click "+ New Document"
✅ **Edit** - Type anywhere, auto-saves in 1 second
✅ **Real-Time** - Open in 2 browsers, see live updates
✅ **Versions** - Every save creates a version (automatic)
✅ **Collaborate** - See other users' avatars
✅ **Delete** - Remove documents you don't need

## Troubleshooting

**Can't access?**

```bash
docker-compose ps
```

All services should show "Up"

**Not loading?**

```bash
docker-compose restart document-spa
```

**Need to rebuild?**

```bash
docker-compose up -d --build
```

## Full Documentation

See `README.md` for complete details!
