import express from "express";
import authRouter from "./routes/auth.routes.js";
import centerRouter from "./routes/center.routes.js";
import bookingRouter from "./routes/booking.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(express.json());

app.use("/auth", authRouter);
app.use("/centers", centerRouter);
app.use("/bookings", bookingRouter);
app.use("/payments", paymentRouter);

app.get("/health", (req, res) => {
    res.json({
        status: "ok"
    });
});

app.use(errorHandler);

export default app;
