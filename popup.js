// Company and duration mappings based on LeetCode favorite slugs
const FAVORITE_SLUGS = {
    'meta': {
        'thirty-days': 'facebook-thirty-days',
        'three-months': 'facebook-three-months', 
        'six-months': 'facebook-six-months'
    },
    'uber': {
        'thirty-days': 'uber-thirty-days',
        'three-months': 'uber-three-months',
        'six-months': 'uber-six-months'
    }
};

// GraphQL query - same as in the Python script
const GRAPHQL_QUERY = `
query favoriteQuestionList(
    $favoriteSlug: String!,
    $sortBy: QuestionSortByInput,
    $version: String = "v2"
) {
    favoriteQuestionList(
        favoriteSlug: $favoriteSlug,
        sortBy: $sortBy
        version: $version
    ) {
        questions {
            title
            titleSlug
            difficulty
        }
    }
}
`;

// Get LEETCODE_SESSION cookie from the browser
async function getLeetCodeSession() {
    return new Promise((resolve, reject) => {
        chrome.cookies.get({
            url: 'https://leetcode.com',
            name: 'LEETCODE_SESSION'
        }, (cookie) => {
            if (cookie && cookie.value) {
                resolve(cookie.value);
            } else {
                reject(new Error('LEETCODE_SESSION cookie not found. Please make sure you are logged into LeetCode in any tab.'));
            }
        });
    });
}

// Make GraphQL request to LeetCode API
async function fetchQuestions(favoriteSlug, leetcodeSession) {
    const variables = {
        favoriteSlug: favoriteSlug,
        sortBy: {
            sortField: "CUSTOM",
            sortOrder: "ASCENDING"
        }
    };

    const response = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': `LEETCODE_SESSION=${leetcodeSession}`
        },
        body: JSON.stringify({
            query: GRAPHQL_QUERY,
            variables: variables
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    if (!data.data || !data.data.favoriteQuestionList) {
        throw new Error('Unable to access company questions. Make sure you have LeetCode Premium and access to this list.');
    }

    return data.data.favoriteQuestionList.questions;
}

// Convert questions to CSV format
function convertToCSV(questions, favoriteSlug) {
    const headers = ['title_slug', 'url'];
    const csvRows = [headers.join(',')];
    
    questions.forEach(question => {
        const url = `https://leetcode.com/problems/${question.titleSlug}`;
        const row = [
            `"${question.titleSlug}"`,
            `"${url}"`
        ];
        csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
}

// Download CSV file
function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: true
    }, (downloadId) => {
        if (chrome.runtime.lastError) {
            console.error('Download failed:', chrome.runtime.lastError);
        } else {
            console.log('Download started with ID:', downloadId);
        }
        // Clean up the object URL
        URL.revokeObjectURL(url);
    });
}

// Update status message
function updateStatus(message, type = 'info') {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
}

// Show/hide progress indicator
function showProgress(show = true) {
    const progressDiv = document.getElementById('progress');
    progressDiv.style.display = show ? 'block' : 'none';
}

// Main function to get questions
async function getQuestions() {
    const getQuestionsBtn = document.getElementById('getQuestions');
    const companySelect = document.getElementById('company');
    const durationSelect = document.getElementById('duration');
    
    try {
        // Disable button and show progress
        getQuestionsBtn.disabled = true;
        showProgress(true);
        updateStatus('Getting LEETCODE_SESSION cookie...', 'info');
        
        // Get selected values
        const company = companySelect.value;
        const duration = durationSelect.value;
        const favoriteSlug = FAVORITE_SLUGS[company][duration];
        
        // Get LeetCode session cookie
        const leetcodeSession = await getLeetCodeSession();
        
        updateStatus('Fetching questions from LeetCode...', 'info');
        
        // Fetch questions
        const questions = await fetchQuestions(favoriteSlug, leetcodeSession);
        
        if (!questions || questions.length === 0) {
            throw new Error('No questions found. Make sure you have LeetCode Premium and access to this company list.');
        }
        
        updateStatus(`Found ${questions.length} questions. Generating CSV...`, 'info');
        
        // Convert to CSV and download
        const csvContent = convertToCSV(questions, favoriteSlug);
        const timestamp = new Date().toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '');
        
        const filename = `leetcode_${favoriteSlug}_${timestamp}.csv`;
        
        downloadCSV(csvContent, filename);
        
        updateStatus(`Successfully downloaded ${questions.length} questions!`, 'success');
        
    } catch (error) {
        console.error('Error:', error);
        updateStatus(`Error: ${error.message}`, 'error');
    } finally {
        // Re-enable button and hide progress
        getQuestionsBtn.disabled = false;
        showProgress(false);
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const getQuestionsBtn = document.getElementById('getQuestions');
    getQuestionsBtn.addEventListener('click', getQuestions);
    
    // Display initial message
    updateStatus('Ready to fetch LeetCode questions. Make sure you\'re logged into LeetCode with Premium.', 'info');
});
