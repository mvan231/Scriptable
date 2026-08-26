// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: magic;
/*
Alexa To Reminders Access
Script made by: mvan231 — Date: 2023/10/26

Syncs your Alexa shopping list to an iOS Reminders list.

Setup:
  1. Set baseURL to your country's Amazon domain if not amazon.com
  2. Set reminderListName to match your Reminders list exactly
     (will prompt to pick one if it doesn't match)
  3. Run once — a login WebView will appear. Sign in, then tap Done.

Version history:
  v9 — Rewrote to use loadURL+getHTML for all GET calls and a loadHTML
       helper page for DELETE calls. No evaluateJavaScript for auth-
       sensitive operations — avoids "unsupported type" errors entirely.
       Amazon auth cookies (including HttpOnly) stay inside WKWebView
       and are used automatically for all navigations within it.
*/

// ─── Configuration ────────────────────────────────────────────────────────────

const baseURL    = 'https://www.amazon.com'
const signInKey  = 'Sign in'
const withVar    = 'with'
const withoutVar = 'without'

let reminderListName = 'SHOPPING'

// ─── Settings ─────────────────────────────────────────────────────────────────

const fm           = FileManager.iCloud()
const settingsDir  = fm.documentsDirectory() + '/AlexaToReminders/'
const settingsPath = settingsDir + 'settings.json'
if (!fm.fileExists(settingsDir)) fm.createDirectory(settingsDir, false)

let settings = {}
if (fm.fileExists(settingsPath)) {
  settings = JSON.parse(fm.readString(settingsPath))
  vlog(`Loaded settings: ${JSON.stringify(settings)}`)
}
if (settings.reminderListName) {
  reminderListName = settings.reminderListName
  vlog(`Using saved reminder list name: "${reminderListName}"`)
}

// Single WebView — all Amazon requests run through this instance so
// auth cookies (including HttpOnly) are automatically included.
const sessionView = new WebView()

await main()
Script.complete()

// ─── Logging ──────────────────────────────────────────────────────────────────

function vlog(msg) {
  const now = new Date()
  const pad = n => String(n).padStart(2, '0')
  const ts = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  console.log(`[${ts}] ${msg}`)
}

// ─── Amazon API ───────────────────────────────────────────────────────────────

async function fetchListJSON() {
  const apiUrl = `${baseURL}/alexashoppinglists/api/getlistitems`
  vlog(`Fetching list via XHR: ${apiUrl}`)

  const helperPage = `<!DOCTYPE html><html><body>
<div id="r" style="display:none"></div>
<script>
var out = 'error';
try {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', ${JSON.stringify(apiUrl)}, false);
  xhr.withCredentials = true;
  xhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.send(null);
  out = xhr.status + '|' + xhr.responseText;
} catch(e) { out = 'err:' + e.message; }
document.getElementById('r').textContent = out;
</script></body></html>`

  await sessionView.loadHTML(helperPage, baseURL)
  const resultHtml = await sessionView.getHTML()
  const match = resultHtml.match(/<div id="r"[^>]*>([\s\S]*?)<\/div>/i)
  const raw = match ? match[1].trim() : ''
  vlog(`XHR raw result (${raw.length} chars): ${raw.substring(0, 120)}`)

  if (!raw || raw === 'error' || raw.startsWith('err:')) {
    vlog(`XHR failed: ${raw}`)
    return null
  }

  const pipeIdx = raw.indexOf('|')
  if (pipeIdx === -1) { vlog('Unexpected result format'); return null }

  const status = parseInt(raw.substring(0, pipeIdx), 10)
  const body = raw.substring(pipeIdx + 1)
  vlog(`XHR status: ${status}, body (${body.length} chars): ${body.substring(0, 80)}`)

  if (status < 200 || status >= 300) { vlog(`Non-2xx status: ${status}`); return null }

  try {
    const json = JSON.parse(body)
    if (typeof json === 'object' && json !== null && !Array.isArray(json)) {
      vlog(`Valid JSON object with ${Object.keys(json).length} key(s)`)
      return json
    }
    vlog(`Non-object JSON (${typeof json}): ${String(json).substring(0, 80)}`)
    return null
  } catch (e) {
    vlog(`JSON parse failed: ${e.message}`)
    return null
  }
}

// Send a DELETE via a loadHTML helper page so the request runs inside
// the WebView's authenticated session without needing evaluateJavaScript.
async function deleteListItem(item) {
  const deleteUrl = `${baseURL}/alexashoppinglists/api/deletelistitem`
  // Encode the body safely so it survives embedding in HTML
  const encodedBody = encodeURIComponent(JSON.stringify(item))

  const helperPage = `<!DOCTYPE html><html><body>
<div id="b" style="display:none">${encodedBody}</div>
<script>
var out = 'error';
try {
  var body = decodeURIComponent(document.getElementById('b').textContent);
  var xhr = new XMLHttpRequest();
  xhr.open('DELETE', ${JSON.stringify(deleteUrl)}, false);
  xhr.withCredentials = true;
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(body);
  out = '' + xhr.status;
} catch(e) { out = 'err:' + e.message; }
document.body.textContent = out;
</script></body></html>`

  await sessionView.loadHTML(helperPage, baseURL)
  const resultHtml = await sessionView.getHTML()
  const match = resultHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  const result = (match ? match[1] : resultHtml).replace(/<[^>]+>/g, '').trim()
  vlog(`Delete response: ${result}`)

  if (result.startsWith('err:')) throw new Error(result)
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

async function ensureAuthenticated() {
  // Try the API directly — if sessionView has a cached session it works immediately
  vlog('Checking API access...')
  let json = await fetchListJSON()
  if (json) { vlog('Already authenticated'); return json }

  // Show instructions so the user knows to wait for Alexa lists to load
  const alert = new Alert()
  alert.title = 'Amazon Sign-In Required'
  alert.message = 'Sign in to Amazon and wait for your Alexa Shopping List to load, then tap Done.'
  alert.addAction('Open Amazon')
  alert.addCancelAction('Cancel')
  const choice = await alert.presentAlert()
  if (choice === -1) { vlog('User cancelled sign-in'); return null }

  // Load the full Alexa web app — this establishes Alexa-specific session state
  const alexaAppURL = baseURL.replace('://www.', '://alexa.')
  vlog(`Loading Alexa web app: ${alexaAppURL}`)
  await sessionView.loadURL(alexaAppURL)
  const pageHtml = await sessionView.getHTML()
  vlog(`Alexa app loaded (${pageHtml.length} chars) — sign-in indicator: ${pageHtml.includes(signInKey)}`)
  await sessionView.present(false)
  vlog('WebView dismissed — retrying API')

  json = await fetchListJSON()
  if (json) { vlog('Authenticated after sign-in'); return json }

  vlog('Could not authenticate — API still not returning valid data')
  return null
}

// ─── Sync ─────────────────────────────────────────────────────────────────────

async function synchronizeReminders(json) {
  vlog(`Looking up reminder list: "${reminderListName}"`)
  try {
    let reminderCalendar = await Calendar.forRemindersByTitle(reminderListName)
    if (!reminderCalendar) {
      vlog(`"${reminderListName}" not found — fetching all lists`)
      const allLists = await Calendar.forReminders()
      if (!allLists || allLists.length === 0) { vlog('No reminder lists on device'); return }
      vlog(`Available: ${allLists.map(l => l.title).join(', ')}`)
      const alert = new Alert()
      alert.title = 'Reminders List Not Found'
      alert.message = `"${reminderListName}" doesn't exist. Pick a list:`
      for (const list of allLists) alert.addAction(list.title)
      alert.addCancelAction('Cancel')
      const idx = await alert.presentSheet()
      if (idx === -1) { vlog('Cancelled'); return }
      reminderCalendar = allLists[idx]
      vlog(`Selected: "${reminderCalendar.title}" — saving`)
      settings.reminderListName = reminderCalendar.title
      fm.writeString(settingsPath, JSON.stringify(settings))
    } else {
      vlog(`Reminder list: "${reminderCalendar.title}"`)
    }

    vlog(`Scanning ${Object.keys(json).length} list(s) for SHOPPING_LIST...`)
    let listItems = [], shoppingListId = null
    for (const listId in json) {
      const list = json[listId]
      const type = list.listInfo ? list.listInfo.listType : 'unknown'
      vlog(`  "${listId}" — ${type}`)
      if (list.listInfo && list.listInfo.listType === 'SHOPPING_LIST') {
        listItems = list.listItems || []
        shoppingListId = listId
        vlog(`Found: "${list.listInfo.listName || 'Default'}" with ${listItems.length} item(s)`)
        break
      }
    }

    if (!shoppingListId) { vlog('No SHOPPING_LIST found — nothing to sync'); return }
    if (listItems.length === 0) { vlog('Shopping list empty — nothing to sync'); return }

    vlog(`Loading existing reminders from "${reminderCalendar.title}"`)
    const allReminders = await Reminder.all([reminderCalendar])
    const incompleteReminders = allReminders.filter(r => !r.isCompleted)
    vlog(`${allReminders.length} total, ${incompleteReminders.length} incomplete`)

    let created = 0, skipped = 0, deleted = 0, deleteFailed = 0

    for (const item of listItems) {
      if (!item.value) { vlog(`Skipping item with no value`); continue }

      const reminderTitle = item.value.split(' ').map(word => {
        if (word.toLowerCase() === withVar || word.toLowerCase() === withoutVar) return word.toLowerCase()
        return word.charAt(0).toUpperCase() + word.slice(1)
      }).join(' ')

      if (incompleteReminders.some(r => r.title === reminderTitle)) {
        vlog(`Skip (exists): "${reminderTitle}"`)
        skipped++
      } else {
        vlog(`Create: "${reminderTitle}"`)
        const reminder = new Reminder()
        reminder.title = reminderTitle
        reminder.calendar = reminderCalendar
        await reminder.save()
        created++
      }

      vlog(`Delete from Alexa: "${item.value}"`)
      try {
        await deleteListItem(item)
        deleted++
      } catch (e) {
        vlog(`Delete failed: ${e.message || e}`)
        deleteFailed++
      }
    }

    vlog(`Done — created: ${created}, skipped: ${skipped}, deleted: ${deleted}, failures: ${deleteFailed}`)
  } catch (error) {
    vlog(`Sync error: ${error.message || error}`)
    console.error(error)
  }
}

// ─── Entry point ──────────────────────────────────────────────────────────────

async function main() {
  vlog('=== Alexa To Reminders: starting ===')
  const json = await ensureAuthenticated()
  if (!json) {
    vlog('Could not authenticate — exiting')
    return
  }
  await synchronizeReminders(json)
  vlog('=== Alexa To Reminders: done ===')
}
