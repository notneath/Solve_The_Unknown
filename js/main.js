
// Get buttons
const soloBtn = document.getElementById("solo-btn");
const teamBtn = document.getElementById("team-btn");

const easyBtn = document.getElementById("easy-btn");
const mediumBtn = document.getElementById("medium-btn");
const hardBtn = document.getElementById("hard-btn");

// Get inputs
const playerName = document.getElementById("player-name");
const teammateNames = document.getElementById("teammate-names");
const teammateGroup = document.getElementById("teammate-group");

// Default settings
let difficulty = "easy";
let gameMode = "solo";


// DIFFICULTY SELECTION

function selectDifficulty(selectedDifficulty) {

    difficulty = selectedDifficulty;

    easyBtn.classList.toggle("active", difficulty === "easy");
    mediumBtn.classList.toggle("active", difficulty === "medium");
    hardBtn.classList.toggle("active", difficulty === "hard");

}

easyBtn.addEventListener("click", function() {
    selectDifficulty("easy");
});

mediumBtn.addEventListener("click", function() {
    selectDifficulty("medium");
});

hardBtn.addEventListener("click", function() {
    selectDifficulty("hard");
});


// GAME MODE SELECTION

function updateGameMode() {

    teammateGroup.classList.toggle("hidden", gameMode === "solo");

}

soloBtn.addEventListener("click", function() {

    gameMode = "solo";

    soloBtn.classList.add("active");
    teamBtn.classList.remove("active");

    updateGameMode();

});

teamBtn.addEventListener("click", function() {

    gameMode = "team";

    teamBtn.classList.add("active");
    soloBtn.classList.remove("active");

    updateGameMode();

});


// Initial setup
updateGameMode();


// OPEN CASE FILE

document.getElementById("open-case-btn")
    .addEventListener("click", function() {

        if (playerName.value.trim() === "") {

            alert("Please enter your name or team name.");
            return;

        }

        if (gameMode === "team" &&
            teammateNames.value.trim() === "") {

            alert("Please enter your teammate names.");
            return;

        }

        // Save player information
        const playerData = {

            difficulty: difficulty,

            mode: gameMode,

            name: playerName.value.trim(),

            teammates: gameMode === "team"
                ? teammateNames.value.trim()
                : ""

        };

        // Transfer data to game.html
        sessionStorage.setItem(
            "playerData",
            JSON.stringify(playerData)
        );

        window.location.href = "game.html";

    });


// LEADERBOARD NAVIGATION

document.getElementById("leaderboard-btn")
    .addEventListener("click", function() {

        window.location.href = "leaderboard.html";

    });
