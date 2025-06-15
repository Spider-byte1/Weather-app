const apiKey = "2bc4292947dc4d9d1ef0144643ec5130"; 

async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return alert("Please enter a city name");

  await fetchWeatherData(`q=${city}`);
}

async function getWeatherByLocation() {
  if (!navigator.geolocation) {
    return alert("Geolocation not supported by your browser.");
  }

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    await fetchWeatherData(`lat=${latitude}&lon=${longitude}`);
  }, () => {
    alert("Unable to get your location.");
  });
}

async function fetchWeatherData(query) {
  const weatherDisplay = document.getElementById("weatherDisplay");
  const forecastContainer = document.getElementById("forecast");

  weatherDisplay.innerHTML = "Loading...";
  forecastContainer.innerHTML = "";

  try {
    // Current weather
    const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?${query}&appid=${apiKey}&units=metric`);
    if (!currentRes.ok) throw new Error("City not found");
    const currentData = await currentRes.json();

    const {
      name,
      sys: { country },
      weather,
      main: { temp, humidity },
      wind: { speed }
    } = currentData;

    const icon = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;

    weatherDisplay.innerHTML = `
      <h2>${name}, ${country}</h2>
      <img src="${icon}" alt="${weather[0].description}">
      <p><strong>🌤 Weather:</strong> ${weather[0].main} (${weather[0].description})</p>
      <p><strong>🌡 Temperature:</strong> ${temp} °C</p>
      <p><strong>💧 Humidity:</strong> ${humidity}%</p>
      <p><strong>🌬 Wind:</strong> ${speed} m/s</p>
    `;

    // 5-Day Forecast (every 3 hours)
    const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?${query}&appid=${apiKey}&units=metric`);
    const forecastData = await forecastRes.json();

    const dailyData = forecastData.list.filter(item => item.dt_txt.includes("12:00:00"));

    dailyData.forEach(item => {
      const date = new Date(item.dt_txt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      const icon = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
      const temp = item.main.temp.toFixed(1);
      const desc = item.weather[0].main;

      const card = document.createElement("div");
      card.className = "forecast-day";
      card.innerHTML = `
        <h4>${date}</h4>
        <img src="${icon}" alt="${desc}" />
        <p>${temp} °C</p>
        <p>${desc}</p>
      `;
      forecastContainer.appendChild(card);
    });

  } catch (err) {
    weatherDisplay.innerHTML = `<p>⚠️ ${err.message}</p>`;
  }
}
