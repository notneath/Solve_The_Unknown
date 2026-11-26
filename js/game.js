// ================= CONFIG / STATE =================
const playerData = JSON.parse(sessionStorage.getItem("playerData") || "null")

if (!playerData) {
    window.location.href = "index.html"
    throw new Error("No player data") // stop script execution
}

let caseData = null
let progressId = null
let CULPRIT_ID = null
let startTime = null
const collectedClues = []

// ================= SCREENS =================
const caseScreen = document.getElementById("case-screen")
const dashboardScreen = document.getElementById("dashboard-screen")

document.getElementById("dashboard-summary").textContent =
    `Welcome playerData.name!Difficulty:{playerData.name}! Difficulty:playerData.name!Difficulty:{playerData.difficulty}`

document.getElementById("back-btn").addEventListener("click", () => {
    window.location.href = "index.html"
})

// ================= SECTION SWITCHING =================
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

// ================= SUSPECTS / ACCUSE LIST =================
const displaySuspects = () => {
    const container = document.getElementById("suspect-list")
    if (!container || !caseData) return

    container.innerHTML = caseData.suspects.map(s => `
        <div class="suspect-card">
            <h3>${s.name}</h3>
            <p>${s.description || ""}</p>
        </div>
    `).join("")
}

const buildAccuseList = () => {
    const list = document.getElementById("accuse-suspect-list")
    if (!list || !caseData) return

    list.innerHTML = caseData.suspects.map(s => `
        <label class="accuse-option">
            <input type="radio" name="accusation" value="${s.id}">
            <span>${s.name}</span>
        </label>
    `).join("")
}

// ================= EVIDENCE BOARD =================
const renderEvidenceBoard = () => {
    const board = document.getElementById("evidence-board")
    if (!board || !caseData) return

    board.innerHTML = ""

    const allClues = [...caseData.clues].sort((a, b) => a.id - b.id)

    allClues.forEach(clue => {
        const card = document.createElement("div")
        const isFound = collectedClues.some(c => c.id === clue.id)

        card.className = "clue-card" + (isFound ? "" : " locked")

        card.innerHTML = isFound
            ? `<h3>${clue.title}</h3>
               <p>${clue.text}</p>
               <p>Related suspect: ${clue.relatedSuspect}</p>`
            : `<h3>${clue.title}</h3>
               <p>Locked. Complete a mission to unlock.</p>`

        board.appendChild(card)
    })

    document.getElementById("evidence-counter").textContent =
        `Evidence board: collectedClues.lengthof{collectedClues.length} ofcollectedClues.lengthof{allClues.length} clues found`
}

// ================= EVIDENCE DRAWER =================
// go-to buttons inside the evidence section
const on = (id, event, fn) => {
    const el = document.getElementById(id)
    if (el) el.addEventListener(event, fn)
}

on("go-to-missions-btn", "click", () =>
    showDashboardSection("missions-section",
        document.querySelector('[data-section="missions-section"]')))

on("ready-to-accuse-btn", "click", () =>
    showDashboardSection("accuse-section",
        document.querySelector('[data-section="accuse-section"]')))


// ================= CASE LOADING =================
const loadCase = async () => {
    try {
        caseData = await getCase(1)
        CULPRIT_ID = caseData.culpritId

        displaySuspects()
        renderEvidenceBoard()
        buildAccuseList()
    } catch (err) {
        console.warn("Could not load case:", err.message)
    }
}

// ================= BEGIN INVESTIGATION (single handler) =================
const beginInvestigation = async () => {
    caseScreen.classList.add("hidden")
    dashboardScreen.classList.remove("hidden")

    startTime = Date.now()

    try {
        const session = await createProgress({
            mode: playerData.difficulty,
            name: playerData.name
        })
        progressId = session.id
    } catch (err) {
        console.warn("Could not start session:", err.message)
    }

    displaySuspects()
}

document.getElementById("begin-investigation-btn")
    .addEventListener("click", beginInvestigation) // only ONE listener now

// ================= SUBMIT ACCUSATION =================
document.getElementById("submit-accusation-btn").addEventListener("click", async () => {
    const chosen = document.querySelector('input[name="accusation"]:checked')
    const reasoning = document.getElementById("accuse-reasoning").value.trim()
    const errorBox = document.getElementById("accuse-error")
    const resultBox = document.getElementById("accuse-result")

    // can't accuse without a loaded case
    if (!caseData || progressId === null) {
        alert("Case is still loading — try again in a moment.")
        return
    }

    if (!chosen || !reasoning) {
        errorBox.classList.remove("hidden")
        return
    }
    errorBox.classList.add("hidden")

    // THE FIX: actually compare the chosen suspect to the culprit
    const correct = Number(chosen.value) === Number(CULPRIT_ID)

    const elapsed = startTime
        ? Math.floor((Date.now() - startTime) / 60000)
        : 0

    try {
        await saveResult(progressId, {
            score: correct ? 100 : 0,
            timeTaken: elapsed,
            cluesUsed: collectedClues.length
        })
    } catch (err) {
        console.warn("Could not save result:", err.message)
    }

    resultBox.classList.remove("hidden", "correct", "wrong")
    resultBox.classList.add(correct ? "correct" : "wrong")

    document.getElementById("accuse-result-title").textContent =
        correct ? "Case Solved!" : "Wrong Accusation"

    document.getElementById("accuse-result-text").textContent = correct
        ? "Great detective work!"
        : `The real culprit was suspect number ${CULPRIT_ID}.`

    resultBox.scrollIntoView({ behavior: "smooth" })
})

// ================= RESTART / LEADERBOARD =================
document.getElementById("restart-btn").addEventListener("click", async () => {
    try {
        if (progressId !== null) await deleteProgress(progressId)
    } catch (err) {
        console.warn(err.message)
    }
    window.location.reload()
})

document.getElementById("save-leaderboard-btn").addEventListener("click", () => {
    alert("Leaderboard coming soon!")
})

// ================= INIT =================
loadCase()
