require("dotenv").config();
const axios = require("axios");
const express = require("express");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const app = express();

//! cors
app.use(
  cors({
    origin: "http://localhost:5173", // Allow only your frontend's origin
    methods: ["GET", "POST"], // Specify allowed HTTP methods
    credentials: true, // Allow cookies if needed
  })
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, //! 15 minutes
  max: 100, //! Max 100 requests per 15 minutes
  message: "Too many requests from this IP, please try again later.",
});

// !middleware
app.use(express.json());
app.use(apiLimiter);
app.use(express.urlencoded({ extended: true }));

//! Conversion
const API_URL = "https://v6.exchangerate-api.com/v6/";
const API_KEY = process.env.API_KEY;

app.post("/api/convert", async (req, res) => {
  try {
    const { from, to, amount } = req.body;
    const url = `${API_URL}/${API_KEY}/pair/${from}/${to}/${amount}`;
    const response = await axios.get(url);
    if (response.data && response.data.result === "success") {
      res.json({
        base: from,
        target: to,
        conversionRate: response.data.conversion_rate,
        convertedAmount: response.data.conversion_result,
      });
    } else {
      res.json({
        message: "Error Converting currency",
        details: response.data,
      });
    }
  } catch (error) {
    res.json({
      message: "Error Converting currency",
      details: error.message,
    });
  }
});
const port = process.env.PORT || 5000;

app.listen(port, "0.0.0.0", () => {
  console.log(`server running on port ${port}`);
});
