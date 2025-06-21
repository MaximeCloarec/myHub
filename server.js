const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const port = 3050; // Port d'écoute de l'application

const server = http.createServer(app); // Création du serveur HTTP
const io = new Server(server); //WebSocket server

//Limiter les requêtes pour éviter les abus
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limite chaque IP à 100 requêtes par fenêtre
    message: "Trop de requêtes, veuillez réessayer plus tard.",
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter); // Appliquer le rate limiting

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

    let inactivityTimer = setTimeout(() => {
        console.log("Disconnecting inactive user...");
        socket.disconnect(true);
    }, 5 * 60 * 1000); // 5 minutes

    socket.on("activity", () => {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            socket.disconnect(true);
        }, 5 * 60 * 1000);
    });

    socket.on("disconnect", () => {
        clearTimeout(inactivityTimer);
        console.log("A user disconnected");
    });
});
