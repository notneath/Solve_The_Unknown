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
    document.querySelectorAll(".dashboard-section")
    .forEach(section => section.classList.add("hidden"))
    document.getElementById(sectionId).classList.remove("hidden")
    document.querySelectorAll(".tab-btn")
    .forEach(btn => btn.classList.remove("active"))
    button.classList.add("active")
}
// NAVIGATION BUTTONS
document.querySelectorAll(".tab-btn[data-section]").forEach(button => {
    button.addEventListener("click", () => {
        showDashboardSection(button.dataset.setion, button)
    })
})
// BEGIN INVESTIGATION
document.getElementById("begin-investigation-btn").addEventListener("click", () => {
    caseScreen.classList.add("hidden")
    dashboardScreen.classList.remove("hidden")

    displaySuspects()
    startTimer()
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
