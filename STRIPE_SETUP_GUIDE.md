# 🔐 Stripe Payment Integration Setup Guide

## ⚡ Quick Setup

### 1. Get Your Stripe API Key
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Secret Key** (starts with `sk_test_` for testing or `sk_live_` for production)

### 2. Update Environment Variable
Edit `/app/backend/.env` file:
```
STRIPE_API_KEY="sk_test_your_actual_stripe_secret_key_here"
```

### 3. Restart Backend
```bash
sudo supervisorctl restart backend
```

### 4. Test the Integration
Visit: `http://localhost:3000/payment/test`

## 🧪 Test Payment Flow

### Test Card Numbers
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **Insufficient Funds:** 4000 0000 0000 9995

### Test Expiry: Any future date (e.g., 12/25)
### Test CVV: Any 3 digits (e.g., 123)

## 🔄 How It Works

### Payment Flow:
1. **Frontend** → Request payment for domain
2. **Backend** → Create Stripe checkout session (price from DB)
3. **User** → Redirected to Stripe to pay
4. **Stripe** → Redirects back with session_id
5. **Frontend** → Polls payment status
6. **Backend** → Updates payment status
7. **Escrow** → Payment held until domain transfer

### Security Features:
- ✅ Domain prices fetched from backend (never trust frontend)
- ✅ Payment held in escrow until domain transfer
- ✅ Session-based payment tracking
- ✅ Automatic status polling
- ✅ Webhook support for real-time updates

## 🗂️ Database Collections

### `payment_transactions`
```json
{
  "id": "uuid",
  "stripe_session_id": "cs_xxx",
  "domain_id": "domain_uuid",
  "domain_name": "example.com",
  "amount": 5999.0,
  "currency": "usd",
  "payment_status": "paid",
  "buyer_id": "user_uuid",
  "seller_id": "seller_uuid",
  "created_at": "2025-06-11T12:00:00",
  "metadata": {...}
}
```

## 🔗 API Endpoints

### Create Checkout Session
```
POST /api/payments/checkout/domain
{
  "domain_id": "uuid",
  "origin_url": "http://localhost:3000"
}
```

### Check Payment Status  
```
GET /api/payments/status/{session_id}
```

### Payment History
```
GET /api/payments/history
```

## 🚀 Production Deployment

1. Replace test API key with live key
2. Configure webhook endpoints
3. Set up Stripe Connect for seller payouts
4. Enable additional payment methods
5. Configure international payments

## 🔧 Troubleshooting

### Common Issues:
- **"Not authenticated"** → User not logged in
- **"Domain not found"** → Invalid domain_id
- **"No checkout URL"** → Stripe key issue
- **Payment polling fails** → Check CORS settings

### Debug Steps:
1. Check backend logs: `tail -f /var/log/supervisor/backend.*.log`
2. Verify Stripe key in .env file
3. Test API directly with curl
4. Check browser console for errors