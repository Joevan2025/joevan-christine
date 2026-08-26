# For Joevan: taking over the wedding website

The invitation website is finished and running. Mark is handing the whole thing over to your
GitHub account, so the web address carries your name instead of his, and so you can add your
prenup photos yourself whenever they are ready.

About 5 minutes in total. You do not need to know any code.

---

## Step 1 — Accept the handover

GitHub has emailed you an invitation, something like
*"markashlee-de invited you to accept a repository transfer"*.

1. Open that email and click the button to accept.
2. The project now lives at `https://github.com/Joevan2025/joevan-christine`.

> The wedding site goes offline for a few minutes between accounts. That is expected — Step 3
> brings it back.

## Step 2 — Let Mark keep helping

Mark needs permission to keep pushing fixes and improvements.

1. On the project page, click **Settings** (the tab along the top).
2. In the left sidebar click **Collaborators**.
3. Click **Add people**, type **`markashlee-de`**, pick him from the list, and confirm.

Skip this and nobody can update the site for you any more.

## Step 3 — Switch the website back on

1. Still in **Settings**, click **Pages** in the left sidebar.
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Set **Branch** to `main` and the folder to **`/ (root)`**, then click **Save**.
4. Wait a minute or two and refresh. GitHub will show the live address, which will be:

   ```
   https://joevan2025.github.io/joevan-christine/
   ```

5. Open it to check it loads, then **send that link to Mark** — a few settings inside the site
   still point at the old address and he needs to update them.

That is the handover done.

---

## Afterwards: adding your photos

No software needed — this all happens on the GitHub website.

1. Open your project and click into the **`images`** folder.
2. Click **Add file → Upload files** and drag your pictures in.
3. Name them `prenup-01` through `prenup-06` for the gallery. The file type does not matter —
   `.jpg`, `.png`, `.jpeg` and `.webp` all work — but keep the names **lowercase**. The one
   exception is `og.jpg`, the small picture shown when the link is shared on Messenger: that one
   must keep the `.jpg` name exactly.
4. Scroll down and click **Commit changes**.
5. Wait a minute, refresh the wedding site, and your photos replace the drawings.

Songs work the same way in the **`audio`** folder; the file names are listed in its `README.md`.

Keep each photo under about 400 KB so the site stays fast on phones — <https://squoosh.app>
shrinks them for free.

## If something goes wrong

- **No invitation email** — check your spam folder.
- **You cannot find Settings** — make sure you are signed in as Joevan2025.
- **The site shows "404"** — Step 3 was not finished, or it needs another minute.
- **Anything else** — take a screenshot and send it to Mark.
