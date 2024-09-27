const charCodeOfDot = ".".charCodeAt(0);
const keysCache: { [key: string]: string[] } = {};
const keysRegex = /[.[\]]+/;

const reEscapeChar = /\\(\\)?/g;
const rePropName = RegExp(
  // Match anything that isn't a dot or bracket.
  "[^.[\\]]+" +
    "|" +
    // Or match property names within brackets.
    "\\[(?:" +
    // Match a non-string expression.
    "([^\"'][^[]*)" +
    "|" +
    // Or match strings (supports escaping characters).
    "([\"'])((?:(?!\\2)[^\\\\]|\\\\.)*?)\\2" +
    ")\\]" +
    "|" +
    // Or match "" as the space between consecutive dots or empty brackets.
    "(?=(?:\\.|\\[\\])(?:\\.|\\[\\]|$))",
  "g"
);

const stringToPath = (text: string) => {
  const result = [];
  if (text.charCodeAt(0) === charCodeOfDot) {
    result.push("");
  }

  // @ts-ignore
  text.replace(rePropName, (match, expression, quote, subString) => {
    let key = match;
    if (quote) {
      key = subString.replace(reEscapeChar, "$1");
    } else if (expression) {
      key = expression.trim();
    }
    result.push(key);
  });

  return result;
};
const toPath = (key: string): string[] => {
  if (key === null || key === undefined || !key.length) {
    return [];
  }

  if (typeof key !== "string") {
    throw new Error("toPath() expects a string");
  }

  if (keysCache[key] == null) {
    if (key.endsWith("[]")) {
      keysCache[key] = key.split(keysRegex).filter(Boolean);
    } else {
      keysCache[key] = stringToPath(key);
    }
  }

  return keysCache[key];
};

export default toPath;
