const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    const error = new Error('Unauthorized');
    error.status = 401;
    return next(error);
  }

  const token = authorizationHeader.split(' ')[1];
  if (!token) {
    const error = new Error('Unauthorized');
    error.status = 401;
    return next(error);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      user_id: decoded.user_id,
      employee_id: decoded.employee_id,
      email: decoded.email,
    };

    return next();
  } catch (err) {
    const error = new Error('Unauthorized');
    error.status = 401;
    return next(error);
  }
}

module.exports = authMiddleware;
