'use client'

import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import { use, useEffect, useState } from 'react'


export default function Form() {
  const { register, handleSubmit, setValue } = useForm()
  const router = useRouter()
  const {selectedDate, selectedTimeslot, selectedPackage,selectedRoom} = router.query

  useEffect(()=>{

  })
  useEffect(()=>{
    if(selectedPackage)
      setValue('partyPackage', selectedPackage)
    if(selectedDate)
      setValue('partyDate', selectedDate)
    if(selectedTimeslot)
      setValue('partyTimeslot', selectedTimeslot)
    if(selectedRoom)
      setValue('partyRoom', selectedRoom)
  },[selectedDate, selectedTimeslot, selectedPackage,selectedRoom])

  const onSubmit = (data) => {
    console.log('Form Data:', data)
    // You can send this data to your backend here
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="text-xl font-bold  mb-8">
      <h1 className="text-3xl font-bold text-pink-600 mb-2">🎉 Party Booking Form</h1>
      <p> </p>

      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded shadow-md"
      >
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Party Date</label>
          <input
            // type="date"
            {...register('partyDate', { required: true })}
            className="w-full p-2 border rounded-md cursor-not-allowed"
          />
        </div>
        {/* Package */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Party Package</label>
          <select
            {...register('partyPackage', { required: true })}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select a package</option>
            <option value="Solar">Solar</option>
            <option value="Galaxy">Galaxy</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Party Timeslot</label>
          <select
            {...register('partyTimeslot', { required: true })}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select a Timeslot</option>
            <option value="Solar">Solar</option>
            <option value="Galaxy">Galaxy</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input
            type="text"
            {...register('firstName', { required: true })}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            type="text"
            {...register('lastName', { required: true })}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            {...register('email', { required: true })}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            {...register('phone', { required: true })}
            className="w-full p-2 border rounded-md"
          />
        </div>

        

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Celebrant's Name</label>
          <input
            type="text"
            {...register('celebrantName', { required: true })}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age Turning</label>
          <input
            type="number"
            {...register('age', { required: true })}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Number of Kids</label>
          <input
            type='number'
            className="w-full p-2 border rounded-md"
            defaultValue={8}
            max={10}
            {...register('kidsCapacity')}
            />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Number of Adults</label>
          <input
            type='number'
            className="w-full p-2 border rounded-md"
            max={10}
            defaultValue={8}
            {...register('kidsCapacity')}
            />
        </div>

        <div className="">
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select
            {...register('gender', { required: true })}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select gender</option>
            <option value="Girl">Girl</option>
            <option value="Boy">Boy</option>
          </select>
        </div>

        {/* <div className='md:col-span-2'>
          <label className=''>Add-On</label>
          <select {...register('addons', {required: false})}
            className = ''>
            
          </select>
          <option value=''> Pizza </option>
          <optioin value=''> Balloons</optioin>

        </div> */}

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
          >
            Submit Booking
          </button>
        </div>
      </form>
    </div>
  )
}
