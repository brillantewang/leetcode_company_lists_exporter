# LeetCode Helper Chrome Extension

Being able to download the Meta tagged Leetcode questions into my own custom spreadsheet and systematically reviewing and refreshing them (with the latest questions) was key to my success for receiving an offer from Meta.

Use this extension to download the question URLs for a company + duration (ie Meta, 30 days) into a CSV ordered in the same way as on Leetcode (basically by Frequency). You can then add your own custom fields like `Last Attempted Date`, `Confidence Level (1 - 5)`, etc, whatever helps you track progress.

Then when you want to pull in the latest questions (since Leetcode is constantly updating them), simply upload your existing CSV (make sure it includes `title_slug`) before you click "Get Questions". It merges your existing CSV with the new question set into a new CSV, preserving your custom fields.
- It adds _new_ questions
- It keeps _existing_ questions
- It moves _deleted_ questions to the bottom of the CSV (and flags them `is_outdated`)

## Features

- Extract question URLs from LeetCode company lists (Meta, Uber)
- Support for different time periods (30 days, 3 months, 6 months)
- Automatic CSV generation and download
- Merges with your existing CSV, preserving your custom fields
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
5. Optional - Upload your existing CSV
5. Click "Get Questions"
6. The CSV file will be automatically downloaded

## CSV Format

The generated CSV includes:
- `title_slug`: The question's slug identifier (ie `diameter-of-binary-tree`)
- `url`: Direct link to the question
