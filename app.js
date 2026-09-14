const express = require("express");
const cors = require("cors");
const path = require('path')
const { sequelize } = require("./config/connection");

const categoryRoute = require('./routes/category.routes')
const authRoute = require('./routes/auth.routes')
const userRoute = require('./routes/user.routes')
const inRoute = require('./routes/inmail.routes')
const outRoute = require('./routes/outmail.routes')
const matsusRoute = require('./routes/matsus.routes')
const borrowingRoute = require('./routes/borrowing.routes')
const dashboardRoute = require('./routes/dashboard.routes')
const reportRoute = require('./routes/report.routes')

const app = express();
const db = require('./models')

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoute)
app.use('/user', userRoute)
app.use('/categories', categoryRoute)
app.use('/inmails', inRoute)
app.use('/outmails', outRoute)
app.use('/matsus', matsusRoute)
app.use('/borrowing', borrowingRoute)
app.use('/dashboard', dashboardRoute)
app.use('/report', reportRoute)

const PORT = process.env.PORT || 2000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Koneksi ke PostgreSQL berhasil!");

    app.listen(PORT, () => {
      console.log(`🚀  Server berjalan di http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Gagal konek ke PostgreSQL:", error.message);
    process.exit(1);
  }
};

startServer();