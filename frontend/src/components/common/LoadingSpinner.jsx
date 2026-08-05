import React from 'react';

const LoadingSpinner = ({ fullScreen = false }) => {
  const spinnerContent = (
    <div className="flex flex-col items-center justify-center">
      <div className="flex space-x-1.5 justify-center items-center">
        <div className="w-2.5 h-2.5 bg-[#1DB954] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2.5 h-2.5 bg-[#FF0000] rounded-full animate-bounce"></div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex flex-col justify-center items-center z-[9999] animate-fade-in">
        {spinnerContent}
        <p className="text-white mt-4 text-xs font-bold tracking-widest uppercase opacity-80 animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="inline-flex justify-center items-center py-2">
      {spinnerContent}
    </div>
  );
};

export default LoadingSpinner;
