import dotenv from 'dotenv';
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function seed() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✓ Konekcija na bazu uspešna');

    // Kreiraj tabelu
    await client.query(`
      CREATE TABLE IF NOT EXISTS narudzbine (
        id BIGSERIAL PRIMARY KEY,
        ime VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        br_tel VARCHAR(50),
        datum DATE NOT NULL,
        vreme TIME NOT NULL,
        mesto TEXT,
        cena DECIMAL(10,2) DEFAULT 0,
        porudzbina JSONB NOT NULL,
        placeno BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Tabela "narudzbine" kreirana');

    // Proveri da li su već postoji test podaci
    const checkResult = await client.query(
      'SELECT COUNT(*) FROM narudzbine WHERE ime = $1',
      ['Nemanja']
    );

    if (checkResult.rows[0].count === 0) {
      // Insertuj test podatke
      await client.query(`
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
        VALUES (
          'Nemanja',
          'nemanja@gmail.com',
          '061123456',
          '2026-06-15',
          '18:00',
          'Kragujevac',
          25000,
          $1,
          true
        );
      `, [JSON.stringify({
        meni: 'Personalizovani',
        sadrzaj: ['Prasece pecenje', 'Ruska salata', 'Torta'],
        brOsoba: 50
      })]);
      console.log('✓ Test podaci insertovani');
    } else {
      console.log('✓ Test podaci već postoje');
    }

    console.log('✓ Seed završen!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Greška:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
