const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const analyzeBtn = document.getElementById("analyzeBtn");
const errorMsg = document.getElementById("errorMsg");
const resultDiv = document.getElementById("result");

let selectedFile = null;

// --- File Selection ---
dropZone.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) => handleFile(e.target.files[0]));

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.style.borderColor = "#4f46e5";
});
dropZone.addEventListener("dragleave", () => {
  dropZone.style.borderColor = "#ccc";
});
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.style.borderColor = "#ccc";
  const file = e.dataTransfer.files[0];
  handleFile(file);
});

function handleFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    showError("Please upload a valid image.");
    return;
  }

  selectedFile = file;
  const reader = new FileReader();
  reader.onload = () => {
    preview.src = reader.result;
    preview.classList.remove("hidden");
  };
  reader.readAsDataURL(file);

  analyzeBtn.disabled = false;
  errorMsg.classList.add("hidden");
}

// --- Analyze Button ---
analyzeBtn.addEventListener("click", async () => {
  if (!selectedFile) return;
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = "Analyzing...";
  errorMsg.classList.add("hidden");
  resultDiv.classList.add("hidden");

  const formData = new FormData();
  formData.append("image", selectedFile);

  try {
    const response = await fetch("https://phantoos.app.n8n.cloud/webhook-test/meal-ai", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Network error");

    let data = await response.json();
    console.log("Raw data:", data);

    let output =
      data[0]?.response?.output ||
      data[0]?.output ||
      data?.response?.output ||
      data?.output ||
      null;

    if (!output || !output.food) {
      showError("Invalid response from AI server.");
      return;
    }

    displayResult(output);
  } catch (err) {
    showError("Failed to connect to AI server.");
    console.error(err);
  }

  analyzeBtn.disabled = false;
  analyzeBtn.textContent = "Analyze";
});

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.remove("hidden");
}

function displayResult(output) {
  resultDiv.innerHTML = "";

  const title = document.createElement("h3");
  title.textContent = "Meal Breakdown";
  resultDiv.appendChild(title);

  output.food.forEach((item) => {
    const card = document.createElement("div");
    card.classList.add("food-card");
    card.innerHTML = `
      <h4>${item.name}</h4>
      <p><b>Quantity:</b> ${item.quantity}</p>
      <p><b>Calories:</b> ${item.calories} kcal</p>
      <p><b>Protein:</b> ${item.protein} g</p>
      <p><b>Carbs:</b> ${item.carbs} g</p>
      <p><b>Fat:</b> ${item.fat} g</p>
    `;
    resultDiv.appendChild(card);
  });

  const total = output.total;
  const totalCard = document.createElement("div");
  totalCard.classList.add("total-card");
  totalCard.innerHTML = `
    <h3>Total Nutrition</h3>
    <p><b>Calories:</b> ${total.calories} kcal</p>
    <p><b>Protein:</b> ${total.protein} g</p>
    <p><b>Carbs:</b> ${total.carbs} g</p>
    <p><b>Fat:</b> ${total.fat} g</p>
  `;
  resultDiv.appendChild(totalCard);

  resultDiv.classList.remove("hidden");
}
