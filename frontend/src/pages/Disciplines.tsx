import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
	createCategory,
	createChannel,
	deleteCategory,
	deleteChannel,
	getCategories,
	getChannels,
	renameCategory,
	renameChannel,
	updateCategoryPosition,
	updateChannelPosition,
} from '@/lib/api';
import {ChannelLoadingSpinner, ComponentLoadingSpinner} from '@/components/LoadingSpinner';
import CreateCategoryIcon from '@/assets/icons/create_category.svg';
import CreateChannelIcon from '@/assets/icons/create_channel.svg';
import {closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors,} from '@dnd-kit/core';
import {arrayMove, SortableContext, sortableKeyboardCoordinates} from '@dnd-kit/sortable';
import toast from 'react-hot-toast';
import DraggableChannel from "@/components/DraggableChannel.tsx";
import DraggableCategory from "@/components/DraggableCategory.tsx";
import ActionSidebar, {ActionTarget, ActionType} from '@/components//ActionSidebar';
import {Category, Channel} from "@/lib/types.ts";
import SearchIcon from "@/assets/icons/search.svg";
import {useTranslation} from 'react-i18next';

export default function Categories() {
	const [categories, setCategories] = useState<Category[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [openCategoryId, setOpenCategoryId] = useState<number | null>(null);
	const [channels, setChannels] = useState<Channel[]>([]);
	const [isChannelsLoading, setIsChannelsLoading] = useState(false);
	const channelsRef = useRef<HTMLDivElement>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [isDraggingCategory, setIsDraggingCategory] = useState(false);
	const [actionSidebar, setActionSidebar] = useState<{
		action: ActionType;
		target: ActionTarget;
		item: Category | Channel | null;
	}>({action: null, target: null, item: null});
	const {t} = useTranslation();

	const handleActionTriggered = (action: ActionType, target: ActionTarget, item: Category | Channel | null) => {
		setActionSidebar({action, target, item});
	};

	const handleCancelAction = () => {
		setActionSidebar({action: null, target: null, item: null});
	};

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const response = await getCategories();
				setCategories(response);
			} catch (error) {
				toast.error(t('error.fetchCategoriesError'), {
					position: "bottom-right",
					duration: 10000
				});
				console.error(error)
			} finally {
				setIsLoading(false);
			}
		};

		fetchCategories();
	}, [t]);

	const handleCategoryClick = useCallback(
		async (categoryId: number) => {
			if (isDraggingCategory) {
				return;
			}
			if (openCategoryId === categoryId) {
				setOpenCategoryId(null);
				setChannels([]);
				return;
			}
			setOpenCategoryId(categoryId);
			setIsChannelsLoading(true);

			try {
				const fetchedChannels = await getChannels(categoryId.toString());
				setChannels(fetchedChannels);
			} catch (error) {
				toast.error(t('error.fetchChannelsError'), {
					position: "bottom-right",
					duration: 10000
				});
				console.error(error)
			} finally {
				setIsChannelsLoading(false);
			}
		},
		[openCategoryId, isDraggingCategory, t]
	);

	const handleCreateCategory = useCallback(
		async (categoryName: string) => {
			const tempId = Date.now();
			const newCategory: Category = {id: tempId, name: categoryName};
			setCategories((prevCategories) => [...prevCategories, newCategory]);
			setActionSidebar({action: null, target: null, item: null});

			try {
				const categories = await createCategory(categoryName);
				setCategories(categories);
			} catch (error) {
				toast.error(t('error.createCategoryError'), {
					position: "bottom-right",
					duration: 10000
				});
				console.error(error)
				const fetchedCategories = await getCategories();
				setCategories(fetchedCategories);
			}
		},
		[t]
	);

	const handleCreateChannel = useCallback(
		async (channelName: string, channelType: 'text' | 'voice') => {
			const tempId = Date.now();
			const newChannel: Channel = {id: tempId, name: channelName, type: channelType, position: 100};
			setChannels((prevChannels) => [...prevChannels, newChannel]);
			setActionSidebar({action: null, target: null, item: null});

			try {
				const channels = await createChannel(openCategoryId.toString(), channelName, channelType);
				setChannels(channels);
			} catch (error) {
				toast.error(t('error.createChannelError'), {
					position: "bottom-right",
					duration: 10000,
				});
				console.error(error)
				const channels = await getChannels(openCategoryId.toString())
				setChannels(channels);
			}
		},
		[openCategoryId, t]
	);

	const handleRenameCategory = useCallback(
		async (categoryId: number, newName: string) => {
			setCategories(prevCategories =>
				prevCategories.map(category =>
					category.id === categoryId ? {...category, name: newName} : category
				)
			);
			setActionSidebar({action: null, target: null, item: null});

			try {
				const updatedCategories = await renameCategory(categoryId.toString(), newName);
				setCategories(updatedCategories);
			} catch (error) {
				toast.error(t('error.renameCategoryError'), {
					position: "bottom-right",
					duration: 10000,
				});
				console.error(error)
				const fetchedCategories = await getCategories();
				setCategories(fetchedCategories);
			}
		},
		[t]
	);

	const handleRenameChannel = useCallback(
		async (channelId: number, newName: string) => {
			setChannels(prevChannels =>
				prevChannels.map(channel =>
					channel.id === channelId ? {...channel, name: newName} : channel
				)
			);
			setActionSidebar({action: null, target: null, item: null});

			try {
				const updatedChannels = await renameChannel(channelId.toString(), newName);
				setChannels(updatedChannels);
			} catch (error) {
				toast.error(t('error.renameChannelError'), {
					position: "bottom-right",
					duration: 10000,
				});
				console.error(error)
				const fetchedChannels = await getChannels(openCategoryId.toString());
				setChannels(fetchedChannels);
			}
		},
		[openCategoryId, t]
	);

	const handleDeleteCategory = useCallback(
		async (categoryId: number) => {
			if (openCategoryId === categoryId) {
				setOpenCategoryId(null);
				setChannels([]);
			}
			setCategories((prevCategories) =>
				prevCategories.filter((category) => category.id !== categoryId)
			);
			setActionSidebar({action: null, target: null, item: null});

			try {
				const categories = await deleteCategory(categoryId.toString());
				setCategories(categories);
			} catch (error) {
				toast.error(t('error.deleteCategoryError'), {
					position: "bottom-right",
					duration: 10000
				});
				console.error(error)
				const fetchedCategories = await getCategories();
				setCategories(fetchedCategories);
			}
		},
		[openCategoryId, t]
	);

	const handleDeleteChannelFromCategory = useCallback(
		async (channelId: number) => {
			if (!openCategoryId) {
				return;
			}
			setChannels((prevChannels) => prevChannels.filter((channel) => channel.id !== channelId));
			setActionSidebar({action: null, target: null, item: null});

			try {
				const channels = await deleteChannel(channelId.toString());
				setChannels(channels);
			} catch (error) {
				toast.error(t('error.deleteChannelError'), {
					position: "bottom-right",
					duration: 10000
				});
				console.error(error)
				const fetchedChannels = await getChannels(openCategoryId.toString());
				setChannels(fetchedChannels);
			}
		},
		[openCategoryId, t]
	);

	const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(event.target.value);
	};

	const filteredCategories = categories.filter((category) =>
		category.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragStart = useCallback(({active}) => {
		if (categories.find((cat) => cat.id === active.id)) {
			setIsDraggingCategory(true);
		}
	}, [categories]);

	const handleDragEnd = useCallback(
		async ({active, over}) => {
			setIsDraggingCategory(false);
			if (!over || active.id === over.id) {
				return;
			}

			if (categories.find((cat) => cat.id === active.id)) {
				const activeCategoryIndex = categories.findIndex((category) => category.id === active.id);
				const overCategoryIndex = categories.findIndex((category) => category.id === over.id);

				const newCategories = arrayMove(categories, activeCategoryIndex, overCategoryIndex);
				setCategories(newCategories);

				try {
					await updateCategoryPosition(active.id.toString(), overCategoryIndex);
				} catch (error) {
					toast.error(t('error.updateCategoryPositionError'), {
						position: "bottom-right",
						duration: 10000
					});
					console.error(error)
					const fetchedCategories = await getCategories();
					setCategories(fetchedCategories);
				}
			} else if (channels.find((channel) => channel.id === active.id) && openCategoryId) {
				const activeChannel = channels.find((channel) => channel.id === active.id);
				const overChannel = channels.find((channel) => channel.id === over.id);

				if (!activeChannel || !overChannel || activeChannel.type !== overChannel.type) {
					return;
				}

				const activeChannelIndex = channels.findIndex((channel) => channel.id === active.id);
				const overChannelIndex = channels.findIndex((channel) => channel.id === over.id);

				const newChannels = arrayMove(channels, activeChannelIndex, overChannelIndex);
				setChannels(newChannels);

				try {
					await updateChannelPosition(activeChannel.id.toString(), overChannel.position);
					const fetchedChannels = await getChannels(openCategoryId.toString());
					setChannels(fetchedChannels);
				} catch (error) {
					toast.error(t('error.updateChannelPositionError'), {
						position: "bottom-right",
						duration: 10000
					});
					console.error(error)
					const fetchedChannels = await getChannels(openCategoryId.toString());
					setChannels(fetchedChannels);
				}
			}
		},
		[categories, channels, openCategoryId, t]
	);

	const textChannels = channels.filter((channel) => channel.type === 'text');
	const voiceChannels = channels.filter((channel) => channel.type === 'voice');

	return (
		<div className="relative flex w-full h-full p-5">
			{isLoading && (
				<ComponentLoadingSpinner/>
			)}
			<DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}
			            sensors={sensors}>
				<div className="w-2/3">
					{!isLoading && (
						<div className="sticky top-5">
							<div className="mb-5 flex justify-between items-center">
								<div className="w-full flex flex-row relative">
									<input
										type="text"
										placeholder={t('search.searchByCategory')}
										className="w-full p-2 rounded bg-[#292B2F] focus:outline-none pr-8"
										value={searchTerm}
										onChange={handleSearch}
									/>
									<img
										src={SearchIcon}
										alt={t('iconAltName.search')}
										className="w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none"
									/>
								</div>
								<div
									className="flex justify-center p-2 border-dashed border-gray-500 text-gray-300 hover:border-gray-400 hover:text-gray-100 border rounded cursor-pointer w-1/3 ml-5 transition-all duration-300"
									onClick={() => handleActionTriggered('create', 'category', null)}>
									<img src={CreateCategoryIcon} alt={t('actionSidebar.create.category')}
									     className="w-5 h-5 transition-all"/>
								</div>
							</div>
							<SortableContext items={filteredCategories.map((cat) => cat.id)}>
								<div className="space-y-2">
									{filteredCategories.length === 0 && !isLoading && (
										<div className="text-gray-400">{t('warnings.noCategory')}</div>
									)}
									{filteredCategories.map((category) => (
										<div key={category.id}>
											<DraggableCategory
												category={category}
												handleCategoryClick={handleCategoryClick}
												onActionTriggered={handleActionTriggered}
												isDraggingCategoryFromParent={isDraggingCategory}
											/>
											{openCategoryId === category.id && !isDraggingCategory && (
												<div
													ref={channelsRef}
													className="overflow-hidden transition-max-height duration-300 ease-in-out"
												>
													{isChannelsLoading ? (
														<ChannelLoadingSpinner/>
													) : (
														<>
															{textChannels.length > 0 && (
																<SortableContext items={textChannels.map((channel) => channel.id)}>
																	<ul className="space-y-1 mt-1">
																		{textChannels.map((channel) => (
																			<DraggableChannel
																				key={channel.id}
																				channel={channel}
																				onActionTriggered={handleActionTriggered}
																			/>
																		))}
																	</ul>
																</SortableContext>
															)}
															{voiceChannels.length > 0 && (
																<SortableContext items={voiceChannels.map((channel) => channel.id)}>
																	<ul className="space-y-1 mt-1">
																		{voiceChannels.map((channel) => (
																			<DraggableChannel
																				key={channel.id}
																				channel={channel}
																				onActionTriggered={handleActionTriggered}
																			/>
																		))}
																	</ul>
																</SortableContext>
															)}
															{textChannels.length === 0 && voiceChannels.length === 0 && (
																<div className="flex items-center justify-left ml-4 mt-2 mb-2 text-gray-400">
																	{t('warnings.noChannels')}
																</div>
															)}
															<div
																className="flex justify-center p-1.5 border-dashed border-gray-500 text-gray-300 hover:border-gray-400 hover:text-gray-100 border rounded cursor-pointer mt-1.5 ml-4 transition-all duration-300"
																onClick={() => handleActionTriggered('create', 'channel', null)}>
																<img src={CreateChannelIcon} alt={t('actionSidebar.create.channel')}
																     className="w-4 h-4"/>
															</div>
														</>
													)}
												</div>
											)}
										</div>
									))}
								</div>
							</SortableContext>
						</div>
					)}
				</div>
			</DndContext>
			{actionSidebar.action && actionSidebar.target && (
				<div className="w-1/3 pl-5">
					<ActionSidebar
						action={actionSidebar.action}
						target={actionSidebar.target}
						item={actionSidebar.item}
						onCancel={handleCancelAction}
						onDeleteCategory={handleDeleteCategory}
						onDeleteChannel={handleDeleteChannelFromCategory}
						onCreateCategory={handleCreateCategory}
						onCreateChannel={handleCreateChannel}
						onRenameCategory={handleRenameCategory}
						onRenameChannel={handleRenameChannel}
					/>
				</div>
			)}
		</div>
	);
}