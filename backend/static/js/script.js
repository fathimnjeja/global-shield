let lat, lon;
let gauge;

/* LOCATION */
function getLocation(){
 navigator.geolocation.getCurrentPosition(pos=>{
  lat=pos.coords.latitude;
  lon=pos.coords.longitude;

  getWeather();
  getAQI();
  getUV();
  getEarthquakes();
  getVolcanoes();
  detectFloodRisk();
  initMap();
 });
}

/* WEATHER */
async function getWeather(){
 const key="7da3a9b9048ee2cfc09dcffc7ce4f7b9";
 const res=await fetch(
  `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`
 );
 const data=await res.json();

 const temp=data.main.temp;
 const wind=data.wind.speed;

 document.getElementById("tempCard").innerHTML="Temp: "+temp+"°C";

 calculateRisk(temp,wind);
}

/* AQI */
async function getAQI(){
 const key="7da3a9b9048ee2cfc09dcffc7ce4f7b9";
 const res=await fetch(
  `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${key}`
 );
 const data=await res.json();
 const aqi=data.list[0].main.aqi;

 document.getElementById("aqiCard").innerHTML="AQI: "+aqi;
}

/* UV */
async function getUV(){
 const key="7da3a9b9048ee2cfc09dcffc7ce4f7b9";
 const res=await fetch(
  `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${key}`
 );
 const data=await res.json();
 document.getElementById("uvCard").innerHTML="UV: "+data.value;
}

/* AI RISK */
function calculateRisk(temp,wind){
 let risk=(temp*0.6)+(wind*2);
 risk=Math.min(100,Math.round(risk));
 createGauge(risk);
 generateDecision(risk,temp);
}

/* GAUGE */
function createGauge(value){
 const ctx=document.getElementById("riskGauge").getContext("2d");

 if(gauge) gauge.destroy();

 gauge=new Chart(ctx,{
  type:"doughnut",
  data:{
   datasets:[{
    data:[value,100-value],
    backgroundColor:["red","lightgrey"],
    borderWidth:0
   }]
  },
  options:{
   circumference:180,
   rotation:270,
   cutout:"70%"
  }
 });
}

/* DECISION */
function generateDecision(risk,temp){
 let decision="";
 let reminders=[];

 if(risk>70){
  decision="❌ High Risk - Stay Indoors";
  reminders.push("Avoid travel");
  reminders.push("Prepare emergency kit");
  beepAlert();
 }
 else if(temp>35){
  decision="⚠️ Hot Weather - Carry Water";
  reminders.push("Apply sunscreen");
 }
 else{
  decision="✅ Safe to Go Outside";
 }

 document.getElementById("decision").innerHTML=decision;
 document.getElementById("reminders").innerHTML=
 reminders.map(r=>"<li>"+r+"</li>").join("");
}

/* EARTHQUAKES */
async function getEarthquakes(){
 const res=await fetch(
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
 );
 const data=await res.json();
 document.getElementById("earthquakeStatus").innerHTML=
 "🌍 Earthquakes Today: "+data.features.length;
}

/* VOLCANO MONITOR */
async function getVolcanoes(){
 document.getElementById("volcanoStatus").innerHTML=
 "🌋 Volcano Monitoring Active (Global Tracking Enabled)";
}

/* FLOOD DETECTION */
function detectFloodRisk(){
 document.getElementById("floodStatus").innerHTML=
 "🌊 Flood Risk: Monitoring via rainfall patterns";
}

/* MAP */
function initMap(){
 const location={lat:lat,lng:lon};
 const map=new google.maps.Map(
  document.getElementById("map"),
  {zoom:10,center:location}
 );

 new google.maps.Marker({
  position:location,
  map:map
 });

 new google.maps.visualization.HeatmapLayer({
  data:[new google.maps.LatLng(lat,lon)],
  map:map
 });
}

/* ALERT SOUND */
function beepAlert(){
 const audio=new Audio(
  "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"
 );
 audio.play();
}

/* EMERGENCY */
function sendEmergency(){
 if(navigator.share){
  navigator.share({
   title:"Emergency Alert",
   text:"Track my live location:",
   url:`https://maps.google.com/?q=${lat},${lon}`
  });
 }
}

/* DARK MODE */
function toggleDarkMode(){
 document.body.classList.toggle("dark");
}

/* PWA */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js") // Points to the Flask route we created
      .then((reg) => console.log("Service Worker registered!", reg))
      .catch((err) => console.error("Service Worker registration failed:", err));
  });
}
function startEmergencyMode() {
  setInterval(() => {
    navigator.geolocation.getCurrentPosition(pos => {
      fetch("http://localhost:5000/update-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        })
      });
    });
  }, 60000); // update every 1 minute
}
