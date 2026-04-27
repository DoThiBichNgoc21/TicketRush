import express from 'express';
import tasksRouter from './src/Routers/tasksRouter.js';

const app = express();

app.use(express.json());

app.use("/api/tasks", tasksRouter)

app.listen(3000, () => {
    console.log('server bắt đầu trên cổng 3000');
});
