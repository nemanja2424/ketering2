import { getOrder } from '@/lib/orderStore';

export const runtime = 'nodejs';

export async function GET(_request, { params }) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    return Response.json({ error: 'Narudzbina nije pronadjena.' }, { status: 404 });
  }

  return Response.json({ order });
}
