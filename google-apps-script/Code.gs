/**
 * Monk Media lead capture endpoint for Google Sheets.
 *
 * Setup:
 * 1. Open the destination Google Sheet.
 * 2. Extensions -> Apps Script.
 * 3. Paste this file into Code.gs.
 * 4. Deploy -> New deployment -> Web app.
 * 5. Execute as: Me. Who has access: Anyone.
 * 6. Copy the /exec deployment URL into the website form configuration.
 */

const SHEET_NAME = "Leads";

const HEADERS = [
  "Submitted At",
  "Submission Type",
  "Name",
  "Email",
  "Phone",
  "Account Type",
  "What You Do",
  "Channel Link",
  "Looking For",
  "Problem",
  "Patience Confirmed",
  "Budget",
  "Services",
  "Project Details",
  "Page URL",
  "User Agent"
];

function doGet() {
  return jsonResponse_({
    ok: true,
    service: "Monk Media lead capture",
    message: "Endpoint is running. Submit leads with POST."
  });
}

function doPost(event) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);

    const data = parseRequest_(event);
    const sheet = getLeadSheet_();
    const services = collectServices_(data);
    const submissionType = firstValue_(data, ["SubmissionType", "submissionType"])
      || (firstValue_(data, ["Phone", "phone"]) ? "Let's Talk Popup" : "Consultation Form");

    const row = [
      new Date(),
      submissionType,
      firstValue_(data, ["Name", "name"]),
      firstValue_(data, ["Email", "email"]),
      firstValue_(data, ["Phone", "phone"]),
      firstValue_(data, ["AccountType", "Account Type"]),
      firstValue_(data, ["WhatYouDo", "What You Do"]),
      firstValue_(data, ["ChannelLink", "Channel Link"]),
      firstValue_(data, ["LookingFor", "Looking For"]),
      firstValue_(data, ["Problem", "problem"]),
      firstValue_(data, ["Patience", "patience"]),
      firstValue_(data, ["Budget", "budget"]),
      services,
      firstValue_(data, ["ProjectDetails", "Project Details", "Message", "message"]),
      firstValue_(data, ["PageURL", "Page URL", "pageUrl"]),
      firstValue_(data, ["UserAgent", "User Agent", "userAgent"])
    ];

    sheet.appendRow(row);

    return jsonResponse_({
      ok: true,
      message: "Lead saved successfully."
    });
  } catch (error) {
    console.error(error);
    return jsonResponse_({
      ok: false,
      message: error && error.message ? error.message : "Unable to save lead."
    });
  } finally {
    lock.releaseLock();
  }
}

function getLeadSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error("No spreadsheet is connected to this Apps Script project.");
  }

  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight("bold")
      .setBackground("#febe50")
      .setFontColor("#181818");
    sheet.autoResizeColumns(1, HEADERS.length);
  }

  return sheet;
}

function parseRequest_(event) {
  if (!event) return {};

  const contentType = String(
    event.postData && event.postData.type ? event.postData.type : ""
  ).toLowerCase();

  if (contentType.indexOf("application/json") !== -1) {
    return JSON.parse(event.postData.contents || "{}");
  }

  const output = {};
  const parameters = event.parameters || {};
  Object.keys(parameters).forEach(function (key) {
    output[key] = parameters[key].join(", ");
  });

  return output;
}

function collectServices_(data) {
  const selected = [];
  const serviceFields = [
    ["Content-management", "Content Management"],
    ["Content-strategy", "Content Strategy"],
    ["Youtube-management", "YouTube Management"],
    ["Video-editing", "Video Editing"]
  ];

  serviceFields.forEach(function (entry) {
    const value = data[entry[0]];
    if (value === true || value === "true" || value === "on" || value === "yes") {
      selected.push(entry[1]);
    }
  });

  const supplied = firstValue_(data, ["Services", "services"]);
  if (supplied) selected.push(supplied);

  return selected.join(", ");
}

function firstValue_(data, keys) {
  for (let index = 0; index < keys.length; index += 1) {
    const value = data[keys[index]];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return "";
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

