#!/bin/bash

# Configuration
API_URL="http://localhost:8001/api/auth/register"
PROXY_URL="http://localhost:4001/api/auth/register"
EMAIL="testuser_$(date +%s)@example.com"
PASSWORD="password123"
NAME="Test User"

echo "🧪 Testing Registration API..."
echo "--------------------------------"

# 1. Test Direct Backend Registration
echo "1. Testing Direct Backend ($API_URL)..."
RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{
    \"name\": \"$NAME\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"password_confirmation\": \"$PASSWORD\"
  }")

if echo "$RESPONSE" | grep -q "User registered successfully"; then
  echo "✅ Direct Backend Registration Successful!"
else
  echo "❌ Direct Backend Registration Failed"
  echo "Response: $RESPONSE"
fi

echo "--------------------------------"

# 2. Test Frontend Proxy Registration
EMAIL_PROXY="proxy_$(date +%s)@example.com"
echo "2. Testing Frontend Proxy ($PROXY_URL)..."
RESPONSE_PROXY=$(curl -s -X POST "$PROXY_URL" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{
    \"name\": \"$NAME\",
    \"email\": \"$EMAIL_PROXY\",
    \"password\": \"$PASSWORD\",
    \"password_confirmation\": \"$PASSWORD\"
  }")

if echo "$RESPONSE_PROXY" | grep -q "User registered successfully"; then
  echo "✅ Frontend Proxy Registration Successful!"
else
  echo "❌ Frontend Proxy Registration Failed"
  echo "Response: $RESPONSE_PROXY"
fi

echo "--------------------------------"
echo "Done."
