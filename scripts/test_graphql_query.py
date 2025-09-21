#!/usr/bin/env python3
"""
=================LeetCode GraphQL test with email notifications=================

This is a test I can schedule to run on a regular basis to make sure the
browser extension's LeetCode GraphQL query still works, since LeetCode could
change their API at any time.
"""

import requests
import browser_cookie3
import smtplib
from email.mime.text import MIMEText
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration
TO_EMAIL = os.getenv('TO_EMAIL')
GMAIL_BOT_EMAIL_ADDRESS = os.getenv('GMAIL_BOT_EMAIL_ADDRESS') # just any gmail account that you want to send the email from
GMAIL_BOT_APP_PASSWORD = os.getenv('GMAIL_BOT_APP_PASSWORD') # you have to set up an app password for that gmail account

GRAPHQL_QUERY = """
query favoriteQuestionList(
    $favoriteSlug: String!,
    $sortBy: QuestionSortByInput,
    $version: String = "v2"
) {
    favoriteQuestionList(
        favoriteSlug: $favoriteSlug,
        sortBy: $sortBy,
        version: $version
    ) {
        questions {
            title
            titleSlug
            difficulty
        }
    }
}
"""

def send_email(subject, body):
    """Send email notification via Gmail SMTP."""
    if not GMAIL_BOT_APP_PASSWORD:
        print("⚠️ GMAIL_BOT_APP_PASSWORD not set - skipping email")
        return

    try:
        msg = MIMEText(f"Timestamp: {datetime.now()}\n\n{body}")
        msg['Subject'] = f"[LeetCode Bot] {subject}"
        msg['From'] = GMAIL_BOT_EMAIL_ADDRESS
        msg['To'] = TO_EMAIL

        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(GMAIL_BOT_EMAIL_ADDRESS, GMAIL_BOT_APP_PASSWORD)
        server.send_message(msg)
        server.quit()
        print("📧 Email sent")
    except Exception as e:
        print(f"❌ Email failed: {e}")

def get_leetcode_session_token():
    """Get LEETCODE_SESSION from Arc browser."""
    try:
        cookies = browser_cookie3.arc()
        for cookie in cookies:
            if cookie.name == 'LEETCODE_SESSION':
                return cookie.value
        return None
    except Exception as e:
        print(f"❌ Cookie error: {e}")
        return None

def test_leetcode_api(token, favorite_slug="facebook-thirty-days"):
    """Test LeetCode GraphQL API."""
    headers = {
        "Content-Type": "application/json",
        "Cookie": f"LEETCODE_SESSION={token}",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    }

    payload = {
        "query": GRAPHQL_QUERY,
        "variables": {
            "favoriteSlug": favorite_slug,
            "sortBy": {"sortField": "CUSTOM", "sortOrder": "ASCENDING"},
            "version": "v2"
        }
    }

    try:
        response = requests.post("https://leetcode.com/graphql/", headers=headers, json=payload, timeout=30)
        data = response.json()

        if response.status_code != 200:
            error_msg = f"HTTP {response.status_code}"
            error_msg += f" - {response.text[:500]}"
            return False, error_msg

        if "errors" in data:
            error_msgs = [error.get('message', str(error)) for error in data['errors']]
            return False, f"GraphQL errors: {', '.join(error_msgs)}"

        questions = data.get("data", {}).get("favoriteQuestionList", {}).get("questions", [])
        if not questions:
            return False, "No questions found"

        # Format results - just first 5 questions
        sample = questions[:5]
        sample_list = "\n".join([f"{i+1}. {q['title']}" for i, q in enumerate(sample)])

        results = f"✅ Found {len(questions)} questions\n\n📋 Sample questions:\n{sample_list}"
        return True, results

    except Exception as e:
        return False, f"Request failed: {e}"

def main():
    print("🚀 LeetCode GraphQL Test")

    # Get session token
    token = get_leetcode_session_token()
    if not token:
        send_email("FAILED - No session token", "Could not get LEETCODE_SESSION token from Arc browser.")
        print("❌ No leetcode session token found")
        return

    # Test API
    success, info = test_leetcode_api(token)

    if success:
        print("✅ Success!")
        print(info)
        send_email("GraphQL Query SUCCESS", f"LeetCode GraphQL Query test passed!\n\n{info}")
    else:
        print(f"❌ Failed: {info}")
        send_email("GraphQL Query FAILED", f"LeetCode GraphQL Query test failed.\n\nError: {info}")

if __name__ == "__main__":
    main()
