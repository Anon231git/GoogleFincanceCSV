// Popup script for CSV Portfolio Importer

document.addEventListener('DOMContentLoaded', function() {
    checkActiveTab();
});

async function checkActiveTab() {
    try {
        // Get the active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const statusDiv = document.getElementById('status');
        
        if (tab.url && tab.url.includes('google.com/finance/portfolio/')) {
            statusDiv.textContent = 'Extension is active on this page!';
            statusDiv.className = 'status active';
        } else {
            statusDiv.textContent = 'Please navigate to a Google Finance portfolio page to use this extension.';
            statusDiv.className = 'status inactive';
        }
    } catch (error) {
        console.error('Error checking active tab:', error);
        const statusDiv = document.getElementById('status');
        statusDiv.textContent = 'Error checking page status.';
        statusDiv.className = 'status inactive';
    }
}