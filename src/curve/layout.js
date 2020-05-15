export const width = 1400;
export const height = 600;

export const displayCount = 5;
export const nodeRadius = height / 100;

export const marginX = 0;
export const marginTop = nodeRadius;
export const marginBottom = nodeRadius;

export const controlsHeight = height / 15;
export const fontSize = height / 32;

export const plotWidth = width - (marginX * 2)

export const curveHeight = height - (marginTop + marginBottom + controlsHeight);
export const curveMarginX = width / 10;
export const curveStart = marginX + curveMarginX;
export const curveEnd = width - marginX - curveMarginX;
export const curveWidth = curveEnd - curveStart;

export const xBetweenNodes = curveWidth / (displayCount-1);

const round = num => Math.round((num + Number.EPSILON) * 100) / 100;

export const arrowWidth = width / 36;
export const arrowHeight = height / 25;

export const getX = index => xBetweenNodes * index + curveStart;
export const getY = value => height - ((curveHeight * value) + marginBottom)
export const getValue = y => round((height - y - marginBottom) / curveHeight);
