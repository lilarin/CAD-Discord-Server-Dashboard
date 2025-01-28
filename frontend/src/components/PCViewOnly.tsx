import React from 'react';

const PCViewOnlyPage: React.FC = () => {
  return (
	  <div className="flex flex-col items-center justify-center h-screen bg-[#36393F] text-white">
		  <h2 className="text-2xl mb-5">Неможливо відкрити ресурс</h2>
		  <p className="mb-5 text-gray-400 text-center">
			  Вибачте, але панель керування не підтримує перегляд з мобільних пристроїв.
		  </p>
	  </div>
  );
};

export default PCViewOnlyPage;