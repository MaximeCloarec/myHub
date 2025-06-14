const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "database.sqlite");
const db = new sqlite3.Database(dbPath);

db.run(`CREATE TABLE IF NOT EXISTS foodsList (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    foodName TEXT,
    foodQuantity INTEGER
)`);

module.exports = (io) => {
    const router = express.Router();

    router.use(express.json());

    // Page HTML
    router.get("/", (req, res) => {
        res.sendFile(path.join(__dirname, "public", "index.html"));
    });

    // Ajouter un aliment
    router.post("/api/addFood", (req, res) => {
        const { foodName, foodQuantity } = req.body;
        console.log(`Adding food: ${foodName} (${foodQuantity})`);

        if (!foodName || !foodQuantity) {
            return res
                .status(400)
                .json({ error: "Food name and quantity are required." });
        }

        const query = `INSERT INTO foodsList (foodName, foodQuantity) VALUES (?, ?)`;
        db.run(query, [foodName, foodQuantity], function (err) {
            if (err) {
                return res
                    .status(500)
                    .json({ error: "Failed to add food item." });
            }
            const newItem = {
                id: this.lastID,
                foodName,
                foodQuantity,
            };
            res.status(201).json(newItem);
            io.emit("foodAdded", newItem); // WebSocket event
        });
    });

    // Lister les aliments
    router.get("/api/foods", (req, res) => {
        db.all(`SELECT * FROM foodsList`, [], (err, rows) => {
            if (err) {
                return res
                    .status(500)
                    .json({ error: "Failed to retrieve food items." });
            }
            res.json(rows);
        });
    });

    // Supprimer un aliment
    router.delete("/api/deleteFood/:id", (req, res) => {
        const foodId = req.params.id;
        console.log(`Deleting food with ID: ${foodId}`);

        const query = `DELETE FROM foodsList WHERE id = ?`;
        db.run(query, [foodId], function (err) {
            if (err) {
                return res
                    .status(500)
                    .json({ error: "Failed to delete food item." });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: "Food item not found." });
            }
            res.status(200).json({
                message: "Food item deleted successfully.",
            });
            io.emit("foodDeleted", foodId); // WebSocket event
        });
    });

    return router;
};
// This code sets up an Express router for the FoodList application.
// It includes routes for adding, listing, and deleting food items,