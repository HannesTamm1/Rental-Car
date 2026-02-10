const { price } = require("./rentalPrice");

describe('', () => {


    test('pricing increases by 5% when 1 day is a weekend day', () => {

        const pickupDateWeekend = '2026-02-12' //thursday
        const dropOffDateWeekend = '2026-02-14' //saturday

        const vehicleType = 'Compact';
        const age = 50
        const licenseYears = 20;

        const rentalPriceWeekend = price(pickupDateWeekend, dropOffDateWeekend, vehicleType, age, licenseYears);

        expect(rentalPriceWeekend).toBe('$152.50');
    })

    test('pricing does not increase by 5% when no weekend days', () => {

        const pickupDateWeekday = '2026-02-09' //monday
        const dropOffDateWeekday = '2026-02-11' //wednesday        

        const vehicleType = 'Compact';
        const age = 50
        const licenseYears = 20;

        const rentalPriceWeekend = price(pickupDateWeekday, dropOffDateWeekday, vehicleType, age, licenseYears);

        expect(rentalPriceWeekend).toBe('$150');
    })

    test('pricing increases twice by 5% when 2 weekend days are selected', () => {

        const pickupDateWeekend = '2026-02-07' //thursday
        const dropOffDateWeekend = '2026-02-08' //saturday

        const vehicleType = 'Compact';
        const age = 50
        const licenseYears = 20;

        const rentalPriceWeekend = price(pickupDateWeekend, dropOffDateWeekend, vehicleType, age, licenseYears);

        expect(rentalPriceWeekend).toBe('$155');
    })
})