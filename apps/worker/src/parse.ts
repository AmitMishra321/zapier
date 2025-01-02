export function parse(
    text: string,
    values: any,
    startDelimiter = "{",
    endDelimiter = "}"
  ) {
    try {
      if (typeof text !== "string") {
        throw new TypeError("The 'text' parameter must be a string.");
      }
      if (typeof values !== "object" || values === null) {
        throw new TypeError("The 'values' parameter must be a non-null object.");
      }
  
      const regex = new RegExp(`${startDelimiter}(.*?)${endDelimiter}`, "g");
  
      return text.replace(regex, (_, key) => {
        try {
          const keys = key.trim().split(".");
          let value: any = values;
  
          for (const k of keys) {
            if (typeof value === "string") {
              try {
                value = JSON.parse(value);
              } catch {
                return `{${key}}`;
              }
            }
            value = value?.[k];
            if (value === undefined) return `{${key}}`;
          }
          return String(value ?? `{${key}}`);
        } catch {
          return `{${key}}`;
        }
      });
    } catch (error) {
      console.error("Error in parse function:", error);
      return text;
    }
  }
  