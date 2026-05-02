const express = require("express");
const router = express.Router();
const { getDestinations, getDestinationById } = require("../controllers/destinations.controller");
const { query, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });
  next();
};

router.get("/", 
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('trending').optional().isBoolean(),
  handleValidation,
  getDestinations
);

router.get("/:id", getDestinationById);

module.exports = router;