const cleanDevelopmentResultNotReached = "ONE_CLEAN_DEVELOPMENT_RESULT_NOT_REACHED";

export const researchStatusFromSnapshot = snapshot => {
  const strategyControl = snapshot.strategies?.find(item => item.id === "strategy-control");
  if (!strategyControl?.verdict) throw new Error("Public snapshot is missing the Strategy Control verdict.");
  if (strategyControl.verdict.includes(cleanDevelopmentResultNotReached)) {
    return {
      code: cleanDevelopmentResultNotReached,
      text: "The current public evidence snapshot reports that one clean development economic result has not yet been reached.",
      eligibleReturnFigures: [],
    };
  }
  return {
    code: strategyControl.verdict,
    text: `The current public evidence snapshot reports Strategy Control status: ${strategyControl.verdict}.`,
    eligibleReturnFigures: Array.isArray(strategyControl.public_return_figures) ? strategyControl.public_return_figures : [],
  };
};

export const unsupportedResearchClaims = [
  "Complete development evaluation produced",
  "complete development evaluation was produced",
];
