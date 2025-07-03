export default function BookingConfirmation() {
  // This page is intentionally left blank
  // It serves as a confirmation page after booking submission
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {/* <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <img
          src="/images/confirmation.png"
          alt="Booking Confirmation"
          className="w-24 h-24 mx-auto mb-4"
        />
      </div> */}
      <h1 className="text-3xl font-bold mb-4">Booking Confirmation</h1>
      <p className="text-lg">Your booking has been successfully submitted!</p>
      <p className="text-sm text-gray-500 mt-2">
        Thank you for choosing us for your event!
      </p>
      <h1 className="text-2xl font-semibold mt-8">Payment option</h1>
      <p className="text-lg mt-2">
        Please proceed to the payment page to complete your booking.
      </p>
      <a
        href="/payment"
        className="mt-6 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
      >
        Go to Payment
      </a>
      <p className="text-sm text-gray-500 mt-4">
        If you have any questions, please contact us at{' '}
        <a href="mailto:" className="text-purple-600 hover:underline"></a>
      </p>
    </div>
  )
}
