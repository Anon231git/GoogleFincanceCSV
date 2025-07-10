// Content script for Google Finance Portfolio CSV Importer

class PortfolioCSVImporter {
  constructor() {
    this.stockQueue = [];
    this.isProcessing = false;
    this.currentStockIndex = 0;
    this.csvData = [];
    this.init();
  }

  init() {
    // Wait for page to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.createUI());
    } else {
      this.createUI();
    }
  }

  createUI() {
    // Check if we're on a Google Finance portfolio page
    if (!window.location.href.includes('google.com/finance/portfolio/')) {
      return;
    }

    // Create the CSV upload UI
    const uploadContainer = document.createElement('div');
    uploadContainer.id = 'csv-importer-container';
    uploadContainer.innerHTML = `
      <div class="csv-importer-widget">
        <h3>CSV Portfolio Importer</h3>
        <div class="upload-section">
          <input type="file" id="csvFileInput" accept=".csv" style="display: none;">
          <button id="uploadButton" class="upload-btn">Upload CSV File</button>
          <div id="fileName" class="file-name"></div>
        </div>
        <div class="settings-section">
          <label>
            <input type="checkbox" id="useCurrentPrice" checked>
            Use current market price
          </label>
          <label>
            <input type="checkbox" id="setTodayDate" checked>
            Set purchase date to today
          </label>
        </div>
        <div class="progress-section" style="display: none;">
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <div class="progress-text">Processing: <span id="progressCount">0</span> / <span id="totalCount">0</span></div>
        </div>
        <button id="processButton" class="process-btn" style="display: none;">Add Stocks to Portfolio</button>
        <div id="status" class="status-message"></div>
      </div>
    `;

    // Insert the widget at the top of the page
    const mainContent = document.querySelector('main') || document.body;
    mainContent.insertBefore(uploadContainer, mainContent.firstChild);

    this.setupEventListeners();
  }

  setupEventListeners() {
    const uploadButton = document.getElementById('uploadButton');
    const csvFileInput = document.getElementById('csvFileInput');
    const processButton = document.getElementById('processButton');

    uploadButton.addEventListener('click', () => csvFileInput.click());
    csvFileInput.addEventListener('change', (e) => this.handleFileUpload(e));
    processButton.addEventListener('click', () => this.processStocks());
  }

  handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const fileName = document.getElementById('fileName');
    fileName.textContent = file.name;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvContent = e.target.result;
      this.parseCSV(csvContent);
    };
    reader.readAsText(file);
  }

  parseCSV(csvContent) {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Find the column with stock symbols/names
    const stockColumnIndex = headers.findIndex(h => 
      h.includes('symbol') || h.includes('stock') || h.includes('name') || h.includes('ticker')
    );

    if (stockColumnIndex === -1) {
      // If no specific column found, assume first column contains stock symbols
      this.csvData = lines.slice(1).map(line => line.split(',')[0].trim()).filter(symbol => symbol);
    } else {
      this.csvData = lines.slice(1).map(line => {
        const cols = line.split(',');
        return cols[stockColumnIndex] ? cols[stockColumnIndex].trim() : null;
      }).filter(symbol => symbol);
    }

    if (this.csvData.length > 0) {
      document.getElementById('processButton').style.display = 'block';
      document.getElementById('totalCount').textContent = this.csvData.length;
      this.showStatus(`Found ${this.csvData.length} stocks to import`, 'success');
    } else {
      this.showStatus('No valid stock symbols found in CSV', 'error');
    }
  }

  async processStocks() {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.currentStockIndex = 0;
    this.stockQueue = [...this.csvData];

    const progressSection = document.querySelector('.progress-section');
    progressSection.style.display = 'block';

    document.getElementById('processButton').disabled = true;
    document.getElementById('processButton').textContent = 'Processing...';

    for (let i = 0; i < this.stockQueue.length; i++) {
      const stock = this.stockQueue[i];
      this.currentStockIndex = i + 1;
      
      this.updateProgress();
      this.showStatus(`Processing ${stock}...`, 'info');

      try {
        await this.addStockToPortfolio(stock);
        await this.wait(2000); // Wait 2 seconds between each stock
      } catch (error) {
        console.error(`Error adding ${stock}:`, error);
        this.showStatus(`Error adding ${stock}: ${error.message}`, 'error');
        
        // Click cancel if there's an error
        await this.clickCancelIfFailed();
        await this.wait(1000);
      }
    }

    this.isProcessing = false;
    document.getElementById('processButton').disabled = false;
    document.getElementById('processButton').textContent = 'Add Stocks to Portfolio';
    this.showStatus('All stocks processed!', 'success');
  }

  async addStockToPortfolio(stockSymbol) {
    // Step 1: Click the "Investment" button
    const investmentButton = document.querySelector('button[jsname="Wpl9xb"]');
    if (!investmentButton) {
      throw new Error('Investment button not found');
    }

    investmentButton.click();
    await this.wait(1000);

    // Step 2: Wait for the popup dialog to appear and find the search input within it
    const popupDialog = await this.waitForElement('.VfPpkd-Sx9Kwc[data-inject-content-controller="true"]', 5000);
    if (!popupDialog) {
      throw new Error('Popup dialog not found');
    }

    // Step 3: Find the search input specifically within the popup dialog
    const searchInput = await this.waitForElementWithinContainer(
      popupDialog, 
      'input[jsname="dSO9oc"]', 
      5000
    );
    
    if (!searchInput) {
      throw new Error('Search input not found in popup');
    }

    // Step 4: Clear any existing value and enter the stock symbol
    searchInput.value = '';
    searchInput.focus();
    await this.wait(500);
    
    // Type the stock symbol character by character to trigger proper events
    for (let char of stockSymbol.replace("Ltd.","")) {
      searchInput.value += char;
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      await this.wait(100);
    }
    
    // Trigger additional events to ensure search is performed
    searchInput.dispatchEvent(new Event('change', { bubbles: true }));
    searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    
    await this.wait(3000);

    // Step 5: Wait for search results and click the first result within the popup
    const firstResult = await this.waitForElementWithinContainer(
      popupDialog,
      '.MkjOTb.SAq8ff',
      5000
    );
    
    if (!firstResult) {
      throw new Error(`No search results found for ${stockSymbol}`);
    }

    firstResult.click();
    await this.wait(1000);

    // Step 6: Fill in the form
    await this.fillStockForm(popupDialog);

    // Step 7: Save the stock
    await this.saveStock(popupDialog);
  }

  async fillStockForm(popupDialog) {
    // Set quantity to 1 - Find the quantity input field
    const quantityInput = await this.waitForElementWithinContainer(
      popupDialog,
      'input[type="number"][step="any"]',
      3000
    );
    if (quantityInput) {
      quantityInput.value = '1';
      quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Set purchase date to today if checkbox is checked
    if (document.getElementById('setTodayDate').checked) {
      const dateInput = await this.waitForElementWithinContainer(
        popupDialog,
        'input[type="text"][autocomplete="off"]',
        1000
      );
      if (dateInput) {
        const today = new Date().toLocaleDateString();
        dateInput.value = today;
        dateInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    // Set purchase price to current price if checkbox is checked
    if (document.getElementById('useCurrentPrice').checked) {
      // Updated price input selectors based on your HTML structure
      const priceSelectors = [
        'input[jsname="YPqjbf"][step="any"]',  // Main selector from your HTML
        'input.VfPpkd-fmcmS-wGMbrd[step="any"]', // Class-based selector
        'input[type="number"][step="any"]:not([jsname="quantityInput"])', // Exclude quantity input
        'input[type="number"][class*="VfPpkd-fmcmS"]', // Price input class pattern
        'input[type="number"][jsname="YPqjbf"]' // jsname-based selector
      ];
      
      let priceInput = null;
      for (const selector of priceSelectors) {
        const inputs = popupDialog.querySelectorAll(selector);
        // Find the price input (usually the second number input after quantity)
        if (inputs.length > 1) {
          priceInput = inputs[1]; // Second number input is typically price
          break;
        } else if (inputs.length === 1 && !inputs[0].closest('[aria-label*="quantity"]')) {
          priceInput = inputs[0];
          break;
        }
      }
      
      if (priceInput) {
        // Try to get current price from the search results within the popup
        let currentPrice = null;
        
        // First try to get price from the selected result
        const selectedResult = popupDialog.querySelector('.MkjOTb.SAq8ff');
        if (selectedResult) {
          const priceElement = selectedResult.querySelector('.lzO0Ed');
          if (priceElement) {
            currentPrice = priceElement.textContent.replace(/[^\d.]/g, '');
          }
        }
        
        // If no price found, try other price selectors within the popup
        if (!currentPrice) {
          const priceElements = popupDialog.querySelectorAll('.lzO0Ed, .price, [class*="price"]');
          for (const element of priceElements) {
            const priceText = element.textContent.replace(/[^\d.]/g, '');
            if (priceText && parseFloat(priceText) > 0) {
              currentPrice = priceText;
              break;
            }
          }
        }
        
        if (currentPrice) {
          // Clear the field first
          priceInput.value = '';
          priceInput.focus();
          await this.wait(200);
          
          // Set the value
          priceInput.value = currentPrice;
          
          // Trigger multiple events to ensure the form recognizes the change
          priceInput.dispatchEvent(new Event('input', { bubbles: true }));
          priceInput.dispatchEvent(new Event('change', { bubbles: true }));
          priceInput.dispatchEvent(new Event('blur', { bubbles: true }));
          
          this.showStatus(`Set price to ${currentPrice}`, 'info');
        } else {
          this.showStatus('Could not find current price', 'warning');
        }
      } else {
        this.showStatus('Could not find price input field', 'warning');
      }
    }
  }

  async saveStock(popupDialog) {
    // Look for the Save button within the popup
    const saveButton = await this.waitForElementWithinContainer(
      popupDialog,
      'button[data-mdc-dialog-action="ok"]',
      3000
    );
    
    if (!saveButton) {
      throw new Error('Save button not found');
    }

    saveButton.click();
    await this.wait(2000);

    // Wait for dialog to close
    await this.waitForElementToDisappear('.VfPpkd-Sx9Kwc[data-inject-content-controller="true"]', 5000);
  }

  async clickCancelIfFailed() {
    // Look for the popup dialog
    const popupDialog = document.querySelector('.VfPpkd-Sx9Kwc[data-inject-content-controller="true"]');
    if (!popupDialog) {
      return; // No popup to cancel
    }

    // Look for the Cancel button within the popup
    const cancelButton = popupDialog.querySelector('button[data-mdc-dialog-action="cancel"]');
    if (cancelButton) {
      this.showStatus('Clicking cancel due to error...', 'warning');
      cancelButton.click();
      await this.wait(1000);
      
      // Wait for dialog to close
      await this.waitForElementToDisappear('.VfPpkd-Sx9Kwc[data-inject-content-controller="true"]', 3000);
    }
  }

  async waitForElement(selector, timeout = 5000) {
    return new Promise((resolve) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((mutations, obs) => {
        const element = document.querySelector(selector);
        if (element) {
          obs.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  }

  async waitForElementWithinContainer(container, selector, timeout = 5000) {
    return new Promise((resolve) => {
      const element = container.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((mutations, obs) => {
        const element = container.querySelector(selector);
        if (element) {
          obs.disconnect();
          resolve(element);
        }
      });

      observer.observe(container, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  }

  async waitForElementToDisappear(selector, timeout = 5000) {
    return new Promise((resolve) => {
      const checkElement = () => {
        const element = document.querySelector(selector);
        if (!element) {
          resolve(true);
          return;
        }

        const observer = new MutationObserver((mutations, obs) => {
          const element = document.querySelector(selector);
          if (!element) {
            obs.disconnect();
            resolve(true);
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true
        });

        setTimeout(() => {
          observer.disconnect();
          resolve(false);
        }, timeout);
      };

      checkElement();
    });
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  updateProgress() {
    const progressFill = document.querySelector('.progress-fill');
    const progressCount = document.getElementById('progressCount');
    
    const percentage = (this.currentStockIndex / this.csvData.length) * 100;
    progressFill.style.width = percentage + '%';
    progressCount.textContent = this.currentStockIndex;
  }

  showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type}`;
    
    console.log(`[CSV Importer] ${message}`);
  }
}

// Initialize the extension
new PortfolioCSVImporter();