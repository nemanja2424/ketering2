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

    // Pročitaj sve iz bilo koje tabele
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    console.log('\n📊 Tabele u bazi:');
    console.log(result.rows);

    if (result.rows.length > 0) {
      const narudzbineResult = await client.query('SELECT * FROM narudzbine LIMIT 5');
      console.log('\n📋 Podatci iz narudzbine:');
      console.log(narudzbineResult.rows);
    }

  } catch (error) {
    console.error('✗ Greška:', error.message);
  } finally {
    await client.end();
  }
})();
