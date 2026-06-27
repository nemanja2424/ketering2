import dotenv from 'dotenv';
import { mkdir, writeFile } from 'fs/promises';
import nodemailer from 'nodemailer';
import path from 'path';
import { Client } from 'pg';

dotenv.config({ path: '.env.local' });

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;

const TYPE_LABELS = {
  meal_order: 'Pripremljen meni',
  subscription_order: 'Daily Fuel',
  custom_meal_order: 'Fuel Builder',
  catering_inquiry: 'Ketering',
  unique_fuel_inquiry: 'Unique Fuel',
  manual_order: 'Rucni unos',
};

const PAYMENT_LABELS = {
  not_started: 'Nije pokrenuto',
  pending: 'Na cekanju',
  paid: 'Placeno',
  failed: 'Neuspesno',
  refunded: 'Refundirano',
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatRsd(value) {
  return `${Number(value || 0).toLocaleString('sr-RS')} RSD`;
}

function formatDate(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('sr-RS');
}

function formatTime(value) {
  if (!value) {
    return '-';
  }

  return String(value).slice(0, 5);
}

function formatDateTime(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('sr-RS', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function parseOrderPayload(porudzbina) {
  if (!porudzbina) {
    return {};
  }

  if (typeof porudzbina === 'string') {
    try {
      return JSON.parse(porudzbina);
    } catch {
      return {};
    }
  }

  return porudzbina;
}

function normalizeItems(porudzbina) {
  if (Array.isArray(porudzbina?.items)) {
    return porudzbina.items;
  }

  if (Array.isArray(porudzbina?.stavke)) {
    return porudzbina.stavke.map((item, index) => ({
      id: `legacy-${index}`,
      name: typeof item === 'string' ? item : item?.name || `Stavka ${index + 1}`,
      category: item?.category || 'Stavka',
      quantity: Number(item?.quantity || 1),
      unitPriceRsd: Number(item?.unitPriceRsd || item?.priceRsdPerPerson || 0),
      totalPriceRsd: Number(item?.totalPriceRsd || item?.priceRsdPerPerson || 0),
      meta: item?.meta || {},
    }));
  }

  if (Array.isArray(porudzbina?.sadrzaj)) {
    return porudzbina.sadrzaj.map((name, index) => ({
      id: `legacy-content-${index}`,
      name,
      category: 'Sadrzaj',
      quantity: 1,
      unitPriceRsd: 0,
      totalPriceRsd: 0,
      meta: {},
    }));
  }

  return [];
}

function getOrderDetails(narudzbina) {
  const porudzbina = parseOrderPayload(narudzbina.porudzbina);
  const items = normalizeItems(porudzbina);
  const totalRsd = Number(porudzbina.totals?.totalRsd || narudzbina.cena || 0);
  const paymentStatus = porudzbina.payment?.status || (narudzbina.placeno ? 'paid' : 'not_started');
  const guestCount = Number(
    porudzbina.guestCount ||
      porudzbina.brOsoba ||
      items.find((item) => item.meta?.guestCount)?.meta?.guestCount ||
      0
  );

  return {
    title:
      porudzbina.title ||
      porudzbina.naslov ||
      porudzbina.ponuda ||
      porudzbina.meni ||
      'Narudzbina',
    type: porudzbina.type || porudzbina.tip || 'manual_order',
    items,
    totalRsd,
    guestCount: Number.isFinite(guestCount) && guestCount > 0 ? guestCount : null,
    customerNote: porudzbina.customerNote || porudzbina.napomena || '',
    paymentStatus,
    raw: porudzbina,
  };
}

function renderInfoRow(label, value) {
  if (!value) {
    return '';
  }

  return `
    <tr>
      <td style="padding: 10px 0; color: #6b7280; font-size: 13px;">${escapeHtml(label)}</td>
      <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 700; text-align: right;">${escapeHtml(value)}</td>
    </tr>
  `;
}

function renderItemMeta(item) {
  const details = [
    item.variant,
    item.meta?.source === 'dopuna' ? 'Dopuna' : item.meta?.mealLabel,
    item.meta?.formattedDate ? `Isporuka ${item.meta.formattedDate}` : '',
    item.meta?.deliveryDate ? `Datum isporuke ${formatDate(item.meta.deliveryDate)}` : '',
  ].filter(Boolean);

  const dishes = Array.isArray(item.meta?.dishes) && item.meta.dishes.length > 0
    ? `<p style="margin: 8px 0 0; color: #374151; font-size: 13px; line-height: 1.5;">${escapeHtml(item.meta.dishes.join(', '))}</p>`
    : '';

  const description = item.meta?.description
    ? `<p style="margin: 8px 0 0; color: #374151; font-size: 13px; line-height: 1.5;">${escapeHtml(item.meta.description)}</p>`
    : '';

  if (details.length === 0 && !dishes && !description) {
    return '';
  }

  return `
    <div style="margin-top: 5px; color: #6b7280; font-size: 12px; line-height: 1.5;">
      ${details.length > 0 ? escapeHtml(details.join(' / ')) : ''}
      ${dishes}
      ${description}
    </div>
  `;
}

function renderItems(items) {
  if (items.length === 0) {
    return '<p style="margin: 0; color: #6b7280;">Nema stavki za prikaz.</p>';
  }

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
      ${items.map((item) => `
        <tr>
          <td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb; vertical-align: top;">
            <strong style="display: block; color: #111827; font-size: 15px;">${escapeHtml(item.name || 'Stavka')}</strong>
            <span style="display: block; margin-top: 4px; color: #6b7280; font-size: 13px;">
              ${escapeHtml(`${Number(item.quantity || 1)}x / ${item.category || 'Stavka'}`)}
            </span>
            ${renderItemMeta(item)}
          </td>
          <td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 14px; font-weight: 700; text-align: right; white-space: nowrap; vertical-align: top;">
            ${escapeHtml(formatRsd(item.totalPriceRsd))}
          </td>
        </tr>
      `).join('')}
    </table>
  `;
}

function buildEmailHtml({ narudzbina, recipientType }) {
  const details = getOrderDetails(narudzbina);
  const typeLabel = TYPE_LABELS[details.type] || details.type;
  const paymentLabel = PAYMENT_LABELS[details.paymentStatus] || details.paymentStatus;
  const isUniqueFuel = details.type === 'unique_fuel_inquiry';
  const intro = recipientType === 'owner'
    ? 'Stigla je nova narudžbina ili upit. Svi bitni podaci su ispod.'
    : 'Hvala na upitu. Primili smo vaše podatke i javićemo vam se uskoro radi potvrde detalja.';

  return `<!doctype html>
<html lang="sr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(details.title)}</title>
  </head>
  <body style="margin: 0; padding: 0; background: #f3f6ef; font-family: Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f3f6ef; padding: 28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 680px; overflow: hidden; border-radius: 24px; background: #ffffff; box-shadow: 0 18px 45px rgba(36, 66, 34, 0.12);">
            <tr>
              <td style="padding: 30px; background: linear-gradient(135deg, #18351f 0%, #315d36 100%); color: #ffffff;">
                <span style="display: inline-block; margin-bottom: 14px; padding: 7px 12px; border-radius: 999px; background: rgba(255,255,255,0.14); color: #e8f5df; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">
                  ${escapeHtml(typeLabel)}
                </span>
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; line-height: 1.2;">${escapeHtml(details.title)}</h1>
                <p style="margin: 12px 0 0; color: #eaf4e5; font-size: 15px; line-height: 1.6;">${escapeHtml(intro)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 28px 30px 8px;">
                <h2 style="margin: 0 0 14px; color: #18351f; font-size: 18px;">Podaci</h2>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                  ${renderInfoRow('Broj upita', `#${narudzbina.id}`)}
                  ${renderInfoRow('Kupac', narudzbina.ime)}
                  ${renderInfoRow('Email', narudzbina.email)}
                  ${renderInfoRow('Telefon', narudzbina.br_tel)}
                  ${renderInfoRow('Adresa / mesto', narudzbina.mesto)}
                  ${!isUniqueFuel ? renderInfoRow('Datum', formatDate(narudzbina.datum)) : ''}
                  ${!isUniqueFuel ? renderInfoRow('Vreme', formatTime(narudzbina.vreme)) : ''}
                  ${renderInfoRow('Broj osoba', details.guestCount)}
                  ${renderInfoRow('Placanje', paymentLabel)}
                  ${renderInfoRow('Poslato', formatDateTime(narudzbina.created_at))}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 22px 30px 8px;">
                <h2 style="margin: 0 0 14px; color: #18351f; font-size: 18px;">Stavke</h2>
                ${renderItems(details.items)}
              </td>
            </tr>
            <tr>
              <td style="padding: 22px 30px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                  <tr>
                    <td style="padding: 18px 20px; border-radius: 18px; background: #eef6e9;">
                      <span style="display: block; color: #4b6547; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;">Ukupno</span>
                      <strong style="display: block; margin-top: 6px; color: #18351f; font-size: 26px;">${escapeHtml(formatRsd(details.totalRsd))}</strong>
                    </td>
                  </tr>
                </table>
                ${details.customerNote ? `
                  <div style="margin-top: 18px; padding: 16px 18px; border: 1px solid #e5e7eb; border-radius: 16px; background: #ffffff;">
                    <strong style="display: block; margin-bottom: 6px; color: #18351f; font-size: 14px;">
                      ${isUniqueFuel ? 'Opis željenog obroka ili plana ishrane' : 'Napomena kupca'}
                    </strong>
                    <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">${escapeHtml(details.customerNote)}</p>
                  </div>
                ` : ''}
              </td>
            </tr>
            <tr>
              <td style="padding: 22px 30px 30px; color: #6b7280; font-size: 12px; line-height: 1.6; background: #fbfcf8;">
                Ovaj email je automatski poslat preko IN Ketering sajta.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildEmailText({ narudzbina }) {
  const details = getOrderDetails(narudzbina);
  const typeLabel = TYPE_LABELS[details.type] || details.type;
  const lines = [
    `${typeLabel}: ${details.title}`,
    `Broj upita: #${narudzbina.id}`,
    `Kupac: ${narudzbina.ime}`,
    narudzbina.email ? `Email: ${narudzbina.email}` : '',
    narudzbina.br_tel ? `Telefon: ${narudzbina.br_tel}` : '',
    narudzbina.mesto ? `Adresa / mesto: ${narudzbina.mesto}` : '',
    details.type !== 'unique_fuel_inquiry' ? `Datum: ${formatDate(narudzbina.datum)}` : '',
    details.type !== 'unique_fuel_inquiry' ? `Vreme: ${formatTime(narudzbina.vreme)}` : '',
    details.guestCount ? `Broj osoba: ${details.guestCount}` : '',
    `Ukupno: ${formatRsd(details.totalRsd)}`,
    '',
    'Stavke:',
    ...details.items.map((item) => {
      const meta = [
        item.variant,
        item.meta?.source === 'dopuna' ? 'Dopuna' : item.meta?.mealLabel,
        item.meta?.formattedDate ? `Isporuka ${item.meta.formattedDate}` : '',
        item.meta?.description,
      ].filter(Boolean);

      return `- ${item.name} (${Number(item.quantity || 1)}x / ${item.category || 'Stavka'}) ${formatRsd(item.totalPriceRsd)}${meta.length > 0 ? ` - ${meta.join(' / ')}` : ''}`;
    }),
    details.customerNote ? `\nNapomena: ${details.customerNote}` : '',
  ];

  return lines.filter(Boolean).join('\n');
}

function createMailTransporter() {
  if (!process.env.EMAIL_ADDRESS || !process.env.EMAIL_PASSWORD) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

async function ensureAttachmentTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS narudzbine_attachments (
      id BIGSERIAL PRIMARY KEY,
      narudzbina_id BIGINT NOT NULL REFERENCES narudzbine(id) ON DELETE CASCADE,
      file_name TEXT NOT NULL,
      stored_file_name TEXT,
      file_path TEXT,
      mime_type TEXT,
      file_size BIGINT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.query(`
    ALTER TABLE narudzbine_attachments
      ADD COLUMN IF NOT EXISTS stored_file_name TEXT,
      ADD COLUMN IF NOT EXISTS file_path TEXT
  `);

  await client.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'narudzbine_attachments'
          AND column_name = 'file_data'
      ) THEN
        ALTER TABLE narudzbine_attachments ALTER COLUMN file_data DROP NOT NULL;
      END IF;
    END $$;
  `);
}

function getAttachmentMetadata(row) {
  return {
    id: row.id,
    file_name: row.file_name,
    stored_file_name: row.stored_file_name,
    file_path: row.file_path,
    mime_type: row.mime_type,
    file_size: Number(row.file_size || 0),
    created_at: row.created_at,
  };
}

function sanitizeFileName(fileName) {
  const parsed = path.parse(fileName || 'unique-fuel-dokument');
  const baseName = parsed.name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'unique-fuel-dokument';
  const extension = parsed.ext
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '')
    .slice(0, 16);

  return `${baseName}${extension}`;
}

async function saveAttachmentToPublicUploads(orderId, attachment) {
  const uploadsDirectory = path.join(process.cwd(), 'public', 'uploads');
  const safeFileName = sanitizeFileName(attachment.name);
  const storedFileName = `${orderId}-${Date.now()}-${safeFileName}`;
  const filePath = `/uploads/${storedFileName}`;
  const absolutePath = path.join(uploadsDirectory, storedFileName);
  const fileBuffer = Buffer.from(await attachment.arrayBuffer());

  await mkdir(uploadsDirectory, { recursive: true });
  await writeFile(absolutePath, fileBuffer);

  return {
    storedFileName,
    filePath,
  };
}

async function parseRequestBody(request) {
  const contentType = request.headers.get('content-type') || '';

  if (!contentType.includes('multipart/form-data')) {
    return { body: await request.json(), attachment: null };
  }

  const formData = await request.formData();
  const rawOrder = formData.get('porudzbina');
  const file = formData.get('document');
  const attachment =
    file && typeof file === 'object' && typeof file.arrayBuffer === 'function' && file.size > 0
      ? file
      : null;

  if (attachment && attachment.size > MAX_ATTACHMENT_BYTES) {
    throw new Error('Dokument moze biti maksimalno 20MB.');
  }

  return {
    body: {
      ime: formData.get('ime'),
      email: formData.get('email'),
      br_tel: formData.get('br_tel'),
      datum: formData.get('datum'),
      vreme: formData.get('vreme'),
      mesto: formData.get('mesto'),
      cena: formData.get('cena'),
      porudzbina: rawOrder ? JSON.parse(rawOrder) : null,
    },
    attachment,
  };
}

async function sendOrderEmails(narudzbina) {
  const transporter = createMailTransporter();
  const ownerEmail = process.env.EMAIL_TO;
  const senderEmail = process.env.EMAIL_ADDRESS;

  if (!transporter || !senderEmail || (!ownerEmail && !narudzbina.email)) {
    return { sent: false, reason: 'Email konfiguracija nije potpuna.' };
  }

  const details = getOrderDetails(narudzbina);
  const from = `"IN Ketering" <${senderEmail}>`;
  const messages = [];

  if (ownerEmail) {
    messages.push({
      from,
      to: ownerEmail,
      replyTo: narudzbina.email || undefined,
      subject: `Nova narudžbina #${narudzbina.id}: ${details.title}`,
      html: buildEmailHtml({ narudzbina, recipientType: 'owner' }),
      text: buildEmailText({ narudzbina }),
    });
  }

  if (narudzbina.email && narudzbina.email !== ownerEmail) {
    messages.push({
      from,
      to: narudzbina.email,
      subject: `Potvrda upita #${narudzbina.id}: ${details.title}`,
      html: buildEmailHtml({ narudzbina, recipientType: 'customer' }),
      text: buildEmailText({ narudzbina }),
    });
  }

  await Promise.all(messages.map((message) => transporter.sendMail(message)));

  return { sent: true, count: messages.length };
}

export async function GET(request) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    await ensureAttachmentTable(client);

    const result = await client.query(`
      SELECT 
        id,
        ime,
        email,
        br_tel,
        datum,
        vreme,
        mesto,
        cena,
        porudzbina,
        placeno,
        created_at,
        updated_at,
        (
          SELECT COALESCE(
            json_agg(
              json_build_object(
                'id', attachment.id,
                'file_name', attachment.file_name,
                'stored_file_name', attachment.stored_file_name,
                'file_path', attachment.file_path,
                'mime_type', attachment.mime_type,
                'file_size', attachment.file_size,
                'created_at', attachment.created_at
              )
              ORDER BY attachment.created_at ASC
            ),
            '[]'::json
          )
          FROM narudzbine_attachments attachment
          WHERE attachment.narudzbina_id = narudzbine.id
        ) AS attachments
      FROM narudzbine
      ORDER BY datum DESC, vreme DESC
    `);

    const narudzbine = result.rows.map((row) => ({
      id: row.id,
      ime: row.ime,
      email: row.email,
      br_tel: row.br_tel,
      datum: row.datum.toISOString().split('T')[0],
      vreme: row.vreme,
      mesto: row.mesto,
      cena: row.cena,
      porudzbina: row.porudzbina,
      placeno: row.placeno,
      attachments: row.attachments || [],
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    return Response.json(narudzbine, { status: 200 });
  } catch (error) {
    console.error('Greška pri čitanju narudžbina:', error);
    return Response.json(
      { message: 'Greška pri čitanju narudžbina: ' + error.message },
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}

export async function POST(request) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const { body, attachment } = await parseRequestBody(request);
    const { ime, email, br_tel, datum, vreme, mesto, cena, porudzbina } = body;

    if (!ime || !datum || !vreme || !porudzbina) {
      return Response.json(
        { message: 'Ime, datum, vreme i porudžbina su obavezni.' },
        { status: 400 }
      );
    }

    await client.connect();
    await ensureAttachmentTable(client);

    const result = await client.query(
      `
        INSERT INTO narudzbine (
          ime,
          email,
          br_tel,
          datum,
          vreme,
          mesto,
          cena,
          porudzbina,
          placeno
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false)
        RETURNING
          id,
          ime,
          email,
          br_tel,
          datum,
          vreme,
          mesto,
          cena,
          porudzbina,
          placeno,
          created_at,
          updated_at
      `,
      [
        ime,
        email || null,
        br_tel || null,
        datum,
        vreme,
        mesto || null,
        Number(cena || 0),
        JSON.stringify(porudzbina),
      ]
    );

    const narudzbina = result.rows[0];
    let attachments = [];

    if (attachment) {
      const savedAttachment = await saveAttachmentToPublicUploads(narudzbina.id, attachment);
      const attachmentResult = await client.query(
        `
          INSERT INTO narudzbine_attachments (
            narudzbina_id,
            file_name,
            stored_file_name,
            file_path,
            mime_type,
            file_size
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id, file_name, stored_file_name, file_path, mime_type, file_size, created_at
        `,
        [
          narudzbina.id,
          attachment.name || 'unique-fuel-dokument',
          savedAttachment.storedFileName,
          savedAttachment.filePath,
          attachment.type || 'application/octet-stream',
          attachment.size,
        ]
      );

      attachments = attachmentResult.rows.map(getAttachmentMetadata);
    }

    const normalizedNarudzbina = {
      ...narudzbina,
      datum: narudzbina.datum.toISOString().split('T')[0],
      attachments,
    };
    let emailStatus = { sent: false };

    try {
      emailStatus = await sendOrderEmails(normalizedNarudzbina);
    } catch (emailError) {
      console.error('Greška pri slanju emaila za narudžbinu:', emailError);
      emailStatus = { sent: false, reason: emailError.message };
    }

    return Response.json(
      {
        message: emailStatus.sent
          ? 'Upit je poslat i email potvrde je poslat.'
          : 'Upit je poslat.',
        email: emailStatus,
        narudzbina: normalizedNarudzbina,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Greška pri kreiranju narudžbine:', error);
    return Response.json(
      { message: 'Greška pri kreiranju narudžbine: ' + error.message },
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}
