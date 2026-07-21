# Website Admin Panel — Quick Guide

*For the Unique Info Systems team. No technical knowledge needed.*

## Signing in

1. Open the admin panel link: `https://<your-admin-url>.vercel.app` *(fill in after deployment)*
2. Enter the admin email and password you were given.
3. Forgot the password? Ask your developer to reset it — there is no "forgot password" link, by design.

Changes you save go **live on the website immediately** — just refresh the site to see them.

## News strip (homepage)

The thin "UPDATES" bar near the top of the homepage.

- **Add an update** — type the text (keep it one short line, like an offer or announcement) and press *Add update*. Optionally add a link (e.g. `/offers` to send visitors to the Offers page) and a label for it (e.g. "See offer").
- **Rotate order** — use the ▲▼ arrows. The strip cycles through updates every 5 seconds in this order.
- **Hide without deleting** — flip the *Showing on site* switch off. Good for seasonal offers you'll reuse.
- **No updates showing?** The strip disappears from the website completely. That's normal — add or un-hide one to bring it back.

## Offers

Everything on the Offers page.

- **Add an offer** — press *Add an offer*, fill in at least a title, then *Add offer*. Useful extras: a badge (`-25% OFF`), a coupon code, the was/now prices, and an "Ends 31 Oct" label.
- **Prices** — either fill in *Was ₹* and *Now ₹*, **or** put text in *Or text price* (e.g. "On request"). The text version wins if you fill both.
- **Featured** — one offer can be *Featured*. It becomes the big dark box at the top of the page with the countdown, and still shows as a card below. Press *Make featured* on any offer to move the badge to it.
  - The featured box has its own fields: a short **Big headline** ("25% off"), a **Subtitle** ("TallyPrime Gold"), and an optional **Countdown ends at** date. Leave the date blank and the timer is simply hidden.
- **Order** — ▲▼ arrows set the order the cards appear in.
- **Hide / delete** — switch off to pause an offer without losing it; *Delete* removes it permanently.
- **No offers showing?** The page automatically switches to its "No live offers right now" message, with the newsletter signup and phone number. You don't have to turn anything off.

## Gallery (About page)

The photo slideshow on the About Us page.

- **Upload** — press *Upload photos* and pick one or several photos (straight from a phone is fine — large photos are resized automatically).
- **Caption** — optional text shown on the photo itself.
- **Order** — ▲▼ arrows set the slideshow order.
- **Hide / delete** — switch off to hide temporarily; *Delete* removes it permanently.
- With no photos showing, the gallery section disappears from the About page.

Tip: landscape (wide) photos look best — the frame is widescreen on computers.

## Download links

The six SoftTrade installer links (Mandi, Brokwin, Coldwin — Single and Multi User each).

When a OneDrive link changes:

1. Copy the new share link from OneDrive.
2. Paste it into the matching box (make sure product and Single/Multi match).
3. Press *Save*. The Downloads page and the product pages use the new link immediately.
4. Use *Test current link* first if you want to check what's live right now.

The link must start with `https://` — anything else won't save.

## If something looks wrong

- **Changes not showing?** Hard-refresh the website (Ctrl+Shift+R). If it still
  doesn't update, the content service may be paused — tell your developer.
- **Can't sign in?** Password resets are done by your developer.
- If the content service is ever down, the website does **not** break — it simply
  shows its built-in content until the service is back.
