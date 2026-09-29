import express from "express";
import swaggerUi from "swagger-ui-express";
import { openapiSpec } from "./docs/openapi.js";
import authRouter from "./routes/auth.routes.js";
import centerRouter from "./routes/center.routes.js";
import bookingRouter from "./routes/booking.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(express.json());

app.get("/docs.json", (req, res) => res.json(openapiSpec));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec, { explorer: true }));

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
