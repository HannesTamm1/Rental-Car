function price(pickupDate, dropoffDate, type, age, licenseYears) {

  const vehicleClass = type || "Unknown";
  const days = getDays(pickupDate, dropoffDate);
  const season = getSeason(pickupDate);

const SEASON = {
  HIGH: "High",
  LOW: "Low",
};

const VEHICLE_CLASS = {
  COMPACT: "Compact",
  ELECTRIC: "Electric",
  CABRIO: "Cabrio",
  RACER: "Racer",
  UNKNOWN: "Unknown",
};


  if (age < 18) {
      return "Driver too young - cannot quote the price";
  }

  if (age <= 21 && vehicleClass !== "Compact") {
      return "Drivers 21 y/o or less can only rent Compact vehicles";
  }

  if (licenseYears < 1) {
    return "Driver must have a license for at least 1 year";
  }
  
  let rentalPrice = age * days;

  const hasShortLicense = licenseYears >= 1 && licenseYears < 2;

  if (hasShortLicense) {
    rentalPrice *= 1.3;
  }

  if (licenseYears < 3 && licenseYears >= 1 && season === SEASON.HIGH) {
    rentalPrice *= 1.3 + 15;
  }


  if (type === VEHICLE_CLASS.RACER && age <= 25 && season === SEASON.HIGH) {
      rentalPrice *= 1.5;
  }

  if (season === SEASON.HIGH ) {
    rentalPrice *= 1.15;
  }

  if (days > 10 && season === SEASON.LOW) {
      rentalPrice *= 0.9;
  }
  return '$' + rentalPrice;
}


function getDays(pickupDate, dropoffDate) {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const firstDate = new Date(pickupDate);
  const secondDate = new Date(dropoffDate);

  return Math.round(Math.abs((firstDate - secondDate) / oneDay)) + 1;
}

function getSeason(pickupDate, dropoffDate) {
  const pickup = new Date(pickupDate);
  const dropoff = new Date(dropoffDate);

  const start = 4; 
  const end = 10;

  const pickupMonth = pickup.getMonth();
  const dropoffMonth = dropoff.getMonth();

  if (
      (pickupMonth >= start && pickupMonth <= end) ||
      (dropoffMonth >= start && dropoffMonth <= end) ||
      (pickupMonth < start && dropoffMonth > end)
  ) {
      return "High";
  } else {
      return "Low";
  }
}

exports.price = price;