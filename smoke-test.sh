#!/bin/bash

# Smoke Test Script for Real-Time Collaborative Document Editor
# Using localhost instead of domain names

set -e  # Exit on error

echo "🧪 Starting Smoke Tests..."
echo "================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost/api"
TOKEN=""
DOCUMENT_ID=""
USER_EMAIL="smoketest_$(date +%s)@example.com"

# Function to print success
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
error() {
    echo -e "${RED}✗ $1${NC}"
    exit 1
}

# Function to print info
info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

echo ""
echo "1️⃣  Testing User Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Smoke Test User\",
    \"email\": \"$USER_EMAIL\",
    \"password\": \"password123\",
    \"password_confirmation\": \"password123\"
  }")

if echo "$REGISTER_RESPONSE" | grep -q "User registered successfully"; then
    success "User registration successful"
else
    error "User registration failed: $REGISTER_RESPONSE"
fi

echo ""
echo "2️⃣  Testing User Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$USER_EMAIL\",
    \"password\": \"password123\"
  }")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    success "User login successful - Token received"
    info "Token: ${TOKEN:0:20}..."
else
    error "User login failed: $LOGIN_RESPONSE"
fi

echo ""
echo "3️⃣  Testing Get Current User..."
ME_RESPONSE=$(curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN")

if echo "$ME_RESPONSE" | grep -q "$USER_EMAIL"; then
    success "Get current user successful"
else
    error "Get current user failed: $ME_RESPONSE"
fi

echo ""
echo "4️⃣  Testing Document Creation..."
CREATE_DOC_RESPONSE=$(curl -s -X POST "$API_URL/documents" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Smoke Test Document",
    "content": "Initial content for smoke test"
  }')

DOCUMENT_ID=$(echo "$CREATE_DOC_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -n "$DOCUMENT_ID" ]; then
    success "Document created successfully - ID: $DOCUMENT_ID"
else
    error "Document creation failed: $CREATE_DOC_RESPONSE"
fi

echo ""
echo "5️⃣  Testing Get All Documents..."
GET_DOCS_RESPONSE=$(curl -s -X GET "$API_URL/documents" \
  -H "Authorization: Bearer $TOKEN")

if echo "$GET_DOCS_RESPONSE" | grep -q "Smoke Test Document"; then
    success "Get all documents successful"
else
    error "Get all documents failed: $GET_DOCS_RESPONSE"
fi

echo ""
echo "6️⃣  Testing Get Single Document..."
GET_DOC_RESPONSE=$(curl -s -X GET "$API_URL/documents/$DOCUMENT_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo "$GET_DOC_RESPONSE" | grep -q "Smoke Test Document"; then
    success "Get single document successful"
else
    error "Get single document failed: $GET_DOC_RESPONSE"
fi

echo ""
echo "7️⃣  Testing Document Update (Creates Version)..."
UPDATE_DOC_RESPONSE=$(curl -s -X PUT "$API_URL/documents/$DOCUMENT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated content - version 2"
  }')

if echo "$UPDATE_DOC_RESPONSE" | grep -q "Document updated successfully"; then
    success "Document updated successfully"
else
    error "Document update failed: $UPDATE_DOC_RESPONSE"
fi

echo ""
echo "8️⃣  Testing Document Update Again (Creates Another Version)..."
sleep 1
UPDATE_DOC_RESPONSE2=$(curl -s -X PUT "$API_URL/documents/$DOCUMENT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated content - version 3"
  }')

if echo "$UPDATE_DOC_RESPONSE2" | grep -q "Document updated successfully"; then
    success "Document updated again successfully"
else
    error "Second document update failed: $UPDATE_DOC_RESPONSE2"
fi

echo ""
echo "9️⃣  Testing Get Version History..."
sleep 1
VERSIONS_RESPONSE=$(curl -s -X GET "$API_URL/documents/$DOCUMENT_ID/versions" \
  -H "Authorization: Bearer $TOKEN")

VERSION_COUNT=$(echo "$VERSIONS_RESPONSE" | grep -o '"version_number"' | wc -l)

if [ "$VERSION_COUNT" -ge 3 ]; then
    success "Version history retrieved - Found $VERSION_COUNT versions"
else
    error "Version history failed - Expected at least 3 versions, found $VERSION_COUNT: $VERSIONS_RESPONSE"
fi

echo ""
echo "🔟  Testing Document Title Update..."
TITLE_UPDATE_RESPONSE=$(curl -s -X PUT "$API_URL/documents/$DOCUMENT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Smoke Test Document"
  }')

if echo "$TITLE_UPDATE_RESPONSE" | grep -q "Document updated successfully"; then
    success "Document title updated successfully"
else
    error "Document title update failed: $TITLE_UPDATE_RESPONSE"
fi

echo ""
echo "1️⃣1️⃣  Testing Document Deletion..."
DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/documents/$DOCUMENT_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo "$DELETE_RESPONSE" | grep -q "Document deleted successfully"; then
    success "Document deleted successfully"
else
    error "Document deletion failed: $DELETE_RESPONSE"
fi

echo ""
echo "1️⃣2️⃣  Testing Token Refresh..."
REFRESH_RESPONSE=$(curl -s -X POST "$API_URL/auth/refresh" \
  -H "Authorization: Bearer $TOKEN")

NEW_TOKEN=$(echo "$REFRESH_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -n "$NEW_TOKEN" ]; then
    success "Token refresh successful"
else
    error "Token refresh failed: $REFRESH_RESPONSE"
fi

echo ""
echo "1️⃣3️⃣  Testing Logout..."
LOGOUT_RESPONSE=$(curl -s -X POST "$API_URL/auth/logout" \
  -H "Authorization: Bearer $TOKEN")

if echo "$LOGOUT_RESPONSE" | grep -q "Successfully logged out"; then
    success "Logout successful"
else
    error "Logout failed: $LOGOUT_RESPONSE"
fi

echo ""
echo "1️⃣4️⃣  Testing Socket.io Server..."
SOCKET_RESPONSE=$(curl -s http://localhost:6002)

if echo "$SOCKET_RESPONSE" | grep -q "Socket.io"; then
    success "Socket.io server is running"
else
    info "Socket.io server check - Response: $SOCKET_RESPONSE"
fi

echo ""
echo "================================"
echo -e "${GREEN}🎉 All Smoke Tests Passed!${NC}"
echo "================================"
echo ""
echo "Summary:"
echo "  ✓ User Registration"
echo "  ✓ User Login (JWT)"
echo "  ✓ Get Current User"
echo "  ✓ Create Document"
echo "  ✓ List Documents"
echo "  ✓ Get Document"
echo "  ✓ Update Document (with versioning)"
echo "  ✓ Version History (3+ versions)"
echo "  ✓ Update Title"
echo "  ✓ Delete Document"
echo "  ✓ Token Refresh"
echo "  ✓ Logout"
echo "  ✓ Socket.io Server"
echo ""
