let mockTimeZone = null;
const setTimezone = (timeZone) => {
  mockTimeZone = timeZone;
};
const getTimezone = () => {
  return mockTimeZone;
};

export { getTimezone as g, setTimezone as s };
//# sourceMappingURL=timezone-utils.mjs.map
