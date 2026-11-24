// GET PLAYER INFORMATION
const playerData = JSON.parse(sessionStorage.getItem("playerData") || "null")

// CHECK PLAYER DATA
if (!playerData) {
    window.location.href = "index.html"
}
// GET SCREENS
const caseScreen = document.getElementById("case-screen")
const dashboardScreen = document.getElementById("dashboard-screen")

// LOAD CASE FROM API (Member 1's getCase)
// let caseData = null
// const statusMessage = document.getElementById("status-message")
// const beginBtn = document.getElementById("begin-investigation-btn")

// const showLoading = () => {
//     statusMessage.className = "loading-message"
//     statusMessage.textContent = "Loading case..."
//     beginBtn.disabled = true
// }

// const showError = (text) => {
//     statusMessage.className = "error-message"
//     statusMessage.textContent = text
// }

// const clearStatus = () => {
//     statusMessage.className = ""
//     statusMessage.textContent = ""
//     beginBtn.disabled = false
// }

// const loadCase = async () => {
//     try {
//         showLoading()
//         caseData = await getCase(1)
//         suspects = caseData.suspects
//         renderCase()
//         clearStatus()
//     } catch (error) {
//         showError("Could not load the case. Check your internet and try again.")
//     }
// }

// // Fills the case file text from the data
// const renderCase = () => {
//     document.querySelector(".case-card h2").textContent = caseData.title
//     document.querySelector(".case-description").textContent = caseData.summary
// }
// loadCase()  // runs when the page opens

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

// document.getElementById("begin-investigation-btn")
//     .addEventListener("click", async () => {

//         try {
//             const progress = await createProgress({
//                 mode: playerData.mode,
//                 name: playerData.name
//             })
//             sessionStorage.setItem("progressId", progress.id)
//         } catch (error) {
//             showError("Could not start the game. Please try again.")
//             return
//         }

//         caseScreen.classList.add("hidden")
//         dashboardScreen.classList.remove("hidden")

//         displaySuspects()
//         startTimer()
//     })
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
