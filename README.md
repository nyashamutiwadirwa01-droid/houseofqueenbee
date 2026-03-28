# 🐝 House of Queen Bee — Backend Setup Guide

## Folder Structure
```
house-of-queen-bee/
│
├── public/               ← Put your frontend files here
│   ├── index.html
│   ├── style.css
│   └── app.js
│
├── server.js             ← Backend server
├── package.json          ← Node.js dependencies
├── .env                  ← Your secret credentials (never share!)
└── .env.example          ← Template for .env
```

---

## Step 1 — Install Node.js
Download and install from: https://nodejs.org  
Choose the **LTS** version.

---

## Step 2 — Set Up the Project
Open a terminal/command prompt in this folder and run:
```bash
npm install
```
This installs all the payment libraries automatically.

---

## Step 3 — Create Your .env File
1. Copy `.env.example` and rename the copy to `.env`
2. Fill in your credentials (see below for how to get each one)

---

## Step 4 — Get Your Payment Credentials

### PayNow (Zimbabwe) 🇿🇼
1. Go to https://www.paynow.co.zw/
2. Register/login as a merchant
3. Go to **Settings → Integration → Add Integration**
4. Set return URL to: `http://yourdomain.com/payment/paynow/return`
5. Set result URL to: `http://yourdomain.com/payment/paynow/result`
6. Copy **Integration ID** and **Integration Key** into `.env`

### EcoCash 💚
- Handled automatically through PayNow — no separate account needed!
- Just make sure your PayNow account has mobile money enabled.

### Stripe 💳
1. Go to https://dashboard.stripe.com/register
2. Fill in business details
3. Go to **Developers → API Keys**
4. Copy **Secret Key** (sk_test_...) and **Publishable Key** (pk_test_...) into `.env`
5. For webhooks: Go to **Developers → Webhooks → Add endpoint**
   - URL: `http://yourdomain.com/payment/stripe/webhook`
   - Events: `payment_intent.succeeded`
   - Copy the **Signing Secret** into `.env`

### PayPal 🔵
1. Go to https://developer.paypal.com/
2. Log in with your PayPal Business account
3. Go to **Apps & Credentials**
4. Click **Create App** — give it a name
5. Copy **Client ID** and **Secret** into `.env`
6. Change `PAYPAL_MODE=sandbox` to `PAYPAL_MODE=live` when going live

---

## Step 5 — Move Frontend Files
Move your frontend files into the `public/` folder:
- `index.html` → `public/index.html`
- `style.css` → `public/style.css`
- `app.js` → `public/app.js`

---

## Step 6 — Run the Server
```bash
node server.js
```
Open your browser and go to: **http://localhost:3000**

For development with auto-restart:
```bash
npm run dev
```

---

## Step 7 — Go Live (Hosting)
To put the site online, you need a hosting service. Options:

| Service | Cost | Best For |
|---|---|---|
| **Railway** | Free tier available | Easy Node.js hosting |
| **Render** | Free tier available | Simple deployment |
| **DigitalOcean** | ~$6/month | More control |
| **VPS (Hetzner)** | ~$4/month | Cheapest full control |

Once hosted, update `BASE_URL` in `.env` to your real domain.

---

## Testing Payments (Without Real Money)

### PayNow Test
- Use PayNow's test mode in their merchant portal

### Stripe Test Cards
| Card Number | Result |
|---|---|
| 4242 4242 4242 4242 | ✅ Success |
| 4000 0000 0000 9995 | ❌ Declined |
Use any future expiry date and any 3-digit CVV.

### PayPal Sandbox
- Use the sandbox accounts created automatically in developer.paypal.com

---

## Need Help?
Contact: info@houseofqueenbee.com  
WhatsApp: +263 78 612 7266
