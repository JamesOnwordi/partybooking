'use client'

import { useForm } from 'react-hook-form'

export default function Form() {
  const { register, handleSubmit } = useForm()

  const onSubmit = (data) => {
    console.log('Form Data:', data)
    // You can send this data to your backend here
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-pink-600 mb-8">🎉 Party Booking Form</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded shadow-md"
      >
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Party Date</label>
          <input
            type="date"
            {...register('partyDate', { required: true })}
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

        <div className="md:col-span-2">
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
