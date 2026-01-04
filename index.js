/** Spinner visible during load. */
let spinner;

/**
 * Report some error.
 *
 * @param {string} msg Some error messages.
 */
function failure(msg) {
  document.querySelector(".error").innerText = msg;
}

/** Reload from VCR.NET. */
async function reload() {
  /** Show spinner. */
  spinner.style.display = "";

  /** Reset table to first entry and time bias. */
  started = new Date();
  offset = 0;

  /** Reload and fill table. */
  if (await requestGuide()) createView();

  /** In either case disable spinner. */
  spinner.style.display = "none";
}

/** Once call when app starts. */
async function startup() {
  /** Cache primary DOM nodes and load for the first time. */
  table = document.querySelector(".table");
  spinner = document.querySelector(".spinner");

  reload();
}

/** Advance display. */
function next() {
  offset += columnCount - 2;

  createView();
}

/** Go back in display. */
function prev() {
  offset = Math.max(0, offset - columnCount + 2);

  createView();
}

/** Go to start of data. */
function start() {
  started = new Date();
  offset = 0;

  createView();
}

/** Advance full day. */
function nextDay() {
  offset += (24 * 60) / columnMinutes;

  createView();
}
