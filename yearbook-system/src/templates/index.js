import { SPCStyle } from "./SPCStyle";

export function applyTemplate(name) {
  switch (name) {
    case "spc":
      return SPCStyle();

    default:
      return SPCStyle();
  }
}