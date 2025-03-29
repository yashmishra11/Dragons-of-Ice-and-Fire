import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [dragons, setDragons] = useState([]);

  useEffect(() => {
    fetch("/dragon_data.json")
      .then((response) => response.json())
      .then((data) => setDragons(data))
      .catch((error) => console.error("Error loading dragon data:", error));
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Dragons of Westeros</h1><br />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
        {dragons.map((dragon, index) => (
          <Link 
            key={index} 
            to={`/dragon/${encodeURIComponent(dragon.name)}`} 
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div 
              style={{ 
                border: "1px solid #ccc", 
                padding: "15px", 
                borderRadius: "8px", 
                backgroundColor: "#f9f9f9",
                boxShadow: "2px 2px 10px rgba(0,0,0,0.1)",
                textAlign: "center",
                cursor: "pointer",
                transition: "transform 0.2s ease-in-out"
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <h2>{dragon.name}</h2>
              {dragon.image && (
                <img 
                  src={dragon.image} 
                  alt={dragon.name} 
                  style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "8px" }} 
                />
              )}
              <p><strong>Hatched:</strong> {dragon.hatched || "Unknown"}</p>
              <p><strong>Died:</strong> {dragon.died || "Unknown"}</p>
              <p><strong>Rider(s):</strong> {dragon.riders?.join(", ") || "None"}</p>
              <p><strong>Colors:</strong> {Array.isArray(dragon.colors) ? dragon.colors.join(", ") : "Unknown"}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
