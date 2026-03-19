const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const errorBox = document.getElementById("error");
const resultBox = document.getElementById("result");

searchBtn.addEventListener("click", () => {
  getWeather(cityInput.value);
});

cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") getWeather(cityInput.value);
});

async function getWeather(city) {
  const name = city.trim();

  if (!name) {
    errorBox.textContent = "Please enter a city name.";
    resultBox.innerHTML =
      '<p class="placeholder">Weather details will appear here.</p>';
    return;
  }

  errorBox.textContent = "Searching city...";

  try {
    // 1) Get coordinates from Open‑Meteo geocoding API
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      name
    )}&count=1`;
    const geoRes = await fetch(geoUrl);

    if (!geoRes.ok) {
      throw new Error("Geocoding error. Try again.");
    }

    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found. Check spelling.");
    }

    const place = geoData.results[0];
    const lat = place.latitude;
    const lon = place.longitude;
    const displayName = `${place.name}, ${place.country}`;

    errorBox.textContent = "Loading weather...";

    // 2) Get current weather from Open‑Meteo
    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}` +
      `&longitude=${lon}&current_weather=true`;
    const weatherRes = await fetch(weatherUrl);

    if (!weatherRes.ok) {
      throw new Error("Weather API error. Try again.");
    }

    const weatherData = await weatherRes.json();

    if (!weatherData.current_weather) {
      throw new Error("No weather data available.");
    }

    const current = weatherData.current_weather;

    errorBox.textContent = "";

    resultBox.innerHTML = `
      <h2>${displayName}</h2>
      <p>Temperature: ${Math.round(current.temperature)} °C</p>
      <p>Wind Speed: ${current.windspeed} km/h</p>
      <p>Wind Direction: ${current.winddirection}°</p>
      <p>Time: ${current.time}</p>
    `;
  } catch (err) {
    console.error(err);
    errorBox.textContent = err.message;
    resultBox.innerHTML =
      '<p class="placeholder">No data. Fix the error above and retry.</p>';
  }
}
