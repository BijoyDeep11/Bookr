import express from "express";
import customerRouter from "./routes/customer.routes.js";

const app = express();


app.use("/customers", customerRouter);
app.get("/", (req, res) => {
    res.json({
        message: "Bookr is running"
    });
});

app.listen(5000, () => {
    console.log("Bookr server running on port 5000");
});

