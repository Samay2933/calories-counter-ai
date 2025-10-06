analyzeBtn.addEventListener("click", async () => {
  if (!selectedFile) return;

  resultDiv.classList.add("hidden");
  errorMsg.classList.add("hidden");
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = "Analyzing...";

  const formData = new FormData();
  formData.append("image", selectedFile);

  try {
    const response = await fetch("https://phantoos.app.n8n.cloud/webhook-test/meal-ai", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Network error");
    let data = await response.json();

    // ✅ Handle possible variations
    let output = null;
    try {
      if (Array.isArray(data)) {
        output =
          data[0]?.response?.output ||
          data[0]?.output ||
          (typeof data[0] === "string" ? JSON.parse(data[0])?.output : null);
      } else if (data.response?.output) {
        output = data.response.output;
      } else if (data.output) {
        output = data.output;
      }
    } catch (e) {
      console.warn("Parsing fallback failed:", e);
    }

    if (!output || !output.food) {
      showError("Invalid response from AI server — missing 'food' data.");
      console.log("Received data:", data);
      return;
    }

    displayResult(output);
  } catch (err) {
    showError("Server error. Please try again.");
    console.error(err);
  }

  analyzeBtn.disabled = false;
  analyzeBtn.textContent = "Analyze";
});

function displayResult(output) {
  resultDiv.innerHTML = "";

  const title = document.createElement("h3");
  title.textContent = `Meal Breakdown (${output.status || "complete"})`;
  resultDiv.appendChild(title);

  output.food.forEach((item, index) => {
    const card = document.createElement("div");
    card.classList.add("food-card");
    card.style.animationDelay = `${index * 0.1}s`;
    card.innerHTML = `
      <h3>${item.name}</h3>
      <p><strong>Quantity:</strong> ${item.quantity}</p>
      <p><strong>Calories:</strong> ${item.calories} kcal</p>
      <p><strong>Protein:</strong> ${item.protein} g</p>
      <p><strong>Carbs:</strong> ${item.carbs} g</p>
      <p><strong>Fat:</strong> ${item.fat} g</p>
    `;
    resultDiv.appendChild(card);
  });

  const total = output.total;
  const totalCard = document.createElement("div");
  totalCard.classList.add("total-card");
  totalCard.innerHTML = `
    <h3>Total</h3>
    <p>${total.calories} kcal | Protein: ${total.protein}g | Carbs: ${total.carbs}g | Fat: ${total.fat}g</p>
  `;
  resultDiv.appendChild(totalCard);

  resultDiv.classList.remove("hidden");
}
