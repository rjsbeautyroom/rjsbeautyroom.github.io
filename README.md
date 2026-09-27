# RJS Beauty Room website

A one-page site for RJS Beauty Room & Training Academy, Sheffield, hosted on GitHub Pages.
Bookings go to the Acuity booking page; messages go to Facebook.
The "News & updates" and "Latest work" sections fill themselves from the RJS Facebook page and its
linked Instagram account: every 3 hours a GitHub Action pulls the newest posts and photos, saves them
into `data/`, and redeploys the site.

## What's in here

| Path | What it is |
|---|---|
| `index.html` | The whole website |
| `assets/` | Logo, banner, icons |
| `data/posts.json`, `data/img/` | Facebook and Instagram posts and photos (filled in automatically, don't edit) |
| `scripts/fetch-facebook.mjs` | Pulls posts and photos from Facebook and Instagram |
| `.github/workflows/facebook.yml` | Runs the script every 3 hours and deploys the site |

## One-time setup

### 1. Put the site on GitHub

1. Create a new repository and upload everything in this folder, including the hidden `.github` folder and `.nojekyll` file. The branch must be called `main`.
2. Go to **Settings → Pages** and set **Source** to **GitHub Actions**.

### 2. Link Instagram to the Facebook page

Skip this if you only want Facebook posts.

1. In the Instagram app, go to **Settings → Account type and tools** and make sure the account is a **Business** or **Creator** account (both are free).
2. On the RJS Facebook page, go to **Settings → Linked accounts → Instagram** and connect **@rjsbeautyroom**.

### 3. Create a Facebook Page token

You need to be an admin of the RJS Facebook page.

1. Go to [developers.facebook.com](https://developers.facebook.com), log in, and open **My Apps → Create App**.
   Pick the use case for managing a Page (or "Other" then "Business"), give it any name such as "RJS Website", and finish.
   The app can stay in Development mode. It doesn't need Facebook's App Review because you're an admin of the page.
2. Open the [Graph API Explorer](https://developers.facebook.com/tools/explorer/).
   - **Meta App**: pick the app you just made.
   - **User or Page**: choose **Get User Access Token**.
   - Add these permissions: `pages_show_list`, `pages_read_engagement`, `pages_read_user_content`, and `instagram_basic` for Instagram.
   - Click **Generate Access Token**, log in, and tick the **RJS Beauty Room** page when asked.
3. Copy the token, paste it into the [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/), click **Debug**, then **Extend Access Token** at the bottom. Copy the new long-lived token.
4. Back in the Graph API Explorer, paste the long-lived token into the Access Token box and run this query:
   ```
   me/accounts?fields=name,access_token
   ```
   Copy the `access_token` shown next to **RJS Beauty Room**. This is the Page token.
5. Optional check: paste the Page token into the Access Token Debugger. **Expires** should say **Never**.

### 4. Give the token to GitHub

1. In the repository go to **Settings → Secrets and variables → Actions → New repository secret**.
2. Name: `FB_PAGE_TOKEN`. Value: the Page token from step 3.4.
3. Go to the **Actions** tab, open **Update gallery and deploy**, and click **Run workflow**.

After a minute or two the site shows the latest Facebook and Instagram posts. From then on it updates by itself every 3 hours.

## Good to know

- **What goes where.** Every Facebook post with a caption appears under **News & updates**, newest first. Photos and videos from both Facebook and Instagram appear in the **Latest work** gallery, newest first. If the same post was shared to both, it only appears once. Shared links show their preview image in News & updates but stay out of the gallery. Videos show their thumbnail and link out to play. The site keeps the latest 40 Facebook and 30 Instagram posts.
- **Instagram not showing?** Check the Action log. It says if Instagram isn't linked to the Facebook page, or if the token is missing the `instagram_basic` permission. Facebook posts keep working either way.
- **Before the token is added**, News & updates stays hidden and the gallery shows a "View on Facebook" button, so the site still works.
- **Filters.** The Nails, Lashes, Brows and Tattoos buttons sort posts by words in the caption (for example "lash", "brow", "microblading", "tattoo"). A button only appears once a post matches it, so mentioning the treatment in captions keeps the filters accurate.
- **If the token stops working** (for example after a Facebook password change, or if the admin who made it is removed from the page), the Action shows a red error and the site keeps showing the last posts it saved. Make a new token (step 3) and update the secret.
- **If there's a long gap between posts**, GitHub may pause scheduled Actions after 60 days without any repository activity. It emails the repo owner when it does. Re-enable it on the Actions tab.
- **Posting straight away.** To update the site without waiting, open the Actions tab and click **Run workflow**.
- **Domain.** The site is set up for `rjsbeautyroom.co.uk` (link previews, Google listing, sitemap). Add it under **Settings → Pages → Custom domain**, then tick **Enforce HTTPS**. DNS at the registrar: four `A` records for `@` pointing to 185.199.108.153, 185.199.109.153, 185.199.110.153 and 185.199.111.153, and a `CNAME` for `www` pointing to `rjsbeautyroom.github.io`.
