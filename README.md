## API Layer (MockAPI) - by [Neary RATANAK]

All game data is stored on [MockAPI](https://mockapi.io), a free mock server.
Every request goes through one file, `js/api.js`, so the rest of the code
never writes URLs. Load it before other scripts:
`<script src="js/api.js"></script>`

### Resources
| Resource | Holds |
|---|---|
| `cases` | title, summary, victim, 4 suspects, starter and unlockable clues, culprit, explanation |
| `sessions` | mode, name, members, cluesUnlocked, attemptsLeft, finished, score, timeTaken, cluesUsed |

The free plan allows only 2 resources. A session is created when a game starts
and updated as it goes. When finished, it becomes a leaderboard entry
(`finished: true`).

### Functions
| Function | HTTP method | What it does |
|---|---|---|
| `getCase(id)` | GET | Loads the case |
| `getLeaderboard()` | GET | Finished sessions, best score first |
| `createProgress(data)` | POST | Starts a new session |
| `updateProgress(id, data)` | PUT | Saves progress after each clue |
| `saveResult(id, result)` | PUT | Saves the final result |
| `deleteProgress(id)` | DELETE | Removes a session (restart) |

### Error handling
Every function throws an error with a friendly message if the internet is down,
the request takes over 8 seconds, or the server replies with an error.
Callers should use `try/catch` and show the message to the player.

### Known limitation
MockAPI has no login, and the answer (`culpritId`) is stored in the case data,
so a curious player could find it in the browser's Network tab.
