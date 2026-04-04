import React from "react";
import "./skeletons.css";
export default function SkeletonGraph(){ return (
  <div className="card-glass" style={{padding:12, marginTop:16}}>
    <div className="sk-line short"></div>
    <div style={{display:"flex", gap:10, alignItems:"flex-end", height:120, marginTop:12}}>
      <div className="sk-bar"></div><div className="sk-bar tall"></div><div className="sk-bar medium"></div><div className="sk-bar small"></div>
    </div>
  </div>
);}
