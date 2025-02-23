import React from 'react';
import {Button} from "@/components/Button.tsx";
import LogOutIcon from "@/assets/icons/logout.svg";
import {useAuth} from "@/contexts/AuthContext.tsx";
import {useTranslation} from "react-i18next";

const NoAccessPage: React.FC = () => {
	const { signOut, loading } = useAuth();
	const {t} = useTranslation();

	const handleSignOut = async () => {
	  await signOut();
	};


  return (
	  <div className="flex flex-col items-center justify-center h-screen bg-[#36393F] text-white">
		  <h2 className="text-2xl mb-5">{t('noAccessPage.title')}</h2>
		  <p className="mb-5 text-gray-400 text-center">
			  {t('noAccessPage.description').split('\n').map((line, index) => (
				  <React.Fragment key={index}>
					  {line}
					  <br/>
				  </React.Fragment>
			  ))}
		  </p>
		  <Button
			  variant="ghost"
			  size="default"
			  className="text-gray-400 hover:text-gray-200 rounded flex items-center gap-2 transition-all duration-300"
			  onClick={handleSignOut}
			  disabled={loading}
		  >
			  <img src={LogOutIcon} alt={t('noAccessPage.signOutButton')} className="w-5 h-5 cursor-pointer"/>
			  {loading ? t('button.signOutLoading') : t('noAccessPage.signOutButton')}
		  </Button>
	  </div>
  );
};

export default NoAccessPage;
