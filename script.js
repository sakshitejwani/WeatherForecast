const API_KEY = "YOUR_API_KEY_HERE";


const GEO_URL     = "https://api.openweathermap.org/geo/1.0/direct";
const WEATHER_URL = "https://api.openweathermap.org/data/3.0/onecall";

const ICON_URL = "https://openweathermap.org/img/wn";
let currentUnit = "metric";

let lastCity = "";



const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const btnC= document.getElementById("btn-c");
const btnF = document.getElementById("btn-f");


const loadingDiv= document.getElementById("loading");
const errorDiv= document.getElementById("error");
const emptyDiv = document.getElementById("empty");
const weatherDiv= document.getElementById("weather");


const errorMessage = document.getElementById("error-message");

const cityNameEl = document.getElementById("city-name");
const todayDateEl = document.getElementById("today-date");
const weatherIconEl = document.getElementById("weather-icon");
const temperatureEl = document.getElementById("temperature");
const descriptionEl = document.getElementById("description");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const feelsLikeEl = document.getElementById("feels-like");
const forecastEl = document.getElementById("forecast");


searchForm.addEventListener("submit", function(event) {

  event.preventDefault();

  const city = cityInput.value.trim();

  if (city === "") return;

  lastCity = city;

  getWeather(city);
});


btnC.addEventListener("click", function() {
  if (currentUnit === "metric") return;

  currentUnit = "metric";

  btnC.classList.add("active");
  btnF.classList.remove("active");


  if (lastCity) getWeather(lastCity);
});


btnF.addEventListener("click", function() {
  if (currentUnit === "imperial") return;

  currentUnit = "imperial";

  btnF.classList.add("active");
  btnC.classList.remove("active");

  if (lastCity) getWeather(lastCity);
});



async function getWeather(city) {

  showPanel("loading");


  try {

    const geoURL = `${GEO_URL}?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`;


    const geoResponse = await fetch(geoURL);

    const geoData = await geoResponse.json();


    if (geoData.length === 0) {
      throw new Error(`City "${city}" not found.`);
    }


    const lat = geoData[0].lat;       
    const lon = geoData[0].lon;       
    const cityOfficial = geoData[0].name; 
    const country = geoData[0].country;   

    const weatherURL = `${WEATHER_URL}?lat=${lat}&lon=${lon}&units=${currentUnit}&exclude=minutely,hourly,alerts&appid=${API_KEY}`;

    const weatherResponse = await fetch(weatherURL);

 
    if (!weatherResponse.ok) {
      if (weatherResponse.status === 401) {
        throw new Error("Invalid API key.");
      }
      if (weatherResponse.status === 429) {
        throw new Error("Too many requests. Please wait a moment.");
      }
      throw new Error("Could not get weather data. Try again.");
    }

    const weatherData = await weatherResponse.json();


    showWeather(weatherData, cityOfficial, country);
    showForecast(weatherData.daily);

    showPanel("weather");


  } catch (error) {

    errorMessage.textContent = error.message;
    showPanel("error");

    console.error("Error:", error);
  }
}

function showWeather(data, city, country) {

  const current = data.current;

  cityNameEl.textContent = city + ", " + country;

  todayDateEl.textContent = getFormattedDate(new Date());

  const iconCode = current.weather[0].icon;
  weatherIconEl.src = `${ICON_URL}/${iconCode}@2x.png`;
  weatherIconEl.alt = current.weather[0].description;

  const unitSymbol = currentUnit === "metric" ? "°C" : "°F";
  temperatureEl.textContent = Math.round(current.temp) + unitSymbol;


  descriptionEl.textContent = current.weather[0].description;

  humidityEl.textContent  = current.humidity + "%";

  const windUnit = currentUnit === "metric" ? " m/s" : " mph";
  windEl.textContent      = Math.round(current.wind_speed) + windUnit;

  feelsLikeEl.textContent = Math.round(current.feels_like) + unitSymbol;
}


function showForecast(daily) {

  forecastEl.innerHTML = "";

  for (let i = 1; i <= 5; i++) {

    const day = daily[i];

    const date    = new Date(day.dt * 1000);
    const dayName = getDayName(date);          
    const iconCode = day.weather[0].icon;
    const high    = Math.round(day.temp.max);  
    const low     = Math.round(day.temp.min);  

    const card = document.createElement("div");
    card.className = "forecast-card";  

    card.innerHTML = `
      <span class="forecast-day">${dayName}</span>
      <img class="forecast-icon" src="${ICON_URL}/${iconCode}@2x.png" alt="${day.weather[0].description}" />
      <span class="forecast-high">${high}°</span>
      <span class="forecast-low">${low}°</span>
    `;

    forecastEl.appendChild(card);
  }
}


function showPanel(panelName) {

  loadingDiv.classList.add("hidden");
  errorDiv.classList.add("hidden");
  emptyDiv.classList.add("hidden");
  weatherDiv.classList.add("hidden");

  if (panelName === "loading") loadingDiv.classList.remove("hidden");
  if (panelName === "error")   errorDiv.classList.remove("hidden");
  if (panelName === "empty")   emptyDiv.classList.remove("hidden");
  if (panelName === "weather") weatherDiv.classList.remove("hidden");
}


function getFormattedDate(date) {
  const options = {
    weekday: "long",   // "Wednesday"
    day:     "numeric", // "1"
    month:   "long",   // "April"
    year:    "numeric" // "2026"
  };
  return date.toLocaleDateString("en-GB", options);
}


function getDayName(date) {
  return date.toLocaleDateString("en-GB", { weekday: "short" });
}