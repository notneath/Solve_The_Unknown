
// // Get the buttons
// const soloBtn = document.getElementById("solo-btn");
// const teamBtn = document.getElementById("team-btn");

// // Get the input fields
// const playerName = document.getElementById("player-name");
// const teammateNames = document.getElementById("teammate-names");
// const teammateGroup = document.getElementById("teammate-group");

// // Difficulty buttons
// const easyBtn = document.getElementById("easy-btn");
// const mediumBtn = document.getElementById("medium-btn");
// const hardBtn = document.getElementById("hard-btn");

// // Suspect data

// const suspects = [
//     {
//         id: 1,
//         name: "Alex Morgan",
//         occupation: "Business Owner",
//         motive: "Financial disagreement"
//     },
//     {
//         id: 2,
//         name: "Sarah Lee",
//         occupation: "Employee",
//         motive: "Personal conflict"
//     },
//     {
//         id: 3,
//         name: "Daniel Smith",
//         occupation: "Friend",
//         motive: "Unknown"
//     },
//     {
//         id: 4,
//         name: "Emily Brown",
//         occupation: "Assistant",
//         motive: "Unknown"
//     }
// ];


// // Default difficulty
// let difficulty = "easy";


// // Select Easy
// easyBtn.addEventListener("click", function() {

//     difficulty = "easy";

//     easyBtn.classList.add("active");
//     mediumBtn.classList.remove("active");
//     hardBtn.classList.remove("active");

// });

// // Select Medium
// mediumBtn.addEventListener("click", function() {

//     difficulty = "medium";

//     mediumBtn.classList.add("active");
//     easyBtn.classList.remove("active");
//     hardBtn.classList.remove("active");

// });

// // Select Hard
// hardBtn.addEventListener("click", function() {

//     difficulty = "hard";

//     hardBtn.classList.add("active");
//     easyBtn.classList.remove("active");
//     mediumBtn.classList.remove("active");

// });


// // Store selected game mode
// let gameMode = "solo";

// // Select Solo Mode
// soloBtn.addEventListener("click", function() {

//     gameMode = "solo";

//     soloBtn.classList.add("active");
//     teamBtn.classList.remove("active");

// });

// // Select Team Mode
// teamBtn.addEventListener("click", function() {

//     gameMode = "team";

//     teamBtn.classList.add("active");
//     soloBtn.classList.remove("active");

// });



// // Open Case File
// document.getElementById("open-case-btn")
//     .addEventListener("click", function() {

//         if (playerName.value.trim() === "") {
//             alert("Please enter your name or team name.");
//             return;
//         }

//         if (gameMode === "team" &&
//             teammateNames.value.trim() === "") {

//             alert("Please enter your teammate names.");
//             return;
//         }

//         // Store player information
//         const playerData = {
//             difficulty: difficulty,
//             mode: gameMode,
//             name: playerName.value,
//             teammates: teammateNames.value
//         };

//         console.log(playerData);

//         showScreen("case-screen");

//     });

// // Leaderboard Button
// document.getElementById("leaderboard-btn")
//     .addEventListener("click", function() {

//         alert("Leaderboard page will be connected later.");

//     });


// // Switch between screens
// function showScreen(screenId) {

//     // Select all screens
//     const screens =
//         document.querySelectorAll(".screen");

//     // Hide all screens
//     screens.forEach(function(screen) {
//         screen.classList.add("hidden");
//     });

//     // Show the selected screen
//     document.getElementById(screenId)
//         .classList.remove("hidden");

// }
// // Back to Start Screen
// document.getElementById("back-btn")
//     .addEventListener("click", function() {

//         showScreen("start-screen");

//     });


// function displaySuspects() {

//     const container =
//         document.getElementById("suspect-list");

//     container.innerHTML = "";

//     suspects.forEach(function(suspect) {

//         const card = document.createElement("div");

//         card.classList.add("suspect-card");

//         const avatar =
//             `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(suspect.name)}`;

//         card.innerHTML = `
//             <img src="${avatar}" alt="${suspect.name}">

//             <h3>${suspect.name}</h3>

//             <p>${suspect.occupation}</p>

//             <p>${suspect.motive}</p>

//             <button onclick="viewSuspect(${suspect.id})">
//                 View profile
//             </button>
//         `;

//         container.appendChild(card);

//     });

// }

// // Begin Investigation
// document.getElementById("begin-investigation-btn")
//     .addEventListener("click", function() {

//         // Generate suspect cards
//         displaySuspects();

//         // Open dashboard
//         showScreen("dashboard-screen");

//     });


// // Switch between Case File and Suspects sections
// function showDashboardSection(sectionId, button) {

//     document.getElementById(sectionId)
//         .scrollIntoView({ behavior: "smooth" });

//     document.querySelectorAll(".tab-btn")
//         .forEach(function(btn) {
//             btn.classList.remove("active");
//         });

//     button.classList.add("active");

// }


// // Open Evidence Drawer
// document.getElementById("evidence-btn")
//     .addEventListener("click", function() {

//         document.getElementById("evidence-drawer")
//             .classList.add("open");

//         document.getElementById("drawer-overlay")
//             .classList.add("open");

//     });


// // Close Evidence Drawer
// function closeEvidenceDrawer() {

//     document.getElementById("evidence-drawer")
//         .classList.remove("open");

//     document.getElementById("drawer-overlay")
//         .classList.remove("open");

// }

// document.getElementById("close-evidence-btn")
//     .addEventListener("click", closeEvidenceDrawer);

// document.getElementById("drawer-overlay")
//     .addEventListener("click", closeEvidenceDrawer);

