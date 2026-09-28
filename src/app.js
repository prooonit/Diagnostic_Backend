import express from "express";
import authRouter from "./routes/auth.routes.js";
import centerRouter from "./routes/center.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(express.json());

app.use("/auth", authRouter);
app.use("/centers", centerRouter);

app.get("/health", (req, res) => {
    res.json({
        status: "ok"
    });
});

app.use(errorHandler);

export default app;
