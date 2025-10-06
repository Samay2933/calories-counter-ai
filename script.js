const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultBox = document.getElementById('result');

uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', e => {
  e.preventDefault();
  uploadArea.style.background = '#fff3d9';
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.style.background = '#fffaf0';
});

uploadArea.addEventListener('drop', e => {
  e.preventDefault();
  fileInput.files = e.dataTransfer.files;
  uploadArea.style.background = '#fffaf0';
});

analyzeBtn.addEventListener('click', async () => {
  if (!fileInput.files.length) {
    alert('Please upload an image first!');
    return;
  }

  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append('image', file);

  resultBox.innerHTML = '<p class="loading">Analyzing your meal... ⏳</p>';

  try {
    const response = await fetch('https://phantoos.app.n8n.cloud/webhook-test/meal-ai', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    displayResults(data);
  } catch (error) {
    resultBox.innerHTML = `<p style="color:red; font-weight:600;">⚠️ Oops! Something went wrong.<br>${error.message}</p>`;
  }
});

function displayResults(data) {
  if (!data || !data[0] || !data[0].output) {
    resultBox.innerHTML = '<p style="color:#ff4444;">⚠️ Invalid response from AI server. Please try again.</p>';
    return;
  }

  const output = data[0].output;
  let html = `<h3>🍽️ Meal Breakdown</h3>`;

  output.food.forEach((item, index) => {
    html += `
      <div class="food-item" style="animation-delay:${index * 0.1}s;">
        <strong>${item.name}</strong><br>
        <small>${item.quantity}</small><br>
        <b>Calories:</b> ${item.calories} kcal | 
        <b>Protein:</b> ${item.protein}g | 
        <b>Carbs:</b> ${item.carbs}g | 
        <b>Fat:</b> ${item.fat}g
      </div>
    `;
  });

  html += `
    <h4 style="margin-top:15px;">Total Nutrition</h4>
    <div class="food-item" style="animation-delay:${output.food.length * 0.1}s;">
      <b>Calories:</b> ${output.total.calories} kcal<br>
      <b>Protein:</b> ${output.total.protein} g<br>
      <b>Carbs:</b> ${output.total.carbs} g<br>
      <b>Fat:</b> ${output.total.fat} g
    </div>
  `;

  resultBox.innerHTML = html;
}
