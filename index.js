const express = require('express');
const bodyParser = require('body-parser');
const rental = require('./rentalPrice');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
app.use('/pictures', express.static('images'));

const formHtml = fs.readFileSync('form.html', 'utf8');
const resultHtml = fs.readFileSync('result.html', 'utf8');

const VEHICLES = [
    { placeholder: '__COMPACT__', type: 'compact' },
    { placeholder: '__ELECTRIC__', type: 'electric' },
    { placeholder: '__CABRIO__', type: 'cabrio' },
    { placeholder: '__RACER__', type: 'racer' },
];

function renderError(message) {
    const alert = `<div class="alert alert-danger mt-3" role="alert">${message}</div>`;
    // insert alert just before closing form tag so the user keeps their inputs
    return formHtml.replace('</form>', `${alert}</form>`);
}

app.post('/', (req, res) => {
    const post = req.body;
    const { pickupdate, dropoffdate, type, age, licenseYears } = post;
    const ageNum = Number(age);
    const licenseNum = Number(licenseYears);

    const mainResult = rental.price(
        pickupdate,
        dropoffdate,
        type,
        ageNum,
        licenseNum
    );

    const isPrice = typeof mainResult === 'string' && mainResult.startsWith('$');
    if (!isPrice) {
        res.status(400).send(renderError(mainResult));
        return;
    }

    let filledHtml = resultHtml;
    VEHICLES.forEach(({ placeholder, type: vehicleType }) => {
        const value = rental.price(
            pickupdate,
            dropoffdate,
            vehicleType,
            ageNum,
            licenseNum
        );

        const isVehiclePrice = typeof value === 'string' && value.startsWith('$');
        const text = isVehiclePrice ? `Price: ${value} total` : value;
        filledHtml = filledHtml.replaceAll(placeholder, text);
    });

    res.send(formHtml + filledHtml);
});

app.get('/', (req, res) => {
    res.send(formHtml);
});

// Start the server
const server = app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use.`);
    } else {
        console.error('Server error:', err);
    }
});
