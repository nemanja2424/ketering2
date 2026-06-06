import Stripe from 'stripe';
import { updateOrder } from '@/lib/orderStore';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  const sig = request.headers.get('stripe-signature');
  let event;

  try {
    const body = await request.text();
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return Response.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      console.log('Placanje uspesno:', paymentIntent.id);

      if (paymentIntent.metadata?.orderId) {
        await updateOrder(paymentIntent.metadata.orderId, {
          status: 'paid',
          paymentIntentId: paymentIntent.id,
          paidAt: new Date().toISOString(),
        });
      }

      break;
    }

    case 'payment_intent.payment_failed': {
      const failedPayment = event.data.object;
      console.log('Placanje neuspesno:', failedPayment.id);

      if (failedPayment.metadata?.orderId) {
        await updateOrder(failedPayment.metadata.orderId, {
          status: 'payment_failed',
          paymentIntentId: failedPayment.id,
        });
      }

      break;
    }

    case 'charge.refunded': {
      const refund = event.data.object;
      console.log('Refund:', refund.id);
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return Response.json({ received: true });
}

// Testirajte webhook lokalno sa:
// npx stripe listen --forward-to localhost:3000/api/webhook
