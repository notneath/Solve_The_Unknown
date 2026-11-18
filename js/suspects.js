
// SUSPECT DATA

const suspects = [

    {
        id: 1,
        name: "Alex Morgan",
        occupation: "Business Owner",
        motive: "Financial disagreement"
    },

    {
        id: 2,
        name: "Sarah Lee",
        occupation: "Employee",
        motive: "Personal conflict"
    },

    {
        id: 3,
        name: "Daniel Smith",
        occupation: "Friend",
        motive: "Unknown"
    },

    {
        id: 4,
        name: "Emily Brown",
        occupation: "Assistant",
        motive: "Unknown"
    }

];


// DISPLAY SUSPECTS

function displaySuspects() {

    const container = document.getElementById("suspect-list");

    container.innerHTML = "";

    suspects.forEach(function(suspect) {

        const card = document.createElement("div");

        card.classList.add("suspect-card");

        const avatar =
            `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(suspect.name)}`;

        card.innerHTML = `

            <img src="${avatar}" alt="${suspect.name}">

            <h3>${suspect.name}</h3>

            <p>${suspect.occupation}</p>

            <p>${suspect.motive}</p>

            <button class="view-profile-btn">
                View profile
            </button>

        `;

        card.querySelector(".view-profile-btn")
            .addEventListener("click", function() {

                viewSuspect(suspect.id);

            });

        container.appendChild(card);

    });

}


// VIEW SUSPECT PROFILE

function viewSuspect(id) {

    const suspect = suspects.find(function(s) {

        return s.id === id;

    });

    if (!suspect) return;

    alert(
        "Name: " + suspect.name +
        "\nOccupation: " + suspect.occupation +
        "\nMotive: " + suspect.motive
    );

}
