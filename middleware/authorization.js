const authorization = (...Role) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized: Data pengguna tidak ditemukan" });
    }

    if (!Role.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Hak akses tidak mencukupi" });
    }

    next();
  };
};

module.exports = authorization