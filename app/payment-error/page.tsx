import React from 'react';

const PaymentError = () => {
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Transaction Error</h2>
      <p className="text-center text-gray-700 mb-4">
        Sorry, there was an error completing your transaction. Please try again later.
      </p>
      <button
        onClick={() => window.location.href = '/donate'}
        className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
      >
        Go Back
      </button>
    </div>
  );
};

export default PaymentError;
