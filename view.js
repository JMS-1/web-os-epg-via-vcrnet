const columnCount = 8;
const columnMinutes = 15;

const columnFactor = columnMinutes * 600 * columnCount;

let started = new Date();
let offset = 0;

let table;

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
