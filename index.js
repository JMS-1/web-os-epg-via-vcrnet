const columnCount = 8;
const columnMinutes = 15;

const columnFactor = columnMinutes * 600 * columnCount;

let started = new Date();
let fullGuide = {};
let offset = 0;

let table;

async function fetch(endpoint, data) {
  return new Promise((s) => {
    try {
      var req = new XMLHttpRequest();

      req.onload = () => {
        try {
          if (req.status === 200 || req.status === 204)
            s(JSON.parse(req.responseText));
          else s(null);
        } catch {
          s(null);
        }
      };

      req.open(data ? "POST" : "GET", `http://cardserver:81/api/${endpoint}`);

      if (data) {
        req.setRequestHeader("Content-Type", "application/json;chartset=utf-8");

        req.send(JSON.stringify(data));
      } else {
        req.send();
      }
    } catch {
      s(null);
    }
  });
}

function failure(msg) {
  document.querySelector(".error").innerText = msg;
}

async function refresh() {
  failure("");

  const profiles = await fetch("profile/profiles");
  const profile = profiles && profiles[0];

  if (!profile || !profile.name) return failure("Keine Verbindung zu VCR.NET");

  const info = await fetch(`guide/info/${profile.name}`);
  const sources = info && info.sourceNames;

  if (!sources || !sources.length) return failure("Keine Quellen");

  sources.sort((l, r) =>
    l.localeCompare(r, undefined, { sensitivity: "accent" })
  );

  const query = {
    contentPattern: "",
    pageIndex: 0,
    pageSize: 100000,
    profileName: profile.name,
    source: "",
    sourceEncryption: "All",
    sourceType: "All",
    startISO: "",
    titlePattern: "",
  };

  const guide = await fetch("guide/query", query);

  if (!guide || !guide.length) return failure("Keine Programmzeitschrift");

  let map = sources.reduce((m, n) => ((m[n] = []), m), {});

  for (const entry of guide) {
    const source = map[entry.station];

    if (!source) continue;

    const from = new Date(entry.startTimeISO);

    const to = new Date(
      from.getFullYear(),
      from.getMonth(),
      from.getDate(),
      from.getHours(),
      from.getMinutes(),
      from.getSeconds() + entry.durationInSeconds
    );

    entry.from = from.getTime();
    entry.to = to.getTime();

    source.push(entry);
  }

  fullGuide = Object.keys(map).reduce((m, n) => {
    const split = n.indexOf("[");
    const name = (n < 0 ? n : n.substring(0, split)).trim();

    m[name] = map[n];

    return m;
  }, {});

  return true;
}

function createViewContents(start) {
  const end = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
    start.getHours(),
    start.getMinutes() + columnCount * columnMinutes
  );

  const view = {};

  for (const station of Object.keys(fullGuide)) {
    const entries = [];

    for (const entry of fullGuide[station])
      if (entry.from < end.getTime()) {
        if (entry.from >= end.getTime()) break;

        if (entry.to < start.getTime()) continue;

        let left = (entry.from - start.getTime()) / columnFactor;

        let width = (entry.to - entry.from) / columnFactor;

        if (left < 0) {
          width += left;
          left = 0;
        }

        if (width <= 0) continue;

        entries.push({
          end: entry.to,
          entry,
          left,
          name: entry.name,
          start: entry.from,
          width,
        });
      }

    view[station] = entries;
  }

  return view;
}

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

function viewDetails(info, source) {
  const entry = info.entry;

  const details = document.createElement("div");

  details.classList.add("details");
  details.onclick = () => details.remove();

  const data = details.appendChild(document.createElement("div"));

  data.classList.add("dialog");

  const statics = data.appendChild(document.createElement("div"));

  const title = statics.appendChild(document.createElement("div"));

  title.classList.add("dialogTitle");

  title.innerText = entry.name;

  const station = statics.appendChild(document.createElement("div"));

  station.classList.add("dialogStation");

  station.innerText = "auf " + source;

  const from = statics.appendChild(document.createElement("div"));

  from.classList.add("dialogFromTo");

  from.innerText =
    "von " +
    formatDate(entry.from, false) +
    " bis " +
    formatDate(entry.to, true);

  if (entry.summary) {
    const short = statics.appendChild(document.createElement("div"));

    short.classList.add("dialogShort");

    short.innerText = entry.summary;
  }

  if (entry.description) {
    const long = data.appendChild(document.createElement("div"));

    long.classList.add("dialogLong");

    long.innerText = entry.description;
  }

  document.body.appendChild(details);
}

function createView() {
  failure("");

  let start = new Date(
    started.getFullYear(),
    started.getMonth(),
    started.getDate(),
    started.getHours(),
    (Math.floor(started.getMinutes() / 15) + offset) * 15
  );

  table.innerText = "";

  const header = document.createElement("div");

  header.classList.add("header");
  header.appendChild(document.createElement("div")).innerText = "Sender";

  const times = header.appendChild(document.createElement("div"));

  times.classList.add("times");

  let column = start;

  for (let i = 0; i < columnCount; i++) {
    const hours = `${column.getHours()}`.padStart(2, "0");
    const minutes = `${column.getMinutes()}`.padStart(2, "0");

    times.appendChild(
      document.createElement("div")
    ).innerText = `${hours}:${minutes}`;

    column = new Date(
      column.getFullYear(),
      column.getMonth(),
      column.getDate(),
      column.getHours(),
      column.getMinutes() + 15
    );
  }

  table.appendChild(header);

  const body = document.createElement("div");

  body.classList.add("body");

  const view = createViewContents(start);

  for (const station of Object.keys(view)) {
    const row = body.appendChild(document.createElement("div"));

    row.classList.add("row");

    const name = row.appendChild(document.createElement("div"));

    name.classList.add("station");
    name.innerText = station;

    const entries = row.appendChild(document.createElement("div"));

    entries.classList.add("entries");

    for (const entry of view[station]) {
      const info = entries.appendChild(document.createElement("div"));

      info.onclick = () => viewDetails(entry, station);

      info.classList.add("entry");

      info.style.left = `${entry.left}%`;
      info.style.width = `${entry.width}%`;

      info.appendChild(document.createElement("div")).innerText = entry.name;
    }
  }

  table.appendChild(body);
}

async function startup() {
  table = document.querySelector(".table");

  if (await refresh()) createView();
}

function next() {
  offset = offset + columnCount - 2;

  createView();
}

function prev() {
  offset = Math.max(0, offset - columnCount + 2);

  createView();
}

function start() {
  offset = 0;

  createView();
}
