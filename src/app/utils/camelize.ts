export function camelize(str: string) {
  const strArr = str.split(/[^a-zA-Z0-9 -]|[\s]|[-]/g);
  if (strArr.length === 1) {
    return str.toLowerCase();
  } else {
    return [strArr[0].toLowerCase()]
      .concat(
        strArr
          .slice(1)
          .filter((word) => word.length > 0)
          .map((word) => {
            return word[0].toUpperCase() + word.slice(1).toLowerCase();
          })
      )
      .join('')
      .replace(/[^a-zA-Z0-9 -]/g, '');
  }
}
