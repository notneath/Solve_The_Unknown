// MISSION ENGINE
// Gets quiz questions, tracks attempts, runs the countdown timer,
// and unlocks a clue when the player answers correctly.

(() => {
    // SETTINGS
    const SETTINGS = {
        totalAttempts: 3,
        timerSeconds: 6 * 60,
        questionsPerRequest: 10,
        difficulty: "easy",
        waitBetweenRequests: 5500
    }

    // Shared game state
    const game = window.gameState || (window.gameState = {})
    game.attemptsLeft = SETTINGS.totalAttempts
    game.timeLeft = SETTINGS.timerSeconds
    game.unlockedClues = game.unlockedClues || []
    game.clueNumber = 0

    // Case data from game.js
    game.caseData = game.caseData || window.caseData || null

    // Backup questions
    const backupQuestions = [
        {
            text: "Where does Wang Yibo live in?",
            right: "China",
            wrong: ["Korea", "Germany", "Cambodia"]
        },
        {
            text: "What does 'army' mean?",
            right: "fans of BTS",
            wrong: ["It is similar to soldiers", "My friend's name", "I don't know"]
        },
        {
            text: "What is 5 x 6?",
            right: "30",
            wrong: ["56", "555555", "66666"]
        },
        {
            text: "Which planet is closest to the Sun?",
            right: "Mercury",
            wrong: ["Venus", "Earth", "Mars"]
        },
        {
            text: "What is the capital of Cambodia?",
            right: "Phnom Penh",
            wrong: ["Siem Reap", "Battambang", "Kampot"]
        }
    ]

    let questionList = []
    let lastRequestTime = 0
    let timer = null
    let currentQuestion = null
    let canAnswer = false

    // Notify the UI
    const shout = (eventName, details) => {
        document.dispatchEvent(
            new CustomEvent(eventName, { detail: details })
        )
    }

    // Decode HTML entities
    const cleanText = (text) => {
        const page = new DOMParser().parseFromString(text, "text/html")
        return page.documentElement.textContent
    }

    // Randomize answer options
    const mixUp = (list) => {
        const copy = list.slice()

        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            const temp = copy[i]
            copy[i] = copy[j]
            copy[j] = temp
        }

        return copy
    }

    // Build a question
    const buildQuestion = (type, text, rightAnswer, wrongAnswers) => ({
        type: type,
        text: text,
        correctAnswer: rightAnswer,
        options: mixUp([rightAnswer].concat(wrongAnswers))
    })

    const wait = (milliseconds) => new Promise((done) => {
        setTimeout(done, milliseconds)
    })

    // Load questions from Open Trivia DB
    const loadQuestionsFromInternet = async () => {
        const timeSinceLast = Date.now() - lastRequestTime

        if (timeSinceLast < SETTINGS.waitBetweenRequests) {
            await wait(SETTINGS.waitBetweenRequests - timeSinceLast)
        }

        lastRequestTime = Date.now()

        const url = "https://opentdb.com/api.php?amount=" +
            SETTINGS.questionsPerRequest +
            "&difficulty=" + SETTINGS.difficulty +
            "&type=multiple"

        try {
            const response = await fetch(url)

            if (!response.ok) {
                throw new Error("Server answered " + response.status)
            }

            const data = await response.json()

            if (data.response_code !== 0 || data.results.length === 0) {
                throw new Error("No questions available")
            }

            return data.results.map((item) => buildQuestion(
                "quiz",
                cleanText(item.question),
                cleanText(item.correct_answer),
                item.incorrect_answers.map(cleanText)
            ))

        } catch (error) {
            console.warn(
                "Open Trivia DB did not work, using backup questions:",
                error
            )

            return null
        }
    }

    // Get one quiz question
    const getQuizQuestion = async () => {
        if (questionList.length === 0) {
            const fromInternet = await loadQuestionsFromInternet()

            if (fromInternet) {
                questionList = fromInternet
            } else {
                questionList = backupQuestions.map((question) =>
                    buildQuestion(
                        "quiz",
                        question.text,
                        question.right,
                        question.wrong
                    )
                )

                shout("mission:notice", {
                    message: "Internet questions are unavailable. Backup questions will be used."
                })
            }
        }

        return questionList.pop()
    }

    // Get an evidence question
    const getEvidenceQuestion = () => {
        const all = (game.caseData && game.caseData.evidenceMissions) || []

        if (all.length === 0) {
            return null
        }

        const item = all[Math.floor(Math.random() * all.length)]

        return buildQuestion(
            "evidence",
            item.question,
            item.answer,
            item.options.filter((option) => option !== item.answer)
        )
    }

    // Stop timer
    const stopTimer = () => {
        if (timer !== null) {
            clearInterval(timer)
            timer = null
        }
    }

    // Start timer
    const startTimer = () => {
        stopTimer()

        game.timeLeft = SETTINGS.timerSeconds

        shout("timer:tick", {
            timeLeft: game.timeLeft
        })

        timer = setInterval(() => {
            game.timeLeft = game.timeLeft - 1

            shout("timer:tick", {
                timeLeft: game.timeLeft
            })

            if (game.timeLeft <= 0) {
                stopTimer()
                canAnswer = false
                currentQuestion = null

                shout("timer:expired", {})
            }
        }, 1000)
    }

    // Format timer
    const formatTime = (totalSeconds) => {
        const minutes = String(
            Math.floor(totalSeconds / 60)
        ).padStart(2, "0")

        const seconds = String(
            totalSeconds % 60
        ).padStart(2, "0")

        return minutes + ":" + seconds
    }

    // Unlock next clue
    const unlockNextClue = (missionType) => {
        const allClues = (game.caseData && game.caseData.extraClues) || []

        if (game.clueNumber >= allClues.length) {
            return null
        }

        const original = allClues[game.clueNumber]

        const clue = {
            text: original.text,
            order: game.unlockedClues.length + 1,
            unlockedBy: missionType
        }

        game.clueNumber = game.clueNumber + 1
        game.unlockedClues.push(clue)

        shout("clue:unlocked", {
            clue: clue
        })

        return clue
    }

    // Save progress
    const saveProgress = () => {
        if (
            window.api &&
            typeof window.api.updateProgress === "function" &&
            game.progressId
        ) {
            window.api.updateProgress(game.progressId, {
                attemptsLeft: game.attemptsLeft,
                cluesUnlocked: game.unlockedClues.length
            }).catch((error) => {
                console.warn("Progress was not saved:", error)
            })
        }
    }

    // Start mission
    const startMission = async (type = "quiz") => {
        if (game.attemptsLeft <= 0) {
            shout("mission:blocked", {
                reason: "no-attempts"
            })

            return null
        }

        if (game.timeLeft <= 0) {
            shout("mission:blocked", {
                reason: "time-up"
            })

            return null
        }

        if (currentQuestion) {
            return currentQuestion
        }

        canAnswer = false

        let question = null

        if (type === "evidence") {
            question = getEvidenceQuestion()
        }

        if (!question) {
            question = await getQuizQuestion()
        }

        if (game.timeLeft <= 0) {
            return null
        }

        currentQuestion = question
        canAnswer = true

        shout("mission:started", {
            question: question
        })

        return question
    }

    // Check player's answer
    const answerMission = (choice) => {
        if (!canAnswer || !currentQuestion) {
            return null
        }

        canAnswer = false

        const wasCorrect = choice === currentQuestion.correctAnswer
        const correctAnswer = currentQuestion.correctAnswer
        const missionType = currentQuestion.type

        currentQuestion = null

        let newClue = null

        if (wasCorrect) {
            newClue = unlockNextClue(missionType)
        } else {
            game.attemptsLeft = game.attemptsLeft - 1
        }

        saveProgress()

        const result = {
            correct: wasCorrect,
            correctAnswer: correctAnswer,
            attemptsLeft: game.attemptsLeft,
            clue: newClue
        }

        shout("mission:finished", result)

        if (game.attemptsLeft <= 0) {
            stopTimer()
            shout("attempts:empty", {})
        }

        return result
    }

    // Reset missions
    const resetMissions = () => {
        stopTimer()

        questionList = []
        currentQuestion = null
        canAnswer = false

        game.attemptsLeft = SETTINGS.totalAttempts
        game.timeLeft = SETTINGS.timerSeconds
        game.clueNumber = 0
        game.unlockedClues = []
    }

    // Stop missions
    const stopMissions = () => {
        stopTimer()
        canAnswer = false
        currentQuestion = null
    }

    // Public functions
    window.Missions = {
        SETTINGS: SETTINGS,
        startTimer: startTimer,
        stopTimer: stopMissions,
        startMission: startMission,
        answerMission: answerMission,
        resetMissions: resetMissions,
        formatTime: formatTime
    }
})();


// ===================================
// MISSION UI
// ===================================

(() => {
    const find = (id) => document.getElementById(id)

    const setText = (id, text) => {
        const element = find(id)

        if (element) {
            element.textContent = text
        }
    }

    const showNotice = (message) => {
        setText("mission-notice", message)
    }

    const showFeedback = (message) => {
        setText("mission-feedback", message)
    }

    // Start quiz
    const startQuizButton = find("start-quiz-btn")

    if (startQuizButton) {
        startQuizButton.addEventListener("click", () => {
            window.Missions.startMission("quiz")
        })
    }

    // Start evidence mission
    const startEvidenceButton = find("start-evidence-btn")

    if (startEvidenceButton) {
        startEvidenceButton.addEventListener("click", () => {
            window.Missions.startMission("evidence")
        })
    }

    // Update timer
    document.addEventListener("timer:tick", (event) => {
        setText(
            "timer",
            "Time " + window.Missions.formatTime(event.detail.timeLeft)
        )
    })

    // Timer expired
    document.addEventListener("timer:expired", () => {
        setText("mission-question", "")

        const options = find("mission-options")

        if (options) {
            options.innerHTML = ""
        }

        showFeedback("Time is up!")
    })

    // No attempts left
    document.addEventListener("attempts:empty", () => {
        showFeedback(
            "No attempts left. You can now go to the Accuse section."
        )
    })

    // Display notice
    document.addEventListener("mission:notice", (event) => {
        showNotice(event.detail.message)
    })

    // Mission blocked
    document.addEventListener("mission:blocked", (event) => {
        if (event.detail.reason === "no-attempts") {
            showFeedback("No attempts left. Go to the Accuse section.")
        } else {
            showFeedback("Time is up!")
        }
    })

    // Display question and answer buttons
    document.addEventListener("mission:started", (event) => {
        const question = event.detail.question
        const questionElement = find("mission-question")
        const optionsElement = find("mission-options")

        showFeedback("")
        showNotice("")

        if (questionElement) {
            questionElement.textContent = question.text
        }

        if (!optionsElement) {
            return
        }

        optionsElement.innerHTML = ""

        question.options.forEach((optionText) => {
            const button = document.createElement("button")

            button.type = "button"
            button.className = "main-btn"
            button.textContent = optionText

            button.addEventListener("click", () => {
                window.Missions.answerMission(optionText)
            })

            optionsElement.appendChild(button)
        })
    })

    // Display answer result
    document.addEventListener("mission:finished", (event) => {
        const result = event.detail

        setText(
            "mission-attempts",
            "Attempts left: " + result.attemptsLeft
        )

        setText(
            "missions-count",
            "Attempts " + result.attemptsLeft + " left"
        )

        setText("mission-question", "")

        const options = find("mission-options")

        if (options) {
            options.innerHTML = ""
        }

        if (result.correct && result.clue) {
            showFeedback(
                "Correct! A new clue has been added to your evidence."
            )
        } else if (result.correct) {
            showFeedback(
                "Correct! There are no more clues to unlock."
            )
        } else {
            showFeedback(
                "Not quite. The correct answer was: " + result.correctAnswer
            )
        }
    })

    // Add clues to the existing Evidence Drawer
    document.addEventListener("clue:unlocked", (event) => {
        const evidenceList = find("evidence-list")

        if (!evidenceList) {
            return
        }

        const emptyMessage = evidenceList.querySelector(".loading-message")

        if (emptyMessage) {
            emptyMessage.remove()
        }

        const item = document.createElement("p")

        item.className = "clue"
        item.textContent = event.detail.clue.text

        evidenceList.appendChild(item)

        const evidenceCount = find("evidence-count")

        if (evidenceCount) {
            evidenceCount.textContent =
                window.gameState.unlockedClues.length
        }
    })

    // Initialize attempts display
    document.addEventListener("DOMContentLoaded", () => {
        setText(
            "mission-attempts",
            "Attempts left: " + window.gameState.attemptsLeft
        )
    })
})()