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

const ITEMS_PER_PAGE = 12;

const usePaginatedUsers = (users: User[], setUsers: React.Dispatch<React.SetStateAction<User[]>>, itemsPerPage: number = ITEMS_PER_PAGE) => {
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [filterGroup, setFilterGroup] = useState<string | null>(null);

	useEffect(() => {
		if (users.length) {
			setIsLoading(false);
		}
	}, [users]);

	const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(event.target.value);
		setCurrentPage(1);
	}, []);

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
		searchTerm,
		pageCount,
		currentPage,
		handleSearch,
		handlePageChange,
		filteredUsers,
		filterGroup,
		setFilterGroup
	}
};

export default function Users({itemsPerPage = ITEMS_PER_PAGE}: { itemsPerPage?: number }) {
	const [users, setUsers] = useState<User[]>([]);
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [filterKey, setFilterKey] = useState(0)


	const {
		usersOnPage,
		isLoading,
		searchTerm,
		pageCount,
		currentPage,
		handleSearch,
		filteredUsers,
		handlePageChange,
		filterGroup,
		setFilterGroup
	} = usePaginatedUsers(users, setUsers, itemsPerPage);

	const [actionSidebar, setActionSidebar] = useState<{
		action: ActionType;
		target: ActionTarget;
		item: User | null;
	}>({action: null, target: null, item: null});


	const handleActionTriggered = (action: ActionType, target: ActionTarget, item: Role | null) => {
		setActionSidebar({action, target, item});
		setIsFilterOpen(false);
	};

	const handleCancelAction = () => {
		setActionSidebar({action: null, target: null, item: null});
	};

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const response = await getUsers();
				// const duplicatedUsers = Array(20).fill(response).flat();
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


	const handleFilterClick = () => {
		setActionSidebar({action: null, target: null, item: null});
		setIsFilterOpen(prev => !prev);
	};


	const handleFilterGroupChange = (group: string | null) => {
		if (filterGroup === group) {
			setFilterGroup(null);
		} else {
			setFilterGroup(group);
		}
		setFilterKey(prev => prev + 1)
	};

	useEffect(() => {
		if (actionSidebar.action && actionSidebar.target && actionSidebar.item) {
			setIsFilterOpen(false)
		}
	}, [actionSidebar])


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
								placeholder="Пошук за іменем користувача..."
								className="w-full p-2 rounded bg-[#292B2F] focus:outline-none pr-8"
								value={searchTerm}
								onChange={handleSearch}
							/>
							<img
								src={SearchIcon}
								alt="Пошук"
								className="w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none"
							/>
						</div>
						<div
							onClick={handleFilterClick}
							className={`flex justify-center p-2 border-dashed border-gray-500 text-gray-300 hover:border-gray-400 hover:text-gray-100 border rounded cursor-pointer w-1/3 ml-5 relative transition-all duration-300`}>
							<img src={FilterSearchIcon} alt="Фільтри пошуку" className="w-5 h-5"/>
						</div>
					</div>
				)}

				{!isLoading && (
					<div className="flex-grow">
						{filteredUsers.length === 0 ? (
							<div className="text-gray-400">Користувачів немає</div>
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
													alt="Перейменувати"
													className="w-5 h-5 cursor-pointer hover:brightness-200 transition-all duration-300"/>
											</button>
											<button onClick={() => handleActionTriggered('edit', 'user', user)}>
												<img
													src={EditIcon}
													alt="Змінити ролі"
													className="w-5 h-5 cursor-pointer hover:brightness-200 transition-all duration-300"/>
											</button>
											<button onClick={() => handleActionTriggered('delete', 'user', user)}>
												<img
													src={KickUserIcon}
													alt="Видалити"
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
					/>
				</div>
			)}
			{isFilterOpen && (
				<div className="pl-5 w-1/3 sticky top-5">
					<ActionSidebar
						isFilterOpen={isFilterOpen}
						onFilterCancel={() => setIsFilterOpen(false)}
						onFilterGroupChange={handleFilterGroupChange}
						filterGroup={filterGroup}
						setFilterKey={setFilterKey}
					/>
				</div>
			)}
		</div>
	);
}