'use client';

/**
 * This file contains utility functions to reset the application state
 * to fix issues with locations not appearing in the saved locations tab.
 */

/**
 * Clears all location data from localStorage
 */
export function resetAllData(): void {
  try {
    // Clear pins data
    localStorage.removeItem('japan-planner-pins');
    
    // Clear any other related data that might be causing issues
    localStorage.removeItem('japan-planner-selected-pins');
    
    console.log('All application data has been reset');
    
    // Force refresh the page to apply changes
    window.location.reload();
  } catch (error) {
    console.error('Error resetting application data:', error);
  }
}

/**
 * Checks if we need to fix corrupt data on application load
 */
export function checkAndFixDataIssues(): void {
  try {
    // Check for URL parameter that indicates we should reset
    const params = new URLSearchParams(window.location.search);
    if (params.get('reset') === 'true') {
      resetAllData();
      // Remove the query parameter
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }
    
    // Check if the pins data is corrupt
    const storedPins = localStorage.getItem('japan-planner-pins');
    if (storedPins) {
      try {
        // Try to parse the JSON - if it fails, the data is corrupt
        JSON.parse(storedPins);
      } catch (parseError) {
        console.error('Corrupt pins data detected, resetting:', parseError);
        resetAllData();
      }
    }
  } catch (error) {
    console.error('Error checking data issues:', error);
  }
} 