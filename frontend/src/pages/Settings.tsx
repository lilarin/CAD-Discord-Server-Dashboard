import React, {useCallback, useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import {
	createRegistrationMessage,
	createStaffInfoMessage,
	getCategories,
	getChannels,
	getNonCategorizedTextChannels,
	getServerConfig,
	setStaffCategory,
	updateServerLanguage
} from '@/lib/api';
import {Category, Channel, ServerConfig} from '@/lib/types';
import {ChannelLoadingSpinner, ComponentLoadingSpinner} from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import DropdownIcon from "@/assets/icons/dropdown.svg";
import SearchIcon from "@/assets/icons/search.svg";

type SettingsState = {
	isLoading: boolean;
	serverConfig: ServerConfig | null;
	activeSidebar: 'language' | 'registration' | 'staff' | 'staffChannel' | null;
	selectedLanguage: string | null;
	registrationChannel: Channel | null;
	textChannels: Channel[];
	isLoadingChannels: boolean;
	selectedChannelId: string | null;
	channelSearchTerm: string;
	categories: Category[];
	isLoadingCategories: boolean;
	selectedCategoryId: string | null;
	categorySearchTerm: string;
	staffChannel: Channel | null;
	staffChannels: Channel[];
};

const initialState: SettingsState = {
	isLoading: true,
	serverConfig: null,
	activeSidebar: null,
	selectedLanguage: null,
	registrationChannel: null,
	textChannels: [],
	isLoadingChannels: false,
	selectedChannelId: null,
	channelSearchTerm: '',
	categories: [],
	isLoadingCategories: false,
	selectedCategoryId: null,
	categorySearchTerm: '',
	staffChannel: null,
	staffChannels: [],
};

const Settings = () => {
	const {t} = useTranslation();
	const [state, setState] = useState<SettingsState>(initialState);

	const updateState = useCallback((updates: Partial<SettingsState>) => {
		setState(prevState => ({...prevState, ...updates}));
	}, []);

	const loadServerConfig = useCallback(async () => {
		updateState({isLoading: true});

		try {
			const config = await getServerConfig();

			updateState({
				serverConfig: config,
				selectedLanguage: config.language || null,
				registrationChannel: config.registration.channel_id ? {
					id: Number(config.registration.channel_id),
					name: config.registration.channel_name || `Channel #${config.registration.channel_id}`,
					position: 0,
					type: 'text'
				} : null,
				staffChannel: config.staff.channel_id ? {
					id: Number(config.staff.channel_id),
					name: config.staff.channel_name || `Channel #${config.staff.channel_id}`,
					position: 0,
					type: 'text'
				} : null
			});
		} catch (error) {
			console.error('Failed to load server config:', error);
			toast.error(t('error.fetchServerConfigError'), {
				position: "bottom-right",
				duration: 10000
			});
		} finally {
			updateState({isLoading: false});
		}
	}, [updateState]);

	const updateLanguage = useCallback(async (language: string) => {
		if (!language) return;

		if (language === state.serverConfig?.language) return;

		updateState({activeSidebar: null});

		try {
			await updateServerLanguage(language);

			updateState({
				selectedLanguage: language,
				serverConfig: state.serverConfig ? {
					...state.serverConfig,
					language: language
				} : null
			});
		} catch (error) {
			console.error('Failed to update language:', error);
			toast.error(t('error.updateLanguageError'), {
				position: "bottom-right",
				duration: 10000
			});

			updateState({
				selectedLanguage: state.serverConfig?.language || null
			});
		}
	}, [t, state.serverConfig, updateState]);

	const createRegistration = useCallback(async () => {
		if (!state.selectedChannelId && state.selectedChannelId !== 'new') return;

		updateState({activeSidebar: null});

		try {
			const channelIdToSend = state.selectedChannelId === 'new' ? undefined : state.selectedChannelId;

			let selectedChannel: Channel | null = null;

			if (state.selectedChannelId !== 'new' && state.selectedChannelId) {
				const channel = state.textChannels.find(ch => ch.id.toString() === state.selectedChannelId);
				if (channel) {
					selectedChannel = channel;
				}
			}

			await createRegistrationMessage(channelIdToSend);

			if (selectedChannel) {
				updateState({
					registrationChannel: selectedChannel,
					serverConfig: state.serverConfig ? {
						...state.serverConfig,
						registration: {
							...state.serverConfig.registration,
							channel_id: selectedChannel.id.toString(),
							channel_name: selectedChannel.name
						}
					} : null
				});
			} else if (state.selectedChannelId === 'new') {
				try {
					const config = await getServerConfig();
					updateState({
						serverConfig: config,
						registrationChannel: config.registration.channel_id ? {
							id: Number(config.registration.channel_id),
							name: config.registration.channel_name || `Channel #${config.registration.channel_id}`,
							position: 0,
							type: 'text'
						} : null
					});
				} catch (configError) {
					console.error('Failed to update config after creating new channel:', configError);
				}
			}
		} catch (error) {
			console.error('Failed to create registration message:', error);
			toast.error(t('error.createRegistrationMessageError'), {
				position: "bottom-right",
				duration: 10000
			});

			try {
				const config = await getServerConfig();
				updateState({
					serverConfig: config,
					registrationChannel: config.registration.channel_id ? {
						id: Number(config.registration.channel_id),
						name: config.registration.channel_name || `Channel #${config.registration.channel_id}`,
						position: 0,
						type: 'text'
					} : null
				});
			} catch (configError) {
				console.error('Failed to update config after error:', configError);
			}
		} finally {
			updateState({selectedChannelId: null});
		}
	}, [t, state.selectedChannelId, state.textChannels, state.serverConfig, updateState]);

	const setStaffCategoryHandler = useCallback(async () => {
		if (!state.selectedCategoryId && state.selectedCategoryId !== 'new') return;

		updateState({activeSidebar: null});

		try {
			const categoryIdToSend = state.selectedCategoryId === 'new' ? undefined : state.selectedCategoryId;

			let selectedCategory: Category | null = null;

			if (state.selectedCategoryId !== 'new' && state.selectedCategoryId) {
				const category = state.categories.find(cat => cat.id.toString() === state.selectedCategoryId);
				if (category) {
					selectedCategory = category;
				}
			}

			await setStaffCategory(categoryIdToSend);

			if (selectedCategory) {
				updateState({
					serverConfig: state.serverConfig ? {
						...state.serverConfig,
						staff: {
							...state.serverConfig.staff,
							category_id: selectedCategory.id.toString(),
							category_name: selectedCategory.name
						}
					} : null,
					staffChannels: [],
					isLoadingChannels: true
				});

				try {
					const channels = await getChannels(selectedCategory.id.toString());
					updateState({
						staffChannels: channels,
						isLoadingChannels: false
					});
				} catch (channelsError) {
					console.error('Failed to load channels for selected category:', channelsError);
					updateState({isLoadingChannels: false});
				}
			} else if (state.selectedCategoryId === 'new') {
				try {
					const config = await getServerConfig();
					updateState({
						serverConfig: config,
						selectedCategoryId: null
					});
				} catch (configError) {
					console.error('Failed to update config after creating new category:', configError);
				}
			}

		} catch (error) {
			console.error('Failed to set staff category:', error);
			toast.error(t('error.setStaffCategoryError'), {
				position: "bottom-right",
				duration: 10000
			});

			try {
				const config = await getServerConfig();
				updateState({serverConfig: config});
			} catch (configError) {
				console.error('Failed to update config after error:', configError);
			}
		} finally {
			updateState({selectedCategoryId: null});
		}
	}, [state.selectedCategoryId, state.categories, state.serverConfig, t, updateState]);

	const createStaffInfo = useCallback(async () => {
		if (!state.selectedChannelId && state.selectedChannelId !== 'new') return;

		updateState({activeSidebar: null});

		try {
			const channelIdToSend = state.selectedChannelId === 'new' ? undefined : state.selectedChannelId;

			let selectedChannel: Channel | null = null;

			if (state.selectedChannelId !== 'new' && state.selectedChannelId) {
				const channel = state.staffChannels.find(ch => ch.id.toString() === state.selectedChannelId);
				if (channel) {
					selectedChannel = channel;
				}
			}

			await createStaffInfoMessage(channelIdToSend);

			if (selectedChannel) {
				updateState({
					staffChannel: selectedChannel,
					serverConfig: state.serverConfig ? {
						...state.serverConfig,
						staff: {
							...state.serverConfig.staff,
							channel_id: selectedChannel.id.toString(),
							channel_name: selectedChannel.name
						}
					} : null
				});
			} else if (state.selectedChannelId === 'new') {
				try {
					const config = await getServerConfig();
					updateState({
						serverConfig: config,
						staffChannel: config.staff.channel_id ? {
							id: Number(config.staff.channel_id),
							name: config.staff.channel_name || `Channel #${config.staff.channel_id}`,
							position: 0,
							type: 'text'
						} : null
					});
				} catch (configError) {
					console.error('Failed to update config after creating new channel:', configError);
				}
			}

		} catch (error) {
			console.error('Failed to create staff info message:', error);
			toast.error(t('error.createStaffInfoMessageError'), {
				position: "bottom-right",
				duration: 10000
			});

			try {
				const config = await getServerConfig();
				updateState({serverConfig: config});
			} catch (configError) {
				console.error('Failed to update config after error:', configError);
			}
		} finally {
			updateState({selectedChannelId: null});
		}
	}, [state.selectedChannelId, state.staffChannels, state.serverConfig, t, updateState]);

	useEffect(() => {
		loadServerConfig();
	}, [loadServerConfig]);

	const handleOpenLanguageSelector = useCallback(() => {
		updateState({activeSidebar: 'language'});
	}, [updateState]);

	const handleCloseLanguageSelector = useCallback(() => {
		updateState({
			activeSidebar: null,
			selectedLanguage: state.serverConfig?.language || null
		});
	}, [state.serverConfig?.language, updateState]);

	const handleLanguageSelect = useCallback((language: "en" | "uk") => {
		updateState({selectedLanguage: language});
	}, [updateState]);

	const handleSaveLanguage = useCallback(() => {
		if (state.selectedLanguage && state.selectedLanguage !== state.serverConfig?.language) {
			updateLanguage(state.selectedLanguage);
		}
	}, [state.selectedLanguage, state.serverConfig?.language, updateLanguage]);

	const handleOpenChannelSelector = useCallback(async () => {
		updateState({
			activeSidebar: 'registration',
			isLoadingChannels: true,
			textChannels: [],
			selectedChannelId: state.serverConfig?.registration.channel_id || null
		});

		try {
			const channels = await getNonCategorizedTextChannels();

			if (state.serverConfig?.registration.channel_id) {
				const channelId = state.serverConfig.registration.channel_id;
				const channelExists = channels.some(channel => channel.id.toString() === channelId);

				updateState({
					textChannels: channels,
					selectedChannelId: channelExists ? channelId : null,
					isLoadingChannels: false
				});
			} else {
				updateState({
					textChannels: channels,
					isLoadingChannels: false
				});
			}
		} catch (error) {
			console.error('Failed to load channels:', error);
			toast.error(t('error.fetchChannelsError'), {
				position: "bottom-right",
				duration: 10000
			});
			updateState({isLoadingChannels: false});
		}
	}, [state.serverConfig?.registration.channel_id, t, updateState]);

	const handleCloseChannelSelector = useCallback(() => {
		updateState({
			activeSidebar: null,
			selectedChannelId: null
		});
	}, [updateState]);

	const handleChannelSelect = useCallback((channelId: string) => {
		updateState({selectedChannelId: channelId});
	}, [updateState]);

	const handleCreateRegistrationMessage = useCallback(() => {
		createRegistration();
	}, [createRegistration]);

	const handleChannelSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		updateState({channelSearchTerm: e.target.value});
	}, [updateState]);

	const handleOpenStaffCategorySelector = useCallback(async () => {
		updateState({
			activeSidebar: 'staff',
			isLoadingCategories: true,
			categories: [],
			selectedCategoryId: null
		});

		try {
			const categories = await getCategories();

			if (state.serverConfig?.staff.category_id) {
				const categoryId = state.serverConfig.staff.category_id;
				const categoryExists = categories.some(category => category.id.toString() === categoryId);

				if (categoryExists) {
					updateState({
						categories: categories,
						selectedCategoryId: categoryId,
						isLoadingCategories: false
					});
				} else {
					updateState({
						categories: categories,
						isLoadingCategories: false
					});
				}
			} else {
				updateState({
					categories: categories,
					isLoadingCategories: false
				});
			}
		} catch (error) {
			console.error('Failed to load categories:', error);
			toast.error(t('error.fetchCategoriesError'), {
				position: "bottom-right",
				duration: 10000
			});
			updateState({isLoadingCategories: false});
		}
	}, [state.serverConfig?.staff.category_id, t, updateState]);

	const handleCloseStaffCategorySelector = useCallback(() => {
		updateState({
			activeSidebar: null,
			selectedCategoryId: null,
			categorySearchTerm: ''
		});
	}, [updateState]);

	const handleCategorySelect = useCallback((categoryId: string) => {
		updateState({selectedCategoryId: categoryId});
	}, [updateState]);

	const handleCategorySearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		updateState({categorySearchTerm: e.target.value});
	}, [updateState]);

	const handleSaveStaffCategory = useCallback(() => {
		if (state.selectedCategoryId) {
			setStaffCategoryHandler();
		}
	}, [state.selectedCategoryId, setStaffCategoryHandler]);

	const handleOpenStaffChannelSelector = useCallback(async () => {
		if (!state.serverConfig?.staff.category_id) return;

		updateState({
			activeSidebar: 'staffChannel',
			isLoadingChannels: true,
			staffChannels: [],
			selectedChannelId: state.serverConfig.staff.channel_id || null
		});

		try {
			const channels = await getChannels(state.serverConfig.staff.category_id);

			if (state.serverConfig.staff.channel_id) {
				const channelId = state.serverConfig.staff.channel_id;
				const channelExists = channels.some(channel => channel.id.toString() === channelId);

				updateState({
					staffChannels: channels,
					selectedChannelId: channelExists ? channelId : null,
					isLoadingChannels: false
				});
			} else {
				updateState({
					staffChannels: channels,
					isLoadingChannels: false
				});
			}
		} catch (error) {
			console.error('Failed to load channels for staff category:', error);
			toast.error(t('error.fetchChannelsError'), {
				position: "bottom-right",
				duration: 10000
			});
			updateState({isLoadingChannels: false});
		}
	}, [state.serverConfig?.staff.category_id, state.serverConfig?.staff.channel_id, t, updateState]);

	const handleCloseStaffChannelSelector = useCallback(() => {
		updateState({
			activeSidebar: null,
			selectedChannelId: null,
			channelSearchTerm: ''
		});
	}, [updateState]);

	const handleSaveStaffInfoMessage = useCallback(() => {
		if (state.selectedChannelId) {
			createStaffInfo();
		}
	}, [state.selectedChannelId, createStaffInfo]);

	const filteredChannels = state.textChannels.filter(channel =>
		channel.name.toLowerCase().includes(state.channelSearchTerm.toLowerCase())
	);

	const filteredStaffChannels = state.staffChannels.filter(channel =>
		channel.name.toLowerCase().includes(state.channelSearchTerm.toLowerCase())
	);

	const filteredCategories = state.categories.filter(category =>
		category.name.toLowerCase().includes(state.categorySearchTerm.toLowerCase())
	);

	const isLanguageChanged = state.selectedLanguage !== state.serverConfig?.language;

	return (
		<div className="relative flex w-full h-full p-5">
			{state.isLoading ? (
				<ComponentLoadingSpinner/>
			) : (
				<>
					<div className="w-2/3 h-full flex flex-col">
						<div className="bg-[#2F3136] rounded p-4 mb-5">
							<h2 className="text-2xl font-bold text-white">{t('settings.serverSettings')}</h2>
						</div>

						<div className="bg-[#2F3136] rounded p-4">
							<div className="w-full">
								<div className="mb-8">
									<h3 className="block text-gray-300 text-lg font-bold mb-4">
										{t('settings.languageSettings')}
									</h3>

									<div className="mb-3">
										<label className="block text-gray-300 text-sm font-bold mb-2">
											{t('settings.currentLanguage')}:
										</label>
										<div className="relative">
											<div
												onClick={handleOpenLanguageSelector}
												className="cursor-pointer block appearance-none w-full bg-[#292B2F] py-2 px-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline text-gray-300"
											>
												{state.selectedLanguage === 'en'
													? t('settings.english')
													: state.selectedLanguage === 'uk'
														? t('settings.ukrainian')
														: <span className="text-gray-500 cursor-pointer">{t('warnings.noLanguageWarning')}</span>}
											</div>
											<div
												className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-300">
												<img
													src={DropdownIcon}
													alt={t('iconAltName.dropdown')}
													className="w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500"
												/>
											</div>
										</div>
									</div>
								</div>

								<div className="mb-8">
									<h3
										className={`block text-lg font-bold mb-4 ${state.serverConfig?.language ? 'text-gray-300' : 'text-gray-500'}`}>
										{t('settings.registrationSettings')}
									</h3>

									<div className="mb-3">
										<label className="block text-gray-300 text-sm font-bold mb-2">
											{t('settings.registrationChannel')}:
										</label>
										<div className="relative">
											<div
												onClick={state.serverConfig?.language ? handleOpenChannelSelector : undefined}
												className={`block appearance-none w-full bg-[#292B2F] py-2 px-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline text-gray-300 ${state.serverConfig?.language ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
											>
												{state.registrationChannel
													? state.registrationChannel.name
													: <span className="text-gray-500 cursor-pointer">{t('warnings.noRegistrationChannel')}</span>}
											</div>
											<div
												className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-300">
												<img
													src={DropdownIcon}
													alt={t('iconAltName.dropdown')}
													className="w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500"
												/>
											</div>
										</div>
									</div>
								</div>

								<div className="mb-8">
									<h3
										className={`block text-lg font-bold mb-4 ${state.serverConfig?.language ? 'text-gray-300' : 'text-gray-500'}`}>
										{t('settings.staffInformationSettings')}
									</h3>

									<div className="mb-3">
										<label className="block text-gray-300 text-sm font-bold mb-2">
											{t('settings.staffCategory')}:
										</label>
										<div className="relative">
											<div
												onClick={state.serverConfig?.language ? handleOpenStaffCategorySelector : undefined}
												className={`block appearance-none w-full bg-[#292B2F] py-2 px-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline text-gray-300 ${state.serverConfig?.language ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
											>
												{state.serverConfig?.staff.category_id
													? state.serverConfig.staff.category_name || `Category #${state.serverConfig.staff.category_id}`
													: <span className="text-gray-500 cursor-pointer">{t('warnings.noStaffCategory')}</span>}
											</div>
											<div
												className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-300">
												<img
													src={DropdownIcon}
													alt={t('iconAltName.dropdown')}
													className="w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500"
												/>
											</div>
										</div>
									</div>

									{state.serverConfig?.staff.category_id && (
										<div className="mb-3">
											<label className="block text-gray-300 text-sm font-bold mb-2">
												{t('settings.staffChannel')}:
											</label>
											<div className="relative">
												<div
													onClick={state.serverConfig?.language ? handleOpenStaffChannelSelector : undefined}
													className={`block appearance-none w-full bg-[#292B2F] py-2 px-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline text-gray-300 ${state.serverConfig?.language ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
												>
													{state.serverConfig.staff.channel_id
														? state.serverConfig.staff.channel_name || `Channel #${state.serverConfig.staff.channel_id}`
														: <span className="text-gray-500 cursor-pointer">{t('warnings.noStaffChannel')}</span>}
												</div>
												<div
													className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-300">
													<img
														src={DropdownIcon}
														alt={t('iconAltName.dropdown')}
														className="w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500"
													/>
												</div>
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>

					{state.activeSidebar === 'language' && (
						<div className="pl-5 w-1/3 sticky top-5">
							<div className="bg-[#2F3136] rounded p-4">
                                <span
	                                className="text-lg font-semibold mb-2 text-white">{t('settings.selectLanguage')}</span>

								<div className="mt-4 mb-4 space-y-2">
									<button
										onClick={() => handleLanguageSelect('en')}
										className={`w-full p-2 text-left rounded text-white transition-all duration-300
											${state.selectedLanguage === 'en'
											? 'outline-dashed outline-1 outline-offset-[-2px] outline-gray-500 bg-[#36393F] hover:bg-[#3e4147]'
											: 'bg-[#36393F] hover:bg-[#3e4147]'
										}`}
										style={{
											backgroundColor: state.selectedLanguage === 'en' ? '#3e4147' : undefined,
											boxSizing: 'border-box',
										}}
									>
										{t('settings.english')}
									</button>

									<button
										onClick={() => handleLanguageSelect('uk')}
										className={`w-full p-2 text-left rounded text-white transition-all duration-300
											${state.selectedLanguage === 'uk'
											? 'outline-dashed outline-1 outline-offset-[-2px] outline-gray-500 bg-[#36393F] hover:bg-[#3e4147]'
											: 'bg-[#36393F] hover:bg-[#3e4147]'
										}`}
										style={{
											backgroundColor: state.selectedLanguage === 'uk' ? '#3e4147' : undefined,
											boxSizing: 'border-box',
										}}
									>
										{t('settings.ukrainian')}
									</button>
								</div>

								<div className="flex justify-start space-x-3 mt-4">
									<button
										onClick={handleSaveLanguage}
										disabled={!isLanguageChanged}
										className={`${isLanguageChanged ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600 opacity-50 cursor-not-allowed'} text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300`}
									>
										{t('actionSidebar.saveButton')}
									</button>

									<button
										onClick={handleCloseLanguageSelector}
										className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300"
									>
										{t('actionSidebar.closeButton')}
									</button>
								</div>
							</div>
						</div>
					)}

					{state.activeSidebar === 'registration' && (
						<div className="pl-5 w-1/3 sticky top-5">
							<div className="bg-[#2F3136] rounded p-4">
                                <span
	                                className="text-lg font-semibold mb-2 text-white">{t('settings.selectChannel')}</span>

								<div className="w-full flex flex-row relative mt-2 mb-4">
									<input
										type="text"
										placeholder={t('search.searchByChannelName')}
										className="w-full p-2 rounded bg-[#292B2F] text-white focus:outline-none"
										value={state.channelSearchTerm}
										onChange={handleChannelSearchChange}
									/>
									<img
										src={SearchIcon}
										alt={t('iconAltName.search')}
										className="w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500"
									/>
								</div>
								{state.isLoadingChannels ? (
									<div className="flex justify-center items-center p-4">
										<ChannelLoadingSpinner/>
									</div>
								) : (
									<>
										<div className="mt-4 mb-4 space-y-2 max-h-36 overflow-y-auto pr-1">
											{filteredChannels.length > 0 ? (
												filteredChannels.map(channel => (
													<button
														key={channel.id}
														onClick={() => handleChannelSelect(channel.id.toString())}
														className={`w-full p-2 text-left rounded text-white transition-all duration-300
															${state.selectedChannelId === channel.id.toString()
															? 'outline-dashed outline-1 outline-offset-[-2px] outline-gray-500 bg-[#36393F] hover:bg-[#3e4147]'
															: 'bg-[#36393F] hover:bg-[#3e4147]'
														}`}
														style={{
															backgroundColor: state.selectedChannelId === channel.id.toString() ? '#3e4147' : undefined,
															boxSizing: 'border-box',
														}}
													>
														{channel.name}
													</button>
												))
											) : (
												<div className="text-gray-400 text-center p-2">{t('warnings.noChannels')}</div>
											)}
										</div>
										<div className="border-t border-gray-600 pt-2 mb-2"></div>

										<button
											onClick={() => handleChannelSelect('new')}
											className={`w-full p-2 rounded text-white transition-all duration-300
													${state.selectedChannelId === 'new'
												? 'outline-dashed outline-1 outline-offset-[-2px] outline-gray-500 bg-[#36393F] hover:bg-[#3e4147]'
												: 'bg-[#36393F] hover:bg-[#3e4147]'
											}`}
											style={{
												backgroundColor: state.selectedChannelId === 'new' ? '#3e4147' : undefined,
												boxSizing: 'border-box',
											}}
										>
											{t('settings.createNewChannel')}
										</button>

										<div className="flex justify-start space-x-3 mt-4">
											<button
												onClick={handleCreateRegistrationMessage}
												disabled={!state.selectedChannelId}
												className={`bg-green-600 ${state.selectedChannelId ? 'hover:bg-green-700' : 'opacity-50 cursor-not-allowed'} text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300`}
											>
												{t('actionSidebar.saveButton')}
											</button>

											<button
												onClick={handleCloseChannelSelector}
												className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300"
											>
												{t('actionSidebar.closeButton')}
											</button>
										</div>
									</>
								)}
							</div>
						</div>
					)}
					{state.activeSidebar === 'staff' && (
						<div className="pl-5 w-1/3 sticky top-5">
							<div className="bg-[#2F3136] rounded p-4">
								<span className="text-lg font-semibold mb-2 text-white">{t('settings.selectCategory')}</span>

								<div className="w-full flex flex-row relative mt-2 mb-4">
									<input
										type="text"
										placeholder={t('search.searchByCategoryName')}
										className="w-full p-2 rounded bg-[#292B2F] text-white focus:outline-none"
										value={state.categorySearchTerm}
										onChange={handleCategorySearchChange}
									/>
									<img
										src={SearchIcon}
										alt={t('iconAltName.search')}
										className="w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500"
									/>
								</div>

								{state.isLoadingCategories ? (
									<div className="flex justify-center items-center p-4">
										<ChannelLoadingSpinner/>
									</div>
								) : (
									<>
										<div className="mt-4 mb-4 space-y-2 max-h-36 overflow-y-auto pr-1">
											{filteredCategories.length > 0 ? (
												filteredCategories.map(category => (
													<button
														key={category.id}
														onClick={() => handleCategorySelect(category.id.toString())}
														className={`w-full p-2 text-left rounded text-white transition-all duration-300
                    ${state.selectedCategoryId === category.id.toString()
															? 'outline-dashed outline-1 outline-offset-[-2px] outline-gray-500 bg-[#36393F] hover:bg-[#3e4147]'
															: 'bg-[#36393F] hover:bg-[#3e4147]'
														}`}
														style={{
															backgroundColor: state.selectedCategoryId === category.id.toString() ? '#3e4147' : undefined,
															boxSizing: 'border-box',
														}}
													>
														{category.name}
													</button>
												))
											) : (
												<div className="text-gray-400 text-center p-2">{t('warnings.noCategory')}</div>
											)}
										</div>
										<div className="border-t border-gray-600 pt-2 mb-2"></div>

										<button
											onClick={() => handleCategorySelect('new')}
											className={`w-full p-2 rounded text-white transition-all duration-300
                ${state.selectedCategoryId === 'new'
												? 'outline-dashed outline-1 outline-offset-[-2px] outline-gray-500 bg-[#36393F] hover:bg-[#3e4147]'
												: 'bg-[#36393F] hover:bg-[#3e4147]'
											}`}
											style={{
												backgroundColor: state.selectedCategoryId === 'new' ? '#3e4147' : undefined,
												boxSizing: 'border-box',
											}}
										>
											{t('settings.createNewCategory')}
										</button>

										<div className="flex justify-start space-x-3 mt-4">
											<button
												onClick={handleSaveStaffCategory}
												disabled={!state.selectedCategoryId}
												className={`bg-green-600 ${state.selectedCategoryId ? 'hover:bg-green-700' : 'opacity-50 cursor-not-allowed'} text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300`}
											>
												{t('actionSidebar.saveButton')}
											</button>

											<button
												onClick={handleCloseStaffCategorySelector}
												className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300"
											>
												{t('actionSidebar.closeButton')}
											</button>
										</div>
									</>
								)}
							</div>
						</div>
					)}
					{state.activeSidebar === 'staffChannel' && (
						<div className="pl-5 w-1/3 sticky top-5">
							<div className="bg-[#2F3136] rounded p-4">
								<span className="text-lg font-semibold mb-2 text-white">{t('settings.selectChannel')}</span>

								<div className="w-full flex flex-row relative mt-2 mb-4">
									<input
										type="text"
										placeholder={t('search.searchByChannelName')}
										className="w-full p-2 rounded bg-[#292B2F] text-white focus:outline-none"
										value={state.channelSearchTerm}
										onChange={handleChannelSearchChange}
									/>
									<img
										src={SearchIcon}
										alt={t('iconAltName.search')}
										className="w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500"
									/>
								</div>
								{state.isLoadingChannels ? (
									<div className="flex justify-center items-center p-4">
										<ChannelLoadingSpinner/>
									</div>
								) : (
									<>
										<div className="mt-4 mb-4 space-y-2 max-h-36 overflow-y-auto pr-1">
											{filteredStaffChannels.length > 0 ? (
												filteredStaffChannels.map(channel => (
													<button
														key={channel.id}
														onClick={() => handleChannelSelect(channel.id.toString())}
														className={`w-full p-2 text-left rounded text-white transition-all duration-300
                    ${state.selectedChannelId === channel.id.toString()
															? 'outline-dashed outline-1 outline-offset-[-2px] outline-gray-500 bg-[#36393F] hover:bg-[#3e4147]'
															: 'bg-[#36393F] hover:bg-[#3e4147]'
														}`}
														style={{
															backgroundColor: state.selectedChannelId === channel.id.toString() ? '#3e4147' : undefined,
															boxSizing: 'border-box',
														}}
													>
														{channel.name}
													</button>
												))
											) : (
												<div className="text-gray-400 text-center p-2">{t('warnings.noChannels')}</div>
											)}
										</div>
										<div className="border-t border-gray-600 pt-2 mb-2"></div>

										<button
											onClick={() => handleChannelSelect('new')}
											className={`w-full p-2 rounded text-white transition-all duration-300
                ${state.selectedChannelId === 'new'
												? 'outline-dashed outline-1 outline-offset-[-2px] outline-gray-500 bg-[#36393F] hover:bg-[#3e4147]'
												: 'bg-[#36393F] hover:bg-[#3e4147]'
											}`}
											style={{
												backgroundColor: state.selectedChannelId === 'new' ? '#3e4147' : undefined,
												boxSizing: 'border-box',
											}}
										>
											{t('settings.createNewChannel')}
										</button>

										<div className="flex justify-start space-x-3 mt-4">
											<button
												onClick={handleSaveStaffInfoMessage}
												disabled={!state.selectedChannelId}
												className={`bg-green-600 ${state.selectedChannelId ? 'hover:bg-green-700' : 'opacity-50 cursor-not-allowed'} text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300`}
											>
												{t('actionSidebar.saveButton')}
											</button>

											<button
												onClick={handleCloseStaffChannelSelector}
												className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300"
											>
												{t('actionSidebar.closeButton')}
											</button>
										</div>
									</>
								)}
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default Settings;