import React from 'react';
import {useTranslation} from "react-i18next";

const PCViewOnlyPage: React.FC = () => {
	const {t} = useTranslation();
  return (
	  <div className="flex flex-col items-center justify-center h-screen bg-[#36393F] text-white">
		  <h2 className="text-2xl mb-5">{t('pcViewOnlyPage.title')}</h2>
		  <p className="mb-5 text-gray-400 text-center">
			  {t('pcViewOnlyPage.description')}
		  </p>
	  </div>
  );
};

export default PCViewOnlyPage;