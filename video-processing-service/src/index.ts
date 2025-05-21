import express from "express";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
    res.send("Hi I'm Alex!");
});

app.listen(port, () => {
    console.log(
        `Video processing service listening at http://localhost:${port}`);
});