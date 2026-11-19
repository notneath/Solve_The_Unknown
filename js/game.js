// GET PLAYER INFORMATION

const playerData = JSON.parse(
    sessionStorage.getItem("playerData") || "null"
);


// CHECK PLAYER DATA

if (!playerData) {

    window.location.href = "index.html";

}


// GET SCREENS

const caseScreen = document.getElementById("case-screen");

const dashboardScreen =
    document.getElementById("dashboard-screen");


// BACK TO START

document.getElementById("back-btn")
    .addEventListener("click", function() {

        window.location.href = "index.html";

    });


// DISPLAY PLAYER INFORMATION

if (playerData) {

    document.getElementById("dashboard-summary").textContent =
        "Welcome " + playerData.name +
        "! Difficulty: " + playerData.difficulty;

}


// SWITCH DASHBOARD SECTIONS

function showDashboardSection(sectionId, button) {

    const sections = document.querySelectorAll(".dashboard-section");

    sections.forEach(function(section) {

        section.classList.add("hidden");

    });

    document.getElementById(sectionId)
        .classList.remove("hidden");

    document.querySelectorAll(".tab-btn")
        .forEach(function(btn) {

            btn.classList.remove("active");

        });

    button.classList.add("active");

}


// NAVIGATION BUTTONS

document.querySelectorAll(".tab-btn[data-section]")
    .forEach(function(button) {

        button.addEventListener("click", function() {

            showDashboardSection(button.dataset.section, button);

        });

    });


// BEGIN INVESTIGATION

document.getElementById("begin-investigation-btn")
    .addEventListener("click", function() {

        caseScreen.classList.add("hidden");

        dashboardScreen.classList.remove("hidden");

        // Generate suspects
        displaySuspects();

        // Start timer
        startTimer();

    });


// TIMER FOR MEMBER 3



// EVIDENCE DRAWER

const evidenceDrawer =
    document.getElementById("evidence-drawer");

const drawerOverlay =
    document.getElementById("drawer-overlay");


// OPEN DRAWER

document.getElementById("evidence-btn")
    .addEventListener("click", function() {

        evidenceDrawer.classList.add("open");

        drawerOverlay.classList.add("open");

    });


// CLOSE DRAWER

function closeEvidenceDrawer() {

    evidenceDrawer.classList.remove("open");

    drawerOverlay.classList.remove("open");

}

document.getElementById("close-evidence-btn")
    .addEventListener("click", closeEvidenceDrawer);

drawerOverlay.addEventListener("click", closeEvidenceDrawer);
