# Leetcode Company Lists Exporter

## Description

[youtube](https://youtu.be/aQBkWeFEBeo?si=rPRQBMhOWWzOd6vf)

Use this extension to export the question URLs for a company + duration (ie Meta, 30 days) to a CSV, ordered the same way as on LeetCode (basically by frequency). You can then add your own fields like `time_to_solve`, `notes`, etc, whatever you feel like tracking.

Then when you want to refresh with the latest questions (since Leetcode is constantly updating them), simply upload your existing CSV (make sure it includes `title_slug`) before you click "Get Questions". It merges your existing CSV with the new question set into a new CSV, while preserving all fields.
- It adds _new_ questions
- It keeps _existing_ questions
- It moves _missing_ questions to the bottom of the CSV (and flags them `is_outdated`)

### What if I've already been tracking in my own CSV? ###
You can merge it with the latest questions! Just make sure your CSV has a `title_slug` field (ie `lru-cache`, `merge-intervals`, etc), upload it as an existing CSV, then hit "Get Questions".

## Requirements

- LeetCode Premium subscription
- Must be logged into LeetCode in your browser
- Chrome browser

## Usage

1. Make sure you're logged into LeetCode (and you have Premium) in any browser tab
2. Open the extension
3. Select your desired company
4. Select your desired time period
5. Optional - Upload your existing CSV (make sure it has the `title_slug` field for matching)
5. Click "Get Questions"
6. The CSV file will be automatically downloaded

## CSV Format

The generated CSV includes:
- `title_slug`: The question's slug identifier (ie `diameter-of-binary-tree`)
- `url`: LeetCode URL to the question
- `is_outdated`: `True` if the question was in your existing CSV but no longer in the latest question set
- all other fields you had in your existing CSV
