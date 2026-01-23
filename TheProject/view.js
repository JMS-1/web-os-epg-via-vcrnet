/** Number of columns including with in minutes. */
const columnCount = 8;
const columnMinutes = 15;

/** Factor to convert some time range in milliseconds to percentage of total with. */
const columnFactor = columnMinutes * 600 * columnCount;

/** Current time of first column. */
let started = new Date();
let offset = 0;

/** DOM element to put guide data in. */
let table;

/**
 * Create view contents for a given start time.
 *
 * @param {Date} start
 * @returns Table contents as raw data.
 */
function createViewContents(start) {
  /** Start of next view on the data. */
  const end = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
    start.getHours(),
    start.getMinutes() + columnCount * columnMinutes,
  );

  const view = {};

  /** Process all station names already sorted. */
  for (const station of Object.keys(fullGuide)) {
    const entries = [];

    /** Process all entries of the station. */
    for (const entry of fullGuide[station]) {
      /** Right of view - can end since entries are sorted. */
      if (entry.from >= end.getTime()) break;

      /** Left of view check next entry in order. */
      if (entry.to < start.getTime()) continue;

      /** Position and size in percentage. */
      let left = (entry.from - start.getTime()) / columnFactor;
      let width = (entry.to - entry.from) / columnFactor;

      /** First entry may be started in the past - show now separator line and clip accordingly. */
      const leftBorder = left >= 0;

      if (!leftBorder) {
        width += left;
        left = 0;
      }

      /** Just to be a bit safe. */
      if (width <= 0) continue;

      entries.push({
        end: entry.to,
        entry,
        left,
        leftBorder,
        name: entry.name,
        recordings: entry.recordings,
        start: entry.from,
        width,
      });
    }

    /** Add to map. */
    view[station] = entries;
  }

  return view;
}

/** Create the program guide in DOM. */
function createView() {
  failure("");

  /** Get start time of first column. */
  const start = new Date(
    started.getFullYear(),
    started.getMonth(),
    started.getDate(),
    started.getHours(),
    (Math.floor(started.getMinutes() / 15) + offset) * 15,
  );

  const year = `${start.getFullYear()}`;
  const month = `${1 + start.getMonth()}`.padStart(2, "0");
  const day = `${start.getDate()}`.padStart(2, "0");

  /** Reset the table content. */
  table.innerText = "";

  /** Create header with date and all column times. */
  const header = document.createElement("div");

  header.classList.add("header");
  header.appendChild(document.createElement("div")).innerText =
    `${day}.${month}.${year}`;

  const times = header.appendChild(document.createElement("div"));

  times.classList.add("times");

  let column = start;

  for (let i = 0; i < columnCount; i++) {
    const hours = `${column.getHours()}`.padStart(2, "0");
    const minutes = `${column.getMinutes()}`.padStart(2, "0");

    times.appendChild(document.createElement("div")).innerText =
      `${hours}:${minutes}`;

    column = new Date(
      column.getFullYear(),
      column.getMonth(),
      column.getDate(),
      column.getHours(),
      column.getMinutes() + 15,
    );
  }

  table.appendChild(header);

  /** Create table content with all rows. */
  const body = document.createElement("div");

  body.classList.add("body");

  const view = createViewContents(start);

  /** One table row per station. */
  for (const station of Object.keys(view)) {
    const row = body.appendChild(document.createElement("div"));

    row.classList.add("row");

    const name = row.appendChild(document.createElement("div"));

    name.classList.add("station");
    name.innerText = station;

    const entries = row.appendChild(document.createElement("div"));

    entries.classList.add("entries");

    /** Just add all entries in the current view. */
    for (const entry of view[station]) {
      const info = entries.appendChild(document.createElement("div"));

      info.onclick = () => viewDetails(entry, station);

      info.classList.add("entry");

      /** Do not show border if entry is incomplete - can only be the first entry. */
      if (entry.leftBorder) info.classList.add("border");

      /** Position entry according to start and end time and column time. */
      info.style.left = `${entry.left}%`;
      info.style.width = `${entry.width}%`;

      info.appendChild(document.createElement("div")).innerText = entry.name;
    }

    /** Apply recordings. */
    const first = view[station][0];

    for (const recording of (first && first.recordings) || []) {
      /** Position entry according to start and end time and column time. */
      let left = (recording.from - start.getTime()) / columnFactor;
      let width = (recording.to - recording.from) / columnFactor;

      if (left < 0) {
        width += left;
        left = 0;
      }

      if (width <= 0) continue;

      /** Add to DOM. */
      const info = entries.appendChild(document.createElement("div"));

      info.classList.add("recording");

      info.style.left = `${left}%`;
      info.style.width = `${width}%`;
    }
  }

  /** Add table to visible DOM. */
  table.appendChild(body);
}
