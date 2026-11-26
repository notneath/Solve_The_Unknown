// SUSPECT DATA (FAKE DATA)

let suspects = []
// const suspects = [
//     {
//         id: 1,
//         name: "Alex Morgan",
//         occupation: "Business Owner",
//         background: "Ran a company with the victim for ten years.",
//         evidence: "Was seen near the office late at night.",
//         motive: "Financial disagreement"
//     },
//     {
//         id: 2,
//         name: "Sarah Lee",
//         occupation: "Employee",
//         background: "Worked for the victim for three years.",
//         evidence: "Her access card was used after closing time.",
//         motive: "Personal conflict"
//     },
//     {
//         id: 3,
//         name: "Daniel Smith",
//         occupation: "Friend",
//         background: "Childhood friend of the victim.",
//         evidence: "Says he was at home, but nobody can confirm it.",
//         motive: "Unknown"
//     },
//     {
//         id: 4,
//         name: "Emily Brown",
//         occupation: "Assistant",
//         background: "Managed the victim's schedule and messages.",
//         evidence: "Deleted several emails the day before.",
//         motive: "Unknown"
//     }
// ]

// AVATAR HELPERS (DiceBear)
// The seed decides the face, so the same seed gives the same face.
const getAvatarUrl = (seed) =>
    `https://api.dicebear.com/10.x/adventurer/svg?seed=${encodeURIComponent(seed)}`

// Grey circle with "?" used when the image fails to load
const AVATAR_FALLBACK =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="85" height="85">' +
        '<rect width="85" height="85" fill="#dededb"/>' +
        '<text x="42" y="54" font-size="36" text-anchor="middle" ' +
        'fill="#666">?</text></svg>'
    )

const setAvatar = (img, seed, altText) => {
    img.alt = altText
    // Switch to the fallback once. Clearing onerror stops an endless error loop.
    img.onerror = () => {
        img.onerror = null
        img.src = AVATAR_FALLBACK
    }
    img.src = getAvatarUrl(seed)
}

// Victim avatar (the img already exists in game.html)
const victimImg = document.querySelector(".victim-avatar")
if (victimImg) {
    setAvatar(victimImg, "Robert Anderson", "Portrait of the victim")
}

// SHOW A DASHBOARD TAB (relies on data-section on the tab buttons)
const goToSection = (sectionId, tabSectionId) => {
    const tabButton = document.querySelector(`.tab-btn[data-section="${tabSectionId}"]`)
    showDashboardSection(sectionId, tabButton)
}

// DISPLAY SUSPECT CARDS
const displaySuspects = () => {
    const container = document.getElementById("suspect-list")
    container.innerHTML = ""
    suspects.forEach(suspect => {
        const card = document.createElement("div")
        card.classList.add("suspect-card")

        const img = document.createElement("img")
        setAvatar(img, suspect.name, `Avatar of ${suspect.name}`)

        const name = document.createElement("h3")
        name.textContent = suspect.name

        const occupation = document.createElement("p")
        occupation.textContent = suspect.occupation

        const motive = document.createElement("p")
        motive.textContent = suspect.motive

        const button = document.createElement("button")
        button.textContent = "View profile"
        button.addEventListener("click", () => viewSuspect(suspect.id))

        card.append(img, name, occupation, motive, button)
        container.appendChild(card)
    })
}

// VIEW SUSPECT PROFILE
const viewSuspect = (id) => {
    const suspect = suspects.find(s => s.id === id)
    if (!suspect) return
    setAvatar(
        document.getElementById("profile-avatar"),
        suspect.name,
        `Avatar of ${suspect.name}`
    )

    document.getElementById("profile-name").textContent = suspect.name
    document.getElementById("profile-role").textContent = suspect.occupation
    document.getElementById("profile-background").textContent = suspect.background
    document.getElementById("profile-evidence").textContent = suspect.evidence
    document.getElementById("profile-motive").textContent = suspect.motive
    document.getElementById("profile-alibi").textContent = suspect.alibi

    // Show the profile; keep the "Suspects" tab highlighted
    goToSection("suspect-profile-section", "suspects-section")
}


// BACK BUTTON (profile -> suspect grid)
const profileBackBtn = document.getElementById("profile-back-btn")
if (profileBackBtn) {
    profileBackBtn.addEventListener("click", () => {
        goToSection("suspects-section", "suspects-section")
    })
}