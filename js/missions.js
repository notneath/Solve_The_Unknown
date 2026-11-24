// mission - shows the missions on the screen.
// It connects the buttons to the engine and listens to the engine's events.

function find(id) { return document.getElementById(id); }
// For button
find("startGame").onclick = function () {
  Missions.resetMissions();
  Missions.startTimer();
  find("attempts").textContent = gameState.attemptsLeft;
  find("clues").innerHTML = "";
  find("feedback").textContent = "";
};
find("startQuiz").onclick = function () {
  Missions.startMission("quiz");
};
find("startEvidence").onclick = function () {
  Missions.startMission("evidence");
};

// show the time-left
document.addEventListener("timer:tick", function (event) {
  find("timer").textContent = Missions.formatTime(event.detail.timeLeft);
});

// For the time is up.
document.addEventListener("timer:expired", function () {
  find("question").textContent = "";
  find("options").innerHTML = "";
  find("feedback").textContent = "Time is up now!!!";
});

// To tell that there is no attempts left.
document.addEventListener("attempts:empty", function () {
  find("feedback").textContent = find("feedback").textContent + " There is no attempts left, go to the accusation.";
});

// A message for players
document.addEventListener("mission:notice", function (event) {
  find("notice").textContent = event.detail.message;
});

// A mission could not start
document.addEventListener("mission:blocked", function (event) {
  if (event.detail.reason === "no-attempts") {
    find("feedback").textContent = "No more attempts kid, try again";
  } else {
    find("feedback").textContent = "Time's up kiddo!!";
  }
});

// New question: show it and make one button per answer
document.addEventListener("mission:started", function (event) {
  const question = event.detail.question;
  find("feedback").textContent = "";
  find("question").textContent = question.text;  
  find("options").innerHTML = "";

  question.options.forEach(function (optionText) {
    const button = document.createElement("button");
    button.textContent = optionText;
    button.onclick = function () {
      Missions.answerMission(optionText);
    };
    find("options").appendChild(button);
  });
});

// When the player answered "show the result"
document.addEventListener("mission:finished", function (event) {
  const result = event.detail;
  find("attempts").textContent = result.attemptsLeft;
  find("question").textContent = "";
  find("options").innerHTML = "";

  if (result.correct && result.clue) {
    find("feedback").textContent = "That's correct kid! A new clue was unlocked.";
  } else if (result.correct) {
    find("feedback").textContent = "Correct! But...(No more clues left.) for you kid";
  } else {
    find("feedback").textContent = "Husss huss huss, your answer seems not completely right. The answer was: " + result.correctAnswer;
  }
});

// A clue was unlocked: add it to the evidence list
document.addEventListener("clue:unlocked", function (event) {
  const item = document.createElement("li");
  item.textContent = event.detail.clue.text;
  find("clues").appendChild(item);
});
