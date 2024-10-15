import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import './css/Chat.css'; // Ensure this CSS file is linked

const genAi = new GoogleGenerativeAI("AIzaSyDfJBywDN6b8K68p92bynyWRCg_pJ-I-9E");
const model = genAi.getGenerativeModel({
  "model": "gemini-1.5-flash",
});

const Chat = () => {
  const [ingredients, setIngredients] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!ingredients.trim()) return; // Prevent sending empty messages

    const userMessage = {
      type: 'user',
      text: ingredients,
    };

    setMessages((prev) => [...prev, userMessage]); // Add user message to chat
    setIngredients(''); // Clear input
    setLoading(true); // Set loading state

    // Create the prompt for AI
    const prompt = `Suggest recipes that can be made with the following ingredients: ${ingredients}. Please include ingredients and preparation steps.`;

    try {
      const response = await model.generateContent(prompt);
      const aiMessage = {
        type: 'ai',
        text: response.response.text().trim(),
      };

      setMessages((prev) => [...prev, aiMessage]); // Add AI response to chat
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage = {
        type: 'ai',
        text: 'Sorry, I could not process your request. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.type}`}>
            {msg.type === 'ai' ? (
              <div className="recipe">
                {/* Use dangerouslySetInnerHTML for safe HTML rendering */}
                <div dangerouslySetInnerHTML={{ __html: formatRecipe(msg.text) }} />
              </div>
            ) : (
              msg.text
            )}
          </div>
        ))}
        {loading && <div className="chat-message ai">Loading...</div>} {/* Loading indicator */}
      </div>

      <div className="input-container">
        <input
          type="text"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="Enter ingredients (comma-separated)"
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

// Function to format the recipe into HTML
const formatRecipe = (recipeText) => {
  const recipes = recipeText.split('**'); // Split by recipe details
  let formattedRecipes = '';

  for (let i = 1; i < recipes.length; i += 2) {
    const title = recipes[i].trim(); // Recipe title
    const details = recipes[i + 1].trim(); // Recipe details

    // Structure for each recipe
    formattedRecipes += `
      <h3>${title}</h3>
      <div class="ingredients"><strong>Ingredients:</strong> ${details.split('*')[0]}</div>
      <div class="preparation"><strong>Preparation:</strong> ${details.split('*')[1]}</div>
    `;
  }
  return formattedRecipes;
};

export default Chat;
