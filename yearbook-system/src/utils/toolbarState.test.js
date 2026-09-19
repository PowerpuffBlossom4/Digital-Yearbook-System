import { getToolbarStateFromObject, getEmptyToolbarState } from "./toolbarState";

describe("toolbar state helpers", () => {
  it("maps font and alignment values from a textbox object", () => {
    const state = getToolbarStateFromObject({
      fontWeight: "bold",
      fontStyle: "italic",
      textAlign: "center",
    });

    expect(state).toEqual({
      fontWeight: "bold",
      fontStyle: "italic",
      textAlign: "center",
    });
  });

  it("falls back to neutral values when no object is provided", () => {
    expect(getEmptyToolbarState()).toEqual({
      fontWeight: "normal",
      fontStyle: "normal",
      textAlign: "left",
    });
  });
});
