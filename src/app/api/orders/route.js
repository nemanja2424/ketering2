import { randomUUID } from 'crypto';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

const ordersPath = path.join(process.cwd(), 'data', 'orders.json');

async function readOrders() {
  try {
    const content = await readFile(ordersPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

async function writeOrders(orders) {
  await writeFile(ordersPath, JSON.stringify(orders, null, 2), 'utf8');
}

export async function POST(request) {
  try {
    const body = await request.json();
    const guestCount = Math.max(1, Number(body.guestCount || 1));
    const now = new Date().toISOString();
    let order;

    if (body.type === 'menu') {
      const priceRsdPerPerson = Number(body.menu?.priceRsdPerPerson);

      if (!body.menu || !Number.isFinite(priceRsdPerPerson)) {
        return Response.json({ error: 'Neispravni podaci narudžbine.' }, { status: 400 });
      }

      order = {
        id: randomUUID(),
        status: 'created',
        paymentIntentId: null,
        createdAt: now,
        updatedAt: now,
        type: 'menu',
        guestCount,
        menu: {
          id: body.menu.id,
          name: body.menu.name,
          description: body.menu.description,
          items: Array.isArray(body.menu.items) ? body.menu.items : [],
          variant: body.menu.variant,
          serviceDay: body.menu.serviceDay,
          priceRsdPerPerson,
        },
        totalRsd: priceRsdPerPerson * guestCount,
      };
    } else if (body.type === 'custom') {
      const selectedDishes = Array.isArray(body.selectedDishes) ? body.selectedDishes : [];
      const priceRsdPerPerson = Number(body.priceRsdPerPerson);
      const totalRsd = Number(body.totalRsd);

      if (
        selectedDishes.length === 0 ||
        !Number.isFinite(priceRsdPerPerson) ||
        !Number.isFinite(totalRsd)
      ) {
        return Response.json({ error: 'Odaberi bar jednu opciju.' }, { status: 400 });
      }

      order = {
        id: randomUUID(),
        status: 'created',
        paymentIntentId: null,
        createdAt: now,
        updatedAt: now,
        type: 'custom',
        eventType: body.eventType || 'Personalizovani obrok',
        guestCount,
        selectedDishes,
        notes: body.notes || '',
        priceRsdPerPerson,
        totalRsd,
      };
    } else {
      return Response.json({ error: 'Neispravni podaci narudžbine.' }, { status: 400 });
    }

    const orders = await readOrders();
    orders.unshift(order);
    await writeOrders(orders);

    return Response.json({ order }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: 'Narudžbina nije kreirana: ' + error.message },
      { status: 500 }
    );
  }
}
