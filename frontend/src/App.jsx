import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [page, setPage] = useState("home");

  const [food, setFood] = useState({
    name: "",
    quantity: "",
    expiry: "",
    location: "",
  });

  const [donations, setDonations] = useState([]);

  // Fetch donations from live FastAPI + Supabase
  useEffect(() => {
    fetch("https://food-surplus-locator.onrender.com/donations")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch donations");
        }
        return response.json();
      })
      .then((result) => {
        const data = result.data.map((item) => ({
          id: item.id,
          name: item.food_name,
          quantity: item.quantity,
          expiry: "Available",
          location: item.location,
          status: "Available",
        }));

        setDonations(data);
      })
      .catch((error) => {
        console.error("Error fetching donations:", error);
      });
  }, []);

  const handleChange = (e) => {
    setFood({
      ...food,
      [e.target.name]: e.target.value,
    });
  };

  const addDonation = async (e) => {
    e.preventDefault();

    if (!food.name || !food.quantity || !food.expiry || !food.location) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await fetch(
        "https://food-surplus-locator.onrender.com/donations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            food_name: food.name,
            quantity: food.quantity,
            location: food.location,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save donation");
      }

      const result = await response.json();

      alert("Food surplus added successfully!");

      setFood({
        name: "",
        quantity: "",
        expiry: "",
        location: "",
      });

      // Refresh donations from database
      const donationsResponse = await fetch(
        "https://food-surplus-locator.onrender.com/donations"
      );

      if (!donationsResponse.ok) {
        throw new Error("Failed to fetch updated donations");
      }

      const donationsResult = await donationsResponse.json();

      const data = donationsResult.data.map((item) => ({
        id: item.id,
        name: item.food_name,
        quantity: item.quantity,
        expiry: "Available",
        location: item.location,
        status: "Available",
      }));

      setDonations(data);
      setPage("food");

      console.log("Backend response:", result);
    } catch (error) {
      console.error(error);
      alert("Could not connect to backend.");
    }
  };

  const acceptDonation = async (id) => {
    try {
      const response = await fetch(
        `https://food-surplus-locator.onrender.com/donations/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to accept donation");
      }

      const result = await response.json();

      setDonations(
        donations.map((item) =>
          item.id === id
            ? { ...item, status: "Accepted" }
            : item
        )
      );

      alert("Food donation accepted successfully!");

      console.log("Backend response:", result);
    } catch (error) {
      console.error(error);
      alert("Could not accept donation.");
    }
  };

  return (
    <div className="app">
      <header>
        <h2>FoodShare</h2>

        <nav>
          <button onClick={() => setPage("home")}>
            Home
          </button>

          <button onClick={() => setPage("donate")}>
            Donate Food
          </button>

          <button onClick={() => setPage("food")}>
            Find Food
          </button>
        </nav>
      </header>

      {page === "home" && (
        <main className="hero">
          <div>
            <p className="tag">
              REDUCE FOOD WASTE • FEED COMMUNITIES
            </p>

            <h1>
              Turn Surplus Food
              <br />
              Into <span>Hope.</span>
            </h1>

            <p className="description">
              Connect restaurants and grocery stores with nearby
              food banks to redistribute edible surplus food before
              it goes to waste.
            </p>

            <div className="actions">
              <button
                className="primary"
                onClick={() => setPage("donate")}
              >
                Donate Food
              </button>

              <button
                className="secondary"
                onClick={() => setPage("food")}
              >
                Find Food
              </button>
            </div>
          </div>

          <div className="hero-card">
            <div className="food-icon">🍱</div>

            <h3>Every Meal Matters</h3>

            <p>
              Your surplus can become someone's next meal.
            </p>
          </div>
        </main>
      )}

      {page === "donate" && (
        <main className="page">
          <h1>Donate Surplus Food</h1>

          <p className="subtitle">
            Share your edible surplus with a nearby food bank.
          </p>

          <form
            onSubmit={addDonation}
            className="form-card"
          >
            <label>Food Name</label>

            <input
              name="name"
              value={food.name}
              onChange={handleChange}
              placeholder="Example: Rice & Curry"
            />

            <label>Quantity</label>

            <input
              name="quantity"
              value={food.quantity}
              onChange={handleChange}
              placeholder="Example: 30 packets"
            />

            <label>Expiry Time</label>

            <input
              name="expiry"
              value={food.expiry}
              onChange={handleChange}
              placeholder="Example: Today, 8 PM"
            />

            <label>Location</label>

            <input
              name="location"
              value={food.location}
              onChange={handleChange}
              placeholder="Example: Sivaganga"
            />

            <button
              className="primary submit"
              type="submit"
            >
              Add Food Donation
            </button>
          </form>
        </main>
      )}

      {page === "food" && (
        <main className="page">
          <h1>Available Food</h1>

          <p className="subtitle">
            Surplus food available for nearby food banks.
          </p>

          <div className="food-list">
            {donations.map((item) => (
              <div
                className="food-card"
                key={item.id}
              >
                <div>
                  <h3>{item.name}</h3>

                  <p>
                    Quantity: {item.quantity}
                  </p>

                  <p>
                    Expiry: {item.expiry}
                  </p>

                  <p>
                    Location: {item.location}
                  </p>
                </div>

                <div>
                  <span className="status">
                    {item.status}
                  </span>

                  {item.status === "Available" && (
                    <button
                      className="accept"
                      onClick={() =>
                        acceptDonation(item.id)
                      }
                    >
                      Accept
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      )}
    </div>
  );
}

export default App;