export const width = 1350;
export const height = 600;
export const marginX = 0;
export const marginTop = height / 25;
export const marginBottom = height / 15;

export const plotWidth = width - (marginX * 2)

export const curveHeight = height - (marginTop + marginBottom)
export const curveMarginX = width / 10;
export const curveStart = marginX + curveMarginX;
export const curveEnd = width - marginX - curveMarginX;
export const curveWidth = curveEnd - curveStart;

const round = num => Math.round((num + Number.EPSILON) * 100) / 100;

export const arrowWidth = width / 36;
export const arrowHeight = height / 25;

export const nodeRadius = height / 100;

export const getY = value => height - ((curveHeight * value) + marginBottom)
export const getValue = y => round((height - y - marginBottom) / curveHeight);
