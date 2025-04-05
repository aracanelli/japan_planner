# Building Japan Planner as a Desktop Application

This guide explains how to convert the Japan Planner web application into a standalone desktop application using Electron.

## Prerequisites

- Node.js 16+ installed
- npm or yarn installed
- Japan Planner web app codebase

## Setup

1. Install the required dependencies:

```bash
npm install --save-dev electron electron-builder electron-serve electron-is-dev concurrently
```

2. Make sure your directory structure includes:

```
japan-planner/
├── electron/
│   ├── main.js
│   └── preload.js
├── resources/
│   ├── icon.ico (Windows)
│   ├── icon.icns (macOS)
│   └── icon.png (Linux/general)
├── app.js
├── electron-builder.js
├── package.json
└── next.config.js
```

## Development

To run the app in development mode:

```bash
npm run electron:dev
```

This will:
1. Start the Next.js development server
2. Launch Electron pointing to the local development server

## Building the Desktop App

To build the standalone desktop application:

```bash
npm run electron:build
```

This will:
1. Build and export your Next.js application as static HTML
2. Package everything with Electron
3. Create installers for your platform (Windows, macOS, or Linux)

## Packaging Details

The built application will:
- Store all data locally in the user's AppData folder
- Work offline after initial installation
- Launch like any other desktop application
- Include an application icon

## Distribution

After building, you'll find the packaged application in the `dist` folder. Depending on your platform, you'll get:

- Windows: An NSIS installer (.exe)
- macOS: A DMG file
- Linux: An AppImage

## Customization

You can customize the build by editing:
- `electron-builder.js` - For packaging options
- `electron/main.js` - For application window behavior
- `package.json` in the "build" section - For application metadata

## Notes

- All local storage from the web version will be preserved in the desktop app
- The application will work offline once installed
- You can add auto-update functionality by implementing electron-updater (not included in this basic setup) 