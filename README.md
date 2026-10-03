# Pujo Pandal Guide: deploy on Vercel

Files:
- `index.html`: the whole website (starter list of Kolkata pandals, search, area filter, add-a-pandal form)
- `api/pandals.js`: small Vercel function that stores pandals added by visitors
- `package.json`

## Deploy (about 10 minutes)

### 1. Put the folder on GitHub
1. Create a free account at github.com and click **New repository** (name it `pujo-pandal-guide`).
2. Upload everything in this folder (`index.html`, `package.json`, and the `api` folder with `pandals.js`).

### 2. Import it into Vercel
1. Sign up at vercel.com with your GitHub account.
2. Click **Add New → Project**, pick the `pujo-pandal-guide` repository and click **Deploy**.
3. Vercel gives you a live link like `https://pujo-pandal-guide.vercel.app`.

(Alternative with no GitHub: install Node.js, then run `npm i -g vercel` and `vercel --prod` inside this folder.)

### 3. Connect the free database
The site already works at this point, but visitors cannot add pandals until storage is connected.
1. In your Vercel project, open the **Storage** tab (or Marketplace) and add **Upstash Redis** (free plan).
2. Connect it to this project. Vercel adds the `KV_REST_API_URL` and `KV_REST_API_TOKEN` settings for you.
3. Open **Deployments** and **Redeploy** the latest deployment so it picks up the new settings.

### 4. Test
Open your live link, add a test pandal in the form at the bottom, then reload the page. It should still be there.

## Removing a spam entry (optional)
1. In Vercel, open **Settings → Environment Variables** and add `ADMIN_KEY` with a long secret value. Redeploy.
2. Find the entry's `id` by opening `https://YOUR-SITE.vercel.app/api/pandals` in a browser.
3. Run: `curl -X DELETE -H "x-admin-key: YOUR_SECRET" "https://YOUR-SITE.vercel.app/api/pandals?id=THE_ID"`

## Notes
- Each connection can add 10 pandals per hour, and the list keeps the newest 500.
- Directions buttons open Google Maps in a new tab. No Google API key is needed.
- To change the starter list, edit the `STARTER` array inside `index.html`.
