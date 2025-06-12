#!/bin/bash

echo "🧪 Testing Payment Flow Components..."
echo "======================================"

# Test 1: Check if digitalspace.co is available
echo "1️⃣ Testing domain availability..."
DOMAIN_STATUS=$(curl -s http://localhost:8001/api/domains | jq -r '.[] | select(.name == "digitalspace") | .status')
echo "   digitalspace.co status: $DOMAIN_STATUS"

if [ "$DOMAIN_STATUS" != "available" ]; then
    echo "   ❌ Domain not available for purchase"
    exit 1
fi

# Test 2: Create checkout session
echo "2️⃣ Testing checkout session creation..."
CHECKOUT_RESPONSE=$(curl -s -X POST http://localhost:8001/api/payments/checkout/domain \
  -H "Content-Type: application/json" \
  -d '{
    "domain_id": "1f403463-ea8f-4060-9b32-f8532d177f11",
    "origin_url": "https://fe2a4b0f-3203-46bc-b0cf-2cc736b736fd.preview.emergentagent.com"
  }')

SESSION_ID=$(echo $CHECKOUT_RESPONSE | jq -r '.session_id')
echo "   Session ID: $SESSION_ID"

if [ "$SESSION_ID" == "null" ]; then
    echo "   ❌ Failed to create checkout session"
    echo "   Response: $CHECKOUT_RESPONSE"
    exit 1
fi

# Test 3: Check initial payment status
echo "3️⃣ Testing initial payment status..."
INITIAL_STATUS=$(curl -s http://localhost:8001/api/payments/status/$SESSION_ID | jq -r '.payment_status')
echo "   Initial status: $INITIAL_STATUS"

# Test 4: Complete mock payment
echo "4️⃣ Testing mock payment completion..."
COMPLETION_RESPONSE=$(curl -s -X POST http://localhost:8001/api/payments/mock/complete/$SESSION_ID)
COMPLETION_STATUS=$(echo $COMPLETION_RESPONSE | jq -r '.status')
echo "   Completion status: $COMPLETION_STATUS"

if [ "$COMPLETION_STATUS" != "success" ]; then
    echo "   ❌ Failed to complete mock payment"
    echo "   Response: $COMPLETION_RESPONSE"
    exit 1
fi

# Test 5: Check final payment status
echo "5️⃣ Testing final payment status..."
FINAL_STATUS=$(curl -s http://localhost:8001/api/payments/status/$SESSION_ID | jq -r '.payment_status')
echo "   Final status: $FINAL_STATUS"

if [ "$FINAL_STATUS" != "paid" ]; then
    echo "   ❌ Payment status not updated to 'paid'"
    exit 1
fi

echo ""
echo "✅ All payment flow components working correctly!"
echo "🎯 digitalspace.co payment should now work without timeout"