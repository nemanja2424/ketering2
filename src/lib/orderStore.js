import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { calculateCustomOrder, getMenuById } from './orderCatalog';

const DATA_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

async function readOrders() {
  try {
    const raw = await readFile(ORDERS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeOrders(orders) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
}

export async function createOrder(payload) {
  const order = buildOrder(payload);
  const orders = await readOrders();
  orders.unshift(order);
  await writeOrders(orders);
  return order;
}

export async function getOrder(orderId) {
  const orders = await readOrders();
  return orders.find((order) => order.id === orderId) || null;
}

export async function updateOrder(orderId, updates) {
  const orders = await readOrders();
  const index = orders.findIndex((order) => order.id === orderId);

  if (index === -1) {
    return null;
  }

  orders[index] = {
    ...orders[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await writeOrders(orders);
  return orders[index];
}

function buildOrder(payload) {
  if (!payload || !['menu', 'custom'].includes(payload.type)) {
    throw new Error('Nepoznat tip narudzbine.');
  }

  if (payload.type === 'menu') {
    return buildMenuOrder(payload);
  }

  return buildCustomOrder(payload);
}

function buildMenuOrder(payload) {
  const menu = getMenuById(payload.menuId);
  const guestCount = normalizeGuestCount(payload.guestCount);

  if (!menu) {
    throw new Error('Odabrani meni ne postoji.');
  }

  return withBaseFields({
    type: 'menu',
    guestCount,
    menu: {
      id: menu.id,
      name: menu.name,
      description: menu.description,
      items: menu.items,
      priceRsdPerPerson: menu.priceRsdPerPerson,
    },
    totalRsd: menu.priceRsdPerPerson * guestCount,
  });
}

function buildCustomOrder(payload) {
  const guestCount = normalizeGuestCount(payload.guestCount);
  const selectedDishIds = Array.isArray(payload.selectedDishIds) ? payload.selectedDishIds : [];
  const { selectedDishes, priceRsdPerPerson, totalRsd } = calculateCustomOrder({
    guestCount,
    selectedDishIds,
  });

  if (selectedDishes.length === 0) {
    throw new Error('Odaberite bar jedno jelo.');
  }

  return withBaseFields({
    type: 'custom',
    eventType: typeof payload.eventType === 'string' ? payload.eventType.trim() : '',
    guestCount,
    selectedDishes,
    priceRsdPerPerson,
    totalRsd,
    notes: typeof payload.notes === 'string' ? payload.notes.trim() : '',
  });
}

function withBaseFields(order) {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    status: 'created',
    paymentIntentId: null,
    createdAt: now,
    updatedAt: now,
    ...order,
  };
}

function normalizeGuestCount(value) {
  const guestCount = Number.parseInt(value, 10);

  if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 500) {
    throw new Error('Broj osoba mora biti izmedju 1 i 500.');
  }

  return guestCount;
}
