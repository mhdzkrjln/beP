const { verifyToken } = require("../helpers/jwt");
const { response } = require("../helpers/response.formatter");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json(response(401, "Akses ditolak. token tidak ditemukan"));
    }
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(403).json(response(403, "Token tidak valid atau sudah kadaluwarsa"));
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(500).json(response(500, "Terjadi kesalahan pada server", error.message))
  }
};

module.exports = authMiddleware;
