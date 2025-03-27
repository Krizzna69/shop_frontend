/**
 * Synchronizes a user's cart with the backend
 * @param {Array} cartItems - The cart items to sync
 * @param {string} token - The user's auth token
 * @returns {Promise} - The synced cart from the backend
 */
export const syncCartWithBackend = async (cartItems, token) => {
    try {
      // Clear the current cart on the backend
      await fetch('http://localhost:5000/api/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });
      
      // Add each item to the cart
      for (const item of cartItems) {
        await fetch('http://localhost:5000/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify({
            productId: item._id,
            quantity: item.quantity
          })
        });
      }
      
      // Get the updated cart
      const response = await fetch('http://localhost:5000/api/cart', {
        headers: {
          'x-auth-token': token
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync cart with backend');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error syncing cart with backend:', error);
      throw error;
    }
  };