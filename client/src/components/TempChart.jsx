import React from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import { Chart } from "react-chartjs-2";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function TempChart({ hourly=[] }){
  if(!hourly || hourly.length===0) return null;
  const slice = hourly.slice(0, 24);
  const labels = slice.map(h=>h.hourLabel);
  const temps = slice.map(h=>Number(String(h.temperature).replace("°C","")));
  const data = {
    labels,
    datasets:[
      { label:"Temp °C", data:temps, borderColor:"#0b74ff", backgroundColor:"rgba(11,116,255,0.15)", tension:0.3 }
    ]
  };
  const options = {
    responsive:true,
    plugins:{legend:{display:false}},
    scales:{
      x:{ ticks:{ color:"#fff" }, grid:{ display:false } },
      y:{ ticks:{ color:"#fff" }, grid:{ display:false } }
    },
    maintainAspectRatio:false
  };
  return (
    <div style={{marginTop:22, padding:12, borderRadius:12}}>
      <h3 style={{color:"#fff", textAlign:"center"}}>Temperature</h3>
      <div style={{height:260}}>
        <Chart type="line" data={data} options={options} />
      </div>
    </div>
  );
}
