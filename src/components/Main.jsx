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
        setRecipes(sortedRecipes.slice(0, 2));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  const openRecipe = (id) => {
    navigate(`/recipes/${id}`, { state: { fromMainPage: true } });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main-container">
      <div className="header">
        <button className="left-button" onClick={() => navigate("/recipes")}>Explore Recipes</button>
        <h1 className="welcome-message">Welcome to Wonderland of Recipes</h1>
        <button className="right-button" onClick={() => navigate("/contact")}>Contact Us</button>
      </div>

      <div className="book-section">
        <div className="book">
          <div className="page left">
            {recipes[0] && (
              <div className="card" onClick={() => openRecipe(recipes[0].id)}>
                <img src={recipes[0].image} alt={recipes[0].title} />
                <h3>{recipes[0].title}</h3>
              </div>
            )}
          </div>
          <div className="page right">
            {recipes[1] && (
              <div className="card" onClick={() => openRecipe(recipes[1].id)}>
                <img src={recipes[1].image} alt={recipes[1].title} />
                <h3>{recipes[1].title}</h3>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="portfolio-section">
        <h2>Our Projects & Portfolios</h2>
        <p>Project's Github Link: <a href="https://github.com/Leyla16125/recipes">Recipts Project</a></p>
      </div>
    </div>
  );
}

export default MainPage;