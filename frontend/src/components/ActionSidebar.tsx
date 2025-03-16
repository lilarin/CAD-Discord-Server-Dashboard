import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
	editCategoryPermissions,
	editRoleHolders,
	editUserRoles,
	getAllRoles,
	getBaseUsers,
	getCategoryAccessRoles,
	getRoleHolders,
	getUserRoles,
} from "@/lib/api.ts";
import HintIcon from "@/assets/icons/hint.svg";
import DeleteIcon from "@/assets/icons/delete.svg";
import AddRoleIcon from "@/assets/icons/add_role.svg";
import SearchIcon from "@/assets/icons/search.svg";
import {ChannelLoadingSpinner} from '@/components/LoadingSpinner';
import toast from "react-hot-toast";
import {Category, Channel, Role, User} from "@/lib/types.ts";
import {useHintAnimation} from "@/hooks/useHintAnimation.tsx";
import {useTranslation} from "react-i18next";

export type ActionType = 'create' | 'rename' | 'edit' | 'delete' | 'filter' | null;
export type ActionTarget = 'category' | 'channel' | 'role' | 'user' | null;

interface ActionSidebarProps {
	action?: ActionType;
	target?: ActionTarget;
	item?: Category | Channel | Role | User | null;
	onCancel?: () => void;
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

	onFilter?: (group: string | null) => void;
	filterGroup?: string | null;
	onFilterCancel?: () => void;
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

		onFilter,
		filterGroup,
		onFilterCancel,
	}: ActionSidebarProps) {
	const [itemName, setItemName] = useState('');
	const [newChannelType, setNewChannelType] = useState<'text' | 'voice'>('text');
	const [roles, setRoles] = useState<Role[]>([]);
	const [initialRoles, setInitialRoles] = useState<Role[]>([]);
	const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
	const [isRoleListOpen, setIsRoleListOpen] = useState(false);
	const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
	const [allRolesList, setAllRolesList] = useState<Role[]>([]);
	const [roleSearchTerm, setRoleSearchTerm] = useState('');
	const dropdownRef = useRef<HTMLDivElement>(null);
	const filterRef = useRef<HTMLDivElement>(null);

	const [roleHolders, setRoleHolders] = useState<User[]>([]);
	const [initialRoleHolders, setInitialRoleHolders] = useState<User[]>([]);
	const [isLoadingRoleHolders, setIsLoadingRoleHolders] = useState(false);
	const [isUserListOpen, setIsUserListOpen] = useState(false);
	const [availableUsers, setAvailableUsers] = useState<User[]>([]);
	const [allUsersList, setAllUsersList] = useState<User[]>([]);
	const [userSearchTerm, setUserSearchTerm] = useState('');
	const userDropdownRef = useRef<HTMLDivElement>(null);


	const hintAnimation = useHintAnimation();
	const {isVisible: showHint, opacity: hintOpacity, open: openHint, close: closeHint} = hintAnimation;
	const {t} = useTranslation();


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
				toast.error(t("error.fetchAllRolesError"), {
					position: "bottom-right",
					duration: 5000
				});
				console.error(error)
				setAllRolesList([]);
			}
		};
		const fetchAllUsers = async () => {
			try {
				const fetchedAllUsers = await getBaseUsers();
				setAllUsersList(fetchedAllUsers);
			} catch (error) {
				toast.error(t("error.fetchUsersError"), {
					position: "bottom-right",
					duration: 5000
				});
				console.error(error);
				setAllUsersList([]);
			}
		};


		if (action === 'edit' && target === 'category' && item) {
			const fetchRoles = async () => {
				setIsLoadingPermissions(true);
				try {
					const fetchedRoles = await getCategoryAccessRoles(item.id.toString());
					setRoles(fetchedRoles);
					setInitialRoles([...fetchedRoles]);
				} catch (error) {
					toast.error(t("error.fetchCategoryRolesError"), {
						position: "bottom-right",
						duration: 10000
					});
					console.error(error)
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
					const fetchedRoles = await getUserRoles(item.id.toString());
					setRoles(fetchedRoles);
					setInitialRoles([...fetchedRoles]);
				} catch (error) {
					toast.error(t("error.fetchUserRolesError"), {
						position: "bottom-right",
						duration: 10000
					});
					console.error(error)
					setRoles([]);
				} finally {
					setIsLoadingPermissions(false);
				}
			};
			fetchRoles().then(r => {
			});
			fetchAllRoles().then(r => {
			});
		} else if (action === 'edit' && target === 'role' && item) {
			const fetchRoleHoldersList = async () => {
				setIsLoadingRoleHolders(true);
				try {
					const fetchedHolders = await getRoleHolders(item.id.toString());
					setRoleHolders(fetchedHolders);
					setInitialRoleHolders([...fetchedHolders]);
				} catch (error) {
					toast.error(t("error.fetchRoleHoldersError"), {
						position: "bottom-right",
						duration: 10000
					});
					console.error(error);
					setRoleHolders([]);
				} finally {
					setIsLoadingRoleHolders(false);
				}
			};
			fetchRoleHoldersList().then(r => {
			});
			fetchAllUsers().then(r => {
			});
		} else {
			setRoles([]);
			setInitialRoles([]);
			setIsRoleListOpen(false);
			setAvailableRoles([]);
			setRoleHolders([]);
			setInitialRoleHolders([]);
			setIsUserListOpen(false);
			setAvailableUsers([]);
			setUserSearchTerm('');
		}
	}, [action, target, item]);

	useEffect(() => {
		function handleClickOutsideRoleDropdown(event: MouseEvent) {
			if (isRoleListOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsRoleListOpen(false);
			}
		}

		function handleClickOutsideUserDropdown(event: MouseEvent) {
			if (isUserListOpen && userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
				setIsUserListOpen(false);
			}
		}


		if (isRoleListOpen) {
			document.addEventListener("mousedown", handleClickOutsideRoleDropdown);
		} else {
			document.removeEventListener("mousedown", handleClickOutsideRoleDropdown);
		}
		if (isUserListOpen) {
			document.addEventListener("mousedown", handleClickOutsideUserDropdown);
		} else {
			document.removeEventListener("mousedown", handleClickOutsideUserDropdown);
		}


		return () => {
			document.removeEventListener("mousedown", handleClickOutsideRoleDropdown);
			document.removeEventListener("mousedown", handleClickOutsideUserDropdown);
		};
	}, [isRoleListOpen, isUserListOpen]);


	const actionTextMap = {
		create: {
			category: t("actionSidebar.create.category"),
			channel: t("actionSidebar.create.channel"),
			role: t("actionSidebar.create.role"),
		},
		rename: {
			category: t("actionSidebar.rename.category", {itemName: item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}),
			channel: t("actionSidebar.rename.channel", {itemName: item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}),
			role: t("actionSidebar.rename.role", {itemName: item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}),
			user: t("actionSidebar.rename.user", {itemName: item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}),
		},
		edit: {
			category: t("actionSidebar.edit.category", {itemName: item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}),
			role: t("actionSidebar.edit.role", {itemName: item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}),
			user: t("actionSidebar.edit.user", {itemName: item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}),
		},
		delete: {
			category: t("actionSidebar.delete.category", {itemName: item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}),
			channel: t("actionSidebar.delete.channel", {itemName: item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}),
			role: t("actionSidebar.delete.role", {itemName: item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}),
			user: t("actionSidebar.delete.user", {itemName: item?.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}),
		},
		filter: {
			user: t("actionSidebar.filter.user"),
		}
	};

	const actionHintTextMap = {
		create: {
			category: t("actionSidebar.hint.create.category"),
			channel: t("actionSidebar.hint.create.channel"),
			role: t("actionSidebar.hint.create.role"),
		},
		rename: {
			category: t("actionSidebar.hint.rename.category"),
			channel: t("actionSidebar.hint.rename.channel"),
		},
		edit: {
			category: t("actionSidebar.hint.edit.category"),
		},
		delete: {
			category: t("actionSidebar.hint.delete.category"),
		},
	};

	const text = action && target ? actionTextMap[action][target] : '';
	const actionHintText = action && target && actionHintTextMap[action] ? actionHintTextMap[action][target] : '';


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
			onCancel?.();
			try {
				const roleIds = roles.map(role => role.id);
				if (!isEditCategoryDisabled) {
					await editCategoryPermissions(item.id.toString(), roleIds);
					setInitialRoles([...roles]);
				}
			} catch (error) {
				toast.error(t("error.saveCategoryPermissionsError"), {
					position: "bottom-right",
					duration: 10000
				});
				console.error(error)
				const fetchedRoles = await getCategoryAccessRoles(item.id.toString());
				setRoles(fetchedRoles);
			}
		} else if (action === 'edit' && target === 'user' && item) {
			onCancel?.();
			try {
				const roleIds = roles.map(role => role.id);
				if (!isEditCategoryDisabled) {
					await editUserRoles(item.id.toString(), roleIds);
					setInitialRoles([...roles]);
				}
			} catch (error) {
				toast.error(t("error.saveUserRolesError"), {
					position: "bottom-right",
					duration: 10000
				});
				console.error(error)
				const fetchedRoles = await getUserRoles(item.id.toString());
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

	const noRolesText = useMemo(() => {
		if (action === 'edit' && target === 'user' && sortedRoles.length === 0) {
			return t("warnings.noUserRoles");
		}
		return t("warnings.noCategoryRoles");
	}, [action, target, sortedRoles]);

	const handleMouseEnterHint = useCallback(openHint, [openHint]);
	const handleMouseLeaveHint = useCallback(closeHint, [closeHint]);

	const handleFilterGroupChange = (group: string | null) => {
		if (filterGroup === group) {
			onFilter?.(null);
		} else {
			onFilter?.(group);
		}
	};

	const handleRemoveRoleHolder = (userId: number) => {
		setRoleHolders(roleHolders.filter(user => user.id !== userId));
	};

	const handleAddUserToRole = () => {
		if (action === 'edit' && target === 'role') {
			const available = allUsersList.filter(allUser => !roleHolders.some(selectedUser => selectedUser.id === allUser.id));
			setAvailableUsers(available);
			setIsUserListOpen(true);
			setUserSearchTerm('');
		}
	};

	const handleSelectAvailableUser = (userToAdd: User) => {
		setRoleHolders([...roleHolders, userToAdd]);
		setAvailableUsers(availableUsers.filter(user => user.id !== userToAdd.id));
		setIsUserListOpen(false);
	};

	const filteredAvailableUsers = useMemo(() => {
		const term = userSearchTerm.toLowerCase();
		return availableUsers.filter(user => user.name.toLowerCase().includes(term));
	}, [availableUsers, userSearchTerm]);

	const isEditRoleHoldersDisabled = (action === 'edit' && target === 'role') &&
		initialRoleHolders && roleHolders && (
			initialRoleHolders.length === roleHolders.length &&
			initialRoleHolders.map(u => u.id).sort().every((id, index) => id === roleHolders.map(u => u.id).sort()[index])
		);


	const handleSaveRoleHolders = async () => {
		if (action === 'edit' && target === 'role' && item) {
			onCancel?.();
			try {
				const userIds = roleHolders.map(user => user.id);
				if (!isEditRoleHoldersDisabled) {
					await editRoleHolders(item.id.toString(), userIds);
					setInitialRoleHolders([...roleHolders]);
				}
			} catch (error) {
				toast.error(t("error.saveRoleHoldersError"), {
					position: "bottom-right",
					duration: 10000
				});
				console.error(error)
				const fetchedHolders = await getRoleHolders(item.id.toString());
				setRoleHolders(fetchedHolders);
				setInitialRoleHolders([...fetchedHolders]);
			}
		}
	};


	return (
		<div className="sticky top-5">
			{action && <div className="bg-[#2F3136] rounded p-4">
				{action !== 'filter' && <span className="text-lg font-semibold mb-2">{text}</span>}
				{action === 'delete' && (
					<div className="flex justify-between items-center pt-4 pb-1">
						<div className="flex justify-start space-x-3">
							<button
								onClick={handleDeleteAction}
								className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300"
							>
								{t("actionSidebar.deleteButton")}
							</button>
							<button
								onClick={onCancel}
								className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300"
							>
								{t("actionSidebar.cancelButton")}
							</button>
						</div>
						{actionHintText && (
							<div className="pt-2 hover:brightness-200 transition-all duration-300">
								<button
									onMouseEnter={handleMouseEnterHint}
									onMouseLeave={handleMouseLeaveHint}
									className="focus:outline-none"
								>
									<img src={HintIcon} alt={t("iconAltName.hint")} className="w-6 h-6"/>
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
								placeholder={t(`input.${target}`)}
								className="w-full p-2 rounded bg-[#292B2F] text-white focus:outline-none"
								value={itemName}
								onChange={(e) => setItemName(e.target.value)}
								maxLength={32}
							/>
							{action === 'create' && target === 'channel' && (
								<select
									className="w-full p-2 rounded bg-[#292B2F] text-white focus:outline-none"
									value={newChannelType}
									onChange={(e) => setNewChannelType(e.target.value as 'text' | 'voice')}
								>
									<option value="text">{t("actionSidebar.textChannel")}</option>
									<option value="voice">{t("actionSidebar.voiceChannel")}</option>
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
									{action === 'create' ? t("actionSidebar.createButton") : t("actionSidebar.saveButton")}
								</button>
								<button
									onClick={onCancel}
									className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300"
								>
									{t("actionSidebar.cancelButton")}
								</button>
							</div>
							{actionHintText && (
								<div className="pt-2 hover:brightness-200 transition-all duration-300">
									<button
										onMouseEnter={handleMouseEnterHint}
										onMouseLeave={handleMouseLeaveHint}
										className="focus:outline-none"
									>
										<img src={HintIcon} alt={t("iconAltName.hint")} className="w-6 h-6"/>
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
							<div>
								<h3
									className="font-light">{target === 'category' ? t("actionSidebar.rolesWithAccess") : t("actionSidebar.userRoles")}</h3>
								<ul className="space-y-2 mt-2 max-h-44 overflow-y-auto">
									{sortedRoles.map(role => (
										<li key={role.id}
										    className="bg-[#36393F] rounded pl-2 p-1.5 flex justify-between items-center pr-1.5">
											{role.name}
											<button onClick={() => handleRemoveRole(role.id)}>
												<img
													src={DeleteIcon}
													alt={t("iconAltName.delete")}
													className="w-5 h-5 cursor-pointer hover:brightness-200 transition-all duration-300"
												/>
											</button>
										</li>
									))}
								</ul>
							</div>
						) : (
							<div className="font-light mt-2 mb-2">{noRolesText}</div>
						)}
						{!isLoadingPermissions && (
							<div
								className="flex justify-center p-2 border-dashed border-gray-500 text-gray-300 hover:border-gray-400 hover:text-gray-100 border rounded cursor-pointer mt-2  transition-all duration-300"
								onClick={handleAddRole}>
								<img src={AddRoleIcon} alt={t("iconAltName.add")} className="w-4 h-4 mr-2"/>
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
									{t("actionSidebar.saveButton")}
								</button>
								<button
									onClick={onCancel}
									className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300"
								>
									{t("actionSidebar.cancelButton")}
								</button>
							</div>
							{actionHintText && (
								<div className="pt-2 hover:brightness-200 transition-all duration-300">
									<button
										onMouseEnter={handleMouseEnterHint}
										onMouseLeave={handleMouseLeaveHint}
										className="focus:outline-none"
									>
										<img src={HintIcon} alt={t("iconAltName.hint")} className="w-6 h-6"/>
									</button>
								</div>
							)}
						</div>
					</div>
				)}
				{action === 'edit' && target === 'role' && item && (
					<div>
						{isLoadingRoleHolders ? (
							<div className="flex justify-center items-center p-2">
								<ChannelLoadingSpinner/>
							</div>
						) : roleHolders.length > 0 ? (
							<div>
								<h3 className="font-light">{t("actionSidebar.roleHolders")}</h3>
								<ul className="space-y-2 mt-2 max-h-44 overflow-y-auto">
									{roleHolders.map(user => (
										<li key={user.id}
										    className="bg-[#36393F] rounded pl-2 p-1.5 flex justify-between items-center pr-1.5">
											{user.name}
											<button onClick={() => handleRemoveRoleHolder(user.id)}>
												<img
													src={DeleteIcon}
													alt={t("iconAltName.delete")}
													className="w-5 h-5 cursor-pointer hover:brightness-200 transition-all duration-300"
												/>
											</button>
										</li>
									))}
								</ul>
							</div>
						) : (
							<div className="font-light mt-2 mb-2">{t("warnings.noRoleHolders")}</div>
						)}
						{!isLoadingRoleHolders && (
							<div
								className="flex justify-center p-2 border-dashed border-gray-500 text-gray-300 hover:border-gray-400 hover:text-gray-100 border rounded cursor-pointer mt-2  transition-all duration-300"
								onClick={handleAddUserToRole}>
								<img src={AddRoleIcon} alt={t("iconAltName.add")} className="w-4 h-4 mr-2"/>
							</div>
						)}
						<div className="flex justify-between items-center pt-4 pb-1">
							<div className="flex justify-start space-x-3">
								<button
									onClick={handleSaveRoleHolders}
									disabled={isEditRoleHoldersDisabled}
									className={`bg-green-600 ${
										!isEditRoleHoldersDisabled ? 'hover:bg-green-700 transition-all duration-300' : ''
									} text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-40 transition-all duration-300`}
								>
									{t("actionSidebar.saveButton")}
								</button>
								<button
									onClick={onCancel}
									className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300"
								>
									{t("actionSidebar.cancelButton")}
								</button>
							</div>
							{actionHintText && (
								<div className="pt-2 hover:brightness-200 transition-all duration-300">
									<button
										onMouseEnter={handleMouseEnterHint}
										onMouseLeave={handleMouseLeaveHint}
										className="focus:outline-none"
									>
										<img src={HintIcon} alt={t("iconAltName.hint")} className="w-6 h-6"/>
									</button>
								</div>
							)}
						</div>
					</div>
				)}
				{action === 'filter' && target === 'user' && (
					<div ref={filterRef} className="">
						<span className="text-lg font-semibold mb-2">{t("actionSidebar.filter.user")}</span>
						<h3 className="font-light mt-2">{t("filter.filterUsersByGroup")}:</h3>
						<div className="mt-2 space-y-2">
							<button
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
								{t("filter.filterGroup.staff")}
							</button>
							<button
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
								{t("filter.filterGroup.student")}
							</button>
							<button
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
								{t("filter.filterGroup.other")}
							</button>
						</div>
						<div className="flex justify-between items-center pt-4 pb-1">
							<div className="flex justify-start space-x-3">
								<button
									onClick={() => {
										onFilterCancel?.();
										handleFilterGroupChange(null)
									}}
									className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 mt-1 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300"
								>
									{t("actionSidebar.closeButton")}
								</button>
							</div>
						</div>
					</div>
				)}
      </div>}
			{isRoleListOpen && availableRoles.length > 0 && (
				<div ref={dropdownRef} className="w-full pt-5 relative">
					<div className="bg-[#2F3136] rounded p-4">
						<div className="w-full flex flex-row relative">
							<input
								type="text"
								placeholder={t("search.searchByRole")}
								className="w-full p-2 rounded bg-[#292B2F] text-white focus:outline-none"
								value={roleSearchTerm}
								onChange={(e) => setRoleSearchTerm(e.target.value)}
							/>
							<img
								src={SearchIcon}
								alt={t("iconAltName.search")}
								className="w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none"
							/>
						</div>
						<ul className="space-y-2 mt-2 max-h-32 overflow-y-auto">
							{filteredAvailableRoles.length > 0 ? (
								filteredAvailableRoles.map(role => (
									<li key={role.id}
									    onClick={() => handleSelectAvailableRole(role)}
									    className="bg-[#36393F] rounded pl-2 p-1.5 flex items-center hover:bg-[#3e4147] cursor-pointer transition-all duration-300">
										{role.name}
									</li>
								))
							) : (
								<li className="text-gray-400 pt-1">{t("warnings.noRoles")}</li>
							)}
						</ul>
					</div>
				</div>
			)}
			{isUserListOpen && availableUsers.length > 0 && (
				<div ref={userDropdownRef} className="w-full pt-5 relative">
					<div className="bg-[#2F3136] rounded p-4">
						<div className="w-full flex flex-row relative">
							<input
								type="text"
								placeholder={t("search.searchByUsername")}
								className="w-full p-2 rounded bg-[#292B2F] text-white focus:outline-none"
								value={userSearchTerm}
								onChange={(e) => setUserSearchTerm(e.target.value)}
							/>
							<img
								src={SearchIcon}
								alt={t("iconAltName.search")}
								className="w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none"
							/>
						</div>
						<ul className="space-y-2 mt-2 max-h-32 overflow-y-auto">
							{filteredAvailableUsers.length > 0 ? (
								filteredAvailableUsers.map(user => (
									<li key={user.id}
									    onClick={() => handleSelectAvailableUser(user)}
									    className="bg-[#36393F] rounded pl-2 p-1.5 flex items-center hover:bg-[#3e4147] cursor-pointer transition-all duration-300">
										{user.name}
									</li>
								))
							) : (
								<li className="text-gray-400 pt-1">{t("warnings.noUsers")}</li>
							)}
						</ul>
					</div>
				</div>
			)}
			{showHint && actionHintText && (
				<div className="w-full pt-5" style={{opacity: hintOpacity, transition: `opacity 300ms ease-in-out`}}>
					<div className="bg-[#2F3136] rounded p-4">
						<h3 className="font-semibold mb-2">{t("actionSidebar.hintTitle")}</h3>
						<h3 className="font-light">{actionHintText}</h3>
					</div>
				</div>
			)}
		</div>
	);
}

export default ActionSidebar;