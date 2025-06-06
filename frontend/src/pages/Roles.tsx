import React, {useCallback, useEffect, useState} from 'react';
import {createRole, deleteRole, getEditableRoles, renameRole} from '@/lib/api';
import {ComponentLoadingSpinner} from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import {PaginationControl} from "@/hooks/PaginationControl.tsx";
import ActionSidebar, {ActionTarget, ActionType} from '@/components/ActionSidebar';
import RenameIcon from '@/assets/icons/rename.svg';
import DeleteIcon from '@/assets/icons/delete.svg';
import CreateRoleIcon from '@/assets/icons/create_role.svg';
import {Role} from "@/lib/types.ts";
import SearchIcon from "@/assets/icons/search.svg";
import {useTranslation} from "react-i18next";
import EditIcon from "@/assets/icons/edit.svg";


const ITEMS_PER_PAGE = 11;

const usePaginatedRoles = (roles: Role[], setRoles: React.Dispatch<React.SetStateAction<Role[]>>, itemsPerPage: number = ITEMS_PER_PAGE) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);

	const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(event.target.value);
		setCurrentPage(1);
	}, []);

	const filteredRoles = roles.filter((role) =>
		role.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const pageCount = Math.ceil(filteredRoles.length / itemsPerPage);

	const handlePageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber);
	};

	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const rolesOnPage = filteredRoles.slice(startIndex, endIndex);

	return {
		rolesOnPage,
		searchTerm,
		pageCount,
		currentPage,
		handleSearch,
		handlePageChange,
		filteredRoles,
	}
};

export default function Roles({itemsPerPage = ITEMS_PER_PAGE}: { itemsPerPage?: number }) {
	const [roles, setRoles] = useState<Role[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const {t} = useTranslation();

	const {
		rolesOnPage,
		searchTerm,
		pageCount,
		currentPage,
		handleSearch,
		handlePageChange,
		filteredRoles
	} = usePaginatedRoles(roles, setRoles, itemsPerPage);

	useEffect(() => {
		const fetchRoles = async () => {
			setIsLoading(true);
			try {
				const response = await getEditableRoles();
				setRoles(response);
			} catch (error) {
				toast.error(t('error.fetchEditableRolesError'), {
					position: "bottom-right",
					duration: 10000
				});
				console.error(error)
			} finally {
				setIsLoading(false);
			}
		};

		fetchRoles().then(r => {
		});
	}, [setRoles]);

	const [actionSidebar, setActionSidebar] = useState<{
		action: ActionType;
		target: ActionTarget;
		item: Role | null;
	}>({action: null, target: null, item: null});


	const handleActionTriggered = (action: ActionType, target: ActionTarget, item: Role | null) => {
		setActionSidebar({action, target, item});
	};

	const handleCancelAction = () => {
		setActionSidebar({action: null, target: null, item: null});
	};

	const handleCreateRole = useCallback(
		async (roleName: string) => {
			const tempId = Date.now();
			const newRole: Role = {id: tempId, name: roleName};
			setRoles((prevRoles) => [...prevRoles, newRole]);
			setActionSidebar({action: null, target: null, item: null});

			try {
				const roles = await createRole(roleName);
				setRoles(roles);
			} catch (error) {
				toast.error(t('error.createRoleError'), {
					position: "bottom-right",
					duration: 10000
				});
				console.error(error)
				const fetchedRoles = await getEditableRoles();
				setRoles(fetchedRoles);
			}
		},
		[setRoles, t]
	);

	const handleRenameRole = useCallback(
		async (roleId: number, roleName: string) => {
			setRoles((prevRoles) =>
				prevRoles.map((role) =>
					role.id === roleId ? {...role, name: roleName} : role
				)
			);
			setActionSidebar({action: null, target: null, item: null});
			try {
				const roles = await renameRole(roleId.toString(), roleName);
				setRoles(roles);
			} catch (error) {
				toast.error(t('error.renameRoleError'), {
					position: "bottom-right",
					duration: 10000
				});
				console.error(error)
				const fetchedRoles = await getEditableRoles();
				setRoles(fetchedRoles);
			}
		},
		[setRoles, t]
	);

	const handleDeleteRole = useCallback(
		async (roleId: number) => {
			setRoles((prevRoles) => prevRoles.filter((role) => role.id !== roleId));
			setActionSidebar({action: null, target: null, item: null});
			try {
				const roles = await deleteRole(roleId.toString());
				setRoles(roles);
			} catch (error) {
				toast.error(t('error.deleteRoleError'), {
					position: "bottom-right",
					duration: 10000
				});
				console.error(error)
				const fetchedRoles = await getEditableRoles();
				setRoles(fetchedRoles);
			}
		},
		[t, setRoles]
	);


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
								placeholder={t("search.searchByRole")}
								className="w-full p-2 rounded bg-[#292B2F] focus:outline-none pr-8"
								value={searchTerm}
								onChange={handleSearch}
							/>
							<img
								src={SearchIcon}
								alt={t("iconsAltName.search")}
								className="w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none"
							/>
						</div>
						<div
							className="flex justify-center p-2 border-dashed border-gray-500 text-gray-300 hover:border-gray-400 hover:text-gray-100 border rounded cursor-pointer w-1/3 ml-5 transition-all duration-300"
							onClick={() => handleActionTriggered('create', 'role', null)}>
							<img
								src={CreateRoleIcon}
								alt={t("iconsAltName.add")}
								className="w-5 h-5"
							/>
						</div>
					</div>
				)}


				{!isLoading && (
					<div className="flex-grow">
						{filteredRoles.length === 0 ? (
							<div className="text-gray-400">{t('warnings.noRoles')}</div>
						) : (
							<ul className="list-none p-0 space-y-2">
								{rolesOnPage.map((role) => (
									<li key={role.id}
									    className="py-2 px-3 rounded bg-[#2f3136] text-white flex justify-between items-center">
										{role.name}
										<div className="flex items-center space-x-2">
											<button onClick={() => handleActionTriggered('rename', 'role', role)}>
												<img
													src={RenameIcon}
													alt={t("iconsAltName.rename")}
													className="w-5 h-5 cursor-pointer hover:brightness-200 transition-all duration-300"/>
											</button>
											<button onClick={() => handleActionTriggered('edit', 'role', role)}>
												<img
													src={EditIcon}
													alt={t("iconsAltName.editRoles")}
													className="w-5 h-5 cursor-pointer hover:brightness-200 transition-all duration-300"/>
											</button>
											<button onClick={() => handleActionTriggered('delete', 'role', role)}>
												<img
													src={DeleteIcon}
													alt={t("iconsAltName.delete")}
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
					<PaginationControl currentPage={currentPage} pageCount={pageCount} handlePageChange={handlePageChange}/>
				)}
			</div>
			{actionSidebar.action && actionSidebar.target && (
				<div className="pl-5 w-1/3">
					<ActionSidebar
						action={actionSidebar.action}
						target={actionSidebar.target}
						item={actionSidebar.item}
						onCancel={handleCancelAction}
						onCreateRole={handleCreateRole}
						onRenameRole={handleRenameRole}
						onDeleteRole={handleDeleteRole}
					/>
				</div>
			)}
		</div>
	);
}