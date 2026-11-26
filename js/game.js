// // GET PLAYER INFORMATION
// const playerData = JSON.parse(sessionStorage.getItem("playerData") || "null")

// // CHECK PLAYER DATA
// if (!playerData) {
//     window.location.href = "index.html"
// }
// // GET SCREENS
// const caseScreen = document.getElementById("case-screen")
// const dashboardScreen = document.getElementById("dashboard-screen")

// // DISPLAY PLAYER INFORMATION
// const welcomeMessage = document.getElementById("welcome-message")
// if (playerData && welcomeMessage) {
//     welcomeMessage.textContent = `Welcome ${playerData.name}! Difficulty: ${playerData.difficulty}`
// }

// let caseData = null
// let progressId = null
// let startTime = null
// let selectedSuspectId = ""
// const allClues = [] 
// let collectedClues = []

// // LOAD CASE FROM API (Member 1's getCase)
// const statusMessage = document.getElementById("status-message")
// const beginBtn = document.getElementById("begin-investigation-btn")

// const showLoading = () => {
//     statusMessage.className = "loading-message"
//     statusMessage.textContent = "Loading case..."
//     beginBtn.disabled = true
// }

// const showError = (text) => {
//     statusMessage.className = "error-message"
//     statusMessage.textContent = text
// }

// const clearStatus = () => {
//     statusMessage.className = ""
//     statusMessage.textContent = ""
//     beginBtn.disabled = false
// }


// // Fills the case file text from the data
// const renderCase = () => {
//     const starterClues = Array.isArray(caseData.starterClues) ? caseData.starterClues : []
//     const crimeDetails = Array.isArray(caseData.crimeDetails) ? caseData.crimeDetails : []
//     const victim = caseData.victim || { name: "Unknown", age: "?", details: "" }

//     document.querySelector(".case-card h2").textContent = caseData.title
//     document.querySelector(".case-description").textContent = caseData.summary

//     const clueBox = document.getElementById("starter-clues")
//     clueBox.innerHTML = ""
//     starterClues.forEach((clue, index) => {
//         const box = document.createElement("div")
//         box.classList.add("clue")

//         const title = document.createElement("h4")
//         title.textContent = `Clue 0${index + 1}: ${clue.title}`

//         const text = document.createElement("p")
//         text.textContent = clue.text

//         box.append(title, text)
//         clueBox.appendChild(box)
//     })

//     // Dashboard summary
//     document.getElementById("dashboard-summary").textContent = caseData.summary
//     const factList = document.getElementById("crime-facts")
//     factList.innerHTML = ""
//     crimeDetails.forEach(fact => {
//         const item = document.createElement("li")
//         item.textContent = fact
//         factList.appendChild(item)
//     })

//     // Dashboard victim
//     // const victim = caseData.victim
//     document.getElementById("victim-name").textContent = victim.name
//     document.getElementById("victim-details").textContent = `${victim.role ? victim.role + ", " : ""}Age ${victim.age}. ${victim.details}`
//     setAvatar(
//         document.querySelector(".victim-avatar"),
//         victim.name,
//         "Portrait of " + victim.name
//     )
// }

// const loadCase = async () => {
//     if (typeof getCase !== "function") {
//         console.warn("getCase not found")
//         showError("Could not load the case. getCase is missing.")
//         return
//     }
//     try {
//         showLoading()
//         const data = await getCase(1)
//         caseData = Array.isArray(data) ? data[0] : data
//         console.log("CASE DATA:", caseData)

//         // Map the record's field names to the names the code uses
//         caseData.crimeDetails = caseData.crimeDetails || caseData.crimeFacts || []
//         caseData.extraClues = caseData.extraClues || caseData.quizClues || []
//         caseData.evidenceMissions = caseData.evidenceMissions || []

//         suspects = (Array.isArray(caseData.suspects) ? caseData.suspects : []).map(s => ({
//             ...s,
//             occupation: s.occupation || s.role
//         }))

//         window.gameState = window.gameState || {}
//         window.gameState.caseData = caseData
//         CULPRIT_ID = caseData.solution ? caseData.solution.culpritId : caseData.culpritIdbuildAccuseList()

//         renderCase()
//         clearStatus()
//     } catch (error) {
//         console.error(error)
//         showError("Could not load the case. Check your internet and try again.")
//     }
// }
// loadCase()

// // BACK TO START
// document.getElementById("back-btn").addEventListener("click", () => {
//         window.location.href = "index.html"
// })

// // SWITCH DASHBOARD SECTIONS
// const showDashboardSection = (sectionId, button) => {
//     const target = document.getElementById(sectionId)

//     if (!target) {
//         console.warn(`Section not found: ${sectionId}`)
//         return
//     }

//     document.querySelectorAll(".dashboard-section")
//         .forEach(section => section.classList.add("hidden"))

//     target.classList.remove("hidden")

//     document.querySelectorAll(".tab-btn")
//         .forEach(btn => btn.classList.remove("active"))

//     if (button) button.classList.add("active")
// }
// // NAVIGATION BUTTONS
// document.querySelectorAll(".tab-btn[data-section]").forEach(button => {
//     button.addEventListener("click", () => {
//         showDashboardSection(button.dataset.section, button)
//     })
// })
// // BEGIN INVESTIGATION
// document.getElementById("begin-investigation-btn").addEventListener("click", async () => {
//         if (typeof createProgress === "function") {
//             try {
//                 const progress = await createProgress({
//                     mode: playerData.mode,
//                     name: playerData.name
//                 })
//                 sessionStorage.setItem("progressId", progress.id)
//                 window.gameState = window.gameState || {}
//                 window.gameState.progressId = progress.id
//             } catch (error) {
//                 console.error(error)
//                 showError("Could not start the game. Please try again.")
//                 return
//             }
//         }

//         caseScreen.classList.add("hidden")
//         dashboardScreen.classList.remove("hidden")

//         displaySuspects()
//         if (window.Missions) {
//             window.Missions.resetMissions()
//             window.Missions.startTimer()
// }
//     })
// // TIMER FOR MEMBER 3



// // EVIDENCE DRAWER
// const evidenceDrawer = document.getElementById("evidence-drawer")
// const drawerOverlay = document.getElementById("drawer-overlay")

// // OPEN DRAWER
// document.getElementById("evidence-btn").addEventListener("click", () => {
//         evidenceDrawer.classList.add("open")
//         drawerOverlay.classList.add("open")
// })
// // CLOSE DRAWER

// const closeEvidenceDrawer = () => {
//     evidenceDrawer.classList.remove("open")
//     drawerOverlay.classList.remove("open")
// }

// document.getElementById("close-evidence-btn").addEventListener("click", closeEvidenceDrawer)
// drawerOverlay.addEventListener("click", closeEvidenceDrawer)

// const buildAccuseList = () => {
//     const list = document.getElementById("accuse-suspect-list")
//     if (!list) return
//     list.innerHTML = suspects.map(s => `
//         <label class="accuse-option">
//             <input type="radio" name="accusation" value="${s.id}">
//             <span>${s.name}</span>
//         </label>`).join("")
// }

// // show unlocked clues on the accuse screen too
// document.addEventListener("clue:unlocked", e => {
//     const box = document.getElementById("accuse-clue-list")
//     if (!box) return
//     const p = document.createElement("p")
//     p.textContent = (e.detail.clue.title ? e.detail.clue.title + ": " : "") + e.detail.clue.text
//     box.appendChild(p)
// })

// document.getElementById("submit-accusation-btn").addEventListener("click", async () => {
//     const chosen = document.querySelector('input[name="accusation"]:checked')
//     const reasoning = document.getElementById("accuse-reasoning").value.trim()
//     if (!caseData) return
//     if (!chosen || !reasoning) {
//         alert("Pick a suspect and write your reasoning.")
//         return
//     }

//     if (window.Missions) window.Missions.stopTimer()
//     const correct = String(chosen.value) === String(CULPRIT_ID)
//     const elapsed = startTime ? Math.floor((Date.now() - startTime) / 60000) : 0

//     if (progressId !== null && typeof saveResult === "function") {
//         try {
//             await saveResult(progressId, {
//                 score: correct ? 100 : 0,
//                 timeTaken: elapsed,
//                 cluesUsed: window.gameState.unlockedClues.length
//             })
//         } catch (err) {
//             console.warn("Could not save result:", err.message)
//         }
//     }

//     const resultBox = document.getElementById("accuse-result")
//     resultBox.classList.remove("hidden", "correct", "wrong")
//     resultBox.classList.add(correct ? "correct" : "wrong")
//     document.getElementById("accuse-result-title").textContent =
//         correct ? "Case Solved!" : "Wrong Accusation"
//     document.getElementById("accuse-result-text").textContent = correct
//         ? (caseData.solution.howItHappened || "Great detective work!")
//         : `The real culprit was ${caseData.solution.culpritName}.`
//     resultBox.scrollIntoView({ behavior: "smooth" })
// })

// document.getElementById("restart-btn").addEventListener("click", async () => {
//     try {
//         if (progressId !== null && typeof deleteProgress === "function") await deleteProgress(progressId)
//     } catch (err) {
//         console.warn(err.message)
//     }
//     window.location.reload()
// })

// document.getElementById("save-leaderboard-btn").addEventListener("click", () => {
//     alert("Leaderboard coming soon!")
// })

// const renderEvidence = () => {
//     const list = document.getElementById("evidence-list")
//     const count = document.getElementById("evidence-count")
//     const btn = document.getElementById("evidence-btn")
//     if (!list || !caseData) return

//     const starter = Array.isArray(caseData.starterClues) ? caseData.starterClues : []
//     const unlocked = (window.gameState && window.gameState.unlockedClues) || []
//     const all = starter.concat(unlocked)

//     list.innerHTML = ""
//     all.forEach(clue => {
//         const box = document.createElement("div")
//         box.classList.add("clue")
//         const h = document.createElement("h4")
//         h.textContent = clue.title || "Clue"
//         const p = document.createElement("p")
//         p.textContent = clue.text
//         box.append(h, p)
//         list.appendChild(box)
//     })

//     if (count) count.textContent = all.length
//     if (btn) btn.textContent = `Evidence (${all.length})`
// }

// document.addEventListener("clue:unlocked", renderEvidence)



// // EVIDENCE DRAWER
// const evidenceDrawer = document.getElementById("evidence-drawer")
// const drawerOverlay = document.getElementById("drawer-overlay")

// // OPEN DRAWER
// document.getElementById("evidence-btn").addEventListener("click", () => {
//         evidenceDrawer.classList.add("open")
//         drawerOverlay.classList.add("open")
// })
// // CLOSE DRAWER

// const closeEvidenceDrawer = () => {
//     evidenceDrawer.classList.remove("open")
//     drawerOverlay.classList.remove("open")
// }

// document.getElementById("close-evidence-btn").addEventListener("click", closeEvidenceDrawer)
// drawerOverlay.addEventListener("click", closeEvidenceDrawer)




// // EVIDENCE + ACCUSE 
// const setupClues = () => {
//     allClues.length = 0
//     if (!caseData) return
//     ;(caseData.starterClues || []).forEach(c => allClues.push({ ...c, mission: 0, found: true }))
//     ;(caseData.quizClues || []).forEach(c => allClues.push({ ...c, found: false }))
//     renderEvidenceBoard()
// }

// const renderEvidence = () => {
//     collectedClues = allClues.filter(c => c.found)


// }

// // Call this from missions.js when mission N completes
// const unlockClueForMission = (missionNumber) => {
//     const clue = allClues.find(c => c.mission === missionNumber && !c.found)
//     if (clue) {
//         clue.found = true
//         renderEvidenceBoard()
//     }
// }
// window.unlockClueForMission = unlockClueForMission   // missions.js can call it

// const renderEvidenceBoard = () => {
//     collectedClues = allClues.filter(c => c.found)
//     const board = document.getElementById("evidence-board")
//     const counter = document.getElementById("evidence-counter")
//     if (board) {
//         board.innerHTML = ""
//         allClues.forEach(clue => {
//             const card = document.createElement("div")
//             card.className = clue.found ? "clue-card found" : "clue-card locked"
//             if (clue.found) {
//                 card.innerHTML = `<h4>${clue.title}</h4><p>${clue.text}</p>`
//             } else {
//                 card.innerHTML = `<h4>🔒 Clue locked</h4><p>Complete Mission ${clue.mission} to unlock.</p>`
//             }
//             board.appendChild(card)
//         })
//     }
//     if (counter) {
//         const total = allClues.length
//         counter.textContent = `${collectedClues.length} of ${total} clues found`
//     }

   

//     renderAccuseClueList()




// }

// const renderAccuseClueList = () => {
//     const list = document.getElementById("accuse-clue-list")
//     if (!list) return
//     list.innerHTML = collectedClues.length
//         ? collectedClues.map(c => `<li><strong>${c.title}:</strong> ${c.text}</li>`).join("")
//         : "<li>No clues collected yet.</li>"
// }

// // ---- ACCUSE PAGE ----

// let selectedSuspectId = ""

// const buildAccuseSuspects = () => {
//     const list = document.getElementById("accuse-suspect-list")
//     if (!list || !caseData) return

//     selectedSuspectId = ""
//     list.innerHTML = ""
//     ;(caseData.suspects || []).forEach(suspect => {
//         const button = document.createElement("button")
//         button.type = "button"
//         button.className = "suspect-choice"
//         button.dataset.suspectId = suspect.id
//         button.textContent = `${suspect.name} - ${suspect.role}`
//         button.addEventListener("click", () => {
//             selectedSuspectId = suspect.id
//             list.querySelectorAll(".suspect-choice").forEach(choice => choice.classList.remove("selected"))
//             button.classList.add("selected")
//         })



    
//         list.appendChild(button)
//     })
// }

// const submitAccusation = async () => {
//     const suspectId = selectedSuspectId
//     const reasoning = document.getElementById("accuse-reasoning").value.trim()
//     const resultBox = document.getElementById("accuse-result")
//     const submitBtn = document.getElementById("submit-accusation-btn")
    
    

    

//     if (!suspectId) {
//         resultBox.className = "wrong"
//         resultBox.classList.remove("hidden")
//         resultBox.textContent = "You must choose a suspect!"
//         return
//     }
//     if (!reasoning) {
//         resultBox.className = "wrong"
//         resultBox.classList.remove("hidden")
//         resultBox.textContent = "You must explain your reasoning!"
//         return
//     }

//     resultBox.classList.remove("hidden")

//     // 3 attempts (stored so it survives refreshes)
//     let attemptsLeft = Number(sessionStorage.getItem("attemptsLeft") ?? 3)

//     if (suspectId === caseData.solution.culpritId) {
//         resultBox.className = "win"
//         resultBox.innerHTML = `<h3> Correct! ${caseData.solution.culpritName} did it!</h3>
//             <p>${caseData.solution.howItHappened}</p>
//             <ul>${caseData.solution.explanation.map(e => `<li>${e}</li>`).join("")}</ul>`
//         submitBtn.disabled = true
//         // save score (Member 1's API)
//         const progressId = sessionStorage.getItem("progressId")
//         if (progressId && typeof saveResult === "function") {
//             try {
//                 await saveResult(progressId, {
//                     score: attemptsLeft * 100,
//                     timeTaken: window.Missions?.getTimeTaken?.() ?? 0,
//                     culprit: suspectId
//                 })
//             } catch (e) { console.error(e) }
//         }
//     } else {
//         attemptsLeft--
//         sessionStorage.setItem("attemptsLeft", attemptsLeft)
//         const wrong = caseData.suspects.find(s => s.id === suspectId)
//         if (attemptsLeft <= 0) {
//             resultBox.className = "lose"
//             resultBox.innerHTML = `<h3>❌ Out of attempts!</h3>
//                 <p>It was ${caseData.solution.culpritName}. ${caseData.solution.howItHappened}</p>`
//             submitBtn.disabled = true
//         } else {
//             resultBox.className = "wrong"
//             resultBox.innerHTML = `<h3>❌ ${wrong.name} is not the culprit.</h3>
//                 <p>Attempts left: ${attemptsLeft}</p>`
//         }
//     }
// }

// document.getElementById("submit-accusation-btn")
//     .addEventListener("click", submitAccusation)

// GET PLAYER INFORMATION
// const playerData = JSON.parse(sessionStorage.getItem("playerData") || "null")

// // CHECK PLAYER DATA
// if (!playerData) {
//     window.location.href = "index.html"
// }
// // GET SCREENS
// const caseScreen = document.getElementById("case-screen")
// const dashboardScreen = document.getElementById("dashboard-screen")

// // DISPLAY PLAYER INFORMATION
// const welcomeMessage = document.getElementById("welcome-message")
// if (playerData && welcomeMessage) {
//     welcomeMessage.textContent = `Welcome ${playerData.name}! Difficulty: ${playerData.difficulty}`
// }
// // LOAD CASE FROM API (Member 1's getCase)
// let caseData = null
// const statusMessage = document.getElementById("status-message")
// const beginBtn = document.getElementById("begin-investigation-btn")

// const showLoading = () => {
//     statusMessage.className = "loading-message"
//     statusMessage.textContent = "Loading case..."
//     beginBtn.disabled = true
// }

// const showError = (text) => {
//     statusMessage.className = "error-message"
//     statusMessage.textContent = text
// }

// const clearStatus = () => {
//     statusMessage.className = ""
//     statusMessage.textContent = ""
//     beginBtn.disabled = false
// }


// // Fills the case file text from the data
// const renderCase = () => {
//     document.querySelector(".case-card h2").textContent = caseData.title
//     document.querySelector(".case-description").textContent = caseData.summary

//     const clueBox = document.getElementById("starter-clues")
//     clueBox.innerHTML = ""
//     ;(caseData.starterClues || []).forEach((clue, index) => {
//         const box = document.createElement("div")
//         box.classList.add("clue")

//         const title = document.createElement("h4")
//         title.textContent = `Clue 0${index + 1}: ${clue.title}`

//         const text = document.createElement("p")
//         text.textContent = clue.text

//         box.append(title, text)
//         clueBox.appendChild(box)
//     })

//     // Dashboard summary
//     document.getElementById("dashboard-summary").textContent = caseData.summary
//     const factList = document.getElementById("crime-facts")
//     factList.innerHTML = ""
//     ;(caseData.crimeDetails || caseData.crimeFacts || []).forEach(fact => {
//         const item = document.createElement("li")
//         item.textContent = fact
//         factList.appendChild(item)
//     })

//     // Dashboard victim
//     const victim = caseData.victim
//     document.getElementById("victim-name").textContent = victim.name
//     document.getElementById("victim-details").textContent = `Age ${victim.age}. ${victim.details}`
//     setAvatar(
//         document.querySelector(".victim-avatar"),
//         victim.name,
//         "Portrait of " + victim.name
//     )
// }
// const loadCase = async () => {
//     if (typeof getCase !== "function") {
//         console.warn("getCase not found")
//         return
//     }
//     try {
//         showLoading()
//         const data = await getCase(1)
//         caseData = Array.isArray(data) ? data[0] : data
//         console.log("CASE DATA:", caseData)
//         suspects = caseData.suspects
//         window.gameState = window.gameState || {}
//         window.gameState.caseData = caseData
//         renderCase()
//         clearStatus()
//         setupClues()
//         buildAccuseSuspects()
//     } catch (error) {
//         console.error(error)
//         showError("Could not load the case. Check your internet and try again.")
//     }
// }  
// loadCase()

// // BACK TO START
// document.getElementById("back-btn").addEventListener("click", () => {
//         window.location.href = "index.html"
// })

// // SWITCH DASHBOARD SECTIONS
// const showDashboardSection = (sectionId, button) => {
//     const target = document.getElementById(sectionId)

//     if (!target) {
//         console.warn(`Section not found: ${sectionId}`)
//         return
//     }

//     document.querySelectorAll(".dashboard-section")
//         .forEach(section => section.classList.add("hidden"))

//     target.classList.remove("hidden")

//     document.querySelectorAll(".tab-btn")
//         .forEach(btn => btn.classList.remove("active"))

//     if (button) button.classList.add("active")
// }
// // NAVIGATION BUTTONS
// document.querySelectorAll(".tab-btn[data-section]").forEach(button => {
//     button.addEventListener("click", () => {
//         showDashboardSection(button.dataset.section, button)
//     })
// })
// // BEGIN INVESTIGATION
// document.getElementById("begin-investigation-btn").addEventListener("click", async () => {
//         if (typeof createProgress === "function") {
//             try {
//                 const progress = await createProgress({
//                     mode: playerData.mode,
//                     name: playerData.name
//                 })
//                 sessionStorage.setItem("progressId", progress.id)
//                 window.gameState = window.gameState || {}
//                 window.gameState.progressId = progress.id
//             } catch (error) {
//                 console.error(error)
//                 showError("Could not start the game. Please try again.")
//                 return
//             }
//         }

//         sessionStorage.setItem("attemptsLeft", "3")
//         caseScreen.classList.add("hidden")
//         dashboardScreen.classList.remove("hidden")

//         displaySuspects()
//         if (window.Missions) window.Missions.startTimer()
//     })
// // TIMER FOR MEMBER 3



// // EVIDENCE DRAWER
// const evidenceDrawer = document.getElementById("evidence-drawer")
// const drawerOverlay = document.getElementById("drawer-overlay")

// // OPEN DRAWER
// document.getElementById("evidence-btn").addEventListener("click", () => {
//         evidenceDrawer.classList.add("open")
//         drawerOverlay.classList.add("open")
// })
// // CLOSE DRAWER

// const closeEvidenceDrawer = () => {
//     evidenceDrawer.classList.remove("open")
//     drawerOverlay.classList.remove("open")
// }

// document.getElementById("close-evidence-btn").addEventListener("click", closeEvidenceDrawer)
// drawerOverlay.addEventListener("click", closeEvidenceDrawer)




// // EVIDENCE + ACCUSE 

// const allClues = []          // {id, title, text, mission, found}
// let collectedClues = []

// const setupClues = () => {
//     allClues.length = 0
//     if (!caseData) return
//     ;(caseData.starterClues || []).forEach(c => allClues.push({ ...c, mission: 0, found: true }))
//     ;(caseData.quizClues || []).forEach(c => allClues.push({ ...c, found: false }))
//     renderEvidenceBoard()
// }

// // Call this from missions.js when mission N completes
// const unlockClueForMission = (missionNumber) => {
//     const clue = allClues.find(c => c.mission === missionNumber && !c.found)
//     if (clue) {
//         clue.found = true
//         renderEvidenceBoard()
//     }
// }
// window.unlockClueForMission = unlockClueForMission   // missions.js can call it

// const renderEvidenceBoard = () => {
//     collectedClues = allClues.filter(c => c.found)
//     const board = document.getElementById("evidence-board")
//     const counter = document.getElementById("evidence-counter")
//     if (board) {
//         board.innerHTML = ""
//         allClues.forEach(clue => {
//             const card = document.createElement("div")
//             card.className = clue.found ? "clue-card found" : "clue-card locked"
//             if (clue.found) {
//                 card.innerHTML = `<h4>${clue.title}</h4><p>${clue.text}</p>`
//             } else {
//                 card.innerHTML = `<h4>🔒 Clue locked</h4><p>Complete Mission ${clue.mission} to unlock.</p>`
//             }
//             board.appendChild(card)
//         })
//     }
//     if (counter) {
//         const total = allClues.length
//         counter.textContent = `${collectedClues.length} of ${total} clues found`
//     }

   

//     renderAccuseClueList()




// }

// const renderAccuseClueList = () => {
//     const list = document.getElementById("accuse-clue-list")
//     if (!list) return
//     list.innerHTML = collectedClues.length
//         ? collectedClues.map(c => `<li><strong>${c.title}:</strong> ${c.text}</li>`).join("")
//         : "<li>No clues collected yet.</li>"
// }

// // ---- ACCUSE PAGE ----

// let selectedSuspectId = ""

// const buildAccuseSuspects = () => {
//     const list = document.getElementById("accuse-suspect-list")
//     if (!list || !caseData) return

//     selectedSuspectId = ""
//     list.innerHTML = ""
//     ;(caseData.suspects || []).forEach(suspect => {
//         const button = document.createElement("button")
//         button.type = "button"
//         button.className = "suspect-choice"
//         button.dataset.suspectId = suspect.id
//         button.textContent = `${suspect.name} - ${suspect.role}`
//         button.addEventListener("click", () => {
//             selectedSuspectId = suspect.id
//             list.querySelectorAll(".suspect-choice").forEach(choice => choice.classList.remove("selected"))
//             button.classList.add("selected")
//         })



    
//         list.appendChild(button)
//     })
// }

// const submitAccusation = async () => {
//     const suspectId = selectedSuspectId
//     const reasoning = document.getElementById("accuse-reasoning").value.trim()
//     const resultBox = document.getElementById("accuse-result")
//     const submitBtn = document.getElementById("submit-accusation-btn")
    
    

    

//     if (!suspectId) {
//         resultBox.className = "wrong"
//         resultBox.classList.remove("hidden")
//         resultBox.textContent = "You must choose a suspect!"
//         return
//     }
//     if (!reasoning) {
//         resultBox.className = "wrong"
//         resultBox.classList.remove("hidden")
//         resultBox.textContent = "You must explain your reasoning!"
//         return
//     }

//     resultBox.classList.remove("hidden")

//     // 3 attempts (stored so it survives refreshes)
//     let attemptsLeft = Number(sessionStorage.getItem("attemptsLeft") ?? 3)

//     if (suspectId === caseData.solution.culpritId) {
//         resultBox.className = "win"
//         resultBox.innerHTML = `<h3> Correct! ${caseData.solution.culpritName} did it!</h3>
//             <p>${caseData.solution.howItHappened}</p>
//             <ul>${caseData.solution.explanation.map(e => `<li>${e}</li>`).join("")}</ul>`
//         submitBtn.disabled = true
//         // save score (Member 1's API)
//         const progressId = sessionStorage.getItem("progressId")
//         if (progressId && typeof saveResult === "function") {
//             try {
//                 await saveResult(progressId, {
//                     score: attemptsLeft * 100,
//                     timeTaken: window.Missions?.getTimeTaken?.() ?? 0,
//                     culprit: suspectId
//                 })
//             } catch (e) { console.error(e) }
//         }
//     } else {
//         attemptsLeft--
//         sessionStorage.setItem("attemptsLeft", attemptsLeft)
//         const wrong = caseData.suspects.find(s => s.id === suspectId)
//         if (attemptsLeft <= 0) {
//             resultBox.className = "lose"
//             resultBox.innerHTML = `<h3>❌ Out of attempts!</h3>
//                 <p>It was ${caseData.solution.culpritName}. ${caseData.solution.howItHappened}</p>`
//             submitBtn.disabled = true
//         } else {
//             resultBox.className = "wrong"
//             resultBox.innerHTML = `<h3>❌ ${wrong.name} is not the culprit.</h3>
//                 <p>Attempts left: ${attemptsLeft}</p>`
//         }
//     }
// }

// document.getElementById("submit-accusation-btn")
//     .addEventListener("click", submitAccusation)


// ================= PLAYER =================
const playerData = JSON.parse(sessionStorage.getItem("playerData") || "null")

if (!playerData) {
    window.location.href = "index.html"
    throw new Error("No player data") // stop the script
}

// ================= SCREENS =================
const caseScreen = document.getElementById("case-screen")
const dashboardScreen = document.getElementById("dashboard-screen")

const welcomeMessage = document.getElementById("welcome-message")
if (welcomeMessage) {
    welcomeMessage.textContent = `Welcome ${playerData.name}! Difficulty: ${playerData.difficulty}`
}

// ================= STATE =================
let caseData = null
let progressId = null
let startTime = null
let selectedSuspectId = ""
const allClues = []        // {title, text, found}
let collectedClues = []

const statusMessage = document.getElementById("status-message")
const beginBtn = document.getElementById("begin-investigation-btn")

const showLoading = () => {
    statusMessage.className = "loading-message"
    statusMessage.textContent = "Loading case..."
    beginBtn.disabled = true
}
const showError = (text) => {
    statusMessage.className = "error-message"
    statusMessage.textContent = text
}
const clearStatus = () => {
    statusMessage.className = ""
    statusMessage.textContent = ""
    beginBtn.disabled = false
}

// ================= RENDER CASE =================
const renderCase = () => {
    const starterClues = Array.isArray(caseData.starterClues) ? caseData.starterClues : []
    const crimeDetails = Array.isArray(caseData.crimeDetails) ? caseData.crimeDetails : []
    const victim = caseData.victim || { name: "Unknown", age: "?", details: "" }

    document.querySelector(".case-card h2").textContent = caseData.title || "Untitled case"
    document.querySelector(".case-description").textContent = caseData.summary || ""

    const clueBox = document.getElementById("starter-clues")
    clueBox.innerHTML = ""
    starterClues.forEach((clue, index) => {
        const box = document.createElement("div")
        box.classList.add("clue")
        const title = document.createElement("h4")
        title.textContent = `Clue 0${index + 1}: ${clue.title}`
        const text = document.createElement("p")
        text.textContent = clue.text
        box.append(title, text)
        clueBox.appendChild(box)
    })

    document.getElementById("dashboard-summary").textContent = caseData.summary || ""
    const factList = document.getElementById("crime-facts")
    factList.innerHTML = ""
    crimeDetails.forEach(fact => {
        const item = document.createElement("li")
        item.textContent = fact
        factList.appendChild(item)
    })

    document.getElementById("victim-name").textContent = victim.name
    document.getElementById("victim-details").textContent =
        `${victim.role ? victim.role + ", " : ""}Age ${victim.age}. ${victim.details}`
    setAvatar(
        document.querySelector(".victim-avatar"),
        victim.name,
        "Portrait of " + victim.name
    )
}

// ================= EVIDENCE (drawer + accuse clue list) =================
const setupClues = () => {
    allClues.length = 0
    if (!caseData) return
    ;(caseData.starterClues || []).forEach(c => allClues.push({ ...c, found: true }))
    ;(caseData.extraClues || []).forEach(c => allClues.push({ ...c, found: false }))
    renderEvidence()
}

const renderEvidence = () => {
    collectedClues = allClues.filter(c => c.found)

    const list = document.getElementById("evidence-list")
    const count = document.getElementById("evidence-count")
    const btn = document.getElementById("evidence-btn")

    if (list) {
        list.innerHTML = ""
        collectedClues.forEach(c => {
            const box = document.createElement("div")
            box.classList.add("clue")
            const h = document.createElement("h4")
            h.textContent = c.title || "Clue"
            const p = document.createElement("p")
            p.textContent = c.text
            box.append(h, p)
            list.appendChild(box)
        })
    }
    if (count) count.textContent = collectedClues.length
    if (btn) btn.textContent = `Evidence (${collectedClues.length})`

    renderAccuseClueList()
}

const renderAccuseClueList = () => {
    const list = document.getElementById("accuse-clue-list")
    if (!list) return
    list.innerHTML = ""
    collectedClues.forEach(c => {
        const p = document.createElement("p")
        p.textContent = (c.title ? c.title + ": " : "") + c.text
        list.appendChild(p)
    })
}

// a correct mission answer unlocks the next locked clue
document.addEventListener("clue:unlocked", () => {
    const next = allClues.find(c => !c.found)
    if (next) {
        next.found = true
        renderEvidence()
    }
})

// ================= ACCUSE LIST =================
const buildAccuseSuspects = () => {
    const list = document.getElementById("accuse-suspect-list")
    if (!list || !caseData) return

    selectedSuspectId = ""
    list.innerHTML = ""
    ;(caseData.suspects || []).forEach(suspect => {
        const button = document.createElement("button")
        button.type = "button"
        button.className = "suspect-choice"
        button.textContent = `${suspect.name} - ${suspect.role || suspect.occupation || ""}`
        button.addEventListener("click", () => {
            selectedSuspectId = suspect.id
            list.querySelectorAll(".suspect-choice").forEach(c => c.classList.remove("selected"))
            button.classList.add("selected")
        })
        list.appendChild(button)
    })
}

// ================= LOAD CASE =================
const loadCase = async () => {
    if (typeof getCase !== "function") {
        showError("Could not load the case. getCase is missing.")
        return
    }
    try {
        showLoading()
        const data = await getCase(1)
        caseData = Array.isArray(data) ? data[0] : data
        console.log("CASE DATA:", caseData)

        // map the record's field names to the names the code uses
        caseData.crimeDetails = caseData.crimeDetails || caseData.crimeFacts || []
        caseData.extraClues = caseData.extraClues || caseData.quizClues || []
        caseData.evidenceMissions = caseData.evidenceMissions || []

        suspects = (Array.isArray(caseData.suspects) ? caseData.suspects : []).map(s => ({
            ...s,
            occupation: s.occupation || s.role
        }))

        window.gameState = window.gameState || {}
        window.gameState.caseData = caseData

        renderCase()
        setupClues()
        buildAccuseSuspects()
        clearStatus()
    } catch (error) {
        console.error(error)
        showError("Could not load the case. Check your internet and try again.")
    }
}
loadCase()

// ================= NAVIGATION =================
document.getElementById("back-btn").addEventListener("click", () => {
    window.location.href = "index.html"
})

const showDashboardSection = (sectionId, button) => {
    const target = document.getElementById(sectionId)
    if (!target) {
        console.warn(`Section not found: ${sectionId}`)
        return
    }
    document.querySelectorAll(".dashboard-section").forEach(s => s.classList.add("hidden"))
    target.classList.remove("hidden")
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"))
    if (button) button.classList.add("active")
}

document.querySelectorAll(".tab-btn[data-section]").forEach(button => {
    button.addEventListener("click", () => showDashboardSection(button.dataset.section, button))
})

// ================= BEGIN INVESTIGATION =================
beginBtn.addEventListener("click", async () => {
    if (typeof createProgress === "function") {
        try {
            const progress = await createProgress({
                mode: playerData.mode || playerData.difficulty,
                name: playerData.name
            })
            progressId = progress.id
            sessionStorage.setItem("progressId", progress.id)
            window.gameState = window.gameState || {}
            window.gameState.progressId = progress.id
        } catch (error) {
            console.error(error)
            showError("Could not start the game. Please try again.")
            return
        }
    }

    caseScreen.classList.add("hidden")
    dashboardScreen.classList.remove("hidden")
    startTime = Date.now()

    // fresh game state
    sessionStorage.removeItem("attemptsLeft")
    document.getElementById("submit-accusation-btn").disabled = false
    document.getElementById("accuse-result").classList.add("hidden")
    const cluesList = document.getElementById("clues")
    if (cluesList) cluesList.innerHTML = ""

    displaySuspects()
    if (window.Missions) {
        window.Missions.resetMissions()
        window.Missions.startTimer()
    }
    setupClues()          // starter clues found, the rest locked again
    buildAccuseSuspects()
})

// ================= EVIDENCE DRAWER (declared once) =================
const evidenceDrawer = document.getElementById("evidence-drawer")
const drawerOverlay = document.getElementById("drawer-overlay")

const closeEvidenceDrawer = () => {
    evidenceDrawer.classList.remove("open")
    drawerOverlay.classList.remove("open")
}

document.getElementById("evidence-btn").addEventListener("click", () => {
    evidenceDrawer.classList.add("open")
    drawerOverlay.classList.add("open")
})
document.getElementById("close-evidence-btn").addEventListener("click", closeEvidenceDrawer)
drawerOverlay.addEventListener("click", closeEvidenceDrawer)

// ================= ACCUSATION (one flow only) =================
const showResult = (kind, title, html) => {
    const box = document.getElementById("accuse-result")
    box.classList.remove("hidden", "correct", "wrong")
    box.classList.add(kind)
    document.getElementById("accuse-result-title").textContent = title
    document.getElementById("accuse-result-text").innerHTML = html
}

const submitAccusation = async () => {
    const reasoning = document.getElementById("accuse-reasoning").value.trim()
    const submitBtn = document.getElementById("submit-accusation-btn")

    if (!caseData) return
    if (!selectedSuspectId) return showResult("wrong", "Pick a suspect", "You must choose a suspect!")
    if (!reasoning) return showResult("wrong", "Explain yourself", "You must explain your reasoning!")

    const solution = caseData.solution
    let attemptsLeft = Number(sessionStorage.getItem("attemptsLeft") ?? 3)

    if (selectedSuspectId === solution.culpritId) {
        showResult(
            "correct",
            `Correct! ${solution.culpritName} did it!`,
            solution.howItHappened + "<br><br>" + solution.explanation.join("<br>")
        )
        submitBtn.disabled = true
        if (window.Missions) window.Missions.stopTimer()

        if (progressId !== null && typeof saveResult === "function") {
            const elapsed = startTime ? Math.floor((Date.now() - startTime) / 60000) : 0
            try {
                await saveResult(progressId, {
                    score: attemptsLeft * 100,
                    timeTaken: elapsed,
                    cluesUsed: collectedClues.length
                })
            } catch (e) {
                console.warn("Could not save result:", e.message)
            }
        }
    } else {
        attemptsLeft--
        sessionStorage.setItem("attemptsLeft", attemptsLeft)
        const wrong = caseData.suspects.find(s => s.id === selectedSuspectId)
        if (attemptsLeft <= 0) {
            showResult(
                "wrong",
                "Out of attempts!",
                `It was ${solution.culpritName}. ${solution.howItHappened}`
            )
            submitBtn.disabled = true
            if (window.Missions) window.Missions.stopTimer()
        } else {
            showResult("wrong", `${wrong.name} is not the culprit.`, `Accusations left: ${attemptsLeft}`)
        }
    }
}

document.getElementById("submit-accusation-btn").addEventListener("click", submitAccusation)

document.getElementById("restart-btn").addEventListener("click", async () => {
    try {
        if (progressId !== null && typeof deleteProgress === "function") await deleteProgress(progressId)
    } catch (err) {
        console.warn(err.message)
    }
    sessionStorage.removeItem("attemptsLeft")
    window.location.reload()
})

// document.getElementById("save-leaderboard-btn").addEventListener("click", () => {
//     alert("Leaderboard coming soon!")
// })
