// src/components/ProtectedRoute.tsx
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ComponentLoadingSpinner } from '@/components/LoadingSpinner';
import { getUser } from '@/lib/api';
import NoAccessPage from '@/pages/NoAccessPage';
import { Header } from '@/layout/Header';
import { Sidebar } from '@/layout/Sidebar';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [userGroup, setUserGroup] = useState<string | null>(null);
  const [isLoadingGroup, setIsLoadingGroup] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserGroup = async () => {
      if (user?.user_metadata?.provider_id) {
        try {
          const fetchedUser = await getUser(user.user_metadata.provider_id);
          console.log(fetchedUser)
          setUserGroup(fetchedUser.group || null);
        } catch (error) {
          console.error("Error fetching user group:", error);
          setUserGroup(null);
        } finally {
          setIsLoadingGroup(false);
        }
      } else {
        setIsLoadingGroup(false);
      }
    };

    fetchUserGroup();
  }, [user]);

  if (loading || isLoadingGroup) {
    return <ComponentLoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (userGroup !== 'staff') {
    return <NoAccessPage />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-[#36393F]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ProtectedRoute;