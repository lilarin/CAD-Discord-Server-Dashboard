import React, {useEffect, useState} from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Categories from "@/pages/Disciplines.tsx";
import Groups from "@/pages/Groups";
import Users from "@/pages/Users";
import Events from "@/pages/Events";
import Logs from "@/pages/Logs";
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
					<Route path="/groups" element={<ProtectedRoute><Groups/></ProtectedRoute>}/>
					<Route path="/users" element={<ProtectedRoute><Users/></ProtectedRoute>}/>
					<Route path="/events" element={<ProtectedRoute><Events/></ProtectedRoute>}/>
					<Route path="/logs" element={<ProtectedRoute><Logs/></ProtectedRoute>}/>
					<Route path="*" element={<NotFoundPage/>}/>
				</Routes>
			</AuthProvider>
		</BrowserRouter>
	);
};

export default App;