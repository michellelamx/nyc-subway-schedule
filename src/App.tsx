import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from './select'
import './styles/app.css'
import { parseISO, format, set } from 'date-fns'
import React, { useEffect, useState } from 'react'

interface Station {
  id: number
  name: string
}

interface ArrivalTimes {
  id: number
  time: string
}

export default function App() {
  const [stations, setStations] = useState<Station[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [northArrivalTimes, setNorthArrivalTimes] = useState<string[]>([])
  const [southArrivalTimes, setSouthArrivalTimes] = useState<string[]>([])

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/jonthornton/MTAPI/master/data/stations.json')
      .then((res) => res.json())
      .then((data) => {
        const stationsArray = Object.entries(data).map(([id, station]) => ({
          id: Number(id),
          name: (station as Station).name,
        }))
        stationsArray.sort((a, b) => a.name.localeCompare(b.name))
        setStations(stationsArray)
        console.log('Stations set:', stationsArray)
      })
  }, [])

  const fetchArrivalTimes = ({ id }: { id: number }) => {
    setIsLoading(true)
    const fetchUrl = `https://cors-anywhere.herokuapp.com/https://api.wheresthefuckingtrain.com/by-id/${id}`
    fetch(fetchUrl)
      .then((res) => res.json())
      .then((data) => {
        const arrivalsObject = data.data[0]
        const northArrivals = arrivalsObject.N.map((arrivalTime: ArrivalTimes) => arrivalTime.time)
        const southArrivals = arrivalsObject.S.map((arrivalTime: ArrivalTimes) => arrivalTime.time)
        setNorthArrivalTimes(northArrivals)
        setSouthArrivalTimes(southArrivals)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching arrival times:', error)
      })
  }

  const handleValueChange = (value: string) => {
    setIsLoading(true)
    const selectedStation = stations.find(station => station.name === value)
    if (selectedStation) {
      fetchArrivalTimes({ id: selectedStation.id })
    }
  }

  return (
    <>
      <h1>NYC Subway Arrival Times</h1>
      <div className='content-wrapper'>
        <div className='stations'>
          <h2>Choose a station:</h2>
          <div className='stations-list'>
            <Select onValueChange={handleValueChange}>
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Select a station' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {stations.map((station) => (
                    <SelectItem
                      key={station.id}
                      value={station.name}
                    >
                      {station.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className='schedule'>
          {isLoading ? (
            <div className='loader'>
              <div className='loading-ellipsis'>
                <div /><div /><div /><div />
              </div>
            </div>
          ) : (
            <>
              <div className='arrival-times'>
                {northArrivalTimes.length > 0 && (
                  <>
                    <h2>Northbound Arrival Times:</h2>
                    {northArrivalTimes.map((time) => {
                      const dateObject = parseISO(time);
                      const formattedTime = format(dateObject, 'h:mm a');
                      return <div key={time} className='time'>{formattedTime}</div>;
                    })}
                  </>
                )}
              </div>
              <div className='arrival-times'>
                {southArrivalTimes.length > 0 && (
                  <>
                    <h2>Southbound Arrival Times:</h2>
                    {southArrivalTimes.map((time) => {
                      const dateObject = parseISO(time);
                      const formattedTime = format(dateObject, 'h:mm a');
                      return <div key={time} className='time'>{formattedTime}</div>;
                    })}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
