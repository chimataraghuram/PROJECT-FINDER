# Deployment Guide

This project is configured for automatic deployment to **GitHub Pages**.

## Prerequisites

1. **Push to GitHub**: Ensure this project is pushed to a repository on GitHub.
2. **Settings**: Go to your GitHub Repository -> **Settings**.

## Step 1: Configure Pages

1. Go to **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. The deployment workflow should automatically pick this up next time you push code.

> **Note**: This project uses free public APIs (GitHub API, Hugging Face API) that don't require any API keys. It's completely safe to deploy publicly on GitHub Pages!

## Manual Test

You can trigger the deployment manually:
1. Go to the **Actions** tab in your repo.
2. Click **Deploy to GitHub Pages** on the left.
3. Click **Run workflow**.

## How It Works

- **GitHub Search**: Uses GitHub's public REST API (no authentication needed for public repos)
- **Hugging Face Search**: Uses Hugging Face's public API (no key required)
- **Kaggle Search**: Provides search links to Kaggle (public access)

All APIs are called directly from the browser, making this perfect for static hosting on GitHub Pages!
