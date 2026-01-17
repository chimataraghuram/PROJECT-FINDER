# Deployment Guide

This project is configured for automatic deployment to **GitHub Pages**.

## Prerequisites

1. **Push to GitHub**: Ensure this project is pushed to a repository on GitHub.
2. **Settings**: Go to your GitHub Repository -> **Settings**.

## Step 1: Add API Key Secret (CRITICAL)
Since this is a public website, you must provide the API Key securely during the build process.

1. Go to **Settings** > **Secrets and variables** > **Actions**.
2. Click **New repository secret**.
3. **Name**: `SEARCH_API_KEY`
4. **Secret**: Paste your API Key here (starts with `AIza...`).
5. Click **Add secret**.

> **Warning**: Your API Key will be embedded in the public website code. It is recommended to restrict your API Key in Google AI Studio to only accept requests from your GitHub Pages domain (e.g., `chimataraghuram.github.io`) to prevent misuse.

## Step 2: Configure Pages
1. Go to **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. The deployment workflow should automatically pick this up next time you push code.

## Manual Test
You can trigger the deployment manually:
1. Go to the **Actions** tab in your repo.
2. Click **Deploy to GitHub Pages** on the left.
3. Click **Run workflow**.
