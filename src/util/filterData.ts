export default function filterKeys(object: object, keys: string[]) {
  Object.keys(object).forEach(function (key) {
    if (keys.indexOf(key) == -1) {
      delete object[key];
    }
  });
}
