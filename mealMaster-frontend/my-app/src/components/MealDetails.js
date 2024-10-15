// MealDetails.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { BASE_URL } from '../utils/constants';
import { addUser } from '../utils/userSlice';
import './css/MealDetails.css'; // Import your CSS file for styles

const MealDetails = () => {
    const { mealId } = useParams(); // Retrieve mealId from the URL
    const [meal, setMeal] = useState(null); // State to hold meal data
    const [loading, setLoading] = useState(true); // State to handle loading status
    const [error, setError] = useState(null); // State to handle errors
    const userData = useSelector((store) => store.user); // Get user data from Redux store
    const dispatch = useDispatch(); // Initialize dispatch

    useEffect(() => {
        const fetchMealDetails = async () => {
            try {
                // Make POST request to fetch meal details
                const response = await axios.post(`http://localhost:3333/${mealId}`);
                setMeal(response.data); // Set the meal data in state
                setLoading(false); // Set loading to false
            } catch (err) {
                setError(err.message); // Set error message if there is an error
                setLoading(false); // Set loading to false
            }
        };

        fetchMealDetails(); // Call the function to fetch meal details
    }, [mealId]); // Re-run effect when mealId changes

    const handleLike = async () => {
        if (!userData.gmail) {
            alert('Please log in to like this meal.'); // Prompt user to log in if not authenticated
            return;
        }

        try {
            const likedMeals = [...userData.likedMeals, mealId]; // Add the current mealId to likedMeals
            const response = await axios.patch(`${BASE_URL}/updateliked`, {
                gmail: userData.gmail,
                likedMeals,
            });

            // Dispatch the updated user data to the Redux store if necessary
            dispatch(addUser(response.data)); // Assuming the response includes updated user data

            alert('Meal liked successfully!'); // Feedback to the user
        } catch (error) {
            console.error('Error liking the meal:', error);
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>; // Display loading message while fetching
    }

    if (error) {
        return <div className="error">Error: {error}</div>; // Display error message if error occurs
    }

    if (!meal) {
        return <div>No meal found.</div>; // Display message if no meal is found
    }

    // Render the meal details
    return (
        <div className="meal-details">
            <div className="meal-header">
                <h1 className="meal-name">{meal.mealName}</h1> {/* Assuming meal object has a 'mealName' property */}
                <img className="meal-image" src={meal.imageUrl} alt={meal.mealName} /> {/* Image of the meal */}
            </div>
            <div className="meal-info">
                <h2>Description</h2>
                <p>{meal.description || "Delicious meal prepared with love!"}</p> {/* Default description */}
                <h3>Cuisine: {meal.cuisine}</h3>
                <h3>Meal Type: {meal.mealType}</h3>
                <h3>Preparation Time: {meal.preparationTime}</h3>
                <h3>Servings: {meal.servings}</h3>
                <h3>Calories: {meal.calories}</h3>
                <h3>Source: {meal.source}</h3>
                <h4>Ingredients:</h4>
                <ul>
                    {meal.ingredients.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                    ))}
                </ul>
                <h4>Instructions:</h4>
                <ol>
                    {meal.instructions.map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                    ))}
                </ol>
                <a className="youtube-link" href={meal.youtubeLink} target="_blank" rel="noopener noreferrer">Watch on YouTube</a>
            </div>
            <button className="like-button" onClick={handleLike}>👍 Like</button> {/* Button to trigger the like function */}
        </div>
    );
};

export default MealDetails;
