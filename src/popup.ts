// Type definitions
interface FavoriteSlugMapping {
  [duration: string]: string;
}

interface FavoriteSlugs {
  [company: string]: FavoriteSlugMapping;
}

interface Question {
  title: string;
  titleSlug: string;
  difficulty: string;
}

interface GraphQLResponse {
  data: {
    favoriteQuestionList: {
      questions: Question[];
    };
  };
  errors?: Array<{ message: string }>;
}

interface CsvRow {
  [key: string]: string;
}

interface ParsedCsv {
  data: CsvRow[];
  headers: string[];
}

interface MergedData {
  rows: CsvRow[];
  headers: string[];
}

// Company and duration mappings based on LeetCode favorite slugs
const FAVORITE_SLUGS: FavoriteSlugs = {
  'meta': {
    'thirty-days': 'facebook-thirty-days',
    'three-months': 'facebook-three-months',
    'six-months': 'facebook-six-months'
  },
  'uber': {
    'thirty-days': 'uber-thirty-days',
    'three-months': 'uber-three-months',
    'six-months': 'uber-six-months'
  },
  'amazon': {
    'thirty-days': 'amazon-thirty-days',
    'three-months': 'amazon-three-months',
    'six-months': 'amazon-six-months'
  },
  'google': {
    'thirty-days': 'google-thirty-days',
    'three-months': 'google-three-months',
    'six-months': 'google-six-months'
  },
  'tiktok': {
    'thirty-days': 'tiktok-thirty-days',
    'three-months': 'tiktok-three-months',
    'six-months': 'tiktok-six-months'
  },
  'linkedin': {
    'thirty-days': 'linkedin-thirty-days',
    'three-months': 'linkedin-three-months',
    'six-months': 'linkedin-six-months'
  },
  'microsoft': {
    'thirty-days': 'microsoft-thirty-days',
    'three-months': 'microsoft-three-months',
    'six-months': 'microsoft-six-months'
  },
  'bloomberg': {
    'thirty-days': 'bloomberg-thirty-days',
    'three-months': 'bloomberg-three-months',
    'six-months': 'bloomberg-six-months'
  },
  'airbnb': {
    'thirty-days': 'airbnb-thirty-days',
    'three-months': 'airbnb-three-months',
    'six-months': 'airbnb-six-months'
  },
  'apple': {
    'thirty-days': 'apple-thirty-days',
    'three-months': 'apple-three-months',
    'six-months': 'apple-six-months'
  },
  'doordash': {
    'thirty-days': 'doordash-thirty-days',
    'three-months': 'doordash-three-months',
    'six-months': 'doordash-six-months'
  },
  'oracle': {
    'thirty-days': 'oracle-thirty-days',
    'three-months': 'oracle-three-months',
    'six-months': 'oracle-six-months'
  },
  'adobe': {
    'thirty-days': 'adobe-thirty-days',
    'three-months': 'adobe-three-months',
    'six-months': 'adobe-six-months'
  },
  'salesforce': {
    'thirty-days': 'salesforce-thirty-days',
    'three-months': 'salesforce-three-months',
    'six-months': 'salesforce-six-months'
  },
  'roblox': {
    'thirty-days': 'roblox-thirty-days',
    'three-months': 'roblox-three-months',
    'six-months': 'roblox-six-months'
  },
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
async function getLeetCodeSession(): Promise<string> {
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
async function fetchQuestions(favoriteSlug: string, leetcodeSession: string): Promise<Question[]> {
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

  const data: GraphQLResponse = await response.json();

  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
  }

  if (!data.data || !data.data.favoriteQuestionList) {
    throw new Error('Unable to access company questions. Make sure you have LeetCode Premium and access to this list.');
  }

  return data.data.favoriteQuestionList.questions;
}

// Parse CSV content and return array of objects
function parseCsv(csvContent: string): ParsedCsv {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return { data: [], headers: [] };

  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  const data: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      if (char === '"' && (j === 0 || lines[i][j-1] === ',')) {
        inQuotes = true;
      } else if (char === '"' && inQuotes && (j === lines[i].length - 1 || lines[i][j+1] === ',')) {
        inQuotes = false;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else if (char !== '"' || inQuotes) {
        current += char;
      }
    }
    values.push(current.trim());

    const row: CsvRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    data.push(row);
  }

  return { data, headers };
}

// Read and parse uploaded CSV file
async function readUploadedCsv(file: File): Promise<ParsedCsv> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        const parsed = parseCsv(csvContent);
        resolve(parsed);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// Merge new questions with existing CSV data
function mergeQuestionsWithCsv(newQuestions: Question[], existingData: CsvRow[], existingHeaders: string[]): MergedData {
  // Create base fieldnames with required fields first
  const baseFields = ['title_slug', 'url', 'is_outdated'];
  const allHeaders = [...baseFields];

  // Add any additional fields from existing CSV that aren't already included
  existingHeaders.forEach(header => {
    if (!allHeaders.includes(header)) {
      allHeaders.push(header);
    }
  });

  const mergedRows: CsvRow[] = [];

  // Create lookup map for existing questions
  const existingLookup: { [key: string]: CsvRow } = {};
  existingData.forEach(row => {
    if (row.title_slug) {
      existingLookup[row.title_slug] = row;
    }
  });

  // Process current questions (new + existing that are still current)
  const currentSlugs = new Set<string>();
  newQuestions.forEach(question => {
    const titleSlug = question.titleSlug;
    currentSlugs.add(titleSlug);

    const url = `https://leetcode.com/problems/${titleSlug}`;
    const row: CsvRow = {
      title_slug: titleSlug,
      url: url,
      is_outdated: ''
    };

    // If this question existed in previous CSV, preserve its custom fields
    if (existingLookup[titleSlug]) {
      const existingRow = existingLookup[titleSlug];
      allHeaders.forEach(header => {
        if (existingRow[header] !== undefined && !row.hasOwnProperty(header)) {
          row[header] = existingRow[header];
        }
      });
    }

    mergedRows.push(row);
  });

  console.log(currentSlugs, 'current slugs');
  // Add outdated questions from existing CSV
  existingData.forEach(existingRow => {
    if (existingRow.title_slug && !currentSlugs.has(existingRow.title_slug)) {
      console.log(existingRow, 'existing row');
      const row = { ...existingRow };
      row.is_outdated = 'T';
      mergedRows.push(row);
    }
  });

  return { rows: mergedRows, headers: allHeaders };
}

// Convert questions to CSV format (with merge support)
function convertToCsv(questions: Question[], favoriteSlug: string, existingCsv: ParsedCsv | null = null): string {
  let headers: string[];
  let rows: CsvRow[];

  if (existingCsv && existingCsv.data.length > 0) {
    // Merge with existing CSV
    console.log('yes existing csv');
    const merged = mergeQuestionsWithCsv(questions, existingCsv.data, existingCsv.headers);
    headers = merged.headers;
    rows = merged.rows;
  } else {
    console.log('no existing csv');
    // No existing CSV, create new one
    headers = ['title_slug', 'url', 'is_outdated'];
    rows = questions.map(question => ({
      title_slug: question.titleSlug,
      url: `https://leetcode.com/problems/${question.titleSlug}`,
      is_outdated: ''
    }));
  }

  // Convert to CSV string
  const csvRows = [headers.join(',')];

  rows.forEach(row => {
    const csvRow = headers.map(header => {
      const value = row[header] || '';
      // Escape quotes and wrap in quotes if needed
      const escaped = value.toString().replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(csvRow.join(','));
  });

  return csvRows.join('\n');
}

// Download CSV file
function downloadCsv(csvContent: string, filename: string): void {
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
function updateStatus(message: string, type: 'info' | 'success' | 'error' = 'info'): void {
  const statusDiv = document.getElementById('status') as HTMLElement;
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
}

// Show/hide progress indicator
function showProgress(show: boolean = true): void {
  const progressDiv = document.getElementById('progress') as HTMLElement;
  progressDiv.style.display = show ? 'block' : 'none';
}

// Main function to get questions
async function getQuestions(): Promise<void> {
  const getQuestionsBtn = document.getElementById('getQuestions') as HTMLButtonElement;
  const companySelect = document.getElementById('company') as HTMLSelectElement;
  const durationSelect = document.getElementById('duration') as HTMLSelectElement;
  const csvFileInput = document.getElementById('csvFile') as HTMLInputElement;

  try {
    // Disable button and show progress
    getQuestionsBtn.disabled = true;
    showProgress(true);
    updateStatus('Getting LEETCODE_SESSION cookie...', 'info');

    // Get selected values
    const company = companySelect.value;
    const duration = durationSelect.value;
    const favoriteSlug = FAVORITE_SLUGS[company][duration];

    // Check if CSV file was uploaded
    let existingCsv: ParsedCsv | null = null;
    console.log('Checking for uploaded CSV file...');
    console.log('csvFileInput.files.length:', csvFileInput.files?.length ?? 0);

    if (csvFileInput.files && csvFileInput.files.length > 0) {
      console.log('CSV file found:', csvFileInput.files[0].name);
      updateStatus('Reading uploaded CSV file...', 'info');
      try {
        existingCsv = await readUploadedCsv(csvFileInput.files[0]);
        console.log('Parsed CSV data:', existingCsv);
        updateStatus(`Found existing CSV with ${existingCsv.data.length} questions. Preparing to merge...`, 'info');
      } catch (csvError) {
        console.error('Failed to read CSV file:', csvError);
        updateStatus('Warning: Could not read CSV file. Proceeding without merge.', 'info');
      }
    } else {
      console.log('No CSV file uploaded');
    }

    // Get LeetCode session cookie
    const leetcodeSession = await getLeetCodeSession();

    updateStatus('Fetching questions from LeetCode...', 'info');

    // Fetch questions
    const questions = await fetchQuestions(favoriteSlug, leetcodeSession);

    if (!questions || questions.length === 0) {
      throw new Error('No questions found. Make sure you have LeetCode Premium and access to this company list.');
    }

    const statusMessage = existingCsv ?
      `Found ${questions.length} current questions. Merging with existing CSV...` :
      `Found ${questions.length} questions. Generating CSV...`;
    updateStatus(statusMessage, 'info');

    // Convert to CSV (with merge if applicable) and download
    const csvContent = convertToCsv(questions, favoriteSlug, existingCsv);
    const timestamp = new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '');

    const filename = `leetcode_${favoriteSlug}_${timestamp}.csv`;

    downloadCsv(csvContent, filename);

    const successMessage = existingCsv ?
      `Successfully merged and downloaded ${questions.length} current questions with your existing data!` :
      `Successfully downloaded ${questions.length} questions!`;
    updateStatus(successMessage, 'success');

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    updateStatus(`Error: ${errorMessage}`, 'error');
  } finally {
    // Re-enable button and hide progress
    getQuestionsBtn.disabled = false;
    showProgress(false);
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const getQuestionsBtn = document.getElementById('getQuestions') as HTMLButtonElement;
  getQuestionsBtn.addEventListener('click', getQuestions);

  // Display initial message
  updateStatus('Ready to fetch LeetCode questions. Make sure you\'re logged into LeetCode with Premium.', 'info');
});
