import "dotenv/config";
import express from "express";
import organizationRouter from "./routes/organization.routes.js";
import customerRouter from "./routes/customer.routes.js";
import staffServiceRouter from "./routes/staffService.routes.js";
import errorMiddleware from "./middleware/error.middleware.js";

const app = express();

app.use(express.json())
app.use("/organizations", organizationRouter)
app.use("/customers", customerRouter);
app.use("/staff", staffServiceRouter);

app.use(errorMiddleware);

app.listen(5000, () => {
    console.log("Bookr server running on port 5000");
});

