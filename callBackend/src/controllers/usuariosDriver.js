// controllers/usuariosDriver.js
const jwt = require('jsonwebtoken');
const { openDb } = require('../../db');
const { generarJwt } = require('../helpers/jwt');

const SECRET_KEY = 'miroku23';

const handleUsuarios = async (req, res) => {
  const db = await openDb();

  if (req.method === 'POST') {
    const { action, id, usuario, password, lista_id } = req.body;

    try {
      if (action === 'register') {
        if (!usuario || !password) {
          return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
        }

        const ucmresponse = await fetch("http://localhost:4000/api/ucm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "getUser", user_name: usuario })
        });

        const ucmData = await ucmresponse.json();
        if (ucmData.status !== 0)
          return res.status(400).json({ error: 'Usuario no existe en el UCM' });

        await db.run(
          'INSERT INTO usuarios (usuario, password, type) VALUES (?, ?, ?, "agente")',
          [usuario, password]
        );

        return res.status(201).json({ message: 'Usuario registrado exitosamente' });
      }

      if (action === 'login') {
        if (!usuario || !password) {
          return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
        }

        const user = await db.get('SELECT * FROM usuarios WHERE usuario = ?', [usuario]);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });


        if (!password) return res.status(401).json({ error: 'Contraseña incorrecta' });

        const token = await generarJwt(user, password);

        return res.status(200).json({
          message: 'Inicio de sesión exitoso',
          token,
          user: {
            id: user.id,
            usuario: user.usuario,
            type: user.type,
            url_name: user.url_name,
            url_lista: user.url_lista,
          }
        });
      }

      if (action === 'update') {
        if (!id) return res.status(400).json({ error: 'ID de usuario es obligatorio' });

        const fields = [];
        if (usuario) fields.push(`usuario = '${usuario}'`);
        if (password) {
          fields.push(`password = '${password}'`);
        }
        if (lista_id) fields.push(`lista_id = '${lista_id}'`);

        if (fields.length === 0)
          return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });

        const updateQuery = `UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`;
        const result = await db.run(updateQuery, [id]);

        if (result.changes === 0)
          return res.status(404).json({ error: 'Usuario no encontrado' });

        return res.status(200).json({ message: 'Usuario actualizado correctamente' });
      }

      if (action === 'delete') {
        if (!id) return res.status(400).json({ error: 'ID de usuario es obligatorio' });

        await db.run('DELETE FROM usuarios WHERE id = ?', [id]);
        return res.status(201).json({ message: 'Usuario borrado exitosamente' });
      }

      return res.status(400).json({ error: 'Acción no válida' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  if (req.method === 'GET') {
    try {
      const users = await db.all(
        'SELECT id, usuario, type, url_name, url_lista, lista_id FROM usuarios WHERE type IN (?, ?)',
        ['agente', 'admin']
      );
      if (!users) {
        return res.status(404).json({ error: 'Ningún usuario agente encontrado' });
      }

      return res.status(200).json(users);
    } catch (error) {
      return res.status(401).json({ error: 'Error al obtener usuarios' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}

module.exports = { handleUsuarios };
