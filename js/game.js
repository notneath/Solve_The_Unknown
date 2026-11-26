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
    caseData.starterClues.forEach((clue, index) => {
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
    caseData.crimeDetails.forEach(fact => {
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
const evidenceDrawer = document.getElementById("evidence-drawer")
const drawerOverlay = document.getElementById("drawer-overlay")

// OPEN DRAWER
document.getElementById("evidence-btn").addEventListener("click", () => {
        evidenceDrawer.classList.add("open")
        drawerOverlay.classList.add("open")
})
// CLOSE DRAWER

const closeEvidenceDrawer = () => {
    evidenceDrawer.classList.remove("open")
    drawerOverlay.classList.remove("open")
}

document.getElementById("close-evidence-btn").addEventListener("click", closeEvidenceDrawer)
drawerOverlay.addEventListener("click", closeEvidenceDrawer)
