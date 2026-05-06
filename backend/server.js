import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import tasksRouter from './src/Routers/tasksRouter.js';
import adminAuthRouter from "./src/Routers/adminAuthRouter.js";
import adminEventRoutes from "./src/Routers/adminEventRoutes.js";
import eventRoutes from "./src/Routers/adminEventDashboardRouters.js";

const app = express();
dotenv.config();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use("/api/tasks", tasksRouter);
app.use("/api/admin/login", adminAuthRouter);
app.use("/api/admin/events", adminEventRoutes);
app.use("/api/events", eventRoutes);

app.listen(3000, () => {
    console.log('server bắt đầu trên cổng 3000');
});
