// ============================================================
// HOUSE OF QUEEN BEE — server.js
// Node.js Backend — Payment Integration
// ============================================================
// SETUP INSTRUCTIONS:
// 1. Install Node.js from https://nodejs.org
// 2. In this folder run: npm install
// 3. Fill in your credentials in .env file
// 4. Run the server: node server.js
// 5. Server runs at http://localhost:3000
// ============================================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

// Serve your frontend files from the same folder
app.use(express.static(path.join(__dirname, "public")));

// ============================================================
// PAYNOW (Zimbabwe) — handles both card & EcoCash
// ============================================================
// HOW TO GET CREDENTIALS:
// 1. Go to https://www.paynow.co.zw/
// 2. Register as a merchant
// 3. Go to Settings > Integration > Add Integration
// 4. Copy your Integration ID and Integration Key into .env
// ============================================================
const Paynow = require("paynow");

const paynow = new Paynow(
  process.env.PAYNOW_INTEGRATION_ID,
  process.env.PAYNOW_INTEGRATION_KEY
);
paynow.resultUrl = process.env.BASE_URL + "/payment/paynow/result";
paynow.returnUrl = process.env.BASE_URL + "/payment/paynow/return";

// Initiate a PayNow card/web payment
app.post("/payment/paynow/initiate", async (req, res) => {
  try {
    const { email, cartItems, reference } = req.body;

    const payment = paynow.createPayment(reference, email);

    // Add each cart item to the payment
    cartItems.forEach(item => {
      payment.add(`${item.name} (Size: ${item.size})`, item.price * item.qty);
    });

    const response = await paynow.send(payment);

    if (response.success) {
      res.json({
        success: true,
        redirectUrl: response.redirectUrl,  // Send user here to pay
        pollUrl: response.pollUrl           // Use this to check payment status
      });
    } else {
      res.status(400).json({ success: false, error: "Payment initiation failed" });
    }
  } catch (err) {
    console.error("PayNow error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Initiate EcoCash mobile payment via PayNow
app.post("/payment/ecocash/initiate", async (req, res) => {
  try {
    const { email, phone, cartItems, reference } = req.body;

    const payment = paynow.createPayment(reference, email);

    cartItems.forEach(item => {
      payment.add(`${item.name} (Size: ${item.size})`, item.price * item.qty);
    });

    // "ecocash" tells PayNow to send a USSD push to the phone
    const response = await paynow.sendMobile(payment, phone, "ecocash");

    if (response.success) {
      res.json({
        success: true,
        pollUrl: response.pollUrl,  // Poll this URL to check if customer paid
        instructions: response.instructions
      });
    } else {
      res.status(400).json({ success: false, error: "EcoCash initiation failed" });
    }
  } catch (err) {
    console.error("EcoCash error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Poll PayNow/EcoCash payment status
app.post("/payment/paynow/poll", async (req, res) => {
  try {
    const { pollUrl } = req.body;
    const status = await paynow.pollTransaction(pollUrl);
    res.json({ success: true, status: status.status, paid: status.paid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PayNow result webhook (called by PayNow server after payment)
app.post("/payment/paynow/result", (req, res) => {
  console.log("PayNow result webhook:", req.body);
  // TODO: Update your database/order status here
  res.sendStatus(200);
});

// PayNow return page (customer lands here after paying)
app.get("/payment/paynow/return", (req, res) => {
  res.redirect("/#order-confirmed");
});

// ============================================================
// STRIPE — International cards
// ============================================================
// HOW TO GET CREDENTIALS:
// 1. Go to https://dashboard.stripe.com/register
// 2. Complete account setup
// 3. Go to Developers > API Keys
// 4. Copy Secret Key into .env (starts with sk_live_ or sk_test_)
// 5. Copy Publishable Key into .env (starts with pk_live_ or pk_test_)
// ============================================================
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Create a PaymentIntent (called before showing card form)
app.post("/payment/stripe/create-intent", async (req, res) => {
  try {
    const { amount, email } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses cents
      currency: "usd",
      receipt_email: email,
      metadata: { store: "House of Queen Bee" },
      payment_method_types: ["card"],
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret, // Send to frontend
    });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Stripe webhook — called by Stripe when payment succeeds
app.post("/payment/stripe/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      console.log("Stripe payment succeeded:", paymentIntent.id);
      // TODO: Update your order status in database here
    }

    res.json({ received: true });
  }
);

// ============================================================
// PAYPAL
// ============================================================
// HOW TO GET CREDENTIALS:
// 1. Go to https://developer.paypal.com/
// 2. Log in with your PayPal business account
// 3. Go to Apps & Credentials
// 4. Create an app — copy Client ID and Secret into .env
// 5. Switch from Sandbox to Live when ready
// ============================================================
const paypal = require("@paypal/checkout-server-sdk");

function getPayPalClient() {
  const env = process.env.PAYPAL_MODE === "live"
    ? new paypal.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      )
    : new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      );
  return new paypal.core.PayPalHttpClient(env);
}

// Create a PayPal order
app.post("/payment/paypal/create-order", async (req, res) => {
  try {
    const { amount, cartItems } = req.body;
    const client = getPayPalClient();

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [{
        amount: {
          currency_code: "USD",
          value: amount.toFixed(2),
          breakdown: {
            item_total: { currency_code: "USD", value: amount.toFixed(2) }
          }
        },
        items: cartItems.map(item => ({
          name: `${item.name} (${item.size})`,
          quantity: item.qty.toString(),
          unit_amount: { currency_code: "USD", value: item.price.toFixed(2) }
        })),
        description: "House of Queen Bee Order"
      }]
    });

    const order = await client.execute(request);
    res.json({ success: true, orderID: order.result.id });
  } catch (err) {
    console.error("PayPal create order error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Capture a PayPal order (called after customer approves)
app.post("/payment/paypal/capture-order", async (req, res) => {
  try {
    const { orderID } = req.body;
    const client = getPayPalClient();

    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const capture = await client.execute(request);
    const status = capture.result.status;

    if (status === "COMPLETED") {
      console.log("PayPal payment captured:", orderID);
      // TODO: Update your order status in database here
      res.json({ success: true, status });
    } else {
      res.status(400).json({ success: false, status });
    }
  } catch (err) {
    console.error("PayPal capture error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================
// START SERVER
// ============================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🐝 House of Queen Bee server running!`);
  console.log(`👉 http://localhost:${PORT}\n`);
});
