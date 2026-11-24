# Harfchi.uz

O‘zbek lotin va kirill yozuvida klaviatura mashqlari, Telegram orqali kirish, shaxsiy statistika va hududiy reyting. Dastlab baza bo‘sh. Birinchi sinovdan boshlab haqiqiy ko‘rsatkichlar paydo bo‘ladi.

## Kompyuter yoki Termux’da ishga tushirish

**Node.js 24 LTS yoki yangiroq** va npm kerak. SQLite Node tarkibida ishlaydi. Baza serveri yoki C++ kompilyatorini o‘rnatish shart emas. Windows 7 va Node 12 bu loyiha uchun mos emas. Android’da Termux ichida loyihani telefonning umumiy xotirasidan Termux uy papkasiga ko‘chiring. Node versiyasini `node -v` bilan tekshiring.

ZIP faylni oching. Terminalni `package.json` joylashgan `harfchi` papkasida ochib, bajaring.

```sh
npm ci
npm run setup
npm start
```

Brauzerda **http://localhost:3000** ni oching. Tayyor frontend `dist/` ichida. `setup` tasodifiy maxfiy kalit bilan mahalliy `.env` yaratadi va mavjud sozlamalarni saqlaydi. Mehmon mashqlari uchun Telegram tokeni talab qilinmaydi.

Manba kodini tahrirlagach quyidagi buyruqlarni bajaring.

```sh
npm run build
npm test
npm start
```

Avvalgi server ishlayotgan bo‘lsa, qayta ishga tushirishdan oldin o‘sha terminalda Ctrl+C bosing. Tailwind, Chart.js, Lucide ikonkalari va shriftlar lokal buildga kiradi. Birinchi ochilish va o‘rnatishda internet kerak. Service Worker tayyor bo‘lgach, saytni oflayn ochib mashq qilish mumkin.

## Mashq qilish

| Boshqaruv | Vazifa |
|---|---|
| Matn oynasini bosib yozish | Birinchi belgi bilan vaqt boshlanadi |
| Backspace | Oxirgi belgini o‘chirish, xatosi bor oldingi so‘zga qaytish |
| Ctrl+Backspace | So‘zni o‘chirish |
| Tab | Yozish oynasida yangi mashq boshlash |
| Esc | Sozlamalarni ochish yoki yopish |
| Ctrl+Shift+P | Buyruqni topish |
| Shift+Enter | Erkin mashqni yakunlash |

Vaqt rejimida 15, 30, 60 yoki 120 soniya, so‘z rejimida 10, 25, 50 yoki 100 so‘z tanlanadi. Iqtiboslar lotin yozuvida beriladi. Maxsus rejimga 5000 belgigacha matn kiritiladi. Tinish belgilari va raqamlar vaqt hamda so‘z mashqlariga qo‘shiladi. Sozlamalar tugmasi orqali mavzu, mexanik tugma ovozi va raqib kursor tezligi tanlanadi. Raqib uchun shaxsiy rekord ayni lug‘at, rejim va davomiylik bo‘yicha olinadi. Statistika bo‘limida xatolar bo‘yicha mashq ochiladi.

**Sof WPM** to‘g‘ri yozilgan belgilar sonini beshga va mashq davomiyligining daqiqadagi qiymatiga bo‘lish orqali hisoblanadi. To‘g‘ri bo‘shliqlar ham hisobga kiradi. Yalpi WPM kiritilgan belgilarni, jumladan keyin o‘chirilganlarini hisoblaydi. Aniqlik kiritish paytidagi to‘g‘ri bosishlar ulushidir. Barqarorlik har soniyadagi tezliklarning o‘zgarish koeffitsiyentidan olinadi. Natijani nusxalash, ayni matnni takrorlash va 1200 × 630 PNG kartani saqlash mumkin.

Kunlar Toshkent vaqti bilan ajratiladi. Haftalik reyting bugun va oldingi olti kunni qamrab oladi. Seriya uchun kuniga kamida bitta tugallangan mashq kerak. Kunlik maqsad 3, 5 yoki 10 ta. Darajalar mos ravishda 0, 10, 30, 75 va 200 ta tugallangan mashqda ochiladi.

## Hisob va saqlash

Mehmon natijalari shu brauzerning localStorage xotirasida qoladi. Telegram orqali kirilganda ular hisobga biriktiriladi. Yuborish muvaffaqiyatli bo‘lgach, lokal navbatdan o‘chiriladi. Natijada noyob identifikator bor. Bir xil natijani qayta yuborish dublikat yaratmaydi. Oflayn mehmon natijalari shaxsiy statistikaga kiradi. Maxsus matn natija sifatida serverga yuborilmaydi. Brauzer xotirasini tozalash sinxronlanmagan mashqlarni o‘chiradi.

Reyting uchun tizimga kirib, oddiy lotin yoki kirill lug‘atini va modifikatorsiz vaqt rejimini tanlang. Server mashq matni va bir martalik identifikator beradi. Birinchi tugmada server vaqti belgilab olinadi. Server matn bilan moslikni qayta hisoblaydi, davomiylik, belgilar soni, soniyalik tezliklar va tugmalar oraliqlarini solishtiradi. 260 WPM dan tez yoki bir xil ritmdagi mashqlar reytingga kirmaydi. 120 soniyali tasdiqlangan rekord profilda ko‘rinadi. Umumiy jadvalda 15/30/60 soniyali sinovlar bor. Takrorlangan matn, mehmon natijasi va tekshiruvdan o‘tmagan urinish shaxsiy tarixda qoladi. Brauzer telemetriyasi avtomatlashtirishni mutlaq aniqlash vositasi emas.

## Telegram

BotFather orqali bot yarating va `/setdomain` bilan `harfchi.uz` domenini bog‘lang. `.env` ichida `TELEGRAM_BOT_TOKEN` hamda `TELEGRAM_BOT_USERNAME` ni kiriting. Username boshida @ belgisi yozilmaydi. Widget Telegram sahifasida rozilik olib, saytingizga qaytaradi. Frontend URL parametrlarini tozalab, imzolangan maydonlarni API’ga yuboradi. Bot tokeni serverda qoladi. HTTP-only cookie 7 kun amal qiladi. Production rejimida cookie faqat HTTPS orqali yuboriladi. Login tasdig‘i uchun 5 daqiqalik muddat va takroran ishlatishni cheklash bor. Server soatini sinxron tuting.

Telegram sahifasi va tasdiqlash oynasining tilini Telegram boshqaradi. Widget uchun o‘zbek tili so‘raladi. Ishga tushirgach haqiqiy Telegram hisobingiz bilan kirish va chiqishni tekshiring. HMAC asosidagi integratsiya uchun [Telegram Login Widget hujjati](https://core.telegram.org/widgets/login-legacy).

| O‘zgaruvchi | Qiymati |
|---|---|
| PORT, HOST | Standart 3000 va 127.0.0.1 |
| DATABASE_URL | SQLite fayl yo‘li, masalan /var/lib/harfchi/harfchi.sqlite |
| CLIENT_URL | Ishlab turgan sayt origin’i, production uchun https://harfchi.uz |
| TELEGRAM_BOT_TOKEN | BotFather bergan maxfiy token |
| TELEGRAM_BOT_USERNAME | Widget ko‘rsatadigan bot nomi |
| JWT_SECRET | Kamida 32 baytli tasodifiy maxfiy kalit |
| NODE_ENV | Mahalliy sinovda development, serverda production |

## harfchi.uz domeniga joylash

Quyidagi misol Ubuntu/Debian VPS, Nginx, Certbot va PM2 uchun. DNS A yozuvini VPS manziliga yo‘naltiring. AAAA ishlatilsa, IPv6 tinglash manzillarini Nginx konfiguratsiyasiga ham qo‘shing. 80 va 443 portlar tashqaridan ochiq bo‘lsin.

1. Node.js 24+ o‘rnating. `sudo apt install nginx certbot` bilan Nginx va Certbotni o‘rnating. `npm install -g pm2` bilan PM2 ni o‘rnating.
2. Loyihani xizmatni ishga tushiradigan oddiy foydalanuvchiga tegishli `/opt/harfchi` papkasiga joylang. Quyidagi buyruqlarni shu foydalanuvchi hisobidan bajaring.

```sh
cd /opt/harfchi
npm ci
npm run build
npm test
npm run setup
chmod 600 .env
sudo install -d -m 750 -o "$(id -un)" /var/lib/harfchi
```

3. `.env` ichida `NODE_ENV=production`, `CLIENT_URL=https://harfchi.uz`, `DATABASE_URL=/var/lib/harfchi/harfchi.sqlite` va bot ma’lumotlarini belgilang. `setup` yaratgan JWT kalitini saqlang. Maxfiy kalit almashsa, mavjud sessiyalar tugaydi.
4. Birinchi sertifikatni olish uchun HTTP konfiguratsiyasini ulang.

```sh
sudo mkdir -p /var/www/certbot
sudo cp deploy/nginx-bootstrap.conf /etc/nginx/sites-available/harfchi.uz
sudo ln -sfn /etc/nginx/sites-available/harfchi.uz /etc/nginx/sites-enabled/harfchi.uz
sudo nginx -t && sudo systemctl reload nginx
sudo certbot certonly --webroot -w /var/www/certbot -d harfchi.uz
```

5. Sertifikat olingach, HTTPS konfiguratsiyasini va ilovani yoqing.

```sh
sudo cp deploy/nginx.conf /etc/nginx/sites-available/harfchi.uz
sudo nginx -t && sudo systemctl reload nginx
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

PM2 ko‘rsatgan tizim buyrug‘ini bir marta bajaring. `sudo certbot renew --dry-run` orqali yangilanishni tekshiring. Quyidagi hook yangi sertifikat olinganda Nginx’ni qayta yuklaydi.

```sh
sudo install -d /etc/letsencrypt/renewal-hooks/deploy
printf '#!/bin/sh\nsystemctl reload nginx\n' | sudo tee /etc/letsencrypt/renewal-hooks/deploy/reload-nginx >/dev/null
sudo chmod 755 /etc/letsencrypt/renewal-hooks/deploy/reload-nginx
```

6. `https://harfchi.uz/api/auth/me` mehmon uchun `user: null` va bot nomini qaytarishini tekshiring. Domen orqali kiring, modifikatorsiz vaqt mashqini tugating va reyting filtrini shu davomiylikka o‘rnating. Jurnal uchun `pm2 logs harfchi` ishlatiladi.

Yangilashda ma’lumotlar faylini va `.env` ni saqlang. `npm ci && npm run build && npm test && pm2 restart harfchi` buyrug‘ini loyiha papkasida bajaring. SQLite WAL rejimida. Ishlayotgan bazani zaxiralash uchun SQLite CLI bilan `sqlite3 /var/lib/harfchi/harfchi.sqlite ".backup '/xavfsiz/papka/harfchi.sqlite'"` ishlating. Zaxira papkasi oldindan mavjud bo‘lsin. Qayta tiklashni faqat server to‘xtatilganida, alohida bo‘sh papkadagi nusxada tekshiring.

## API va papkalar

| So‘rov | Vazifasi |
|---|---|
| POST /api/auth/telegram | Widget tasdig‘idan sessiya ochish |
| GET /api/auth/me, POST /api/auth/logout | Sessiya holati va chiqish |
| PATCH /api/profile | Ism, hudud va kunlik maqsad |
| POST /api/challenges, POST /api/challenges/:id/start | Reyting mashqi matni va boshlanishi |
| POST /api/results | Natijani tekshirish va tranzaksiyada saqlash |
| GET /api/results/me | Statistika, shaxsiy rekordlar, so‘nggi 50 sinov |
| GET /api/leaderboard | mode=15/30/60, lang=latin/cyrillic, period=daily/weekly/all, region |
| GET /api/u/:username | Ommaviy profil ma’lumotlari |
| GET /u/:username | Ommaviy profil sahifasi |

`client/src` interfeys, yozish dvigateli va uslublarni, `client/shared` lug‘at va hisoblash qoidalarini saqlaydi. `client/public` ichida manifest, logotip, ikonka va OG rasmi bor. `client/sw.js` build paytida fayllar ro‘yxati va versiya bilan to‘ldiriladi. `server/routes` API, `server/middleware` sessiya, `server/db` SQLite sxemasi, `server/utils/anticheat.js` reyting tekshiruvlariga tegishli. `test` vaqtinchalik xotiradagi bazada ishlaydi. Testlar haqiqiy bazaga namuna yozmaydi.
