const uploadArea = document.getElementById("uploadArea");
const uploadInput = document.getElementById("imageUpload");
const analyzeBtn = document.getElementById("analyzeBtn");
const resultDiv = document.getElementById("result");
const errorMsg = document.getElementById("errorMsg");

let selectedFile = null;

// open file picker when clicked
uploadArea.addEventListener("click", () => uploadInput.click());

// when file selected
uploadInput.addEventListener("change", (e) => handleFile(e.target.files[0]));

// drag/drop functionality
uploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadArea.classList.add("dragover");
});

uploadArea.addEventListener("dragleave", () => uploadArea.classList.remove("dragover"));

uploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadArea.classList.remove("dragover");
  handleFile(e.dataTransfer.files[0]);
});

// handle file logic
function handleFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    showError("Please upload a valid image file.");
    return;
  }
  selectedFile = file;
  analyzeBtn.disabled = false;
  const reader = new FileReader();
  reader.onload = () => {
    uploadArea.innerHTML = `<img src="${reader.result}" class="preview-img" alt="Preview">`;
  };
  reader.readAsDataURL(file);
}

// analyze button logic
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
    const data = await response.json();

    // ✅ handle response.output instead of output
    const output = data[0]?.response?.output;
    if (!output || !output.food) {
      showError("Invalid response format from AI server.");
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

  const status = output.status || "done";
  const title = document.createElement("h3");
  title.textContent = `Meal Breakdown (${status})`;
  resultDiv.appendChild(title);

  output.food.forEach((item) => {
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

  const total = output.total;
  const totalCard = document.createElement("div");
  totalCard.classList.add("total-card");
  totalCard.innerHTML = `
    <h3>Total</h3>
    <p>${total.calories} kcal | P: ${total.protein}g | C: ${total.carbs}g | F: ${total.fat}g</p>
  `;
  resultDiv.appendChild(totalCard);

  resultDiv.classList.remove("hidden");
}

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.remove("hidden");
}
