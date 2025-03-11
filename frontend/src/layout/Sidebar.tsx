import {Link, useLocation} from "react-router-dom";
import {cn} from "@/lib/utils";

import HomePageIcon from "@/assets/icons/index.svg"
import DisciplinesIcon from "@/assets/icons/disciplines.svg";
import GroupsIcon from "@/assets/icons/groups.svg";
import UsersIcon from "@/assets/icons/users.svg";
import EventsIcon from "@/assets/icons/events.svg";
import LogsIcon from "@/assets/icons/logs.svg";
import SettingsIcon from "@/assets/icons/settings.svg";
import {useTranslation} from "react-i18next";

const baseNavigation = [
	{name: "sidebar.dashboard", href: "/", icon: HomePageIcon},
	{name: "sidebar.categories", href: "/categories", icon: DisciplinesIcon},
	{name: "sidebar.groups", href: "/groups", icon: GroupsIcon},
	{name: "sidebar.users", href: "/users", icon: UsersIcon},
	{name: "sidebar.queues", href: "/queues", icon: EventsIcon},
	{name: "sidebar.logs", href: "/logs", icon: LogsIcon},
];

const settingsNavigation = [
	{name: "sidebar.settings", href: "/settings", icon: SettingsIcon},
]

interface SidebarProps {
	isAdmin: boolean | null;
}

export const Sidebar: React.FC<SidebarProps> = ({isAdmin}) => {
	const location = useLocation();
	const {t} = useTranslation();

	const navigation = isAdmin ? [...baseNavigation, ...settingsNavigation] : baseNavigation;

	return (
		<div className="w-1/6 bg-[#2F3136]">
			<div className="px-4 pb-5 pt-6">
				<h1 className="text-lg font-semibold text-gray-200 text-center pb-2">{t("sidebar.title")}</h1>
				<div className="mt-3 border-t border-gray-600"></div>
			</div>
			<div className="sticky top-2 flex flex-1 flex-col gap-3 pt-3 pl-4 pr-4">
				{navigation.map((item) => (
					<Link
						key={item.name}
						to={item.href}
						className={cn(
							"flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors",
							location.pathname === item.href
								? "bg-[#36393F] text-gray-200"
								: "text-gray-400 hover:bg-[#36393F] hover:text-gray-200 hover:rounded transition-all duration-200"
						)}
					>
						<img src={item.icon} alt={t(item.name)} className="h-4 w-4"/>
						{t(item.name)}
					</Link>
				))}
			</div>
		</div>
	);
};