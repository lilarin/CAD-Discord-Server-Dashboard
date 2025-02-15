import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
import HintIcon from "@/assets/icons/hint.svg";

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
		setIsFilterOpen(false);
		setActionSidebar({action, target, item});
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
				const users = await renameUser(userId, userName);
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
				const users = await kickUser(userId);
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

	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const filterRef = useRef<HTMLDivElement>(null);
	const [showHint, setShowHint] = useState(false);
	const hintText = "Фільтри дозволяють відобразити лише користувачів з конкретної групи"

	const handleFilterClick = () => {
		if (!isFilterOpen) {
			setActionSidebar({action: null, target: null, item: null});
			setIsFilterOpen(prev => !prev);
		}
	};

	const [filterKey, setFilterKey] = useState(0)

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
							className={`flex justify-center p-2 border-dashed border-gray-500 text-gray-300 hover:border-gray-400 hover:text-gray-100 border rounded cursor-pointer w-1/3 ml-5 relative transition-all duration-300`}> {/* Removed conditional class here */}
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
													alt="Видалити"
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
					<PaginationControl currentPage={currentPage} pageCount={pageCount}
					                   handlePageChange={handlePageChange}/>
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
				<div ref={filterRef} className="pl-5 w-1/3 sticky top-5">
					<div className="bg-[#2F3136] rounded p-4">
						<span className="text-lg font-semibold mb-2">Налаштування фільтрації</span>
						<h3 className="font-light mt-2">Фільтрувати користувачів за групою:</h3>
						<div className="mt-2 space-y-2">
							<button
								key={`staff-button-${filterKey}`}
								onClick={() => handleFilterGroupChange('staff')}
								className={`w-full p-2 rounded text-white transition-all duration-300
                 ${filterGroup === 'staff'
									? 'outline-dashed outline-gray-500 bg-[#36393F] hover:bg-[#3e4147] outline-1'
									: 'bg-[#36393F] hover:bg-[#3e4147]'
								}`}
								style={{
									backgroundColor: filterGroup === 'staff' ? '#3e4147' : undefined,
									boxSizing: 'border-box',
								}}
							>
								Викладачі
							</button>
							<button
								key={`student-button-${filterKey}`}
								onClick={() => handleFilterGroupChange('student')}
								className={`w-full p-2 rounded text-white transition-all duration-300
                 ${filterGroup === 'student'
									? 'outline-dashed outline-gray-500 bg-[#36393F] hover:bg-[#3e4147] outline-1'
									: 'bg-[#36393F] hover:bg-[#3e4147]'
								}`}
								style={{
									backgroundColor: filterGroup === 'student' ? '#3e4147' : undefined,
									boxSizing: 'border-box',
								}}
							>
								Студенти
							</button>
							<button
								key={`null-button-${filterKey}`}
								onClick={() => handleFilterGroupChange('null')}
								className={`w-full p-2 rounded text-white transition-all duration-300
                 ${filterGroup === 'null'
									? 'outline-dashed outline-gray-500 bg-[#36393F] hover:bg-[#3e4147] outline-1'
									: 'bg-[#36393F] hover:bg-[#3e4147]'
								}`}
								style={{
									backgroundColor: filterGroup === 'null' ? '#3e4147' : undefined,
									boxSizing: 'border-box',
								}}
							>
								Інші
							</button>
						</div>
						<div className="flex justify-between items-center pt-4 pb-1">
							<div className="flex justify-start space-x-3">
								<button
									onClick={() => setIsFilterOpen(false)}
									className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 mt-1 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300"
								>
									Закрити
								</button>
							</div>
							{hintText && (
								<div className="pt-2 hover:brightness-200 transition-all duration-300 align-center">
									<button
										onMouseEnter={() => setShowHint(true)}
										onMouseLeave={() => setShowHint(false)}
										className="focus:outline-none"
									>
										<img src={HintIcon} alt="Інформація" className="w-6 h-6"/>
									</button>
								</div>
							)}
						</div>
					</div>
					{showHint && hintText && (
						<div className="w-full pt-5">
							<div className="bg-[#2F3136] rounded p-4">
								<h3 className="font-semibold mb-2">Підказка</h3>
								<h3 className="font-light">{hintText}</h3>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}