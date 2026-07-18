# Pyanz Jheo Quiros — AngularJS Portfolio

A compact portfolio built with AngularJS 1.8.3 and Vite.

Version 26 removes the online admin and authentication system. It adds a
separate local JSON editor for projects, blogs, work experience, education,
skills, social links, and profile details. The project modal gallery also uses
a smooth crossfade/slide transition and simplified animated pagination. The
editor displays generated JSON in a copyable modal instead of downloading it.
Work experience now uses separate start and end months and automatically
calculates the elapsed years and months; an empty end date displays Current.
Blogs use a publish date and time to display relative labels such as Posted 5
mins ago, Posted 3 hrs ago, or Posted 2 days ago instead of estimated read time.
All editable content is now stored in one `public/content/portfolio.json` file,
and the editor displays every content group together on one page. There are no
separate content tabs; one modal previews the complete combined JSON.
Work month inputs are normalized in UTC as strict `YYYY-MM` strings to prevent
the selected month from shifting because of the browser's timezone.
Clearly labeled sample projects and blogs are included so both sections exceed
eight entries and immediately demonstrate pagination. Delete or replace the
`Sample:` entries through the editor when real content is ready.

## Run the portfolio and editor

```bash
npm install
npm run dev
```

Open the addresses printed by Vite:

- Portfolio: `http://localhost:5173/`
- JSON editor: `http://localhost:5173/editor.html`

The editor is a local file generator, not a live admin dashboard. It cannot
change the published site or repository and does not need an account.

## Updating content

1. Open `editor.html` through the Vite development server.
2. Use the grouped Projects, Blogs, Work experience, Education, Skills, Social
   links, and Profile sections on the same page.
3. Add, edit, or delete entries in any group.
4. Click **Show JSON**.
5. Copy the formatted code from the modal and replace
   `public/content/portfolio.json`.
6. Refresh the portfolio preview to verify the changes.

The JSON modal supports text selection and includes a one-click copy button.

## Build

```bash
npm run build
```

Vite builds both `index.html` and `editor.html`. You may omit `editor.html`
from the files you publish if you want the deployed portfolio to contain only
the public page.
