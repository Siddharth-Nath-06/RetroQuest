---
description: How to deploy RetroQuest to GitHub Pages
---

# Deploying to GitHub Pages

Since RetroQuest is a client-side application (no backend), it's perfect for GitHub Pages!

## Prerequisites

1.  Your project must be a Git repository connected to GitHub.
2.  You need to install the `gh-pages` package.

## Steps

1.  **Install `gh-pages`:**
    Run this command in your terminal:
    ```bash
    npm install gh-pages --save-dev
    ```

2.  **Deploy the App:**
    I've already added the deployment scripts to your `package.json`. Just run:
    ```bash
    npm run deploy
    ```
    *This will automatically build your project and push the `dist` folder to a `gh-pages` branch on your GitHub repository.*

3.  **Configure GitHub Settings:**
    -   Go to your repository on GitHub.
    -   Go to **Settings** > **Pages**.
    -   Under **Build and deployment** > **Source**, select **Deploy from a branch**.
    -   Select the **gh-pages** branch and save.

4.  **Visit Your Quest Log:**
    After a minute or two, your site will be live! GitHub will show you the URL (usually `https://yourusername.github.io/retroquest/`).

## Important Notes

-   **Data Persistence:** Since we use `localStorage`, your data is saved in your browser. If you visit the site on a different device (or even a different browser), you won't see your data unless you use the **Export/Import** feature in the Profile tab.
-   **Updates:** Whenever you make changes, just run `npm run deploy` again to update the live site.
