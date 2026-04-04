// client/src/utils/emoji.js

// Check day/night
function isDayTime(timestamp, sunrise, sunset) {
  if (!sunrise || !sunset) return true;
  const t = new Date(timestamp).getTime();
  return t >= sunrise * 1000 && t < sunset * 1000;
}

// HOURLY EMOJI (uses day/night)
export function getHourlyEmoji(weatherId, timestamp, sunrise, sunset) {
  if (!weatherId) return "❓";

  const day = isDayTime(timestamp, sunrise, sunset);

  // NIGHT
  if (!day) {
    if (weatherId === 800) return "🌙";
    if (weatherId > 800) return "🌙☁️";
    if (weatherId >= 200 && weatherId < 300) return "⛈️";
    if (weatherId >= 300 && weatherId < 600) return "🌧️";
    if (weatherId >= 600 && weatherId < 700) return "❄️";
    if (weatherId >= 700 && weatherId < 800) return "🌫️";
    return "🌙";
  }

  // DAY
  if (weatherId === 800) return "☀️";
  if (weatherId > 800) return "⛅";
  if (weatherId >= 200 && weatherId < 300) return "⛈️";
  if (weatherId >= 300 && weatherId < 600) return "🌧️";
  if (weatherId >= 600 && weatherId < 700) return "❄️";
  if (weatherId >= 700 && weatherId < 800) return "🌫️";

  return "☀️";
}

// WEEKLY EMOJI (always day icons)
export function getWeeklyEmoji(weatherId) {
  if (!weatherId) return "❓";

  if (weatherId === 800) return "☀️";
  if (weatherId > 800) return "⛅";
  if (weatherId >= 200 && weatherId < 300) return "⛈️";
  if (weatherId >= 300 && weatherId < 600) return "🌧️";
  if (weatherId >= 600 && weatherId < 700) return "❄️";
  if (weatherId >= 700 && weatherId < 800) return "🌫️";

  return "☀️";
}
