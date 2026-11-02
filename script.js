
// Water Quest - Completed charity: water Game

const startButton = document.getElementById("start-button");
const waterCan = document.getElementById("water-can");
const scoreDisplay = document.getElementById("score");
const goalDisplay = document.getElementById("goal");
const timerDisplay = document.getElementById("timer");
const feedback = document.getElementById("feedback");
const milestoneDisplay = document.getElementById("milestone");
const startMessage = document.getElementById("start-message");
const gameBoard = document.getElementById("game-board");
const progressBar = document.getElementById("progress-bar");
const difficultyDescription = document.getElementById("difficulty-description");

const difficultyButtons = document.querySelectorAll(".difficulty");

// Difficulty settings
const modes = {
  easy: {
    time: 40,
    goal: 10,
    size: 80
  },

  normal: {
    time: 30,
    goal: 15,
    size: 65
  },

  hard: {
    time: 20,
    goal: 20,
    size: 50
  }
};

let currentMode = "easy";
let score = 0;
let timeLeft = 40;
let gameRunning = false;
let timer;
let audioContext = null;
let reachedMilestones = [];

// Milestone messages
const milestones = [
  { percent: 25, message: "Great start! Keep going!" },
  { percent: 50, message: "Halfway there! Every drop counts!" },
  { percent: 75, message: "Almost there! You can do it!" }
];

// Sound effect
function playSound(frequency = 600) {
  try {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    if (!audioContext) {
      audioContext = new AudioContextClass();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(0.06, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.12
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.12);
  } catch (error) {
    // Game continues if audio is unavailable.
  }
}

// Update score, goal, timer, and progress
function updateDisplay() {
  const goal = modes[currentMode].goal;

  scoreDisplay.textContent = score;
  goalDisplay.textContent = goal;
  timerDisplay.textContent = timeLeft;

  const progress = Math.min((score / goal) * 100, 100);

  progressBar.style.width = progress + "%";
}

// Select difficulty
difficultyButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    if (gameRunning) return;

    currentMode = button.dataset.mode;

    difficultyButtons.forEach(function (btn) {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    resetGame();
  });
});

// Reset game
function resetGame() {
  clearInterval(timer);

  gameRunning = false;
  score = 0;
  timeLeft = modes[currentMode].time;
  reachedMilestones = [];

  const settings = modes[currentMode];

  difficultyDescription.textContent =
    "Collect " + settings.goal +
    " water cans in " + settings.time + " seconds!";

  waterCan.style.width = settings.size + "px";
  waterCan.style.height = settings.size + 10 + "px";
  waterCan.style.display = "none";

  startMessage.style.display = "block";
  startButton.textContent = "Start Game";

  feedback.textContent = "Click Start Game to begin!";
  milestoneDisplay.textContent = "";

  difficultyButtons.forEach(function (button) {
    button.disabled = false;
  });

  updateDisplay();
}

// Start game
startButton.addEventListener("click", startGame);

function startGame() {
  clearInterval(timer);

  score = 0;
  timeLeft = modes[currentMode].time;
  reachedMilestones = [];
  gameRunning = true;

  updateDisplay();

  startMessage.style.display = "none";
  waterCan.style.display = "block";

  difficultyButtons.forEach(function (button) {
    button.disabled = true;
  });

  feedback.textContent = "Find the water can!";
  milestoneDisplay.textContent = "";

  moveWaterCan();

  timer = setInterval(function () {
    timeLeft--;
    timerDisplay.textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame(false);
    }
  }, 1000);
}

// Player clicks the water can
waterCan.addEventListener("click", function () {
  if (!gameRunning) return;

  score++;
  updateDisplay();

  feedback.textContent = "Great! You collected clean water!";

  playSound(600);
  checkMilestones();

  // Remove the can from view when collected
  waterCan.style.display = "none";

  if (score >= modes[currentMode].goal) {
    endGame(true);
  } else {
    // Reappear in a new position
    setTimeout(function () {
      if (gameRunning) {
        moveWaterCan();
        waterCan.style.display = "block";
      }
    }, 120);
  }
});

// Move water can to random location
function moveWaterCan() {
  const maxX = Math.max(
    0,
    gameBoard.clientWidth - waterCan.offsetWidth - 8
  );

  const maxY = Math.max(
    0,
    gameBoard.clientHeight - waterCan.offsetHeight - 8
  );

  const randomX = Math.floor(Math.random() * maxX);
  const randomY = Math.floor(Math.random() * maxY);

  waterCan.style.left = randomX + "px";
  waterCan.style.top = randomY + "px";
}

// Check milestone progress
function checkMilestones() {
  const percentage =
    (score / modes[currentMode].goal) * 100;

  milestones.forEach(function (milestone, index) {
    if (
      percentage >= milestone.percent &&
      !reachedMilestones.includes(index)
    ) {
      reachedMilestones.push(index);
      milestoneDisplay.textContent = milestone.message;
    }
  });
}

// End game
function endGame(won) {
  gameRunning = false;
  clearInterval(timer);

  waterCan.style.display = "none";

  difficultyButtons.forEach(function (button) {
    button.disabled = false;
  });

  startMessage.style.display = "block";
  startButton.textContent = "Play Again";

  if (won) {
    startMessage.querySelector("h2").textContent = "You Won!";

    startMessage.querySelector("p").textContent =
      "Amazing! You collected " + score +
      " water cans and reached your goal!";

    feedback.textContent = "Mission accomplished!";
    milestoneDisplay.textContent = "Every drop counts!";

    playSound(850);
  } else {
    startMessage.querySelector("h2").textContent = "Time's Up!";

    startMessage.querySelector("p").textContent =
      "You collected " + score + " water cans. Try again!";

    feedback.textContent = "Keep trying! You can do it!";
    playSound(250);
  }
}

// Initialize game
resetGame();
