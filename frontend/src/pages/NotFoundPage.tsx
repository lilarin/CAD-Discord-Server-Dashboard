import React from 'react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#36393F] text-white">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-lg text-gray-400">Тут немає на що дивитись 🤓</p>
		</div>
  );
};

export default NotFoundPage;