
// BACK TO HOME

document.getElementById("back-home-btn")
    .addEventListener("click", function() {

        window.location.href = "index.html";

    });


// LEADERBOARD DATA

const leaderboard = [];


// DISPLAY LEADERBOARD

function displayLeaderboard() {

    const container =
        document.getElementById("leaderboard-list");

    container.innerHTML = "";

    if (leaderboard.length === 0) {

        container.innerHTML =
            "<p>No scores available yet.</p>";

        return;

    }

    leaderboard.forEach(function(player, index) {

        const item = document.createElement("p");

        item.textContent =
            (index + 1) + ". " +
            player.name + " - " +
            player.score + " points";

        container.appendChild(item);

    });

}

displayLeaderboard();
