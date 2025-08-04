# Auto-Update Setup Guide

This guide explains how to set up automatic updates for BtwBuddy using GitHub Releases.

## How it Works

The app automatically checks for updates when it starts up and will:
1. Check for new releases on GitHub
2. Download updates automatically in the background
3. Notify users when updates are available
4. Install updates when the app is restarted

## Setup Instructions

### 1. GitHub Token Setup

You need to create a GitHub Personal Access Token for the auto-updater to work:

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name like "BtwBuddy Auto-Updater"
4. Select the following scopes:
   - `repo` (for private repos)
   - `public_repo` (for public repos)
5. Copy the generated token

### 2. Environment Variables

Create a `.env` file in your project root (if it doesn't exist) and add:

```
GH_TOKEN=your_github_token_here
```

### 3. Publishing Updates

To release a new version:

1. Update the version in `package.json`
2. Commit your changes
3. Create a new tag: `git tag v1.0.2`
4. Push the tag: `git push origin v1.0.2`

The GitHub Actions workflow will automatically:
- Build the app for Windows, macOS, and Linux
- Create a new release on GitHub
- Upload the installers

### 4. Manual Release (Alternative)

If you prefer to build manually:

```bash
# Build for all platforms
npm run dist

# Or build for specific platform
npm run dist:win
npm run dist:mac
npm run dist:linux
```

Then manually upload the files from the `release/` folder to a GitHub release.

## Configuration

The auto-updater is configured in `src/main/auto-updater.ts`:

- **Auto-download**: Updates are downloaded automatically
- **Auto-install**: Updates are installed when the app quits
- **Check interval**: Updates are checked 3 seconds after app startup
- **GitHub repo**: Configured to use `QVDW/BtwBuddy`

## User Experience

Users will see:
- A notification when updates are available
- Download progress (in the background)
- A prompt to restart when updates are ready
- The current version displayed in the UI

## Troubleshooting

### Common Issues

1. **Updates not found**: Make sure the GitHub token has the correct permissions
2. **Download fails**: Check your internet connection
3. **Installation fails**: Make sure the app has write permissions

### Debug Mode

To see detailed logs, run the app in development mode:

```bash
npm run dev
```

The console will show update check progress and any errors.

## Security Notes

- The GitHub token should be kept secure
- Updates are verified using GitHub's release signatures
- Only signed releases from your repository will be installed

## Version Management

The app version is managed in `package.json`. Always increment the version before releasing:

```json
{
  "version": "1.0.2"
}
```

The auto-updater will compare this version with the latest release on GitHub. 