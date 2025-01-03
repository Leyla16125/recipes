import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./../ReceiptPage.css";

const ReceiptPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ingredientsList: [],
    steps: "",
    tags: "",
    difficulty: "Easy",
  });
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [editingRecipe, setEditingRecipe] = useState(null); // For handling recipe edit state
  const [showPopup, setShowPopup] = useState(false);
  const [sortedRecipes, setSortedRecipes] = useState([]);
  const [sortOption, setSortOption] = useState("dateModified"); // Default sorting option
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query
  const [newIngredient, setNewIngredient] = useState("");

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetch("http://localhost:3000/recipes")
      .then((res) => res.json())
      .then((data) => {
        setRecipes(data);

        // Extract unique tags from recipes
        const allTags = data
          .flatMap((recipe) => recipe.tags)
          .filter((tag, index, self) => self.indexOf(tag) === index); // Get unique tags

        setTags(allTags);
      })
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

  // Sorting and filtering logic
  useEffect(() => {
    let filtered = [...recipes];

    if (selectedTag) {
      filtered = filtered.filter((recipe) => recipe.tags.includes(selectedTag));
    }

    if (selectedDifficulty) {
      filtered = filtered.filter(
        (recipe) => recipe.difficulty === selectedDifficulty
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(query) ||
          recipe.description.toLowerCase().includes(query) ||
          recipe.ingredients.some((ingredient) =>
            ingredient.toLowerCase().includes(query)
          )
      );
    }

    if (sortOption === "title") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === "dateModified") {
      filtered.sort(
        (a, b) => new Date(b.dateModified) - new Date(a.dateModified)
      );
    } else if (sortOption === "dateAdded") {
      filtered.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    } else if (sortOption === "difficulty") {
      const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
      filtered.sort(
        (a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
      );
    }

    setSortedRecipes(filtered);
  }, [recipes, sortOption, selectedTag, selectedDifficulty, searchQuery]);

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newRecipe = {
      ...formData,
      ingredients: formData.ingredientsList,
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
          ingredientsList: [],
          steps: "",
          tags: "",
          difficulty: "Easy",
        });
      })
      .catch((err) => console.error("Error adding recipe:", err));
  };

  const deleteIngredient = (index) => {
    setFormData((prev) => ({
      ...prev,
      ingredientsList: prev.ingredientsList.filter((_, i) => i !== index),
    }));
  };

  const handleIngredientChange = (index, value) => {
    setFormData((prev) => {
      const updatedIngredients = [...prev.ingredientsList];
      updatedIngredients[index] = value;
      return { ...prev, ingredientsList: updatedIngredients };
    });
  };

  const addIngredient = (ingredient) => {
    if (ingredient.trim()) {
      setFormData((prev) => ({
        ...prev,
        ingredientsList: [...prev.ingredientsList, ingredient.trim()],
      }));
    }
  };

  const closeModal = () => {
    setSelectedRecipe(null);
    navigate("/receipt");
  };

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

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by title, description, or ingredients"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: "10px",
            marginBottom: "20px",
            width: "100%",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
      </div>

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
      <br />

      {/* Filter Dropdowns */}
      <div className="filter-container">
        <label htmlFor="tags">Filter by Tag:</label>
        <select
          id="tags"
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          style={{ marginLeft: "10px" }}
        >
          <option value="">All Tags</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>

        <label htmlFor="difficulty" style={{ marginLeft: "20px" }}>
          Filter by Difficulty:
        </label>
        <select
          id="difficulty"
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          style={{ marginLeft: "10px" }}
        >
          <option value="">All Levels</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>
      <hr />

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
        <div>
          <h4>Ingredients:</h4>
          <ul>
            {formData.ingredientsList?.map((ingredient, index) => (
              <li key={index} style={{ display: "flex", alignItems: "center" }}>
                <span style={{ marginRight: "10px" }}>{ingredient}</span>
                <button
                  type="button"
                  onClick={() => deleteIngredient(index)}
                  style={{
                    backgroundColor: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
          <input
            type="text"
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
            placeholder="Add a new ingredient"
          />
          <button
            type="button"
            onClick={() => {
              addIngredient(newIngredient);
              setNewIngredient(""); // Clear the input after adding
            }}
          >
            Add Ingredient
          </button>
        </div>

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
