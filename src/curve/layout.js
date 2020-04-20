export const width = 1200;
export const height = 600;
export const marginX = width / 25;
export const marginY = height / 25;

export const plotWidth = (width - (marginX * 2))
export const plotHeight = (height - (marginY * 2))

export const curveMarginX = width / 15;
export const curveStart = marginX + curveMarginX;
export const curveEnd = width - marginX - curveMarginX;
export const curveWidth = curveEnd - curveStart;

const round = num => Math.round((num + Number.EPSILON) * 100) / 100

export const getY = value => height - ((plotHeight * value) + marginY)
export const getValue = y => round((height - y - marginY) / plotHeight);
