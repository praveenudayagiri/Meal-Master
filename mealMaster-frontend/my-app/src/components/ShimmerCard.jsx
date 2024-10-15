// ShimmerCard.js
import React from 'react';
import './css/ShimmerCard.css'; // Add this file for shimmer styling

const ShimmerCard = () => {
  return (
    <div className="shimmer-card">
      <div className="shimmer-image"></div>
      <h2 className="shimmer-mealName"></h2>
      <div className="shimmer-horizontal">
        <h2 className="shimmer-preparationTime"></h2>
        <h2 className="shimmer-cuisine"></h2>
        <h2 className="shimmer-isVeg"></h2>
      </div>
    </div>
  );
};

export default ShimmerCard;
