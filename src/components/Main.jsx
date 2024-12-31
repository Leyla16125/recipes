import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Main.css";

function MainPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/recipes")
      .then((response) => response.json())
      .then((data) => {
        const sortedRecipes = data.sort(
          (a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)
        );
        setRecipes(sortedRecipes.slice(0, 2)); // Show only the first two recipes
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  

  const openRecipe = (id) => {
    navigate(`/receipt/${id}`);
  };
  

  // Function to truncate the description to 100 characters
  const truncateDescription = (description) => {
    if (description.length > 100) {
      return description.slice(0, 97) + "..."; // Keep first 97 characters and add '...'
    }
    return description;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main-container">
      <div className="header">
        <button className="left-button" onClick={() => navigate("/receipt")}>
          Explore Recipes
        </button>
        <h1 className="welcome-message">Welcome to Wonderland of Recipes</h1>
        <button className="right-button" onClick={() => navigate("/contact")}>
          Contact Us
        </button>
      </div>

      <div className="book-section">
        <div className="book">
          <div className="page left">
            {recipes[0] && (
              <div className="card" onClick={() => openRecipe(recipes[0].id)}>
                <h3>{recipes[0].title}</h3>
                <p>{truncateDescription(recipes[0].description)}</p>
                <p>Difficulty: {recipes[0].difficulty}</p>
              </div>
            )}
          </div>
          <div className="page right">
            {recipes[1] && (
              <div className="card" onClick={() => openRecipe(recipes[1].id)}>
                <h3>{recipes[1].title}</h3>
                <p>{truncateDescription(recipes[1].description)}</p>
                <p>Difficulty: {recipes[1].difficulty}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="portfolio-section">
        <h2>Our Projects & Portfolios</h2>
        <p>
          Project's Github Link:{" "}
          <a href="https://github.com/Leyla16125/recipes">Recipes Project</a>
        </p>
      </div>
    </div>
  );
}

export default MainPage;
