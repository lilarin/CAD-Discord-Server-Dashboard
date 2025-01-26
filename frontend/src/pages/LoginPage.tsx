import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ComponentLoadingSpinner } from '@/components/LoadingSpinner';

const LoginPage: React.FC = () => {
  const { signInWithDiscord, loading } = useAuth();

  if (loading) {
    return <ComponentLoadingSpinner />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#36393F] text-white">
      <h2 className="text-2xl mb-4">Для доступу до сайту необхідно авторизуватися</h2>
      <p className="mb-8 text-gray-400 text-center">
        Цей сайт використовує Discord OAuth2 для ідентифікації користувачів.<br />
        Натисніть кнопку нижче, щоб увійти через свій акаунт Discord.
      </p>
      <button
        onClick={signInWithDiscord}
        className="bg-[#5865F2] hover:bg-[#4c56d9] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        disabled={loading}
      >
        {loading ? 'Завантаження...' : 'Увійти через Discord'}
      </button>
    </div>
  );
};

export default LoginPage;