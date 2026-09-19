export const getEmptyToolbarState = () => ({
  fontWeight: "normal",
  fontStyle: "normal",
  textAlign: "left",
});

export const getToolbarStateFromObject = (obj) => {
  if (!obj) return getEmptyToolbarState();

  return {
    fontWeight: obj.fontWeight || "normal",
    fontStyle: obj.fontStyle || "normal",
    textAlign: obj.textAlign || "left",
  };
};
