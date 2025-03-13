import React, {useEffect, useState} from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Categories from "@/pages/Disciplines.tsx";
import Roles from "@/pages/Roles.tsx";
import Users from "@/pages/Users";
import Queues from "@/pages/Queues.tsx";
import Logs from "@/pages/Logs";
import Settings from "@/pages/Settings";
import {Toaster} from 'react-hot-toast';
import {AuthProvider} from '@/contexts/AuthContext';
import LoginPage from '@/pages/LoginPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import NotFoundPage from "@/pages/NotFoundPage";
import PCViewOnlyPage from "@/components/PCViewOnly";
import HomePage from "@/pages/HomePage";
import '@/i18n';

const App = () => {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const userAgent = navigator.userAgent.toLowerCase();
		const mobileKeywords = ['android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];

		const isMobileDevice = mobileKeywords.some(keyword => userAgent.includes(keyword));
		setIsMobile(isMobileDevice);
	}, []);

	if (isMobile) {
		return <PCViewOnlyPage/>;
	}

	return (
		<BrowserRouter>
			<AuthProvider>
				<Toaster/>
				<Routes>
					<Route path="/login" element={<LoginPage/>}/>
					<Route path="/" element={<ProtectedRoute><HomePage/></ProtectedRoute>}/>
					<Route path="/categories" element={<ProtectedRoute><Categories/></ProtectedRoute>}/>
					<Route path="/roles" element={<ProtectedRoute><Roles/></ProtectedRoute>}/>
					<Route path="/users" element={<ProtectedRoute><Users/></ProtectedRoute>}/>
					<Route path="/queues" element={<ProtectedRoute><Queues/></ProtectedRoute>}/>
					<Route path="/logs" element={<ProtectedRoute><Logs/></ProtectedRoute>}/>
					<Route path="/settings" element={<ProtectedRoute><Settings/></ProtectedRoute>}/>
					<Route path="*" element={<NotFoundPage/>}/>
				</Routes>
			</AuthProvider>
		</BrowserRouter>
	);
};

export default App;