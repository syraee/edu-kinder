const DEFAULT_MASK = 7;

function maskToMeals(mask) {
  const m = (mask ?? DEFAULT_MASK) & 7;
  const snack_am = !!(m & 4);
  const lunch    = !!(m & 2);
  const snack_pm = !!(m & 1);

  return {
    snack_am,
    lunch,
    snack_pm,
    full_day: snack_am && lunch && snack_pm,
  };
}

function mealsToMask(meals) {
  let mask = 0;
  if (meals.snack_am) mask |= 4;
  if (meals.lunch)    mask |= 2;
  if (meals.snack_pm) mask |= 1;
  return mask;
}

module.exports = {
  DEFAULT_MASK,
  maskToMeals,
  mealsToMask,
};
