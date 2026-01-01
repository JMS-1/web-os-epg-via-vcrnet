async function fetch(endpoint) {
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

      req.open("GET", `http://cardserver:81/api/${endpoint}`);
      req.send();
    } catch {
      s(null);
    }
  });
}

function failure(msg) {
  document.querySelector("pre").innerText = msg;
}

async function startup() {
  const profiles = await fetch("profile/profiles");
  const profile = profiles && profiles[0];

  if (!profile || !profile.name) return failure("Keine Verbindung zu VCR.NET");

  const info = await fetch(`guide/info/${profile.name}`);
  const sources = info && info.sourceNames;

  if (!sources || !sources.length) return failure("Keine Quellen");

  sources.sort((l, r) =>
    l.localeCompare(r, undefined, { sensitivity: "accent" })
  );

  document.querySelector("pre").innerText = JSON.stringify(sources, null, 2);
}
