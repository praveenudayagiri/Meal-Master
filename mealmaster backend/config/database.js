const mongoose = require('mongoose');
const express = require("express");
const app = express();
const connectDB = async () => {
await mongoose.connect("mongodb://localhost:27017/mealmaster");
    
};
module.exports = connectDB;


