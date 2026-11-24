// TEMPORARY API PLACEHOLDER — replace with friend's real api.js later

const getCase = async (caseId) => {
    // Fake data for now
    return {
        suspects: [
            { id: 1, name: "Suspect 1", occupation: "Chef", motive: "Jealousy" },
            { id: 2, name: "Suspect 2", occupation: "Gardener", motive: "Money" },
            { id: 3, name: "Suspect 3", occupation: "Driver", motive: "Revenge" }
        ],
        clues: ["Muddy footprint", "Torn letter", "Missing key"],
        culpritId: 2
    }
}

const createProgress = async (data) => {
    return { id: "fake-id-123" }
}

const updateProgress = async (id, data) => { }

const deleteProgress = async (id) => { }

const saveResult = async (id, data) => {
    console.log("Result saved (fake):", data)
}

const getLeaderboard = async () => {
    return []
}
