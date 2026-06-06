import { createOrder } from '@/lib/orderStore';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const payload = await request.json();
    const order = await createOrder(payload);

    return Response.json({ order }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
