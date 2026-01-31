const startBtn = document.getElementById("startBtn");
const overlay = document.getElementById("overlay");
const worksheetsDiv = document.getElementById("worksheets");
const tasksDiv = document.getElementById("tasks");
const contentDiv = document.getElementById("content");
const closeBtn = document.getElementById("closeBtn");

let currentWorksheet;
let currentTask;
let currentQuestion = 0;
let selectedAnswer = null;
let isAnswered = false;
let score = 0;
let results = [];

/* START */
startBtn.onclick = () => {
  overlay.classList.add("active");
  renderWorksheets();
};

/* CLOSE */
closeBtn.onclick = () => {
  overlay.classList.remove("active");
  worksheetsDiv.classList.remove("hidden");
  tasksDiv.classList.add("hidden");
  contentDiv.innerHTML = "";
};

/* WORKSHEETS */
function renderWorksheets() {
  worksheetsDiv.innerHTML = "";
  worksheetsDiv.classList.remove("hidden");
  tasksDiv.classList.add("hidden");
  contentDiv.innerHTML = "";

  worksheets.forEach((w, i) => {
    const btn = document.createElement("button");
    btn.textContent = w.title;
    btn.onclick = () => openWorksheet(i);
    worksheetsDiv.appendChild(btn);
  });
}

/* TASKS */
function openWorksheet(i) {
  currentWorksheet = worksheets[i];
  worksheetsDiv.classList.add("hidden");
  tasksDiv.classList.remove("hidden");
  tasksDiv.innerHTML = "";
  contentDiv.innerHTML = "";

  currentWorksheet.tasks.forEach((t, j) => {
    const btn = document.createElement("button");
    btn.textContent = t.title;
    btn.onclick = () => openTask(j);
    tasksDiv.appendChild(btn);
  });
}

/* OPEN TASK */
function openTask(i) {
  currentTask = currentWorksheet.tasks[i];
  currentQuestion = 0;
  score = 0;
  results = [];
  tasksDiv.classList.add("hidden");
  renderQuestion();
}

/* QUESTION */
function renderQuestion() {
  isAnswered = false;
  selectedAnswer = null;

  const q = currentTask.questions[currentQuestion];
  let answersHTML = "";

  if (currentTask.type === "fill") {
    answersHTML = `<input id="answerInput" placeholder="Type your answer" />`;
  }

  if (currentTask.type === "choice") {
    answersHTML = q.options
      .map(o => `<button class="choice-btn" data-value="${o}">${o}</button>`)
      .join("");
  }

  contentDiv.innerHTML = `
    <div class="card">
      <p>${q.text}</p>
      ${answersHTML}
      <div class="hint hidden" id="hint"></div>
      <button class="menu" id="checkBtn">Check</button>
      <button class="menu hidden" id="nextBtn">
        ${currentQuestion === currentTask.questions.length - 1 ? "Finish" : "Next"}
      </button>
      <small>${currentQuestion + 1} / ${currentTask.questions.length}</small>
    </div>
  `;

  /* FIXED CHOICE HANDLER */
  document.querySelectorAll(".choice-btn").forEach(btn => {
    btn.onclick = () => {
      if (isAnswered) return;

      selectedAnswer = btn.dataset.value;

      document.querySelectorAll(".choice-btn").forEach(b =>
        b.classList.remove("selected")
      );

      btn.classList.add("selected");
    };
  });

  document.getElementById("checkBtn").onclick = checkAnswer;
}

/* CHECK */
function checkAnswer() {
  if (isAnswered) return;

  const q = currentTask.questions[currentQuestion];
  let userAnswer = "";
  let correct = false;

  if (currentTask.type === "fill") {
    const input = document.getElementById("answerInput");
    userAnswer = input.value.trim().toLowerCase();
    if (!userAnswer) return;

    if (userAnswer === q.answer) {
      input.classList.add("correct");
      score++;
      correct = true;
    } else {
      input.classList.add("wrong");
    }
  }

  if (currentTask.type === "choice") {
    if (!selectedAnswer) return;
    userAnswer = selectedAnswer;

    document.querySelectorAll(".choice-btn").forEach(btn => {
      if (btn.dataset.value === q.answer) btn.classList.add("correct");
      else if (btn.dataset.value === selectedAnswer) btn.classList.add("wrong");
      btn.disabled = true;
    });

    if (selectedAnswer === q.answer) {
      score++;
      correct = true;
    }
  }

  results.push({
    question: q.text,
    userAnswer,
    correctAnswer: q.answer,
    correct
  });

  if (!correct) {
    const hint = document.getElementById("hint");
    hint.textContent = `Correct answer: ${q.answer}`;
    hint.classList.remove("hidden");
  }

  isAnswered = true;
  document.getElementById("checkBtn").classList.add("hidden");
  document.getElementById("nextBtn").classList.remove("hidden");
  document.getElementById("nextBtn").onclick = nextQuestion;
}

/* NEXT */
function nextQuestion() {
  if (currentQuestion < currentTask.questions.length - 1) {
    currentQuestion++;
    renderQuestion();
  } else {
    showResultTabs();
  }
}

/* RESULT WITH TABS */
function showResultTabs() {
  const correctItems = results.filter(r => r.correct);
  const wrongItems = results.filter(r => !r.correct);

  contentDiv.innerHTML = `
    <div class="card">
      <h2>Score: ${score} / ${results.length}</h2>

      <div class="tabs">
        <button class="tab active" onclick="switchTab('correct')">
          Correct (${correctItems.length})
        </button>
        <button class="tab" onclick="switchTab('wrong')">
          Wrong (${wrongItems.length})
        </button>
      </div>

      <div id="tab-correct" class="tab-content">
        ${correctItems.length
          ? `<ul>${correctItems.map(r => `<li class="correct">✔ ${r.question}</li>`).join("")}</ul>`
          : "<p>No correct answers</p>"
        }
      </div>

      <div id="tab-wrong" class="tab-content hidden">
        ${wrongItems.length
          ? `<ul>${wrongItems.map(r => `
              <li class="wrong">
                ✖ ${r.question}<br>
                <small>Your answer: ${r.userAnswer || "-"}</small><br>
                <small>Correct: ${r.correctAnswer}</small>
              </li>
            `).join("")}</ul>`
          : "<p>No wrong answers</p>"
        }
      </div>

      <button class="menu" onclick="renderWorksheets()">Back to Worksheets</button>
    </div>
  `;
}

/* SWITCH TAB */
function switchTab(type) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(c => c.classList.add("hidden"));

  document.querySelector(`.tab[onclick*="${type}"]`).classList.add("active");
  document.getElementById(`tab-${type}`).classList.remove("hidden");
}
