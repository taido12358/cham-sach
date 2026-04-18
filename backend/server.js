import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { db } from './config/db.js';
import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';
import reviewRoutes from './routes/reviews.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.'
}));

app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ name: 'Trang Sách API (JSON demo)', status: 'running', version: '1.0.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);

app.use((req, res) => res.status(404).json({ error: 'Không tìm thấy endpoint này' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Lỗi server' });
});

const start = async () => {
  try {
    await db.init();
    app.listen(PORT, () => {
      console.log(`\n🚀 Server đang chạy tại http://localhost:${PORT}`);
      console.log(`💾 Database: JSON file (data/db.json)\n`);
    });
  } catch (err) {
    console.error('❌ Không khởi động được server:', err);
    process.exit(1);
  }
};

start();
