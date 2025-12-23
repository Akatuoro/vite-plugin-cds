const fallbackPerformance = () => {
  const start = Date.now();
  return {
    now: () => Date.now() - start,
  };
};

export const performance = globalThis.performance ?? fallbackPerformance();

export default { performance };
