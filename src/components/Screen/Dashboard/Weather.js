import React, { useEffect, useState } from "react";
import {
  LuCloud,
  LuCloudRain,
  LuCloudSnow,
  LuCloudSun,
  LuSun,
} from "react-icons/lu";
import { useIntl } from "react-intl";

const WEATHER_API_KEY = process.env.REACT_APP_WEATHER;
const WEATHER_CITY = "Ho Chi Minh City";
const DEFAULT_WEATHER = {
  location: {
    name: WEATHER_CITY,
  },
  current: {
    temp_c: 0,
    is_day: 1,
    condition: {
      code: 1000,
      text: "",
    },
  },
};

const getWeatherIcon = (code, isDay, size = 32) => {
  const style = { fontSize: size };
  if (code === 1000) {
    return isDay ? <LuSun style={style} /> : <LuCloud style={style} />;
  }
  if (code <= 1009) return <LuCloudSun style={style} />;
  if (code <= 1030) return <LuCloud style={style} />;
  if (code <= 1201) return <LuCloudRain style={style} />;
  if (code <= 1282) return <LuCloudSnow style={style} />;
  return <LuCloudSun style={style} />;
};

const getWeatherBg = (code, isDay) => {
  if (!isDay) return "linear-gradient(135deg, rgba(15, 23, 42, 1) 0%, rgba(30, 58, 95, 1) 100%)";
  if (code === 1000) {
    return "linear-gradient(135deg, rgba(14, 165, 233, 1) 0%, rgba(56, 189, 248, 1) 60%, rgba(186, 230, 253, 1) 100%)";
  }
  if (code <= 1009) return "linear-gradient(135deg, rgba(2, 132, 199, 1) 0%, rgba(125, 211, 252, 1) 100%)";
  if (code <= 1030) return "linear-gradient(135deg, rgba(100, 116, 139, 1) 0%, rgba(148, 163, 184, 1) 100%)";
  if (code <= 1201) return "linear-gradient(135deg, rgba(51, 65, 85, 1) 0%, rgba(71, 85, 105, 1) 100%)";
  return "linear-gradient(135deg, rgba(14, 165, 233, 1) 0%, rgba(125, 211, 252, 1) 100%)";
};

const WeatherWidget = () => {
  const lang = useIntl();
  const [weather, setWeather] = useState(DEFAULT_WEATHER);
  const weatherLang = lang.locale.startsWith("vi") ? "vi" : "en";

  useEffect(() => {

    (async () => {


      const url = `https://api.weatherapi.com/v1/forecast.json?key=${process.env.REACT_APP_WEATHER}&q=${10.924961214727357},${106.62117715081975}&days=7&aqi=no&alerts=no&lang=${weatherLang}`;
      const res = await fetch(url);
      const data = await res.json();
      console.log(data);
      setWeather(data);
    })();

  }, [weatherLang]);

  // const { current, location } = weather;
  // const code = current.condition?.code || 30;
  // const isDay = current.is_day === 1;

  return (
    <div
      className="DAT_Weather_Card"
      data-state="ready"
      style={{ background: getWeatherBg(weather?.current?.condition?.code, weather?.current?.is_day) }}
    >
      <div className="DAT_Weather_Card_Orb_1" />
      <div className="DAT_Weather_Card_Orb_2" />
      <div className="DAT_Weather_Card_Top">
        <div className="DAT_Weather_Card_Top_Content">
          <div className="DAT_Weather_Card_Top_Content_City">{weather?.location?.name ?? 'HCM'}</div>
          <div className="DAT_Weather_Card_Top_Content_Condition">{weather?.current?.condition?.text ?? 'Có mây'}</div>
        </div>
        <div className="DAT_Weather_Card_Top_Icon">
          {getWeatherIcon(weather?.current?.condition?.code, weather?.current?.is_day)}
        </div>
      </div>

      <div className="DAT_Weather_Card_Temperature">
        {weather?.current?.temp_c ?? '--'}°C
      </div>
    </div>
  );
};

export default WeatherWidget;
