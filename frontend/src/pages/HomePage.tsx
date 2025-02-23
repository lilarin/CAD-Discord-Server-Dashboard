import React from 'react';
import FilterSearchIcon from "@/assets/icons/filter_search.svg";
import HomePageIcon from "@/assets/icons/index.svg";
import RenameIcon from "@/assets/icons/rename.svg";
import EditIcon from "@/assets/icons/edit.svg";
import KickUserIcon from "@/assets/icons/logout.svg";
import CreateRoleIcon from "@/assets/icons/create_role.svg";
import DeleteIcon from "@/assets/icons/delete.svg";
import CreateCategoryIcon from "@/assets/icons/create_category.svg";
import CreateChannelIcon from "@/assets/icons/create_channel.svg";
import HintIcon from "@/assets/icons/hint.svg";
import LogsIcon from "@/assets/icons/logs.svg";
import EventsIcon from "@/assets/icons/events.svg";
import UsersIcon from "@/assets/icons/users.svg";
import GroupsIcon from "@/assets/icons/groups.svg";
import DisciplinesIcon from "@/assets/icons/disciplines.svg";
import {Link} from "react-router-dom";
import { useTranslation } from "react-i18next";

const HomePage = () => {
	const { t } = useTranslation();

	return (
		<div className="container mx-auto px-5 py-5 ">
			<section className="mb-5">
				<h2 className="text-2xl font-semibold text-white mb-4">{t("homePage.mainProvisionsTitle")}</h2>
				<div className="text-gray-300 space-y-3 text-justify">
					<p>
						{t("homePage.mainProvisionsText1")}
					</p>
					<p>
						{t("homePage.mainProvisionsText2")}
					</p>
				</div>
			</section>

			<section className="mb-5">
				<h2 className="text-2xl font-semibold text-white mb-4">{t("homePage.panelSectionsTitle")}</h2>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					<div className="bg-[#2F3136] rounded p-6 hover:bg-[#292b2f] transition-all duration-200 cursor-pointer">
						<div className="flex items-center mb-4">
							<img src={HomePageIcon} alt={t("homePage.sections.dashboard.title")} className="w-8 h-8 mr-3"/>
							<h3 className="text-xl font-semibold text-white">{t("homePage.sections.dashboard.title")}</h3>
						</div>
						<div className="text-gray-300 space-y-2">
							<p>
								{t("homePage.sections.dashboard.description")}
							</p>
						</div>
					</div>

					<Link to="/categories" className="block">
						<div className="bg-[#2F3136] rounded p-6 hover:bg-[#292b2f] transition-all duration-200 cursor-pointer">
							<div className="flex items-center mb-4">
								<img src={DisciplinesIcon} alt={t("homePage.sections.categories.title")} className="w-8 h-8 mr-3"/>
								<h3 className="text-xl font-semibold text-white">{t("homePage.sections.categories.title")}</h3>
							</div>
							<div className="text-gray-300 space-y-2">
								<p>
									{t("homePage.sections.categories.description")}
								</p>
							</div>
						</div>
					</Link>

					<Link to="/groups" className="block">
						<div className="bg-[#2F3136] rounded p-6 hover:bg-[#292b2f] transition-all duration-200 cursor-pointer">
							<div className="flex items-center mb-4">
								<img src={GroupsIcon} alt={t("homePage.sections.groups.title")} className="w-8 h-8 mr-3"/>
								<h3 className="text-xl font-semibold text-white">{t("homePage.sections.groups.title")}</h3>
							</div>
							<div className="text-gray-300 space-y-2">
								<p>
									{t("homePage.sections.groups.description")}
								</p>
							</div>
						</div>
					</Link>

					<Link to="/users" className="block">
						<div className="bg-[#2F3136] rounded p-6 hover:bg-[#292b2f] transition-all duration-200 cursor-pointer">
							<div className="flex items-center mb-4">
								<img src={UsersIcon} alt={t("homePage.sections.users.title")} className="w-8 h-8 mr-3"/>
								<h3 className="text-xl font-semibold text-white">{t("homePage.sections.users.title")}</h3>
							</div>
							<div className="text-gray-300 space-y-2">
								<p>
									{t("homePage.sections.users.description")}
								</p>
							</div>
						</div>
					</Link>

					<Link to="/events" className="block">
						<div className="bg-[#2F3136] rounded p-6 hover:bg-[#292b2f] transition-all duration-200 cursor-pointer">
							<div className="flex items-center mb-4">
								<img src={EventsIcon} alt={t("homePage.sections.events.title")} className="w-8 h-8 mr-3"/>
								<h3 className="text-xl font-semibold text-white">{t("homePage.sections.events.title")}</h3>
							</div>
							<div className="text-gray-300 space-y-2">
								<p>
									{t("homePage.sections.events.description")}
								</p>
							</div>
						</div>
					</Link>

					<Link to="/logs" className="block">
						<div className="bg-[#2F3136] rounded p-6 hover:bg-[#292b2f] transition-all duration-200 cursor-pointer">
							<div className="flex items-center mb-4">
								<img src={LogsIcon} alt={t("homePage.sections.logs.title")} className="w-8 h-8 mr-3"/>
								<h3 className="text-xl font-semibold text-white">{t("homePage.sections.logs.title")}</h3>
							</div>
							<div className="text-gray-300 space-y-2">
								<p>
									{t("homePage.sections.logs.description")}
								</p>
							</div>
						</div>
					</Link>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-semibold text-white mb-4">{t("homePage.iconsExplanationTitle")}</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 cursor-default">
					<div className="bg-[#2F3136] rounded p-6">
						<div className="flex items-center mb-4">
							<img src={HintIcon} alt={t("homePage.icons.hint.title")} className="w-6 h-6 mr-3"/>
							<h3 className="text-lg font-semibold text-white">{t("homePage.icons.hint.title")}</h3>
						</div>
						<p className="text-gray-300">
							{t("homePage.icons.hint.description")}
						</p>
					</div>

					<div className="bg-[#2F3136] rounded p-6">
						<div className="flex items-center mb-4">
							<img src={FilterSearchIcon} alt={t("homePage.icons.filter.title")} className="w-6 h-6 mr-3"/>
							<h3 className="text-lg font-semibold text-white">{t("homePage.icons.filter.title")}</h3>
						</div>
						<p className="text-gray-300">
							{t("homePage.icons.filter.description")}
						</p>
					</div>


					<div className="bg-[#2F3136] rounded p-6">
						<div className="flex items-center mb-4">
							<img src={CreateChannelIcon} alt={t("homePage.icons.createChannel.title")} className="w-6 h-6 mr-3"/>
							<h3 className="text-lg font-semibold text-white">{t("homePage.icons.createChannel.title")}</h3>
						</div>
						<p className="text-gray-300">
							{t("homePage.icons.createChannel.description")}
						</p>
					</div>

					<div className="bg-[#2F3136] rounded p-6">
						<div className="flex items-center mb-4">
							<img src={CreateCategoryIcon} alt={t("homePage.icons.createCategory.title")} className="w-6 h-6 mr-3"/>
							<h3 className="text-lg font-semibold text-white">{t("homePage.icons.createCategory.title")}</h3>
						</div>
						<p className="text-gray-300">
							{t("homePage.icons.createCategory.description")}
						</p>
					</div>

					<div className="bg-[#2F3136] rounded p-6">
						<div className="flex items-center mb-4">
							<img src={EditIcon} alt={t("homePage.icons.edit.title")} className="w-6 h-6 mr-3"/>
							<h3 className="text-lg font-semibold text-white">{t("homePage.icons.edit.title")}</h3>
						</div>
						<p className="text-gray-300">
							{t("homePage.icons.edit.description")}
						</p>
					</div>

					<div className="bg-[#2F3136] rounded p-6">
						<div className="flex items-center mb-4">
							<img src={CreateRoleIcon} alt={t("homePage.icons.createGroup.title")} className="w-6 h-6 mr-3"/>
							<h3 className="text-lg font-semibold text-white">{t("homePage.icons.createGroup.title")}</h3>
						</div>
						<p className="text-gray-300">
							{t("homePage.icons.createGroup.description")}
						</p>
					</div>

					<div className="bg-[#2F3136] rounded p-6">
						<div className="flex items-center mb-4">
							<img src={RenameIcon} alt={t("homePage.icons.rename.title")} className="w-6 h-6 mr-3"/>
							<h3 className="text-lg font-semibold text-white">{t("homePage.icons.rename.title")}</h3>
						</div>
						<p className="text-gray-300">
							{t("homePage.icons.rename.description")}
						</p>
					</div>

					<div className="bg-[#2F3136] rounded p-6">
						<div className="flex items-center mb-4">
							<img src={DeleteIcon} alt={t("homePage.icons.delete.title")} className="w-6 h-6 mr-3"/>
							<h3 className="text-lg font-semibold text-white">{t("homePage.icons.delete.title")}</h3>
						</div>
						<p className="text-gray-300">
							{t("homePage.icons.delete.description")}
						</p>
					</div>

					<div className="bg-[#2F3136] rounded p-6">
						<div className="flex items-center mb-4">
							<img src={KickUserIcon} alt={t("homePage.icons.kickUser.title")} className="w-6 h-6 mr-3"/>
							<h3 className="text-lg font-semibold text-white">{t("homePage.icons.kickUser.title")}</h3>
						</div>
						<p className="text-gray-300">
							{t("homePage.icons.kickUser.description")}
						</p>
					</div>
				</div>
			</section>
		</div>
	);
};

export default HomePage;