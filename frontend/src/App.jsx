import { useEffect, useState } from "react";

const API_URL = "http://localhost:8000";

function App() {
  // =========================================================
  // STATE VARIABLES
  // =========================================================

  // Stores all restaurants fetched from FastAPI
  const [restaurants, setRestaurants] = useState([]);

  // Stores the restaurant currently selected by the user
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  // Stores menu items for the selected restaurant
  const [menuItems, setMenuItems] = useState([]);

  // Stores the current cart ID
  const [cartId, setCartId] = useState(null);

  // Stores the current cart data
  const [cart, setCart] = useState(null);

  // Stores the currently displayed order
  const [order, setOrder] = useState(null);

  // Stores all previous orders
  const [orders, setOrders] = useState([]);

  // Controls whether the order history screen is visible
  const [showOrders, setShowOrders] = useState(false);

  // =========================================================
  // LOADING STATES
  // =========================================================

  // Loading state for restaurants
  const [loading, setLoading] = useState(true);

  // Loading state for menu items
  const [menuLoading, setMenuLoading] = useState(false);

  // Loading state for cart
  const [cartLoading, setCartLoading] = useState(false);

  // Loading state while placing an order
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Loading state while fetching a single order
  const [orderLoading, setOrderLoading] = useState(false);

  // Loading state while fetching order history
  const [ordersLoading, setOrdersLoading] = useState(false);

  // =========================================================
  // MESSAGE AND ERROR STATES
  // =========================================================

  // Stores success/information messages
  const [message, setMessage] = useState("");

  // Stores error messages
  const [error, setError] = useState("");

  // =========================================================
  // FETCH RESTAURANTS
  // =========================================================

  // Fetches restaurants when the application starts
  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Fetches all active restaurants from FastAPI
  const fetchRestaurants = () => {
    fetch(`${API_URL}/restaurants/`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch restaurants");
        }

        return response.json();
      })
      .then((data) => {
        setRestaurants(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);

        setError("Unable to load restaurants");
        setLoading(false);
      });
  };

  // =========================================================
  // VIEW RESTAURANT MENU
  // =========================================================

  // Selects a restaurant and loads its menu
  const viewMenu = (restaurant) => {
    setSelectedRestaurant(restaurant);

    setMenuLoading(true);

    setMenuItems([]);

    setCart(null);

    setOrder(null);

    setShowOrders(false);

    setMessage("");

    setError("");

    fetch(`${API_URL}/restaurants/${restaurant.id}/menu-items/`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch menu");
        }

        return response.json();
      })
      .then((data) => {
        setMenuItems(data);
        setMenuLoading(false);
      })
      .catch((error) => {
        console.error(error);

        setError("Unable to load menu");
        setMenuLoading(false);
      });
  };

  // =========================================================
  // CREATE CART
  // =========================================================

  // Creates a new cart through FastAPI
  const createCart = () => {
    return fetch(`${API_URL}/carts/`, {
      method: "POST",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to create cart");
        }

        return response.json();
      })
      .then((data) => {
        setCartId(data.id);

        return data.id;
      });
  };

  // =========================================================
  // ADD ITEM TO CART
  // =========================================================

  // Adds one quantity of a menu item to the cart
  const addToCart = (menuItem) => {
    setMessage("");

    setError("");

    // Sends the request to add an item to the specified cart
    const addItem = (id) => {
      return fetch(`${API_URL}/carts/${id}/items/`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          menu_item_id: menuItem.id,
          quantity: 1,
        }),
      });
    };

    // Create a cart if one doesn't already exist
    if (!cartId) {
      createCart()
        .then((id) => addItem(id))
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to add item to cart");
          }

          return response.json();
        })
        .then(() => {
          setMessage(`${menuItem.name} added to cart`);
        })
        .catch((error) => {
          console.error(error);

          setError("Unable to add item to cart");
        });
    } else {
      // Add the item to the existing cart
      addItem(cartId)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to add item to cart");
          }

          return response.json();
        })
        .then(() => {
          setMessage(`${menuItem.name} added to cart`);
        })
        .catch((error) => {
          console.error(error);

          setError("Unable to add item to cart");
        });
    }
  };

  // =========================================================
  // VIEW CART
  // =========================================================

  // Fetches the current cart from FastAPI
  const viewCart = () => {
    if (!cartId) {
      setMessage("Your cart is empty");
      return;
    }

    setCartLoading(true);

    setMessage("");

    setError("");

    setShowOrders(false);

    fetch(`${API_URL}/carts/${cartId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch cart");
        }

        return response.json();
      })
      .then((data) => {
        setCart(data);

        setCartLoading(false);
      })
      .catch((error) => {
        console.error(error);

        setError("Unable to load cart");

        setCartLoading(false);
      });
  };

  // =========================================================
  // UPDATE CART ITEM QUANTITY
  // =========================================================

  // Updates the quantity of an item in the cart
  const updateCartItem = (cartItemId, quantity) => {
    setMessage("");

    setError("");

    fetch(
      `${API_URL}/carts/${cartId}/items/${cartItemId}?quantity=${quantity}`,
      {
        method: "PUT",
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update cart");
        }

        return response.json();
      })
      .then(() => {
        // Refresh the cart after changing quantity
        viewCart();
      })
      .catch((error) => {
        console.error(error);

        setError("Unable to update cart");
      });
  };

  // =========================================================
  // REMOVE ITEM FROM CART
  // =========================================================

  // Removes an item completely from the cart
  const removeCartItem = (cartItemId) => {
    setMessage("");

    setError("");

    fetch(`${API_URL}/carts/${cartId}/items/${cartItemId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to remove item");
        }

        return response.json();
      })
      .then(() => {
        // Refresh the cart after removing the item
        viewCart();
      })
      .catch((error) => {
        console.error(error);

        setError("Unable to remove item");
      });
  };

  // =========================================================
  // CHECKOUT / PLACE ORDER
  // =========================================================

  // Sends the cart to FastAPI and creates an order
  const checkout = () => {
    if (!cartId) {
      setError("Cart not found");
      return;
    }

    if (!cart || cart.items.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setCheckoutLoading(true);

    setMessage("");

    setError("");

    fetch(`${API_URL}/carts/${cartId}/checkout/`, {
      method: "POST",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Checkout failed");
        }

        return response.json();
      })
      .then((data) => {
        setMessage("Order placed successfully!");

        // Fetch complete details of the newly created order
        fetchOrder(data.order_id);
      })
      .catch((error) => {
        console.error(error);

        setError("Unable to place order");

        setCheckoutLoading(false);
      });
  };

  // =========================================================
  // FETCH SINGLE ORDER
  // =========================================================

  // Fetches complete details for one order
  const fetchOrder = (orderId) => {
    setOrderLoading(true);

    fetch(`${API_URL}/orders/${orderId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch order");
        }

        return response.json();
      })
      .then((data) => {
        setOrder(data);

        setCart(null);

        setSelectedRestaurant(null);

        setShowOrders(false);

        setOrderLoading(false);

        setCheckoutLoading(false);
      })
      .catch((error) => {
        console.error(error);

        setError("Unable to load order");

        setOrderLoading(false);

        setCheckoutLoading(false);
      });
  };

  // =========================================================
  // FETCH ORDER HISTORY
  // =========================================================

  // Fetches all previous orders from FastAPI
  const fetchOrders = () => {
    setOrdersLoading(true);

    setShowOrders(true);

    // Hide other screens
    setCart(null);

    setOrder(null);

    setSelectedRestaurant(null);

    setMessage("");

    setError("");

    fetch(`${API_URL}/orders/`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        return response.json();
      })
      .then((data) => {
        setOrders(data);

        setOrdersLoading(false);
      })
      .catch((error) => {
        console.error(error);

        setError("Unable to load orders");

        setOrdersLoading(false);
      });
  };

  // =========================================================
  // UPDATE ORDER STATUS
  // =========================================================

  // Updates the status of an order through FastAPI
  const updateOrderStatus = (orderId, newStatus) => {
    setMessage("");

    setError("");

    fetch(
      `${API_URL}/orders/${orderId}/status?status=${newStatus}`,
      {
        method: "PUT",
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update order status");
        }

        return response.json();
      })
      .then((data) => {
        setMessage(
          `Order #${orderId} status updated to ${data.status}`
        );

        // Refresh the order history so the new status appears
        fetchOrders();
      })
      .catch((error) => {
        console.error(error);

        setError("Unable to update order status");
      });
  };

  // =========================================================
  // CONTINUE SHOPPING
  // =========================================================

  // Returns the user to the restaurant list
  const continueShopping = () => {
    setOrder(null);

    setCart(null);

    setSelectedRestaurant(null);

    setShowOrders(false);

    setMessage("");

    setError("");
  };

  // =========================================================
  // BACK TO RESTAURANTS
  // =========================================================

  // Returns from menu to the restaurant list
  const backToRestaurants = () => {
    setSelectedRestaurant(null);

    setMenuItems([]);

    setMessage("");

    setError("");
  };

  // =========================================================
  // BACK FROM ORDER HISTORY
  // =========================================================

  // Closes order history and returns to restaurants
  const backFromOrders = () => {
    setShowOrders(false);

    setMessage("");

    setError("");
  };

  // =========================================================
  // INITIAL LOADING SCREEN
  // =========================================================

  if (loading) {
    return <h2>Loading restaurants...</h2>;
  }

  // =========================================================
  // MAIN APPLICATION UI
  // =========================================================

  return (
    <div>
      <h1>Food Ordering Platform</h1>

      {/* =====================================================
          TOP NAVIGATION
      ===================================================== */}

      {!order && !showOrders && (
        <>
          <button onClick={viewCart}>
            🛒 View Cart
          </button>

          <button
            onClick={fetchOrders}
            style={{ marginLeft: "10px" }}
          >
            📦 My Orders
          </button>

          <br />
          <br />
        </>
      )}

      {/* =====================================================
          SUCCESS MESSAGE
      ===================================================== */}

      {message && (
        <p>
          <strong>{message}</strong>
        </p>
      )}

      {/* =====================================================
          ERROR MESSAGE
      ===================================================== */}

      {error && (
        <p>
          <strong>{error}</strong>
        </p>
      )}

      {/* =====================================================
          RESTAURANTS
      ===================================================== */}

      {!selectedRestaurant &&
        !cart &&
        !order &&
        !showOrders && (
          <>
            <h2>Restaurants</h2>

            {restaurants.length === 0 ? (
              <p>No restaurants found.</p>
            ) : (
              restaurants.map((restaurant) => (
                <div key={restaurant.id}>
                  <h3>{restaurant.name}</h3>

                  <p>{restaurant.description}</p>

                  <p>
                    Location: {restaurant.location}
                  </p>

                  <button
                    onClick={() =>
                      viewMenu(restaurant)
                    }
                  >
                    View Menu
                  </button>

                  <hr />
                </div>
              ))
            )}
          </>
        )}

      {/* =====================================================
          MENU
      ===================================================== */}

      {selectedRestaurant && !cart && !order && (
        <>
          <button onClick={backToRestaurants}>
            ← Back to Restaurants
          </button>

          <h2>{selectedRestaurant.name}</h2>

          <p>
            {selectedRestaurant.description}
          </p>

          <p>
            Location: {selectedRestaurant.location}
          </p>

          <h2>Menu</h2>

          {menuLoading ? (
            <p>Loading menu...</p>
          ) : menuItems.length === 0 ? (
            <p>No menu items available.</p>
          ) : (
            menuItems.map((item) => (
              <div key={item.id}>
                <h3>{item.name}</h3>

                <p>{item.description}</p>

                <p>
                  Price: ₹{item.price}
                </p>

                <button
                  onClick={() => addToCart(item)}
                >
                  Add to Cart
                </button>

                <hr />
              </div>
            ))
          )}
        </>
      )}

      {/* =====================================================
          CART
      ===================================================== */}

      {cart && !order && (
        <>
          <button onClick={continueShopping}>
            ← Continue Shopping
          </button>

          <h2>Your Cart</h2>

          {cartLoading ? (
            <p>Loading cart...</p>
          ) : cart.items.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <>
              {cart.items.map((item) => (
                <div key={item.id}>
                  <h3>{item.name}</h3>

                  <p>
                    Price: ₹{item.price}
                  </p>

                  {/* QUANTITY CONTROLS */}

                  <div>
                    <button
                      onClick={() =>
                        updateCartItem(
                          item.id,
                          item.quantity - 1
                        )
                      }
                    >
                      -
                    </button>

                    <span
                      style={{
                        margin: "0 15px",
                      }}
                    >
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        updateCartItem(
                          item.id,
                          item.quantity + 1
                        )
                      }
                    >
                      +
                    </button>
                  </div>

                  <p>
                    Item Total: ₹{item.item_total}
                  </p>

                  {/* REMOVE ITEM */}

                  <button
                    onClick={() =>
                      removeCartItem(item.id)
                    }
                  >
                    Remove
                  </button>

                  <hr />
                </div>
              ))}

              {/* CART TOTAL */}

              <h2>
                Total: ₹{cart.total}
              </h2>

              {/* CHECKOUT */}

              <button
                onClick={checkout}
                disabled={checkoutLoading}
              >
                {checkoutLoading
                  ? "Placing Order..."
                  : "Checkout"}
              </button>
            </>
          )}

          <br />
          <br />

          <button onClick={continueShopping}>
            Continue Shopping
          </button>
        </>
      )}

      {/* =====================================================
          ORDER HISTORY
      ===================================================== */}

      {showOrders && !order && (
        <>
          <h2>📦 My Orders</h2>

          {ordersLoading ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p>You have no orders yet.</p>
          ) : (
            orders.map((order) => (
              <div key={order.order_id}>
                {/* ORDER NUMBER */}

                <h3>
                  Order #{order.order_id}
                </h3>

                {/* CURRENT STATUS */}

                <p>
                  <strong>Status:</strong>{" "}
                  {order.status}
                </p>

                {/* =================================================
                    ORDER STATUS CONTROLS
                ================================================= */}

                <p>
                  <strong>Update Status:</strong>
                </p>

                <button
                  onClick={() =>
                    updateOrderStatus(
                      order.order_id,
                      "placed"
                    )
                  }
                >
                  Placed
                </button>

                <button
                  onClick={() =>
                    updateOrderStatus(
                      order.order_id,
                      "confirmed"
                    )
                  }
                  style={{ marginLeft: "5px" }}
                >
                  Confirmed
                </button>

                <button
                  onClick={() =>
                    updateOrderStatus(
                      order.order_id,
                      "preparing"
                    )
                  }
                  style={{ marginLeft: "5px" }}
                >
                  Preparing
                </button>

                <button
                  onClick={() =>
                    updateOrderStatus(
                      order.order_id,
                      "out_for_delivery"
                    )
                  }
                  style={{ marginLeft: "5px" }}
                >
                  Out for Delivery
                </button>

                <button
                  onClick={() =>
                    updateOrderStatus(
                      order.order_id,
                      "delivered"
                    )
                  }
                  style={{ marginLeft: "5px" }}
                >
                  Delivered
                </button>

                {/* ORDER ITEMS */}

                <h4>Order Items</h4>

                {order.items.map((item) => (
                  <div key={item.id}>
                    <p>
                      <strong>{item.name}</strong>
                    </p>

                    <p>
                      Price: ₹{item.price}
                    </p>

                    <p>
                      Quantity: {item.quantity}
                    </p>

                    <p>
                      Item Total: ₹{item.item_total}
                    </p>
                  </div>
                ))}

                {/* ORDER TOTAL */}

                <h3>
                  Total: ₹{order.total_amount}
                </h3>

                <hr />
              </div>
            ))
          )}

          {/* BACK BUTTON */}

          <button onClick={backFromOrders}>
            ← Back to Restaurants
          </button>
        </>
      )}

      {/* =====================================================
          ORDER CONFIRMATION
      ===================================================== */}

      {order && (
        <>
          {orderLoading ? (
            <h2>Loading order...</h2>
          ) : (
            <>
              <h2>
                🎉 Order Placed Successfully!
              </h2>

              <hr />

              {/* ORDER NUMBER */}

              <h3>
                Order #{order.order_id}
              </h3>

              {/* ORDER STATUS */}

              <p>
                <strong>Status:</strong>{" "}
                {order.status}
              </p>

              {/* ORDER ITEMS */}

              <h3>Order Items</h3>

              {order.items.map((item) => (
                <div key={item.id}>
                  <p>
                    <strong>{item.name}</strong>
                  </p>

                  <p>
                    Price: ₹{item.price}
                  </p>

                  <p>
                    Quantity: {item.quantity}
                  </p>

                  <p>
                    Item Total: ₹{item.item_total}
                  </p>

                  <hr />
                </div>
              ))}

              {/* ORDER TOTAL */}

              <h2>
                Total: ₹{order.total_amount}
              </h2>

              <p>
                Order Status:{" "}
                <strong>{order.status}</strong>
              </p>

              <br />

              {/* CONTINUE SHOPPING */}

              <button onClick={continueShopping}>
                Continue Shopping
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;