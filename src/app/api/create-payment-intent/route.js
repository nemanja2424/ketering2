import Stripe from 'stripe';
import { stripeAmountFromRsd } from '@/lib/orderCatalog';
import { getOrder, updateOrder } from '@/lib/orderStore';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderId, email, name } = body;
    const order = await getOrder(orderId);

    if (!order) {
      return Response.json(
        { error: 'Narudzbina nije pronadjena.' },
        { status: 404 }
      );
    }

    if (!email || !name) {
      return Response.json(
        { error: 'Ime i email su obavezni.' },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: stripeAmountFromRsd(order.totalRsd),
      currency: 'eur',
      description: `Narudzbina ${order.id} za ${name}`,
      receipt_email: email,
      metadata: {
        orderId: order.id,
        customerName: name,
        customerEmail: email,
        displayAmountRsd: String(order.totalRsd),
      },
    });

    await updateOrder(order.id, {
      status: 'payment_pending',
      paymentIntentId: paymentIntent.id,
      customerName: name,
      customerEmail: email,
    });

    return Response.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Greska pri kreiranju payment intent-a:', error);
    return Response.json(
      { error: 'Greska pri obradi placanja: ' + error.message },
      { status: 500 }
    );
  }
}
