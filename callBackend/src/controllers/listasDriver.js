const { openDb } = require('../../db');

const obtenerLista = async (req, res) => {
    const db = await openDb();

    const { id } = req.params;

    if (!id) {
        const listas = await db.all('SELECT * FROM listas')
        return res.json(listas);
    } else {
        const listas = await db.get('SELECT * FROM listas where id=?', [id])
        return res.json(listas);
    }
};

const agregarLista = async (req, res) => {
    const { name, url } = req.body;

    if (!name || !url) {
        return res.status(404).json({ Message: 'Faltan parametros' })
    }

    const db = await openDb();
    try {
        const query = await db.run('INSERT INTO listas (name,url) Values (?,?)', [name, url])

        return res.json({ id: query.lastID });
    } catch (error) {
        console.error('Error al agregar la lista:', error.message);
        return res.status(500).json({ message: error.message || 'Error al agregar la lista' });
    }
};

const actualizarLista = async (req, res) => {
    const { name, url } = req.body;
    const { id } = req.params;

    const db = await openDb();

    try {
        const query = await db.run('UPDATE listas SET name=?, url=? WHERE id= ?', [name, url, id])

        return res.json({ id: query.lastID })
    } catch (error) {
        console.error('Error al actualizar la lista:', error.message);
        return res.status(500).json({ message: error.message || 'Error al actualizar la lista' });
    }
};

const eliminarLista = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(404).json({ message: "No se recibió un ID en la consulta" });
    }

    const db = await openDb();
    try {
        const result = await db.run('DELETE FROM listas WHERE id=?', [id]);

        if (result.changes === 0) {
            return res.status(404).json({ message: 'No se encontró la lista con ese ID' });
        }

        return res.status(200).json({ message: "Lista eliminada correctamente" });
    } catch (error) {
        console.error('Error al eliminar la lista:', error.message);
        return res.status(500).json({ message: error.message || 'Error al eliminar la lista' });
    }
};


module.exports = {
    obtenerLista,
    agregarLista,
    actualizarLista,
    eliminarLista,
}