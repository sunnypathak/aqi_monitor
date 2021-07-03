import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { LineChart, XAxis, YAxis, Line, Tooltip } from 'recharts';

export default function AqiMonitor() {
  const [aqiDataObj, setAqiDataObj] = useState({});
  const [lineData, setLineData] = useState([]);

  const WS_base_url = 'wss://city-ws.herokuapp.com/';
  let tempDataObj = { ...aqiDataObj };

  const fetchAqiData = () => {
    const socket = new WebSocket(WS_base_url);

    socket.onopen = () => {
      console.log('connected');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      data.forEach(({ city, aqi }) => {
        const tempObj = {
          aqi: aqi.toFixed(2),
          time: moment().format('LTS'),
          timeStamp: Date.now(),
        };

        tempDataObj[city] = [tempObj];

        if (city === 'Mumbai') {
          if (lineData.length === 6) {
            const tempArr = [...lineData];
            tempArr.shift();
            setLineData([...tempArr]);
          }
          setLineData((currentData) => [...currentData, tempObj]);
        }
      });

      setAqiDataObj({ ...tempDataObj });
    };
    socket.close = () => {
      console.log('closed');
    };
  };

  const getClassName = (aqi) => {
    if (aqi >= 0 && aqi <= 50) {
      return 'good';
    } else if (aqi >= 51 && aqi <= 100) {
      return 'satisfactory';
    } else if (aqi >= 101 && aqi <= 200) {
      return 'moderate';
    } else if (aqi >= 201 && aqi <= 300) {
      return 'poor';
    } else if (aqi >= 301 && aqi <= 400) {
      return 'very-poor';
    } else {
      return 'severe';
    }
  };

  useEffect(() => {
    fetchAqiData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <table border={1}>
        <thead>
          <tr>
            <th width="20%">City</th>
            <th width="30%">Current AQI</th>
            <th width="40%">Last updated</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(aqiDataObj).map((key, index) => (
            <tr key={index}>
              <td> {key} </td>
              <td
                className={`aqi-level ${getClassName(
                  aqiDataObj[key][aqiDataObj[key].length - 1].aqi
                )}`}
              >
                <b>{aqiDataObj[key][aqiDataObj[key].length - 1].aqi}</b>
              </td>
              <td>
                {moment(
                  aqiDataObj[key][aqiDataObj[key].length - 1].timeStamp
                ).fromNow()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h1>Mumbai</h1>
      <LineChart width={1300} height={300} data={lineData}>
        <XAxis dataKey="time" />
        <YAxis dataKey="aqi" domain={[177.5, 185]} />
        <Tooltip />
        <Line dataKey="aqi" />
      </LineChart>
    </div>
  );
}
