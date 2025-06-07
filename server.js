const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const port = 3050; // Port d'écoute de l'application

const server = http.createServer(app); // Création du serveur HTTP
const io = new Server(server); //WebSocket server

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Accueil principal
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// App FoodList
const foodListRouter = require("./apps/foodList/app.js")(io);
app.use(
    "/foodList",
    express.static(path.join(__dirname, "apps", "foodList", "public"))
);
app.use("/foodList", foodListRouter);

// App MyHub
server.listen(port, () => {
    console.log("MyHub is running on port " + port);
});

// WebSocket server
io.on("connection", (socket) => {
    console.log("A user connected");
    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});
