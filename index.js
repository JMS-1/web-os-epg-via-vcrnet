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
    pageSize: 100,
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

  map = Object.keys(map).reduce((m, n) => {
    const split = n.indexOf("[");
    const name = (n < 0 ? n : n.substring(0, split)).trim();

    m[name] = map[n];

    return m;
  }, {});

  const start = new Date(
    Object.keys(map)
      .flatMap((n) => map[n])
      .map((e) => e.startTimeISO)
      .sort((l, r) => l.localeCompare(r))[0]
  );

  document.querySelector("pre").innerText = start;
}

async function startup() {
  refresh();
}
