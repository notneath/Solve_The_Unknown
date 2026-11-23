(function () {
  // ---------- 1. SETTINGS (change numbers here only) ----------
  const CONFIG = {
    totalAttempts: 3,
    timerSeconds: 6 * 60,      // 5-7 minutes required
    questionAmount: 10,        // fetch 10 at once so we call the API less often
    difficulty: "easy",
    minFetchGapMs: 5500,       // Open Trivia DB rate limit: about 1 request / 5 seconds
  };

  // ---------- 2. SHARED STATE (agree on these names with the team in week 1) ----------
  const game = (window.gameState = window.gameState || {});
  game.attemptsLeft = CONFIG.totalAttempts;
  game.timeLeft = CONFIG.timerSeconds;
  game.nextClueIndex = 0;          // how many extra clues were already unlocked
  game.unlockedClues = game.unlockedClues || []; 

  // Local backup questions (used if Open Trivia DB fails)
  const FALLBACK = [
    { text: "Which tool is used to find fingerprints?", correct: "Dusting powder", wrong: ["Magnet", "Thermometer", "Compass"] },
    { text: "What does 'alibi' mean?", correct: "Proof you were somewhere else", wrong: ["A weapon", "A secret code", "A type of clue"] },
    { text: "What is 5 x 6?", correct: "30", wrong: ["11", "25", "36"] },
    { text: "Which planet is closest to the Sun?", correct: "Mercury", wrong: ["Venus", "Earth", "Mars"] },
    { text: "How many days are in a week?", correct: "7", wrong: ["5", "6", "8"] },
    { text: "What is the capital of Cambodia?", correct: "Phnom Penh", wrong: ["Siem Reap", "Battambang", "Kampot"] },
  ];

  let pool = [];            // questions waiting to be used
  let lastFetchTime = 0;
  let timerId = null;       // only ONE timer is ever allowed
  let current = null;       // the mission on screen right now
  let locked = true;        // blocks double-clicks and answers after finishing

  // ---------- 3. SMALL HELPERS ----------
  function emit(name, detail) {
    document.dispatchEvent(new CustomEvent(name, { detail }));
  }
  function decodeHtml(text) {
    return new DOMParser().parseFromString(text, "text/html").documentElement.textContent;
  }
  // Fisher-Yates shuffle (returns a new array)
  function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function makeQuestion(text, correct, wrong, type) {
    return { type, text, correctAnswer: correct, options: shuffle([correct, ...wrong]) };
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // ---------- 4. OPEN TRIVIA DB ----------
  async function fetchTrivia() {
    const wait = CONFIG.minFetchGapMs - (Date.now() - lastFetchTime);
    if (wait > 0) await sleep(wait);
    lastFetchTime = Date.now();

    const url = `https://opentdb.com/api.php?amount=${CONFIG.questionAmount}&difficulty=${CONFIG.difficulty}&type=multiple`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      if (data.response_code !== 0 || !data.results.length) throw new Error("API code " + data.response_code);
      return data.results.map((q) =>
        makeQuestion(
          decodeHtml(q.question),
          decodeHtml(q.correct_answer),
          q.incorrect_answers.map(decodeHtml),
          "quiz"
        )
      );
    } catch (err) {
      console.warn("Open Trivia DB failed, using backup questions:", err);
      return null;
    }
  }

  async function getQuizQuestion() {
    if (pool.length === 0) {
      const fresh = await fetchTrivia();
      pool = fresh || FALLBACK.map((q) => makeQuestion(q.text, q.correct, q.wrong, "quiz"));
      if (!fresh) emit("mission:notice", { message: "Could not reach the quiz server. Using backup questions." });
    }
    return pool.pop();
  }

  // Second mission type: examine the evidence (content comes from Member 1's case data)
  // Each item: { question, options: [...], answer: "correct option text" }
  function getEvidenceQuestion() {
    const list = (game.caseData && game.caseData.evidenceMissions) || [];
    if (list.length === 0) return null;
    const item = list[Math.floor(Math.random() * list.length)];
    return {
      type: "evidence",
      text: item.question,
      correctAnswer: item.answer,
      options: shuffle(item.options),
    };
  }

  // ---------- 5. TIMER ----------
  function stopTimer() {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function startTimer() {
    stopTimer();                       // never two timers at once
    game.timeLeft = CONFIG.timerSeconds;
    emit("timer:tick", { timeLeft: game.timeLeft });
    timerId = setInterval(() => {
      game.timeLeft--;
      emit("timer:tick", { timeLeft: game.timeLeft });
      if (game.timeLeft <= 0) {
        stopTimer();
        locked = true;
        current = null;
        emit("timer:expired", {});     
      }
    }, 1000);
  }

  function formatTime(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  // ---------- 6. CLUES ----------
  function unlockNextClue(missionType) {
    const clues = (game.caseData && game.caseData.extraClues) || [];
    if (game.nextClueIndex >= clues.length) return null;   // no clue twice, none left
    const clue = {
      ...clues[game.nextClueIndex],
      order: game.unlockedClues.length + 1,
      unlockedBy: missionType,
    };
    game.nextClueIndex++;
    game.unlockedClues.push(clue);
    emit("clue:unlocked", { clue });  
    return clue;
  }

  function saveProgress() {
    if (window.api && typeof window.api.updateProgress === "function" && game.progressId) {
      window.api
        .updateProgress(game.progressId, {
          attemptsLeft: game.attemptsLeft,
          cluesUnlocked: game.unlockedClues.length,
        })
        .catch((err) => console.warn("Progress not saved:", err));
    }
  }

  // ---------- 7. MISSION FLOW ----------
  // startMission("quiz") or startMission("evidence")  ->  returns the question to show, or null
  async function startMission(type = "quiz") {
    if (game.attemptsLeft <= 0) {
      emit("mission:blocked", { reason: "no-attempts" });
      return null;
    }
    if (game.timeLeft <= 0) {
      emit("mission:blocked", { reason: "time-up" });
      return null;
    }
    if (current) return current;       

    locked = true;
    const q = type === "evidence" ? getEvidenceQuestion() || (await getQuizQuestion()) : await getQuizQuestion();
    if (game.timeLeft <= 0) return null;  
    current = q;
    locked = false;
    emit("mission:started", { question: q });
    return q;
  }

  // answerMission("the option text")  ->  { correct, attemptsLeft, clue }
  function answerMission(choice) {
    if (locked || !current) return null;   // ignores double-clicks
    locked = true;

    const correct = choice === current.correctAnswer;
    const type = current.type;
    const correctAnswer = current.correctAnswer;
    current = null;

    let clue = null;
    if (correct) {
      clue = unlockNextClue(type);
    } else {
      game.attemptsLeft--;
    }
    saveProgress();

    const result = { correct, correctAnswer, attemptsLeft: game.attemptsLeft, clue };
    emit("mission:finished", result);

    if (game.attemptsLeft <= 0) {
      stopTimer();
      emit("attempts:empty", {});       
    }
    return result;
  }

  // Call this when the game starts (Member 2's "Start" button) and when the player restarts
  function resetMissions() {
    stopTimer();
    pool = [];
    current = null;
    locked = true;
    game.attemptsLeft = CONFIG.totalAttempts;
    game.timeLeft = CONFIG.timerSeconds;
    game.nextClueIndex = 0;
    game.unlockedClues = [];
  }

  // Call this when the player goes to the accusation screen early
  function stopMissions() {
    stopTimer();
    locked = true;
    current = null;
  }

  // ---------- 8. WHAT OTHER MEMBERS CAN USE ----------
  window.Missions = {
    CONFIG,
    startTimer,
    stopTimer: stopMissions,
    startMission,
    answerMission,
    resetMissions,
    formatTime,
  };
})();
