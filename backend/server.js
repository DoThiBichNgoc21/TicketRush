import express from 'express'; // Đảm bảo đã import express
import cors from 'cors';
import dotenv from 'dotenv';
import tasksRouter from './src/Routers/tasksRouter.js';
import authRouter from './src/Routers/authRouter.js'; // Luồng User
import adminAuthRouter from "./src/Routers/adminAuthRouter.js"; // Luồng Admin
import adminEventRoutes from "./src/Routers/adminEventRoutes.js";
import eventRoutes from "./src/Routers/adminEventDashboardRouters.js";
import adminUserManagement from "./src/Routers/adminUserManagementRouters.js";
import bookingRouter from "./src/Routers/bookingRouter.js";
import ticketRouter from "./src/Routers/ticketRouter.js";
import { startSeatReleaseWorker } from "./src/jobs/seatReleaseWorker.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Cấu hình Middleware (Ưu tiên bản của Admin vì có giới hạn 50mb để upload ảnh)
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Tổng hợp tất cả các Routes của cả 2 bạn
app.use("/api/tasks", tasksRouter);
app.use("/api/auth", authRouter); // Route của người làm User
app.use("/api/admin/login", adminAuthRouter); // Route của người làm Admin
app.use("/api/admin/events", adminEventRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/usermanagement", adminUserManagement);
app.use("/api/booking", bookingRouter);
app.use("/api/tickets", ticketRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Booking API: POST /api/booking/seats/:seatId/hold | release | confirm');
    startSeatReleaseWorker();
});