const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

const GEOCODING_API_URL = "https://api.openweathermap.org/data/2.5/weather";
const CITY_SEARCH_API_URL = "https://api.openweathermap.org/data/2.5/find"; // For city search suggestions

const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");
const suggestionsList = document.getElementById("suggestions");

// Initialize window.myWidgetParam to prevent undefined errors
if (!window.myWidgetParam) {
  window.myWidgetParam = [];
}

// Handle search button click
searchButton.addEventListener("click", () => {
  const cityName = cityInput.value.trim();
  if (!cityName) {
    alert("Please enter a city name.");
    return;
  }

  // Fetch city data to get city ID
  fetchCityId(cityName);
});

// Handle city input and show suggestions
cityInput.addEventListener("input", () => {
  const cityName = cityInput.value.trim();
  if (cityName.length >= 3) {
    fetchCitySuggestions(cityName); // Only fetch suggestions if at least 3 characters are entered
  } else {
    suggestionsList.innerHTML = ""; // Clear suggestions if input is too short
  }
});

// Fetch city suggestions based on input
function fetchCitySuggestions(cityName) {
  fetch(
    `${CITY_SEARCH_API_URL}?q=${cityName}&appid=${OPENWEATHER_API_KEY}&limit=5`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.cod === "404" || !data.list) {
        suggestionsList.innerHTML = ""; // No suggestions found
        return;
      }

      // Display the suggestions
      suggestionsList.innerHTML = data.list
        .map(
          (city) =>
            `<li data-id="${city.id}" data-name="${city.name}, ${city.sys.country}">${city.name}, ${city.sys.country}</li>`
        )
        .join("");

      // Add click event listener for each suggestion
      document.querySelectorAll("#suggestions li").forEach((item) => {
        item.addEventListener("click", () => {
          const cityId = item.getAttribute("data-id");
          updateWidget(cityId);
          cityInput.value = item.getAttribute("data-name");
          cityInput.value = ""; // Clear the input field
          suggestionsList.innerHTML = ""; // Clear suggestions list after selection
        });
      });
    })
    .catch((error) => console.error("Error fetching city suggestions:", error));
}

// Fetch the city ID based on the city name
function fetchCityId(cityName) {
  fetch(`${GEOCODING_API_URL}?q=${cityName}&appid=${OPENWEATHER_API_KEY}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.cod === "404") {
        alert("City not found. Please try again.");
        return;
      }

      const cityId = data.id; // Extract the city ID
      console.log("City ID:", cityId);

      // Update the widget with the new city ID
      updateWidget(cityId);
    })
    .catch((error) => console.error("Error fetching city data:", error));
}

// Update the widget with the retrieved city ID
function updateWidget(cityId) {
  // Ensure the container exists before proceeding
  const container = document.getElementById("openweathermap-widget-11");
  if (!container) {
    console.error("Widget container not found in the DOM.");
    return;
  }

  // Clear the existing widget
  container.innerHTML = ""; // Clear the widget container

  // Update the widget parameters
  window.myWidgetParam = [
    {
      id: 11,
      cityid: cityId, // Use the city ID from the Geocoding API
      appid: OPENWEATHER_API_KEY,
      units: "metric",
      containerid: "openweathermap-widget-11",
    },
  ];

  console.log("Updated widget parameters:", window.myWidgetParam);

  // Add the script back to the DOM to reload the widget
  loadWeatherWidgetScript();
}

// Function to load the widget script (with D3.js as a dependency)
function loadWeatherWidgetScript() {
  // Check if d3.js is loaded
  const d3Script = document.querySelector(
    'script[src="https://d3js.org/d3.v5.min.js"]'
  );
  if (!d3Script) {
    const script = document.createElement("script");
    script.src = "https://d3js.org/d3.v5.min.js"; // Load d3.js before the widget script
    script.async = true;
    script.onload = () => {
      // After d3.js is loaded, load the widget script
      const widgetScript = document.createElement("script");
      widgetScript.src =
        "https://openweathermap.org/themes/openweathermap/assets/vendor/owm/js/weather-widget-generator.js";
      widgetScript.async = true;
      widgetScript.charset = "utf-8";
      document.body.appendChild(widgetScript);
    };
    document.body.appendChild(script);
  } else {
    // If d3.js is already loaded, just load the widget script
    const widgetScript = document.createElement("script");
    widgetScript.src =
      "https://openweathermap.org/themes/openweathermap/assets/vendor/owm/js/weather-widget-generator.js";
    widgetScript.async = true;
    widgetScript.charset = "utf-8";
    document.body.appendChild(widgetScript);
  }
}
