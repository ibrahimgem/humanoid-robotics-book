---
name: deploy-docusaurus
description: Automates pushing Docusaurus book to GitHub Pages.
tools: [Bash]
model: inherit
---

Steps:
1. Build static site.
2. Push to gh-pages branch.
3. Validate build success.