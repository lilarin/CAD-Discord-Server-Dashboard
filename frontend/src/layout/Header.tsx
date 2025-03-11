import React from "react";
import {UserCircle} from "lucide-react";
import {Button} from "@/components/Button.tsx";
import LogOutIcon from "@/assets/icons/logout.svg";
import {useAuth} from "@/contexts/AuthContext";
import {useTranslation} from "react-i18next";

interface HeaderProps {
	userDisplayName: string | null;
}

export const Header: React.FC<HeaderProps> = ({userDisplayName}) => {
	const {signOut, loading, user} = useAuth();
	const {t, i18n} = useTranslation();
	const currentLanguage = i18n.language;

	const handleSignOut = async () => {
		await signOut();
	};

	const toggleLanguage = () => {
		const newLanguage = currentLanguage === 'uk' ? 'en' : 'uk';
		i18n.changeLanguage(newLanguage);
	};

	const userName = () => {
		if (userDisplayName) {
			return userDisplayName;
		}
		return user?.user_metadata?.full_name || 'User';
	};

	const userAvatarUrl = () => {
		if (user?.user_metadata?.avatar_url) {
			return user.user_metadata.avatar_url;
		}
		return null;
	};

	const truncateName = (name: string, maxLength: number) => {
		if (name.length <= maxLength) {
			return name;
		}
		return name.slice(0, maxLength - 3) + "...";
	};

	return (
		<header className="bg-[#292B2F]">
			<div className="flex h-14 items-center justify-between">
				<div className="w-1/6 flex justify-center">
					<div className="flex items-center gap-3">
						{userAvatarUrl() ? (
							<img
								src={userAvatarUrl()}
								alt={t("header.language")}
								className="rounded-full h-8 w-8"
							/>
						) : (
							<UserCircle className="h-8 w-8 text-gray-400"/>
						)}
						<div className="text-sm overflow-hidden">
							<p
								className="font-medium text-gray-200 whitespace-nowrap text-ellipsis overflow-hidden">{!userDisplayName ? t("protectedRoute.loading") : truncateName(userName(), 22)}</p>
						</div>
					</div>
				</div>
				<div className="pr-3 flex justify-end items-center">
					<Button
						variant="ghost"
						size="default"
						className="text-gray-400 hover:text-gray-200 rounded flex items-center gap-2 transition-all duration-300"
						onClick={toggleLanguage}
					>
						{t(`header.language`)}
					</Button>
					<Button
						variant="ghost"
						size="default"
						className="text-gray-400 hover:text-gray-200 rounded flex items-center gap-2 transition-all duration-300"
						onClick={handleSignOut}
						disabled={loading}
					>
						<img src={LogOutIcon} alt={t("header.signOut")} className="w-5 h-5 cursor-pointer"/>
						{loading ? t("loginPage.loadingButton") : t("header.signOut")}
					</Button>
				</div>
			</div>
		</header>
	);
};