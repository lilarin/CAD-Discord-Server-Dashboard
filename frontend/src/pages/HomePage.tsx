import React from 'react';
import FilterSearchIcon from "@/assets/icons/filter_search.svg";
import HomePageIcon from "@/assets/icons/index.svg";
import RenameIcon from "@/assets/icons/rename.svg";
import EditIcon from "@/assets/icons/edit.svg";
import KickUserIcon from "@/assets/icons/logout.svg";
import CreateRoleIcon from "@/assets/icons/create_role.svg";
import DeleteIcon from "@/assets/icons/delete.svg";
import CreateCategoryIcon from "@/assets/icons/create_category.svg";
import CreateChannelIcon from "@/assets/icons/create_channel.svg";
import HintIcon from "@/assets/icons/hint.svg";
import LogsIcon from "@/assets/icons/logs.svg";
import EventsIcon from "@/assets/icons/events.svg";
import UsersIcon from "@/assets/icons/users.svg";
import GroupsIcon from "@/assets/icons/groups.svg";
import DisciplinesIcon from "@/assets/icons/disciplines.svg";


const HomePage = () => {
	return (
		<div className="container mx-auto px-5 py-5 ">
			<section className="mb-5">
				<h2 className="text-2xl font-semibold text-white mb-4">Основні Положення</h2>
				<div className="text-gray-300 space-y-3 text-justify">
					<p>
						Ця панель розроблена для зручного управління сервером, включаючи категорії (дисципліни), канали, групи
						(ролі)
						користувачів, самих користувачів, черги на захисти та журнали дій.
						Кожна секція інтуїтивно зрозуміла та дозволяє виконувати необхідні адміністративні функції ефективно та
						швидко.
					</p>
					<p>
						Для навігації використовуйте бокове меню зліва. Кожен розділ меню відповідає за певну область управління
						сервером.
						На сторінках використовуються іконки для швидкої ідентифікації дій та функцій.
					</p>
				</div>
			</section>

			<section className="mb-5">
				<h2 className="text-2xl font-semibold text-white mb-4">Розділи Панелі</h2>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					<div className="bg-[#2F3136] rounded-lg p-6 hover:bg-[#292b2f] transition-all duration-200">
						<div className="flex items-center mb-4">
							<img src={HomePageIcon} alt="Категорії" className="w-8 h-8 mr-3"/>
							<h3 className="text-xl font-semibold text-white">Головна</h3>
						</div>
						<div className="text-gray-300 space-y-2">
							<p>
								Головна сторінка панелі адміністратора з описом призначення панелі, оглядом та пояснення загальних дій, що доступні в інтерфейсі
							</p>
						</div>
					</div>

					<div className="bg-[#2F3136] rounded-lg p-6 hover:bg-[#292b2f]">
						<div className="flex items-center mb-4">
							<img src={DisciplinesIcon} alt="Категорії" className="w-8 h-8 mr-3"/>
							<h3 className="text-xl font-semibold text-white">Категорії</h3>
						</div>
						<div className="text-gray-300 space-y-2">
							<p>
								Розділ дозволяє керувати категоріями (дисциплінами) на сервері.
								Категорії використовуються для структурування каналів та управління доступом до них
							</p>
						</div>
					</div>

					<div className="bg-[#2F3136] rounded-lg p-6 hover:bg-[#292b2f] transition-all duration-200">
						<div className="flex items-center mb-4">
							<img src={GroupsIcon} alt="Групи" className="w-8 h-8 mr-3"/>
							<h3 className="text-xl font-semibold text-white">Групи</h3>
						</div>
						<div className="text-gray-300 space-y-2">
							<p>
								Розділ дозволяє керувати ролями (групами) для користувачів на сервері.
								Групи використовуються для призначення прав доступу до певної категорії
							</p>
						</div>
					</div>

					<div className="bg-[#2F3136] rounded-lg p-6 hover:bg-[#292b2f] transition-all duration-200">
						<div className="flex items-center mb-4">
							<img src={UsersIcon} alt="Користувачі" className="w-8 h-8 mr-3"/>
							<h3 className="text-xl font-semibold text-white">Користувачі</h3>
						</div>
						<div className="text-gray-300 space-y-2">
							<p>
								Розділ призначений для управління користувачами сервера.
								Тут ви можете переглядати, редагувати та виключати користувачів
							</p>
						</div>
					</div>

					<div className="bg-[#2F3136] rounded-lg p-6 hover:bg-[#292b2f] transition-all duration-200">
						<div className="flex items-center mb-4">
							<img src={EventsIcon} alt="Події" className="w-8 h-8 mr-3"/>
							<h3 className="text-xl font-semibold text-white">Захисти</h3>
						</div>
						<div className="text-gray-300 space-y-2">
							<p>
								Розділ дозволяє створити черги для захист робіт студентами.
								Ці черги доступні у каналі у вигляді інтерактивного списку, в який студенти можуть записатись
							</p>
						</div>
					</div>

					<div className="bg-[#2F3136] rounded-lg p-6 hover:bg-[#292b2f] transition-all duration-200">
						<div className="flex items-center mb-4">
							<img src={LogsIcon} alt="Журнали" className="w-8 h-8 mr-3"/>
							<h3 className="text-xl font-semibold text-white">Логи</h3>
						</div>
						<div className="text-gray-300 space-y-2">
							<p>
								Розділ надає доступ до журналу взаємодії з панеллю керування
								Використовуйте цей розділ для відстеження дій адміністраторів
							</p>
						</div>
					</div>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-semibold text-white mb-4">Загальні Іконки Дій</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					<div className="bg-[#2F3136] rounded-lg p-6">
						<div className="flex items-center mb-4">
							<img src={HintIcon} alt="Підказка" className="w-6 h-6 mr-3"/>
							<h3 className="text-lg font-semibold text-white">Підказка</h3>
						</div>
						<p className="text-gray-300">
							Позначає наявність додаткової інформації про функцію, або спосіб використання
						</p>
					</div>

					<div className="bg-[#2F3136] rounded-lg p-6">
						<div className="flex items-center mb-4">
							<img src={FilterSearchIcon} alt="Фільтри пошуку" className="w-6 h-6 mr-3"/>
							<h3 className="text-lg font-semibold text-white">Фільтрація</h3>
						</div>
						<p className="text-gray-300">
							Відкриває панель фільтрації, що дозволяє звузити результати відображення даних
						</p>
					</div>


					<div className="bg-[#2F3136] rounded-lg p-6">
						<div className="flex items-center mb-4">
							<img src={CreateChannelIcon} alt="Створити канал" className="w-6 h-6 mr-3"/>
							<h3 className="text-lg font-semibold text-white">Створити канал</h3>
						</div>
						<p className="text-gray-300">
							Використовується для створення нового каналу в межах певної категорії
						</p>
					</div>

					<div className="bg-[#2F3136] rounded-lg p-6">
						<div className="flex items-center mb-4">
							<img src={CreateCategoryIcon} alt="Створити категорію" className="w-6 h-6 mr-3"/>
							<h3 className="text-lg font-semibold text-white">Створити категорію</h3>
						</div>
						<p className="text-gray-300">
							Використовується для створення нової категорії з каналами (дисципліни)
						</p>
					</div>

					<div className="bg-[#2F3136] rounded-lg p-6">
						<div className="flex items-center mb-4">
							<img src={EditIcon} alt="Редагувати" className="w-6 h-6 mr-3"/>
							<h3 className="text-lg font-semibold text-white">Редагувати</h3>
						</div>
						<p className="text-gray-300">
							Використовується для відкриття панелі налаштувань доступу та груп (ролей)
						</p>
					</div>

					<div className="bg-[#2F3136] rounded-lg p-6">
						<div className="flex items-center mb-4">
							<img src={CreateRoleIcon} alt="Створити (призначити) групу" className="w-6 h-6 mr-3"/>
							<h3 className="text-lg font-semibold text-white">Створити (призначити) групу</h3>
						</div>
						<p className="text-gray-300">
							Використовується для створення та призначення груп (ролей)
						</p>
					</div>

					<div className="bg-[#2F3136] rounded-lg p-6">
						<div className="flex items-center mb-4">
							<img src={RenameIcon} alt="Перейменувати" className="w-6 h-6 mr-3"/>
							<h3 className="text-lg font-semibold text-white">Перейменувати</h3>
						</div>
						<p className="text-gray-300">
							Використовується для перейменування елементів
						</p>
					</div>

					<div className="bg-[#2F3136] rounded-lg p-6">
						<div className="flex items-center mb-4">
							<img src={DeleteIcon} alt="Видалити" className="w-6 h-6 mr-3"/>
							<h3 className="text-lg font-semibold text-white">Видалити</h3>
						</div>
						<p className="text-gray-300">
							Використовується для видалення категорії, каналів або груп
						</p>
					</div>

					<div className="bg-[#2F3136] rounded-lg p-6">
						<div className="flex items-center mb-4">
							<img src={KickUserIcon} alt="Вигнати користувача" className="w-6 h-6 mr-3"/>
							<h3 className="text-lg font-semibold text-white">Вигнати користувача</h3>
						</div>
						<p className="text-gray-300">
							Використовується для вигону користувача з серверу
						</p>
					</div>
				</div>
			</section>
		</div>
	);
};

export default HomePage;