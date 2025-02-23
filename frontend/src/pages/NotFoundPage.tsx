import React from 'react';
import {useTranslation} from "react-i18next";

const NotFoundPage: React.FC = () => {
	const {t} = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#36393F] text-white">
      <h1 className="text-4xl font-bold mb-4">{t('notFoundPage.title404')}</h1>
      <p className="text-lg text-gray-400">{t('notFoundPage.description')}</p>
		</div>
  );
};

export default NotFoundPage;