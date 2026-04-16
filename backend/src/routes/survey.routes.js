const express = require("express");
const router = express.Router();
const { submitSurvey, getSurvey } = require("../controllers/survey.controller");
const { verifyToken } = require('../middlewares/Auth.middleware');
const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  next();
};

router.post("/",
  verifyToken,
  body('travelStyle').notEmpty().trim(),
  body('budget').isNumeric(),
  body('interests').isArray({ min: 1 }),
  body('activities').isArray(),
  handleValidation,
  submitSurvey
);
router.get("/", verifyToken, getSurvey);

module.exports = router;
