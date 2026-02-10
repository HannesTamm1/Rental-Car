const SEASON = {
  HIGH: "High",
  LOW: "Low",
};

const VEHICLE_CLASS = {
  COMPACT: "Compact",
  ELECTRIC: "Electric",
  CABRIO: "Cabrio",
  RACER: "Racer",
};

const HIGH_SEASON_START_MONTH = 3; // April (0-based)
const HIGH_SEASON_END_MONTH = 9; // October (0-based)
const MIN_AGE = 18;
const YOUNG_DRIVER_MAX = 21;
const RACER_YOUNG_MAX = 25;
const LONG_RENTAL_THRESHOLD = 10;
const SHORT_LICENSE_LIMIT = 2;
const EXTRA_LICENSE_LIMIT = 3;

function normalizeVehicleClass(rawType) {
  const value = String(rawType || "").toLowerCase();

  switch (value) {
    case "compact":
      return VEHICLE_CLASS.COMPACT;
    case "electric":
      return VEHICLE_CLASS.ELECTRIC;
    case "cabrio":
      return VEHICLE_CLASS.CABRIO;
    case "racer":
      return VEHICLE_CLASS.RACER;
    default:
      return null;
  }
}

function parseDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getRentalDays(pickupDate, dropoffDate) {
  const pickup = parseDate(pickupDate);
  const dropoff = parseDate(dropoffDate);

  if (!pickup || !dropoff) {
    return { error: "Invalid pickup or dropoff date" };
  }

  if (dropoff < pickup) {
    return { error: "Dropoff date cannot be before pickup date" };
  }

  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const days = Math.floor((dropoff - pickup) / millisecondsPerDay) + 1; // inclusive of pickup day
  return { days, pickup, dropoff };
}

function hasHighSeasonDay(startDate, endDate) {
  let cursor = new Date(startDate);

  while (cursor <= endDate) {
    const month = cursor.getMonth();
    if (month >= HIGH_SEASON_START_MONTH && month <= HIGH_SEASON_END_MONTH) {
      return true;
    }
    cursor.setMonth(cursor.getMonth() + 1, 1); // jump to start of next month
  }

  return false;
}

function getSeason(pickupDate, dropoffDate) {
  return hasHighSeasonDay(pickupDate, dropoffDate) ? SEASON.HIGH : SEASON.LOW;
}

function validateDriver(age, licenseYears, vehicleClass) {
  if (age < MIN_AGE) {
    return "Driver too young - cannot quote the price";
  }

  if (age <= YOUNG_DRIVER_MAX && vehicleClass !== VEHICLE_CLASS.COMPACT) {
    return "Drivers 21 y/o or less can only rent Compact vehicles";
  }

  if (licenseYears < 1) {
    return "Driver must have a license for at least 1 year";
  }

  if (!vehicleClass) {
    return "Unknown vehicle class";
  }

  return null;
}

function price(pickupDate, dropoffDate, vehicleType, age, licenseYears) {
  const driverAge = Number(age);
  const licenseDuration = Number(licenseYears);

  if (Number.isNaN(driverAge) || Number.isNaN(licenseDuration)) {
    return "Invalid age or license duration";
  }

  const vehicleClass = normalizeVehicleClass(vehicleType);
  const { days, pickup, dropoff, error: daysError } = getRentalDays(pickupDate, dropoffDate);

  if (daysError) {
    return daysError;
  }

  const season = getSeason(pickup, dropoff);
  const validationError = validateDriver(driverAge, licenseDuration, vehicleClass);
  if (validationError) {
    return validationError;
  }

  let dailyRate = Math.max(driverAge, MIN_AGE); // minimum per-day price is driver's age
  if (licenseDuration < EXTRA_LICENSE_LIMIT && season === SEASON.HIGH) {
    dailyRate += 15; // extra per day in high season for <3 years license
  }

  let total = dailyRate * days;

  if (licenseDuration < SHORT_LICENSE_LIMIT) {
    total *= 1.3; // +30%
  }

  if (season === SEASON.HIGH) {
    total *= 1.15; // +15%
  }

  if (vehicleClass === VEHICLE_CLASS.RACER && driverAge <= RACER_YOUNG_MAX && season === SEASON.HIGH) {
    total *= 1.5; // +50% for young racer drivers in high season
  }

  if (days > LONG_RENTAL_THRESHOLD && season === SEASON.LOW) {
    total *= 0.9; // 10% discount for long rentals in low season
  }

  const minimumTotal = driverAge * days;
  if (total < minimumTotal) {
    total = minimumTotal; // enforce minimum per-day price based on driver's age
  }

  return `$${total.toFixed(2)}`;
}

exports.price = price;
exports.SEASON = SEASON;
exports.VEHICLE_CLASS = VEHICLE_CLASS;
