'use client';
import '../styles/tailwind.css'
import axios from 'axios';
import Calendar from 'react-calendar';
// import '../styles/form.css';
import { use, useEffect, useState } from 'react';
import 'react-calendar/dist/Calendar.css';

export default function CalendarPage() {
  const [date, setDate] = useState(new Date());
  const [minDate] = useState(new Date())
  const [availableTimeslot, setAvailableTimeslot] = useState([])
  
  useEffect(()=>{
    
    
  },[])

  const availableSlot = availableTimeslot.map((timeslot) =>{
    return(
      <>
        <button>
          timeslot
        </button>
      </>
    )
  }
  )
  
  const handleDateChange = (newDate)=>{
    const selectedDate = newDate.toISOString().slice(0,10)
    setDate(selectedDate)

    // axios.get(`http://localhost:3000/${selectedDate}`).then(res=>{
    // setAvailableTimeslot(res.data)
    // console.log(res.data)
    // })
  }

  return (
    <div className="p-8">
      <h1 className="text-xl bg-yellow-400 font-bold mb-4">React Calendar</h1>
      <div className='flex'>

      <Calendar onChange={handleDateChange} minDate={minDate}  value={date} />
      <div>
        Hello
      </div>
      </div>
      <p>{date.now}</p>
      <p className="mt-4"> date: {date.now}</p>
      <p className="mt-4"> date: {minDate.toISOString().slice(0,10)}</p>
      <p className="mt-4">Selected date: {date.toISOString().slice(0,10)}</p>
    </div>
  );
}
