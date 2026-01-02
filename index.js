const columnCount = 8;
const columnMinutes = 15;

const columnFactor = columnMinutes * 600 * columnCount;

let started = new Date();
let fullGuide = {};
let offset = 0;

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
  document.querySelector("pre").innerText = msg;
}

async function refresh() {
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

    if (source) source.push(entry);
  }

  fullGuide = Object.keys(map).reduce((m, n) => {
    const split = n.indexOf("[");
    const name = (n < 0 ? n : n.substring(0, split)).trim();

    m[name] = map[n];

    return m;
  }, {});
}

function showAt(start) {
  const end = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
    start.getHours(),
    start.getMinutes() + columnCount * columnMinutes
  );

  for (const station of Object.keys(fullGuide)) {
    const entries = fullGuide[station]
      .map((e) => {
        const from = new Date(e.startTimeISO);

        if (from.getTime() >= end.getTime()) return null;

        const to = new Date(
          from.getFullYear(),
          from.getMonth(),
          from.getDate(),
          from.getHours(),
          from.getMinutes(),
          from.getSeconds() + e.durationInSeconds
        );

        if (to.getTime() < start.getTime()) return null;

        return {
          end: to,
          entry: e,
          left: (from.getTime() - start.getTime()) / columnFactor,
          name: e.name,
          start: from,
          width: (to.getTime() - from.getTime()) / columnFactor,
        };
      })
      .filter((e) => e && e.width > 0 && e.left + e.width > 0);

    document.querySelector("pre").innerText += station + "\n";

    for (const entry of entries) {
      document.querySelector("pre").innerText += "\t" + entry.name + "\n";
    }
  }
}

function createView() {
  document.querySelector("pre").innerText = "";

  const start = new Date(
    started.getFullYear(),
    started.getMonth(),
    started.getDate(),
    started.getHours(),
    (Math.floor(started.getMinutes() / 15) + offset) * 15
  );

  showAt(start);
}

async function startup() {
  await refresh();

  createView();
}

function next() {
  offset = offset + 1;

  createView();
}

function prev() {
  offset = Math.max(0, offset - 1);

  createView();
}

function start() {
  offset = 0;

  createView();
}
