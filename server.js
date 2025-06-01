const express = require("express");
const path = require("path");
const app = express();
const port = 3050;

app.use(express.static(path.join(__dirname, "public")));

app.use("/foodList",require("./apps/foodList/app.js"));


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
    console.log("MyHub is running on port " + port);
});
