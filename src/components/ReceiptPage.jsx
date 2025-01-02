import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./../ReceiptPage.css";

const ReceiptPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ingredients: "",
    steps: "",
    tags: "",
    difficulty: "Easy",
  });
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null); // To handle hovered card
  const [editingRecipe, setEditingRecipe] = useState(null); // For handling recipe edit state
  const [showPopup, setShowPopup] = useState(false);
  const [sortedRecipes, setSortedRecipes] = useState([]);
  const [sortOption, setSortOption] = useState("dateModified"); // Default sorting option

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetch("http://localhost:3000/recipes")
      .then((res) => res.json())
      .then((data) => setRecipes(data))
      .catch((err) => console.error("Error fetching recipes:", err));
  }, []);

  useEffect(() => {
    if (id) {
      const recipe = recipes.find((recipe) => recipe.id === id);
      if (recipe) {
        setSelectedRecipe(recipe);
      }
    }
  }, [id, recipes]);

  useEffect(() => {
    let sorted = [...recipes];
    if (sortOption === "title") {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === "dateModified") {
      sorted.sort((a, b) => {
        const dateA = new Date(a.dateModified).getTime() || 0;
        const dateB = new Date(b.dateModified).getTime() || 0;
        return dateB - dateA; // Descending
      });
    } else if (sortOption === "dateAdded") {
      sorted.sort((a, b) => {
        const dateA = new Date(a.dateAdded).getTime() || 0;
        const dateB = new Date(b.dateAdded).getTime() || 0;
        return dateB - dateA; // Descending
      });
    } else if (sortOption === "difficulty") {
      const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
      sorted.sort(
        (a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
      );
    }
    setSortedRecipes(sorted);
  }, [recipes, sortOption]);
  

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newRecipe = {
      ...formData,
      ingredients: formData.ingredients.split(",").map((item) => item.trim()),
      steps: formData.steps,
      tags: formData.tags.split(",").map((item) => item.trim()),
      dateAdded: new Date().toISOString(),
      dateModified: new Date().toISOString(),
    };

    fetch("http://localhost:3000/recipes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newRecipe),
    })
      .then((res) => res.json())
      .then((data) => {
        setRecipes((prevRecipes) => [...prevRecipes, data]);
        setFormData({
          title: "",
          description: "",
          ingredients: "",
          steps: "",
          tags: "",
          difficulty: "Easy",
        });
      })
      .catch((err) => console.error("Error adding recipe:", err));
  };

  const handleCardClick = (recipe) => {
    navigate(`/receipt/${recipe.id}`);
  };

  const closeModal = () => {
    setSelectedRecipe(null);
    navigate("/receipt");
  };

  const truncate = (text, maxLength) =>
    text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

  function formatDateTime(dateString) {
    const date = new Date(dateString);
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };

    return date.toLocaleString("en-US", options).replace(",", "");
  }

  const handleEdit = (recipe) => {
    setEditingRecipe(recipe);
    setShowPopup(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      fetch(`http://localhost:3000/recipes/${id}`, {
        method: "DELETE",
      })
        .then(() => {
          setRecipes(recipes.filter((recipe) => recipe.id !== id));
        })
        .catch((error) => console.error("Error deleting recipe:", error));
    }
  };

  const handlePopupSubmit = (e) => {
    e.preventDefault();
  
    const updatedRecipe = {
      ...editingRecipe,
      dateModified: new Date().toISOString(), // Update modified date
    };
  
    fetch(`http://localhost:3000/recipes/${editingRecipe.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedRecipe),
    })
      .then((res) => res.json())
      .then((data) => {
        const updatedRecipes = recipes.map((recipe) =>
          recipe.id === data.id ? data : recipe
        );
        setRecipes(updatedRecipes);
        setShowPopup(false);
        setEditingRecipe(null);
      })
      .catch((err) => console.error("Error updating recipe:", err));
  };
  

  return (
    <div className="receipt-container">
      <h1>Recipes</h1>

      <button
        onClick={() => navigate("/")}
        style={{
          padding: "10px 20px",
          marginBottom: "20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Back to Home
      </button>

      <div className="sort-container">
        <label htmlFor="sort">Sort by:</label>
        <select
          id="sort"
          value={sortOption}
          onChange={handleSortChange}
          style={{
            marginLeft: "10px",
            padding: "5px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        >
          <option value="title">Title</option>
          <option value="dateAdded">Date Added</option>
          <option value="dateModified">Last Updated</option>
          <option value="difficulty">Difficulty</option>
        </select>
      </div>

      <form className="recipe-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        />
        <textarea
          placeholder="Ingredients (comma-separated)"
          value={formData.ingredients}
          onChange={(e) =>
            setFormData({ ...formData, ingredients: e.target.value })
          }
          required
        />
        <textarea
          placeholder="Steps"
          value={formData.steps}
          onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Tags (comma-separated)"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
        />
        <select
          value={formData.difficulty}
          onChange={(e) =>
            setFormData({ ...formData, difficulty: e.target.value })
          }
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <button type="submit">Add Recipe</button>
      </form>

      <div className="cards-container">
        {sortedRecipes.map((recipe) => (
          <div
            className="card"
            key={recipe.id}
            onClick={() => navigate(`/receipt/${recipe.id}`)}
          >
            <h3>{recipe.title}</h3>
            <p>{recipe.description}</p>
            <p>
              <strong>Difficulty:</strong> {recipe.difficulty}
            </p>
            <p>
              <strong>Date Added:</strong>{" "}
              {new Date(recipe.dateAdded).toLocaleString()}
            </p>
            <p>
              <strong>Last Updated:</strong>{" "}
              {new Date(recipe.dateModified).toLocaleString()}
            </p>
            <div className="card-buttons">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(recipe);
                }}
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(recipe.id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showPopup && editingRecipe && (
        <div className="popup">
          <div className="popup-content">
            <h3>Edit Recipe</h3>
            <form onSubmit={handlePopupSubmit}>
              <label>
                Title:
                <input
                  type="text"
                  value={editingRecipe.title}
                  onChange={(e) =>
                    setEditingRecipe({
                      ...editingRecipe,
                      title: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Description:
                <textarea
                  value={editingRecipe.description}
                  onChange={(e) =>
                    setEditingRecipe({
                      ...editingRecipe,
                      description: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Ingredients:
                <input
                  type="text"
                  value={editingRecipe.ingredients}
                  onChange={(e) =>
                    setEditingRecipe({
                      ...editingRecipe,
                      ingredients: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Steps:
                <input
                  type="text"
                  value={editingRecipe.steps}
                  onChange={(e) =>
                    setEditingRecipe({
                      ...editingRecipe,
                      steps: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Tags:
                <input
                  type="text"
                  value={editingRecipe.tags}
                  onChange={(e) =>
                    setEditingRecipe({
                      ...editingRecipe,
                      tags: e.target.value,
                    })
                  }
                />
              </label>

              {/* Difficulty as a dropdown, same as when adding a new recipe */}
              <label>
                Difficulty:
                <select
                  value={editingRecipe.difficulty}
                  onChange={(e) =>
                    setEditingRecipe({
                      ...editingRecipe,
                      difficulty: e.target.value,
                    })
                  }
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </label>

              <button type="submit">Save</button>
              <button type="button" onClick={() => setShowPopup(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedRecipe && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
          >
            <button className="close-button" onClick={closeModal}>
              &times;
            </button>
            <h2>{selectedRecipe.title}</h2>
            <p>
              <strong>Description:</strong> {selectedRecipe.description}
            </p>
            <p>
              <strong>Ingredients:</strong>{" "}
              {selectedRecipe.ingredients.join(", ")}
            </p>
            <p>
              <strong>Steps:</strong> {selectedRecipe.steps}
            </p>
            <p>
              <strong>Tags:</strong> {selectedRecipe.tags.join(", ")}
            </p>
            <p>
              <strong>Difficulty:</strong> {selectedRecipe.difficulty}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptPage;
