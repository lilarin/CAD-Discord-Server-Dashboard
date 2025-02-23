import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {getUsers, kickUser, renameUser} from '@/lib/api';
import {ComponentLoadingSpinner} from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import {PaginationControl} from "@/hooks/PaginationControl.tsx";
import {Role, User} from "@/lib/types.ts";
import FilterSearchIcon from "@/assets/icons/filter_search.svg";
import SearchIcon from "@/assets/icons/search.svg";
import RenameIcon from "@/assets/icons/rename.svg";
import EditIcon from "@/assets/icons/edit.svg";
import KickUserIcon from "@/assets/icons/logout.svg";
import ActionSidebar, {ActionTarget, ActionType} from "@/components/ActionSidebar.tsx";
import {useTranslation} from "react-i18next";

const ITEMS_PER_PAGE = 12;

const usePaginatedUsers = (users: User[], searchTerm: string, filterGroup: string | null, itemsPerPage: number = ITEMS_PER_PAGE) => {
	const [isLoading, setIsLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);

	useEffect(() => {
		if (users.length) {
			setIsLoading(false);
		}
	}, [users]);


	const filteredUsers = useMemo(() => {
		let filtered = users.filter((user) =>
			user.name.toLowerCase().includes(searchTerm.toLowerCase())
		);

		if (filterGroup === 'null') {
			filtered = filtered.filter(user => user.group === null)
		} else if (filterGroup) {
			filtered = filtered.filter(user => user.group === filterGroup)
		}

		return filtered
	}, [users, searchTerm, filterGroup])

	const pageCount = Math.ceil(filteredUsers.length / itemsPerPage);

	const handlePageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber);
	};

	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const usersOnPage = filteredUsers.slice(startIndex, endIndex);

	return {
		usersOnPage,
		isLoading,
		pageCount,
		currentPage,
		handlePageChange,
		filteredUsers,
	}
};

export default function Users({itemsPerPage = ITEMS_PER_PAGE}: { itemsPerPage?: number }) {
	const [users, setUsers] = useState<User[]>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [filterGroup, setFilterGroup] = useState<string | null>(null);
	const [actionSidebar, setActionSidebar] = useState<{
		action: ActionType;
		target: ActionTarget;
		item: User | null;
	}>({action: null, target: null, item: null});

	const { t } = useTranslation();

	const {
		usersOnPage,
		isLoading,
		pageCount,
		currentPage,
		handlePageChange,
		filteredUsers,
	} = usePaginatedUsers(users, searchTerm, filterGroup, itemsPerPage);


	const handleActionTriggered = (action: ActionType, target: ActionTarget, item: User | null = null) => {
		setActionSidebar({action, target, item});
	};

	const handleCancelAction = () => {
		setActionSidebar({action: null, target: null, item: null});
	};

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const response = await getUsers();
				setUsers(response);
			} catch (error) {
				toast.error(error.message, {
					position: "bottom-right",
					duration: 10000
				});
			}
		};

		fetchUsers().then(r => {
		});
	}, []);

	const handleRenameUser = useCallback(
		async (userId: number, userName: string) => {
			setUsers((prevUsers) =>
				prevUsers.map((user) =>
					user.id === userId ? {...user, name: userName} : user
				)
			);
			setActionSidebar({action: null, target: null, item: null});
			try {
				const users = await renameUser(userId.toString(), userName);
				setUsers(users);
			} catch (error) {
				toast.error(error.message, {
					position: "bottom-right",
					duration: 10000
				});
				const fetchedUsers = await getUsers();
				setUsers(fetchedUsers);
			}
		},
		[setUsers]
	);

	const handleKickUser = useCallback(
		async (userId: number) => {
			setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
			setActionSidebar({action: null, target: null, item: null});
			try {
				const users = await kickUser(userId.toString());
				setUsers(users);
			} catch (error) {
				toast.error(error.message, {
					position: "bottom-right",
					duration: 10000
				});
				const fetchedUsers = await getUsers();
				setUsers(fetchedUsers);
			}
		},
		[setUsers]
	);


	const handleFilter = (group: string | null) => {
		setFilterGroup(group);
	};

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(event.target.value);
	};

	const handleFilterClick = () => {
		if (actionSidebar.action === 'filter') {
			setActionSidebar({action: null, target: null, item: null});
		} else {
			setActionSidebar({action: 'filter', target: 'user', item: null});
		}
	};


	return (
		<div className="relative flex w-full h-full p-5">
			{isLoading && (
				<ComponentLoadingSpinner/>
			)}
			<div className="w-2/3 h-full flex flex-col">
				{!isLoading && (
					<div className="mb-5 flex justify-between items-center">
						<div className="w-full flex flex-row relative">
							<input
								type="text"
								placeholder={t("search.searchByUsername")}
								className="w-full p-2 rounded bg-[#292B2F] focus:outline-none pr-8"
								value={searchTerm}
								onChange={handleSearchChange}
							/>
							<img
								src={SearchIcon}
								alt={t("iconsAltName.search")}
								className="w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none"
							/>
						</div>
						<div
							onClick={handleFilterClick}
							className={`flex justify-center p-2 border-dashed border-gray-500 text-gray-300 hover:border-gray-400 hover:text-gray-100 border rounded cursor-pointer w-1/3 ml-5 relative transition-all duration-300`}>
							<img
								src={FilterSearchIcon}
								alt={t("iconsAltName.filterSearch")}
								className="w-5 h-5"
							/>
						</div>
					</div>
				)}

				{!isLoading && (
					<div className="flex-grow">
						{filteredUsers.length === 0 ? (
							<div className="text-gray-400">{t("users.noUsers")}</div>
						) : (
							<ul className="list-none p-0">
								{usersOnPage.map((user) => (
									<li
										key={user.id}
										className="py-2 px-3 rounded bg-[#2f3136] text-white mb-2 flex justify-between items-center">
										{user.name}
										<div className="flex items-center space-x-2">
											<button onClick={() => handleActionTriggered('rename', 'user', user)}>
												<img
													src={RenameIcon}
													alt={t("iconsAltName.rename")}
													className="w-5 h-5 cursor-pointer hover:brightness-200 transition-all duration-300"/>
											</button>
											<button onClick={() => handleActionTriggered('edit', 'user', user)}>
												<img
													src={EditIcon}
													alt={t("iconsAltName.editRoles")}
													className="w-5 h-5 cursor-pointer hover:brightness-200 transition-all duration-300"/>
											</button>
											<button onClick={() => handleActionTriggered('delete', 'user', user)}>
												<img
													src={KickUserIcon}
													alt={t("iconsAltName.kickUser")}
													className="w-5 h-5 cursor-pointer hover:brightness-200 transition-all duration-300"/>
											</button>
										</div>
									</li>
								))}
							</ul>
						)}
					</div>
				)}

				{!isLoading && (
					<PaginationControl
						currentPage={currentPage}
						pageCount={pageCount}
						handlePageChange={handlePageChange}
					/>
				)}
			</div>
			{actionSidebar.action && actionSidebar.target && (
				<div className="pl-5 w-1/3">
					<ActionSidebar
						action={actionSidebar.action}
						target={actionSidebar.target}
						item={actionSidebar.item}
						onCancel={handleCancelAction}
						onRenameUser={handleRenameUser}
						onKickUser={handleKickUser}
						onFilter={handleFilter}
						filterGroup={filterGroup}
						onFilterCancel={handleCancelAction}
					/>
				</div>
			)}
		</div>
	);
}