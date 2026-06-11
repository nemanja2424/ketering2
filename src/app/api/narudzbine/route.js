import dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config({ path: '.env.local' });

export async function GET(request) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

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
        updated_at
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
