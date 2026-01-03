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
