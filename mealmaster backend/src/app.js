const express = require("express");
const connectDB = require("../config/database");
const { MongoClient } = require("mongodb"); 
const url = "mongodb://localhost:27017/mealmaster"; 
const dbName = "mealmaster"; 
let db;
const mongoose = require('mongoose');
const User = require("../config/models/user");
const {validateSignUpData} = require("../utils/validation");
const bcrypt = require('bcrypt');
const cookieParse = require("cookie-parser");
const jwt = require("jsonwebtoken");
const getJWT = require("../config/models/user");
const userAuth = require("../middlewares/userAuth");
const cors = require("cors");
const app = express();
app.use(cors({
  origin: ["http://localhost:3000"],
  credentials:true,
}));
app.use(express.json());
app.use(cookieParse());
app.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);
    const {name, gmail, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      gmail,
      password: hashedPassword,
    });
    await user.save();
    const token = await user.getJWT();
    res.cookie("token", token, { expires: new Date(Date.now() + 8 * 3600000) });
    res.send("Signup is successful...!");
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});


app.post("/login", async(req, res) => {

    try {
      const { gmail, password} = req.body;
      const user = await User.findOne({gmail:gmail});
      if (!user) {
        return res.status(401).send("Invalid email or password");
      }
      const isValidPassword = await user.validatePassword(password);
      if (isValidPassword) {
        const token = await user.getJWT();
        res.cookie("token",token,{expires:new Date(Date.now()+8*3600000),});

        res.send(user);
      }
      else{
        res.status(401).send("Invalid email or password");
      }
    } catch (error) {
        res.status(400).send("Error in getting the user: " + error.message);
    }
});
app.post("/profile", userAuth, async (req, res) => {
  try {
    const userId = req.user.id; // Assuming userAuth middleware attaches the user object to req
    const user = await User.findById(userId).select("-password"); // Exclude password from response

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.status(200).json(user); // Send back the user data
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).send("Server error");
  }
});
MongoClient.connect(url)
    .then(client => {
        db = client.db(dbName);
        console.log("Connected to meals database");
    })
    .catch(err => {
        console.error("Database not connected: " + err.message);
        process.exit(1); // Exit process if the database connection fails
    });


const getMealTypeByTime = () => {
    const currentHour = new Date().getHours();

    if (currentHour >= 3 && currentHour < 11) {
        return "breakfast";
    } else if (currentHour >= 11 && currentHour < 15) {
        return "lunch";
    } else if (currentHour >= 15 && currentHour < 19) {
        return "snack";
    } else {
        return "dinner"; // For times from 7 PM to 3 AM
    }
};


app.post("/home", async (req, res) => {
    try {
        const mealType = getMealTypeByTime();
        const mealsCollection = db.collection("meals");

        // Query the meals collection based on the determined meal type
        const meals = await mealsCollection.find({ mealType: mealType }).toArray();

        res.json(meals);
    } catch (error) {
        res.status(500).send("Error fetching meals: " + error.message);
    }
});

app.get("/liked", userAuth, async (req, res) => {
  const userGmail = req.body.gmail; 

  try {
      const user = await User.findOne({ gmail: userGmail });
      console.log(user);
      if (!user) {
          return res.status(400).send("Gmail not found");
      }

      const userLikedMeals = user.likedMeals; // Get the array of liked meal IDs

      // If no liked meals, return a message
      if (userLikedMeals.length === 0) {
          return res.status(400).send("No liked meals");
      }

      // Fetch the meal documents corresponding to the liked meal IDs
      const mealsCollection = db.collection("meals");
      const likedMealDetails = await mealsCollection.find({ _id: { $in: userLikedMeals.map(id => new ObjectId(id)) } }).toArray();

      res.status(200).json(likedMealDetails); // Send the full meal documents as a response
  } catch (error) {
      console.error("Error retrieving liked meals:", error);
      res.status(500).send("Server error");
  }
});




//const { ObjectId } = require('mongodb'); // Import ObjectId

app.post('/getmeals', async (req, res) => {
    const { mealIds } = req.body; // Expect an array of meal IDs in the request body

    if (!Array.isArray(mealIds) || mealIds.length === 0) {
        return res.status(400).json({ message: 'Please provide an array of meal IDs' });
    }

    try {
        const mealsCollection = db.collection("meals");

        // Convert mealIds to ObjectId and query meals
        const meals = await mealsCollection.find({ 
            _id: { $in: mealIds.map(id => new ObjectId(id)) } 
        }).toArray();

        if (meals.length === 0) {
            return res.status(404).json({ message: 'No meals found for the given IDs' });
        }

        res.status(200).json(meals); // Return the array of meal documents
    } catch (error) {
        console.error("Error fetching meals:", error);
        res.status(500).json({ message: 'Server error' });
    }
});


app.patch('/updateliked', async (req, res) => {
    const { gmail, likedMeals } = req.body; 
    try {
      let user = await User.findOne({ gmail: gmail });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const newLikedMeals = likedMeals.filter(mealId => !user.likedMeals.includes(mealId));
  
      if (newLikedMeals.length > 0) {
        user.likedMeals = [...user.likedMeals, ...newLikedMeals];
        await user.save();
      }
  
      res.status(200).json({ message: 'Liked meals updated successfully', likedMeals: user.likedMeals });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

  app.post("/clearUserLiked", async (req, res) => {
    const { gmail } = req.body;
    console.log(gmail); // Log the received email
  
    try {
      // Find user by their email
      let user = await User.findOne({ gmail: gmail }); // Use findOne instead of find
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' }); // Use 404 status code
      }
  
      // Clear likedMeals array
      user.likedMeals = []; // Clear the likedMeals array
  
      // Save updated user document
      await user.save();
  
      res.status(200).json({ message: 'Liked meals cleared successfully', likedMeals: user.likedMeals });
    } catch (error) {
      console.error('Error clearing liked meals:', error); // Log the error for debugging
      res.status(501).json({ message: 'Server error' });
    }
  });

  app.delete("/deleteLikedMeals", userAuth, async (req, res) => {
    const userGmail = req.body.gmail; // Get the user's email from the request body
    const mealId = req.body.mealId; // Get the meal ID from the request body

    try {
        // Find the user by Gmail
        const user = await User.findOne({ gmail: userGmail });
        if (!user) {
            return res.status(404).send("User not found");
        }

        // Check if the meal ID exists in the likedMeals array
        const likedMeals = user.likedMeals;
        if (!likedMeals.includes(mealId)) {
            return res.status(400).send("Meal not liked");
        }

        // Remove the meal ID from the likedMeals array
        user.likedMeals = likedMeals.filter(id => id !== mealId);

        // Save the updated user document
        await user.save();

        res.status(200).send("Meal removed from liked meals");
    } catch (error) {
        console.error("Error deleting liked meal:", error);
        res.status(500).send("Server error");
    }
});



  const Meal = mongoose.model('meals', new mongoose.Schema({}, { strict: false }));
  app.post('/items', async (req, res) => {
    const { ingredients } = req.body; // Ingredients expected to be an array
  
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ message: 'Please provide a valid list of ingredients' });
    }
  
    try {
      // MongoDB aggregation pipeline to match and rank recipes
      const recipes = await Meal.aggregate([
        {
          // Create a field for matching ingredients only if `ingredients` is an array
          $addFields: {
            matchingCount: {
              $cond: {
                if: { $isArray: '$ingredients' }, // Check if ingredients is an array
                then: {
                  $size: {
                    $filter: {
                      input: '$ingredients',
                      as: 'ingredient',
                      cond: { $in: ['$$ingredient', ingredients] }
                    }
                  }
                },
                else: 0 // If ingredients is not an array, set matchingCount to 0
              }
            }
          }
        },
        {
          // Filter out recipes that have no matching ingredients
          $match: {
            matchingCount: { $gt: 0 }
          }
        },
        {
          // Sort recipes by the number of matching ingredients in descending order
          $sort: { matchingCount: -1 }
        }
      ]);
  
      // Send the ranked recipes as response
      res.status(200).json(recipes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  








const { ObjectId } = require('mongodb'); // Import ObjectId

app.post('/:mealId', async (req, res) => {
    const { mealId } = req.params;

    try {
        const mealsCollection = db.collection("meals");

        // Convert mealId to ObjectId using 'new'
        const meal = await mealsCollection.findOne({ _id: new ObjectId(mealId) });

        if (!meal) {
            return res.status(404).json({ message: 'Meal not found' });
        }

        res.status(200).json(meal);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});









connectDB()
    .then(() => {
        console.log("Connected to database");
        app.listen(3333, () => {
            console.log("Server is running on port 3333");
        });
    })
    .catch(err => {
        console.error("Database not connected: " + err.message);
        process.exit(1); // Exit process if the database connection fails
    });
