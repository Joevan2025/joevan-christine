# For Joevan: making the confirmation emails come from you

Right now, when a guest sends their RSVP on the website, they get a confirmation
email automatically. It works, but it is being sent from Mark's Gmail account
(it just *shows* your names). Google only lets an email be sent from the account
that runs the code, so to have these emails truly come from
**j.cponce.me92@gmail.com**, you need to be the one who switches it on.

It takes about 5 minutes. You do not need to write or understand any code, and
you will not be charged anything. Nothing else about the website changes.

**Before you start:** Mark will share the RSVP spreadsheet with you as an
**Editor**. Make sure you can open it, and that you are signed in to Google as
j.cponce.me92@gmail.com (not another account).

---

## Step 1 — Open the code editor

1. Open the RSVP spreadsheet Mark shared with you.
2. In the menu at the top, click **Extensions → Apps Script**.
3. A new tab opens with a page full of code. **Do not change anything here.**
   The code is already written and saved. You are only going to turn it on
   under your own account.

## Step 2 — Turn it on (deploy)

1. At the top right, click the blue **Deploy** button → **New deployment**.
2. Next to "Select type", click the gear icon ⚙ and choose **Web app**.
3. Fill in the small form:
   - **Description:** anything, for example `receipts from Joevan`
   - **Execute as:** **Me (j.cponce.me92@gmail.com)** ← this is the important one
   - **Who has access:** **Anyone**
     > It must say exactly "Anyone". If you pick "Anyone with a Google account",
     > guests' replies will fail, because guests are not signed in to Google.
4. Click **Deploy**.

## Step 3 — Give it permission

Google will now ask for permission, because the code needs to write to the
spreadsheet and send the confirmation emails.

1. Click **Authorize access** and choose your account.
2. You will see a scary-looking screen: **"Google hasn't verified this app"**.
   This is normal. It only means the code is a private script rather than a
   public app from the Play Store. It is the same code already running now.
3. Click **Advanced** (small link at the bottom left) → **Go to (project name)
   (unsafe)** → **Allow**.

## Step 4 — Copy the link and send it to Mark

After it finishes, a box appears with a **Web app URL** that looks like this:

```
https://script.google.com/macros/s/AKfyc............/exec
```

1. Click **Copy** underneath it.
2. Send that link to Mark. That is the only thing he needs.

Mark will paste it into the website, test it, and from then on every guest who
accepts the invitation gets their confirmation email **from you**.

---

## Good to know

- **Guests who decline get no email** — only accepting guests receive a receipt.
- **Replies from guests** currently go to Christine's email address. If you would
  rather they come to you, tell Mark and he will change one line.
- **Daily limit:** Gmail allows about 100 of these emails per day, which is far
  more than a wedding needs.
- **If the code is ever updated:** you will need to repeat Step 2 (choosing
  "Manage deployments" instead of "New deployment") — Mark will tell you if that
  ever happens.

## If something goes wrong

- **You cannot find "Extensions → Apps Script"** — you are probably opening the
  file in the Google Sheets *mobile app*. Use a computer browser instead.
- **The menu is greyed out or the code is missing** — Mark has not shared the
  file with you as an Editor yet. Ask him to check the sharing settings.
- **Anything else** — take a screenshot and send it to Mark.
