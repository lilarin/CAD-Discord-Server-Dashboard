import React, {useEffect, useMemo, useRef, useState} from 'react';
import {editCategoryPermissions, editUserRoles, getAllRoles, getCategoryAccessRoles, getUserRoles} from "@/lib/api.ts";
import HintIcon from "@/assets/icons/hint.svg";
import DeleteIcon from "@/assets/icons/delete.svg";
import AddRoleIcon from "@/assets/icons/add_role.svg";
import {ChannelLoadingSpinner} from '@/components/LoadingSpinner';
import toast from "react-hot-toast";
import {Category, Channel, Role, User} from "@/lib/types.ts";
import SearchIcon from "@/assets/icons/search.svg";

export type ActionType = 'create' | 'rename' | 'edit' | 'delete' | null;
export type ActionTarget = 'category' | 'channel' | 'role' | 'user' | null;

interface ActionSidebarProps {
	action: ActionType;
	target: ActionTarget;
	item: Category | Channel | Role | User | null;
	onCancel: () => void;
	onDeleteCategory?: (id: number) => void;
	onDeleteChannel?: (id: number) => void;
	onDeleteRole?: (id: number) => void;
	onCreateCategory?: (name: string) => void;
	onCreateChannel?: (name: string, type: 'text' | 'voice') => void;
	onCreateRole?: (name: string) => void;
	onRenameCategory?: (id: number, newName: string) => void;
	onRenameChannel?: (id: number, newName: string) => void;
	onRenameRole?: (id: number, newName: string) => void;
	onRenameUser?: (id: number, newName: string) => void;
	onKickUser?: (id: number) => void;
}

function ActionSidebar(
	{
		action,
		target,
		item,
		onCancel,
		onDeleteCategory,
		onDeleteChannel,
		onDeleteRole,
		onCreateCategory,
		onCreateChannel,
		onCreateRole,
		onRenameCategory,
		onRenameChannel,
		onRenameRole,
		onRenameUser,
		onKickUser,
	}: ActionSidebarProps) {
	const [itemName, setItemName] = useState('');
	const [newChannelType, setNewChannelType] = useState<'text' | 'voice'>('text');
	const [showHint, setShowHint] = useState(false);
	const [roles, setRoles] = useState<Role[]>([]);
	const [initialRoles, setInitialRoles] = useState<Role[]>([]);
	const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
	const [isRoleListOpen, setIsRoleListOpen] = useState(false);
	const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
	const [allRolesList, setAllRolesList] = useState<Role[]>([]);
	const [roleSearchTerm, setRoleSearchTerm] = useState('');
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (action === 'rename' && item) {
			setItemName(item.name);
		} else {
			setItemName('')
		}
	}, [action, item]);


	useEffect(() => {
		const fetchAllRoles = async () => {
			try {
				const fetchedAllRoles = await getAllRoles();
				setAllRolesList(fetchedAllRoles);
			} catch (error) {
				toast.error("Не вдалося завантажити список ролей", {
					position: "bottom-right",
					duration: 5000
				});
				setAllRolesList([]);
			}
		};

		if (action === 'edit' && target === 'category' && item) {
			const fetchRoles = async () => {
				setIsLoadingPermissions(true);
				try {
					const fetchedRoles = await getCategoryAccessRoles(item.id);
					setRoles(fetchedRoles);
					setInitialRoles([...fetchedRoles]);
				} catch (error) {
					toast.error(error.message, {
						position: "bottom-right",
						duration: 10000
					});
					setRoles([]);
				} finally {
					setIsLoadingPermissions(false);
				}
			};
			fetchRoles().then(r => {
			});
			fetchAllRoles().then(r => {
			});
		} else if (action === 'edit' && target === 'user' && item) {
			const fetchRoles = async () => {
				setIsLoadingPermissions(true);
				try {
					const fetchedRoles = await getUserRoles(item.id);
					setRoles(fetchedRoles);
					setInitialRoles([...fetchedRoles]);
				} catch (error) {
					toast.error(error.message, {
						position: "bottom-right",
						duration: 10000
					});
					setRoles([]);
				} finally {
					setIsLoadingPermissions(false);
				}
			};
			fetchRoles().then(r => {
			});
			fetchAllRoles().then(r => {
			});
		} else {
			setRoles([]);
			setInitialRoles([]);
			setIsRoleListOpen(false);
			setAvailableRoles([]);
		}
	}, [action, target, item]);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (isRoleListOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsRoleListOpen(false);
			}
		}

		if (isRoleListOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		} else {
			document.removeEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isRoleListOpen]);


	const actionTextMap = {
		create: {
			category: 'Створення нової категорії',
			channel: 'Створення нового каналу',
			role: 'Створення нової ролі',
		},
		rename: {
			category: `Перейменування категорії "${item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}"`,
			channel: `Перейменування каналу "${item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}"`,
			role: `Перейменування ролі "${item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}"`,
			user: `Зміна імені на сервері користувачу "${item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}"`,
		},
		edit: {
			category: `Редагування доступу ролей до категорії "${item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}"`,
			user: `Редагування ролей користувача "${item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}"`,
		},
		delete: {
			category: `Видалити категорію "${item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}"?`,
			channel: `Видалити канал "${item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}"?`,
			role: `Видалити роль "${item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}"?`,
			user: `Вигнати "${item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}" з серверу?`,
		},
	};

	const hintTextMap = {
		create: {
			category: 'Категорію варто сприймати як дисципліну, чи розділ зі своїми каналами та доступом. Після створення категорії вона знаходитиметься внизу списку',
			channel: 'Введіть назву для каналу та оберіть його тип',
			role: 'Після створення ролі вона одразу ж буде відсортована у порядку зростання',
		},
		rename: {
			category: 'Регістр для назви каналу не враховується та обробляється автоматично',
			channel: 'Регістр для назви категорії не враховується та обробляється автоматично',
		},
		edit: {
			category: 'Оберіть ролі для доступу до категорії та всіх її каналів',
			user: 'Оберіть ролі які будуть в користувача',
		},
		delete: {
			category: 'При видаленні категорії всі канали в ній також будуть видалені',
		},
	};

	const text = action && target ? actionTextMap[action][target] : '';
	const hintText = action && target ? hintTextMap[action][target] : '';

	const handleDeleteAction = () => {
		if (target === 'category' && item) {
			onDeleteCategory?.(item.id);
		} else if (target === 'channel' && item) {
			onDeleteChannel?.(item.id);
		} else if (target === 'role' && item) {
			onDeleteRole?.(item.id)
		} else if (target === 'user' && item) {
			onKickUser?.(item.id);
		}
	};

	const handleCreateOrRenameAction = () => {
		if (action === 'create') {
			if (target === 'category') {
				onCreateCategory?.(itemName);
			} else if (target === 'channel') {
				onCreateChannel?.(itemName, newChannelType);
			} else if (target === 'role') {
				onCreateRole?.(itemName);
			}
		} else if (action === 'rename' && item) {
			if (target === 'category') {
				onRenameCategory?.(item.id, itemName);
			} else if (target === 'channel') {
				onRenameChannel?.(item.id, itemName);
			} else if (target === 'role') {
				onRenameRole?.(item.id, itemName);
			} else if (target === 'user') {
				onRenameUser?.(item.id, itemName)
			}
		}
	};

	const handleSavePermissions = async () => {
		if (action === 'edit' && target === 'category' && item) {
			onCancel();
			try {
				const roleIds = roles.map(role => role.id);
				if (!isEditCategoryDisabled) {
					await editCategoryPermissions(item.id, roleIds);
					setInitialRoles([...roles]);
				}
			} catch (error) {
				toast.error(error.message, {
					position: "bottom-right",
					duration: 10000
				});
				const fetchedRoles = await getCategoryAccessRoles(item.id);
				setRoles(fetchedRoles);
			}
		} else if (action === 'edit' && target === 'user' && item) {
			onCancel();
			try {
				const roleIds = roles.map(role => role.id);
				if (!isEditCategoryDisabled) {
					await editUserRoles(item.id, roleIds);
					setInitialRoles([...roles]);
				}
			} catch (error) {
				toast.error(error.message, {
					position: "bottom-right",
					duration: 10000
				});
				const fetchedRoles = await getUserRoles(item.id);
				setRoles(fetchedRoles);
			}
		}
	};

	const handleRemoveRole = (roleId: number) => {
		setRoles(roles.filter(role => role.id !== roleId));
	};

	const handleAddRole = () => {
		if (action === 'edit' && (target === 'category' || target === 'user')) {
			const available = allRolesList.filter(allRole => !roles.some(selectedRole => selectedRole.id === allRole.id));
			setAvailableRoles(available);
			setIsRoleListOpen(true);
			setShowHint(false);
			setRoleSearchTerm('');
		}
	};

	const handleSelectAvailableRole = (roleToAdd: Role) => {
		setRoles([...roles, roleToAdd]);
		setAvailableRoles(availableRoles.filter(role => role.id !== roleToAdd.id));
		setIsRoleListOpen(false);
	};

	const filteredAvailableRoles = useMemo(() => {
		const term = roleSearchTerm.toLowerCase();
		return availableRoles.filter(role => role.name.toLowerCase().includes(term));
	}, [availableRoles, roleSearchTerm]);

	const isInputDisabled = !itemName.trim() || (item && itemName.trim().toLowerCase() === item.name.toLowerCase());
	const isCreateRoleDisabled = !itemName.trim()

	const isEditCategoryDisabled = (action === 'edit' && (target === 'category' || target === 'user')) &&
		initialRoles && roles && (
			initialRoles.length === roles.length &&
			initialRoles.map(r => r.id).sort().every((id, index) => id === roles.map(r => r.id).sort()[index])
		);


	const sortedRoles = useMemo(() => {
		return [...roles].sort((a, b) => a.name.localeCompare(b.name));
	}, [roles]);

	return (
		<div className="sticky top-5">
			<div className="bg-[#2F3136] rounded p-4">
				<span className="text-lg font-semibold mb-2">{text}</span>
				{action === 'delete' && (
					<div className="flex justify-between items-center pt-4 pb-1">
						<div className="flex justify-start space-x-3">
							<button
								onClick={handleDeleteAction}
								className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300"
							>
								Видалити
							</button>
							<button
								onClick={onCancel}
								className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300"
							>
								Скасувати
							</button>
						</div>
						{hintText && (
							<div className="hover:brightness-200 transition-all duration-300">
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
				)}
				{(action === 'create' || action === 'rename') && (
					<div>
						<div className="space-y-2 mt-4">
							<input
								type="text"
								placeholder={`${target === 'category' ? 'Назва категорії' : target === 'channel' ? 'Назва каналу' : target === 'role' ? 'Назва ролі' : 'Ім`я користувача'}`}
								className="w-full p-2 rounded bg-[#292B2F] text-white focus:outline-none"
								value={itemName}
								onChange={(e) => setItemName(e.target.value)}
							/>
							{action === 'create' && target === 'channel' && (
								<select
									className="w-full p-2 rounded bg-[#292B2F] text-white focus:outline-none"
									value={newChannelType}
									onChange={(e) => setNewChannelType(e.target.value as 'text' | 'voice')}
								>
									<option value="text">Текстовий</option>
									<option value="voice">Голосовий</option>
								</select>
							)}
						</div>
						<div className="flex justify-between items-center pt-4 pb-1">
							<div className="flex justify-start space-x-3">
								<button
									onClick={handleCreateOrRenameAction}
									disabled={action === 'create' ? (target === 'role' ? isCreateRoleDisabled : isInputDisabled) : isInputDisabled}
									className={`bg-green-600 ${
										!isInputDisabled ? 'hover:bg-green-700 transition-all duration-300' : ''
									} text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-40`}
								>
									{action === 'create' ? 'Створити' : 'Зберегти'}
								</button>
								<button
									onClick={onCancel}
									className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300"
								>
									Скасувати
								</button>
							</div>
							{hintText && (
								<div className="hover:brightness-200 transition-all duration-300">
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
				)}
				{action === 'edit' && (target === 'category' || target === 'user') && item && (
					<div>
						{isLoadingPermissions ? (
							<div className="flex justify-center items-center p-2">
								<ChannelLoadingSpinner/>
							</div>
						) : sortedRoles.length > 0 ? (
							<ul className="space-y-2 mt-2">
								<h3 className="font-light">{target === 'category' ? 'Ролі з доступом:' : 'Ролі користувача:'}</h3>
								{sortedRoles.map(role => (
									<li key={role.id}
									    className="bg-[#36393F] rounded pl-2 p-1.5 flex justify-between items-center hover:bg-[#3e4147] pr-1.5">
										{role.name}
										<button onClick={() => handleRemoveRole(role.id)}>
											<img
												src={DeleteIcon}
												alt="Видалити"
												className="w-5 h-5 cursor-pointer hover:brightness-200 transition-all duration-300"
											/>
										</button>
									</li>
								))}
							</ul>
						) : (
							<div className="text-gray-400 mt-2 mb-2">Немає ролей з доступом до цієї категорії</div>
						)}
						{!isLoadingPermissions && (
							<div
								className="flex justify-center p-2 border-dashed border-gray-500 text-gray-300 hover:border-gray-400 hover:text-gray-100 border rounded cursor-pointer mt-2  transition-all duration-300"
								onClick={handleAddRole}>
								<img src={AddRoleIcon} alt="Додати роль" className="w-4 h-4 mr-2"/>
							</div>
						)}
						<div className="flex justify-between items-center pt-4 pb-1">
							<div className="flex justify-start space-x-3">
								<button
									onClick={handleSavePermissions}
									disabled={isEditCategoryDisabled}
									className={`bg-green-600 ${
										!isEditCategoryDisabled ? 'hover:bg-green-700 transition-all duration-300' : ''
									} text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-40 transition-all duration-300`}
								>
									Зберегти
								</button>
								<button
									onClick={onCancel}
									className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300"
								>
									Скасувати
								</button>
							</div>
							{hintText && (
								<div className="hover:brightness-200 transition-all duration-300">
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
				)}
			</div>
			{showHint && hintText && (
				<div className="w-full pt-5">
					<div className="bg-[#2F3136] rounded p-4">
						<h3 className="font-semibold mb-2">Підказка</h3>
						<h3 className="font-light">{hintText}</h3>
					</div>
				</div>
			)}
			{isRoleListOpen && availableRoles.length > 0 && (
				<div ref={dropdownRef} className="w-full pt-5 relative">
					<div className="bg-[#2F3136] rounded p-4">
						<div className="w-full flex flex-row relative">
							<input
								type="text"
								placeholder="Пошук за назвою ролі..."
								className="w-full p-2 rounded bg-[#292B2F] text-white focus:outline-none"
								value={roleSearchTerm}
								onChange={(e) => setRoleSearchTerm(e.target.value)}
							/>
							<img
								src={SearchIcon}
								alt="Пошук"
								className="w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none"
							/>
						</div>
						<ul className="space-y-2 mt-2 max-h-32 overflow-y-auto">
							{filteredAvailableRoles.length > 0 ? (
								filteredAvailableRoles.map(role => (
									<li key={role.id}
									    onClick={() => handleSelectAvailableRole(role)}
									    className="bg-[#36393F] rounded pl-2 p-1.5 flex items-center hover:bg-[#3e4147] cursor-pointer">
										{role.name}
									</li>
								))
							) : (
								<li className="text-gray-400 p-2">Немає ролей</li>
							)}
						</ul>
					</div>
				</div>
			)}
			{isRoleListOpen && availableRoles.length === 0 && (
				<div ref={dropdownRef} className="w-full pt-5 relative">
					<div className="bg-[#2F3136] rounded p-4 text-gray-400">
						<h3 className="font-semibold mb-2">Доступні ролі</h3>
						<div className="mt-2">Немає ролей для додавання</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default ActionSidebar;