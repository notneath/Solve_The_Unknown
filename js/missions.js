//   mission divided into two parts of js: mission and mission-ui.
//   The purpose of creating this to: Gets quiz questions, counts the player's 3 attempts, runs the countdown timer, and unlocks a new clue when the player answers correctly.

(function () {
  // SETTINGS (change numbers here only) 
  const SETTINGS = {
    totalAttempts: 3,      // only 3 answers allowed to be wrong
    timerSeconds: 6 * 60,      
    questionsPerRequest: 10,   
    difficulty: "easy",   // we only put easy level first
    waitBetweenRequests: 5500, // only 1 request every 5 seconds
  };
  // Game notebook
  // All members read and write the same "gameState".
  const game = window.gameState || {};
  window.gameState = game;

  game.attemptsLeft = SETTINGS.totalAttempts;
  game.timeLeft = SETTINGS.timerSeconds;
  game.unlockedClues = game.unlockedClues || [];
  game.clueNumber = 0;

  // This is backup plans for questions if the internet or API fails
  const backupQuestions = [
    { text: "Where does Wang Yibo live in?", right: "China", wrong: ["Korea", "Germany", "Cambodia"] },
    { text: "What does 'army' mean?", right: "fans of BTS", wrong: ["It is similiar to soldiers", "My fri name", "Idk"] },
    { text: "What is 5 x 6?", right: "30", wrong: ["56", "555555", "66666"] },
    { text: "Which planet is closest to the Sun?", right: "Mercury", wrong: ["You", "Me", "Us"] },
    { text: "What is Huss Huss?", right: "an AI unique words", wrong: ["haha", "hehehe ", "laugh sound"] },
    { text: "What is the capital of Cambodia?", right: "Phnom Penh", wrong: ["Siem Reap", "Battambang", "Kampot"] },
  ];

  // things for system or engine remember
  let questionList = [];       // questions that are ready to use
  let lastRequestTime = 0;     // when we last called Open Trivia DB
  let timer = null;            // the countdown (only ONE is allowed)
  let currentQuestion = null;  // the question on screen right now
  let canAnswer = false;       // false = ignore clicks (stops double-clicking)

  // Shout an event so other members can react to it
  function shout(eventName, details) {
    document.dispatchEvent(new CustomEvent(eventName, { detail: details }));
  }

  // Open Trivia DB sends text like  (Don&#039;t) and this turns it back into (Don't)
  function cleanText(text) {
    const page = new DOMParser().parseFromString(text, "text/html");
    return page.documentElement.textContent;
  }

  // Mix up a list so the right answer is not always in the one place
  function mixUp(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  // Build one question in the shape for the whole team use
  function buildQuestion(type, text, rightAnswer, wrongAnswers) {
    return {
      type: type, // for choosing quiz or evidence
      text: text,
      correctAnswer: rightAnswer,
      options: mixUp([rightAnswer].concat(wrongAnswers)),
    };
  }
  function wait(milliseconds) {
    return new Promise(function (done) { setTimeout(done, milliseconds); });
  }

  // Ask for questions, it returns a list, or null if something fails
  async function loadQuestionsFromInternet() {
    // Respect the rate limit
    const timeSinceLast = Date.now() - lastRequestTime;
    if (timeSinceLast < SETTINGS.waitBetweenRequests) {
      await wait(SETTINGS.waitBetweenRequests - timeSinceLast);
    }
    lastRequestTime = Date.now();

    const url = "https://opentdb.com/api.php?amount=" + SETTINGS.questionsPerRequest +
                "&difficulty=" + SETTINGS.difficulty + "&type=multiple";

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Server answered " + response.status);

      const data = await response.json();
      // response_code 0 means "success". Anything else means no questions.
      if (data.response_code !== 0 || data.results.length === 0) {
        throw new Error("No questions (code " + data.response_code + ")");
      }

      return data.results.map(function (item) {
        return buildQuestion(
          "quiz",
          cleanText(item.question),
          cleanText(item.correct_answer),
          item.incorrect_answers.map(cleanText)
        );
      });
    } catch (error) {
      console.warn("Open Trivia DB did not work, using backup questions:", error);
      return null;
    }
  }

  // Get one quiz question
  async function getQuizQuestion() {
    if (questionList.length === 0) {
      const fromInternet = await loadQuestionsFromInternet();

      if (fromInternet) {
        questionList = fromInternet;
      } else {
        questionList = backupQuestions.map(function (q) {
          return buildQuestion("quiz", q.text, q.right, q.wrong);
        });
        shout("mission:notice", { message: "we will use backup questions since it cannot reach and get sth from the internet rn." });
      }
    }
    return questionList.pop();
  }

  // Second mission type: "examine the evidence".
  function getEvidenceQuestion() {
    const all = (game.caseData && game.caseData.evidenceMissions) || [];
    if (all.length === 0) return null;

    const item = all[Math.floor(Math.random() * all.length)];
    return buildQuestion("evidence", item.question, item.answer,
      item.options.filter(function (option) { return option !== item.answer; }));
  }

  // timer
  function stopTimer() {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  }
  function startTimer() {
    stopTimer();   // to ensure the old timer is gone away
    game.timeLeft = SETTINGS.timerSeconds;
    shout("timer:tick", { timeLeft: game.timeLeft });

    timer = setInterval(function () { 
      game.timeLeft = game.timeLeft - 1;
      shout("timer:tick", { timeLeft: game.timeLeft });
      if (game.timeLeft <= 0) {
        stopTimer();
        canAnswer = false;
        currentQuestion = null;
        shout("timer:expired", {});  
      }
    }, 1000);
  }

  // 365 seconds  ->  "06:05"
  function formatTime(totalSeconds) {
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return minutes + ":" + seconds;
  }

  // this is for clues info. Give the player the next clue. Each clue is given only once.
  function unlockNextClue(missionType) {
    const allClues = (game.caseData && game.caseData.extraClues) || [];
    if (game.clueNumber >= allClues.length) return null; // no more clues for you kiddo

    const original = allClues[game.clueNumber];
    const clue = {
      text: original.text,
      order: game.unlockedClues.length + 1,   // clue found
      unlockedBy: missionType,               
    };

    game.clueNumber = game.clueNumber + 1;
    game.unlockedClues.push(clue);
    shout("clue:unlocked", { clue: clue });  
    return clue;
  }

  function saveProgress() {
    if (window.api && typeof window.api.updateProgress === "function" && game.progressId) {
      window.api.updateProgress(game.progressId, {
        attemptsLeft: game.attemptsLeft,
        cluesUnlocked: game.unlockedClues.length,
      }).catch(function (error) {
        console.warn("Progress was not saved:", error);
      });
    }
  }

  // Start a mission. type is "quiz" or "evidence".
  async function startMission(type) {
    type = type || "quiz";
    if (game.attemptsLeft <= 0) {
      shout("mission:blocked", { reason: "no-attempts" });
      return null;
    }
    if (game.timeLeft <= 0) {
      shout("mission:blocked", { reason: "time-up" });
      return null;
    }
    if (currentQuestion) return currentQuestion;   // a mission is already running

    canAnswer = false;
    let question = null;
    if (type === "evidence") question = getEvidenceQuestion();
    if (!question) question = await getQuizQuestion();   // quiz, or evidence had nothing

    if (game.timeLeft <= 0) return null;           // time ended 
    currentQuestion = question;
    canAnswer = true;
    shout("mission:started", { question: question });
    return question;
  }

  // The player picked an answer and decide whether it is correct or not
  function answerMission(choice) {
    if (!canAnswer || !currentQuestion) return null;   // ignore double-clicks
    canAnswer = false;
    const wasCorrect = (choice === currentQuestion.correctAnswer);
    const correctAnswer = currentQuestion.correctAnswer;
    const missionType = currentQuestion.type;
    currentQuestion = null;

    let newClue = null;
    if (wasCorrect) {
      newClue = unlockNextClue(missionType);
    } else {
      game.attemptsLeft = game.attemptsLeft - 1;
    }
    saveProgress();

    const result = {
      correct: wasCorrect,
      correctAnswer: correctAnswer,
      attemptsLeft: game.attemptsLeft,
      clue: newClue,
    };
    shout("mission:finished", result);

    if (game.attemptsLeft <= 0) {
      stopTimer();
      shout("attempts:empty", {});  
    }
    return result;
  }

  // Use when a new game starts or the player restarts.
  function resetMissions() {
    stopTimer();
    questionList = [];
    currentQuestion = null;
    canAnswer = false;
    game.attemptsLeft = SETTINGS.totalAttempts;
    game.timeLeft = SETTINGS.timerSeconds;
    game.clueNumber = 0;
    game.unlockedClues = [];
  }

  // Use when the player goes to the accusation screen early.
  function stopMissions() {
    stopTimer();
    canAnswer = false;
    currentQuestion = null;
  }
  // What the UI part (and teammates) can use
  window.Missions = {
    SETTINGS: SETTINGS,
    startTimer: startTimer,
    stopTimer: stopMissions,
    startMission: startMission,
    answerMission: answerMission,
    resetMissions: resetMissions,
    formatTime: formatTime,
  };

})();

// mission ui - shows the missions on the screen.
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