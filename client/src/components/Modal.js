' use client '

import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
InformationCircleIcon

export default function Modal({ message }) {
  const [isOpen, setIsOpen] = useState(false)

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)

  return (
    <>
      <button
        type="button"
        className="mt-2 text-sm text-blue-600"
        onClick={open}
      >
        <InformationCircleIcon className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
          {/* Modal */}
          <div
            onClick={close}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="w-full max-w-md rounded-xl bg-white/10 p-6 text-white backdrop-blur-2xl"
              onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
            >
              <h3 className="text-lg font-semibold">More Information</h3>
              <p className="mt-2 text-sm text-white/80">{message}</p>
              <div className="mt-4">
                <button
                  onClick={close}
                  className="rounded bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 focus:outline-none"
                >
                  Got it, thanks!
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
