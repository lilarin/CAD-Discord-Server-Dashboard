import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {createQueueMessage, getCategories, getChannels} from '@/lib/api';
import {ChannelLoadingSpinner, ComponentLoadingSpinner} from '@/components/LoadingSpinner';
import {Category, Channel} from "@/lib/types.ts";
import toast from 'react-hot-toast';
import DatePicker, {registerLocale} from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {uk} from "date-fns/locale/uk";
import {enUS} from "date-fns/locale/en-US";
import SearchIcon from "@/assets/icons/search.svg";
import DropdownIcon from "@/assets/icons/dropdown.svg";
import {useTranslation} from "react-i18next";

registerLocale("uk", uk);
registerLocale("en", enUS);

export default function Queues() {
	const [categories, setCategories] = useState<Category[]>([]);
	const [selectedCategoryId, setSelectedCategoryIdState] = useState<string | null>(null);
	const [channels, setChannels] = useState<Channel[]>([]);
	const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
	const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
	const [isChannelsLoading, setIsChannelsLoading] = useState(false);

	const [eventTitle, setEventTitle] = useState<string>('');
	const [eventDateTime, setEventDateTime] = useState<Date | null>(null);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

	const [isCategoryActionOpen, setIsCategoryActionOpen] = useState(false);
	const [isChannelActionOpen, setIsChannelActionOpen] = useState(false);
	const [isDateTimeActionOpen, setIsDateTimeActionOpen] = useState(false);

	const categoryRef = useRef<HTMLDivElement>(null);
	const channelRef = useRef<HTMLDivElement>(null);
	const dateTimeRef = useRef<HTMLDivElement>(null);
	const channelActionRef = useRef<HTMLDivElement>(null);
	const categoryActionRef = useRef<HTMLDivElement>(null);

	const [categorySearchTerm, setCategorySearchTerm] = useState<string>('');
	const [channelSearchTerm, setChannelSearchTerm] = useState<string>('');

	const {t, i18n} = useTranslation();
	const currentLocale = i18n.language === 'uk' ? 'uk' : 'en';


	useEffect(() => {
		const fetchCategories = async () => {
			setIsCategoriesLoading(true);
			try {
				const response = await getCategories();
				setCategories(response);
			} catch (error) {
				toast.error(t('error.fetchCategoriesError'), {
					position: "bottom-right",
					duration: 10000
				});
			} finally {
				setIsCategoriesLoading(false);
			}
		};

		fetchCategories().then(() => {
		});
	}, []);

	const setSelectedCategoryId = useCallback(async (categoryId: string | null) => {
		setSelectedCategoryIdState(categoryId);
		setChannels([]);
		setSelectedChannel(null);

		if (categoryId) {
			setIsChannelsLoading(true);
			try {
				const fetchedChannels = await getChannels(categoryId);
				const textChannels = fetchedChannels.filter(channel => channel.type === "text");
				setChannels(textChannels);
			} catch (error) {
				toast.error(t('error.fetchChannelsError'), {
					position: "bottom-right",
					duration: 10000
				});
			} finally {
				setIsChannelsLoading(false);
			}
		} else {
			setIsChannelsLoading(false);
		}
	}, [t]);

	const handleCategorySelect = useCallback((categoryId: string) => {
		setSelectedCategoryId(categoryId === "" ? null : categoryId);
		setCategorySearchTerm('');
	}, [setSelectedCategoryId]);

	const handleChannelSelect = useCallback((channelId: string) => {
		setSelectedChannel(channelId === "" ? null : channelId);
		setChannelSearchTerm('');
	}, []);

	const handleTitleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setEventTitle(event.target.value);
	}, []);

	const handleDateTimeChange = useCallback((date: Date) => {
		const now = new Date();
		if (date < now) {
			setEventDateTime(null);
		} else {
			setEventDateTime(date);
		}
	}, []);

	const handleSubmit = useCallback(async (event: React.FormEvent) => {
		event.preventDefault();

		setIsCategoryActionOpen(false);
		setIsChannelActionOpen(false);
		setIsDateTimeActionOpen(false);
		setIsSubmitting(true);
		try {
			if (selectedChannel) {
				const eventTimeISO = eventDateTime.toISOString();
				await createQueueMessage(selectedChannel, eventTitle, eventTimeISO);
				toast.success(t('eventsPage.successToast'), {
					position: "bottom-right",
					duration: 5000
				});
				setEventTitle('');
				setEventDateTime(null);
				setSelectedChannel(null);
				setSelectedCategoryId(null);
				setChannels([]);
			}
		} catch (error) {
			toast.error(error.message, {
				position: "bottom-right",
				duration: 10000
			});
		} finally {
			setIsSubmitting(false);
		}
	}, [selectedChannel, eventTitle, eventDateTime, setSelectedCategoryId, setChannels, setSelectedChannel, t]);


	const handleCategoryClick = useCallback(() => {
		setIsCategoryActionOpen(true);
		setIsChannelActionOpen(false);
		setIsDateTimeActionOpen(false);
	}, []);

	const handleChannelClick = useCallback(() => {
		if (selectedCategoryId) {
			setIsChannelActionOpen(true);
			setIsCategoryActionOpen(false);
			setIsDateTimeActionOpen(false);
		}
	}, [selectedCategoryId]);

	const handleDateTimeClick = useCallback(() => {
		setIsDateTimeActionOpen(true);
		setIsCategoryActionOpen(false);
		setIsChannelActionOpen(false);
	}, []);

	const filteredCategories = useMemo(() => {
		const term = categorySearchTerm.toLowerCase();
		return categories.filter(category => category.name.toLowerCase().includes(term));
	}, [categories, categorySearchTerm]);

	const filteredChannels = useMemo(() => {
		const term = channelSearchTerm.toLowerCase();
		return channels.filter(channel => channel.name.toLowerCase().includes(term));
	}, [channels, channelSearchTerm]);

	const isSubmitButtonActive = useMemo(() => {
		return !!selectedCategoryId && !!selectedChannel && !!eventTitle.trim() && !!eventDateTime;
	}, [selectedCategoryId, selectedChannel, eventTitle, eventDateTime]);


	return (
		<div className="relative flex w-full h-full p-5">
			{isCategoriesLoading ? (
				<ComponentLoadingSpinner/>
			) : (
				<>
					<div className="w-2/3 h-full flex flex-col">
						<div className="bg-[#2F3136] rounded p-4 mb-5">
							<h2 className="text-2xl font-bold text-white">{t('eventsPage.title')}</h2>
						</div>
						<div className="bg-[#2F3136] rounded p-4">

							<form onSubmit={handleSubmit} className="w-full">
								<div className="mb-3">
									<label htmlFor="eventTitle" className="block text-gray-300 text-sm font-bold mb-2">
										{t('input.eventTitle')}:
									</label>
									<input
										type="text"
										id="eventTitle"
										className="appearance-none rounded w-full py-2 px-2 text-gray-300 bg-[#292B2F] leading-tight focus:outline-none focus:shadow-outline placeholder-gray-500"
										placeholder={t('placeholder.eventTitle')}
										style={{backgroundColor: '#292B2F', color: '#d1d5db'}}
										value={eventTitle}
										onChange={handleTitleChange}
										autoComplete="off"
									/>
								</div>

								<div className="mb-3">
									<label htmlFor="category" className="block text-gray-300 text-sm font-bold mb-2">
										{t('input.category')}:
									</label>
									<div className="relative">
										<div
											onClick={handleCategoryClick}
											ref={categoryRef}
											className={`cursor-pointer block appearance-none w-full bg-[#292B2F] py-2 px-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline ${!selectedCategoryId ? 'text-gray-500' : 'text-gray-300'}`}
										>
											{selectedCategoryId ? categories.find(cat => String(cat.id) === selectedCategoryId)?.name.charAt(0).toUpperCase() + categories.find(cat => String(cat.id) === selectedCategoryId)?.name.slice(1) : t('placeholder.category')}
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

								<div className="mb-3">
									<label htmlFor="channel" className="block text-gray-300 text-sm font-bold mb-2">
										{t('input.channel')}:
									</label>
									<div className="relative">
										<div
											onClick={handleChannelClick}
											ref={channelRef}
											className={`block appearance-none w-full bg-[#292B2F] py-2 px-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline ${!selectedChannel && selectedCategoryId ? 'text-gray-500 cursor-pointer' : !selectedChannel && !selectedCategoryId ? 'text-gray-500 cursor-not-allowed' : 'text-gray-300 cursor-pointer'}`}
										>
											{selectedChannel ? channels.find(chan => String(chan.id) === selectedChannel)?.name.charAt(0).toUpperCase() + channels.find(chan => String(chan.id) === selectedChannel)?.name.slice(1) : (selectedCategoryId ? t('placeholder.channel') : t('eventsPage.channelPlaceholderStart'))}
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

								<div className="mb-3">
									<label htmlFor="eventDateTime" className="block text-gray-300 text-sm font-bold mb-2">
										{t('input.eventDateTime')}:
									</label>
									<div className="relative">
										<div
											onClick={handleDateTimeClick}
											ref={dateTimeRef}
											className={`cursor-pointer block appearance-none w-full bg-[#292B2F] py-2 px-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline ${!eventDateTime ? 'text-gray-500' : 'text-gray-300'}`}
										>
											{eventDateTime ? eventDateTime.toLocaleString(currentLocale, {
												day: '2-digit',
												month: '2-digit',
												year: 'numeric',
												hour: '2-digit',
												minute: '2-digit'
											}) : t('placeholder.eventDateTime')}
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

								<div className="flex items-center justify-between mt-4 mb-1">
									<button
										className={`transition-all duration-300 bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isSubmitting ? 'opacity-50' : ''} ${!isSubmitButtonActive ? 'opacity-50 hover:bg-green-600' : 'hover:bg-green-700'}`}
										type="submit"
										disabled={isSubmitting || !isSubmitButtonActive}
									>
										{isSubmitting ? t('button.createLoading') : (!isSubmitButtonActive ? t('button.fillAllFields') : t('button.create'))}
									</button>
								</div>
							</form>
						</div>
					</div>
					{isCategoryActionOpen && (
						<div ref={categoryActionRef} className="pl-5 w-1/3 sticky top-5">
							<div className="bg-[#2F3136] rounded p-4">
								<span className="text-lg font-semibold mb-2 text-white">{t('eventsPage.selectCategoryTitle')}</span>
								<div className="w-full flex flex-row relative mt-2">
									<input
										type="text"
										placeholder={t('search.searchByCategoryName')}
										className="w-full p-2 rounded bg-[#292B2F] text-white focus:outline-none"
										value={categorySearchTerm}
										onChange={(e) => setCategorySearchTerm(e.target.value)}
									/>
									<img
										src={SearchIcon}
										alt={t('iconAltName.search')}
										className="w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500"
									/>
								</div>
								<div className="mt-2 mb-4 max-h-36 overflow-y-auto">
									{filteredCategories.length > 0 ? (
										filteredCategories.map((category) => (
											<div className="mt-2">
												<button
													key={category.id}
													onClick={() => handleCategorySelect(String(category.id))}
													className={`w-full p-2 rounded text-white transition-all duration-300 bg-[#36393F] hover:bg-[#3e4147] text-left`}
												>
													{category.name.charAt(0).toUpperCase() + category.name.slice(1)}
												</button>
											</div>
										))
									) : (
										<div className="text-gray-400 p-2">{t('warnings.noCategory')}</div>
									)}
								</div>
								<button
									onClick={() => setIsCategoryActionOpen(false)}
									className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300"
								>
									{t('button.closeButton')}
								</button>
							</div>
						</div>
					)}

					{isChannelActionOpen && (
						<div ref={channelActionRef} className="pl-5 w-1/3 sticky top-5">
							<div className="bg-[#2F3136] rounded p-4">
								<span className="text-lg font-semibold mb-2 text-white">{t('eventsPage.selectChannelTitle')}</span>

								<div className="w-full flex flex-row relative mt-2">
									<input
										type="text"
										placeholder={t('search.searchByChannelName')}
										className="w-full p-2 rounded bg-[#292B2F] text-white focus:outline-none"
										value={channelSearchTerm}
										onChange={(e) => setChannelSearchTerm(e.target.value)}
									/>
									<img
										src={SearchIcon}
										alt={t('iconAltName.search')}
										className="w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500"
									/>
								</div>

								<div className="mt-2 mb-4 max-h-36 overflow-y-auto">
									{isChannelsLoading ? (
										<div className="flex justify-center items-center p-2">
											<ChannelLoadingSpinner/>
										</div>
									) : filteredChannels.length > 0 ? (
										filteredChannels.map((channel) => (
											<div className="mt-2">
												<button
													key={channel.id}
													onClick={() => handleChannelSelect(String(channel.id))}
													className={`w-full p-2 rounded text-white transition-all duration-300 bg-[#36393F] hover:bg-[#3e4147] text-left`}
												>
													{channel.name.charAt(0).toUpperCase() + channel.name.slice(1)}
												</button>
											</div>
										))
									) : (
										<div className="text-gray-400 p-2">{t('warnings.noChannels')}</div>
									)}
								</div>
								<button
									onClick={() => setIsChannelActionOpen(false)}
									className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300"
								>
									{t('button.closeButton')}
								</button>
							</div>
						</div>
					)}

					{isDateTimeActionOpen && (
						<div ref={dateTimeRef} className="pl-5 w-1/3 sticky top-5">
							<div className="bg-[#2F3136] rounded p-4">
								<span className="text-lg font-semibold mb-2 text-white">{t('eventsPage.selectDateTimeTitle')}</span>
								<div className="mt-4 datepicker-container w-full">
									<DatePicker
										selected={eventDateTime}
										onChange={handleDateTimeChange}
										showTimeSelect
										timeFormat="HH:mm"
										timeIntervals={15}
										timeCaption={t('eventsPage.timeCaption')}
										dateFormat="dd.MM.yyyy HH:mm"
										className="custom-datepicker w-full"
										placeholderText={t('placeholder.eventDateTime')}
										locale={currentLocale}
										minDate={new Date()}
										inline
										open
									/>
								</div>
								<button
									onClick={() => setIsDateTimeActionOpen(false)}
									className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 mt-3 mb-1 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300"
								>
									{t('button.closeButton')}
								</button>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
}