# Google Sheets lead capture

1. Open the Google Sheet that should receive leads.
2. Select **Extensions → Apps Script**.
3. Replace the editor contents with `Code.gs` from this folder.
4. Select **Deploy → New deployment → Web app**.
5. Set **Execute as** to `Me` and **Who has access** to `Anyone`.
6. Deploy and copy the URL ending in `/exec`.

The script creates a `Leads` tab automatically on the first submission. To use a different tab name, change `SHEET_NAME` near the top of `Code.gs`.

When the form fields change, update `HEADERS` and the `row` array together so they remain in the same order.
