const ESCAPE_CODE = 27;

export const plainText = (value: string): string => {
  let output = "";

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index] ?? "";

    if (character.codePointAt(0) !== ESCAPE_CODE || value[index + 1] !== "[") {
      output += character;
      continue;
    }

    index += 2;
    while (index < value.length) {
      const code = value[index]?.codePointAt(0) ?? 0;

      if (code >= 64 && code <= 126) {
        break;
      }

      index += 1;
    }
  }

  return output;
};
