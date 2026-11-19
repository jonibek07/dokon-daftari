import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import {
  auth, db, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendEmailVerification, sendPasswordResetEmail, signOut, collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, getDoc, writeBatch
} from './fb.js';
/* ---------------- til (o'zbek / rus) ---------------- */
let LANG = (() => { try { return localStorage.getItem('dokon-lang') === 'ru' ? 'ru' : 'uz'; } catch (e) { return 'uz'; } })();
const RU = {
  "so'm": 'сум', 'yangi': 'новое', 'Bugun': 'Сегодня', 'Kecha': 'Вчера', 'Avvalgi kun': 'Позавчера',
  'Kunlik tushum grafigi': 'График дневной выручки',
  'Xush kelibsiz!': 'Добро пожаловать!',
  "Daftar toza. Har kuni kechqurun shu ikki ishni qiling, qolgan statistikani ilova o'zi chiqaradi:": 'Журнал пуст. Каждый вечер делайте две вещи, остальную статистику приложение посчитает само:',
  'Kunlik savdoni kiriting: naqd, karta va Click/Payme.': 'Внесите дневные продажи: наличные, карта и Click/Payme.',
  'Shu kungi rasxodlarni turi bilan yozing.': 'Запишите расходы за день с указанием вида.',
  'Savdo kiritish': 'Внести продажи', 'Rasxod kiritish': 'Внести расход',
  'Kunlik chek': 'Дневной чек', 'Oldingi kun': 'Предыдущий день', 'Keyingi kun': 'Следующий день',
  "Mening do'konim": 'Мой магазин', 'BUGUN · ': 'СЕГОДНЯ · ', "Savdo bo'lmagan kun": 'День без продаж',
  'Naqd': 'Наличные', 'Karta': 'Карта', 'Click/Payme': 'Click/Payme', 'Dollar': 'Доллары',
  'Jami tushum': 'Итого выручка', 'Rasxod': 'Расход', 'Sof qoldiq': 'Чистый остаток',
  "karta summasi ko'rsatilmagan (0 degani emas)": 'сумма по карте не указана (это не 0)',
  "kurs {0} so'm": 'курс {0} сум',
  'bu kun rasxod kiritilmagan: bu foyda emas, tushum': 'расходы за день не внесены: это выручка, а не прибыль',
  'Kechagiga nisbatan': 'К вчерашнему дню', 'Kechagi kun kiritilmagan': 'Вчерашний день не внесён',
  'Tahrirlash': 'Изменить', 'Izoh: {0}': 'Примечание: {0}',
  'Bugungi savdo hali kiritilmagan': 'Сегодняшние продажи ещё не внесены',
  'Bu kun uchun savdo yozilmagan': 'За этот день продажи не внесены',
  'Savdoni kiritish': 'Внести продажи', '{0} kun kiritilgan': 'внесено дней: {0}',
  'Oy tushumi': 'Выручка за месяц', "O'rtacha kunlik": 'В среднем за день', "{0} so'm": '{0} сум',
  'rasxod kiritilmagan': 'расходы не внесены', 'oy oxiriga ~{0}': 'прогноз ~{0}', 'tushum': 'выручка',
  'Oylik reja': 'План на месяц', 'bajarildi': 'выполнено', 'Reja bajarildi, barakalla!': 'План выполнен, отлично!',
  'Qolgan {0} kunda kuniga ~{1} kerak': 'Осталось {0} дн., нужно ~{1} в день', 'Yetmadi: {0}': 'Не хватило: {0}',
  "Oylik savdo rejasini qo'ying: har kuni qancha sotish kerakligini hisoblab beraman.": 'Поставьте план продаж на месяц: приложение посчитает, сколько нужно продавать в день.',
  "Qo'yish ›": 'Поставить ›', "To'lov turlari": 'Способы оплаты',
  "{0} kunda karta summasi ko'rsatilmagan, shuning uchun karta ulushi taxminiy.": 'За {0} дн. сумма по карте не указана, поэтому доля карты приблизительная.',
  'Naqd qoldiq (naqd savdo − naqd rasxod)': 'Остаток наличных (нал. продажи − нал. расходы)',
  "So'nggi 14 kun": 'Последние 14 дней', 'ustunni bosing': 'нажмите на столбец', 'kiritilmagan': 'не внесено',
  '14 kunlik tushum': 'Выручка за 14 дней', 'karta: —': 'карта: —', 'Nasiyada': 'В долг', "Ko'rish ›": 'Открыть ›',
  "so'm · {0} kishi": 'сум · {0} чел.', "{0} ta muddati o'tgan": 'просрочено: {0}',
  "Saqlandi: {0} — savdo bo'lmagan kun": 'Сохранено: {0} — день без продаж', "Saqlandi: {0} — {1} so'm": 'Сохранено: {0} — {1} сум',
  "{0} o'chirildi": '{0}: удалено', 'Savdoni tahrirlash': 'Изменить продажи', 'Kunlik savdo': 'Продажи за день',
  'kiritilgan': 'внесено', 'Sana': 'Дата', "Bu kun savdo bo'lmadi (do'kon yopiq)": 'В этот день продаж не было (закрыто)',
  'Karta (terminal)': 'Карта (терминал)', "Click / Payme / o'tkazma": 'Click / Payme / перевод', "— ko'rsatilmagan": '— не указано',
  "Kurs, so'm": 'Курс, сум', 'Dollar kursini kiriting (Markaziy bank kursi).': 'Укажите курс доллара (курс ЦБ).',
  "{0} $ × {1} = {2} so'm": '{0} $ × {1} = {2} сум', 'Izoh (ixtiyoriy)': 'Примечание (необязательно)',
  "Masalan: bayram, yomg'ir, aksiya": 'Например: праздник, дождь, акция',
  "Bu yerdan yozib bo'lmaydi: sizda faqat ko'rish huquqi bor.": 'Здесь нельзя вносить данные: у вас только право просмотра.',
  'Saqlanmoqda…': 'Сохранение…', 'Yangilash': 'Обновить', 'Saqlash': 'Сохранить', "Ha, o'chir": 'Да, удалить', "O'chirish": 'Удалить',
  'Yozuvlar': 'Записи', '{0} kun': '{0} дн.', 'Hali savdo kiritilmagan.': 'Продажи ещё не вносились.',
  'Naqd {0}': 'Нал. {0}', 'Karta {0}': 'Карта {0}', 'Click {0}': 'Click {0}', '{0} ni tahrirlash': 'Изменить: {0}', "Yana ko'rsatish": 'Показать ещё',
  "Rasxod qo'shildi: {0}, {1} so'm": 'Расход добавлен: {0}, {1} сум', "Rasxod o'chirildi": 'Расход удалён', 'Yangi rasxod': 'Новый расход',
  'Summa': 'Сумма', 'Turi': 'Вид', 'Rasxod turi': 'Вид расхода', "Qanday to'landi": 'Способ оплаты', "To'lov turi": 'Способ оплаты',
  'Masalan: Coca-Cola, 10 blok': 'Например: краска для волос, 10 шт.', "Rasxodni qo'shish": 'Добавить расход',
  'Oldingi oy': 'Предыдущий месяц', 'Keyingi oy': 'Следующий месяц', "jami {0} so'm": 'итого {0} сум', "Turlari bo'yicha": 'По видам',
  "Ro'yxat": 'Список', '{0} ta': '{0} шт.', "Bu oyda rasxod yo'q.": 'В этом месяце расходов нет.', "O'chir": 'Удалить', 'Bekor qilish': 'Отмена',
  "{0} rasxodini o'chirish": 'Удалить расход: {0}',
  'Tovar xaridi': 'Закупка товара', 'Ijara': 'Аренда', 'Ish haqi': 'Зарплата', 'Kommunal': 'Коммунальные', 'Transport': 'Транспорт',
  'Soliq': 'Налоги', 'Aloqa/internet': 'Связь/интернет', "Xo'jalik": 'Хозрасходы', 'Boshqa': 'Прочее',
  'Butun davr': 'Весь период', 'Jami qayd etilgan savdo tushumi': 'Всего зафиксировано выручки', 'Hisobot kunlari': 'Дней с отчётом',
  "Savdo bo'lgan": 'С продажами', 'Savdosiz kun': 'Без продаж', "Hisobot yo'q": 'Нет отчёта',
  "O'rtacha kunlik (hisobot kunlariga)": 'В среднем за день (по дням с отчётом)', 'Eng yuqori kun': 'Лучший день',
  "Eng past (savdo bo'lgan)": 'Слабейший день (с продажами)', 'Qaytarilmagan qarz/nasiya': 'Невозвращённые долги',
  "Bu savdo tushumi, foyda emas. Foydani bilish uchun tovar tannarxi va barcha xarajatlar kerak. Qarz va nasiya tushumga qo'shilmagan.": 'Это выручка, а не прибыль. Для расчёта прибыли нужны себестоимость товара и все расходы. Долги в выручку не включены.',
  "Hisobot yo'q kunlar ({0}): {1}. Ular nol savdo deb hisoblanmagan.": 'Дни без отчёта ({0}): {1}. Они не считаются днями с нулевыми продажами.',
  "Karta summasi ko'rsatilmagan kunlar ({0}): {1}. \"—\" nol degani emas, karta ulushi shu sababli taxminiy.": 'Дни без суммы по карте ({0}): {1}. «—» не означает ноль, поэтому доля карты приблизительная.',
  "Savdo bo'lmagan kunlar: {0}.": 'Дни без продаж: {0}.',
  "Rasxodlar {0} kun uchun kiritilgan. To'liq reyestr bo'lmaguncha sof foydani ishonchli hisoblab bo'lmaydi.": 'Расходы внесены за {0} дн. Пока реестр расходов неполный, чистую прибыль надёжно посчитать нельзя.',
  "Rasxodlar hali kiritilmagan. Tovar xaridi, ijara, ish haqi, kommunal to'lovlar va soliqni yozib borsangiz, foyda hisoblanadi.": 'Расходы ещё не вносились. Записывайте закупки, аренду, зарплату, коммунальные платежи и налоги, тогда появится расчёт прибыли.',
  "Tovar tannarxi va ombor qoldig'i kiritilmagan: yalpi foyda va rentabellik hozircha hisoblanmaydi.": 'Себестоимость товара и складские остатки не внесены: валовую прибыль и рентабельность пока посчитать нельзя.',
  "Ma'lumotlar sifati": 'Качество данных', 'cheklovlar': 'ограничения',
  "Oylar bo'yicha": 'По месяцам', 'oyni bosing': 'нажмите на месяц', 'Oy': 'Месяц', 'Kun': 'Дни', 'Tushum': 'Выручка', "O'rtacha": 'Среднее', 'Jami': 'Итого',
  "* joriy oy, yakunlanmagan. O'rtacha = tushum ÷ hisobot kunlari.": '* текущий месяц, не завершён. Среднее = выручка ÷ дни с отчётом.',
  'Bu oy uchun hali savdo kiritilmagan.': 'За этот месяц продажи ещё не внесены.',
  "Tushum o'tgan oyning shu davriga nisbatan {0}% ko'p ({1} va {2}).": 'Выручка на {0}% выше, чем за тот же период прошлого месяца ({1} против {2}).',
  "Tushum o'tgan oyning shu davriga nisbatan {0}% kam ({1} va {2}).": 'Выручка на {0}% ниже, чем за тот же период прошлого месяца ({1} против {2}).',
  "Bu oy rasxodlar kiritilmagan, shuning uchun sof foydani hisoblab bo'lmaydi.": 'В этом месяце расходы не внесены, поэтому чистую прибыль посчитать нельзя.',
  "Rasxod tushumdan {0} ga ko'p. Agar ko'p tovar olingan bo'lsa, bu normal, aks holda xarajatlarni ko'rib chiqing.": 'Расходы превышают выручку на {0}. Если была крупная закупка, это нормально, иначе проверьте затраты.',
  "Har 100 so'm tushumdan {0} so'm qo'lda qolmoqda (kiritilgan rasxodlar chiqarilgandan keyin).": 'Из каждых 100 сум выручки остаётся {0} сум (после внесённых расходов).',
  "To'lovlar: naqd {0}%, karta {1}%": 'Оплаты: наличные {0}%, карта {1}%', ', Click/Payme {0}%': ', Click/Payme {0}%',
  ', dollar {0}% ({1} $)': ', доллары {0}% ({1} $)', " {0} kunda karta ko'rsatilmagan, karta ulushi taxminiy.": ' За {0} дн. карта не указана, доля карты приблизительная.',
  "Eng savdoli kun — {0} (o'rtacha {1}), eng sust — {2} ({3}). Aksiyalarni sust kunga qo'ying.": 'Самый торговый день — {0} (в среднем {1}), самый слабый — {2} ({3}). Акции лучше проводить в слабый день.',
  'Rasxodning {0}%i — {1} ({2}).': '{0}% расходов — {1} ({2}).', "Oyning eng yaxshi kuni: {0} — {1} so'm.": 'Лучший день месяца: {0} — {1} сум.',
  "Hisobot yo'q kunlar: {0}. Ular nol deb hisoblanmagan{1}.": 'Дни без отчёта: {0}. Они не считаются нулевыми{1}.',
  ", iloji bo'lsa kiriting": ', по возможности внесите их',
  "Shu sur'atda oy oxiriga taxminan {0} tushum bo'ladi (taxmin).": 'При таком темпе выручка к концу месяца составит около {0} (прогноз).',
  "{0} kun · {1} so'm": '{0} дн. · {1} сум', 'Xulosalar': 'Выводы', 'avtomatik': 'автоматически', 'Kunlik tushum': 'Дневная выручка',
  "o'rtacha kunlik (chiziq)": 'среднее за день (линия)', "O'tgan oy bilan": 'С прошлым месяцем', '1–{0}-kunlar': '1–{0} числа',
  "to'liq oy": 'полный месяц', "O'zgarish": 'Изменение', "O'rtacha/kun": 'Среднее/день', 'Hafta kunlari': 'Дни недели',
  "o'rtacha tushum, 90 kun": 'средняя выручка, 90 дней', "Ma'lumot yetarli emas.": 'Недостаточно данных.', 'Rasxod turlari': 'Виды расходов',
  'Bu oyda rasxod kiritilmagan.': 'В этом месяце расходы не внесены.', 'Oxirgi 6 oy': 'Последние 6 месяцев', 'tushum va rasxod': 'выручка и расходы',
  'Tushum {0}': 'Выручка {0}', 'Rasxod {0}': 'Расход {0}',
  'Claude tahlili': 'Анализ Claude', "shu oy ma'lumotlari bo'yicha": 'по данным этого месяца',
  "Raqamlaringizni o'qib, holatni tushuntiradi va aniq maslahatlar beradi.": 'Прочитает ваши цифры, объяснит ситуацию и даст конкретные советы.',
  "O'ylayapti…": 'Думает…', 'Tahlil qilinmoqda…': 'Анализирую…', 'Qayta tahlil qilish': 'Проанализировать заново', 'Tahlil qilib ber': 'Сделать анализ',
  "Hozir so'rovlar ko'p. Bir necha daqiqadan keyin qayta urinib ko'ring.": 'Сейчас много запросов. Попробуйте через несколько минут.',
  "Tahlilni olib bo'lmadi. Qayta urinib ko'ring.": 'Не удалось получить анализ. Попробуйте ещё раз.',
  "Qarz yozildi: {0}, {1} so'm": 'Долг записан: {0}, {1} сум', "Nasiya yozildi: {0}, {1} so'm": 'Товар в долг записан: {0}, {1} сум',
  "{0}: to'liq to'landi": '{0}: погашено полностью', "{0}: {1} to'landi, qoldi {2}": '{0}: оплачено {1}, осталось {2}', "O'chirildi": 'Удалено',
  'Qaytarilmagan qarz va nasiya': 'Невозвращённые долги', '{0} kishi': '{0} чел.', "{0} ta muddati o'tgan · {1}": 'просрочено: {0} · {1}',
  "Qarz va nasiya savdo tushumiga ham, xarajatga ham qo'shilmaydi: alohida nazorat qilinadi.": 'Долги не входят ни в выручку, ни в расходы: учитываются отдельно.',
  '+ Yangi qarz yoki nasiya': '+ Новый долг', 'Yangi yozuv': 'Новая запись', 'Yopish': 'Закрыть', 'Nasiya (tovar)': 'Товар в долг', 'Qarz (pul)': 'Долг деньгами',
  'Kim oldi': 'Кто взял', "Ism, mo'ljal": 'Имя, ориентир', 'Telefon (ixtiyoriy)': 'Телефон (необязательно)', 'Qachon oldi': 'Когда взял',
  'Qaytarish muddati': 'Срок возврата', 'Nima oldi (ixtiyoriy)': 'Что взял (необязательно)', "Masalan: un 2 qop, yog'": 'Например: шампунь, 2 шт.',
  "Nasiya ro'yxati": 'Список долгов', 'Qaytarilmagan ({0})': 'Не возвращено ({0})', "To'langan ({0})": 'Погашено ({0})',
  "Qarzdorlar yo'q.": 'Должников нет.', "Hali to'langan nasiya yo'q.": 'Погашенных долгов пока нет.', 'pul qarz': 'долг деньгами', 'nasiya': 'товар в долг',
  '{0}dan beri · {1} kun': 'с {0} · {1} дн.', "to'landi {0}": 'погашено {0}', "muddati {0} kun o'tdi": 'просрочено на {0} дн.',
  'muddati bugun': 'срок сегодня', '{0} kun qoldi': 'осталось {0} дн.', 'muddat: {0}': 'срок: {0}', "to'langan {0}": 'оплачено {0}',
  "To'liq to'landi": 'Погашено полностью', "{0} qisman to'lov summasi": 'Сумма частичной оплаты: {0}', 'qisman': 'частично', 'Ayirish': 'Вычесть',
  'Bekor': 'Отмена', "{0} yozuvini o'chirish": 'Удалить запись: {0}',
  'Sozlamalar saqlandi': 'Настройки сохранены', 'Sozlamalar': 'Настройки', "Do'kon nomi": 'Название магазина', 'Masalan: Baraka market': 'Например: Baraka market',
  'Oylik savdo rejasi': 'План продаж на месяц',
  "Reja qo'ysangiz, bosh sahifada necha foiz bajarilgani va har kuni qancha sotish kerakligi ko'rinadi.": 'Если поставить план, на главной будет видно, на сколько процентов он выполнен и сколько нужно продавать в день.',
  'Excel uchun yuklab olish (CSV)': 'Скачать для Excel (CSV)', 'Savdolar': 'Продажи', 'Rasxodlar': 'Расходы', "Faylni saqlab bo'lmadi": 'Не удалось сохранить файл',
  'Dollar ($)': 'Доллары ($)', 'Kurs': 'Курс', "Dollar (so'm)": 'Доллары (сум)', "Jami (so'm)": 'Итого (сум)', 'Izoh': 'Примечание', "To'lov": 'Оплата',
  "Do'kon daftari": 'Журнал магазина', '{0} · savdo va rasxod': '{0} · продажи и расходы', "Ma'lumotlar yuklanmoqda…": 'Загрузка данных…', "Bo'limlar": 'Разделы',
  "Daftarga ulanib bo'lmadi. Claude hisobingizga kirganingizni tekshiring va daftarni claude.ai ichida oching. Shu holatda yozib bo'lmaydi.": 'Не удалось подключиться к журналу. Проверьте, что вы вошли в аккаунт Claude, и откройте журнал внутри claude.ai. В таком режиме вносить данные нельзя.',
  "Siz daftarni faqat ko'ra olasiz. Ma'lumot kiritish uchun egasi sizga tahrirlash huquqini berishi kerak.": 'Вы можете только просматривать журнал. Чтобы вносить данные, владелец должен дать вам право редактирования.',
  "Daftar ma'lumotlari sizga ko'rinmayapti: ularni ko'rish uchun egasi ruxsat berishi kerak.": 'Данные журнала вам не видны: владелец должен открыть вам доступ.',
  "Ma'lumotlarga hali ulanib bo'lmadi. Internetni tekshiring, ko'rsatilganlar eski bo'lishi mumkin.": 'Пока не удалось подключиться к данным. Проверьте интернет, показанные данные могут быть устаревшими.',
  "Ma'lumotlarni o'qib bo'lmadi": 'Не удалось прочитать данные', "Sizda bu yerga yozish huquqi yo'q.": 'У вас нет права вносить данные.',
  "Joy to'ldi. Eski yozuvlarni o'chiring.": 'Место закончилось. Удалите старые записи.', "Internet yo'q. Birozdan keyin qayta urinib ko'ring.": 'Нет интернета. Попробуйте чуть позже.',
  "Saqlab bo'lmadi. Qayta urinib ko'ring.": 'Не удалось сохранить. Попробуйте ещё раз.', 'Tilni almashtirish': 'Сменить язык',
  'Savdo, rasxod va qarzlar hisobi': 'Учёт продаж, расходов и долгов', 'Yuklanmoqda…': 'Загрузка…', 'Kirish': 'Войти',
  "Ro'yxatdan o'tish": 'Регистрация', 'Parol': 'Пароль', 'kamida 6 belgi': 'минимум 6 символов', 'Yashirish': 'Скрыть', "Ko'rsatish": 'Показать',
  'Parolni unutdim': 'Забыли пароль?', 'Avval emailingizni yozing.': 'Сначала введите email.',
  'Parolni tiklash xati {0} ga yuborildi.': 'Письмо для сброса пароля отправлено на {0}.', 'Xat qayta yuborildi.': 'Письмо отправлено повторно.',
  "Emailingizni tasdiqlang: {0} manziliga xat yubordik. Xatdagi havolani bosing, keyin «Tasdiqladim» tugmasini bosing.": 'Подтвердите email: мы отправили письмо на {0}. Нажмите ссылку в письме, затем кнопку «Подтвердил».',
  "Xat kelmasa, «Spam» papkasini tekshiring.": 'Если письма нет, проверьте папку «Спам».', 'Tasdiqladim': 'Подтвердил',
  'Xatni qayta yuborish': 'Отправить письмо ещё раз', 'Chiqish': 'Выйти',
  "Sizga hali ruxsat berilmagan. Do'kon egasidan {0} emailini sotuvchi sifatida qo'shishini so'rang, keyin «Qayta tekshirish» ni bosing.": 'У вас пока нет доступа. Попросите владельца магазина добавить {0} как продавца, затем нажмите «Проверить снова».',
  'Qayta tekshirish': 'Проверить снова', "Email yoki parol noto'g'ri.": 'Неверный email или пароль.',
  "Bu email bilan akkaunt bor. «Kirish» ni tanlang.": 'Аккаунт с этим email уже есть. Выберите «Войти».',
  "Parol kamida 6 belgidan iborat bo'lsin.": 'Пароль должен быть не короче 6 символов.', "Email noto'g'ri yozilgan.": 'Email введён неверно.',
  "Ko'p urinish bo'ldi. Birozdan keyin qayta urinib ko'ring.": 'Слишком много попыток. Попробуйте чуть позже.', "Internet yo'q.": 'Нет интернета.',
  'Xatolik: {0}': 'Ошибка: {0}',
  "Internet yo'q: yozuvlar telefonda saqlanadi va internet chiqqanda o'zi yuboriladi.": 'Нет интернета: записи сохраняются в телефоне и отправятся сами, когда появится связь.',
  'Claude bilan tahlil': 'Анализ с Claude',
  "Shu oy ma'lumotlarini nusxalab, Claude chatiga joylang: chuqur tahlil va maslahatlar olasiz.": 'Скопируйте данные за месяц и вставьте в чат Claude: получите подробный анализ и советы.',
  'Hisobotni nusxalash': 'Скопировать отчёт',
  "Nusxa olindi. Endi Claude chatiga joylang va «tahlil qil» deb yozing.": 'Скопировано. Вставьте в чат Claude и напишите «сделай анализ».',
  "Nusxa olib bo'lmadi. Quyidagi matnni belgilab, o'zingiz nusxalang.": 'Не удалось скопировать. Выделите текст ниже и скопируйте вручную.',
  "Claude'dagi eski daftar": 'Старый журнал в Claude',
  "{0} ta yozuv hali ko'chirilmagan. Ko'chirganda bu yerda kiritilganlar o'zgarmaydi.": 'Ещё не перенесено записей: {0}. При переносе внесённые здесь данные не изменятся.',
  "Ko'chirish": 'Перенести', "Ha, ko'chir": 'Да, перенести', "Ko'chirildi: {0} ta yozuv": 'Перенесено записей: {0}',
  'Sotuvchilar': 'Продавцы',
  "Sotuvchi shu email bilan ro'yxatdan o'tadi. U savdo, rasxod va nasiya kirita oladi, lekin o'chira olmaydi va tahlilni ko'rmaydi.": 'Продавец регистрируется с этим email. Он может вносить продажи, расходы и долги, но не может удалять записи и не видит анализ.',
  'Sotuvchi emaili': 'Email продавца', 'Ismi (ixtiyoriy)': 'Имя (необязательно)', "Qo'shish": 'Добавить', "Sotuvchi qo'shildi: {0}": 'Продавец добавлен: {0}',
  "Hali sotuvchi qo'shilmagan.": 'Продавцы ещё не добавлены.', '{0} ni olib tashlash': 'Убрать {0}', 'Akkaunt': 'Аккаунт', 'Egasi': 'Владелец', 'Sotuvchi': 'Продавец',
  "Ilovani telefonga o'rnatish": 'Установить приложение на телефон',
  "iPhone'da: pastdagi «Ulashish» tugmasi → «Bosh ekranga qo'shish».": 'На iPhone: кнопка «Поделиться» внизу → «На экран Домой».',
  "O'rnatish": 'Установить', 'kiritdi: {0}': 'внёс: {0}',
  "Chatda yuborilgan «eski-daftar.json» faylini tanlang. Ko'chirganda bu yerda kiritilganlar o'zgarmaydi.": 'Выберите файл «eski-daftar.json», присланный в чате. При переносе внесённые здесь данные не изменятся.',
  'Faylni tanlash': 'Выбрать файл', "Bu fayl eski daftar fayli emas.": 'Это не файл старого журнала.',
  "Bu fayldagi hamma yozuvlar allaqachon ko'chirilgan.": 'Все записи из этого файла уже перенесены.',
  "Claude'dagi eski daftaringizni ⚙️ Sozlamalar → «Ko'chirish» orqali bir bosishda olib o'tasiz.": 'Старый журнал из Claude можно перенести одним нажатием: ⚙️ Настройки → «Перенести».'
};
const T = (s, ...a) => {
  const base = LANG === 'ru' && Object.prototype.hasOwnProperty.call(RU, s) ? RU[s] : s;
  return a.length ? base.replace(/\{(\d)\}/g, (_, i) => (a[i] == null ? '' : a[i])) : base;
};
const UZ_OY = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
const RU_OY = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const RU_OY_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const UZ_OYQ = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'];
const RU_OYQ = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const UZ_HAFTA = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
const RU_HAFTA = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
const UZ_HQ = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];
const RU_HQ = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
let OYLAR, OYQ, HAFTA, HQ;
function applyLang(l) {
  LANG = l === 'ru' ? 'ru' : 'uz';
  OYLAR = LANG === 'ru' ? RU_OY : UZ_OY; OYQ = LANG === 'ru' ? RU_OYQ : UZ_OYQ;
  HAFTA = LANG === 'ru' ? RU_HAFTA : UZ_HAFTA; HQ = LANG === 'ru' ? RU_HQ : UZ_HQ;
  try { document.documentElement.lang = LANG; } catch (e) { /* */ }
}
applyLang(LANG);


/* ---------------- yordamchi funksiyalar ---------------- */
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return ymd(d); };
const today = () => ymd(new Date());
const ymOf = s => s.slice(0, 7);
const addMonths = (ym, n) => { const [y, m] = ym.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; };
const daysIn = ym => { const [y, m] = ym.split('-').map(Number); return new Date(y, m, 0).getDate(); };
const oyNomi = ym => { const [y, m] = ym.split('-').map(Number); return `${OYLAR[m - 1]} ${y}`; };
const sanaUz = s => { const d = parse(s); return LANG === 'ru' ? `${d.getDate()} ${RU_OY_GEN[d.getMonth()]}` : `${d.getDate()}-${OYLAR[d.getMonth()].toLowerCase()}`; };
const sanaNuqta = s => { const d = parse(s); return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`; };
const NB = ' ';
const r2 = x => Math.round((Number(x) || 0) * 100) / 100;
const fmt = n => {
  const v = r2(n); const a = Math.abs(v); let i = Math.floor(a); let f = Math.round((a - i) * 100);
  if (f === 100) { i += 1; f = 0; }
  return (v < 0 ? '−' : '') + i.toString().replace(/\B(?=(\d{3})+(?!\d))/g, NB) + (f ? ',' + pad(f) : '');
};
const parseKurs = s => { const v = parseFloat(String(s || '').replace(/[\s ]/g, '').replace(',', '.')); return isFinite(v) && v > 0 ? r2(v) : 0; };
const kursStr = v => (v ? String(r2(v)).replace('.', ',') : '');
const qisqa = n => {
  const a = Math.abs(n || 0), sg = (n || 0) < 0 ? '−' : '';
  if (a >= 1e9) return sg + (a / 1e9).toFixed(1).replace('.', ',').replace(/,0$/, '') + NB + (LANG === 'ru' ? 'млрд' : 'mlrd');
  if (a >= 1e6) return sg + (a / 1e6).toFixed(a >= 1e8 ? 0 : 1).replace('.', ',').replace(/,0$/, '') + NB + (LANG === 'ru' ? 'млн' : 'mln');
  if (a >= 1e3) return sg + Math.round(a / 1e3) + NB + (LANG === 'ru' ? 'тыс.' : 'ming');
  return sg + Math.round(a);
};
const foiz = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const jami = r => r2((r.naqd || 0) + (r.karta || 0) + (r.otkazma || 0) + (r.usdSom || 0));
const sum = (arr, f) => r2(arr.reduce((s, x) => s + (Number(f(x)) || 0), 0));
const num = v => Number(String(v || '').replace(/\D/g, '')) || 0;
const newId = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID() : 'id' + Date.now() + Math.random().toString(36).slice(2));
const kunFarqi = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);

const TURLAR = [
  ['Tovar xaridi', 'var(--k1)'], ['Ijara', 'var(--k2)'], ['Ish haqi', 'var(--k3)'],
  ['Kommunal', 'var(--k4)'], ['Transport', 'var(--k5)'], ['Soliq', 'var(--k6)'],
  ['Aloqa/internet', 'var(--k7)'], ["Xo'jalik", 'var(--k8)'], ['Boshqa', 'var(--k9)']
];
const turRang = t => (TURLAR.find(x => x[0] === t) || TURLAR[8])[1];
const TOLOV = [['naqd', 'Naqd'], ['karta', 'Karta'], ['otkazma', 'Click/Payme']];
const tolovNomi = k => T((TOLOV.find(x => x[0] === k) || TOLOV[0])[1]);
const PAY_COLORS = { naqd: 'var(--accent)', karta: 'var(--saffron)', otkazma: 'var(--plum)', usdSom: 'var(--k6)' };
const KANAL = [['naqd', 'Naqd'], ['karta', 'Karta'], ['otkazma', 'Click/Payme'], ['usdSom', 'Dollar']];
const kanalNomi = k => (KANAL.find(x => x[0] === k) || KANAL[0])[1];
/* ketma-ket sanalarni "24–28-sentabr, 2-oktabr" ko'rinishida yozish */
function sanalarMatni(list) {
  const s = [...list].sort(); const out = []; let i = 0;
  while (i < s.length) {
    let j = i; while (j + 1 < s.length && addDays(s[j], 1) === s[j + 1] && ymOf(s[j + 1]) === ymOf(s[i])) j++;
    const a = parse(s[i]), b = parse(s[j]);
    out.push(i === j ? sanaUz(s[i]) : LANG === 'ru' ? `${a.getDate()}–${b.getDate()} ${RU_OY_GEN[b.getMonth()]}` : `${a.getDate()}–${b.getDate()}-${OYLAR[b.getMonth()].toLowerCase()}`);
    i = j + 1;
  }
  return out.join(', ');
}

/* ---------------- ma'lumotlar ombori (Firebase) ---------------- */
let reportErr = () => {};
let ME = '';
let ROLE = 'owner';
function errText(e) {
  const c = (e && e.code) || '';
  if (c.includes('permission-denied')) return T("Sizda bu yerga yozish huquqi yo'q.");
  if (c.includes('resource-exhausted')) return T("Joy to'ldi. Eski yozuvlarni o'chiring.");
  if (c.includes('unavailable')) return T("Internet yo'q. Birozdan keyin qayta urinib ko'ring.");
  return T("Saqlab bo'lmadi. Qayta urinib ko'ring.");
}
// Yozuv darhol telefonda saqlanadi va ekranda ko'rinadi; internet bo'lganda serverga o'zi ketadi.
const write = p => { p.catch(e => reportErr(errText(e))); return Promise.resolve(true); };

const nn = v => (v == null ? null : Number(v) || 0);
const tx = (v, n) => String(v || '').slice(0, n);
const cleanSavdo = r => ({ sana: r.sana, naqd: Number(r.naqd) || 0, karta: nn(r.karta), otkazma: Number(r.otkazma) || 0, usd: Number(r.usd) || 0, kurs: Number(r.kurs) || 0, usdSom: Number(r.usdSom) || 0, izoh: tx(r.izoh, 300), t: Number(r.t) || Date.now(), manba: 'Claude daftari' });
const cleanRasxod = r => ({ sana: tx(r.sana, 10), tur: tx(r.tur, 40), summa: Number(r.summa) || 0, tolov: tx(r.tolov, 20), izoh: tx(r.izoh, 300), t: Number(r.t) || Date.now() });
const cleanNasiya = r => ({ ism: tx(r.ism, 80), tel: tx(r.tel, 30), summa: Number(r.summa) || 0, boshlangich: Number(r.boshlangich) || Number(r.summa) || 0, turi: r.turi === 'qarz' ? 'qarz' : 'nasiya', sana: tx(r.sana, 10), muddat: tx(r.muddat, 10), izoh: tx(r.izoh, 200), tolangan: !!r.tolangan, tolanganJami: Number(r.tolanganJami) || 0, tolanganSana: tx(r.tolanganSana, 10), t: Number(r.t) || Date.now() });

function useStore(isOwner) {
  const [savdo, setSavdo] = useState([]);
  const [rasxod, setRasxod] = useState([]);
  const [nasiya, setNasiya] = useState([]);
  const [soz, setSoz] = useState({});
  const [sozBor, setSozBor] = useState(false);
  const [xodimlar, setXodimlar] = useState([]);
  const [got, setGot] = useState({ s: false, r: false, n: false });
  const [warn, setWarn] = useState('');
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && navigator.onLine === false);

  useEffect(() => {
    const on = () => setOffline(false), off = () => setOffline(true);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  useEffect(() => {
    const unsubs = [];
    const timer = setTimeout(() => setWarn(T("Ma'lumotlarga hali ulanib bo'lmadi. Internetni tekshiring, ko'rsatilganlar eski bo'lishi mumkin.")), 10000);
    const fresh = s => { if (!s.metadata.fromCache) { clearTimeout(timer); setWarn(''); } };
    const onErr = e => { clearTimeout(timer); setWarn(T("Ma'lumotlarni o'qib bo'lmadi") + (e && e.code ? ` (${e.code})` : '') + '.'); setGot({ s: true, r: true, n: true }); };
    const rows = s => s.docs.map(d => Object.assign({ id: d.id }, d.data()));
    unsubs.push(onSnapshot(collection(db, 'savdo'), s => { setSavdo(rows(s)); setGot(g => ({ ...g, s: true })); fresh(s); }, onErr));
    unsubs.push(onSnapshot(collection(db, 'rasxod'), s => { setRasxod(rows(s)); setGot(g => ({ ...g, r: true })); fresh(s); }, onErr));
    unsubs.push(onSnapshot(collection(db, 'nasiya'), s => { setNasiya(rows(s)); setGot(g => ({ ...g, n: true })); fresh(s); }, onErr));
    unsubs.push(onSnapshot(doc(db, 'sozlama', 'asosiy'), d => { setSoz(d.exists() ? d.data() : {}); setSozBor(d.exists()); }, () => {}));
    if (isOwner) unsubs.push(onSnapshot(collection(db, 'xodimlar'), s => setXodimlar(rows(s)), () => {}));
    return () => { clearTimeout(timer); unsubs.forEach(u => u()); };
  }, [isOwner]);

  const stamp = r => Object.assign({}, r, { kim: ME });
  const api = {
    saveSavdo: rec => write(setDoc(doc(db, 'savdo', rec.sana), stamp(rec))),
    delSavdo: sana => write(deleteDoc(doc(db, 'savdo', sana))),
    addRasxod: rec => write(setDoc(doc(collection(db, 'rasxod')), stamp(rec))),
    delRasxod: id => write(deleteDoc(doc(db, 'rasxod', id))),
    addNasiya: rec => write(setDoc(doc(collection(db, 'nasiya')), stamp(rec))),
    updNasiya: (id, patch) => write(updateDoc(doc(db, 'nasiya', id), stamp(patch))),
    delNasiya: id => write(deleteDoc(doc(db, 'nasiya', id))),
    saveSoz: s => write(setDoc(doc(db, 'sozlama', 'asosiy'), s)),
    addXodim: (email, ism) => write(setDoc(doc(db, 'xodimlar', email), { ism, qoshildi: Date.now() })),
    delXodim: email => write(deleteDoc(doc(db, 'xodimlar', email))),
    // Claude'dagi eski daftardan ko'chirish: faqat hali yo'q yozuvlar yoziladi, kiritilganlar o'zgarmaydi
    importOld: (OLD, haveS, haveR, haveN, hasSoz) => {
      const b = writeBatch(db); let n = 0;
      const okId = x => typeof x === 'string' && /^[\w.:@+-]{1,120}$/.test(x);
      (OLD.savdo || []).forEach(r => { if (r && /^\d{4}-\d{2}-\d{2}$/.test(r.sana) && !haveS.has(r.sana)) { b.set(doc(db, 'savdo', r.sana), cleanSavdo(r)); n++; } });
      (OLD.rasxod || []).forEach(r => { if (r && okId(r.id) && !haveR.has(r.id)) { b.set(doc(db, 'rasxod', r.id), cleanRasxod(r)); n++; } });
      (OLD.nasiya || []).forEach(r => { if (r && okId(r.id) && !haveN.has(r.id)) { b.set(doc(db, 'nasiya', r.id), cleanNasiya(r)); n++; } });
      if (!hasSoz && OLD.soz) b.set(doc(db, 'sozlama', 'asosiy'), { nom: String(OLD.soz.nom || '').slice(0, 60), reja: Number(OLD.soz.reja) || 0 });
      write(b.commit());
      return n;
    }
  };
  const ready = got.s && got.r && got.n;
  return { mode: 'db', ready, savdo, rasxod, nasiya, soz, sozBor, xodimlar, warn, offline, readOnly: false, api };
}

/* ---------------- hisob-kitob ---------------- */
function oyStat(S, R, ym, gacha) {
  const inM = s => s.startsWith(ym) && (!gacha || Number(s.slice(8)) <= gacha);
  const days = S.filter(r => inM(r.sana)).sort((a, b) => a.sana.localeCompare(b.sana));
  const exp = R.filter(r => inM(r.sana));
  const naqd = sum(days, r => r.naqd), karta = sum(days, r => r.karta), otkazma = sum(days, r => r.otkazma);
  const usdSom = sum(days, r => r.usdSom), usd = sum(days, r => r.usd);
  const tushum = r2(naqd + karta + otkazma + usdSom);
  const kartaYoq = days.filter(r => r.karta == null).map(r => r.sana);
  const nolKun = days.filter(r => jami(r) === 0).map(r => r.sana);
  const rasxod = sum(exp, r => r.summa);
  const naqdRasxod = sum(exp.filter(r => r.tolov === 'naqd'), r => r.summa);
  const byCat = TURLAR.map(([k, c]) => ({ k, c, v: sum(exp.filter(r => r.tur === k), r => r.summa) })).filter(x => x.v > 0).sort((a, b) => b.v - a.v);
  const sorted = [...days].sort((a, b) => jami(b) - jami(a));
  return {
    ym, days, exp, naqd, karta, otkazma, usdSom, usd, tushum, rasxod, sof: r2(tushum - rasxod),
    kartaYoq, nolKun, savdoKun: days.length - nolKun.length,
    kunlar: days.length, ortacha: days.length ? tushum / days.length : 0,
    kassa: naqd - naqdRasxod, byCat,
    best: sorted[0] || null, worst: sorted.filter(r => jami(r) > 0).slice(-1)[0] || null
  };
}
function haftaStat(S) {
  return HAFTA.map((n, i) => {
    const d = S.filter(r => parse(r.sana).getDay() === i);
    return { i, n, q: HQ[i], kun: d.length, avg: d.length ? sum(d, jami) / d.length : 0 };
  });
}

/* ---------------- kichik komponentlar ---------------- */
function Delta({ a, b, inv }) {
  if (!b && !a) return <span className="delta flat">—</span>;
  if (!b) return <span className="delta flat">{T("yangi")}</span>;
  const p = Math.round(((a - b) / Math.abs(b)) * 100);
  const good = inv ? p < 0 : p > 0;
  const cls = p === 0 ? 'flat' : good ? 'up' : 'down';
  return <span className={'delta ' + cls}>{p > 0 ? '▲' : p < 0 ? '▼' : '•'} {Math.abs(p)}%</span>;
}

function MoneyInput({ id, label, value, onChange, dot, autoFocus, disabled, placeholder }) {
  const shown = value ? fmt(num(value)) : '';
  return (
    <div className="field">
      <label htmlFor={id} className="money-label">{dot && <span className="dot" style={{ background: dot }} />}{label}</label>
      <div className="money">
        <input id={id} className="input" inputMode="numeric" autoComplete="off" placeholder={placeholder || '0'} autoFocus={autoFocus} disabled={disabled}
          value={shown} onChange={e => onChange(String(num(e.target.value) || ''))} />
        <em>{T("so'm")}</em>
      </div>
    </div>
  );
}

function DateField({ id, label, value, onChange, max }) {
  const t = today();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="date" className="input" value={value} max={max} onChange={e => e.target.value && onChange(e.target.value)} />
      <div className="chips">
        <button type="button" className="chip" aria-pressed={value === t} onClick={() => onChange(t)}>{T("Bugun")}</button>
        <button type="button" className="chip" aria-pressed={value === addDays(t, -1)} onClick={() => onChange(addDays(t, -1))}>{T("Kecha")}</button>
        <button type="button" className="chip" aria-pressed={value === addDays(t, -2)} onClick={() => onChange(addDays(t, -2))}>{T("Avvalgi kun")}</button>
      </div>
    </div>
  );
}

function HBars({ items, total, best }) {
  const max = Math.max(1, ...items.map(x => x.v));
  return (
    <div className="hbars">
      {items.map(x => (
        <div className={'hbar' + (best && x.k === best ? ' best' : '')} key={x.k}>
          <span className="nm" title={T(x.k)}>{T(x.k)}</span>
          <div className="tr">
            <span className="fill" style={{ width: `calc((100% - 92px) * ${x.v / max})`, background: x.c }} />
            <span className="val">{qisqa(x.v)}{total ? ` · ${foiz(x.v, total)}%` : ''}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* Kunlik ustunli grafik: naqd / karta / o'tkazma */
function DailyChart({ days, byDate, sel, setSel, avg, labelEvery }) {
  const W = 340, H = 150, padL = 4, padB = 18, top = 8;
  const totals = days.map(s => (byDate[s] ? jami(byDate[s]) : 0));
  const max = Math.max(1, ...totals, avg || 0);
  const bw = (W - padL) / days.length;
  const barW = Math.max(3, Math.min(18, bw * 0.68));
  const y = v => top + (H - padB - top) * (1 - v / max);
  const every = labelEvery || (days.length > 16 ? 3 : 2);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={T("Kunlik tushum grafigi")}>
      <line x1={padL} x2={W} y1={H - padB} y2={H - padB} stroke="var(--line)" />
      {avg > 0 && <g>
        <line x1={padL} x2={W} y1={y(avg)} y2={y(avg)} stroke="var(--muted)" strokeWidth="1" opacity=".55" />
      </g>}
      {days.map((s, i) => {
        const r = byDate[s]; const x = padL + i * bw + (bw - barW) / 2;
        let acc = 0;
        const parts = r ? KANAL.map(([k]) => [k, r[k] || 0]).filter(p => p[1] > 0) : [];
        const on = sel === s;
        return (
          <g key={s} onClick={() => setSel(s)} style={{ cursor: 'pointer' }} opacity={sel && !on ? 0.55 : 1}>
            <rect x={padL + i * bw} y={top} width={bw} height={H - padB - top} fill="transparent" />
            {parts.map(([k, v], j) => {
              const y1 = y(acc + v), y0 = y(acc); acc += v;
              const last = j === parts.length - 1;
              const h = Math.max(1, y0 - y1 - (last ? 0 : 1));
              const rr = last ? Math.min(3, barW / 3, h) : 0;
              const yt = y0 - h;
              return <path key={k} fill={PAY_COLORS[k]} d={`M${x} ${y0}V${yt + rr}${rr ? `a${rr} ${rr} 0 0 1 ${rr} ${-rr}` : ''}H${x + barW - rr}${rr ? `a${rr} ${rr} 0 0 1 ${rr} ${rr}` : ''}V${y0}Z`} />;
            })}
            {!r && <rect x={x} y={H - padB - 2} width={barW} height="2" rx="1" fill="var(--line)" />}
            {(i % every === 0 || i === days.length - 1) && <text x={padL + i * bw + bw / 2} y={H - 4} textAnchor="middle" fontWeight={on ? 700 : 400}>{parse(s).getDate()}</text>}
          </g>
        );
      })}
    </svg>
  );
}

/* ---------------- ASOSIY ---------------- */
function Asosiy({ S, R, N, soz, kun, setKun, onSavdo, onTab, openSoz }) {
  const t = today();
  const byDate = useMemo(() => Object.fromEntries(S.map(r => [r.sana, r])), [S]);
  const rec = byDate[kun];
  const kunRasxod = sum(R.filter(r => r.sana === kun), r => r.summa);
  const kecha = byDate[addDays(kun, -1)];
  const ym = ymOf(kun);
  const m = useMemo(() => oyStat(S, R, ym), [S, R, ym]);
  const gacha = ym === ymOf(t) ? (m.days.length ? Number(m.days[m.days.length - 1].sana.slice(8)) : parse(t).getDate()) : null;
  const prev = useMemo(() => oyStat(S, R, addMonths(ym, -1), gacha), [S, R, ym, gacha]);
  const days14 = useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(kun, i - 13)), [kun]);
  const [sel, setSel] = useState(null);
  useEffect(() => setSel(null), [kun]);
  const selRec = sel ? byDate[sel] : null;
  const ochiq = N.filter(n => !n.tolangan);
  const nasiyaJami = sum(ochiq, n => n.summa);
  const kechikkan = ochiq.filter(n => n.muddat && n.muddat < t).length;

  // reja
  const reja = Number(soz.reja) || 0;
  const dim = daysIn(ym);
  const isCur = ym === ymOf(t);
  const dayNo = parse(t).getDate();
  const qolganKun = isCur ? Math.max(1, dim - dayNo + (byDate[t] ? 0 : 1)) : 0;
  const kerak = reja > m.tushum && isCur ? (reja - m.tushum) / qolganKun : 0;
  const prognoz = isCur && m.kunlar ? m.ortacha * dim : 0;

  return (
    <div className="stack">
      {!S.length && !R.length && (
        <div className="card">
          <div className="card-head" style={{ marginBottom: 6 }}><h2>{T("Xush kelibsiz!")}</h2></div>
          <p className="muted" style={{ margin: '0 0 12px' }}>{T("Daftar toza. Har kuni kechqurun shu ikki ishni qiling, qolgan statistikani ilova o'zi chiqaradi:")}</p>
          <ul className="insights" style={{ marginBottom: 14 }}>
            <li>{T("Kunlik savdoni kiriting: naqd, karta va Click/Payme.")}</li>
            <li>{T("Shu kungi rasxodlarni turi bilan yozing.")}</li>
            <li>{T("Claude'dagi eski daftaringizni ⚙️ Sozlamalar → «Ko'chirish» orqali bir bosishda olib o'tasiz.")}</li>
          </ul>
          <div className="form-actions">
            <button className="btn sm" style={{ flex: 1 }} onClick={() => onSavdo(t)}>{T("Savdo kiritish")}</button>
            <button className="btn ghost sm" style={{ flex: 1 }} onClick={() => onTab('rasxod')}>{T("Rasxod kiritish")}</button>
          </div>
        </div>
      )}
      <section className="chek" aria-label={T("Kunlik chek")}>
        <div className="chek-top">
          <button aria-label={T("Oldingi kun")} onClick={() => setKun(addDays(kun, -1))}>‹</button>
          <div>
            <div className="chek-shop">{(soz.nom || T("Mening do'konim")).toUpperCase()}</div>
            <div className="chek-date">{kun === t ? T('BUGUN · ') : ''}{sanaNuqta(kun)} · {HAFTA[parse(kun).getDay()].toUpperCase()}</div>
          </div>
          <button aria-label={T("Keyingi kun")} disabled={kun >= t} onClick={() => setKun(addDays(kun, 1))}>›</button>
        </div>
        {rec ? (
          <>
            {jami(rec) === 0 && <div className="stamp">{T("Savdo bo'lmagan kun")}</div>}
            <ChekRow l={T("Naqd")} v={rec.naqd} />
            <ChekRow l={T("Karta")} v={rec.karta} />
            {rec.karta == null && <div className="chek-sub">{T("karta summasi ko'rsatilmagan (0 degani emas)")}</div>}
            {rec.otkazma > 0 && <ChekRow l={T("Click/Payme")} v={rec.otkazma} />}
            {rec.usd > 0 && <><ChekRow l={`${T('Dollar')} ${fmt(rec.usd)} $`} v={rec.usdSom} /><div className="chek-sub">{T("kurs {0} so'm", fmt(rec.kurs))}</div></>}
            <div className="chek-sep" />
            <ChekRow l={T("Jami tushum")} v={jami(rec)} big />
            <ChekRow l={T("Rasxod")} v={kunRasxod ? -kunRasxod : 0} />
            <div className="chek-sep dbl" />
            <ChekRow l={T("Sof qoldiq")} v={jami(rec) - kunRasxod} big total tone />
            {!kunRasxod && jami(rec) > 0 && <div className="chek-sub">{T("bu kun rasxod kiritilmagan: bu foyda emas, tushum")}</div>}
            <div className="chek-foot">
              <span>{kecha ? <>{T('Kechagiga nisbatan')} <Delta a={jami(rec)} b={jami(kecha)} /></> : (rec.izoh ? rec.izoh : T('Kechagi kun kiritilmagan'))}</span>
              <button className="linkbtn" onClick={() => onSavdo(kun)}>{T("Tahrirlash")}</button>
            </div>
            {kecha && rec.izoh && <div className="chek-foot" style={{ marginTop: 4 }}><span>{T('Izoh: {0}', rec.izoh)}</span></div>}
          </>
        ) : (
          <div className="chek-empty">
            <p>{kun === t ? T('Bugungi savdo hali kiritilmagan') : T("Bu kun uchun savdo yozilmagan")}</p>
            {kunRasxod > 0 && <ChekRow l={T("Rasxod")} v={-kunRasxod} />}
            <button className="btn" onClick={() => onSavdo(kun)}>{T("Savdoni kiritish")}</button>
          </div>
        )}
      </section>

      <div className="month-title"><h2>{oyNomi(ym)}</h2><span className="muted">{T('{0} kun kiritilgan', m.kunlar)}</span></div>
      <div className="kpis">
        <div className="kpi hl"><label>{T("Oy tushumi")}</label><strong>{qisqa(m.tushum)}</strong><em>{T("{0} so'm", fmt(m.tushum))}</em></div>
        <div className="kpi"><label>{T("Rasxod")}</label><strong>{qisqa(m.rasxod)}</strong><em>{T("{0} so'm", fmt(m.rasxod))}</em></div>
        <div className="kpi"><label>{T("Sof qoldiq")}</label><strong className={m.sof < 0 ? 'neg' : ''}>{qisqa(m.sof)}</strong><em>{m.rasxod ? T("{0} so'm", fmt(m.sof)) : T('rasxod kiritilmagan')}</em></div>
        <div className="kpi"><label>{T("O'rtacha kunlik")}</label><strong>{qisqa(m.ortacha)}</strong><em>{prognoz ? T('oy oxiriga ~{0}', qisqa(prognoz)) : T('tushum')}</em></div>
      </div>

      {reja > 0 ? (
        <div className="card">
          <div className="card-head"><h2>{T("Oylik reja")}</h2><small>{qisqa(reja)}</small></div>
          <div className="bar"><span style={{ width: Math.min(100, foiz(m.tushum, reja)) + '%', background: m.tushum >= reja ? 'var(--good)' : 'var(--accent)' }} /></div>
          <div className="reja-nums">
            <span><b>{foiz(m.tushum, reja)}%</b> {T('bajarildi')}</span>
            <span className="muted">{m.tushum >= reja ? T('Reja bajarildi, barakalla!') : isCur ? T('Qolgan {0} kunda kuniga ~{1} kerak', qolganKun, qisqa(kerak)) : T('Yetmadi: {0}', qisqa(reja - m.tushum))}</span>
          </div>
        </div>
      ) : (
        <button className="note" style={{ border: 0, width: '100%', textAlign: 'left', cursor: 'pointer', marginBottom: 0 }} onClick={openSoz}>
          <span>{T("Oylik savdo rejasini qo'ying: har kuni qancha sotish kerakligini hisoblab beraman.")}</span><span className="linkbtn">{T("Qo'yish ›")}</span>
        </button>
      )}

      <div className="card">
        <div className="card-head"><h2>{T("To'lov turlari")}</h2><small>{oyNomi(ym)}</small></div>
        <div className="bar" style={{ height: 16 }}>
          {KANAL.map(([k]) => m[k] > 0 && <span key={k} style={{ width: (m[k] / m.tushum) * 100 + '%', background: PAY_COLORS[k] }} />)}
        </div>
        <div className="legend">
          {KANAL.map(([k, n]) => (k === 'naqd' || k === 'karta' || m[k] > 0) && (
            <span key={k}><i className="dot" style={{ background: PAY_COLORS[k] }} />{T(n)} <b>{foiz(m[k], m.tushum)}%</b> <span className="muted">{qisqa(m[k])}{k === 'usdSom' ? ` (${fmt(m.usd)} $)` : ''}</span></span>
          ))}
        </div>
        {m.kartaYoq.length > 0 && <p className="muted" style={{ margin: '10px 0 0', fontSize: 12.5 }}>{T("{0} kunda karta summasi ko'rsatilmagan, shuning uchun karta ulushi taxminiy.", m.kartaYoq.length)}</p>}
        <div className="chek-sep" style={{ margin: '14px 0 10px' }} />
        <div className="reja-nums" style={{ marginTop: 0 }}>
          <span className="muted">{T("Naqd qoldiq (naqd savdo − naqd rasxod)")}</span>
          <b className={m.kassa < 0 ? 'neg' : ''}>{fmt(m.kassa)}</b>
        </div>
      </div>

      <div className="card chart">
        <div className="card-head"><h2>{T("So'nggi 14 kun")}</h2><small>{T("ustunni bosing")}</small></div>
        <div className="chart-cap">
          {sel ? (selRec ? <><span>{sanaUz(sel)}, {HAFTA[parse(sel).getDay()].toLowerCase()}</span><b>{fmt(jami(selRec))}</b></> : <><span>{sanaUz(sel)}</span><span className="muted">{T("kiritilmagan")}</span></>)
            : <><span className="muted">{T("14 kunlik tushum")}</span><b>{fmt(sum(days14, s => (byDate[s] ? jami(byDate[s]) : 0)))}</b></>}
        </div>
        <DailyChart days={days14} byDate={byDate} sel={sel} setSel={s => setSel(sel === s ? null : s)} avg={0} labelEvery={2} />
        {selRec && <div className="legend">
          {KANAL.map(([k, n]) => selRec[k] > 0 && <span key={k}><i className="dot" style={{ background: PAY_COLORS[k] }} />{T(n)} {fmt(selRec[k])}</span>)}
          {selRec.karta == null && <span className="muted">{T("karta: —")}</span>}
        </div>}
        {!selRec && <div className="legend">
          {KANAL.map(([k, n]) => <span key={k}><i className="dot" style={{ background: PAY_COLORS[k] }} />{T(n)}</span>)}
        </div>}
      </div>

      {ochiq.length > 0 && (
        <button className="card" style={{ border: 0, textAlign: 'left', width: '100%' }} onClick={() => onTab('nasiya')}>
          <div className="card-head" style={{ marginBottom: 4 }}><h2>{T("Nasiyada")}</h2><span className="linkbtn">{T("Ko'rish ›")}</span></div>
          <div className="big-num" style={{ fontSize: 22 }}>{fmt(nasiyaJami)} <span className="muted" style={{ fontSize: 13, fontFamily: 'var(--font-body)' }}>{T("so'm · {0} kishi", ochiq.length)}</span></div>
          {kechikkan > 0 && <div style={{ marginTop: 6 }}><span className="pill late">{T("{0} ta muddati o'tgan", kechikkan)}</span></div>}
        </button>
      )}
    </div>
  );
}
function ChekRow({ l, v, big, total, tone }) {
  return (
    <div className={'chek-row' + (big ? ' big' : '') + (total ? ' total' : '')}>
      <span>{l}</span><i /><b className={tone ? (v < 0 ? 'neg' : 'pos') : ''}>{v == null ? '—' : fmt(v)}</b>
    </div>
  );
}

/* ---------------- SAVDO ---------------- */
function Savdo({ S, demo, api, initial, say, readOnly }) {
  const t = today();
  const [sana, setSana] = useState(initial || t);
  const real = demo ? [] : S;
  const ex = real.find(r => r.sana === sana);
  const lastKurs = useMemo(() => { const k = S.filter(r => r.kurs > 0).sort((a, b) => b.sana.localeCompare(a.sana))[0]; return k ? k.kurs : 0; }, [S]);
  const blank = () => ({ naqd: '', karta: '', otkazma: '', usd: '', kurs: kursStr(lastKurs), izoh: '', yopiq: false, kartaNull: false });
  const [f, setF] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [ask, setAsk] = useState(false);
  const [limit, setLimit] = useState(40);
  const topRef = useRef(null);
  useEffect(() => {
    const r = real.find(x => x.sana === sana);
    setF(r ? {
      naqd: r.naqd ? String(r.naqd) : '', karta: r.karta ? String(r.karta) : '', otkazma: r.otkazma ? String(r.otkazma) : '',
      usd: r.usd ? String(r.usd) : '', kurs: r.kurs ? kursStr(r.kurs) : kursStr(lastKurs), izoh: r.izoh || '',
      yopiq: jami(r) === 0, kartaNull: r.karta == null
    } : blank());
    setAsk(false);
  }, [sana, ex ? ex.t || ex.id : '']);
  const usdN = num(f.usd), kursN = parseKurs(f.kurs);
  const usdSom = usdN && kursN ? r2(usdN * kursN) : 0;
  const usdBad = usdN > 0 && !kursN;
  const total = f.yopiq ? 0 : r2(num(f.naqd) + num(f.karta) + num(f.otkazma) + usdSom);
  const set = k => v => setF(o => ({ ...o, [k]: v }));
  const save = async e => {
    e.preventDefault();
    if (usdBad || (!total && !f.yopiq)) return;
    const kartaVal = f.kartaNull && !f.karta ? null : num(f.karta);
    const rec = f.yopiq
      ? { sana, naqd: 0, karta: f.kartaNull ? null : 0, otkazma: 0, usd: 0, kurs: 0, usdSom: 0 }
      : { sana, naqd: num(f.naqd), karta: kartaVal, otkazma: num(f.otkazma), usd: usdN, kurs: usdN ? kursN : 0, usdSom };
    rec.izoh = f.izoh.trim().slice(0, 300); rec.t = Date.now();
    setBusy(true);
    try {
      await api.saveSavdo(rec);
      say(f.yopiq ? T("Saqlandi: {0} — savdo bo'lmagan kun", sanaUz(sana)) : T("Saqlandi: {0} — {1} so'm", sanaUz(sana), fmt(total)));
    } catch (err) { say(err.message, 'err'); }
    setBusy(false);
  };
  const del = async () => {
    setBusy(true);
    try { await api.delSavdo(sana); say(T("{0} o'chirildi", sanaUz(sana))); } catch (err) { say(err.message, 'err'); }
    setBusy(false); setAsk(false);
  };
  const list = useMemo(() => [...S].sort((a, b) => b.sana.localeCompare(a.sana)), [S]);
  const shown = list.slice(0, limit);
  let lastM = '';
  const editable = ex && !demo;
  return (
    <div className="stack">
      <form className="card form" onSubmit={save} ref={topRef}>
        <div className="card-head" style={{ marginBottom: 0 }}><h2>{editable ? T('Savdoni tahrirlash') : T('Kunlik savdo')}</h2>{editable && <span className="pill">{T("kiritilgan")}</span>}</div>
        <DateField id="s-sana" label={T("Sana")} value={sana} onChange={setSana} max={t} />
        <button type="button" className="chip" style={{ alignSelf: 'flex-start' }} aria-pressed={f.yopiq} onClick={() => set('yopiq')(!f.yopiq)}>
          {f.yopiq ? '✓ ' : ''}{T("Bu kun savdo bo'lmadi (do'kon yopiq)")}
        </button>
        <MoneyInput id="s-naqd" label={T("Naqd")} dot={PAY_COLORS.naqd} value={f.naqd} onChange={set('naqd')} disabled={f.yopiq} />
        <MoneyInput id="s-karta" label={T("Karta (terminal)")} dot={PAY_COLORS.karta} value={f.karta} onChange={set('karta')} disabled={f.yopiq}
          placeholder={f.kartaNull ? T("— ko'rsatilmagan") : '0'} />
        <MoneyInput id="s-otk" label={T("Click / Payme / o'tkazma")} dot={PAY_COLORS.otkazma} value={f.otkazma} onChange={set('otkazma')} disabled={f.yopiq} />
        <div className="row2">
          <div className="field">
            <label htmlFor="s-usd" className="money-label"><span className="dot" style={{ background: PAY_COLORS.usdSom }} />{T("Dollar")}</label>
            <div className="money"><input id="s-usd" className="input" inputMode="numeric" autoComplete="off" placeholder="0" disabled={f.yopiq}
              value={f.usd ? fmt(num(f.usd)) : ''} onChange={e => set('usd')(String(num(e.target.value) || ''))} /><em>$</em></div>
          </div>
          <div className="field">
            <label htmlFor="s-kurs">{T("Kurs, so'm")}</label>
            <input id="s-kurs" className="input" inputMode="decimal" autoComplete="off" placeholder="12 014,37" disabled={f.yopiq}
              value={f.kurs} onChange={e => set('kurs')(e.target.value.replace(/[^\d.,\s]/g, ''))} />
          </div>
        </div>
        {usdN > 0 && !f.yopiq && <div className={usdBad ? 'neg' : 'muted'} style={{ fontSize: 13.5, marginTop: -4 }}>
          {usdBad ? T("Dollar kursini kiriting (Markaziy bank kursi).") : T("{0} $ × {1} = {2} so'm", fmt(usdN), fmt(kursN), fmt(usdSom))}
        </div>}
        <div className="field">
          <label htmlFor="s-izoh">{T("Izoh (ixtiyoriy)")}</label>
          <input id="s-izoh" className="input" value={f.izoh} maxLength={300} placeholder={T("Masalan: bayram, yomg'ir, aksiya")} onChange={e => set('izoh')(e.target.value)} />
        </div>
        <div className="total-line"><span>{T("Jami tushum")}</span><b>{fmt(total)} <small className="muted" style={{ fontSize: 13 }}>{T("so'm")}</small></b></div>
        {readOnly ? <p className="muted">{T("Bu yerdan yozib bo'lmaydi: sizda faqat ko'rish huquqi bor.")}</p> : (
          <div className="form-actions">
            <button className="btn" disabled={busy || usdBad || (!total && !f.yopiq)}>{busy ? T('Saqlanmoqda…') : editable ? T('Yangilash') : T('Saqlash')}</button>
            {editable && ROLE === 'owner' && (ask
              ? <button type="button" className="btn danger sm" onClick={del} disabled={busy}>{T("Ha, o'chir")}</button>
              : <button type="button" className="btn ghost sm" onClick={() => setAsk(true)}>{T("O'chirish")}</button>)}
          </div>
        )}
      </form>

      <div className="card">
        <div className="card-head"><h2>{T("Yozuvlar")}</h2><small>{T('{0} kun', S.length)}</small></div>
        {!list.length && <p className="empty">{T("Hali savdo kiritilmagan.")}</p>}
        <div className="list">
          {shown.map(r => {
            const mh = ymOf(r.sana) !== lastM ? (lastM = ymOf(r.sana), <div className="group-h" key={'h' + r.sana}>{oyNomi(lastM)}</div>) : null;
            const d = parse(r.sana);
            const det = jami(r) === 0 ? T("Savdo bo'lmagan kun") : [
              T('Naqd {0}', qisqa(r.naqd)), T('Karta {0}', r.karta == null ? '—' : qisqa(r.karta)),
              r.otkazma ? T('Click {0}', qisqa(r.otkazma)) : '', r.usd ? `${fmt(r.usd)} $` : '', r.izoh || '', r.kim && r.kim !== ME ? T('kiritdi: {0}', r.kim.split('@')[0]) : ''
            ].filter(Boolean).join(' · ');
            return (
              <React.Fragment key={r.sana}>
                {mh}
                <div className="li">
                  <button className="tap" onClick={() => { setSana(r.sana); topRef.current && topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} aria-label={T('{0} ni tahrirlash', sanaUz(r.sana))}>
                    <span className="datebox"><b>{d.getDate()}</b><small>{HQ[d.getDay()]}</small></span>
                    <span className="li-main"><b>{fmt(jami(r))}</b><small>{det}</small></span>
                    <span className="muted" aria-hidden="true">›</span>
                  </button>
                </div>
              </React.Fragment>
            );
          })}
        </div>
        {list.length > limit && <button className="btn ghost" style={{ marginTop: 10 }} onClick={() => setLimit(limit + 60)}>{T("Yana ko'rsatish")}</button>}
      </div>
    </div>
  );
}

/* ---------------- RASXOD ---------------- */
function Rasxod({ R, demo, api, say, readOnly }) {
  const t = today();
  const [sana, setSana] = useState(t);
  const [summa, setSumma] = useState('');
  const [tur, setTur] = useState('Tovar xaridi');
  const [tolov, setTolov] = useState('naqd');
  const [izoh, setIzoh] = useState('');
  const [busy, setBusy] = useState(false);
  const [ask, setAsk] = useState(null);
  const [ym, setYm] = useState(ymOf(t));
  const save = async e => {
    e.preventDefault();
    if (!num(summa)) return;
    setBusy(true);
    try {
      await api.addRasxod({ sana, tur, summa: num(summa), tolov, izoh: izoh.trim().slice(0, 300), t: Date.now() });
      say(T("Rasxod qo'shildi: {0}, {1} so'm", T(tur), fmt(num(summa))));
      setSumma(''); setIzoh('');
    } catch (err) { say(err.message, 'err'); }
    setBusy(false);
  };
  const del = async id => {
    try { await api.delRasxod(id); say(T("Rasxod o'chirildi")); } catch (err) { say(err.message, 'err'); }
    setAsk(null);
  };
  const month = useMemo(() => R.filter(r => r.sana.startsWith(ym)).sort((a, b) => b.sana.localeCompare(a.sana) || (b.t || 0) - (a.t || 0)), [R, ym]);
  const total = sum(month, r => r.summa);
  const byCat = TURLAR.map(([k, c]) => ({ k, c, v: sum(month.filter(r => r.tur === k), r => r.summa) })).filter(x => x.v > 0).sort((a, b) => b.v - a.v);
  let lastD = '';
  return (
    <div className="stack">
      {!readOnly && (
        <form className="card form" onSubmit={save}>
          <div className="card-head" style={{ marginBottom: 0 }}><h2>{T("Yangi rasxod")}</h2></div>
          <MoneyInput id="r-summa" label={T("Summa")} value={summa} onChange={setSumma} />
          <div className="field">
            <label>{T("Turi")}</label>
            <div className="chips" role="group" aria-label={T("Rasxod turi")}>
              {TURLAR.map(([k, c]) => (
                <button type="button" key={k} className="chip" aria-pressed={tur === k} onClick={() => setTur(k)}>
                  <i className="dot" style={{ background: c }} />{T(k)}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>{T("Qanday to'landi")}</label>
            <div className="seg" role="group" aria-label={T("To'lov turi")}>
              {TOLOV.map(([k, n]) => <button type="button" key={k} aria-pressed={tolov === k} onClick={() => setTolov(k)}>{T(n)}</button>)}
            </div>
          </div>
          <DateField id="r-sana" label={T("Sana")} value={sana} onChange={setSana} max={t} />
          <div className="field">
            <label htmlFor="r-izoh">{T("Izoh (ixtiyoriy)")}</label>
            <input id="r-izoh" className="input" value={izoh} maxLength={300} placeholder={T("Masalan: Coca-Cola, 10 blok")} onChange={e => setIzoh(e.target.value)} />
          </div>
          <button className="btn" disabled={!num(summa) || busy}>{busy ? T('Saqlanmoqda…') : T("Rasxodni qo'shish")}</button>
        </form>
      )}

      <div className="month-nav">
        <button aria-label={T("Oldingi oy")} onClick={() => setYm(addMonths(ym, -1))}>‹</button>
        <div style={{ textAlign: 'center' }}><b>{oyNomi(ym)}</b><div className="muted">{T("jami {0} so'm", fmt(total))}</div></div>
        <button aria-label={T("Keyingi oy")} disabled={ym >= ymOf(t)} onClick={() => setYm(addMonths(ym, 1))}>›</button>
      </div>

      {byCat.length > 0 && <div className="card"><div className="card-head"><h2>{T("Turlari bo'yicha")}</h2></div><HBars items={byCat} total={total} /></div>}

      <div className="card">
        <div className="card-head"><h2>{T("Ro'yxat")}</h2><small>{T('{0} ta', month.length)}</small></div>
        {!month.length && <p className="empty">{T("Bu oyda rasxod yo'q.")}</p>}
        <div className="list">
          {month.map(r => {
            const h = r.sana !== lastD ? (lastD = r.sana, <div className="group-h" key={'h' + r.id}>{sanaUz(r.sana)}, {HAFTA[parse(r.sana).getDay()].toLowerCase()}</div>) : null;
            return (
              <React.Fragment key={r.id}>
                {h}
                <div className="li">
                  <i className="dot" style={{ background: turRang(r.tur), width: 12, height: 12 }} />
                  <div className="li-main"><b>{T(r.tur)}</b><small>{tolovNomi(r.tolov)}{r.izoh ? ` · ${r.izoh}` : ''}</small></div>
                  <div className="li-amt">{fmt(r.summa)}</div>
                  {!demo && !readOnly && ROLE === 'owner' && (ask === r.id
                    ? <span className="confirm"><button className="btn danger sm" onClick={() => del(r.id)}>{T("O'chir")}</button><button className="x" aria-label={T("Bekor qilish")} onClick={() => setAsk(null)}>×</button></span>
                    : <button className="x" aria-label={T("{0} rasxodini o'chirish", T(r.tur))} onClick={() => setAsk(r.id)}>×</button>)}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------- butun davr, oylar, ma'lumot sifati ---------------- */
function davrMa(S) {
  if (!S.length) return null;
  const ds = S.map(r => r.sana).sort();
  const first = ds[0], last = ds[ds.length - 1], have = new Set(ds), miss = [];
  for (let s = first; s <= last; s = addDays(s, 1)) if (!have.has(s)) miss.push(s);
  return { first, last, miss };
}
function ButunDavr({ S, R, N }) {
  const a = useMemo(() => oyStat(S, R, ''), [S, R]);
  const d = useMemo(() => davrMa(S), [S]);
  if (!d) return null;
  const ochiq = sum(N.filter(n => !n.tolangan), n => n.summa);
  const p2 = v => (a.tushum ? ((v / a.tushum) * 100).toFixed(2).replace('.', ',') : '0') + '%';
  return (
    <div className="card">
      <div className="card-head"><h2>{T("Butun davr")}</h2><small>{sanaUz(d.first)} – {sanaUz(d.last)}</small></div>
      <div className="muted">{T("Jami qayd etilgan savdo tushumi")}</div>
      <div className="big-num">{fmt(a.tushum)} <span className="muted" style={{ fontSize: 14, fontFamily: 'var(--font-body)' }}>{T("so'm")}</span></div>
      <div className="bar" style={{ height: 12, marginTop: 12 }}>
        {KANAL.map(([k]) => a[k] > 0 && <span key={k} style={{ width: (a[k] / a.tushum) * 100 + '%', background: PAY_COLORS[k] }} />)}
      </div>
      <table className="cmp" style={{ marginTop: 10 }}>
        <tbody>
          {KANAL.filter(([k]) => a[k] > 0).map(([k, n]) => (
            <tr key={k}><td><i className="dot" style={{ background: PAY_COLORS[k], marginRight: 8 }} />{T(n)}{k === 'usdSom' ? ` · ${fmt(a.usd)} $` : ''}</td><td>{fmt(a[k])}</td><td style={{ width: 64 }}>{p2(a[k])}</td></tr>
          ))}
        </tbody>
      </table>
      <div className="mini-grid">
        <div><label>{T("Hisobot kunlari")}</label><b>{a.kunlar}</b></div>
        <div><label>{T("Savdo bo'lgan")}</label><b>{a.savdoKun}</b></div>
        <div><label>{T("Savdosiz kun")}</label><b>{a.nolKun.length}</b></div>
        <div><label>{T("Hisobot yo'q")}</label><b>{d.miss.length}</b></div>
        <div className="w2"><label>{T("O'rtacha kunlik (hisobot kunlariga)")}</label><b>{fmt(Math.round(a.ortacha))}</b></div>
      </div>
      <table className="cmp" style={{ marginTop: 6 }}>
        <tbody>
          {a.best && <tr><td>{T("Eng yuqori kun")}</td><td>{sanaUz(a.best.sana)}</td><td>{fmt(jami(a.best))}</td></tr>}
          {a.worst && <tr><td>{T("Eng past (savdo bo'lgan)")}</td><td>{sanaUz(a.worst.sana)}</td><td>{fmt(jami(a.worst))}</td></tr>}
          <tr><td>{T("Qaytarilmagan qarz/nasiya")}</td><td></td><td>{fmt(ochiq)}</td></tr>
        </tbody>
      </table>
      <p className="muted" style={{ margin: '12px 0 0', fontSize: 13 }}>{T("Bu savdo tushumi, foyda emas. Foydani bilish uchun tovar tannarxi va barcha xarajatlar kerak. Qarz va nasiya tushumga qo'shilmagan.")}</p>
    </div>
  );
}
function Sifat({ S, R }) {
  const a = useMemo(() => oyStat(S, R, ''), [S, R]);
  const d = useMemo(() => davrMa(S), [S]);
  if (!d) return null;
  const items = [];
  if (d.miss.length) items.push({ c: 'warn', t: T("Hisobot yo'q kunlar ({0}): {1}. Ular nol savdo deb hisoblanmagan.", d.miss.length, sanalarMatni(d.miss)) });
  if (a.kartaYoq.length) items.push({ c: 'warn', t: T("Karta summasi ko'rsatilmagan kunlar ({0}): {1}. \"—\" nol degani emas, karta ulushi shu sababli taxminiy.", a.kartaYoq.length, sanalarMatni(a.kartaYoq)) });
  if (a.nolKun.length) items.push({ c: '', t: T("Savdo bo'lmagan kunlar: {0}.", sanalarMatni(a.nolKun)) });
  const rKun = new Set(R.map(r => r.sana)).size;
  items.push({ c: rKun < a.kunlar / 2 ? 'bad' : '', t: rKun ? T("Rasxodlar {0} kun uchun kiritilgan. To'liq reyestr bo'lmaguncha sof foydani ishonchli hisoblab bo'lmaydi.", rKun) : T("Rasxodlar hali kiritilmagan. Tovar xaridi, ijara, ish haqi, kommunal to'lovlar va soliqni yozib borsangiz, foyda hisoblanadi.") });
  items.push({ c: '', t: T("Tovar tannarxi va ombor qoldig'i kiritilmagan: yalpi foyda va rentabellik hozircha hisoblanmaydi.") });
  return (
    <div className="card">
      <div className="card-head"><h2>{T("Ma'lumotlar sifati")}</h2><small>{T("cheklovlar")}</small></div>
      <ul className="insights">{items.map((x, i) => <li key={i} className={x.c}>{x.t}</li>)}</ul>
    </div>
  );
}
function OylarJadval({ S, R, ym, setYm }) {
  const t = today();
  const d = useMemo(() => davrMa(S), [S]);
  const rows = useMemo(() => {
    if (!d) return [];
    const out = []; let k = ymOf(d.first); const end = ymOf(t);
    while (k <= end) { out.push(oyStat(S, R, k)); k = addMonths(k, 1); }
    return out;
  }, [S, R]);
  const all = useMemo(() => oyStat(S, R, ''), [S, R]);
  if (!d) return null;
  return (
    <div className="card">
      <div className="card-head"><h2>{T("Oylar bo'yicha")}</h2><small>{T("oyni bosing")}</small></div>
      <table className="cmp months">
        <thead><tr><th>{T("Oy")}</th><th>{T("Kun")}</th><th>{T("Tushum")}</th><th>{T("O'rtacha")}</th></tr></thead>
        <tbody>
          {rows.map(x => (
            <tr key={x.ym} className={x.ym === ym ? 'on' : ''} onClick={() => setYm(x.ym)}>
              <td>{OYLAR[Number(x.ym.slice(5)) - 1]}{x.ym === ymOf(t) ? '*' : ''}</td><td>{x.kunlar}</td><td>{fmt(x.tushum)}</td><td>{fmt(Math.round(x.ortacha))}</td>
            </tr>
          ))}
          <tr className="tot"><td>{T("Jami")}</td><td>{all.kunlar}</td><td>{fmt(all.tushum)}</td><td>{fmt(Math.round(all.ortacha))}</td></tr>
        </tbody>
      </table>
      <p className="muted" style={{ margin: '8px 0 0', fontSize: 12.5 }}>{T("* joriy oy, yakunlanmagan. O'rtacha = tushum ÷ hisobot kunlari.")}</p>
    </div>
  );
}

/* ---------------- TAHLIL ---------------- */
function xulosalar(S, R, m, prev, ym, hafta) {
  const t = today(), out = [];
  const isCur = ym === ymOf(t);
  if (!m.kunlar) return [{ c: '', t: T("Bu oy uchun hali savdo kiritilmagan.") }];
  if (prev.tushum) {
    const p = Math.round(((m.tushum - prev.tushum) / prev.tushum) * 100);
    out.push({ c: p >= 0 ? 'good' : 'bad', t: T(p >= 0 ? "Tushum o'tgan oyning shu davriga nisbatan {0}% ko'p ({1} va {2})." : "Tushum o'tgan oyning shu davriga nisbatan {0}% kam ({1} va {2}).", Math.abs(p), qisqa(m.tushum), qisqa(prev.tushum)) });
  }
  if (!m.rasxod) out.push({ c: 'warn', t: T("Bu oy rasxodlar kiritilmagan, shuning uchun sof foydani hisoblab bo'lmaydi.") });
  else if (m.sof < 0) out.push({ c: 'bad', t: T("Rasxod tushumdan {0} ga ko'p. Agar ko'p tovar olingan bo'lsa, bu normal, aks holda xarajatlarni ko'rib chiqing.", qisqa(-m.sof)) });
  else if (m.tushum) out.push({ c: 'good', t: T("Har 100 so'm tushumdan {0} so'm qo'lda qolmoqda (kiritilgan rasxodlar chiqarilgandan keyin).", Math.round((m.sof / m.tushum) * 100)) });
  out.push({ c: '', t: T("To'lovlar: naqd {0}%, karta {1}%", foiz(m.naqd, m.tushum), foiz(m.karta, m.tushum)) + (m.otkazma ? T(', Click/Payme {0}%', foiz(m.otkazma, m.tushum)) : '') + (m.usd ? T(', dollar {0}% ({1} $)', foiz(m.usdSom, m.tushum), fmt(m.usd)) : '') + '.' + (m.kartaYoq.length ? T(" {0} kunda karta ko'rsatilmagan, karta ulushi taxminiy.", m.kartaYoq.length) : '') });
  const hs = hafta.filter(h => h.kun >= 2).sort((a, b) => b.avg - a.avg);
  if (hs.length >= 4) out.push({ c: 'warn', t: T("Eng savdoli kun — {0} (o'rtacha {1}), eng sust — {2} ({3}). Aksiyalarni sust kunga qo'ying.", hs[0].n, qisqa(hs[0].avg), hs[hs.length - 1].n, qisqa(hs[hs.length - 1].avg)) });
  if (m.byCat[0] && m.rasxod) out.push({ c: '', t: T('Rasxodning {0}%i — {1} ({2}).', foiz(m.byCat[0].v, m.rasxod), T(m.byCat[0].k).toLowerCase(), qisqa(m.byCat[0].v)) });
  if (m.best) out.push({ c: 'good', t: T("Oyning eng yaxshi kuni: {0} — {1} so'm.", sanaUz(m.best.sana), fmt(jami(m.best))) });
  if (m.nolKun.length) out.push({ c: '', t: T("Savdo bo'lmagan kunlar: {0}.", sanalarMatni(m.nolKun)) });
  const firstAll = S.reduce((a, r) => (r.sana < a ? r.sana : a), m.days[0].sana);
  let from = `${ym}-01`; if (firstAll > from) from = firstAll;
  const to = isCur ? addDays(t, -1) : `${ym}-${pad(daysIn(ym))}`;
  const have = new Set(m.days.map(d => d.sana)); const miss = [];
  for (let s = from; s <= to; s = addDays(s, 1)) if (!have.has(s)) miss.push(s);
  if (miss.length) out.push({ c: 'warn', t: T("Hisobot yo'q kunlar: {0}. Ular nol deb hisoblanmagan{1}.", sanalarMatni(miss), isCur ? T(", iloji bo'lsa kiriting") : '') });
  if (isCur && m.kunlar >= 5) out.push({ c: '', t: T("Shu sur'atda oy oxiriga taxminan {0} tushum bo'ladi (taxmin).", qisqa(m.ortacha * daysIn(ym))) });
  return out;
}

function Tahlil({ S, R, N, soz, demo }) {
  const t = today();
  const [ym, setYm] = useState(ymOf(t));
  const isCur = ym === ymOf(t);
  const byDate = useMemo(() => Object.fromEntries(S.map(r => [r.sana, r])), [S]);
  const m = useMemo(() => oyStat(S, R, ym), [S, R, ym]);
  const gacha = isCur ? (m.days.length ? Number(m.days[m.days.length - 1].sana.slice(8)) : parse(t).getDate()) : null;
  const prev = useMemo(() => oyStat(S, R, addMonths(ym, -1), gacha), [S, R, ym, gacha]);
  const prevFull = useMemo(() => oyStat(S, R, addMonths(ym, -1)), [S, R, ym]);
  const hafta = useMemo(() => haftaStat(S.filter(r => r.sana >= addDays(t, -90))), [S]);
  const ins = useMemo(() => xulosalar(S, R, m, prev, ym, hafta), [S, R, m, prev, ym, hafta]);
  const days = useMemo(() => Array.from({ length: isCur ? parse(t).getDate() : daysIn(ym) }, (_, i) => `${ym}-${pad(i + 1)}`), [ym]);
  const [sel, setSel] = useState(null);
  useEffect(() => setSel(null), [ym]);
  const months = useMemo(() => Array.from({ length: 6 }, (_, i) => { const k = addMonths(ymOf(t), i - 5); const s = oyStat(S, R, k); return { k, t: s.tushum, r: s.rasxod }; }), [S, R]);
  const mMax = Math.max(1, ...months.map(x => Math.max(x.t, x.r)));
  const hMax = Math.max(1, ...hafta.map(h => h.avg));
  const bestH = [...hafta].sort((a, b) => b.avg - a.avg)[0];
  const hOrder = [1, 2, 3, 4, 5, 6, 0].map(i => hafta[i]);
  const selRec = sel ? byDate[sel] : null;

  const aiPayload = () => ({
    dokon: soz.nom || "do'kon", bugun: t, oy: oyNomi(ym), namunaMalumot: demo,
    joriyOy: { tushum: m.tushum, naqd: m.naqd, karta: m.karta, otkazma: m.otkazma, dollarUSD: m.usd, dollarSom: m.usdSom, rasxod: m.rasxod, sofQoldiq: m.sof, hisobotKunlari: m.kunlar, savdoBolmaganKunlar: m.nolKun, kartaKorsatilmaganKunlar: m.kartaYoq.length, ortachaKunlik: Math.round(m.ortacha), naqdQoldiq: m.kassa },
    butunDavr: (() => { const a = oyStat(S, R, ''); const d = davrMa(S); return d ? { dan: d.first, gacha: d.last, tushum: a.tushum, naqd: a.naqd, karta: a.karta, dollarUSD: a.usd, dollarSom: a.usdSom, hisobotKunlari: a.kunlar, hisobotYoqKunlar: d.miss } : null; })(),
    otganOyShuDavr: { tushum: prev.tushum, rasxod: prev.rasxod, kunlar: prev.kunlar },
    otganOyToliq: { tushum: prevFull.tushum, rasxod: prevFull.rasxod },
    oylikReja: Number(soz.reja) || null,
    kunlar: m.days.map(d => ({ sana: d.sana, hafta: HAFTA[parse(d.sana).getDay()], naqd: d.naqd, karta: d.karta == null ? null : d.karta, otkazma: d.otkazma || 0, dollar: d.usd || 0, dollarSom: d.usdSom || 0, jami: jami(d), rasxod: sum(R.filter(r => r.sana === d.sana), r => r.summa), izoh: d.izoh || undefined })),
    rasxodTurlari: m.byCat.map(c => ({ tur: c.k, summa: c.v })),
    haftaKunlariOrtacha: hafta.filter(h => h.kun).map(h => ({ kun: h.n, ortacha: Math.round(h.avg), soni: h.kun })),
    nasiya: { ochiqSumma: sum(N.filter(n => !n.tolangan), n => n.summa), ochiqSoni: N.filter(n => !n.tolangan).length, muddatiOtgan: N.filter(n => !n.tolangan && n.muddat && n.muddat < t).length }
  });

  return (
    <div className="stack">
      <ButunDavr S={S} R={R} N={N} />
      <OylarJadval S={S} R={R} ym={ym} setYm={setYm} />
      <Sifat S={S} R={R} />
      <div className="month-nav" id="oy-tahlil">
        <button aria-label={T("Oldingi oy")} onClick={() => setYm(addMonths(ym, -1))}>‹</button>
        <div style={{ textAlign: 'center' }}><b>{oyNomi(ym)}</b><div className="muted">{T("{0} kun · {1} so'm", m.kunlar, fmt(m.tushum))}</div></div>
        <button aria-label={T("Keyingi oy")} disabled={isCur} onClick={() => setYm(addMonths(ym, 1))}>›</button>
      </div>

      <div className="card">
        <div className="card-head"><h2>{T("Xulosalar")}</h2><small>{T("avtomatik")}</small></div>
        <ul className="insights">{ins.map((x, i) => <li key={i} className={x.c}>{x.t}</li>)}</ul>
      </div>

      <HisobotNusxa S={S} R={R} N={N} ym={ym} soz={soz} />

      <div className="card chart">
        <div className="card-head"><h2>{T("Kunlik tushum")}</h2><small>{T("ustunni bosing")}</small></div>
        <div className="chart-cap">
          {sel ? (selRec ? <><span>{sanaUz(sel)}, {HAFTA[parse(sel).getDay()].toLowerCase()}</span><b>{fmt(jami(selRec))}</b></> : <><span>{sanaUz(sel)}</span><span className="muted">{T("kiritilmagan")}</span></>)
            : <><span className="muted">{T("o'rtacha kunlik (chiziq)")}</span><b>{fmt(Math.round(m.ortacha))}</b></>}
        </div>
        <DailyChart days={days} byDate={byDate} sel={sel} setSel={s => setSel(sel === s ? null : s)} avg={m.ortacha} />
        <div className="legend">{KANAL.map(([k, n]) => <span key={k}><i className="dot" style={{ background: PAY_COLORS[k] }} />{T(n)}</span>)}</div>
      </div>

      <div className="card">
        <div className="card-head"><h2>{T("O'tgan oy bilan")}</h2><small>{isCur ? T('1–{0}-kunlar', gacha) : T("to'liq oy")}</small></div>
        <table className="cmp">
          <thead><tr><th></th><th>{OYLAR[Number(ym.slice(5)) - 1]}</th><th>{OYLAR[Number(addMonths(ym, -1).slice(5)) - 1]}</th><th>{T("O'zgarish")}</th></tr></thead>
          <tbody>
            <tr><td>{T("Tushum")}</td><td>{qisqa(m.tushum)}</td><td>{qisqa((isCur ? prev : prevFull).tushum)}</td><td><Delta a={m.tushum} b={(isCur ? prev : prevFull).tushum} /></td></tr>
            <tr><td>{T("Rasxod")}</td><td>{qisqa(m.rasxod)}</td><td>{qisqa((isCur ? prev : prevFull).rasxod)}</td><td><Delta a={m.rasxod} b={(isCur ? prev : prevFull).rasxod} inv /></td></tr>
            <tr><td>{T("Sof qoldiq")}</td><td>{qisqa(m.sof)}</td><td>{qisqa((isCur ? prev : prevFull).sof)}</td><td><Delta a={m.sof} b={(isCur ? prev : prevFull).sof} /></td></tr>
            <tr><td>{T("O'rtacha/kun")}</td><td>{qisqa(m.ortacha)}</td><td>{qisqa((isCur ? prev : prevFull).ortacha)}</td><td><Delta a={m.ortacha} b={(isCur ? prev : prevFull).ortacha} /></td></tr>
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-head"><h2>{T("Hafta kunlari")}</h2><small>{T("o'rtacha tushum, 90 kun")}</small></div>
        {hafta.some(h => h.kun) ? (
          <div className="hbars">
            {hOrder.map(h => (
              <div className={'hbar' + (bestH && h.i === bestH.i && h.avg ? ' best' : '')} key={h.i}>
                <span className="nm">{h.n}</span>
                <div className="tr">
                  <span className="fill" style={{ width: `calc((100% - 92px) * ${h.avg / hMax})`, background: bestH && h.i === bestH.i ? 'var(--saffron)' : 'var(--accent)' }} />
                  <span className="val">{h.kun ? qisqa(h.avg) : '—'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="empty">{T("Ma'lumot yetarli emas.")}</p>}
      </div>

      <div className="card">
        <div className="card-head"><h2>{T("Rasxod turlari")}</h2><small>{qisqa(m.rasxod)}</small></div>
        {m.byCat.length ? <HBars items={m.byCat} total={m.rasxod} /> : <p className="empty">{T("Bu oyda rasxod kiritilmagan.")}</p>}
      </div>

      <div className="card">
        <div className="card-head"><h2>{T("Oxirgi 6 oy")}</h2><small>{T("tushum va rasxod")}</small></div>
        <div className="cols">
          {months.map(x => (
            <div className="col" key={x.k}>
              <div className="pair">
                <span style={{ height: (x.t / mMax) * 100 + '%', background: 'var(--accent)' }} title={T('Tushum {0}', fmt(x.t))} />
                <span style={{ height: (x.r / mMax) * 100 + '%', background: 'var(--k4)' }} title={T('Rasxod {0}', fmt(x.r))} />
              </div>
              <small>{OYQ[Number(x.k.slice(5)) - 1]}</small>
            </div>
          ))}
        </div>
        <div className="legend"><span><i className="dot" style={{ background: 'var(--accent)' }} />{T("Tushum")}</span><span><i className="dot" style={{ background: 'var(--k4)' }} />{T("Rasxod")}</span>
          <span className="muted">{oyNomi(months[5].k)}: {qisqa(months[5].t)} / {qisqa(months[5].r)}</span></div>
      </div>
    </div>
  );
}

/* ---------------- NASIYA ---------------- */
function Nasiya({ N, demo, api, say, readOnly }) {
  const t = today();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ ism: '', tel: '', summa: '', sana: t, muddat: '', izoh: '', turi: 'nasiya' });
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState('ochiq');
  const [pay, setPay] = useState({});
  const [ask, setAsk] = useState(null);
  const set = k => v => setF(o => ({ ...o, [k]: v }));
  const ochiq = N.filter(n => !n.tolangan).sort((a, b) => (a.muddat || '9999').localeCompare(b.muddat || '9999') || a.sana.localeCompare(b.sana));
  const yopiq = N.filter(n => n.tolangan).sort((a, b) => (b.tolanganSana || b.sana).localeCompare(a.tolanganSana || a.sana));
  const jamiOchiq = sum(ochiq, n => n.summa);
  const late = ochiq.filter(n => n.muddat && n.muddat < t);
  const add = async e => {
    e.preventDefault();
    if (!f.ism.trim() || !num(f.summa)) return;
    setBusy(true);
    try {
      await api.addNasiya({ ism: f.ism.trim().slice(0, 80), tel: f.tel.trim().slice(0, 30), summa: num(f.summa), boshlangich: num(f.summa), turi: f.turi, sana: f.sana, muddat: f.muddat || '', izoh: f.izoh.trim().slice(0, 200), tolangan: false, tolanganJami: 0, t: Date.now() });
      say(T(f.turi === 'qarz' ? "Qarz yozildi: {0}, {1} so'm" : "Nasiya yozildi: {0}, {1} so'm", f.ism.trim(), fmt(num(f.summa))));
      setF({ ism: '', tel: '', summa: '', sana: t, muddat: '', izoh: '', turi: 'nasiya' }); setOpen(false);
    } catch (err) { say(err.message, 'err'); }
    setBusy(false);
  };
  const tolash = async (n, qism) => {
    const x = Math.min(n.summa, qism || n.summa);
    const qoldi = n.summa - x;
    try {
      await api.updNasiya(n.id, { summa: qoldi, tolanganJami: (n.tolanganJami || 0) + x, tolangan: qoldi <= 0, tolanganSana: qoldi <= 0 ? t : (n.tolanganSana || ''), t: Date.now() });
      say(qoldi <= 0 ? T("{0}: to'liq to'landi", n.ism) : T("{0}: {1} to'landi, qoldi {2}", n.ism, fmt(x), fmt(qoldi)));
      setPay(p => ({ ...p, [n.id]: '' }));
    } catch (err) { say(err.message, 'err'); }
  };
  const del = async n => { try { await api.delNasiya(n.id); say(T("O'chirildi")); } catch (err) { say(err.message, 'err'); } setAsk(null); };
  const list = view === 'ochiq' ? ochiq : yopiq;
  return (
    <div className="stack">
      <div className="card">
        <div className="muted">{T("Qaytarilmagan qarz va nasiya")}</div>
        <div className="big-num">{fmt(jamiOchiq)} <span className="muted" style={{ fontSize: 14, fontFamily: 'var(--font-body)' }}>{T("so'm")}</span></div>
        <div className="debt-meta" style={{ marginTop: 6 }}>
          <span className="pill">{T('{0} kishi', ochiq.length)}</span>
          {late.length > 0 && <span className="pill late">{T("{0} ta muddati o'tgan · {1}", late.length, qisqa(sum(late, n => n.summa)))}</span>}
        </div>
        <p className="muted" style={{ margin: '10px 0 0', fontSize: 12.5 }}>{T("Qarz va nasiya savdo tushumiga ham, xarajatga ham qo'shilmaydi: alohida nazorat qilinadi.")}</p>
        {!readOnly && !open && <button className="btn" style={{ marginTop: 14 }} onClick={() => setOpen(true)}>{T("+ Yangi qarz yoki nasiya")}</button>}
      </div>

      {open && (
        <form className="card form" onSubmit={add}>
          <div className="card-head" style={{ marginBottom: 0 }}><h2>{T("Yangi yozuv")}</h2><button type="button" className="x" aria-label={T("Yopish")} onClick={() => setOpen(false)}>×</button></div>
          <div className="seg" role="group" aria-label={T("Turi")}>
            <button type="button" aria-pressed={f.turi === 'nasiya'} onClick={() => set('turi')('nasiya')}>{T("Nasiya (tovar)")}</button>
            <button type="button" aria-pressed={f.turi === 'qarz'} onClick={() => set('turi')('qarz')}>{T("Qarz (pul)")}</button>
          </div>
          <div className="field"><label htmlFor="n-ism">{T("Kim oldi")}</label><input id="n-ism" className="input" value={f.ism} maxLength={80} placeholder={T("Ism, mo'ljal")} onChange={e => set('ism')(e.target.value)} /></div>
          <MoneyInput id="n-summa" label={T("Summa")} value={f.summa} onChange={set('summa')} />
          <div className="field"><label htmlFor="n-tel">{T("Telefon (ixtiyoriy)")}</label><input id="n-tel" className="input" type="tel" value={f.tel} placeholder="+998 __ ___ __ __" onChange={e => set('tel')(e.target.value)} /></div>
          <div className="row2">
            <div className="field"><label htmlFor="n-sana">{T("Qachon oldi")}</label><input id="n-sana" type="date" className="input" value={f.sana} max={t} onChange={e => e.target.value && set('sana')(e.target.value)} /></div>
            <div className="field"><label htmlFor="n-muddat">{T("Qaytarish muddati")}</label><input id="n-muddat" type="date" className="input" value={f.muddat} min={f.sana} onChange={e => set('muddat')(e.target.value)} /></div>
          </div>
          <div className="field"><label htmlFor="n-izoh">{T("Nima oldi (ixtiyoriy)")}</label><input id="n-izoh" className="input" value={f.izoh} maxLength={200} placeholder={T("Masalan: un 2 qop, yog'")} onChange={e => set('izoh')(e.target.value)} /></div>
          <button className="btn" disabled={!f.ism.trim() || !num(f.summa) || busy}>{busy ? T('Saqlanmoqda…') : T('Saqlash')}</button>
        </form>
      )}

      <div className="seg" role="group" aria-label={T("Nasiya ro'yxati")}>
        <button aria-pressed={view === 'ochiq'} onClick={() => setView('ochiq')}>{T('Qaytarilmagan ({0})', ochiq.length)}</button>
        <button aria-pressed={view === 'yopiq'} onClick={() => setView('yopiq')}>{T("To'langan ({0})", yopiq.length)}</button>
      </div>

      <div className="card">
        {!list.length && <p className="empty">{view === 'ochiq' ? T("Qarzdorlar yo'q.") : T("Hali to'langan nasiya yo'q.")}</p>}
        {list.map(n => {
          const kech = n.muddat && !n.tolangan ? kunFarqi(n.muddat, t) : null;
          return (
            <div className="debt" key={n.id}>
              <div className="debt-top">
                <div><b>{n.ism}</b>{n.tel && <div className="muted" style={{ fontSize: 13 }}>{n.tel}</div>}</div>
                <div className="debt-amt">{n.tolangan ? fmt(n.tolanganJami || 0) : fmt(n.summa)}</div>
              </div>
              <div className="debt-meta">
                <span className="pill">{n.turi === 'qarz' ? T('pul qarz') : T('nasiya')}</span>
                <span>{T('{0}dan beri · {1} kun', sanaUz(n.sana), kunFarqi(n.sana, n.tolanganSana && n.tolangan ? n.tolanganSana : t))}</span>
                {n.tolangan && <span className="pill paid">{T("to'landi {0}", n.tolanganSana ? sanaUz(n.tolanganSana) : '')}</span>}
                {kech !== null && kech > 0 && <span className="pill late">{T("muddati {0} kun o'tdi", kech)}</span>}
                {kech !== null && kech <= 0 && kech >= -3 && <span className="pill soon">{kech === 0 ? T('muddati bugun') : T('{0} kun qoldi', -kech)}</span>}
                {kech !== null && kech < -3 && <span className="pill">{T('muddat: {0}', sanaUz(n.muddat))}</span>}
                {!n.tolangan && n.tolanganJami > 0 && <span className="pill">{T("to'langan {0}", qisqa(n.tolanganJami))}</span>}
              </div>
              {n.izoh && <div className="muted" style={{ fontSize: 13 }}>{n.izoh}</div>}
              {!readOnly && !demo && (
                <div className="debt-actions">
                  {!n.tolangan && <>
                    <button className="btn sm" onClick={() => tolash(n)}>{T("To'liq to'landi")}</button>
                    <input className="input" inputMode="numeric" aria-label={T("{0} qisman to'lov summasi", n.ism)} placeholder={T("qisman")} value={pay[n.id] ? fmt(num(pay[n.id])) : ''} onChange={e => setPay(p => ({ ...p, [n.id]: String(num(e.target.value) || '') }))} />
                    {num(pay[n.id]) > 0 && <button className="btn ghost sm" onClick={() => tolash(n, num(pay[n.id]))}>{T("Ayirish")}</button>}
                  </>}
                  {ROLE === 'owner' && (ask === n.id
                    ? <><button className="btn danger sm" onClick={() => del(n)}>{T("Ha, o'chir")}</button><button className="x" aria-label={T("Bekor")} onClick={() => setAsk(null)}>×</button></>
                    : <button className="x" aria-label={T("{0} yozuvini o'chirish", n.ism)} onClick={() => setAsk(n.id)} style={{ marginLeft: 'auto' }}>×</button>)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Claude uchun hisobot ---------------- */
function HisobotNusxa({ S, R, N, ym, soz }) {
  const [msg, setMsg] = useState('');
  const [txt, setTxt] = useState('');
  const [fail, setFail] = useState(false);
  useEffect(() => { setMsg(''); setTxt(''); setFail(false); }, [ym]);
  const build = () => {
    const days = S.filter(r => r.sana.startsWith(ym)).sort((a, b) => a.sana.localeCompare(b.sana));
    const exp = R.filter(r => r.sana.startsWith(ym)).sort((a, b) => a.sana.localeCompare(b.sana));
    const L = [];
    L.push(`Do'kon: ${soz.nom || '—'}. Oy: ${UZ_OY[Number(ym.slice(5)) - 1]} ${ym.slice(0, 4)}. Summalar so'mda.`);
    if (soz.reja) L.push(`Oylik reja: ${soz.reja}`);
    L.push('', 'SAVDO', "Sana;Naqd;Karta;Click/Payme;Dollar;Kurs;Dollar so'mda;Jami;Rasxod;Izoh");
    days.forEach(d => L.push([sanaNuqta(d.sana), d.naqd || 0, d.karta == null ? '—' : d.karta, d.otkazma || 0, d.usd || 0, d.kurs || '', d.usdSom || 0, jami(d), sum(R.filter(r => r.sana === d.sana), r => r.summa), (d.izoh || '').replace(/[;\n]/g, ',')].join(';')));
    L.push('', 'RASXODLAR', "Sana;Turi;Summa;To'lov;Izoh");
    exp.forEach(r => L.push([sanaNuqta(r.sana), r.tur, r.summa, r.tolov, (r.izoh || '').replace(/[;\n]/g, ',')].join(';')));
    const och = N.filter(n => !n.tolangan);
    L.push('', 'QARZ VA NASIYA (qaytarilmagan)', 'Kim;Summa;Qachondan;Muddat;Turi');
    och.forEach(n => L.push([n.ism, n.summa, sanaNuqta(n.sana), n.muddat ? sanaNuqta(n.muddat) : '', n.turi || 'nasiya'].join(';')));
    L.push('', "Izoh: karta '—' = summa ko'rsatilmagan (0 emas).");
    return L.join('\n');
  };
  const copy = async () => {
    const t = build(); setTxt(t);
    try { await navigator.clipboard.writeText(t); setFail(false); setMsg(T("Nusxa olindi. Endi Claude chatiga joylang va «tahlil qil» deb yozing.")); }
    catch (e) { setFail(true); setMsg(T("Nusxa olib bo'lmadi. Quyidagi matnni belgilab, o'zingiz nusxalang.")); }
  };
  return (
    <div className="card ai">
      <div className="card-head" style={{ marginBottom: 6 }}><h2>{T('Claude bilan tahlil')}</h2><small>{oyNomi(ym)}</small></div>
      <p className="muted" style={{ margin: '0 0 12px' }}>{T("Shu oy ma'lumotlarini nusxalab, Claude chatiga joylang: chuqur tahlil va maslahatlar olasiz.")}</p>
      <button className="btn" onClick={copy}>{T('Hisobotni nusxalash')}</button>
      {msg && <p className={fail ? 'neg' : 'muted'} style={{ fontSize: 13.5, margin: '10px 0 0' }}>{msg}</p>}
      {fail && txt && <textarea className="input" readOnly rows={8} value={txt} onFocus={e => e.target.select()} style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 12 }} />}
    </div>
  );
}

/* ---------------- SOZLAMALAR ---------------- */
function Sozlamalar({ st, say, close, user, install, onLogout }) {
  const { soz, api, savdo: S, rasxod: R, nasiya: N, xodimlar } = st;
  const owner = ROLE === 'owner';
  const [nom, setNom] = useState(soz.nom || '');
  const [reja, setReja] = useState(soz.reja ? String(soz.reja) : '');
  const [xe, setXe] = useState('');
  const [xi, setXi] = useState('');
  const [ask, setAsk] = useState(null);
  const [impAsk, setImpAsk] = useState(false);
  const save = async e => {
    e.preventDefault();
    await api.saveSoz({ nom: nom.trim().slice(0, 60), reja: num(reja) });
    say(T('Sozlamalar saqlandi')); close();
  };
  const addX = async e => {
    e.preventDefault();
    const em = xe.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { say(T("Email noto'g'ri yozilgan."), 'err'); return; }
    if (em === ME) { setXe(''); return; }
    await api.addXodim(em, xi.trim().slice(0, 60));
    say(T("Sotuvchi qo'shildi: {0}", em)); setXe(''); setXi('');
  };
  const csv = rows => '﻿' + rows.map(r => r.map(c => { const s = String(c == null ? '' : c); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(';')).join('\r\n');
  const dc = v => String(r2(v)).replace('.', ',');
  const download = (name, text) => {
    const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  };
  const exportIt = kind => {
    const data = kind === 'savdo'
      ? csv([['Sana', 'Naqd', 'Karta', 'Click/Payme', 'Dollar ($)', 'Kurs', "Dollar (so'm)", "Jami (so'm)", 'Izoh'].map(x => T(x)), ...[...S].sort((a, b) => a.sana.localeCompare(b.sana)).map(r => [sanaNuqta(r.sana), dc(r.naqd || 0), r.karta == null ? '' : dc(r.karta), dc(r.otkazma || 0), r.usd || '', r.kurs ? dc(r.kurs) : '', r.usdSom ? dc(r.usdSom) : '', dc(jami(r)), r.izoh || ''])])
      : csv([['Sana', 'Turi', 'Summa', "To'lov", 'Izoh'].map(x => T(x)), ...[...R].sort((a, b) => a.sana.localeCompare(b.sana)).map(r => [sanaNuqta(r.sana), T(r.tur), dc(r.summa), tolovNomi(r.tolov), r.izoh || ''])]);
    download(`${kind === 'savdo' ? 'savdolar' : 'rasxodlar'}-${today()}.csv`, data);
  };
  const [OLD, setOLD] = useState(null);
  const haveS = new Set(S.map(x => x.sana)), haveR = new Set(R.map(x => x.id)), haveN = new Set(N.map(x => x.id));
  const oldLeft = OLD ? (OLD.savdo || []).filter(r => r && !haveS.has(r.sana)).length + (OLD.rasxod || []).filter(r => r && !haveR.has(r.id)).length + (OLD.nasiya || []).filter(r => r && !haveN.has(r.id)).length : 0;
  const pick = async e => {
    const f = e.target.files && e.target.files[0]; e.target.value = '';
    if (!f) return;
    try { const d = JSON.parse(await f.text()); if (!d || !Array.isArray(d.savdo)) throw new Error('x'); setOLD(d); setImpAsk(false); }
    catch (er) { say(T("Bu fayl eski daftar fayli emas."), 'err'); }
  };
  const doImport = () => { const n = api.importOld(OLD, haveS, haveR, haveN, st.sozBor); say(T("Ko'chirildi: {0} ta yozuv", n)); setImpAsk(false); setOLD(null); };
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  return (
    <div className="sheet-bg" onClick={e => e.target === e.currentTarget && close()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="soz-h">
        <div className="sheet-h"><h2 id="soz-h">{T('Sozlamalar')}</h2><button className="x" aria-label={T('Yopish')} onClick={close}>×</button></div>

        {owner && (
          <form className="form" onSubmit={save}>
            <div className="field"><label htmlFor="z-nom">{T("Do'kon nomi")}</label><input id="z-nom" className="input" value={nom} maxLength={60} placeholder={T('Masalan: Baraka market')} onChange={e => setNom(e.target.value)} /></div>
            <MoneyInput id="z-reja" label={T('Oylik savdo rejasi')} value={reja} onChange={setReja} />
            <p className="muted" style={{ margin: 0 }}>{T("Reja qo'ysangiz, bosh sahifada necha foiz bajarilgani va har kuni qancha sotish kerakligi ko'rinadi.")}</p>
            <button className="btn">{T('Saqlash')}</button>
          </form>
        )}

        {!standalone && (install || isIOS) && (
          <div className="sheet-sec">
            <div className="sec-title">{T("Ilovani telefonga o'rnatish")}</div>
            {install ? <button className="btn" style={{ marginTop: 10 }} onClick={install}>{T("O'rnatish")}</button>
              : <p className="muted" style={{ margin: '8px 0 0' }}>{T("iPhone'da: pastdagi «Ulashish» tugmasi → «Bosh ekranga qo'shish».")}</p>}
          </div>
        )}

        {owner && (
          <div className="sheet-sec">
            <div className="sec-title">{T("Claude'dagi eski daftar")}</div>
            {!OLD && <>
              <p className="muted" style={{ margin: '8px 0 10px', fontSize: 13.5 }}>{T("Chatda yuborilgan «eski-daftar.json» faylini tanlang. Ko'chirganda bu yerda kiritilganlar o'zgarmaydi.")}</p>
              <label className="btn ghost" htmlFor="old-file" style={{ display: 'block', textAlign: 'center' }}>{T('Faylni tanlash')}</label>
              <input id="old-file" type="file" accept=".json,application/json" onChange={pick} style={{ display: 'none' }} />
            </>}
            {OLD && oldLeft === 0 && <p className="muted" style={{ margin: '8px 0 0' }}>{T("Bu fayldagi hamma yozuvlar allaqachon ko'chirilgan.")}</p>}
            {OLD && oldLeft > 0 && <>
              <p className="muted" style={{ margin: '8px 0 10px' }}>{T("{0} ta yozuv hali ko'chirilmagan. Ko'chirganda bu yerda kiritilganlar o'zgarmaydi.", oldLeft)}</p>
              {impAsk
                ? <div className="form-actions"><button className="btn" onClick={doImport}>{T("Ha, ko'chir")}</button><button className="btn ghost sm" onClick={() => setImpAsk(false)}>{T('Bekor qilish')}</button></div>
                : <button className="btn" onClick={() => setImpAsk(true)}>{T("Ko'chirish")}</button>}
            </>}
          </div>
        )}

        {owner && (
          <div className="sheet-sec">
            <div className="sec-title">{T('Sotuvchilar')}</div>
            <p className="muted" style={{ margin: '8px 0 10px', fontSize: 13.5 }}>{T("Sotuvchi shu email bilan ro'yxatdan o'tadi. U savdo, rasxod va nasiya kirita oladi, lekin o'chira olmaydi va tahlilni ko'rmaydi.")}</p>
            <div className="list">
              {!xodimlar.length && <p className="empty" style={{ paddingTop: 4 }}>{T("Hali sotuvchi qo'shilmagan.")}</p>}
              {xodimlar.map(x => (
                <div className="li" key={x.id}>
                  <div className="li-main"><b>{x.ism || x.id}</b>{x.ism && <small>{x.id}</small>}</div>
                  {ask === x.id
                    ? <span className="confirm"><button className="btn danger sm" onClick={() => { api.delXodim(x.id); setAsk(null); }}>{T("O'chir")}</button><button className="x" aria-label={T('Bekor qilish')} onClick={() => setAsk(null)}>×</button></span>
                    : <button className="x" aria-label={T('{0} ni olib tashlash', x.id)} onClick={() => setAsk(x.id)}>×</button>}
                </div>
              ))}
            </div>
            <form className="form" onSubmit={addX} style={{ marginTop: 10 }}>
              <div className="row2">
                <div className="field"><label htmlFor="x-email">{T('Sotuvchi emaili')}</label><input id="x-email" className="input" type="email" autoComplete="off" value={xe} onChange={e => setXe(e.target.value)} placeholder="name@gmail.com" /></div>
                <div className="field"><label htmlFor="x-ism">{T('Ismi (ixtiyoriy)')}</label><input id="x-ism" className="input" value={xi} maxLength={60} onChange={e => setXi(e.target.value)} /></div>
              </div>
              <button className="btn ghost" disabled={!xe.trim()}>{T("Qo'shish")}</button>
            </form>
          </div>
        )}

        {owner && (
          <div className="sheet-sec">
            <div className="sec-title" style={{ marginBottom: 10 }}>{T('Excel uchun yuklab olish (CSV)')}</div>
            <div className="form-actions">
              <button className="btn ghost sm" style={{ flex: 1 }} onClick={() => exportIt('savdo')} disabled={!S.length}>{T('Savdolar')}</button>
              <button className="btn ghost sm" style={{ flex: 1 }} onClick={() => exportIt('rasxod')} disabled={!R.length}>{T('Rasxodlar')}</button>
            </div>
          </div>
        )}

        <div className="sheet-sec">
          <div className="sec-title">{T('Akkaunt')}</div>
          <p className="muted" style={{ margin: '8px 0 12px' }}>{user.email} · {owner ? T('Egasi') : T('Sotuvchi')}</p>
          <button className="btn ghost" onClick={onLogout}>{T('Chiqish')}</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- ikonkalar ---------------- */
const Ico = {
  home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" /></svg>,
  savdo: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6M9 16h3" /></svg>,
  rasxod: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10h18M7 15h4" /><path d="M16 3.5 18.5 6" /></svg>,
  tahlil: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>,
  nasiya: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" /><path d="M5 17a3 3 0 0 1 3-3h11M9 8h6" /></svg>,
  gear: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>,
  shop: <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5 5 4h14l2 5.5" /><path d="M3 9.5a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" /><path d="M5 12.5V20h14v-7.5M10 20v-4h4v4" /></svg>
};
const TABS = [['asosiy', 'Asosiy', 'Главная', Ico.home], ['savdo', 'Savdo', 'Продажи', Ico.savdo], ['rasxod', 'Rasxod', 'Расходы', Ico.rasxod], ['tahlil', 'Tahlil', 'Анализ', Ico.tahlil], ['nasiya', 'Nasiya', 'Долги', Ico.nasiya]];

function LangBtn({ lang, switchLang }) {
  return (
    <button className="langbtn" aria-label={T('Tilni almashtirish')} onClick={switchLang}>
      <span className={lang === 'uz' ? 'on' : ''}>UZ</span><span className={lang === 'ru' ? 'on' : ''}>RU</span>
    </button>
  );
}

/* ---------------- KIRISH ---------------- */
function authXato(e) {
  const c = (e && e.code) || '';
  if (/invalid-credential|wrong-password|user-not-found|invalid-login/.test(c)) return T("Email yoki parol noto'g'ri.");
  if (c.includes('email-already-in-use')) return T("Bu email bilan akkaunt bor. «Kirish» ni tanlang.");
  if (c.includes('weak-password')) return T("Parol kamida 6 belgidan iborat bo'lsin.");
  if (c.includes('invalid-email')) return T("Email noto'g'ri yozilgan.");
  if (c.includes('too-many-requests')) return T("Ko'p urinish bo'ldi. Birozdan keyin qayta urinib ko'ring.");
  if (c.includes('network-request-failed')) return T("Internet yo'q.");
  return T('Xatolik: {0}', c || (e && e.message) || '?');
}
function Kirish({ a, lang, switchLang, recheck }) {
  const [mode, setMode] = useState('in');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const submit = async e => {
    e.preventDefault(); setBusy(true); setMsg(null);
    try {
      if (mode === 'in') await signInWithEmailAndPassword(auth, email.trim(), pw);
      else { const cr = await createUserWithEmailAndPassword(auth, email.trim(), pw); await sendEmailVerification(cr.user); }
    } catch (er) { setMsg({ c: 'err', t: authXato(er) }); }
    setBusy(false);
  };
  const reset = async () => {
    if (!email.trim()) { setMsg({ c: 'err', t: T('Avval emailingizni yozing.') }); return; }
    try { await sendPasswordResetEmail(auth, email.trim()); setMsg({ c: 'ok', t: T('Parolni tiklash xati {0} ga yuborildi.', email.trim()) }); }
    catch (er) { setMsg({ c: 'err', t: authXato(er) }); }
  };
  const resend = async () => {
    try { await sendEmailVerification(auth.currentUser); setMsg({ c: 'ok', t: T('Xat qayta yuborildi.') }); }
    catch (er) { setMsg({ c: 'err', t: authXato(er) }); }
  };
  const again = async () => { setBusy(true); setMsg(null); await recheck(); setBusy(false); };
  return (
    <div className="auth-wrap">
      <div className="auth-top"><LangBtn lang={lang} switchLang={switchLang} /></div>
      <div className="auth-card">
        <div className="logo big" aria-hidden="true">{Ico.shop}</div>
        <h1>{T("Do'kon daftari")}</h1>
        <p className="muted" style={{ margin: '4px 0 18px' }}>{T('Savdo, rasxod va qarzlar hisobi')}</p>

        {a.st === 'loading' && <p className="muted">{T('Yuklanmoqda…')}</p>}

        {a.st === 'out' && (
          <form className="form" onSubmit={submit}>
            <div className="seg" role="group" aria-label={T('Kirish')}>
              <button type="button" aria-pressed={mode === 'in'} onClick={() => { setMode('in'); setMsg(null); }}>{T('Kirish')}</button>
              <button type="button" aria-pressed={mode === 'up'} onClick={() => { setMode('up'); setMsg(null); }}>{T("Ro'yxatdan o'tish")}</button>
            </div>
            <div className="field"><label htmlFor="a-email">Email</label>
              <input id="a-email" className="input" type="email" inputMode="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@gmail.com" /></div>
            <div className="field"><label htmlFor="a-pw">{T('Parol')}</label>
              <div className="money">
                <input id="a-pw" className="input" style={{ fontFamily: 'var(--font-body)', fontSize: 16 }} type={show ? 'text' : 'password'} autoComplete={mode === 'in' ? 'current-password' : 'new-password'} value={pw} onChange={e => setPw(e.target.value)} placeholder={T('kamida 6 belgi')} />
                <button type="button" className="pw-toggle" onClick={() => setShow(!show)}>{show ? T('Yashirish') : T("Ko'rsatish")}</button>
              </div></div>
            <button className="btn" disabled={busy || !email.trim() || pw.length < 6}>{busy ? T('Yuklanmoqda…') : mode === 'in' ? T('Kirish') : T("Ro'yxatdan o'tish")}</button>
            {mode === 'in' && <button type="button" className="linkbtn" style={{ alignSelf: 'center' }} onClick={reset}>{T('Parolni unutdim')}</button>}
          </form>
        )}

        {a.st === 'unverified' && (
          <div className="form">
            <p style={{ margin: 0 }}>{T("Emailingizni tasdiqlang: {0} manziliga xat yubordik. Xatdagi havolani bosing, keyin «Tasdiqladim» tugmasini bosing.", a.user.email)}</p>
            <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>{T("Xat kelmasa, «Spam» papkasini tekshiring.")}</p>
            <button className="btn" onClick={again} disabled={busy}>{T('Tasdiqladim')}</button>
            <button className="btn ghost" onClick={resend}>{T('Xatni qayta yuborish')}</button>
            <button className="linkbtn" style={{ alignSelf: 'center' }} onClick={() => signOut(auth)}>{T('Chiqish')}</button>
          </div>
        )}

        {a.st === 'denied' && (
          <div className="form">
            <p style={{ margin: 0 }}>{T("Sizga hali ruxsat berilmagan. Do'kon egasidan {0} emailini sotuvchi sifatida qo'shishini so'rang, keyin «Qayta tekshirish» ni bosing.", a.user.email)}</p>
            <button className="btn" onClick={again} disabled={busy}>{T('Qayta tekshirish')}</button>
            <button className="linkbtn" style={{ alignSelf: 'center' }} onClick={() => signOut(auth)}>{T('Chiqish')}</button>
          </div>
        )}

        {msg && <p className={msg.c === 'err' ? 'neg' : 'pos'} style={{ fontSize: 14, margin: '12px 0 0' }}>{msg.t}</p>}
      </div>
    </div>
  );
}

/* ---------------- ILOVA ---------------- */
function App() {
  const [lang, setLangState] = useState(LANG);
  const switchLang = () => { const l = lang === 'ru' ? 'uz' : 'ru'; applyLang(l); try { localStorage.setItem('dokon-lang', l); } catch (e) { /* */ } setLangState(l); };
  const [a, setA] = useState({ st: 'loading', user: null, role: null });
  const check = async u => {
    if (!u) { setA({ st: 'out', user: null, role: null }); return; }
    if (!u.emailVerified) { setA({ st: 'unverified', user: u, role: null }); return; }
    const em = (u.email || '').toLowerCase();
    const key = 'dokon-rol-' + em;
    const cached = (() => { try { return localStorage.getItem(key); } catch (e) { return null; } })();
    const keep = r => { try { localStorage.setItem(key, r); } catch (e) { /* */ } };
    const offlineErr = e => /unavailable|offline|network/.test((e && (e.code || e.message)) || '');
    try { await getDoc(doc(db, 'egasi', 'tekshiruv')); keep('owner'); setA({ st: 'ok', user: u, role: 'owner' }); return; }
    catch (e) { if (offlineErr(e) && cached) { setA({ st: 'ok', user: u, role: cached }); return; } }
    try {
      const d = await getDoc(doc(db, 'xodimlar', em));
      if (d.exists()) { keep('seller'); setA({ st: 'ok', user: u, role: 'seller' }); }
      else setA({ st: 'denied', user: u, role: null });
    } catch (e) { setA(offlineErr(e) && cached ? { st: 'ok', user: u, role: cached } : { st: 'denied', user: u, role: null }); }
  };
  useEffect(() => onAuthStateChanged(auth, u => { check(u); }), []);
  const recheck = async () => {
    const u = auth.currentUser;
    if (u) { try { await u.reload(); await u.getIdToken(true); } catch (e) { /* */ } }
    await check(auth.currentUser);
  };
  if (a.st !== 'ok') return <Kirish a={a} lang={lang} switchLang={switchLang} recheck={recheck} />;
  return <Ilova key={a.user.uid + a.role} user={a.user} role={a.role} lang={lang} switchLang={switchLang} />;
}

function Ilova({ user, role, lang, switchLang }) {
  ME = (user.email || '').toLowerCase(); ROLE = role;
  const owner = role === 'owner';
  const st = useStore(owner);
  const [tab, setTab] = useState(owner ? 'asosiy' : 'savdo');
  const [kun, setKun] = useState(today());
  const [savdoInit, setSavdoInit] = useState({ d: today(), k: 0 });
  const [sozOpen, setSozOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [installEvt, setInstallEvt] = useState(null);
  const demo = false;
  const S = st.savdo, R = st.rasxod, N = st.nasiya;
  const say = (msg, kind) => setToast({ msg, kind: kind || 'ok', k: Date.now() });
  useEffect(() => { reportErr = m => say(m, 'err'); }, []);
  useEffect(() => { if (!toast) return; const tm = setTimeout(() => setToast(null), 2800); return () => clearTimeout(tm); }, [toast]);
  useEffect(() => {
    const h = e => { e.preventDefault(); setInstallEvt(e); };
    window.addEventListener('beforeinstallprompt', h);
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);
  const install = installEvt ? async () => { installEvt.prompt(); try { await installEvt.userChoice; } catch (e) { /* */ } setInstallEvt(null); } : null;
  const go = t => { setTab(t); window.scrollTo({ top: 0 }); };
  const openSavdo = d => { setSavdoInit({ d, k: Date.now() }); go('savdo'); };
  const oy = oyNomi(ymOf(today()));
  const tabs = owner ? TABS : TABS.filter(x => x[0] === 'savdo' || x[0] === 'rasxod' || x[0] === 'nasiya');

  return (
    <div className="app">
      <header className="top">
        <div className="brand">
          <div className="logo" aria-hidden="true">{Ico.shop}</div>
          <div style={{ minWidth: 0 }}><h1>{st.soz.nom || T("Do'kon daftari")}</h1><small>{T('{0} · savdo va rasxod', oy)}</small></div>
        </div>
        <div className="top-actions">
          <LangBtn lang={lang} switchLang={switchLang} />
          <button className="iconbtn" aria-label={T('Sozlamalar')} onClick={() => setSozOpen(true)}>{Ico.gear}</button>
        </div>
      </header>

      {st.offline && <div className="note">{T("Internet yo'q: yozuvlar telefonda saqlanadi va internet chiqqanda o'zi yuboriladi.")}</div>}
      {st.warn && !st.offline && <div className="note warn">{st.warn}</div>}
      <main key={lang}>
        {!st.ready ? <div className="loading">{T("Ma'lumotlar yuklanmoqda…")}</div> : (
          <>
            {tab === 'asosiy' && owner && <Asosiy S={S} R={R} N={N} soz={st.soz} kun={kun} setKun={setKun} onSavdo={openSavdo} onTab={go} openSoz={() => setSozOpen(true)} />}
            {tab === 'savdo' && <Savdo key={savdoInit.k} initial={savdoInit.d} S={S} demo={demo} api={st.api} say={say} readOnly={false} />}
            {tab === 'rasxod' && <Rasxod R={R} demo={demo} api={st.api} say={say} readOnly={false} />}
            {tab === 'tahlil' && owner && <Tahlil S={S} R={R} N={N} soz={st.soz} demo={demo} />}
            {tab === 'nasiya' && <Nasiya N={N} demo={demo} api={st.api} say={say} readOnly={false} />}
          </>
        )}
      </main>

      <nav className="nav" aria-label={T("Bo'limlar")}>
        <div className="nav-in" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
          {tabs.map(([k, n, nr, ic]) => (
            <button key={k} aria-current={tab === k ? 'page' : undefined} onClick={() => go(k)}>{ic}<span>{lang === 'ru' ? nr : n}</span></button>
          ))}
        </div>
      </nav>

      {toast && <div className={'toast ' + toast.kind} key={toast.k} role="status">{toast.msg}</div>}
      {sozOpen && <Sozlamalar st={st} say={say} close={() => setSozOpen(false)} user={user} install={install} onLogout={() => signOut(auth)} />}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
