# AIO Gap Analyzer Chrome Extension

Created by Andrew F. Llewellyn

A Chrome extension that helps marketers improve their blog articles by identifying content gaps between Google AI Overviews and their existing content. The extension analyzes what information is present in AI Overviews but missing from articles, providing actionable recommendations to increase the likelihood of being referenced in future AI Overviews.

## Features

- **Automatic AI Overview Detection**: Monitors Google SERPs and automatically captures AI Overview content when detected
- **Gap Analysis**: Compares AI Overview content with your blog article using advanced AI analysis
- **Persistent Storage**: Stores analysis results across browser sessions and navigation
- **Dual UI Surfaces**:
  - Popup for quick actions and configuration
  - Side panel for comfortable reading of results
- **Copy Actions**: Easy copying of AI Overview text and gap analysis recommendations

## Installation

1. Download the `aio-gap-analyzer.zip` file
2. Extract the contents to a folder
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode" in the top right
5. Click "Load unpacked" and select the extracted folder

## Backend Setup

The extension requires a backend API for the gap analysis. You have two options:

### Option 1: Vercel Deployment (Recommended)

1. Create a new Vercel project
2. Upload the `api/` folder contents
3. Set the `OPENAI_API_KEY` environment variable
4. Deploy the function
5. Update the API URL in `src/popup.tsx` (replace `https://your-vercel-app.vercel.app`)

### Option 2: Local Development

1. Install dependencies in the `api/` folder:
   ```bash
   cd api
   npm install
   ```

2. Set up environment variables:
   ```bash
   export OPENAI_API_KEY=your_openai_api_key
   ```

3. Run the API locally:
   ```bash
   npm start
   ```

4. Update the API URL in the extension to point to your local server

## Usage

1. **Navigate to Google Search**: Go to a Google search results page that contains an AI Overview
2. **Extension Activation**: The extension will automatically detect and capture the AI Overview
3. **Open Popup**: Click the extension icon to open the popup
4. **Enter Article URL**: Paste the URL of your blog article to analyze
5. **Run Analysis**: Click "Run Gap Analysis" to compare your article with the AI Overview
6. **View Results**: Open the side panel to read the detailed gap analysis recommendations

## Architecture

### Extension Components
- **Popup**: React-based interface for configuration and actions
- **Side Panel**: Reading interface for analysis results
- **Content Script**: Detects AI Overviews on Google SERPs
- **Background Script**: Handles storage and API communication

### Backend API
- **Readability Extraction**: Uses Mozilla Readability to extract clean article content
- **AI Analysis**: Leverages OpenAI GPT-4 for intelligent gap analysis
- **Structured Output**: Returns specific recommendations in JSON format

## Development

### Building the Extension

```bash
# Install dependencies
npm install

# Build for production
npm run build:extension

# Create zip file
npm run zip
```

### Project Structure

```
aio-serp-gap-analyzer/
├── manifest.json          # Extension manifest
├── popup.html            # Popup HTML
├── sidepanel.html        # Side panel HTML
├── src/
│   ├── popup.tsx         # Popup React component
│   ├── sidepanel.tsx     # Side panel React component
│   ├── content.ts        # Content script for AI Overview detection
│   └── background.ts     # Background script for storage/API
├── api/
│   └── analyze.js        # Vercel serverless function
└── dist/                 # Built extension files
```

## Security

- API keys are stored server-side only (no client-side storage)
- All communication uses HTTPS
- CORS properly configured for cross-origin requests

## Privacy

The extension only:
- Reads Google search results pages to detect AI Overviews
- Stores analysis data locally in Chrome storage
- Sends article URLs and AI Overview content to the backend for analysis
- Does not track personal information or browsing history

## License

This project was created by Andrew F. Llewellyn for educational and professional use.
