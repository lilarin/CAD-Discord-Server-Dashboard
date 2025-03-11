import React, {useEffect, useState} from 'react';
import {Navigate, useLocation} from 'react-router-dom';
import {useAuth} from '@/contexts/AuthContext';
import {ComponentLoadingSpinner} from '@/components/LoadingSpinner';
import {getUser} from '@/lib/api';
import NoAccessPage from '@/pages/NoAccessPage';
import {Header} from '@/layout/Header';
import {Sidebar} from '@/layout/Sidebar';
import {User} from '@/lib/types';

interface ProtectedRouteProps {
	children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({children}) => {
	const {user, loading} = useAuth();
	const location = useLocation();
	const [userGroup, setUserGroup] = useState<string | null>(null);
	const [userDisplayName, setUserDisplayName] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		const fetchUserData = async () => {
			if (!user?.user_metadata?.provider_id) {
				setIsLoading(false);
				return;
			}

			try {
				const fetchedUser = await getUser(user.user_metadata.provider_id);
				setUserGroup(fetchedUser.group || null);
				setUserDisplayName(fetchedUser.name || null);
			} catch (error) {
				console.error("Error fetching user data:", error);
				setUserGroup(null);
				setUserDisplayName(null)
			} finally {
				setIsLoading(false);
			}
		};
		setIsLoading(true);
		fetchUserData();
	}, [user?.user_metadata?.provider_id]);


	if (loading || isLoading) {
		return <ComponentLoadingSpinner/>;
	}

	if (!user) {
		return <Navigate to="/login" state={{from: location}} replace/>;
	}

	if (userGroup !== 'staff') {
		return <NoAccessPage/>;
	}

	return (
		<div className="min-h-screen flex flex-col">
			<Header userDisplayName={userDisplayName}/>
			<div className="flex flex-1">
				<Sidebar/>
				<main className="flex-1 bg-[#36393F]">
					{children}
				</main>
			</div>
		</div>
	);
};

export default ProtectedRoute;