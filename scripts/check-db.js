import dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

(async () => {
  try {
    await client.connect();
    console.log('✓ Konekcija uspešna!');

    // Proveravamo tabelu
    const tableCheck = await client.query(`
      SELECT to_regclass('public.narudzbine');
    `);
    console.log('\n📊 Tabela postoji?', tableCheck.rows[0]);

    // Broje redova
    const countResult = await client.query('SELECT COUNT(*) FROM narudzbine');
    console.log('\n📈 Broj redova:', countResult.rows[0].count);

    // Sve redove
    const allData = await client.query('SELECT * FROM narudzbine');
    console.log('\n📋 Svi podaci:');
    console.log(JSON.stringify(allData.rows, null, 2));

  } catch (error) {
    console.error('✗ Greška:', error.message);
  } finally {
    await client.end();
  }
})();
