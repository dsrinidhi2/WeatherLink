export default function getBackgroundForWeatherCode(code, sunrise, sunset) {
  const now = Date.now();
  const isNight = now < sunrise * 1000 || now > sunset * 1000;

  if (code >= 200 && code < 300)
    return isNight
      ? "/backgrounds/night-thunder.gif"
      : "/backgrounds/day-thunder.gif";

  if (code >= 300 && code < 400)
    return isNight
      ? "/backgrounds/night-rain.gif"
      : "/backgrounds/day-rain.gif";

  if (code >= 500 && code < 600)
    return isNight
      ? "/backgrounds/night-rain.gif"
      : "/backgrounds/day-rain.gif";

  if (code >= 600 && code < 700)
    return isNight
      ? "/backgrounds/night-snow.gif"
      : "/backgrounds/day-snow.gif";

  if (code >= 700 && code < 800)
    return isNight
      ? "/backgrounds/night-fog.gif"
      : "/backgrounds/day-fog.gif";

  if (code === 800)
    return isNight
      ? "/backgrounds/night-clear.gif"
      : "/backgrounds/day-clear.gif";

  if (code > 800)
    return isNight
      ? "/backgrounds/night-clouds.gif"
      : "/backgrounds/day-clouds.gif";

  return "/backgrounds/day-clear.gif";
}
