const express = require('express');
const { dbConexion } = require('../database/config');
const router = express.Router();
const db = dbConexion();

router.post('/agregar_producto', async (req, res) => {
    console.log("Datos recibidos en el backend:", req.body);

    const { codigo, nombre, descripcion, grupo, unidad_medida, proveedores, idUsuario } = req.body;

    if (!codigo || !nombre || !grupo || !unidad_medida || !idUsuario || !proveedores.length) {
        return res.status(400).json({ message: 'Faltan parámetros para guardar en la base de datos' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const checkQuery = `
        SELECT codigo, nombre FROM productos WHERE codigo = ? OR nombre = ?`;
        const [existingProduct] = await connection.query(checkQuery, [codigo, nombre]);

        if (existingProduct.length > 0) {
            const message = existingProduct[0].codigo === codigo ? 'El código del producto ya existe.' : 'El nombre del producto ya existe.';
            await connection.rollback();
            return res.status(400).json({ message });
        }


        const insertProductoQuery = `
            INSERT INTO productos (codigo, nombre, descripcion, idGrupo, idUnidadMedida, idUsuario, fecha_registro) 
            VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())`;
        const valuesProducto = [codigo, nombre, descripcion, grupo, unidad_medida, idUsuario];

        const [productoResult] = await connection.query(insertProductoQuery, valuesProducto);
        const idProducto = productoResult.insertId;


        if (proveedores.length > 0) {
            const valuesProveedores = proveedores.map(idProveedor => [idProducto, idProveedor]);
            const insertProveedorQuery = `INSERT INTO productos_proveedor (idProducto, idProveedor) VALUES ?`;
            await connection.query(insertProveedorQuery, [valuesProveedores]);
        }

        await connection.commit();
        return res.status(200).json({ message: 'Producto agregado correctamente' });

    } catch (error) {
        await connection.rollback();
        console.error('Error al agregar el producto:', error.message);
        return res.status(500).json({ message: error.message || 'Error al agregar el producto' });
    } finally {
        connection.release();
    }
});

router.get('/obtener_productos', async (req, res) => {
    console.log(req.body)
    const query = `
SELECT 
      p.*, 
    g.nombre AS grupo,
    u.nombre AS unidad_medida,
    COALESCE(st.stock_disponible, 0) AS stock_disponible, 
    JSON_ARRAYAGG(
        JSON_OBJECT('id', pr.id, 'nombre', pr.nombre_proveedor)
    ) AS proveedores
FROM 
    productos p
JOIN 
    cat_grupos g ON p.idGrupo = g.id
JOIN 
    cat_unidad_medida u ON p.idUnidadMedida = u.id
LEFT JOIN 
    productos_proveedor pp ON p.id = pp.idProducto AND pp.status = 1
LEFT JOIN (
    -- Subconsulta para evitar duplicaciones de proveedores antes del JSON_ARRAYAGG
    SELECT DISTINCT id, nombre_proveedor FROM proveedores
) pr ON pp.idProveedor = pr.id
LEFT JOIN (
    -- Subconsulta para calcular el stock por producto
    SELECT idProducto, SUM(cantidad) AS stock_disponible 
    FROM inventario_almacen 
    GROUP BY idProducto
) st ON p.id = st.idProducto
GROUP BY 
    p.id;
    `;

    try {
        const [results] = await db.query(query);

        if (results.length === 0) {
            return res.status(404).json('No se encontraron productos con los datos solicitados');
        }

        return res.status(200).json(results);
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        return res.status(500).json({ message: 'Error al obtener los productos' });
    }
});


router.put('/actualizar_producto/:id', async (req, res) => {
    console.log("Datos recibidos en el backend para actualizar producto:", req.body);

    const { codigo, nombre, precio, descripcion, grupo, unidad_medida, idUsuario, proveedores, status } = req.body;
    const { id } = req.params;

    if (!codigo || !nombre || !grupo || !unidad_medida || !precio || !idUsuario || !proveedores || !status) {
        return res.status(400).json({ message: 'Faltan parámetros para actualizar el producto' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const updateProductoQuery = `
            UPDATE productos
            SET codigo = ?, nombre = ?, descripcion = ?, idGrupo = ?, idUnidadMedida = ?, status = ? 
            WHERE id = ?`;
        const valuesProducto = [codigo, nombre, descripcion, grupo, unidad_medida, status, id];
        await connection.query(updateProductoQuery, valuesProducto);

        // Obtener los proveedores actuales del producto
        const getCurrentProveedoresQuery = `SELECT idProveedor FROM productos_proveedor WHERE idProducto = ?`;
        const [currentProveedores] = await connection.query(getCurrentProveedoresQuery, [id]);
        const currentProveedoresSet = new Set(currentProveedores.map(p => p.idProveedor));
        const newProveedoresSet = new Set(proveedores);

        // Proveedores a desactivar (status = 0)
        const proveedoresADesactivar = [...currentProveedoresSet].filter(idProveedor => !newProveedoresSet.has(idProveedor));
        if (proveedoresADesactivar.length > 0) {
            const updateStatusQuery = `UPDATE productos_proveedor SET status = 0 WHERE idProducto = ? AND idProveedor IN (?)`;
            await connection.query(updateStatusQuery, [id, proveedoresADesactivar]);
        }

        // Proveedores a agregar o reactivar (status = 1)
        for (const idProveedor of newProveedoresSet) {
            if (currentProveedoresSet.has(idProveedor)) {
                const reactivateQuery = `UPDATE productos_proveedor SET status = 1 WHERE idProducto = ? AND idProveedor = ?`;
                await connection.query(reactivateQuery, [id, idProveedor]);
            } else {
                const insertProveedorQuery = `INSERT INTO productos_proveedor (idProducto, idProveedor, status) VALUES (?, ?, 1)`;
                await connection.query(insertProveedorQuery, [id, idProveedor]);
            }
        }

        await connection.commit();

        const getUpdatedProductoQuery = `
            SELECT p.id, p.codigo, p.nombre, p.descripcion, 
                p.idUnidadMedida AS unidad_medida, p.idGrupo, p.status,
                JSON_ARRAYAGG(JSON_OBJECT('id', pp.idProveedor, 'status', pp.status)) AS proveedores
            FROM productos p
            LEFT JOIN productos_proveedor pp ON p.id = pp.idProducto
            WHERE p.id = ?
            GROUP BY p.id;
        `;
        const [updatedProducto] = await connection.query(getUpdatedProductoQuery, [id]);

        return res.status(200).json(updatedProducto[0]);
    } catch (error) {
        await connection.rollback();
        console.error('Error al actualizar el producto:', error.message);
        return res.status(500).json({ message: error.message || 'Error al actualizar el producto' });
    } finally {
        connection.release();
    }
});


router.put('/actualizar_status_productos/:id', async (req, res) => {
    const { id } = req.params

    if (!id) {
        return res.status(400).json('Faltan parametros para actualizar el campo');
    }

    const query = `UPDATE productos SET status = 0 WHERE id = ?`

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

router.post('/agregar_entrada', async (req, res) => {
    const { producto, fecha, cantidad, costo_unitario, tipo, autorizo, proveedor } = req.body

    if (!producto || !fecha || !cantidad || !costo_unitario || !tipo || !autorizo || !proveedor) {
        return res.status(400).json({ message: 'Hacen falta parámetros para guardar en la tabla' });
    }

    try {
        const query = ` INSERT INTO productos_entradas (producto, fecha, cantidad, costo_unitario, tipo, autorizo, proveedor) VALUES (?,?,?,?,?,?,?)`

        const values = [producto, fecha, cantidad, costo_unitario, tipo, autorizo, proveedor];

        await db.query(query, values);

        return res.status(200).json('Entrada agregada correctamente')
    } catch (error) {
        console.error('Error al agregar el producto:', error);
        return res.status(500).json({ message: 'Error al agregar el producto' });
    }

});

router.get('/obtener_entradas', async (req, res) => {
    try {

        const query = `SELECT * FROM productos_entradas`;

        const [results] = await db.query(query);

        if (results.length === 0) {
            return res.status(404).json('No hay valores que mostrar en la tabla')
        }

        return res.status(200).json(results)

    } catch (error) {
        console.error('Error al obtener los prodructos:', error);
        return res.status(500).json({ message: 'Error al obtener los productos' });
    }
});

router.get('/obtener_grupos', async (req, res) => {

    const query = `SELECT * FROM cat_grupos`

    try {

        const [results] = await db.query(query);

        if (results.length === 0) {
            return res.status(404).json('No se encontraron valores a mostrar en la tabla')
        }

        return res.status(200).json(results)

    } catch (error) {
        console.error('Error al obtener los prodructos:', error);
        return res.status(500).json({ message: 'Error al obtener los productos' });
    }

});

router.get('/obtener_unidad_medida', async (req, res) => {

    const query = `SELECT * FROM cat_unidad_medida`

    try {

        const [results] = await db.query(query);

        if (results.length === 0) {
            return res.status(404).json('No se encontraron valores a mostrar en la tabla')
        }

        return res.status(200).json(results)

    } catch (error) {
        console.error('Error al obtener los prodructos:', error);
        return res.status(500).json({ message: 'Error al obtener los productos' });
    }

});


router.post('/agregar_entrada', async (req, res) => {
    const { producto, fecha, cantidad, costo_unitario, tipo, autorizo, proveedor } = req.body

    if (!producto || !fecha || !cantidad || !costo_unitario || !tipo || !autorizo || !proveedor) {
        return res.status(400).json({ message: 'Hacen falta parámetros para guardar en la tabla' });
    }

    try {
        const query = ` INSERT INTO productos_entradas (producto, fecha, cantidad, costo_unitario, tipo, autorizo, proveedor) VALUES (?,?,?,?,?,?,?)`

        const values = [producto, fecha, cantidad, costo_unitario, tipo, autorizo, proveedor];

        await db.query(query, values);

        return res.status(200).json('Entrada agregada correctamente')
    } catch (error) {
        console.error('Error al agregar el producto:', error);
        return res.status(500).json({ message: 'Error al agregar el producto' });
    }

});

router.get('/obtener_entradas', async (req, res) => {
    try {

        const query = `SELECT * FROM productos_entradas`;

        const [results] = await db.query(query);

        if (results.length === 0) {
            return res.status(404).json('No hay valores que mostrar en la tabla')
        }

        return res.status(200).json(results)

    } catch (error) {
        console.error('Error al obtener los prodructos:', error);
        return res.status(500).json({ message: 'Error al obtener los productos' });
    }
});

router.get('/obtener_grupos', async (req, res) => {

    const query = `SELECT * FROM cat_grupos`

    try {

        const [results] = await db.query(query);

        if (results.length === 0) {
            return res.status(404).json('No se encontraron valores a mostrar en la tabla')
        }

        return res.status(200).json(results)

    } catch (error) {
        console.error('Error al obtener los prodructos:', error);
        return res.status(500).json({ message: 'Error al obtener los productos' });
    }

});

router.get('/obtener_unidad_medida', async (req, res) => {

    const query = `SELECT * FROM cat_unidad_medida`

    try {

        const [results] = await db.query(query);

        if (results.length === 0) {
            return res.status(404).json('No se encontraron valores a mostrar en la tabla')
        }

        return res.status(200).json(results)

    } catch (error) {
        console.error('Error al obtener los prodructos:', error);
        return res.status(500).json({ message: 'Error al obtener los productos' });
    }

});




module.exports = router;

