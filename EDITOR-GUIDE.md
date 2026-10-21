# How to add events and blog posts (no coding)

1. Go to https://YOURDOMAIN.org/admin and log in with the email you were invited with.
2. Choose "Upcoming events" or "Blog posts", then "New event" / "New post".
3. Fill in the form. Events disappear from the site automatically after their end date.
4. Click Publish → "Publish now". The site updates in about a minute.

Tips: keep photos under 1 MB; each Publish uses 15 Netlify credits, so add several changes before publishing.

## One-time setup (done by whoever manages the site)
1. Put this folder in a GitHub repository (branch "main") and connect it to Netlify (Add new site → Import from Git).
2. Netlify → Site configuration → Identity → Enable Identity. Under Registration choose "Invite only". Under Services → Git Gateway, click Enable.
3. Identity tab → Invite users → enter each editor's email. They click the link in the email and set a password.
4. If Identity is unavailable, in admin/config.yml change `name: git-gateway` to `name: github` and `repo: OWNER/REPO`, and set up GitHub login under Site configuration → Access & security → OAuth.
