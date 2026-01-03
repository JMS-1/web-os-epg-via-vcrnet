function failure(msg) {
  document.querySelector(".error").innerText = msg;
}

async function startup() {
  table = document.querySelector(".table");

  if (await refresh()) createView();

  document.querySelector(".spinner").remove();
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

async function reload() {
  offset = 0;

  if (await refresh()) createView();
}
