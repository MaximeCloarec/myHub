const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.send("Welcome to the Food List App!");
});

module.exports = router;