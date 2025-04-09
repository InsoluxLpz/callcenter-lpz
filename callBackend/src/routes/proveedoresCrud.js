const express = require('express');
const { dbConexion } = require('../database/config');
const router = express.Router();
const db = dbConexion();

// * Agregar proveedor
router.post('/agregar_proveedor', async (req, res) => {
    const { nombre_empresa, nombre_proveedor, rfc, telefono_contacto, telefono_empresa } = req.body;
    console.log("Llegó la petición para agregar proveedor");

    if (!nombre_empresa || !nombre_proveedor || !rfc) {
        return res.status(400).json({ message: 'El nombre de la empresa, nombre del proveedor y RFC son obligatorios' });
    }

    try {
        // Verificar si ya existe un proveedor con el mismo nombre de empresa
        const checkQuery = `SELECT id FROM proveedores WHERE nombre_empresa = ?`;
        const [existingProveedor] = await db.query(checkQuery, [nombre_empresa]);

        if (existingProveedor.length > 0) {
            return res.status(400).json({ message: 'Ya existe un proveedor con este nombre de empresa' });
        }

        // Si no existe, insertar el nuevo proveedor
        const insertQuery = `INSERT INTO proveedores (nombre_empresa,nombre_proveedor,rfc, telefono_contacto, telefono_empresa ) VALUES (?, ?, ?, ?, ?)`;
        const values = [nombre_empresa, nombre_proveedor, rfc, telefono_contacto, telefono_empresa];

        await db.query(insertQuery, values);

        return res.status(200).json({ message: 'Proveedor agregado correctamente' });
    } catch (error) {
        console.error('Error al agregar el proveedor:', error);
        return res.status(500).json({ message: 'Error al agregar el proveedor' });
    }
});


// * Obtener proveedores
router.get('/obtener_proveedores', async (req, res) => {
    try {
        const query = `SELECT * FROM proveedores`;
        const [results] = await db.query(query);

        if (results.length === 0) {
            return res.status(404).json({ message: 'No hay proveedores registrados' });
        }

        return res.status(200).json(results);
    } catch (error) {
        console.error('Error al obtener proveedores:', error);
        return res.status(500).json({ message: 'Error al obtener los proveedores' });
    }
});

// * Actualizar proveedor
router.put('/actualizar_proveedor/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre_empresa, nombre_proveedor, rfc, telefono_contacto, telefono_empresa, status } = req.body;

    if (!nombre_empresa || !nombre_proveedor || !rfc) {
        return res.status(400).json({ message: 'El nombre del proveedor es obligatorio' });
    }

    try {
        const query = `UPDATE proveedores SET nombre_empresa = ?, nombre_proveedor = ?, rfc = ?, telefono_contacto = ?, telefono_empresa = ?, status = ? WHERE id = ?`;
        const values = [nombre_empresa, nombre_proveedor, rfc, telefono_contacto, telefono_empresa, status, id];

        await db.query(query, values);

        const [updateProveedor] = await db.query('SELECT * FROM proveedores WHERE id = ?', [id]);


        return res.status(200).json(updateProveedor[0]);
    } catch (error) {
        console.error('Error al actualizar el proveedor:', error);
        return res.status(500).json({ message: 'Error al actualizar el proveedor' });
    }
});

// * actualizar status en la tabla de productos
router.put('/actualizar_status_proveedores/:id', async (req, res) => {
    const { id } = req.params

    if (!id) {
        return res.status(400).json('Faltan parametros para actualizar el campo');
    }

    console.log("se hare la actualizacion del status prveedores")

    const query = `UPDATE proveedores SET status = 0 WHERE id = ?`

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

});

// * Eliminar proveedor
router.delete('/eliminar_proveedor/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = `DELETE FROM proveedores WHERE id = ?`;
        const [result] = await db.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }

        return res.status(200).json({ message: 'Proveedor eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar el proveedor:', error);
        return res.status(500).json({ message: 'Error al eliminar el proveedor' });
    }
});

module.exports = router;

