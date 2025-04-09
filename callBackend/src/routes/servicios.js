const express = require('express');
const { dbConexion } = require('../database/config');
const router = express.Router();
const db = dbConexion();

router.post('/agregar_servicio', async (req, res) => {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
        return res.status(404).json({ message: 'Faltan parametros para guardar en la tabla' });
    }

    try {
        const checkQuery = 'SELECT * FROM cat_servicios WHERE nombre = ?';
        const [existingService] = await db.query(checkQuery, [nombre]);

        if (existingService.length > 0) {
            return res.status(400).json({ message: 'El servicio con ese nombre ya existe' });
        }

        const query = `INSERT INTO cat_servicios (nombre,descripcion) VALUES (?,?)`;
        const values = [nombre, descripcion];

        await db.query(query, values);

        const [nuevoServicio] = await db.query("SELECT * FROM cat_servicios WHERE nombre = ?",
            [nombre]
        )

        return res.status(200).json(nuevoServicio[0]);
    } catch (error) {
        console.error('Error al agregar el servicio:', error);
        return res.status(500).json({ message: 'Error al agregar el servicio' });
    }
});


router.get('/obtener_servicio', async (req, res) => {

    try {
        const query = `SELECT * FROM cat_servicios`;

        const [results] = await db.query(query);

        if (results.length === 0) {
            return res.status(404).json({ message: 'No existe ningun servicio en la tabla' })
        }

        return res.status(200).json(results);
    } catch (error) {
        console.error('Error al obtener los prodructos:', error);
        return res.status(500).json({ message: 'Error al obtener los productos' });
    }
});

router.put('/actualizar_servicio/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, status } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'No se encuentra id en la petición' })
    }
    try {
        // Actualizamos el servicio
        const query = `UPDATE cat_servicios SET nombre = ?, descripcion = ?, status = ? WHERE id = ?`;
        const values = [nombre, descripcion, status, id];
        await db.query(query, values);

        // Obtener el servicio actualizado
        const [rows] = await db.query('SELECT * FROM cat_servicios WHERE id = ?', [id]);
        const servicioActualizado = rows[0];

        return res.status(200).json(servicioActualizado);  // Enviar el servicio actualizado

    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


router.put('/actualizar_status_servicio/:id', async (req, res) => {
    const { id } = req.params

    if (!id) {
        return res.status(400).json('Faltan parametros para actualizar el campo');
    }

    const query = `UPDATE cat_servicios SET status = 0 WHERE id = ?`

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

//* <============================== mantenimientos-motos======================================>

const moment = require('moment-timezone');

router.post('/agregar_mantenimiento', async (req, res) => {
    console.log("Datos recibidos en el backend:", req.body);

    const { fecha_inicio, odometro, costo, comentario, moto, idAutorizo, idUsuario, idCancelo, fecha_cancelacion, servicios, productos } = req.body;

    if (!fecha_inicio || !moto || !costo || !idUsuario || !idAutorizo) {
        return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const fechaInicioLocal = moment(fecha_inicio).local().format('YYYY-MM-DD HH:mm:ss');

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Insertar en la base de datos con la fecha ya convertida a hora local
        const [servicioResult] = await connection.query(
            "INSERT INTO mantenimientos (fecha_inicio, odometro, costo_total, comentario, idMoto, idAutorizo, idUsuario, idCancelo, fecha_cancelacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)",
            [fechaInicioLocal, odometro, costo, comentario, moto, idAutorizo, idUsuario, idCancelo, fecha_cancelacion]
        );
        const idServicio = servicioResult.insertId;

        // Insertar en servicio_servicios si hay servicios
        if (servicios && servicios.length > 0) {
            const servicioValues = servicios.map(servicio => [idServicio, servicio]);
            await connection.query(
                "INSERT INTO mantenimientos_servicios (idMantenimiento, idServicio) VALUES ?",
                [servicioValues]
            );
        }

        // Insertar en servicios_detalles si hay productos
        if (productos && productos.length > 0) {
            const productoValues = productos.map(producto => [
                idServicio,
                producto.idProducto,
                producto.cantidad,
                producto.costo,
                producto.subtotal
            ]);

            await connection.query(
                "INSERT INTO mantenimientos_detalles (idMantenimiento, idProducto, cantidad, costo, subtotal) VALUES ?",
                [productoValues]
            );
        }

        await connection.commit();
        res.json({ message: "Servicio agregado correctamente", idServicio });

    } catch (error) {
        await connection.rollback();
        console.error("Error al agregar servicio:", error);

        // 🔽 Si el error viene del trigger, capturamos el mensaje de MySQL
        if (error.code === 'ER_SIGNAL_EXCEPTION') {
            return res.status(400).json({ error: error.sqlMessage });
        }

        res.status(500).json({ error: "Error interno del servidor" });
    } finally {
        connection.release();
    }
});

router.get('/obtener_mantenimientos', async (req, res) => {

    let { fecha_inicio, fecha_final, servicio, moto, todos } = req.query;
    todos = parseInt(todos, 10);
    const connection = await db.getConnection();

    try {
        if (todos !== 1 && !fecha_inicio && !fecha_final && !servicio && !moto) {
            const hoy = new Date();
            const diaSemana = hoy.getDay();
            const inicioSemana = new Date(hoy);
            inicioSemana.setDate(hoy.getDate() - diaSemana);

            const finSemana = new Date(inicioSemana);
            finSemana.setDate(inicioSemana.getDate() + 7);

            fecha_inicio = inicioSemana.toISOString().split('T')[0];
            fecha_final = finSemana.toISOString().split('T')[0];
        }

        let query = `
            SELECT 
                m.id AS servicio_id,
                m.fecha_inicio,
                m.idMoto,
                m.idAutorizo,
                m.status,
                m.idCancelo,
                m.fecha_cancelacion,
                mt.id AS idMoto,
                mt.inciso AS moto_inciso,
                m.odometro,
                m.costo_total,
                m.comentario,
                m.idUsuario,
                u.nombre,
                sm.idServicio AS servicio_aplicado_id,
                cs.nombre AS servicio_aplicado_nombre,
                md.idProducto AS producto_id,
                p.nombre AS producto_nombre,
                md.cantidad,
                md.costo,
                md.subtotal
            FROM mantenimientos m
            LEFT JOIN cat_motocicletas mt ON m.idMoto = mt.id
            LEFT JOIN mantenimientos_servicios sm ON m.id = sm.idMantenimiento AND sm.STATUS = 1
            LEFT JOIN cat_servicios cs ON sm.idServicio = cs.id
            LEFT JOIN usuarios u ON m.idCancelo = u.idUsuario
            LEFT JOIN mantenimientos_detalles md ON m.id = md.idMantenimiento
            LEFT JOIN productos p ON md.idProducto = p.id
            WHERE 1 = 1
        `;

        const queryParams = [];

        if (!todos) {
            if (fecha_inicio) {
                query += ` AND m.fecha_inicio >= ?`;
                queryParams.push(fecha_inicio);
            }

            if (fecha_final) {
                query += ` AND m.fecha_inicio < DATE_ADD(?, INTERVAL 1 DAY)`;
                queryParams.push(fecha_final);
            }
        }

        if (moto) {
            query += ` AND m.idMoto = ?`;
            queryParams.push(moto);
        }

        if (servicio) {
            query += ` AND m.id IN (
                    SELECT idMantenimiento 
                    FROM mantenimientos_servicios 
                    WHERE idServicio = ?
                )`;
            queryParams.push(servicio);
        }

        const [rows] = await connection.query(query, queryParams);

        const serviciosMap = new Map();

        rows.forEach(row => {
            if (!serviciosMap.has(row.servicio_id)) {
                serviciosMap.set(row.servicio_id, {
                    id: row.servicio_id,
                    fecha_inicio: row.fecha_inicio,
                    idMoto: row.idMoto,
                    idAutorizo: row.idAutorizo,
                    status: row.status,
                    moto_inciso: row.moto_inciso,
                    odometro: row.odometro,
                    costo_total: row.costo_total,
                    comentario: row.comentario,
                    idUsuario: row.idUsuario,
                    idCancelo: row.idCancelo,
                    nombre: row.nombre,
                    fecha_cancelacion: row.fecha_cancelacion,
                    servicios: [],
                    productos: []
                });
            }

            const servicio = serviciosMap.get(row.servicio_id);

            if (row.servicio_aplicado_id && !servicio.servicios.some(s => s.id === row.servicio_aplicado_id)) {
                servicio.servicios.push({
                    id: row.servicio_aplicado_id,
                    nombre: row.servicio_aplicado_nombre
                });
            }

            if (row.producto_id && !servicio.productos.some(p => p.id === row.producto_id)) {
                servicio.productos.push({
                    id: row.producto_id,
                    nombre: row.producto_nombre,
                    cantidad: row.cantidad,
                    costo: row.costo,
                    subtotal: row.subtotal
                });
            }
        });

        res.json(Array.from(serviciosMap.values()));

    } catch (error) {
        console.error("Error al obtener servicios:", error);
        res.status(500).json({ error: "Error al obtener servicios" });
    } finally {
        connection.release();
    }
});

router.put('/actualizar_mantenimiento/:id', async (req, res) => {
    const { id } = req.params;
    const { servicios } = req.body;

    if (!id || !servicios || !Array.isArray(servicios)) {
        return res.status(400).json({ error: "Faltan datos obligatorios o formato incorrecto" });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [mantenimiento] = await connection.query(
            "SELECT id FROM mantenimientos WHERE id = ?",
            [id]
        );

        if (mantenimiento.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: "El mantenimiento no existe" });
        }

        // Obtener los servicios actuales del mantenimiento (activos e inactivos)
        const [serviciosActuales] = await connection.query(
            "SELECT idServicio, STATUS FROM mantenimientos_servicios WHERE idMantenimiento = ?",
            [id]
        );

        const serviciosActivos = serviciosActuales
            .filter(s => s.STATUS === 1)
            .map(s => s.idServicio);

        const serviciosInactivos = serviciosActuales
            .filter(s => s.STATUS === 0)
            .map(s => s.idServicio);

        // Determinar los servicios que deben desactivarse (están activos pero no en la nueva lista)
        const serviciosAEliminar = serviciosActivos.filter(s => !servicios.includes(s));

        if (serviciosAEliminar.length > 0) {
            await connection.query(
                "UPDATE mantenimientos_servicios SET STATUS = 0 WHERE idMantenimiento = ? AND idServicio IN (?)",
                [id, serviciosAEliminar]
            );
        }

        // Determinar los servicios que ya existen como inactivos y deben reactivarse
        const serviciosAReactivar = serviciosInactivos.filter(s => servicios.includes(s));

        if (serviciosAReactivar.length > 0) {
            await connection.query(
                "UPDATE mantenimientos_servicios SET STATUS = 1 WHERE idMantenimiento = ? AND idServicio IN (?)",
                [id, serviciosAReactivar]
            );
        }

        // Determinar los servicios completamente nuevos (no están en la BD ni como activos ni inactivos)
        const serviciosNuevos = servicios.filter(s =>
            !serviciosActivos.includes(s) && !serviciosInactivos.includes(s)
        );

        if (serviciosNuevos.length > 0) {
            const servicioValues = serviciosNuevos.map(servicio => [id, servicio, 1]);
            await connection.query(
                "INSERT INTO mantenimientos_servicios (idMantenimiento, idServicio, STATUS) VALUES ?",
                [servicioValues]
            );
        }

        await connection.commit();
        res.json({ message: "Servicios del mantenimiento actualizados correctamente" });

    } catch (error) {
        await connection.rollback();
        console.error("Error al actualizar servicios del mantenimiento:", error);
        res.status(500).json({ error: "Error al actualizar servicios del mantenimiento" });
    } finally {
        connection.release();
    }
});


router.delete('/cancelar_mantenimiento/:id', async (req, res) => {
    const { id } = req.params;
    const { idUsuario } = req.body;

    if (!idUsuario) {
        return res.status(400).json({ error: 'El idUsuario es obligatorio' });
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {

        const result = await connection.query(
            `UPDATE mantenimientos 
             SET idCancelo = ?, fecha_cancelacion = CURDATE(), status = 0 
             WHERE id = ?`,
            [idUsuario, id]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Mantenimiento no encontrado' });
        }

        // Si todo fue exitoso, hacer commit de la transacción
        await connection.commit();

        res.status(200).json({ message: 'Mantenimiento cancelado' });
    } catch (error) {
        // Si ocurre un error, revertir la transacción
        await connection.rollback();
        console.error('Error al cancelar mantenimiento:', error);
        res.status(500).json({ error: 'Error al cancelar mantenimiento' });
    } finally {
        // Liberar la conexión
        connection.release();
    }
});

module.exports = router;
