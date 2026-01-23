/**
 * Call a web method on the VCR.NET Recording Service. Currently
 * the server address is hard coded for local use - if ever someone
 * uses a LG smart TV together with VCR.NET and wants to show the
 * program guide from there this will become configurable.
 *
 * @param {string} endpoint Web method to call.
 * @param {unknown} data Optional data to send in a POST request -
 * if no data is given GET will be used.
 */
async function fetch(endpoint, data) {
  return new Promise((s) => {
    try {
      /** Avoid using any external packages. */
      var req = new XMLHttpRequest();

      req.onload = () => {
        try {
          if (req.status === 200 || req.status === 204)
            /** Expect JSON response. */
            s(JSON.parse(req.responseText));
          else s(null);
        } catch {
          /** Not a JSON response. */
          s(null);
        }
      };

      req.open(data ? "POST" : "GET", `http://cardserver:81/api/${endpoint}`);

      if (data) {
        /** Send data as JSON. */
        req.setRequestHeader("Content-Type", "application/json;chartset=utf-8");

        req.send(JSON.stringify(data));
      } else {
        /** Just call. */
        req.send();
      }
    } catch {
      /** Something really went wrong. */
      s(null);
    }
  });
}
