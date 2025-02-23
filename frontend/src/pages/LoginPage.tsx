import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ComponentLoadingSpinner } from '@/components/LoadingSpinner';
import {useTranslation} from "react-i18next";

const LoginPage: React.FC = () => {
  const { signInWithDiscord, loading } = useAuth();
	const {t} = useTranslation();

  if (loading) {
    return <ComponentLoadingSpinner />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#36393F] text-white">
      <h2 className="text-2xl mb-4">{t('loginPage.title')}</h2>
      <p className="mb-5 text-gray-400 text-center">
        {t('loginPage.description').split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            <br/>
          </React.Fragment>
        ))}
      </p>
      <button
        onClick={signInWithDiscord}
        className="bg-[#5865F2] hover:bg-[#4c56d9] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300"
        disabled={loading}
      >
        {loading ? t('loginPage.loadingButton') : t('loginPage.loginButton')}
      </button>
    </div>
  );
};

export default LoginPage;