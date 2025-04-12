const { openDb } = require('../../db');

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    console.log("id", id)
    const db = await openDb();
    if (!id) {
        const listas = await db.all('SELECT * FROM listas');
        return Response.json(listas);
    } else {
        const listas = await db.get('SELECT * FROM listas WHERE id=?', [id]);
        return Response.json(listas);
    }
}

export async function POST(req) {
    const { name, url, column_to_key } = await req.json();
    const db = await openDb();
    const result = await db.run(
        'INSERT INTO listas (name, url, column_to_key) VALUES (?, ?, ?)',
        [name, url, column_to_key]
    );
    return Response.json({ id: result.lastID });
}

export async function PUT(req) {
    const { id, name, url, column_to_key } = await req.json();
    const db = await openDb();
    await db.run(
        'UPDATE listas SET name = ?, url = ?, column_to_key = ? WHERE id = ?',
        [name, url, column_to_key, id]
    );
    return Response.json({ success: true });
}

export async function DELETE(req) {
    const { id } = await req.json();
    const db = await openDb();
    await db.run('DELETE FROM listas WHERE id = ?', [id]);
    return Response.json({ success: true });
}
