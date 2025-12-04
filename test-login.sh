#!/bin/bash

# Configuration
PROXY_URL="http://localhost:4001/api/auth/login"
EMAIL="mohamed@yahoo.com"
PASSWORD="password"

echo "🧪 Testing Login API..."
echo "--------------------------------"
echo "Target: $PROXY_URL"
echo "Email: $EMAIL"
echo "Password: $PASSWORD"

# Test Login
RESPONSE=$(curl -s -X POST "$PROXY_URL" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

echo "--------------------------------"
echo "Response:"
echo "$RESPONSE"
echo "--------------------------------"

if echo "$RESPONSE" | grep -q "access_token"; then
  echo "✅ Login Successful!"
else
  echo "❌ Login Failed"
  # Try to register if login failed (optional, but helpful for testing)
  echo "Attempting to register user just in case..."
  REGISTER_URL="http://localhost:4001/api/auth/register"
  REG_RESPONSE=$(curl -s -X POST "$REGISTER_URL" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d "{
      \"name\": \"Mohamed\",
      \"email\": \"$EMAIL\",
      \"password\": \"$PASSWORD\",
      \"password_confirmation\": \"$PASSWORD\"
    }")
  echo "Registration Response: $REG_RESPONSE"
  
  # Retry login
  echo "Retrying login..."
  RESPONSE_RETRY=$(curl -s -X POST "$PROXY_URL" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d "{
      \"email\": \"$EMAIL\",
      \"password\": \"$PASSWORD\"
    }")
    
  if echo "$RESPONSE_RETRY" | grep -q "access_token"; then
    echo "✅ Login Successful after registration!"
    echo "Response: $RESPONSE_RETRY"
  else
    echo "❌ Login Failed even after registration attempt."
  fi
fi

echo "Done."
