# 🔗 Share Links Feature - Complete Guide

## Overview

The share links feature allows document owners to generate shareable URLs that anyone can use to access documents without logging in. This enables easy collaboration with external users.

---

## 🎯 How It Works

### **3 Ways to Access a Document:**

1. **Owner** - User who created the document (full access)
2. **Collaborator** - User explicitly added by owner (full access)
3. **Share Link** - Anyone with the link (configurable access)

---

## 🔐 Access Levels

### **Edit Permission**

- Can view the document
- Can edit content
- Can edit title
- Changes are saved and synced in real-time
- Appears in active users list

### **View Only Permission**

- Can view the document
- **Cannot** edit content or title
- UI shows "👁️ View Only" badge
- Text areas are disabled
- Still sees real-time updates from others
- Appears in active users list

---

## 📋 Complete User Flow

### **For Document Owner:**

1. Open a document in the editor
2. Click the **"Share"** button in the header
3. Choose permission level:
   - **Can Edit** - Full editing rights
   - **View Only** - Read-only access
4. (Optional) Set expiration:
   - Enter number of days (1-365)
   - Leave empty for no expiration
5. Click **"Generate Share Link"**
6. Copy the generated URL
7. Share via email, Slack, etc.

**To Revoke:**

- Click "Revoke Share Link" button
- Link becomes invalid immediately
- Users with the link lose access

### **For Share Link User:**

1. Receive share link: `http://localhost:4001/share/abc123xyz`
2. Click the link
3. Automatically redirected to document editor
4. See permission badge:
   - 🟢 "✏️ Can Edit" - Can make changes
   - 🟡 "👁️ View Only" - Read-only mode
5. Start viewing/editing (based on permission)
6. See other active users in real-time
7. Changes sync instantly with all users

---

## 🔄 Real-Time Collaboration

### **What All Users See:**

**Active Users (Avatars):**

- Owner's avatar
- Collaborators' avatars
- Share link users' avatars
- Up to 3 avatars shown, "+X" for more

**Real-Time Updates:**

- Owner types → Everyone sees it instantly
- Collaborator types → Everyone sees it instantly
- Share link user (edit) types → Everyone sees it instantly
- Share link user (view) → Sees updates, cannot edit

**User Presence:**

- When user joins → All users notified
- When user leaves → All users notified
- Active users count updated live

---

## 🛠️ Technical Implementation

### **Backend (Laravel)**

**Database Fields (documents table):**

```sql
share_token VARCHAR(64) UNIQUE    -- Random 64-char token
is_share_enabled BOOLEAN           -- Enable/disable sharing
share_permission ENUM('view','edit') -- Access level
share_expires_at TIMESTAMP         -- Optional expiration
```

**API Endpoints:**

```
POST   /api/documents/{id}/share          -- Generate link
DELETE /api/documents/{id}/share          -- Revoke link
GET    /api/share/{token}                 -- Access by token (public)
```

**Example Request:**

```bash
# Generate share link
curl -X POST http://localhost/api/documents/1/share \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permission": "edit",
    "expires_in_days": 7
  }'

# Response
{
  "message": "Share link generated successfully",
  "share_token": "abc123xyz...",
  "share_url": "http://localhost:4001/share/abc123xyz...",
  "permission": "edit",
  "expires_in_days": 7
}
```

### **Frontend (Next.js)**

**Routes:**

- `/share/[token]` - Public share link landing page
- `/documents/[id]?share=true` - Document editor with share access

**Flow:**

1. User opens `/share/abc123xyz`
2. Page validates token via API
3. Stores token & permission in sessionStorage
4. Redirects to `/documents/1?share=true`
5. Editor loads document via share token
6. UI shows permission badge
7. Disables editing if view-only

**Components:**

- `ShareModal.tsx` - Generate/revoke share links
- `app/share/[token]/page.tsx` - Share link landing page
- `app/documents/[id]/page.tsx` - Editor with share support

---

## 🎨 UI Features

### **Share Modal**

**Before Generating:**

- Permission dropdown (Edit/View Only)
- Expiration input (optional)
- "Generate Share Link" button

**After Generating:**

- Share URL display
- "Copy" button (with "Copied!" feedback)
- Permission & expiration info
- "Revoke Share Link" button

### **Document Editor**

**For Share Link Users:**

- Permission badge in header:
  - 🟢 Green "✏️ Can Edit"
  - 🟡 Yellow "👁️ View Only"
- Disabled UI elements for view-only:
  - Title input (grayed out)
  - Content textarea (grayed out)
  - Placeholder: "View only mode"

**For All Users:**

- Active user avatars (owner, collaborators, share users)
- Real-time content updates
- Save status indicator
- User presence tracking

---

## 🔒 Security

### **Token Generation:**

- 64-character random hex string
- Cryptographically secure (random_bytes)
- Unique constraint in database
- Collision check on generation

### **Access Control:**

```php
// Owner check
if ($document->user_id === $userId) { /* full access */ }

// Collaborator check
if ($document->collaborators->contains('id', $userId)) { /* full access */ }

// Share link check
if ($document->share_token === $token && $document->isShareValid()) {
    // Access based on share_permission
}
```

### **Expiration:**

- Optional expiration date
- Checked on every access
- Expired links return 404
- Can be set 1-365 days

### **Revocation:**

- Sets `is_share_enabled = false`
- Token remains in database (for audit)
- Immediate effect
- Can regenerate new link

---

## 📊 Example Scenarios

### **Scenario 1: Team Collaboration**

**Owner (Alice):**

1. Creates document "Project Plan"
2. Generates share link with "Can Edit"
3. Shares link with team via Slack

**Team Members (Bob, Carol):**

1. Click link → Instant access
2. Both can edit simultaneously
3. See each other's changes in real-time
4. See Alice's avatar when she's online

### **Scenario 2: Client Review**

**Owner (Designer):**

1. Creates document "Design Mockup"
2. Generates share link with "View Only"
3. Sets expiration: 7 days
4. Sends to client

**Client:**

1. Opens link → Read-only access
2. Sees "👁️ View Only" badge
3. Cannot edit (UI disabled)
4. Sees updates if designer makes changes
5. Link expires after 7 days

### **Scenario 3: Public Sharing**

**Owner (Teacher):**

1. Creates document "Lecture Notes"
2. Generates share link with "View Only"
3. No expiration
4. Posts on website

**Students:**

1. Anyone can access
2. All see same content
3. Real-time updates when teacher edits
4. Cannot modify content

---

## 🧪 Testing

### **Test Share Links:**

```bash
# 1. Start services
docker-compose up -d

# 2. Run migration
docker-compose exec document-php php artisan migrate

# 3. Open browser
http://localhost:4001

# 4. Create account & document

# 5. Click "Share" button

# 6. Generate link with "Can Edit"

# 7. Open link in incognito window

# 8. Both windows should show:
   - Same content
   - Both user avatars
   - Real-time updates
```

### **Test View-Only:**

1. Generate link with "View Only"
2. Open in incognito
3. Verify:
   - ✅ "👁️ View Only" badge shows
   - ✅ Title input is disabled
   - ✅ Content textarea is disabled
   - ✅ Placeholder says "View only mode"
   - ✅ Can see real-time updates
   - ✅ Cannot type or edit

### **Test Expiration:**

1. Generate link with 1 day expiration
2. Manually set `share_expires_at` to past date in database
3. Try to access link
4. Should see "Invalid or expired share link" error

---

## 🎯 Summary

**✅ Complete Features:**

- Generate share links with permissions
- Optional expiration (1-365 days)
- Copy to clipboard
- Revoke links
- Public access (no login required)
- Real-time collaboration
- User presence for all users
- View-only mode with disabled UI
- Permission badges
- Secure token generation
- Access control

**🎨 User Experience:**

- Beautiful modal UI
- One-click copy
- Clear permission indicators
- Disabled UI for read-only
- Real-time updates for all
- Active user avatars

**🔒 Security:**

- Secure random tokens
- Expiration support
- Revocation capability
- Access level control
- Validation on every access

The share links feature is **100% complete** and ready to use!
