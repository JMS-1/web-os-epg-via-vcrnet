let spinner;

function failure(msg) {
  document.querySelector(".error").innerText = msg;
}

async function reload() {
  spinner.style.display = "";

  offset = 0;

  if (await refresh()) createView();

  spinner.style.display = "none";
}

async function startup() {
  table = document.querySelector(".table");
  spinner = document.querySelector(".spinner");

  reload();
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
