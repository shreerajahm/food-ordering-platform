import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cartId, setCartId] = useState(null);
  const [cart, setCart] = useState(null);
  const [order, setOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [showOrders, setShowOrders] = useState(false);

  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("food-ordering-theme") === "dark";
  });

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("food-ordering-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = () => {
    fetch(`${API_URL}/restaurants/`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch restaurants");
        return response.json();
      })
      .then((data) => {
        setRestaurants(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load restaurants");
        setLoading(false);
      });
  };

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
        if (!response.ok) throw new Error("Failed to fetch menu");
        return response.json();
      })
      .then((data) => {
        setMenuItems(data);
        setMenuLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load menu");
        setMenuLoading(false);
      });
  };

  const createCart = () => {
    return fetch(`${API_URL}/carts/`, { method: "POST" })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to create cart");
        return response.json();
      })
      .then((data) => {
        setCartId(data.id);
        return data.id;
      });
  };

  const addToCart = (menuItem) => {
    setMessage("");
    setError("");

    const addItem = (id) =>
      fetch(`${API_URL}/carts/${id}/items/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menu_item_id: menuItem.id, quantity: 1 }),
      });

    (cartId ? Promise.resolve(cartId) : createCart())
      .then((id) => addItem(id))
      .then((response) => {
        if (!response.ok) throw new Error("Failed to add item");
        return response.json();
      })
      .then(() => setMessage(`${menuItem.name} added to cart`))
      .catch((err) => {
        console.error(err);
        setError("Unable to add item to cart");
      });
  };

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
        if (!response.ok) throw new Error("Failed to fetch cart");
        return response.json();
      })
      .then((data) => {
        setCart(data);
        setCartLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load cart");
        setCartLoading(false);
      });
  };

  const updateCartItem = (cartItemId, quantity) => {
    if (quantity < 1) {
      removeCartItem(cartItemId);
      return;
    }

    setMessage("");
    setError("");

    fetch(`${API_URL}/carts/${cartId}/items/${cartItemId}?quantity=${quantity}`, {
      method: "PUT",
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to update cart");
        return response.json();
      })
      .then(() => viewCart())
      .catch((err) => {
        console.error(err);
        setError("Unable to update cart");
      });
  };

  const removeCartItem = (cartItemId) => {
    setMessage("");
    setError("");

    fetch(`${API_URL}/carts/${cartId}/items/${cartItemId}`, { method: "DELETE" })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to remove item");
        return response.json();
      })
      .then(() => viewCart())
      .catch((err) => {
        console.error(err);
        setError("Unable to remove item");
      });
  };

  const checkout = () => {
    if (!cartId) return setError("Cart not found");
    if (!cart || cart.items.length === 0) return setError("Your cart is empty");

    setCheckoutLoading(true);
    setMessage("");
    setError("");

    fetch(`${API_URL}/carts/${cartId}/checkout/`, { method: "POST" })
      .then((response) => {
        if (!response.ok) throw new Error("Checkout failed");
        return response.json();
      })
      .then((data) => {
        setMessage("Order placed successfully!");
        fetchOrder(data.order_id);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to place order");
        setCheckoutLoading(false);
      });
  };

  const fetchOrder = (orderId) => {
    setOrderLoading(true);

    fetch(`${API_URL}/orders/${orderId}`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch order");
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
      .catch((err) => {
        console.error(err);
        setError("Unable to load order");
        setOrderLoading(false);
        setCheckoutLoading(false);
      });
  };

  const fetchOrders = () => {
    setOrdersLoading(true);
    setShowOrders(true);
    setCart(null);
    setOrder(null);
    setSelectedRestaurant(null);
    setMessage("");
    setError("");

    fetch(`${API_URL}/orders/`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch orders");
        return response.json();
      })
      .then((data) => {
        setOrders(data);
        setOrdersLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load orders");
        setOrdersLoading(false);
      });
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setMessage("");
    setError("");

    fetch(`${API_URL}/orders/${orderId}/status?status=${newStatus}`, {
      method: "PUT",
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to update order status");
        return response.json();
      })
      .then((data) => {
        setMessage(`Order #${orderId} status updated to ${data.status}`);
        fetchOrders();
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to update order status");
      });
  };

  const continueShopping = () => {
    setOrder(null);
    setCart(null);
    setSelectedRestaurant(null);
    setShowOrders(false);
    setMessage("");
    setError("");
  };

  const backToRestaurants = () => {
    setSelectedRestaurant(null);
    setMenuItems([]);
    setMessage("");
    setError("");
  };

  const backFromOrders = () => {
    setShowOrders(false);
    setMessage("");
    setError("");
  };

  if (loading) return <div className="loading-screen">Loading restaurants...</div>;

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>🍽️ Food Ordering Platform</h1>
          <p className="subtitle">Order your favorite food</p>
        </div>
        <button className="theme-button" onClick={() => setDarkMode((v) => !v)}>
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </header>

      {!order && !showOrders && (
        <nav className="nav-buttons">
          <button onClick={viewCart}>🛒 View Cart</button>
          <button onClick={fetchOrders}>📦 My Orders</button>
        </nav>
      )}

      {message && <div className="message success">{message}</div>}
      {error && <div className="message error">{error}</div>}

      {!selectedRestaurant && !cart && !order && !showOrders && (
        <section>
          <h2>Restaurants</h2>
          <div className="restaurant-grid">
            {restaurants.map((restaurant) => (
              <article className="card" key={restaurant.id}>
                <div className="card-icon">🍴</div>
                <h3>{restaurant.name}</h3>
                <p>{restaurant.description}</p>
                <p className="location">📍 {restaurant.location}</p>
                <button onClick={() => viewMenu(restaurant)}>View Menu →</button>
              </article>
            ))}
          </div>
        </section>
      )}

      {selectedRestaurant && !cart && !order && (
        <section>
          <button className="secondary-button" onClick={backToRestaurants}>
            ← Back to Restaurants
          </button>
          <h2>{selectedRestaurant.name}</h2>
          <p>{selectedRestaurant.description}</p>
          <p className="location">📍 {selectedRestaurant.location}</p>
          <h2>Menu</h2>

          {menuLoading ? (
            <div className="loading">Loading menu...</div>
          ) : menuItems.length === 0 ? (
            <div className="empty-state">No menu items available.</div>
          ) : (
            <div className="menu-grid">
              {menuItems.map((item) => (
                <article className="card" key={item.id}>
                  <div className="food-icon">🍛</div>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <div className="price">₹{item.price}</div>
                  <button onClick={() => addToCart(item)}>Add to Cart</button>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {cart && !order && (
        <section>
          <button className="secondary-button" onClick={continueShopping}>
            ← Continue Shopping
          </button>
          <h2>Your Cart</h2>

          {cartLoading ? (
            <div className="loading">Loading cart...</div>
          ) : cart.items.length === 0 ? (
            <div className="empty-state">Your cart is empty.</div>
          ) : (
            <div className="cart-container">
              {cart.items.map((item) => (
                <article className="cart-item" key={item.id}>
                  <div>
                    <h3>{item.name}</h3>
                    <p>₹{item.price} each</p>
                    <p>Item Total: <strong>₹{item.item_total}</strong></p>
                  </div>
                  <div className="cart-actions">
                    <div className="quantity-controls">
                      <button onClick={() => updateCartItem(item.id, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateCartItem(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <button className="danger-button" onClick={() => removeCartItem(item.id)}>
                      Remove
                    </button>
                  </div>
                </article>
              ))}
              <div className="cart-total">
                <h2>Total: ₹{cart.total}</h2>
                <button onClick={checkout} disabled={checkoutLoading}>
                  {checkoutLoading ? "Placing Order..." : "Checkout"}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {showOrders && !order && (
        <section>
          <h2>📦 My Orders</h2>
          {ordersLoading ? (
            <div className="loading">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="empty-state">You have no orders yet.</div>
          ) : (
            <div className="orders-list">
              {orders.map((currentOrder) => (
                <article className="card order-card" key={currentOrder.order_id}>
                  <div className="order-header">
                    <h3>Order #{currentOrder.order_id}</h3>
                    <span className="status">{currentOrder.status.replaceAll("_", " ")}</span>
                  </div>
                  <p><strong>Total:</strong> ₹{currentOrder.total_amount}</p>
                  <p><strong>Placed:</strong> {new Date(currentOrder.created_at).toLocaleString()}</p>
                  <h4>Order Items</h4>
                  {currentOrder.items.map((item) => (
                    <div className="order-item" key={item.id}>
                      <span>{item.name} × {item.quantity}</span>
                      <strong>₹{item.item_total}</strong>
                    </div>
                  ))}
                  <div className="status-controls">
                    <p><strong>Update Status:</strong></p>
                    {[
                      ["placed", "Placed"],
                      ["confirmed", "Confirmed"],
                      ["preparing", "Preparing"],
                      ["out_for_delivery", "Out for Delivery"],
                      ["delivered", "Delivered"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        className={currentOrder.status === value ? "active-status" : ""}
                        onClick={() => updateOrderStatus(currentOrder.order_id, value)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
          <button className="secondary-button" onClick={backFromOrders}>
            ← Back to Restaurants
          </button>
        </section>
      )}

      {order && (
        <section className="order-confirmation">
          {orderLoading ? (
            <div className="loading">Loading order...</div>
          ) : (
            <>
              <div className="success-icon">✓</div>
              <h2>🎉 Order Placed Successfully!</h2>
              <div className="confirmation-card">
                <h3>Order #{order.order_id}</h3>
                <p><strong>Status:</strong> <span className="status">{order.status.replaceAll("_", " ")}</span></p>
                <h3>Order Items</h3>
                {order.items.map((item) => (
                  <div className="order-item" key={item.id}>
                    <span>{item.name} × {item.quantity}</span>
                    <strong>₹{item.item_total}</strong>
                  </div>
                ))}
                <div className="confirmation-total">Total: ₹{order.total_amount}</div>
              </div>
              <button onClick={continueShopping}>Continue Shopping</button>
            </>
          )}
        </section>
      )}
    </div>
  );
}

export default App;
