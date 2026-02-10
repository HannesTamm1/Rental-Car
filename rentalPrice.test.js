const { price } = require("./rentalPrice");

describe("validation errors", () => {
  test("rejects drivers younger than 18", () => {
    expect(price("2025-01-01", "2025-01-02", "Compact", 17, 2)).toBe(
      "Driver too young - cannot quote the price"
    );
  });

  test("rejects non-compact rentals for 18-21 year olds", () => {
    expect(price("2025-01-01", "2025-01-02", "Racer", 19, 2)).toBe(
      "Drivers 21 y/o or less can only rent Compact vehicles"
    );
    expect(price("2025-01-01", "2025-01-02", "Electric", 20, 2)).toBe(
      "Drivers 21 y/o or less can only rent Compact vehicles"
    );
  });

  test("rejects drivers with license under 1 year", () => {
    expect(price("2025-01-01", "2025-01-02", "Compact", 30, 0.5)).toBe(
      "Driver must have a license for at least 1 year"
    );
  });

  test("rejects unknown vehicle class", () => {
    expect(price("2025-01-01", "2025-01-02", "Spaceship", 30, 5)).toBe(
      "Unknown vehicle class"
    );
    expect(price("2025-01-01", "2025-01-02", undefined, 30, 5)).toBe(
      "Unknown vehicle class"
    );
  });

  test("rejects invalid age or license values", () => {
    expect(price("2025-01-01", "2025-01-02", "Compact", "abc", "def")).toBe(
      "Invalid age or license duration"
    );
  });

  test("rejects invalid dates and dropoff before pickup", () => {
    expect(price("not-a-date", "2025-01-02", "Compact", 30, 2)).toBe(
      "Invalid pickup or dropoff date"
    );
    expect(price("2025-01-10", "2025-01-01", "Compact", 30, 2)).toBe(
      "Dropoff date cannot be before pickup date"
    );
  });
});

describe("pricing rules", () => {
  test("base price in low season uses driver's age per day", () => {
    expect(price("2025-01-01", "2025-01-03", "Compact", 30, 5)).toBe("$90.00");
  });

  test("adds 15% surcharge in high season", () => {
    expect(price("2025-07-01", "2025-07-01", "Compact", 30, 5)).toBe("$34.50");
  });

  test("detects high season when rental crosses March to April boundary", () => {
    expect(price("2025-03-30", "2025-04-02", "Compact", 30, 5)).toBe("$138.00");
  });

  test("adds 50% for young Racer drivers in high season only", () => {
    expect(price("2025-07-01", "2025-07-01", "Racer", 23, 5)).toBe("$39.67");
    // Low season should not add the racer surcharge
    expect(price("2025-01-01", "2025-01-01", "Racer", 23, 5)).toBe("$23.00");
  });

  test("applies license surcharges when under 2 or 3 years", () => {
    expect(price("2025-06-01", "2025-06-01", "Compact", 30, 1.5)).toBe("$67.27");
  });

  test("extra 15 EUR for <3y license only in high season", () => {
    expect(price("2025-07-01", "2025-07-01", "Compact", 30, 2.5)).toBe("$51.75");
    expect(price("2025-02-01", "2025-02-01", "Compact", 30, 2.5)).toBe("$30.00");
  });

  test("accepts Electric and Cabrio classes", () => {
    expect(price("2025-05-01", "2025-05-01", "Electric", 40, 10)).toBe("$46.00"); 
    expect(price("2025-02-01", "2025-02-01", "Cabrio", 40, 10)).toBe("$40.00");
  });

  test("long rentals get 10% discount only in low season", () => {
    expect(price("2025-01-01", "2025-01-12", "Compact", 25, 1)).toBe("$351.00");
    expect(price("2025-07-01", "2025-07-12", "Compact", 25, 5)).toBe("$345.00");
  });

  test("minimum daily price matches driver's age even after discounts", () => {
    expect(price("2025-01-01", "2025-01-11", "Compact", 20, 5)).toBe("$220.00");
  });
});
