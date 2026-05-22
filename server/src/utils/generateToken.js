import jwt from 'jsonwebtoken';

/**
 * Generates a signed JWT for a given user ID.
 * @param {string} id - The user ID to include in the token payload.
 * @returns {string} The signed JWT.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

export default generateToken;
