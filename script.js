const uploadArea = document.getElementById("uploadArea");
const imageUpload = document.getElementById("imageUpload");
const analyzeBtn = document.getElementById("analyzeBtn");
const resultDiv = document.getElementById("result");
const errorMsg = document.getElementById("errorMsg");

let selectedFile = null;

// Handle click upload
uploadArea.addEventListener("click", () => imageUpload.click());

// Handle file selection
imageUpload.addEventListener("change", (e) => {
  selectedFile = e.target.files[0];
  if (selectedFile) {
    analyzeBtn.disabled = false;
    uploadArea.innerHTML = `<img src="${URL.createObjectURL(selectedFile)}" class="preview-img" style="width:100%; border-radius:10px;" alt="Preview">`;
  }
});

// Drag & Drop handlers
uploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadArea.classList.add("dragover");
});
uploadArea.addEventListener("dragleave", () => uploadArea.classList.remove("dragover"));
uploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadArea.classList.remove("dragover");
  selectedFile = e.dataTransfer.files[0];
  if (selectedFile) {
    analyzeBtn.disabled = false;
    uploadArea.innerHTML = `<img src="${URL.createObjectURL(selectedFile)}" class="preview-img" style="width:100%; border-radius:10px;" alt="Preview">`;
  }
});

// Analyze Button
analyzeBtn.addEventListener("click", async () => {
  if (!selectedFile) return;

  resultDiv.classList.add("hidden");
  errorMsg.classList.add("hidden");
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = "Analyzing...";

  const formData = new FormData();
  formData.append("image", selectedFile);

  try {
    const response = await fetch('https://phantoos.app.n8n.cloud/webhook-test/meal-ai', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    displayResult(data);

  } catch (error) {
    showError("Server Error. Please try again.");
    console.error(error);
  }

  analyzeBtn.disabled = false;
  analyzeBtn.textContent = "Analyze";
});

function displayResult(data) {
  try {
    const result = data[0]?.output;
    if (!result || result.status !== "OK") {
      showError("Could not analyze the meal. Please try again.");
      return;
    }

    resultDiv.innerHTML = "";

    result.food.forEach(item => {
      const card = document.createElement("div");
      card.classList.add("food-card");
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

    const total = result.total;
    const totalCard = document.createElement("div");
    totalCard.classList.add("total-card");
    totalCard.innerHTML = `
      <h3>Total</h3>
      <p>${total.calories} kcal | P: ${total.protein}g | C: ${total.carbs}g | F: ${total.fat}g</p>
    `;
    resultDiv.appendChild(totalCard);

    resultDiv.classList.remove("hidden");
  } catch (err) {
    showError("Error displaying results.");
    console.error(err);
  }
}

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.remove("hidden");
}
