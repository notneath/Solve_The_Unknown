//GET PLAYER INFORMATION
const playerData = JSON.parse(sessionStorage.getItem("playerData") || "null")

if (!playerData) {
    window.location.href = "index.html"
    throw new Error("No player data")
}

// screen
const caseScreen = document.getElementById("case-screen")
const dashboardScreen = document.getElementById("dashboard-screen")

const welcomeMessage = document.getElementById("welcome-message")
if (welcomeMessage) {
    welcomeMessage.textContent = `Welcome ${playerData.name}! Difficulty: ${playerData.difficulty}`
}

// state
let caseData = null
let progressId = null
let startTime = null
let selectedSuspectId = ""
const allClues = [] 
let collectedClues = []

const statusMessage = document.getElementById("status-message")
const beginBtn = document.getElementById("begin-investigation-btn")

const showLoading = () => {
    statusMessage.className = "loading-message"
    statusMessage.textContent = "Loading case..."
    beginBtn.disabled = true
}
const showError = (text) => {
    statusMessage.className = "error-message"
    statusMessage.textContent = text
}
const clearStatus = () => {
    statusMessage.className = ""
    statusMessage.textContent = ""
    beginBtn.disabled = false
}

// render case
const renderCase = () => {
    const starterClues = Array.isArray(caseData.starterClues) ? caseData.starterClues : []
    const crimeDetails = Array.isArray(caseData.crimeDetails) ? caseData.crimeDetails : []
    const victim = caseData.victim || { name: "Unknown", age: "?", details: "" }

    document.querySelector(".case-card h2").textContent = caseData.title || "Untitled case"
    document.querySelector(".case-description").textContent = caseData.summary || ""

    const clueBox = document.getElementById("starter-clues")
    clueBox.innerHTML = ""
    starterClues.forEach((clue, index) => {
        const box = document.createElement("div")
        box.classList.add("clue")
        const title = document.createElement("h4")
        title.textContent = `Clue 0${index + 1}: ${clue.title}`
        const text = document.createElement("p")
        text.textContent = clue.text
        box.append(title, text)
        clueBox.appendChild(box)
    })

    document.getElementById("dashboard-summary").textContent = caseData.summary || ""
    const factList = document.getElementById("crime-facts")
    factList.innerHTML = ""
    crimeDetails.forEach(fact => {
        const item = document.createElement("li")
        item.textContent = fact
        factList.appendChild(item)
    })

    document.getElementById("victim-name").textContent = victim.name
    document.getElementById("victim-details").textContent =
        `${victim.role ? victim.role + ", " : ""}Age ${victim.age}. ${victim.details}`
    setAvatar(
        document.querySelector(".victim-avatar"),
        victim.name,
        "Portrait of " + victim.name
    )
}

// evidence
const setupClues = () => {
    allClues.length = 0
    if (!caseData) return
    ;(caseData.starterClues || []).forEach(c => allClues.push({ ...c, found: true }))
    ;(caseData.extraClues || []).forEach(c => allClues.push({ ...c, found: false }))
    renderEvidence()
}

const renderEvidence = () => {
    collectedClues = allClues.filter(c => c.found)

    const list = document.getElementById("evidence-list")
    const count = document.getElementById("evidence-count")
    const btn = document.getElementById("evidence-btn")

    if (list) {
        list.innerHTML = ""
        collectedClues.forEach(c => {
            const box = document.createElement("div")
            box.classList.add("clue")
            const h = document.createElement("h4")
            h.textContent = c.title || "Clue"
            const p = document.createElement("p")
            p.textContent = c.text
            box.append(h, p)
            list.appendChild(box)
        })
    }
    if (count) count.textContent = collectedClues.length
    if (btn) btn.textContent = `Evidence (${collectedClues.length})`

    renderAccuseClueList()
}

const renderAccuseClueList = () => {
    const list = document.getElementById("accuse-clue-list")
    if (!list) return
    list.innerHTML = ""
    collectedClues.forEach(c => {
        const p = document.createElement("p")
        p.textContent = (c.title ? c.title + ": " : "") + c.text
        list.appendChild(p)
    })
}

// a correct mission answer unlocks the next locked clue
document.addEventListener("clue:unlocked", () => {
    const next = allClues.find(c => !c.found)
    if (next) {
        next.found = true
        renderEvidence()
    }
})

// accusation
const buildAccuseSuspects = () => {
    const list = document.getElementById("accuse-suspect-list")
    if (!list || !caseData) return

    selectedSuspectId = ""
    list.innerHTML = ""
    ;(caseData.suspects || []).forEach(suspect => {
        const button = document.createElement("button")
        button.type = "button"
        button.className = "suspect-choice"
        button.textContent = `${suspect.name} - ${suspect.role || suspect.occupation || ""}`
        button.addEventListener("click", () => {
            selectedSuspectId = suspect.id
            list.querySelectorAll(".suspect-choice").forEach(c => c.classList.remove("selected"))
            button.classList.add("selected")
        })
        list.appendChild(button)
    })
}

// load case
const loadCase = async () => {
    if (typeof getCase !== "function") {
        showError("Could not load the case. getCase is missing.")
        return
    }
    try {
        showLoading()
        const data = await getCase(1)
        caseData = Array.isArray(data) ? data[0] : data
        console.log("CASE DATA:", caseData)

        // map the record's field names to the names the code uses
        caseData.crimeDetails = caseData.crimeDetails || caseData.crimeFacts || []
        caseData.extraClues = caseData.extraClues || caseData.quizClues || []
        caseData.evidenceMissions = caseData.evidenceMissions || []

        suspects = (Array.isArray(caseData.suspects) ? caseData.suspects : []).map(s => ({
            ...s,
            occupation: s.occupation || s.role
        }))

        window.gameState = window.gameState || {}
        window.gameState.caseData = caseData

        renderCase()
        setupClues()
        buildAccuseSuspects()
        clearStatus()
    } catch (error) {
        console.error(error)
        showError("Could not load the case. Check your internet and try again.")
    }
}
loadCase()

// navigation
document.getElementById("back-btn").addEventListener("click", () => {
    window.location.href = "index.html"
})

const showDashboardSection = (sectionId, button) => {
    const target = document.getElementById(sectionId)
    if (!target) {
        console.warn(`Section not found: ${sectionId}`)
        return
    }
    document.querySelectorAll(".dashboard-section").forEach(s => s.classList.add("hidden"))
    target.classList.remove("hidden")
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"))
    if (button) button.classList.add("active")
}

document.querySelectorAll(".tab-btn[data-section]").forEach(button => {
    button.addEventListener("click", () => showDashboardSection(button.dataset.section, button))
})

// begin investigation
beginBtn.addEventListener("click", async () => {
    if (typeof createProgress === "function") {
        try {
            const progress = await createProgress({
                mode: playerData.mode || playerData.difficulty,
                name: playerData.name
            })
            progressId = progress.id
            sessionStorage.setItem("progressId", progress.id)
            window.gameState = window.gameState || {}
            window.gameState.progressId = progress.id
        } catch (error) {
            console.error(error)
            showError("Could not start the game. Please try again.")
            return
        }
    }

    caseScreen.classList.add("hidden")
    dashboardScreen.classList.remove("hidden")
    startTime = Date.now()

    // fresh game state
    sessionStorage.removeItem("attemptsLeft")
    document.getElementById("submit-accusation-btn").disabled = false
    document.getElementById("accuse-result").classList.add("hidden")
    const cluesList = document.getElementById("clues")
    if (cluesList) cluesList.innerHTML = ""

    displaySuspects()
    if (window.Missions) {
        window.Missions.resetMissions()
        window.Missions.startTimer()
    }
    setupClues()          
    buildAccuseSuspects()
})

// evidence drawer
const evidenceDrawer = document.getElementById("evidence-drawer")
const drawerOverlay = document.getElementById("drawer-overlay")

const closeEvidenceDrawer = () => {
    evidenceDrawer.classList.remove("open")
    drawerOverlay.classList.remove("open")
}

document.getElementById("evidence-btn").addEventListener("click", () => {
    evidenceDrawer.classList.add("open")
    drawerOverlay.classList.add("open")
})
document.getElementById("close-evidence-btn").addEventListener("click", closeEvidenceDrawer)
drawerOverlay.addEventListener("click", closeEvidenceDrawer)

// accusation
const showResult = (kind, title, html) => {
    const box = document.getElementById("accuse-result")
    box.classList.remove("hidden", "correct", "wrong")
    box.classList.add(kind)
    document.getElementById("accuse-result-title").textContent = title
    document.getElementById("accuse-result-text").innerHTML = html
}

const submitAccusation = async () => {
    const reasoning = document.getElementById("accuse-reasoning").value.trim()
    const submitBtn = document.getElementById("submit-accusation-btn")

    if (!caseData) return
    if (!selectedSuspectId) return showResult("wrong", "Pick a suspect", "You must choose a suspect!")
    if (!reasoning) return showResult("wrong", "Explain yourself", "You must explain your reasoning!")

    const solution = caseData.solution
    let attemptsLeft = Number(sessionStorage.getItem("attemptsLeft") ?? 3)

    if (selectedSuspectId === solution.culpritId) {
        showResult(
            "correct",
            `Correct! ${solution.culpritName} did it!`,
            solution.howItHappened + "<br><br>" + solution.explanation.join("<br>")
        )
        submitBtn.disabled = true
        if (window.Missions) window.Missions.stopTimer()

        if (progressId !== null && typeof saveResult === "function") {
            const elapsed = startTime ? Math.floor((Date.now() - startTime) / 60000) : 0
            try {
                await saveResult(progressId, {
                    score: attemptsLeft * 100,
                    timeTaken: elapsed,
                    cluesUsed: collectedClues.length
                })
            } catch (e) {
                console.warn("Could not save result:", e.message)
            }
        }
    } else {
        attemptsLeft--
        sessionStorage.setItem("attemptsLeft", attemptsLeft)
        const wrong = caseData.suspects.find(s => s.id === selectedSuspectId)
        if (attemptsLeft <= 0) {
            showResult(
                "wrong",
                "Out of attempts!",
                `It was ${solution.culpritName}. ${solution.howItHappened}`
            )
            submitBtn.disabled = true
            if (window.Missions) window.Missions.stopTimer()
        } else {
            showResult("wrong", `${wrong.name} is not the culprit.`, `Accusations left: ${attemptsLeft}`)
        }
    }
}

document.getElementById("submit-accusation-btn").addEventListener("click", submitAccusation)

document.getElementById("restart-btn").addEventListener("click", async () => {
    try {
        if (progressId !== null && typeof deleteProgress === "function") await deleteProgress(progressId)
    } catch (err) {
        console.warn(err.message)
    }
    sessionStorage.removeItem("attemptsLeft")
    window.location.reload()
})

