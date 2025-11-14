
import React from 'react';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 w-full">
      <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-cyan-400"></div>
      <p className="mt-4 text-slate-300 text-center">{message}</p>
    </div>
  );
};

export default Loader;
