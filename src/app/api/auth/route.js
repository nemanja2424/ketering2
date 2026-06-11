export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const adminEmail = process.env.ADMIN;
    const adminPassword = process.env.ADMIN_PWD;

    if (email === adminEmail && password === adminPassword) {
      return Response.json(
        { message: 'Uspešna prijava' },
        { status: 200 }
      );
    } else {
      return Response.json(
        { message: 'Nevažeći email ili šifra' },
        { status: 401 }
      );
    }
  } catch (error) {
    return Response.json(
      { message: 'Greška pri autentifikaciji' },
      { status: 500 }
    );
  }
}
