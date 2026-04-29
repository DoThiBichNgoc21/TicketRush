import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import tasksRouter from './src/Routers/tasksRouter.js';
import authRouter from './src/Routers/authRouter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/tasks', tasksRouter);
app.use('/api/auth', authRouter);

app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
});
