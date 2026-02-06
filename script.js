// ----------- ELEMENTS -----------
const splashScreen = document.getElementById("splash-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const startBtn = document.getElementById("start-btn");
const questionCountSelect = document.getElementById("question-count");
const quizContainer = document.querySelector(".question-card-wrapper");
const progress = document.getElementById("progress");
const progressFill = document.getElementById("progress-fill");
const timerEl = document.getElementById("timer");
const finalScore = document.getElementById("final-score");
const finalHighscore = document.getElementById("final-highscore");
const highScoreText = document.getElementById("high-score");
const restartBtn = document.getElementById("restart-btn");

// ----------- VARIABLES -----------
let questions = [];
let currentIndex = 0;
let score = 0;
let timer;
let timeLeft = 15;

// Get highscore from localStorage
let highScore = localStorage.getItem("quizzyHighscore") || 0;
highScoreText.textContent = `Highest Score: ${highScore}`;

// ----------- HTML DECODER -----------
function decodeHTML(html){
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

// ----------- START QUIZ -----------
startBtn.addEventListener("click", () => {
  const count = questionCountSelect.value;
  splashScreen.classList.remove("active");
  quizScreen.classList.add("active");
  fetchQuestions(count);
});

// ----------- FETCH QUESTIONS -----------
async function fetchQuestions(amount){
  try{
    const res = await fetch(`https://opentdb.com/api.php?amount=${amount}&type=multiple`);
    const data = await res.json();
    questions = data.results;
    currentIndex = 0;
    score = 0;
    showQuestion();
  } catch(err){
    alert("Failed to load questions 😢 Try again later!");
    console.error(err);
  }
}

// ----------- SHOW QUESTION -----------
function showQuestion(){
  clearInterval(timer);
  timeLeft = 15;
  timerEl.textContent = `${timeLeft}s`;

  if(currentIndex >= questions.length){
    showResult();
    return;
  }

  const q = questions[currentIndex];
  progress.textContent = `Question ${currentIndex+1} / ${questions.length}`;
  progressFill.style.width = `${((currentIndex+1)/questions.length)*100}%`;

  const answers = [...q.incorrect_answers, q.correct_answer];
  shuffleArray(answers);

  quizContainer.innerHTML = `
    <div class="question-card fade-in">
      <h3>${decodeHTML(q.question)}</h3>
      <div class="answers">
        ${answers.map(ans => `<button class="answer-btn">${decodeHTML(ans)}</button>`).join("")}
      </div>
    </div>
  `;

  document.querySelectorAll(".answer-btn").forEach(btn => {
    btn.addEventListener("click", () => checkAnswer(btn, decodeHTML(q.correct_answer)));
  });

  startTimer();
}

// ----------- TIMER -----------
function startTimer(){
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `${timeLeft}s`;
    if(timeLeft <= 0){
      clearInterval(timer);
      showCorrectAnswer();
      setTimeout(nextQuestion, 1500);
    }
  }, 1000);
}

// ----------- CHECK ANSWER -----------
function checkAnswer(button, correctAnswer){
  clearInterval(timer);
  const allBtns = document.querySelectorAll(".answer-btn");
  allBtns.forEach(btn => btn.disabled = true);

  if(button.innerHTML === correctAnswer){
    button.classList.add("correct");
    score++;
  } else {
    button.classList.add("wrong");
    showCorrectAnswer();
  }

  setTimeout(nextQuestion, 1500);
}

// ----------- SHOW CORRECT ANSWER -----------
function showCorrectAnswer(){
  document.querySelectorAll(".answer-btn").forEach(btn => {
    if(btn.innerHTML === decodeHTML(questions[currentIndex].correct_answer)){
      btn.classList.add("correct");
    }
  });
}

// ----------- NEXT QUESTION -----------
function nextQuestion(){
  currentIndex++;
  showQuestion();
}

// ----------- SHOW RESULT -----------
function showResult(){
  quizScreen.classList.remove("active");
  resultScreen.classList.add("active");

  finalScore.textContent = `Your Score: ${score} / ${questions.length}`;

  if(score > highScore){
    localStorage.setItem("quizzyHighscore", score);
    highScore = score;
  }

  finalHighscore.textContent = `Highest Score: ${highScore}`;
}

// ----------- SHUFFLE ANSWERS -----------
function shuffleArray(arr){
  arr.sort(() => Math.random() - 0.5);
}

// ----------- RESTART QUIZ -----------
restartBtn.addEventListener("click", () => {
  resultScreen.classList.remove("active");
  splashScreen.classList.add("active");
  progressFill.style.width = "0%";
});
