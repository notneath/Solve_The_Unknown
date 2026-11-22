// buttons
const soloBtn = document.getElementById("solo-btn")
const teamBtn = document.getElementById("team-btn")

const easyBtn = document.getElementById("easy-btn")
const mediumBtn = document.getElementById("medium-btn")
const hardBtn = document.getElementById("hard-btn")

// inputs
const playerName = document.getElementById("player-name")
const teammateNames = document.getElementById("teammate-names")
const teammateGroup = document.getElementById("teammate-group")

// Default settings
let difficulty = "easy"
let gameMode = "solo"

// Difficulty
const selectedDifficulty = (selectedDifficulty) => {
    difficulty = selectedDifficulty
    easyBtn.classList.toggle("active", difficulty === "easy")
    mediumBtn.classList.toggle("active", difficulty === "medium")
    hardBtn.classList.toggle("active", difficulty === "hard")
}

easyBtn.addEventListener("click", () => selectedDifficulty("easy"))
mediumBtn.addEventListener("click", () => selectedDifficulty("medium"))
hardBtn.addEventListener("click", () => selectedDifficulty("hard"))

// Game Mode
const updateGameMode = () => {
    teammateGroup.classList.toggle("hidden", gameMode === "solo")
}
soloBtn.addEventListener("click", () => {
    gameMode = "solo"
    soloBtn.classList.add("active")
    teamBtn.classList.remove("active")
})
teamBtn.addEventListener("click", () => {
    gameMode = "team"
    teamBtn.classList.add("active")
    soloBtn.classList.remove("active")
})
// Initial setup
updateGameMode()


// Open Case File
document.getElementById("open-case-btn").addEventListener("click", () => {
    if (playerName.value.trim() === "") {
        alert("Please enter your name or team name")
        return
    }

    if (gameMode === "team" && teammateNames.value.trim() === ""){
        alert("Please enter you teammate names.")
        return
    }

    const playerData = {
        difficulty,
        mode: gameMode,
        name: playerName.value.trim(),
        teammates: gameMode === "team" ? teammateNames.value.trim() : ""
    }
    // Transfer data to game.html
    sessionStorage.setItem("playerData", JSON.stringify(playerData))
    window.location.href = "game.html"

})

// LEADERBOARD NAVIGATION
document.getElementById("leaderboard-btn").addEventListener("click", () => {
    window.location.href = "leaderboard.html"
})