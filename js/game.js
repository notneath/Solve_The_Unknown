// GET PLAYER INFORMATION
const playerData = JSON.parse(sessionStorage.getItem("playerData") || "null")

// CHECK PLAYER DATA
if (!playerData) {
    window.location.href = "index.html"
}
// GET SCREENS
const caseScreen = document.getElementById("case-screen")
const dashboardScreen = document.getElementById("dashboard-screen")

// DISPLAY PLAYER INFORMATION
const welcomeMessage = document.getElementById("welcome-message")
if (playerData && welcomeMessage) {
    welcomeMessage.textContent = `Welcome ${playerData.name}! Difficulty: ${playerData.difficulty}`
}
// LOAD CASE FROM API (Member 1's getCase)
let caseData = null
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


// Fills the case file text from the data
const renderCase = () => {
    document.querySelector(".case-card h2").textContent = caseData.title
    document.querySelector(".case-description").textContent = caseData.summary

    const clueBox = document.getElementById("starter-clues")
    clueBox.innerHTML = ""
    ;(caseData.starterClues || []).forEach((clue, index) => {
        const box = document.createElement("div")
        box.classList.add("clue")

        const title = document.createElement("h4")
        title.textContent = `Clue 0${index + 1}: ${clue.title}`

        const text = document.createElement("p")
        text.textContent = clue.text

        box.append(title, text)
        clueBox.appendChild(box)
    })

    // Dashboard summary
    document.getElementById("dashboard-summary").textContent = caseData.summary
    const factList = document.getElementById("crime-facts")
    factList.innerHTML = ""
    ;(caseData.crimeDetails || caseData.crimeFacts || []).forEach(fact => {
        const item = document.createElement("li")
        item.textContent = fact
        factList.appendChild(item)
    })

    // Dashboard victim
    const victim = caseData.victim
    document.getElementById("victim-name").textContent = victim.name
    document.getElementById("victim-details").textContent = `Age ${victim.age}. ${victim.details}`
    setAvatar(
        document.querySelector(".victim-avatar"),
        victim.name,
        "Portrait of " + victim.name
    )
}
const loadCase = async () => {
    if (typeof getCase !== "function") {
        console.warn("getCase not found")
        return
    }
    try {
        showLoading()
        const data = await getCase(1)
        caseData = Array.isArray(data) ? data[0] : data
        console.log("CASE DATA:", caseData)
        suspects = caseData.suspects
        window.gameState = window.gameState || {}
        window.gameState.caseData = caseData
        renderCase()
        clearStatus()
        setupClues()
        buildAccuseSuspects()
    } catch (error) {
        console.error(error)
        showError("Could not load the case. Check your internet and try again.")
    }
}  
loadCase()

// BACK TO START
document.getElementById("back-btn").addEventListener("click", () => {
        window.location.href = "index.html"
})

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
document.getElementById("begin-investigation-btn").addEventListener("click", async () => {
        if (typeof createProgress === "function") {
            try {
                const progress = await createProgress({
                    mode: playerData.mode,
                    name: playerData.name
                })
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

        displaySuspects()
        if (window.Missions) window.Missions.startTimer()
    })
// TIMER FOR MEMBER 3



// EVIDENCE DRAWER
// const evidenceDrawer = document.getElementById("evidence-drawer")
// const drawerOverlay = document.getElementById("drawer-overlay")

// // OPEN DRAWER
// document.getElementById("evidence-btn").addEventListener("click", () => {
//         evidenceDrawer.classList.add("open")
//         drawerOverlay.classList.add("open")
// })
// // CLOSE DRAWER

// const closeEvidenceDrawer = () => {
//     evidenceDrawer.classList.remove("open")
//     drawerOverlay.classList.remove("open")
// }

// document.getElementById("close-evidence-btn").addEventListener("click", closeEvidenceDrawer)
// drawerOverlay.addEventListener("click", closeEvidenceDrawer)




// EVIDENCE + ACCUSE 

const allClues = []          // {id, title, text, mission, found}
let collectedClues = []

const setupClues = () => {
    allClues.length = 0
    if (!caseData) return
    ;(caseData.starterClues || []).forEach(c => allClues.push({ ...c, mission: 0, found: true }))
    ;(caseData.quizClues || []).forEach(c => allClues.push({ ...c, found: false }))
    renderEvidenceBoard()
}

// Call this from missions.js when mission N completes
const unlockClueForMission = (missionNumber) => {
    const clue = allClues.find(c => c.mission === missionNumber && !c.found)
    if (clue) {
        clue.found = true
        renderEvidenceBoard()
    }
}
window.unlockClueForMission = unlockClueForMission   // missions.js can call it

const renderEvidenceBoard = () => {
    collectedClues = allClues.filter(c => c.found)
    const board = document.getElementById("evidence-board")
    const counter = document.getElementById("evidence-counter")
    if (board) {
        board.innerHTML = ""
        allClues.forEach(clue => {
            const card = document.createElement("div")
            card.className = clue.found ? "clue-card found" : "clue-card locked"
            if (clue.found) {
                card.innerHTML = `<h4>${clue.title}</h4><p>${clue.text}</p>`
            } else {
                card.innerHTML = `<h4>🔒 Clue locked</h4><p>Complete Mission ${clue.mission} to unlock.</p>`
            }
            board.appendChild(card)
        })
    }
    if (counter) {
        const total = allClues.length
        counter.textContent = `${collectedClues.length} of ${total} clues found`
    }

   

    renderAccuseClueList()




}

const renderAccuseClueList = () => {
    const list = document.getElementById("accuse-clue-list")
    if (!list) return
    list.innerHTML = collectedClues.length
        ? collectedClues.map(c => `<li><strong>${c.title}:</strong> ${c.text}</li>`).join("")
        : "<li>No clues collected yet.</li>"
}

// ---- ACCUSE PAGE ----

let selectedSuspectId = ""

const buildAccuseSuspects = () => {
    const list = document.getElementById("accuse-suspect-list")
    if (!list || !caseData) return

    selectedSuspectId = ""
    list.innerHTML = ""
    ;(caseData.suspects || []).forEach(suspect => {
        const button = document.createElement("button")
        button.type = "button"
        button.className = "suspect-choice"
        button.dataset.suspectId = suspect.id
        button.textContent = `${suspect.name} - ${suspect.role}`
        button.addEventListener("click", () => {
            selectedSuspectId = suspect.id
            list.querySelectorAll(".suspect-choice").forEach(choice => choice.classList.remove("selected"))
            button.classList.add("selected")
        })



    
        list.appendChild(button)
    })
}

const submitAccusation = async () => {
    const suspectId = selectedSuspectId
    const reasoning = document.getElementById("accuse-reasoning").value.trim()
    const resultBox = document.getElementById("accuse-result")
    const submitBtn = document.getElementById("submit-accusation-btn")
    
    

    

    if (!suspectId) {
        resultBox.className = "wrong"
        resultBox.classList.remove("hidden")
        resultBox.textContent = "You must choose a suspect!"
        return
    }
    if (!reasoning) {
        resultBox.className = "wrong"
        resultBox.classList.remove("hidden")
        resultBox.textContent = "You must explain your reasoning!"
        return
    }

    resultBox.classList.remove("hidden")

    // 3 attempts (stored so it survives refreshes)
    let attemptsLeft = Number(sessionStorage.getItem("attemptsLeft") ?? 3)

    if (suspectId === caseData.solution.culpritId) {
        resultBox.className = "win"
        resultBox.innerHTML = `<h3> Correct! ${caseData.solution.culpritName} did it!</h3>
            <p>${caseData.solution.howItHappened}</p>
            <ul>${caseData.solution.explanation.map(e => `<li>${e}</li>`).join("")}</ul>`
        submitBtn.disabled = true
        // save score (Member 1's API)
        const progressId = sessionStorage.getItem("progressId")
        if (progressId && typeof saveResult === "function") {
            try {
                await saveResult(progressId, {
                    score: attemptsLeft * 100,
                    timeTaken: window.Missions?.getTimeTaken?.() ?? 0,
                    culprit: suspectId
                })
            } catch (e) { console.error(e) }
        }
    } else {
        attemptsLeft--
        sessionStorage.setItem("attemptsLeft", attemptsLeft)
        const wrong = caseData.suspects.find(s => s.id === suspectId)
        if (attemptsLeft <= 0) {
            resultBox.className = "lose"
            resultBox.innerHTML = `<h3>❌ Out of attempts!</h3>
                <p>It was ${caseData.solution.culpritName}. ${caseData.solution.howItHappened}</p>`
            submitBtn.disabled = true
        } else {
            resultBox.className = "wrong"
            resultBox.innerHTML = `<h3>❌ ${wrong.name} is not the culprit.</h3>
                <p>Attempts left: ${attemptsLeft}</p>`
        }
    }
}

document.getElementById("submit-accusation-btn")
    .addEventListener("click", submitAccusation)

