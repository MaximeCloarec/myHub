const express = require("express");
const path = require("path");
const app = express();
const port = 3050;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Accueil principal
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// App FoodList
app.use(
    "/foodList",
    express.static(path.join(__dirname, "apps", "foodList", "public"))
);
app.use("/foodList", require("./apps/foodList/app.js"));

app.listen(port, () => {
    console.log("MyHub is running on port " + port);
});
