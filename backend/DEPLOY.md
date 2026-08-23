# Deploying the RSVP backend (`Code.gs`)

One-time setup, about 15 minutes. You need the Google account that owns the
RSVP Google Sheet (the one the old form writes to) and the `Code.gs` file in
this folder. When you are done, the site gets real success/failure messages
and accepting guests get a receipt email.

## 1. Put the code into Apps Script

1. Open the RSVP Google Sheet, then **Extensions → Apps Script**. This opens
   (or creates) the script project that is *bound to this spreadsheet* — that
   binding is what lets the code write rows with no extra configuration.
2. What you see in the editor decides the next move:
   - **The editor is empty** (just `function myFunction() {}`): the old
     backend is a *standalone* script that lives elsewhere in the Google
     account. That is fine — leave it alone; it keeps serving the old URL
     until you switch the site in step 4. Delete `myFunction` and paste the
     whole of `Code.gs` in its place.
   - **The editor already has the old code**: do not delete it. Rename its
     file to `legacy.gs` (click the file name to rename), then comment out
     its `doPost` and `doGet` functions (wrap each in `/* ... */`). Then add
     a new file (**+ → Script**), name it `Code`, and paste `Code.gs` into
     that.

     Why the commenting-out matters: Apps Script merges every file in the
     project into one program. Two functions named `doPost` do not produce an
     error — the one defined *last* silently wins, and which one is "last"
     depends on file order. Commenting out the old pair removes the
     ambiguity.
3. Save (**Ctrl/Cmd+S**).

## 2. Optional Script Properties

All three have sensible defaults, so you can skip this step entirely. To set
one: gear icon (**Project Settings**) → **Script properties** → **Add script
property**.

| Property | Default | What it does |
|---|---|---|
| `REPLY_TO` | `christinemaesimene@gmail.com` | Where a guest's reply to the receipt email goes. |
| `NOTIFY_COUPLE` | off | Set to exactly `true` to email the couple a short summary of every RSVP. |
| `COUPLE_EMAIL` | `j.cponce.me92@gmail.com,christinemaesimene@gmail.com` | Comma-separated list of who gets those summaries. |

## 3. Deploy as a Web App

1. **Deploy → New deployment** → gear next to "Select type" → **Web app**.
2. Description: anything, e.g. `rsvp v2`.
3. **Execute as: Me** (rows are written and mail is sent as your account).
4. **Who has access: Anyone.**

   > **Warning:** not "Anyone with a Google account". That setting makes
   > Google serve a login page instead of running the script, and since
   > guests are not signed in, the site will report **every** reply as
   > failed.
5. Click **Deploy**, then **Authorize access** and pick your account. You
   will see "Google hasn't verified this app" — click **Advanced → Go to
   (project name) (unsafe)** → **Allow**. This is your own script reading
   your own sheet; the warning only means the project is not published to
   Google's marketplace.

## 4. Point the site at it

Copy the Web app URL — it ends in **`/exec`**. In the site repo, edit
`js/config.js` and paste it as the value of `RSVP_ENDPOINT_V2`:

```js
RSVP_ENDPOINT_V2: 'https://script.google.com/macros/s/AKfycb.../exec',
```

This single change switches the site to the new backend, with real
success/failure reporting and receipt emails. Leaving it `''` keeps the old
behaviour. Commit and push — GitHub Pages redeploys in a minute or two.

## 5. Test it

Set the URL once (Apps Script answers with a redirect, so `-sL` follows it):

```bash
URL='https://script.google.com/macros/s/PASTE-YOUR-ID/exec'
```

Health check — expect `{"ok":true,"service":"jc-rsvp","version":1}`:

```bash
curl -sL "$URL"
```

A valid "Yes" with a companion — use **your own email**; expect `{"ok":true}`,
a new row in the `RSVPs v2` tab, and a receipt email (check spam the first
time and mark it "not spam"):

```bash
curl -sL -X POST "$URL" -d '{"timestamp":"2026-08-24T10:00:00Z","firstName":"Test","lastName":"Deployer","email":"YOUR_EMAIL@gmail.com","phone":"+63 900 000 0000","attending":"Yes","guests":"2","message":"test row - please delete","companions":["Test Plus-One"]}'
```

A decline — expect `{"ok":true}`, a row, **no** email, and `skipped
(declined)` in the Receipt column:

```bash
curl -sL -X POST "$URL" -d '{"timestamp":"2026-08-24T10:00:00Z","firstName":"Test","lastName":"Decline","email":"YOUR_EMAIL@gmail.com","phone":"","attending":"No","guests":"0","message":"","companions":[]}'
```

A bad email — expect `{"ok":false,...}` and **no** new row:

```bash
curl -sL -X POST "$URL" -d '{"timestamp":"2026-08-24T10:00:00Z","firstName":"Test","lastName":"BadEmail","email":"not-an-email","phone":"","attending":"Yes","guests":"1","message":"","companions":[]}'
```

Duplicate guard — run the valid "Yes" command again within a minute of the
first one; expect `{"ok":true,"duplicate":true}` and only **one** row for it.

Finally, submit one reply from the live site itself. Then delete **all** the
test rows — including the three Phase-1 rows named "Test Guest (please
delete)" in the OLD tab.

## 6. Making changes later — read this before any edit

Saving in the editor is **not** enough. The deployed web app keeps running
the old code until you publish a new version:

1. Edit and save `Code.gs`.
2. **Deploy → Manage deployments** → pencil (edit) → **Version: New
   version** → **Deploy**.

The `/exec` URL stays the same, so `js/config.js` never needs to change for a
redeploy. Never put the `/dev` URL into config — it only works for your own
signed-in account, so guests would get failures.

Also: the venue lines, the RSVP deadline, and the hashtag are constants at
the top of `Code.gs` (Apps Script cannot read `js/config.js`). If those facts
ever change in `js/config.js`, change them at the top of `Code.gs` too, and
redeploy (new version, exactly as above).

## 7. Email quota

A consumer Gmail account can send to roughly **100 recipients per day** from
Apps Script. Receipts only go to guests who answer **Yes**, so a normal
wedding day will not get near the limit. To check what is left today, run
this from the script editor (paste it as a scratch function, run it, read the
log):

```js
function checkQuota() { Logger.log(MailApp.getRemainingDailyQuota()); }
```

If the quota ever runs out, the reply is still recorded — the row is written
and its Receipt column reads `skipped (quota)`.
