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




// STORE CASE DATA HERE
let caseData = null
let progressId = null
const collectedClues = []
const CASE_FALLBACK = null

if (CASE_FALLBACK) {
    caseData = CASE_FALLBACK
} else {
    alert("could not load case data. Please refresh.")
    return
}



// LOAD THE CASE FROM FRIEND'S API
const loadCase = async () => {
    CULPRIT_ID = caseData.solution.culpritId
    try {
        const res = await fetch ("mockApi.json")
        if (!res.ok) throw new Error("HTTP " + res.status)
            caseData = await res.json()
    } catch (err) {
        console.warn("Could not load case data:", err)
        caseData = CASE_FALLBACK // small copy from json

    }
    renderIntro()
    buildAccuseList()
    renderEvidenceBoard()
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

//show case intro
renderIntro()
// SHOW CASE INTRO (title, summary, crime facts)
const renderIntro = () => {
    document.getElementById("case-title").textContent = caseData.title
    document.getElementById("case-summary").textContent = caseData.summary

    const factsList = document.getElementById("case-facts")
    factsList.innerHTML = ""
    caseData.crimeFacts.forEach(fact => {
        const li = document.createElement("li")
        li.textContent = fact
        factsList.appendChild(li)
    })
}


// LOAD CASE WHEN PAGE OPENS
loadCase()

// BUILD ACCUSE PAGE RADIO BUTTONS
const buildAccuseList = () => {
    const list = document.getElementById("accuse-list")
    list.innerHTML = ""
    caseData.suspects.forEach(s => {
        const label = document.createElement("label")
        label.className = "suspect-option"
        label.innerHTML = `
            <input type="radio" name="accusation" value="${s.id}">
            <div>
                <strong>s.name</strong>-{s.name}</strong> -s.name</strong>-{s.role}
                <p>${s.background}</p>
                <p><em>Alibi:</em> ${s.alibi}</p>
            </div>
        `
        list.appendChild(label)
    })
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


    const CULPRIT_ID = caseData.solution.culpritId //dana
    const correct = chosen.value === CULPRIT_ID

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
        : `The real culprit was suspect number ${caseData.solution.culpritName}.`

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

    const allClues = [...caseData.starterClues, ...caseData.quizClues]
    document.getElementById("evidence-counter").textContent = 
      `Evidence board: ${collectedClues.length} of ${allClues.length} clues found`

    const visible = allClues.filter(c => collectedClues.includes(c.id))
    visible.forEach (clue => {
        const card = document.createElement("div")
        card.className = "clue-card"
        card.innerHTML = `
            <h3>${clue.title}</h3>
            <p>${clue.text}</p>
            ${clue.mission ? `<span class="clue-tag">Misson${clue.mission}</span>` : `<span class="clue-tag">Starting clue</span>`}
        `
        board.appendChild(card)
    })

    if (visible.length === 0) {
        board.innerHTML = "<p>No clues found yet. Keep investigating!</p>"
    }

      

   
}

document.getElementById("go-to-missions-btn").addEventListener("click", () => {
    showDashboardSection("missions-section")
    closeEvidenceDrawer()
})

document.getElementById("ready-to-accuse-btn").addEventListener("click", () => {
    showDashboardSection("accuse-section")
    closeEvidenceDrawer()
})
