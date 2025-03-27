import React, { useState } from 'react';
import { FaShoppingCart, FaCheck } from 'react-icons/fa';
import '../styles/AddToCartButton.css';

const AddToCartButton = ({ product, onAddToCart, disabled = false }) => {
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    onAddToCart(product);
    
    // Show success animation
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button 
      className={`add-to-cart-btn ${added ? 'added' : ''}`}
      onClick={handleAddToCart}
      disabled={disabled || added}
    >
      {added ? (
        <>
          <FaCheck className="btn-icon" /> Added!
        </>
      ) : (
        <>
          <FaShoppingCart className="btn-icon" /> Add to Cart
        </>
      )}
    </button>
  );
};

export default AddToCartButton;