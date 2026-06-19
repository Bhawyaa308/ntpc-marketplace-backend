const { pool } = require('../config/db');

function authorizeRoles(...allowedRoles) {
  return async function (req, res, next) {
    if (!req.user || !req.user.user_id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to access this resource',
      });
    }

    try {
      // Fetch user role from users.role_id directly (no user_roles table)
      const { rows } = await pool.query(
        'SELECT role_id FROM users WHERE user_id = $1 LIMIT 1',
        [req.user.user_id]
      );

      if (!rows[0]) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to access this resource',
        });
      }

      const userRole = rows[0].role_id;
      const hasRole = allowedRoles.includes(userRole);

      if (!hasRole) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to access this resource',
        });
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = {
  authorizeRoles,
};
