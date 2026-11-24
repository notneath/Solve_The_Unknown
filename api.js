const BASE_URL = "https://6b046d6a9e7cafb37dc05c9a.mockapi.io/api/stu"

async function request(endpoint, options) {
    let response;
    try {
        response = await fetch(BASE_URL + endpoint, {
            headers: { "Content-Type": "application/json"},
            ...options,
        })
    } catch (error) {
        //if the internet is down
        throw new Error("Could not reach the server. Please check you internet connection and try again.")
    }

    if (!response.ok) {
        //server replied with an error
        throw new Error("Server error (" + response.status + "). Please try again")
    }

    return response.json();
}

//GET request: get the case
function getCase(id = 1) {
    return request("/cases/" + id);
}

//POST request: start a new game and return the new record
function createProgress(data) {
    return request("/sessions", {
        method: 'POST',
        body: JSON.stringify({
            finished: false,
            cluesUnlocked: 0,
            attemptsLeft: 3,
            ...data,
        })
    })
}

//Put request: use for updating after each clue
function updateProgress(id, data) {
    return request("/sessions/" + id, {
        method: "PUT",
        body: JSON.stringify(data)
    })
}

//DELETE: delete a session
function deleteProgress(id) {
    return request("/sessions/" + id, {
        method: 'DELETE'
    })
}

//PUT request: save the result
function saveResult(id, result) {
    return updateProgress(id, {
        ...result,
        finished: true
    })
}

//Get request: get the leaderboard
async function getLeaderboard() {
    const sessions = await request("/sessions")
    return sessions 
        .filter((s) => s.finished === true)
        .sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken)
}
