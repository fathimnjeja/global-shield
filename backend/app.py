import os
import requests
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

# Load API keys from .env
load_dotenv()
app = Flask(__name__)

API_KEY = os.getenv("WEATHER_API_KEY")
EMERGENCY_NUMBER=os.getenv("EMERGENCY NUMBER")

# Function to generate safety advice based on temperature, AQI, UV, and flood status
def get_safety_advice(temp, aqi, uv, flood_status):
    advice = []

    # Temperature advice
    if temp > 35:
        advice.append("Extreme heat. Stay indoors if possible.")

    # Air quality / Mask advice
    if aqi > 100:
        advice.append("Air quality is poor. Wear an N95 mask.")

    # UV / Sunburn advice
    if uv >= 6:
        advice.append("High UV. Apply sunscreen and wear a hat.")

    # Flood advice
    if flood_status:
        advice.append("FLOOD ALERT: Avoid low-lying areas.")

    return advice

# Route for frontend page
@app.route('/')
def index():
    return render_template('index.html')

# Route to get safety advice as JSON
@app.route('/get_safety', methods=['POST'])
def get_safety():
    # Get city from form (or use GPS in real app)
    city = request.form.get('city')
    
    # 1. Fetch weather data from OpenWeatherMap
    w_url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
    res = requests.get(w_url).json()

    temp = res['main']['temp']
    wind = res['wind']['speed']

    # 2. Mocking AQI, UV, and flood status for this tutorial
    aqi = 150        # Replace with real AQI API for production
    uv = 7           # Replace with real UV API for production
    flood_status = False  # Replace with real flood API for production

    advice = get_safety_advice(temp, aqi, uv, flood_status)

    return jsonify({
        "temp": temp,
        "wind": wind,
        "advice": advice,
        "shelters": ["Central Community Center", "East Side High School"],
        "emergency number":"911"
    })

# Run the app
if __name__ == '__main__':
    app.run(debug=True)