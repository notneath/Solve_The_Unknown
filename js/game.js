// GET PLAYER INFORMATION
const playerData = JSON.parse(sessionStorage.getItem("playerData") || "null")

// CHECK PLAYER DATA
if (!playerData) {
    window.location.href = "index.html"
}
// GET SCREENS
const caseScreen = document.getElementById("case-screen")
const dashboardScreen = document.getElementById("dashboard-screen")
// BACK TO START

document.getElementById("back-btn").addEventListener("click", () => {
        window.location.href = "index.html"
})
// DISPLAY PLAYER INFORMATION
if (playerData) {
    document.getElementById("dashboard-summary").textContent = `Welcome ${playerData.name}! Difficulty: ${playerData.difficulty}`
}

// SWITCH DASHBOARD SECTIONS
const showDashboardSection = (sectionId, button) => {
    const target = document.getElementById(sectionId)

    if (!target) {
        console.warn(`Section not found: ${sectionId}`)
        return
    }

    document.querySelectorAll(".dashboard-section")
        .forEach(section => section.classList.add("hidden"))

    target.classList.remove("hidden")

    document.querySelectorAll(".tab-btn")
        .forEach(btn => btn.classList.remove("active"))

    if (button) button.classList.add("active")
}
// NAVIGATION BUTTONS
document.querySelectorAll(".tab-btn[data-section]").forEach(button => {
    button.addEventListener("click", () => {
        showDashboardSection(button.dataset.section, button)
    })
})
// BEGIN INVESTIGATION
document.getElementById("begin-investigation-btn").addEventListener("click", () => {
    caseScreen.classList.add("hidden")
    dashboardScreen.classList.remove("hidden")

    displaySuspects()
    if (typeof startTimer === "function") startTimer()
})
// TIMER FOR MEMBER 3



// EVIDENCE DRAWER
const evidenceDrawer = document.getElementById("evidence-drawer")
const drawerOverlay = document.getElementById("drawer-overlay")

// OPEN DRAWER
const evidenceBtn = document.getElementById("evidence-btn")
if (evidenceBtn) {
    evidenceBtn.addEventListener("click", () => {
        evidenceDrawer.classList.add("open")
        drawerOverlay.classList.add("open")
    })
}

// CLOSE DRAWER

const closeEvidenceDrawer = () => {
    evidenceDrawer.classList.remove("open")
    drawerOverlay.classList.remove("open")
}

document.getElementById("close-evidence-btn").addEventListener("click", closeEvidenceDrawer)
drawerOverlay.addEventListener("click", closeEvidenceDrawer)

// ACCUSE PAGE

let CULPRIT_ID = null


// STORE CASE DATA HERE
let caseData = null
let progressId = null
const collectedClues = []

// LOAD THE CASE FROM FRIEND'S API
const loadCase = async () => {
    try {
        caseData = await getCase(1)
        suspects = caseData.suspects        // refill the array suspects.js uses
        CULPRIT_ID = caseData.culpritId     // remember who did it

        displaySuspects() 
        renderEvidenceBoard()               // evidence board (theirs)
        buildAccuseList()                   // accuse page radio buttons (ours)
    } catch (err) {
        console.warn("Could not load case:", err.message)
    }
}


// START SESSION WHEN INVESTIGATION BEGINS
document.getElementById("begin-investigation-btn").addEventListener("click", async () => {
    try {
        const session = await createProgress({
            mode: playerData.difficulty,
            name: playerData.name
        })
        progressId = session.id // save the id, needed later
    } catch (err) {
        console.warn("Could not start session:", err.message)
    }
})

// LOAD CASE WHEN PAGE OPENS
loadCase()

// BUILD ACCUSE PAGE RADIO BUTTONS
const buildAccuseList = () => {
    const list = document.getElementById("accuse-suspect-list")
    if (!list) return

    list.innerHTML = suspects.map(s => `
        <label class="accuse-option">
            <input type="radio" name="accusation" value="${s.id}">
            <span>${s.name}</span>
        </label>
    `).join("")
}




// SUBMIT ACCUSATION
document.getElementById("submit-accusation-btn").addEventListener("click", async () => {
    const chosen = document.querySelector('input[name="accusation"]:checked')
    const reasoning = document.getElementById("accuse-reasoning").value.trim()
    const errorBox = document.getElementById("accuse-error")

    // CHECK BOTH FIELDS
    if (!chosen || !reasoning) {
        errorBox.classList.remove("hidden")
        return
    }
    errorBox.classList.add("hidden")

    const correct = Number(chosen.value) === CULPRIT_ID

   // calculate time cuz nith hasnt done the timer yet
   const elapsed = typeof startTime === "number"
        ? Math.floor((Date.now() - startTime) / 60000)
        : 0

    // SAVE RESULT TO FRIEND'S API
    try {
        await saveResult(progressId, {
            score: correct ? 100 : 0,
            timeTaken: elapsed,
            cluesUsed: collectedClues.length
        })
    } catch (err) {
        console.warn("Could not save result:", err.message)
    }

    // SHOW RESULT BOX
    const resultBox = document.getElementById("accuse-result")
    resultBox.classList.remove("hidden", "correct", "wrong")
    resultBox.classList.add(correct ? "correct" : "wrong")

    document.getElementById("accuse-result-title").textContent =
        correct ? "Case Solved!" : "Wrong Accusation"
    document.getElementById("accuse-result-text").textContent = correct
        ? "Great detective work!"
        : `The real culprit was suspect number ${caseData.culpritId}.`

    resultBox.scrollIntoView({ behavior: "smooth" })
})

// RESTART GAME
document.getElementById("restart-btn").addEventListener("click", async () => {
    try {
        await deleteProgress(progressId)
    } catch (err) {
        console.warn(err.message)
    }
    window.location.reload()
})

// SAVE TO LEADERBOARD
document.getElementById("save-leaderboard-btn").addEventListener("click", () => {
    alert("Leaderboard coming soon!")  // placeholder until Member 4's part is ready
})

// ================= EVIDENCE BOARD =================

const renderEvidenceBoard = () => {
    const board = document.getElementById("evidence-board")
    board.innerHTML = ""   // clear and rebuild — this is the "no reload" trick

      

    const allClues = caseData.clues
    allClues.sort((a, b) => a.id - b.id)   // assumes caseData has a clues array

    allClues.forEach((clue) => {
        const card = document.createElement("div")

        // Is this clue collected? (check against collectedClues)
        const isFound = collectedClues.some(c => c.id === clue.id)

        card.className = "clue-card" + (isFound ? "" : " locked")

        if (isFound) {
            card.innerHTML = `
                <h3>${clue.title}</h3>
                <p>${clue.text}</p>
                <p>Related suspect: ${clue.relatedSuspect}</p>
            `
        } else {
            card.innerHTML = `
                <h3>${clue.title}</h3>
                <p>Locked. Complete a mission to unlock.</p>
            `
        }
        board.appendChild(card)
    })

    // update the counter: "3 of 5 clues found"
    document.getElementById("evidence-counter").textContent =
        `Evidence board: ${collectedClues.length} of ${allClues.length} clues found`
}

document.getElementById("go-to-missions-btn").addEventListener("click", () => {
    showDashboardSection("missions-section")
    closeEvidenceDrawer()
})

document.getElementById("ready-to-accuse-btn").addEventListener("click", () => {
    showDashboardSection("accuse-section")
    closeEvidenceDrawer()
})
