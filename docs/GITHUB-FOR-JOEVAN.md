# For Joevan: taking over the wedding website

The invitation website is finished and running. Mark is handing the whole thing over to your
GitHub account, so the web address carries your name instead of his, and so you can add your
prenup photos yourself whenever they are ready.

Total time: about 5 minutes. You do not need to know any code.

**If you don't have a GitHub account yet:** go to <https://github.com/signup> and make one first
(free). Then send Mark your **username** — he needs it to start the handover.

---

## Step 1 — Accept the handover

Mark starts the transfer, and GitHub emails you an invitation titled something like
*"markashlee-de invited you to accept a repository transfer"*.

1. Open that email and click the button to accept.
2. The project now lives at `https://github.com/<your-username>/joevan-christine`.

> While the wedding site is between accounts it will be offline for a few minutes. That is normal
> and Step 3 brings it back.

## Step 2 — Let Mark keep helping

Mark needs permission to keep pushing fixes and improvements.

1. On the project page, click **Settings** (tab along the top).
2. In the left sidebar click **Collaborators**.
3. Click **Add people**, type **`markashlee-de`**, select him, and confirm.

Without this step nobody can update the site for you any more.

## Step 3 — Switch the website back on

1. Still in **Settings**, click **Pages** in the left sidebar.
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Set **Branch** to `main` and the folder to **`/ (root)`**, then click **Save**.
4. Wait a minute or two and refresh the page. GitHub will show the live address, which will be:

   ```
   https://<your-username>.github.io/joevan-christine/
   ```

5. Open it to check it loads, then **send that link to Mark** so he can update a few settings
   inside the site that point at the old address.

That's the handover done.

---

## Afterwards: adding your photos

No tools needed — everything happens on the GitHub website.

1. Open your project and click into the **`images`** folder.
2. Click **Add file → Upload files**, then drag your pictures in.
3. Name them exactly as listed in that folder's `README.md` file — `prenup-01.jpg` through
   `prenup-06.jpg` for the gallery, and `og.jpg` for the small picture people see when the link is
   shared on Messenger.
4. Scroll down and click **Commit changes**.
5. Wait a minute, refresh the wedding site, and your photos replace the drawings.

Songs work the same way in the **`audio`** folder — the names are listed in its `README.md`.

Try to keep each photo under about 400 KB so the site stays quick on phones;
<https://squoosh.app> shrinks them for free.

## If something goes wrong

- **No invitation email** — check spam, and confirm Mark used the right username.
- **You can't find Settings** — you must be signed in as the account that accepted the transfer.
- **The site shows "404"** — Step 3 was not finished, or it needs another minute.
- **Anything else** — screenshot it and send it to Mark.
