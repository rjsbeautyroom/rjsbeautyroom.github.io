# RJS Beauty Room website

A one-page site for RJS Beauty Room & Training Academy, Sheffield, hosted on GitHub Pages.
Bookings go to the Acuity booking page; messages go to Facebook.
The "News & updates" and "Latest work" sections fill themselves from the RJS Facebook page and its
linked Instagram account: every 3 hours a GitHub Action pulls the newest posts and photos, saves them
into `data/`, and redeploys the site.

## What's in here

| Path | What it is |
|---|---|
| `index.html` | The homepage |
| `guides.html` | Lash, brow, nail & tattoo style guides page |
| `academy.html` | Training Academy page (courses, course finder, student photos, FAQ) |
| `404.html` | Branded "page not found" page (GitHub shows it for any wrong address) |
| `assets/site.css` | Styles shared by every page |
| `assets/common.js` | Shared behaviour: smooth scrolling, header, scroll reveals |
| `assets/announcement.json` | The announcement bar (switched off until `"show": true`) |
| `assets/academy.js` | Academy course finder and photo spaces |
| `assets/academy/` | Academy photos: `hero.webp`, `training-1.webp` to `training-9.webp`, `graduate-1.webp` to `graduate-3.webp` |
| `assets/theme.json` | Seasonal theme switch (`"season": "auto"`, `"none"`, `"halloween"`, `"christmas"`, `"newyear"`, `"valentines"`, `"mothersday"`, `"easter"`) |
| `assets/seasons.js` | The seasonal decorations |
| `assets/guides.js` | The interactive lash, brow, nail and tattoo drawings |
| `assets/` | Logo, banner, icons and the files above |
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
- **Reviews.** The same token also pulls positive Facebook reviews (recommendations) with at least a sentence of text. The "What our clients say" section stays hidden until there is at least one. Reviewers show as first name and initial. If reviews are turned off on the Facebook page, the section simply stays hidden.
- **Instagram not showing?** Check the Action log. It says if Instagram isn't linked to the Facebook page, or if the token is missing the `instagram_basic` permission. Facebook posts keep working either way.
- **Before the token is added**, News & updates stays hidden and the gallery shows a "View on Facebook" button, so the site still works.
- **Filters.** The Nails, Lashes, Brows and Tattoos buttons sort posts by words in the caption (for example "lash", "brow", "microblading", "tattoo"). A button only appears once a post matches it, so mentioning the treatment in captions keeps the filters accurate.
- **If the token stops working** (for example after a Facebook password change, or if the admin who made it is removed from the page), the Action shows a red error and the site keeps showing the last posts it saved. Make a new token (step 3) and update the secret.
- **If there's a long gap between posts**, GitHub may pause scheduled Actions after 60 days without any repository activity. It emails the repo owner when it does. Re-enable it on the Actions tab.
- **Posting straight away.** To update the site without waiting, open the Actions tab and click **Run workflow**.
- **Domain.** The site is set up for `rjsbeautyroom.co.uk` (link previews, Google listing, sitemap). Add it under **Settings → Pages → Custom domain**, then tick **Enforce HTTPS**. DNS at the registrar: four `A` records for `@` pointing to 185.199.108.153, 185.199.109.153, 185.199.110.153 and 185.199.111.153, and a `CNAME` for `www` pointing to `rjsbeautyroom.github.io`.
- **Announcement bar.** Edit `assets/announcement.json` to show a gold strip at the top of every page, e.g. `{"show": true, "text": "Cancellation slot this Friday at 2pm.", "link": "https://rjsbeautyroom.as.me/schedule/dfc4edcf", "linkText": "Book now"}`. Set `"show": false` to hide it again. Visitors can close it with the ×.
- **Academy photos.** Photos live in `assets/academy/`: `hero.webp` (top of the page), `training-1.webp` to `training-9.webp` (Inside the academy) and `graduate-1.webp` to `graduate-3.webp` (Our graduates). To swap one, upload a new photo with the same name. On the live site any missing photo is simply left out (and a section hides if it has none); everywhere else a gold placeholder shows which file goes where.
- **Seasonal themes.** Themes switch on and off by themselves with `"season": "auto"` in `assets/theme.json`: Halloween 17–31 October, Christmas 1–27 December, New Year 28 December–2 January, Valentine's 1–14 February, Mother's Day the week up to Mothering Sunday (UK), and Easter from Palm Sunday to Easter Monday. Mother's Day and Easter move each year and are worked out automatically. Set `"season"` to `"none"` to turn themes off completely, or to a theme name (e.g. `"christmas"`) to force that theme on whatever the date. Themes are decoration only and never block clicks. Moving effects stay on the homepage banner, so nothing moves over text; the other pages get a small garland in its own space above the heading. Every theme also restyles the site (accent colours, buttons, background tint, a decoration on each card and symbols in the ribbon) without changing the layout. Preview any theme by adding `?season=christmas` (or `#season-christmas`) to the address, or test the calendar with `?season=auto&date=2026-10-20`. Visitors with reduced motion turned on see the ornaments without the moving effects.
