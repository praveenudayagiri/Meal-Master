import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import './css/Home.css'; // Import the CSS file for styling

const LikedMeals = () => {
    const [likedMeals, setLikedMeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Access user data from the Redux store
    const userData = useSelector((store) => store.user);

    useEffect(() => {
        if (!userData || !userData.gmail || !userData.likedMeals || userData.likedMeals.length === 0) {
            setLoading(false); // Stop loading if user is not logged in or has no liked meals
            return; // Exit early if the user is not logged in or has no liked meals
        }

        const fetchLikedMeals = async () => {
            try {
                const response = await axios.post('http://localhost:3333/getmeals', {
                    mealIds: userData.likedMeals, // Sending liked meal IDs from userData
                });
                setLikedMeals(response.data); // Assuming the backend returns the meal details
            } catch (err) {
                setError('Failed to fetch liked meals.');
            } finally {
                setLoading(false); // Stop loading when done
            }
        };

        fetchLikedMeals();
    }, [userData]);

    // Function to clear liked meals
    const handleClearLikedMeals = async () => {
        try {
            console.log(userData.gmail);
            const response = await axios.post('http://localhost:3333/clearUserLiked', { gmail: userData.gmail });
            
            setLikedMeals([]); // Clear the local state
            console.log(response.data.message); // Optionally log success message
        } catch (err) {
            console.error('Error clearing liked meals:', err);
        }
    };

    // If the user is not logged in
    if (!userData || !userData.gmail) {
        return <div>Please log in to see your liked meals.</div>;
    }

    // If still loading
    if (loading) {
        return <div>Loading your liked meals...</div>;
    }

    // If there was an error fetching data
    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h1 className="liked_meals_heading">Your Liked Meals</h1>

            {/* Clear Liked Meals Button */}
            <button onClick={handleClearLikedMeals} className="clear_liked_meals_btn">
                Clear Liked Meals
            </button>

            {likedMeals && likedMeals.length > 0 ? (
                <main>
                    {likedMeals.map((meal) => (
                        <Link key={meal._id} to={"/meals/" + meal._id}>  {/* Link to meal details page */}
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
                        </Link>
                    ))}
                </main>
            ) : (
                <p>No liked meals found.</p> // Message if no liked meals
            )}
        </div>
    );
};

export default LikedMeals;
