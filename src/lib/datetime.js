export const midnight = () => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCHours(0,0,0,0);
  let midnight = +d
  return midnight
}

export const approachingMidnight = () => {
  const rn = Date.now()
  return midnight() - rn
}