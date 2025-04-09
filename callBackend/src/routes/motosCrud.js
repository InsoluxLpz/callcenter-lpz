const express = require('express');
const { dbConexion } = require('../database/config');
const { generarJwt } = require('../helpers/jwt');

const router = express.Router();
const db = dbConexion();

router.get('/obtener_motos', async (req, res) => {

    const query = `
        SELECT * from cat_motocicletas
    `;

    try {
        const [results] = await db.query(query);

        if (results.length === 0) {
            return res.status(404).json('No hay datos en la tabla');
        }
        return res.status(200).json(results);

    } catch (err) {
        console.error('Error al obtener el crédito:', err);
        return res.status(500).json({ errors: ['Error en el servidor'] });
    }

});

router.post('/agregar_moto', async (req, res) => {
    const { inciso, idMarca, anio, modelo, color, no_serie, motor, placa, propietario, fecha_compra, status, nota } = req.body;
    console.log("datos recibidos en el back", req.body)


    if (!inciso || !idMarca || !anio || !modelo || !color || !no_serie || !motor || !placa || !propietario || !fecha_compra || !status) {
        return res.status(400).json({ message: 'Hacen falta parámetros para guardar en la tabla' });
    }

    try {
        // 🔹 Hacer una única consulta para verificar duplicados
        const query = `
            SELECT inciso, placa, no_serie 
            FROM cat_motocicletas 
            WHERE inciso = ? OR placa = ? OR no_serie = ?
        `;
        const [existe] = await db.query(query, [inciso, placa, no_serie]);

        let mensajes = [];

        // 🔹 Revisar qué valores están duplicados y agregar mensajes personalizados
        existe.forEach(moto => {
            if (moto.inciso === inciso) mensajes.push('El inciso ya existe.');
            if (moto.placa === placa) mensajes.push('La placa ya existe.');
            if (moto.no_serie === no_serie) mensajes.push('El número de serie ya existe.');
        });

        // 🔹 Si hay duplicados, devolver el mensaje adecuado
        if (mensajes.length > 0) {
            return res.status(400).json({ message: mensajes.join(' ') });
        }



        const insertQuery = `
            INSERT INTO cat_motocicletas
            (inciso, idMarca, anio, modelo, color, no_serie, motor, placa, propietario, fecha_compra, status, nota) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [inciso, idMarca, anio, modelo, color, no_serie, motor, placa, propietario, fecha_compra, status, nota];

        await db.query(insertQuery, values);

        const [newMoto] = await db.query("SELECT * FROM cat_motocicletas WHERE no_serie = ?", [no_serie]);

        return res.status(200).json(newMoto[0]);
    } catch (error) {
        console.error('Error al agregar la moto:', error);
        return res.status(500).json({ message: 'Error al agregar la moto' });
    }
});

router.put('/actualizar_moto/:id', async (req, res) => {
    const motoId = req.params.id;
    const { inciso, idMarca, anio, modelo, color, no_serie, motor, placa, propietario, fecha_compra, status, nota } = req.body;

    if (!inciso || !idMarca || !anio || !modelo || !color || !no_serie || !motor || !placa || !propietario || !fecha_compra || !status) {
        return res.status(400).json({ message: 'Hacen falta parámetros para actualizar la tabla' });
    }

    if (!motoId || isNaN(motoId)) {
        return res.status(400).json({ message: 'ID de moto no válido' });
    }

    try {
        const query = `
            SELECT inciso, placa, no_serie 
            FROM cat_motocicletas 
            WHERE (inciso = ? OR placa = ? OR no_serie = ?) 
            AND id != ?
        `;
        const [existe] = await db.query(query, [inciso, placa, no_serie, motoId]);

        let mensajes = [];

        // 🔹 Revisar qué valores están duplicados
        existe.forEach(moto => {
            if (moto.inciso === inciso) mensajes.push('El inciso ya existe.');
            if (moto.placa === placa) mensajes.push('La placa ya existe.');
            if (moto.no_serie === no_serie) mensajes.push('El número de serie ya existe.');
        });

        // 🔹 Si hay duplicados, devolver el mensaje adecuado
        if (mensajes.length > 0) {
            return res.status(400).json({ message: mensajes.join(' ') });
        }

        // 🔹 Si no hay duplicados, actualizar la moto
        const updateQuery = `
            UPDATE cat_motocicletas
            SET inciso = ?, idMarca = ?, anio = ?, modelo = ?, color = ?, no_serie = ?, motor = ?, placa = ?, propietario = ?, fecha_compra = ?, status = ?, nota = ?
            WHERE id = ?
        `;
        const values = [inciso, idMarca, anio, modelo, color, no_serie, motor, placa, propietario, fecha_compra, status, nota, motoId];

        await db.query(updateQuery, values);

        // 🔹 Obtener la moto actualizada
        const [updatedMoto] = await db.query("SELECT * FROM cat_motocicletas WHERE id = ?", [motoId]);

        return res.status(200).json(updatedMoto[0]);
    } catch (error) {
        console.error('Error al actualizar la moto:', error);
        return res.status(500).json({ message: 'Error al actualizar la moto' });
    }
});



// router.delete('/eliminar_moto/:id', async (req, res) => {
//     const { id } = req.params;

//     if (!id || isNaN(id)) {
//         return res.status(400).json({ ok: false, msg: 'ID de moto no válido' });
//     }

//     try {

//         const [result] = await db.query('SELECT * FROM cat_motocicletas WHERE id = ?', [id]);

//         if (result.length === 0) {
//             return res.status(404).json({ ok: false, msg: 'No existe ninguna moto con ese ID' });
//         }

//         // Eliminar la moto
//         await db.query('DELETE FROM cat_motocicletas WHERE id = ?', [id]);

//         return res.status(200).json({ ok: true, msg: 'Moto eliminada correctamente' });

//     } catch (error) {
//         console.error('Error al eliminar la moto:', error);
//         return res.status(500).json({ ok: false, msg: 'Error en el servidor al eliminar la moto' });
//     }
// });

router.put('/actualizar_status/:id', async (req, res) => {
    const { id } = req.params

    if (!id) {
        return res.status(400).json('Faltan parametros para actualizar el campo');
    }

    const query = `UPDATE cat_motocicletas SET status = 0 WHERE id = ?`

    try {
        const [results] = await db.query(query, [id]);

        if (results.length === 0) {
            return res.status(404).json('No hay datos en la tabla');
        }
        return res.status(200).json(results);

    } catch (err) {
        console.error('Error al obtener el crédito:', err);
        return res.status(500).json({ errors: ['Error en el servidor'] });
    }

})

router.put('/actualizar_status_mant/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json('Faltan parametros para actualizar el campo');
    }

    const query = `UPDATE cat_motocicletas SET status = 2 WHERE id = ?`;

    try {
        const [results] = await db.query(query, [id]);

        // Verifica si alguna fila fue afectada
        if (results.affectedRows === 0) {
            return res.status(404).json('No se encontró la moto con el ID especificado');
        }

        return res.status(200).json({ message: 'Estado de la moto actualizado a 2 correctamente' });

    } catch (err) {
        console.error('Error al actualizar el estado:', err);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});


router.get('/marcas', async (req, res) => {

    const query = ` SELECT * FROM cat_marcas_vehiculos `

    try {
        const [results] = await db.query(query);

        if (results.length === 0) {
            return res.status(404).json('No hay datos en la tabla');
        }
        return res.status(200).json(results);

    } catch (err) {
        console.error('Error al obtener el crédito:', err);
        return res.status(500).json({ errors: ['Error en el servidor'] });
    }
})

router.post('/agregar_marcas', async (req, res) => {
    const { nombre } = req.body;

    if (!nombre) {
        return res.status(400).json('Faltan parametros en la peticion')
    }

    const query = `INSERT INTO cat_marcas_vehiculos (nombre) values(?)`

    try {
        await db.query(query, [nombre])

        return res.status(200).json('Se inserto correctamente la marca')
    } catch (error) {
        console.error('Error al obtener el crédito:', err);
        return res.status(500).json({ errors: ['Error en el servidor'] });
    }
})

router.post('/login', async (req, res) => {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
        return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
    }

    const query = 'SELECT * FROM usuarios WHERE usuario = ? AND password = ?';

    try {
        const [results] = await db.query(query, [usuario, password]);

        if (results.length === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        const user = results[0];

        if (user.password !== password) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const token = await generarJwt(user.usuario, user.idUsuario);

        return res.status(200).json({
            token,
            usuario: user.usuario,
            id: user.idUsuario,
            nombre: user.nombre
        });
    } catch (err) {
        console.error('Error al iniciar sesión:', err);
        return res.status(500).json({ message: 'Error en el servidor' });
    }
});


module.exports = router;
