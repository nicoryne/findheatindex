document.addEventListener('DOMContentLoaded', event => {
    const dateInput = document.getElementById('input-date');
    const resultSpan = document.getElementById('span-result');
    
    let dateValue;
    let weatherData;
    dateInput.onchange = async function() {
        dateValue = dateInput.value;
        weatherData = await retrieveWeatherData(dateInput.value);
        if (weatherData && weatherData.temperature !== null && weatherData.humidity !== null && weatherData.temperature !== undefined && weatherData.humidity !== undefined) {
            resultSpan.innerHTML = calculateHeatIndex(weatherData.temperature, weatherData.humidity) + "°C";
        } else {
            resultSpan.innerHTML = "Not enough data!";
        }
    }
})

async function retrieveWeatherData(date) {
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=10.3167&longitude=123.8907&start_date=${date}&end_date=${date}&hourly=temperature_2m,relative_humidity_2m&timezone=Asia%2FSingapore`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.hourly && data.hourly.time && data.hourly.temperature_2m && data.hourly.relative_humidity_2m) {
            const temperatureArray = data.hourly.temperature_2m;
            const humidityArray = data.hourly.relative_humidity_2m;
            
            const maxTempIndex = temperatureArray.indexOf(Math.max(...temperatureArray));
            
            if (maxTempIndex !== -1) {
                const humidityAtMaxTemp = humidityArray[maxTempIndex];
                return { temperature: temperatureArray[maxTempIndex], humidity: humidityAtMaxTemp };
            } else {
                console.log('Maximum temperature not found.');
                return null;
            }
        } else {
            console.log('Temperature and humidity data not found in the response.');
            return null;
        }
    } catch (err) {
        console.error('Error retrieving air data: ', err);
        return null;
    }
}

function calculateHeatIndex(temperatureCelsius, humidity) {
    const temperatureFahrenheit = (temperatureCelsius * 9 / 5) + 32;

    const c1 = -42.379;
    const c2 = 2.04901523;
    const c3 = 10.14333127;
    const c4 = -0.22475541;
    const c5 = -6.83783 * Math.pow(10, -3);
    const c6 = -5.481717 * Math.pow(10, -2);
    const c7 = 1.22874 * Math.pow(10, -3);
    const c8 = 8.5282 * Math.pow(10, -4);
    const c9 = -1.99 * Math.pow(10, -6);

    const T = temperatureFahrenheit;
    const R = humidity;

    const HI = c1 + (c2 * T) + (c3 * R) + (c4 * T * R) + (c5 * T * T) + (c6 * R * R) + (c7 * T * T * R) + (c8 * T * R * R) + (c9 * T * T * R * R);

    return Math.ceil((HI - 32) * 5 / 9) + 1;
}
