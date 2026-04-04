import React from "react";
import "./skeletons.css";
export default function SkeletonDetails(){ return (
  <div className="card-glass" style={{padding:12, marginTop:16}}>
    <div className="sk-line short"></div>
    <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginTop:12}}>
      <div className="sk-box"><div className="sk-line short"></div><div className="sk-line tiny"></div></div>
      <div className="sk-box"><div className="sk-line short"></div><div className="sk-line tiny"></div></div>
      <div className="sk-box"><div className="sk-line short"></div><div className="sk-line tiny"></div></div>
    </div>
  </div>
);}
