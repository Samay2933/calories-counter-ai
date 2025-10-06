const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const analyzeBtn = document.getElementById("analyzeBtn");
const errorMsg = document.getElementById("errorMsg");
const resultDiv = document.getElementById("result");

let selectedFile = null;

/* ==========================
   🔹 FILE UPLOAD HANDLING
   ========================== */
dropZone.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) => handleFile(e.target.files[0]));

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  handleFile(file);
});

function handleFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    showError("Please upload a valid image file.");
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

/* ==========================
   🔹 ANALYZE MEAL
   ========================== */
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

    const data = await response.json();
    console.log("Raw response:", data);

    // Flexible parsing for all expected formats
    const output =
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
    console.error("Error:", err);
    showError("Failed to connect to AI server.");
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = "Analyze Meal";
  }
});

/* ==========================
   🔹 DISPLAY RESULT
   ========================== */
function displayResult(output) {
  resultDiv.innerHTML = "";
  const title = document.createElement("h3");
  title.textContent = "Meal Breakdown";
  resultDiv.appendChild(title);

  output.food.forEach((item, i) => {
    const card = document.createElement("div");
    card.classList.add("food-card");
    card.style.animationDelay = `${i * 0.1}s`;
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

/* ==========================
   🔹 ERROR DISPLAY
   ========================== */
function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.remove("hidden");
}
