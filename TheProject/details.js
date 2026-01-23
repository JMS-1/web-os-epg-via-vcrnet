/**
 * Do some date time formatting.
 *
 * @param {number} date Time in Date.getTime() representation.
 * @param {boolean} short Set to only show the time.
 * @returns
 */
function formatDate(date, short) {
  const full = new Date(date);
  const year = `${full.getFullYear()}`;
  const month = `${1 + full.getMonth()}`.padStart(2, "0");
  const day = `${full.getDate()}`.padStart(2, "0");
  const hour = `${full.getHours()}`.padStart(2, "0");
  const minute = `${full.getMinutes()}`.padStart(2, "0");

  return short
    ? `${hour}:${minute}`
    : `${day}.${month}.${year} ${hour}:${minute}`;
}

/**
 * Show details of an entry.
 *
 * @param {object} info Information on the entry to show.
 * @param {string} source Name of the station.
 */
function viewDetails(info, source) {
  const entry = info.entry;

  /** Create the dialog - will close via remove on any click. */
  const details = document.createElement("div");

  details.classList.add("details");
  details.onclick = () => details.remove();

  const data = details.appendChild(document.createElement("div"));

  data.classList.add("dialog");

  const statics = data.appendChild(document.createElement("div"));

  /** Name and station. */
  const title = statics.appendChild(document.createElement("div"));

  title.classList.add("dialogTitle");

  title.innerText = entry.name;

  const station = statics.appendChild(document.createElement("div"));

  station.classList.add("dialogStation");

  station.innerText = "auf " + source;

  /** Start and end time. */
  const from = statics.appendChild(document.createElement("div"));

  from.classList.add("dialogFromTo");

  from.innerText =
    "von " +
    formatDate(entry.from, false) +
    " bis " +
    formatDate(entry.to, true);

  /** Short description. */
  if (entry.summary) {
    const short = statics.appendChild(document.createElement("div"));

    short.classList.add("dialogShort");

    short.innerText = entry.summary;
  }

  /** Long description. */
  if (entry.description) {
    const long = data.appendChild(document.createElement("div"));

    long.classList.add("dialogLong");

    long.innerText = entry.description;
  }

  document.body.appendChild(details);
}
