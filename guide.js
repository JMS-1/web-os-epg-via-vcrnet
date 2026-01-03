let fullGuide = {};

async function refresh() {
  failure("");

  table.innerText = "";

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
