# LeetCode Helper Chrome Extension

A Chrome extension that exports LeetCode company-specific question lists to CSV format.

## Features

- Extract questions from LeetCode company lists (Meta, Uber)
- Support for different time periods (30 days, 3 months, 6 months)
- Automatic CSV generation and download
- Uses your existing LeetCode session (no need to enter credentials)

## Requirements

- LeetCode Premium subscription
- Must be logged into LeetCode in your browser
- Chrome browser

## Installation

1. Clone this repository or download the extension files
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `leetcode_helper_extension` directory
5. The extension should now appear in your extensions list

## Usage

1. Make sure you're logged into LeetCode in any browser tab
2. Click the LeetCode Helper extension icon in your toolbar
3. Select your desired company (Meta or Uber)
4. Select your desired time period (30 days, 3 months, or 6 months)
5. Click "Get Questions"
6. The CSV file will be automatically downloaded

## CSV Format

The generated CSV includes:
- `title_slug`: The question's slug identifier
- `url`: Direct link to the question

