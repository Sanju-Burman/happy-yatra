const express = require("express");
const router = express.Router();
// const { reccom } = require("../controllers/recom.controller");
const { getDestinations, getDestinationById } = require("../controllers/destinations.controller");

// router.post("/", reccom);
router.get("/", getDestinations);
router.get("/:id", getDestinationById);
module.exports = router;