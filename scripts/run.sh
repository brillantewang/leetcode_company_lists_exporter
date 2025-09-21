#!/bin/bash

# Change to script directory
cd "$(dirname "$0")"

# Run the LeetCode GraphQL test with logging
.venv/bin/python leetcode_graphql_test.py >> ~/Library/Logs/leetcode_graphql_test.log 2>&1
# Add a new empty line to the log file for readability
echo "" >> ~/Library/Logs/leetcode_graphql_test.log
