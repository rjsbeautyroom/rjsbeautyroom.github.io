// Pulls the latest posts and photos from the RJS Beauty Room Facebook page (and the
// Instagram account linked to it) and saves them into data/posts.json and data/img/.
//
// Needs a Page access token in the FB_PAGE_TOKEN environment variable
// (stored as a GitHub repository secret). See README.md for how to get one.

import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const TOKEN = process.env.FB_PAGE_TOKEN;
const API = process.env.FB_API_BASE || "https://graph.facebook.com/v23.0";
const MAX_POSTS = 40;        // how many posts to keep on the site
const MAX_IMAGES_PER_POST = 8;
const MAX_IG = 30;          // how many Instagram posts to add to the gallery
const MAX_REVIEWS = 12;     // how many Facebook reviews to show

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DATA_DIR = path.join(ROOT, "data");
const IMG_DIR = path.join(DATA_DIR, "img");
const JSON_PATH = path.join(DATA_DIR, "posts.json");

if (!TOKEN) {
  console.log("FB_PAGE_TOKEN is not set, so the gallery was not updated. Add it as a repository secret (see README.md).");
  process.exit(0);
}

async function graph(pathAndQuery) {
  const url = `${API}${pathAndQuery}${pathAndQuery.includes("?") ? "&" : "?"}access_token=${encodeURIComponent(TOKEN)}`;
  const res = await fetch(url);
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.error) {
    const e = body.error || {};
    if (e.code === 190) {
      throw new Error("Facebook rejected the access token (expired or revoked). Create a new Page token and update the FB_PAGE_TOKEN secret.");
    }
    throw new Error(`Facebook API error ${res.status}: ${e.message || JSON.stringify(body)}`);
  }
  return body;
}

// Work out which pictures belong to a post (albums have several), and whether
// they are the page's own photos/videos (shown in the gallery) or just a preview
// image from a shared link or event (shown with the post only).
function imagesFor(post) {
  const out = [];
  const add = (media) => {
    const img = media && media.image;
    if (img && img.src && !out.some((o) => o.url === img.src)) {
      out.push({ url: img.src, w: img.width || null, h: img.height || null });
    }
  };
  const atts = (post.attachments && post.attachments.data) || [];
  let video = false;
  let gallery = false;
  for (const a of atts) {
    const type = a.media_type || "";
    if (/video/i.test(type)) video = true;
    if (/photo|album|video/i.test(type)) gallery = true;
    const subs = (a.subattachments && a.subattachments.data) || [];
    if (subs.length) subs.forEach((s) => add(s.media));
    else add(a.media);
  }
  if (!out.length && post.full_picture) {
    out.push({ url: post.full_picture, w: null, h: null });
    if (!atts.length) gallery = true;
  }
  return { images: out.slice(0, MAX_IMAGES_PER_POST), video, gallery: gallery && out.length > 0 };
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not download image (${res.status})`);
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
}

// Instagram posts, through the Instagram account linked to the Facebook page.
// Needs the instagram_basic permission on the token. If Instagram isn't linked
// (or the permission is missing) the site simply carries on with Facebook only.
async function instagramPosts() {
  let ig;
  try {
    const me = await graph(`/me?fields=${encodeURIComponent("instagram_business_account{id,username}")}`);
    ig = me.instagram_business_account;
  } catch (err) {
    console.warn(`Instagram skipped: ${err.message}`);
    return [];
  }
  if (!ig) {
    console.log("No Instagram account is linked to the Facebook page, so only Facebook posts were used.");
    return [];
  }
  const fields = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children{media_type,media_url,thumbnail_url}";
  let res;
  try {
    res = await graph(`/${ig.id}/media?fields=${encodeURIComponent(fields)}&limit=${MAX_IG}`);
  } catch (err) {
    console.warn(`Instagram skipped: ${err.message}`);
    return [];
  }
  const pic = (m) => (/VIDEO/i.test(m.media_type || "") ? m.thumbnail_url : m.media_url);
  return (res.data || []).map((m) => {
    const kids = (m.children && m.children.data) || [];
    const urls = (kids.length ? kids.map(pic) : [pic(m)]).filter(Boolean);
    return {
      id: `ig_${m.id}`,
      source: "instagram",
      date: m.timestamp,
      text: (m.caption || "").trim(),
      link: m.permalink,
      video: /VIDEO/i.test(m.media_type || ""),
      gallery: true,
      images: urls.slice(0, MAX_IMAGES_PER_POST).map((url) => ({ url, w: null, h: null })),
    };
  }).filter((p) => p.images.length);
}

// Facebook reviews ("recommends RJS Beauty Room"). Only positive reviews with
// real text are shown, newest first, with the reviewer's first name and initial.
async function facebookReviews() {
  const fields = "created_time,recommendation_type,review_text,rating,reviewer{name}";
  let res;
  try {
    res = await graph(`/me/ratings?fields=${encodeURIComponent(fields)}&limit=100`);
  } catch (err) {
    console.warn(`Reviews skipped: ${err.message}`);
    return [];
  }
  const shortName = (n) => {
    const parts = (n || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "";
    return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0];
  };
  return (res.data || [])
    .filter((r) => (r.recommendation_type === "positive" || (r.rating || 0) >= 4) && (r.review_text || "").trim().length >= 15)
    .sort((a, b) => new Date(b.created_time) - new Date(a.created_time))
    .slice(0, MAX_REVIEWS)
    .map((r) => ({ name: shortName(r.reviewer && r.reviewer.name), text: r.review_text.trim(), date: r.created_time }));
}

// Same post shared to both Facebook and Instagram? Keep the Facebook copy.
const norm = (t) => (t || "").toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 80);
function isDuplicate(igPost, fbPosts) {
  const key = norm(igPost.text);
  if (!key) return false;
  const t = new Date(igPost.date).getTime();
  return fbPosts.some((f) => norm(f.text) === key && Math.abs(new Date(f.date).getTime() - t) < 3 * 864e5);
}

async function main() {
  await mkdir(IMG_DIR, { recursive: true });

  const fields = [
    "id", "message", "created_time", "permalink_url", "full_picture",
    "attachments{media_type,media,subattachments.limit(20){media_type,media}}",
  ].join(",");

  // Facebook: page through posts until we have enough.
  const fbPosts = [];
  let next = `/me/posts?fields=${encodeURIComponent(fields)}&limit=50`;
  let pages = 0;
  while (next && fbPosts.length < MAX_POSTS && pages < 4) {
    const res = next.startsWith("http") ? await fetchPage(next) : await graph(next);
    for (const p of res.data || []) {
      const { images, video, gallery } = imagesFor(p);
      const text = (p.message || "").trim();
      if (!images.length && !text) continue; // nothing to show
      fbPosts.push({
        id: p.id, source: "facebook", date: p.created_time, text,
        link: p.permalink_url || `https://www.facebook.com/${p.id}`,
        video, gallery, images,
      });
      if (fbPosts.length >= MAX_POSTS) break;
    }
    next = res.paging && res.paging.next;
    pages++;
  }

  const igPosts = (await instagramPosts()).filter((p) => !isDuplicate(p, fbPosts));
  const candidates = [...fbPosts, ...igPosts].sort((a, b) => new Date(b.date) - new Date(a.date));

  const keep = new Set();
  const out = [];
  for (const c of candidates) {
    const safeId = c.id.replace(/[^0-9a-z_]/gi, "");
    const saved = [];
    for (let i = 0; i < c.images.length; i++) {
      const file = `${safeId}_${i}.jpg`;
      const dest = path.join(IMG_DIR, file);
      try {
        if (!existsSync(dest)) await download(c.images[i].url, dest);
        keep.add(file);
        saved.push({ src: `data/img/${file}`, w: c.images[i].w, h: c.images[i].h });
      } catch (err) {
        console.warn(`Skipped an image from post ${c.id}: ${err.message}`);
      }
    }
    if (!saved.length && !c.text) continue;
    out.push({
      id: c.id, source: c.source, date: c.date, text: c.text, link: c.link,
      video: c.video, gallery: c.gallery && saved.length > 0, images: saved,
    });
  }

  // Remove pictures from posts that are no longer shown.
  for (const f of await readdir(IMG_DIR)) {
    if (f.endsWith(".jpg") && !keep.has(f)) await unlink(path.join(IMG_DIR, f));
  }

  const reviews = await facebookReviews();

  // Only rewrite the file if something changed, so the repo isn't committed to every run.
  let previous = null;
  try { previous = JSON.parse(await readFile(JSON_PATH, "utf8")); } catch {}
  if (previous && JSON.stringify(previous.posts) === JSON.stringify(out) &&
      JSON.stringify(previous.reviews || []) === JSON.stringify(reviews)) {
    console.log(`No new posts. ${out.length} posts on the site.`);
    return;
  }
  await writeFile(JSON_PATH, JSON.stringify({ updated: new Date().toISOString(), posts: out, reviews }, null, 2) + "\n");
  const n = (src) => out.filter((p) => p.source === src).length;
  console.log(`Site updated: ${n("facebook")} Facebook posts, ${n("instagram")} Instagram posts and ${reviews.length} reviews.`);
}

async function fetchPage(fullUrl) {
  const res = await fetch(fullUrl);
  const body = await res.json();
  if (body.error) throw new Error(`Facebook API error: ${body.error.message}`);
  return body;
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
