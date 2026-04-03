// utils/jobHistory.js
// Job history management using localStorage

const HISTORY_KEY = 'job_history';
const MAX_ENTRIES = 10;

// Sanitize HTML to prevent XSS
function sanitizeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Validate job history entry structure
function isValidEntry(entry) {
  return (
    entry &&
    typeof entry === 'object' &&
    typeof entry.id === 'string' &&
    typeof entry.timestamp === 'string' &&
    Array.isArray(entry.jobs) &&
    entry.jobs.length > 0 &&
    entry.jobs.every(job =>
      job &&
      typeof job.title === 'string' &&
      typeof job.matchScore === 'number' &&
      typeof job.description === 'string' &&
      Array.isArray(job.skills) &&
      typeof job.reason === 'string'
    )
  );
}

// Load job history from localStorage
export function loadJobHistory() {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    if (!data) return [];

    const history = JSON.parse(data);
    if (!Array.isArray(history)) return [];

    // Validate and sanitize each entry
    const validHistory = history
      .filter(isValidEntry)
      .map(entry => ({
        ...entry,
        jobs: entry.jobs.map(job => ({
          ...job,
          title: sanitizeHtml(job.title),
          description: sanitizeHtml(job.description),
          skills: job.skills.map(skill => sanitizeHtml(skill)),
          reason: sanitizeHtml(job.reason)
        }))
      }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // newest first

    return validHistory;
  } catch (error) {
    console.warn('Failed to load job history:', error);
    return [];
  }
}

// Save new job history entry
export function saveJobHistory(jobs, resumeSnippet) {
  try {
    const history = loadJobHistory();

    const newEntry = {
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      resumeSnippet: sanitizeHtml(resumeSnippet.substring(0, 100)),
      jobs: jobs.map(job => ({
        title: sanitizeHtml(job.title || ''),
        matchScore: job.matchScore || 0,
        description: sanitizeHtml(job.description || ''),
        skills: (job.skills || []).map(skill => sanitizeHtml(skill)),
        reason: sanitizeHtml(job.reason || `Matched based on your ${job.matchedSkills?.join(', ') || 'relevant'} skills`)
      }))
    };

    // Add to beginning and limit to MAX_ENTRIES
    history.unshift(newEntry);
    if (history.length > MAX_ENTRIES) {
      history.splice(MAX_ENTRIES);
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return true;
  } catch (error) {
    console.error('Failed to save job history:', error);
    return false;
  }
}

// Clear all job history
export function clearJobHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear job history:', error);
    return false;
  }
}

// Remove specific history entry
export function removeJobHistoryEntry(entryId) {
  try {
    const history = loadJobHistory();
    const filtered = history.filter(entry => entry.id !== entryId);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Failed to remove job history entry:', error);
    return false;
  }
}