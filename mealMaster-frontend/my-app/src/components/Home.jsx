import React, { useEffect, useState } from 'react';
import './css/Home.css';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';
import { Link } from 'react-router-dom';
import ShimmerCard from './ShimmerCard'; // Import the ShimmerCard
import { GoogleGenerativeAI } from "@google/generative-ai"; // Import Google Generative AI

const MealCard = ({ meal }) => {
  return (
    <div className="meal_card">
      <div className="imageUrl">
        <img src={meal.imageUrl} alt="mealPic" />
      </div>
      <h2 className="mealName">{meal.mealName}</h2>
      <div className="horizontal">
        <h2 className="preparationTime">{meal.preparationTime}</h2>
        <h2 className="cuisine">{meal.cuisine}</h2>
        <h2 className="isVeg">
          {meal.isVeg ? '🟢' : '🔴'}
        </h2>
      </div>
    </div>
  );
};

const Home = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ingredients, setIngredients] = useState(''); // State for ingredients input
  const [validationMessage, setValidationMessage] = useState(''); // State for validation message
  const [aiResponse, setAiResponse] = useState(''); // AI response for recipe validation

  // Fetch initial meals when component mounts
  const fetchMeals = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/home`); // Corrected string interpolation
      console.log('Fetched meals:', res.data);
      setMeals(res.data);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to validate ingredients using Google AI
  const checkRecipeWithGoogleAI = async (ingredientsArray) => {
    const genAi = new GoogleGenerativeAI("AIzaSyDfJBywDN6b8K68p92bynyWRCg_pJ-I-9E");
    const model = genAi.getGenerativeModel({
      "model": "gemini-1.5-flash",
    });

    const ingredientList = ingredientsArray.join(', ');
    const prompt = `Tell me whether a safe recipe can be made with the following ingredients and doesn't cause any harm to human health: ${ingredientList}. Answer me with yes or no only.`;

    try {
      const response = await model.generateContent(prompt);
      console.log('AI Response:', response.response.text());
      return response.response.text().trim().toLowerCase(); // Return the AI's response
    } catch (error) {
      console.error('Error checking recipe with Google AI:', error);
      return 'no'; // Default to 'no' if there's an error
    }
  };

  // Function to search meals based on ingredients
  const handleSearch = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setLoading(true); // Set loading to true before fetching new data
    setValidationMessage(''); // Clear previous validation messages

    const ingredientsArray = ingredients.split(',').map(ingredient => ingredient.trim()); // Split and trim ingredients

    // Check if a recipe can be made with the provided ingredients
    const aiResponse = await checkRecipeWithGoogleAI(ingredientsArray);
    const aiResponseLower = aiResponse.toLowerCase();
    setAiResponse(aiResponseLower); // Store the AI response
    setValidationMessage(`A recipe can${aiResponseLower === 'yes' ? '' : 'not'} be made with the provided ingredients.`);

    // Fetch meals based on ingredients regardless of AI response
    try {
      console.log(ingredientsArray);
      const res = await axios.post(`${BASE_URL}/items`, { ingredients: ingredientsArray }); // Corrected string interpolation
      console.log('Fetched meals based on ingredients:', res.data);
      setMeals(res.data); // Set the meals based on the response
    } catch (error) {
      console.error('Error fetching meals based on ingredients:', error);
      setMeals([]); // Clear meals if there's an error
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  useEffect(() => {
    fetchMeals(); // Fetch initial meals
  }, []);

  return (
    <>
      <form onSubmit={handleSearch}> {/* Form to capture ingredient input */}
        <input
          id="ingredient_box"
          type="text"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)} // Update state on change
          placeholder="Enter ingredients (comma-separated)"
        />
        <button className="button" type="submit">Search</button> {/* Button to trigger search */}
      </form>

      {validationMessage && (
        <h3 className={`validation-message ${aiResponse === 'yes' ? 'yes' : 'no'}`}>
          {validationMessage}
        </h3>
      )}

      <main>
        {loading ? (
          // Show shimmer cards while loading
          <>
            {[...Array(16)].map((_, index) => (
              <ShimmerCard key={index} />
            ))}
          </>
        ) : (
          meals.length > 0 ? ( // Check if there are meals to display
            meals.map((meal) => (
              <Link key={meal._id} to={"/meals/" + meal._id}>
                <MealCard meal={meal} />
              </Link>
            ))
          ) : (
            <h2>No meals found for the provided ingredients.</h2> // Message if no meals are found
          )
        )}
      </main>
    </>
  );
};

export default Home;
