import { Request, Response } from 'express';
import Stripe from 'stripe';
import { DataStore } from '../services/dataStore.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number; // in USD
}

export const CREDIT_PACKAGES: Record<string, CreditPackage> = {
  pkg_100: { id: 'pkg_100', name: 'Starter Backer', credits: 100, price: 10 },
  pkg_300: { id: 'pkg_300', name: 'Pioneer Supporter', credits: 300, price: 25 },
  pkg_800: { id: 'pkg_800', name: 'Impact Advocate', credits: 800, price: 60 },
  pkg_1500: { id: 'pkg_1500', name: 'Patron Founder', credits: 1500, price: 110 },
  // Semantic alias mappings
  starter: { id: 'pkg_100', name: 'Starter Backer', credits: 100, price: 10 },
  popular: { id: 'pkg_300', name: 'Pioneer Supporter', credits: 300, price: 25 },
  advocate: { id: 'pkg_800', name: 'Impact Advocate', credits: 800, price: 60 },
  founder: { id: 'pkg_1500', name: 'Patron Founder', credits: 1500, price: 110 },
};

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured on the server. Please set it in your environment variables.');
  }
  return new Stripe(secretKey);
}

/**
 * Shared helper to verify, prevent duplicate processing, and credit user wallet
 */
export async function processSuccessfulPayment(session: Stripe.Checkout.Session | any) {
  const transactionId = session.id || (session.payment_intent as string);
  if (!transactionId) {
    throw new Error('Transaction ID not found in session.');
  }

  // 1. Prevent duplicate processing
  const existingPayment = await DataStore.getPaymentByTransactionId(transactionId);
  if (existingPayment) {
    console.log(`[Payment] Transaction ${transactionId} has already been processed.`);
    return {
      alreadyProcessed: true,
      payment: existingPayment,
    };
  }

  // 2. Identify user and credit package
  const userEmail = (
    session.customer_email ||
    session.metadata?.user_email ||
    session.client_reference_id
  )?.toLowerCase();

  if (!userEmail) {
    throw new Error('Could not identify user email from Stripe session metadata or customer_email.');
  }

  const packageId = session.metadata?.package_id;
  const verifiedPkg = CREDIT_PACKAGES[packageId] || CREDIT_PACKAGES['pkg_' + session.metadata?.credits];

  // Backend determines actual credits and price - never trust untrusted client fields
  const credits = verifiedPkg ? verifiedPkg.credits : Number(session.metadata?.credits || 100);
  const amount = verifiedPkg ? verifiedPkg.price : Number(session.metadata?.price || 10);
  const packageName = verifiedPkg ? `${verifiedPkg.name} (${verifiedPkg.credits} Credits)` : `${credits} Platform Credits`;

  // 3. Save Payment Record
  const payment = await DataStore.createPayment({
    user_email: userEmail,
    package_name: packageName,
    credits,
    amount,
    transaction_id: transactionId,
    payment_method: 'Stripe',
    status: 'completed',
  });

  // 4. Increase user's credits
  const updatedUser = await DataStore.updateUserCredits(userEmail, credits);

  // 5. Send Notification
  await DataStore.createNotification({
    toEmail: userEmail,
    message: `Stripe payment of $${amount}.00 confirmed! Added ${credits} credits to your FundBridge wallet.`,
    actionRoute: '/dashboard/purchase-credit',
  });

  console.log(`[Payment] Successfully credited ${credits} credits to ${userEmail} (Txn: ${transactionId})`);

  return {
    alreadyProcessed: false,
    payment,
    newBalance: updatedUser?.credits,
  };
}

/**
 * POST /api/payments/create-checkout-session
 * Creates real Stripe Checkout Session
 */
export async function createCheckoutSession(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const { packageId } = req.body;
    const pkg = CREDIT_PACKAGES[packageId];
    if (!pkg) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credit package selected. Allowed packages: pkg_100, pkg_300, pkg_800, pkg_1500.',
      });
    }

    const stripe = getStripeClient();
    const clientUrl = process.env.CLIENT_URL || req.headers.origin || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${pkg.name} (${pkg.credits} Credits)`,
              description: `FundBridge Platform Backer Credits for campaign backing and pledges`,
            },
            unit_amount: pkg.price * 100, // in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: req.user.email,
      client_reference_id: req.user.id || req.user.email,
      metadata: {
        package_id: pkg.id,
        user_email: req.user.email,
        credits: String(pkg.credits),
        price: String(pkg.price),
      },
      success_url: `${clientUrl}/dashboard/purchase-credit?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${clientUrl}/dashboard/purchase-credit?canceled=true`,
    });

    return res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url,
      package: pkg,
    });
  } catch (error: any) {
    console.error('[Stripe Session Creation Error]', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Stripe checkout session initiation failed.',
    });
  }
}

/**
 * POST /api/payments/verify-session
 * Verifies paid checkout session upon client redirect
 */
export async function verifySession(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'sessionId is required.' });
    }

    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Stripe checkout session has not been marked as paid.',
      });
    }

    const result = await processSuccessfulPayment(session);

    return res.status(200).json({
      success: true,
      message: 'Payment verified and credits successfully credited!',
      ...result,
    });
  } catch (error: any) {
    console.error('[Stripe Verify Session Error]', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Payment verification failed.',
    });
  }
}

/**
 * POST /api/payments/webhook
 * Handles Stripe webhook events with express.raw({ type: "application/json" })
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripe: Stripe;
  try {
    stripe = getStripeClient();
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }

  let event: Stripe.Event;

  try {
    if (webhookSecret && sig) {
      // Cryptographic signature validation using raw body buffer
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // In development if webhook secret is not set, parse payload with warning
      console.warn('[Stripe Webhook] Warning: STRIPE_WEBHOOK_SECRET not provided. Parsing body directly.');
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      event = body as Stripe.Event;
    }
  } catch (err: any) {
    console.error(`[Stripe Webhook] Signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful checkout session
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    try {
      await processSuccessfulPayment(session);
    } catch (processErr: any) {
      console.error('[Stripe Webhook] Error processing payment fulfillment:', processErr.message);
      return res.status(500).json({ error: 'Fulfillment error' });
    }
  }

  return res.status(200).json({ received: true });
}

/**
 * GET /api/payments/history
 * Returns user or admin payment history
 */
export async function getPaymentHistory(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    let payments;
    if (req.user.role === 'admin' && req.query.all === 'true') {
      payments = await DataStore.getAllPayments();
    } else {
      payments = await DataStore.getPaymentsByUser(req.user.email);
    }

    return res.status(200).json({ success: true, payments });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch payment history.' });
  }
}

/**
 * Backward compatibility: legacy session create
 */
export async function createPaymentSession(req: AuthenticatedRequest, res: Response) {
  return createCheckoutSession(req, res);
}

/**
 * Backward compatibility: legacy confirm
 */
export async function confirmPayment(req: AuthenticatedRequest, res: Response) {
  const { sessionId } = req.body;
  if (sessionId) {
    return verifySession(req, res);
  }
  return res.status(400).json({
    success: false,
    message: 'Please use /api/payments/verify-session or Stripe Webhook.',
  });
}
