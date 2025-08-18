# Leetcode Company Lists Exporter

[youtube](https://youtu.be/aQBkWeFEBeo?si=rPRQBMhOWWzOd6vf)

Use this extension to export the question URLs for a company + duration (ie Meta, 30 days) to a CSV, ordered in the same way as on Leetcode (basically by Frequency). You can then add your own custom fields like `Last Attempted Date`, `Confidence Level (1 - 5)`, etc, whatever helps you track progress.

Then when you want to pull in the latest questions (since Leetcode is constantly updating them), simply upload your existing CSV (make sure it includes `title_slug`) before you click "Get Questions". It merges your existing CSV with the new question set into a new CSV, while preserving your custom fields.
- It adds _new_ questions
- It keeps _existing_ questions
- It moves _deleted_ questions to the bottom of the CSV (and flags them `is_outdated`)

## Features

- Extract question URLs from LeetCode company lists
- Support for different time periods (30 days, 3 months, 6 months)
- Automatic CSV generation and download
- Merges with your existing CSV, preserving your custom fields
- Uses your existing LeetCode session (no need to enter credentials)

## Requirements

- LeetCode Premium subscription
- Must be logged into LeetCode in your browser
- Chrome browser

## Usage

1. Make sure you're logged into LeetCode (and you have Premium) in any browser tab
2. Open Leetcode Company Questions Exporter
3. Select your desired company
4. Select your desired time period
5. Optional - Upload your existing CSV (make sure it has the `title_slug` field for matching)
5. Click "Get Questions"
6. The CSV file will be automatically downloaded

## CSV Format

The generated CSV includes:
- `title_slug`: The question's slug identifier (ie `diameter-of-binary-tree`)
- `url`: Direct link to the question
