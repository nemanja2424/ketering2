import dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import path from 'path';
import { Client } from 'pg';

dotenv.config({ path: '.env.local' });

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function encodeFileName(fileName) {
  return encodeURIComponent(fileName || 'unique-fuel-dokument')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
}

function createAsciiFileName(fileName) {
  return (fileName || 'unique-fuel-dokument')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]+/g, '-')
    .replace(/["\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim() || 'unique-fuel-dokument';
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

function createAttachmentResponse(bytes, attachment) {
  const fileName = attachment.file_name || attachment.stored_file_name || 'unique-fuel-dokument';
  const asciiFileName = createAsciiFileName(fileName);
  const body = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': attachment.mime_type || 'application/octet-stream',
      'Content-Length': String(attachment.file_size || body.length),
      'Content-Disposition': `attachment; filename="${asciiFileName}"; filename*=UTF-8''${encodeFileName(fileName)}`,
      'Cache-Control': 'no-store',
    },
  });
}

export async function GET(_request, { params }) {
  const { id } = await params;
  const orderId = Number(id);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return Response.json({ message: 'Neispravan ID narudžbine.' }, { status: 400 });
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    await ensureAttachmentTable(client);

    const hasLegacyFileData = await client.query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'narudzbine_attachments'
          AND column_name = 'file_data'
      ) AS exists
    `);
    const legacyFileDataSelect = hasLegacyFileData.rows[0]?.exists ? ', file_data' : '';
    const result = await client.query(
      `
        SELECT file_name, stored_file_name, file_path, mime_type, file_size${legacyFileDataSelect}
        FROM narudzbine_attachments
        WHERE narudzbina_id = $1
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [orderId]
    );

    if (result.rowCount === 0) {
      return Response.json({ message: 'Dokument nije pronađen.' }, { status: 404 });
    }

    const attachment = result.rows[0];

    if (attachment.stored_file_name) {
      const publicUploadsDirectory = path.join(process.cwd(), 'public', 'uploads');
      const absolutePath = path.join(publicUploadsDirectory, attachment.stored_file_name);
      const resolvedPath = path.resolve(absolutePath);

      if (!resolvedPath.startsWith(path.resolve(publicUploadsDirectory))) {
        return Response.json({ message: 'Neispravna putanja dokumenta.' }, { status: 400 });
      }

      const bytes = await readFile(resolvedPath);
      return createAttachmentResponse(bytes, attachment);
    }

    if (attachment.file_data) {
      return createAttachmentResponse(attachment.file_data, attachment);
    }

    return Response.json({ message: 'Dokument nije pronađen na disku.' }, { status: 404 });
  } catch (error) {
    console.error('Greška pri preuzimanju dokumenta:', error);
    return Response.json(
      { message: 'Greška pri preuzimanju dokumenta: ' + error.message },
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}
