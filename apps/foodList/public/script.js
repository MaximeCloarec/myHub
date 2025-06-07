const form = document.getElementById("foodForm");
const resultDiv = document.getElementById("result");
const foodListDiv = document.getElementById("foodLists");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const foodName = document.getElementById("foodName").value.trim();
    const foodQuantity = parseInt(
        document.getElementById("foodQuantity").value
    );

    if (!foodName || isNaN(foodQuantity)) {
        resultDiv.textContent = "Nom et quantité valides requis.";
        return;
    }

    try {
        const res = await fetch("/foodList/api/addFood", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ foodName, foodQuantity }),
        });

        const data = await res.json();

        if (res.ok) {
            resultDiv.textContent = `Ajouté : ${data.foodName} (${data.foodQuantity})`;
            form.reset();
            fetchFoods(); // met à jour la liste
        } else {
            resultDiv.textContent = `Erreur : ${data.error}`;
        }
    } catch (err) {
        resultDiv.textContent = "Erreur réseau ou serveur.";
    }
});

async function deleteFood(id) {
    try {
        const res = await fetch(`/foodList/api/deleteFood/${id}`, {
            method: "DELETE",
        });

        const data = await res.json();

        if (res.ok) {
            resultDiv.textContent = `Supprimé : ID ${id}`;
            fetchFoods(); // met à jour la liste
        } else {
            resultDiv.textContent = `Erreur : ${data.error}`;
        }
    } catch (err) {
        resultDiv.textContent = "Erreur lors de la suppression.";
    }
}

async function fetchFoods() {
    try {
        const res = await fetch("/foodList/api/foods");
        const data = await res.json();

        if (res.ok) {
            foodListDiv.innerHTML = ""; // nettoie la liste

            data.forEach((food) => {
                addFoodToList(food);
            });
        } else {
            resultDiv.textContent = `Erreur lors du chargement : ${data.error}`;
        }
    } catch (err) {
        resultDiv.textContent = "Erreur lors de la récupération des aliments.";
    }
}

fetchFoods();

//Websocket connection
// Fonction pour ajouter un aliment à la liste affichée
function addFoodToList(food) {
    const container = document.createElement("div");
    container.classList.add("food-item");
    container.setAttribute("data-id", food.id);

    const span = document.createElement("span");
    span.textContent = `${food.foodName} (${food.foodQuantity})`;

    const button = document.createElement("button");
    button.textContent = "Supprimer";
    button.addEventListener("click", () => deleteFood(food.id));

    container.appendChild(span);
    container.appendChild(button);

    foodListDiv.appendChild(container);
}

// Fonction pour supprimer un aliment de la liste affichée
function removeFoodFromList(id) {
    const foodItem = document.querySelector(`.food-item[data-id="${id}"]`);
    if (foodItem) {
        foodItem.remove();
    }
}
