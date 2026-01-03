/** Program guide with a list of sorted entries per station. */
let fullGuide = {};

/** Load program guide from VCR.NET. */
async function requestGuide() {
  /** Reset visuals. */
  failure("");

  table.innerText = "";

  /** Use only the first device profile. */
  const profiles = await fetch("profile/profiles");
  const profile = profiles && profiles[0];

  if (!profile || !profile.name) return failure("Keine Verbindung zu VCR.NET");

  /** Get all sources for which VCR.NET has program guide entries. */
  const info = await fetch(`guide/info/${profile.name}`);
  const sources = info && info.sourceNames;

  if (!sources || !sources.length) return failure("Keine Quellen");

  /** Use sources sorted according to the local configuration. */
  sources.sort((l, r) =>
    l.localeCompare(r, undefined, { sensitivity: "accent" })
  );

  /** Get the full program guide - limited to 50000 entries not crash the TV. */
  const query = {
    contentPattern: "",
    pageIndex: 0,
    pageSize: 50000,
    profileName: profile.name,
    source: "",
    sourceEncryption: "All",
    sourceType: "All",
    startISO: "",
    titlePattern: "",
  };

  const guide = await fetch("guide/query", query);

  if (!guide || !guide.length) return failure("Keine Programmzeitschrift");

  /** Prepare the guide map and process all entries - already sorted by start time. */
  let map = sources.reduce((m, n) => ((m[n] = []), m), {});

  for (const entry of guide) {
    /** Should never happen but better be safe than sorry. */
    const source = map[entry.station];

    if (!source) continue;

    /** Calculate the time bound for the entry and add the extended entry to the list. */
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

  /** To show in the guide reduce all station names to a short readable form. */
  fullGuide = Object.keys(map).reduce((m, n) => {
    /** VCR.NET name typically has the form <short name> [<provider>] {<service identifier>}. */
    const split = n.indexOf("[");
    const name = (split < 0 ? n : n.substring(0, split)).trim();

    m[name] = map[n];

    return m;
  }, {});

  return true;
}
