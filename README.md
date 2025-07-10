# Google Finance Portfolio CSV Importer

A Chrome/Edge extension that allows you to upload CSV files containing stock symbols and automatically add them to your Google Finance portfolio with default settings. Upload or add stocks to your Google finance portfolio via a CSV file.

## Features

- 📊 **Bulk Import**: Upload CSV files with multiple stock symbols
- 🎯 **Smart Detection**: Automatically detects stock symbol columns in CSV
- ⚙️ **Configurable Settings**: 
  - Use current market price as purchase price
  - Set purchase date to today
  - Default quantity of 1 share per stock
- 📈 **Progress Tracking**: Visual progress bar and status updates
- 🔄 **Error Handling**: Graceful handling of failed stock additions

## Installation

### Method 1: Load as Unpacked Extension (Recommended for Development)

1. **Download the Extension Files**
   - Create a new folder called `csv-portfolio-importer`
   - Save all the provided files in this folder:
     - `manifest.json`
     - `content.js`
     - `styles.css`
     - `popup.html`
     - `popup.js`

2. **Create Icons** (Optional but recommended)
   - Create icon files: `icon16.png`, `icon48.png`, `icon128.png`
   - Or remove the icons section from `manifest.json`

3. **Load in Chrome/Edge**
   - Open Chrome/Edge and go to `chrome://extensions/` or `edge://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `csv-portfolio-importer` folder

### Method 2: Package as .crx (For Distribution)

1. Follow steps 1-2 above
2. In Chrome extensions page, click "Pack extension"
3. Select the extension folder and create a .crx file

## Usage

### Step 1: Prepare Your CSV File

Create a CSV file with stock symbols. The extension supports various formats:

**Format 1: With Headers**
```csv
Symbol,Name,Exchange
AAPL,Apple Inc,NASDAQ
GOOGL,Alphabet Inc,NASDAQ
MSFT,Microsoft Corporation,NASDAQ
TSLA,Tesla Inc,NASDAQ
SBIN,State Bank of India,NSE
```

**Format 2: Simple List**
```csv
AAPL
GOOGL
MSFT
TSLA
SBIN
```

**Format 3: Any Column with Stock Data**
```csv
Company,Stock,Sector
Apple,AAPL,Technology
Google,GOOGL,Technology
Microsoft,MSFT,Technology
```

### Step 2: Navigate to Google Finance

1. Go to [Google Finance](https://www.google.com/finance/)
2. Open your portfolio or create a new one
3. You should see the CSV importer widget in the top-right corner

### Step 3: Upload and Process

1. **Upload CSV**: Click "Upload CSV File" and select your file
2. **Configure Settings**:
   - ✅ **Use current market price**: Sets purchase price to current stock price
   - ✅ **Set purchase date to today**: Uses today's date as purchase date
3. **Start Import**: Click "Add Stocks to Portfolio"
4. **Monitor Progress**: Watch the progress bar and status messages

## CSV Format Requirements

The extension will automatically detect stock symbols in your CSV file by looking for columns with headers containing:
- `symbol`
- `stock`
- `name`
- `ticker`

If no headers are found, it will use the first column as stock symbols.

**Supported Stock Formats:**
- US Stocks: `AAPL`, `GOOGL`, `MSFT`
- Indian Stocks: `SBIN`, `RELIANCE`, `TCS`
- ETFs: `SPY`, `VOO`, `QQQ`
- Indices: `.DJI`, `.INX`

## Default Settings

When stocks are added to your portfolio, the following defaults are applied:
- **Quantity**: 1 share
- **Purchase Date**: Today's date (if option enabled)
- **Purchase Price**: Current market price (if option enabled)

## Troubleshooting

### Extension Not Showing
- Ensure you're on a Google Finance portfolio page
- Check that the extension is enabled in Chrome/Edge
- Refresh the page

### Stocks Not Being Added
- Verify stock symbols are correct and tradeable
- Check that Google Finance recognizes the symbols
- Ensure you have a stable internet connection
- Try adding stocks manually to test if the portfolio is working

### CSV Not Parsing
- Ensure your CSV file is properly formatted
- Check that stock symbols are in a clearly labeled column
- Try using a simple format with just stock symbols

### Rate Limiting
- The extension waits 2 seconds between each stock addition
- If you encounter issues, try smaller batches (20-30 stocks)

## Permissions Explained

The extension requires these permissions:
- **activeTab**: To interact with the current Google Finance tab
- **storage**: To save user preferences (currently unused but reserved)
- **host_permissions**: To access Google Finance pages only

## Privacy & Security

- The extension only runs on Google Finance pages
- No data is sent to external servers
- All processing happens locally in your browser
- CSV files are processed in memory only

## Technical Details

### File Structure
```
csv-portfolio-importer/
├── manifest.json          # Extension configuration
├── content.js            # Main functionality
├── styles.css            # Widget styling
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
└── README.md             # This file
```

### Browser Compatibility
- ✅ Chrome 88+
- ✅ Edge 88+
- ✅ Brave (Chromium-based)
- ❌ Firefox (uses different extension format)
- ❌ Safari (uses different extension format)

## Contributing

To modify or enhance the extension:

1. **Edit the Code**: Modify the relevant files
2. **Test Changes**: Reload the extension in Chrome/Edge
3. **Debug**: Use Chrome DevTools for console logs

### Key Files to Modify:
- `content.js`: Main logic for CSV processing and stock addition
- `styles.css`: Widget appearance and styling
- `popup.html/js`: Extension popup interface

## License

This extension is provided as-is for educational and personal use. Please ensure compliance with Google's Terms of Service when using automated tools with Google Finance.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Ensure you're using the latest version of Chrome/Edge

---

**Note**: This extension automates interactions with Google Finance. Use responsibly and be aware that Google may update their interface, which could affect the extension's functionality.
**Code generated via Claude. Modified and corrected by Anon231git**
