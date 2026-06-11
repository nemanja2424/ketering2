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

    // Insertuj test podatke
    const result = await client.query(`
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
      )
      RETURNING *;
    `, [JSON.stringify({
      meni: 'Personalizovani',
      sadrzaj: ['Prasece pecenje', 'Ruska salata', 'Torta'],
      brOsoba: 50
    })]);

    console.log('✓ Podaci insertovani!');
    console.log(result.rows[0]);

  } catch (error) {
    console.error('✗ Greška:', error.message);
  } finally {
    await client.end();
  }
})();
