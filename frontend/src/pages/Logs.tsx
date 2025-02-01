import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {getLogs} from '@/lib/api';
import {ComponentLoadingSpinner} from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import {PaginationControl} from "@/hooks/PaginationControl.tsx";
import SearchIcon from "@/assets/icons/search.svg";
import FilterSearchIcon from "@/assets/icons/filter_search.svg";
import HintIcon from "@/assets/icons/hint.svg";
import {Log} from "@/lib/types.ts";
import DatePicker, {registerLocale} from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {uk} from "date-fns/locale/uk";

registerLocale("uk", uk);

const ITEMS_PER_PAGE = 7;

const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const logDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

	const timeFormat = date.toLocaleTimeString('uk-UA', {hour: '2-digit', minute: '2-digit'});
	const diffInDays = Math.round((today.getTime() - logDate.getTime()) / (1000 * 3600 * 24));

	if (diffInDays === 0) {
		return `Сьогодні о ${timeFormat}`;
	} else if (diffInDays === 1) {
		return `Вчора о ${timeFormat}`;
	} else if (diffInDays === 2) {
		return `Позавчора о ${timeFormat}`;
	} else if (diffInDays <= 7) {
		const daysOfWeek = ['неділі', 'понеділка', 'вівторка', 'середи', 'четверга', 'пʼятниці', 'суботи'];
		const dayOfWeek = daysOfWeek[date.getDay()];
		const preposition = getPrepositionForDay(date.getDay());
		return `${timeFormat} ${preposition} ${dayOfWeek}`;
	} else {
		return timeFormat + ' ' + date.toLocaleDateString('uk-UA');
	}
};

const getPrepositionForDay = (dayIndex: number): 'минулого' | 'минулої' => {
	switch (dayIndex) {
		case 1:
		case 2:
		case 4:
			return 'минулого';
		case 3:
		case 5:
		case 6:
		case 0:
		default:
			return 'минулої';
	}
};


const usePaginatedLogs = (logs: Log[], itemsPerPage: number = ITEMS_PER_PAGE) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

	const filteredLogs = useMemo(() => {
		let filtered = logs;

		if (dateRange[0] && dateRange[1]) {
			filtered = filtered.filter(log => {
				const logDate = new Date(log.created_at);
				return logDate >= dateRange[0] && logDate <= dateRange[1];
			});
		}

		if (searchTerm) {
			const term = searchTerm.toLowerCase();
			filtered = filtered.filter((log) =>
				Object.values(log).some(value =>
					typeof value === 'string' && value.toLowerCase().includes(term)
				)
			);
		}
		return filtered;
	}, [logs, searchTerm, dateRange]);

	const {logsOnPage, pageCount} = useMemo(() => {
		const calculatedPageCount = Math.ceil(filteredLogs.length / itemsPerPage);
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		const currentLogsOnPage = filteredLogs.slice(startIndex, endIndex);
		return {logsOnPage: currentLogsOnPage, pageCount: calculatedPageCount};
	}, [filteredLogs, currentPage, itemsPerPage]);


	const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(event.target.value);
		setCurrentPage(1);
	}, []);

	const handlePageChange = useCallback((pageNumber: number) => {
		setCurrentPage(pageNumber);
	}, []);

	const handleDateChange = useCallback((dates: [Date | null, Date | null]) => {
		setDateRange(dates);
		setCurrentPage(1);
	}, []);

	const handleResetFilters = useCallback(() => {
		setDateRange([null, null]);
		setSearchTerm('');
		setCurrentPage(1);
	}, []);


	return {
		logsOnPage,
		searchTerm,
		pageCount,
		currentPage,
		handleSearch,
		handlePageChange,
		handleDateChange,
		filteredLogs,
		dateRange,
		handleResetFilters,
	};
};


export default function Logs() {
	const [logs, setLogs] = useState<Log[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const filterRef = useRef<HTMLDivElement>(null);
	const [showHint, setShowHint] = useState(false);
	const hintText = "Фільтри дозволяють відобразити логи за вибраний період часу. Перший клік визначає початок періоду пошуку, а другий його кінець"

	const {
		logsOnPage,
		searchTerm,
		pageCount,
		currentPage,
		handleSearch,
		handlePageChange,
		filteredLogs,
		handleDateChange,
		dateRange,
		handleResetFilters,
	} = usePaginatedLogs(logs, ITEMS_PER_PAGE);


	useEffect(() => {
		const fetchLogsData = async () => {
			setIsLoading(true);
			try {
				const response = await getLogs();
				setLogs(response);
			} catch (error) {
				toast.error(error.message || "Failed to load logs", {
					position: "bottom-right",
					duration: 10000
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchLogsData().then(() => {
		});
	}, []);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (isFilterOpen && filterRef.current && !filterRef.current.contains(event.target as Node)) {
				setIsFilterOpen(false);
			}
		}

		if (isFilterOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		} else {
			document.removeEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isFilterOpen]);

	const handleFilterClick = () => {
		setIsFilterOpen(prev => !prev);
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
								placeholder="Пошук по логам..."
								className="w-full p-2 rounded bg-[#292B2F] focus:outline-none pr-8 text-white"
								value={searchTerm}
								onChange={handleSearch}
							/>
							<img
								src={SearchIcon}
								alt="Пошук"
								className="w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500"
							/>
						</div>
						<div
							onClick={handleFilterClick}
							className={`flex justify-center p-2 border-dashed border-gray-500 text-gray-300 hover:border-gray-400 hover:text-gray-100 border rounded cursor-pointer w-1/3 ml-5 relative transition-all duration-300 ${isFilterOpen ? 'pointer-events-none' : ''}`}>
							<img src={FilterSearchIcon} alt="Фільтри пошуку" className="w-5 h-5"/>
						</div>
					</div>
				)}

				{!isLoading && (
					<div className="flex-grow">
						{filteredLogs.length === 0 ? (
							<div className="text-gray-400">Логів не знайдено</div>
						) : (
							<div className="overflow-x-auto">
								<table className="min-w-full divide-y divide-gray-700 bg-[#2f3136] rounded table-fixed">
									<thead className="bg-[#292B2F] w-full">
									<tr className="text-center text-xs text-gray-300 uppercase font-medium">
										<th scope="col" className="w-1/3 px-6 py-3">
											Користувач
										</th>
										<th scope="col" className="w-1/3 px-6 py-3">
											Виконана дія
										</th>
										<th scope="col" className="w-1/3 px-6 py-3">
											Час виконання
										</th>
									</tr>
									</thead>
									<tbody className="divide-y divide-gray-800">
									{logsOnPage.map((log, index) => (
										<tr key={index}>
											<td className="px-6 py-4 whitespace-nowrap w-1/3">
												<div className="flex items-center">
													<div className="flex-shrink-0 h-10 w-10">
														<img className="h-10 w-10 rounded-full" src={log.user_avatar}
														     alt={`Аватар ${log.user_name}`}/>
													</div>
													<div className="ml-4">
														<div className="text-sm font-medium text-white">
															{log.user_name}
														</div>
													</div>
												</div>
											</td>
											<td
												className="px-6 py-4 whitespace-normal text-sm text-gray-200 w-1/3 text-center">{log.action}</td>
											<td
												className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 w-1/3 text-center">
												{formatDate(log.created_at)}
											</td>
										</tr>
									))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				)}

				{pageCount > 1 && (
					<PaginationControl currentPage={currentPage} pageCount={pageCount} handlePageChange={handlePageChange}/>
				)}
			</div>
			{isFilterOpen && (
				<div ref={filterRef} className="pl-5 w-1/3 sticky top-5">
					<div className="bg-[#2F3136] rounded p-4">
						<span className="text-lg font-semibold mb-2 text-white">Налаштування фільтрації</span>
						<div className="mt-4 datepicker-container w-full">
							<DatePicker
								selectsRange
								startDate={dateRange[0]}
								endDate={dateRange[1]}
								onChange={handleDateChange}
								monthsShown={1}
								locale="uk"
								open={true}
								inline
								className="custom-datepicker w-full"
								dateFormat="dd/MM/yyyy"
								wrapperClassName="datepicker-wrapper"
							/>
						</div>
						<div className="flex justify-between items-center pt-4 pb-1">
							<div className="flex justify-start space-x-3">
								<button
									onClick={() => setIsFilterOpen(false)}
									className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 mt-1 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300"
								>
									Закрити
								</button>
								<button
									onClick={handleResetFilters}
									className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 mt-1 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300"
								>
									Скинути фільтри
								</button>
							</div>
							{hintText && (
								<div className="pt-2 over:brightness-200 transition-all duration-300 align-center">
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
								<h3 className="font-semibold mb-2 text-white">Підказка</h3>
								<h3 className="font-light text-gray-300">{hintText}</h3>
							</div>
						</div>
					)}
				</div>
			)}
			<style>{`
          .datepicker-wrapper {
              width: 100%;
          }

          .react-datepicker {
              width: 100%;
              font-size: 1rem;
              border-color: #36393F;
          }

          .react-datepicker__month-container {
              width: 100%;
          }

          .react-datepicker__day-name,
          .react-datepicker__day,
          .react-datepicker__time-name {
              width: 2.5rem;
              line-height: 2rem;
          }

          .react-datepicker__header {
              padding-top: 0.8rem;
              padding-bottom: 0.8rem;
          }
			`}</style>
		</div>
	);
}