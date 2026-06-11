import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import Stripe from 'stripe';

export const runtime = 'nodejs';

const ordersPath = path.join(process.cwd(), 'data', 'orders.json');

async function readOrders() {
  const content = await readFile(ordersPath, 'utf8');
  return JSON.parse(content);
}

async function writeOrders(orders) {
  await writeFile(ordersPath, JSON.stringify(orders, null, 2), 'utf8');
}

export async function POST(request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return Response.json({ error: 'Stripe secret key nije podešen.' }, { status: 500 });
    }

    const { orderId, email, name } = await request.json();
    const orders = await readOrders();
    const orderIndex = orders.findIndex((item) => item.id === orderId);

    if (orderIndex === -1) {
      return Response.json({ error: 'Narudžbina nije pronađena.' }, { status: 404 });
    }

    const order = orders[orderIndex];
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalRsd) * 100),
      currency: 'rsd',
      receipt_email: email || undefined,
      metadata: {
        orderId: order.id,
        customerName: name || '',
        menuName: order.menu?.name || '',
      },
    });

    orders[orderIndex] = {
      ...order,
      paymentIntentId: paymentIntent.id,
      updatedAt: new Date().toISOString(),
    };
    await writeOrders(orders);

    return Response.json({ clientSecret: paymentIntent.client_secret }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: 'Plaćanje nije pokrenuto: ' + error.message },
      { status: 500 }
    );
  }
}
