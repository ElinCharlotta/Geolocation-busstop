import { useState, useEffect } from 'react';
import './App.css';

const API_KEY = "df6c54a5-1316-4c07-a890-000587189288";

function App() {
  const [position, setPosition] = useState<GeolocationCoordinates>();
  const [nearbyStops, setNearbyStops] = useState<{ StopLocation: { name: string, dist: number, lon: number, lat: number, extId: number } }[]>([]);
  const [selectedStop, setSelectedStop] = useState<{ name: string, id: number }>();
  const [depatures, setDepartures] = useState<{ name: string, id: number, time: number, direction: string }[]>([]);

  useEffect(() => {
    if (position) {
      getNearByStops();
    }
  }, [position]);

  function getPosition() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        console.log(position);
        setPosition(position.coords);
      });
    }
  }

  async function getNearByStops() {
    const response = await fetch(`https://api.resrobot.se/v2.1/location.nearbystops?originCoordLat=${position?.latitude}&originCoordLong=${position?.longitude}&format=json&accessId=${API_KEY}`);
    const data = await response.json();

    console.log(data);
    
    setNearbyStops(data.stopLocationOrCoordLocation );
  }
  async function getTimetableForStop(id: number) {
    const response = await fetch(`https://api.resrobot.se/v2.1/departureBoard?id=${id}&format=json&accessId=${API_KEY}`);
    const data = await response.json();
    console.log(data);
    setDepartures(data.Departure ); //sparar info om avångar 
  }

  function handleStopSelection({ name, id }: { name: string, id: number }) {
    setSelectedStop({ name, id }); // här sparar jag valet
    getTimetableForStop(id); // här hämtar jag avgångar för valt stopp
    
  }

  function showNearByBusStops() {
    return nearbyStops.map((busStop, index) => (
      <li
        className='listBusStops'
        key={index}
        onClick={() => handleStopSelection({ name: busStop.StopLocation.name, id: busStop.StopLocation.extId })}
        style={{ cursor: 'pointer', color: selectedStop?.id === busStop.StopLocation.extId ? '#95afd6' : 'black' }}
      >
        {busStop.StopLocation.name} - {busStop.StopLocation.dist} meter bort
      </li>
    ));
  }


    function showDepartures() {
      return depatures.map((departure, index) => (
        <li className='listDepatures' key={index}>

          {departure.time} - {departure.direction} - {departure.name}
          
        </li>
      ));
    }
  return (
    <main className='content'>
      <button className='position-button' onClick={getPosition}>Hämta position</button>
      <p></p>
 

      <ul>
        {showNearByBusStops()}
        </ul>
        {selectedStop && (
          <div>
            <h2>
              Avgångar från {selectedStop.name}
            </h2>
            <ul>
              {showDepartures()}
              </ul>
              </div>
        )}
   
    </main>
  );
}

export default App;
