import express from 'express';
import dotenv from "dotenv";
import tasksRouter from './src/Routers/tasksRouter.js';
import adminAuthRouter from "./src/Routers/adminAuthRouter.js";

const app = express();
dotenv.config();

app.use(express.json());

app.use("/api/tasks", tasksRouter);
app.use("/api/admin/login", adminAuthRouter);

app.listen(3000, () => {
    console.log('server bắt đầu trên cổng 3000');
});
