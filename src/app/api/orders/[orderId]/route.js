import { readFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

const ordersPath = path.join(process.cwd(), 'data', 'orders.json');

export async function GET(_request, { params }) {
  try {
    const { orderId } = await params;
    const content = await readFile(ordersPath, 'utf8');
    const orders = JSON.parse(content);
    const order = orders.find((item) => item.id === orderId);

    if (!order) {
      return Response.json({ error: 'Narudžbina nije pronađena.' }, { status: 404 });
    }

    return Response.json({ order }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: 'Narudžbina nije učitana: ' + error.message },
      { status: 500 }
    );
  }
}
