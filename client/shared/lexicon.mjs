const nouns =
  `kitob daftar qalam varaq maktab sinf dars sinov savol javob ustoz muallim shogird talaba bola qiz ona ota aka uka opa singil oila mahalla hovli xonadon shahar qishloq tuman viloyat vatan mamlakat dunyo yer osmon quyosh oy yulduz bulut yomg‘ir qor shamol havo suv daryo dengiz ko‘l buloq irmoq tog‘ tepa adir dala bog‘ daraxt barg shox ildiz gul meva olma anor anjir uzum shaftoli gilos o‘rik terak tol chinor archa maysa giyoh yaproq urug‘ nihol paxta bug‘doy sholi arpa non un tuz yog‘ shakar asal sut qatiq qaymoq pishloq osh sho‘rva lag‘mon somsa manti choy piyola choynak kosa qoshiq sanchqi pichoq idish dasturxon stol stul kursi eshik deraza devor tom pol shift xona oshxona ayvon zinapoya parda gilam ko‘rpa yostiq chiroq sham soat vaqt kun tun tong sahar peshin oqshom kecha hafta yil fasl bahor yoz kuz qish sayr safar yo‘l ko‘cha bekat ko‘prik maydon bozor do‘kon rastа savdo narx pul hisob mehnat kasb ish hunar mahorat tajriba bilim ilm fan tarix til so‘z harf tovush ovoz nutq gap jumla matn satr qator sahifa asar ertak hikoya roman she’r maqol topishmoq qo‘shiq kuy ohang raqs san’at surat rasm rang naqsh shakl chiziq nuqta doira burchak tomon markaz masofa tezlik qadam harakat kuch quvvat tinchlik orzu umid niyat maqsad fikr xayol aql idrok zehn xotira diqqat sabr odob hurmat mehr sadoqat ishonch imkon omad yutuq g‘alaba yordam maslahat xabar maktub manzil ism nom belgi kalit qulf telefon ekran tugma dastur tarmoq fayl papka raqam jadval ro‘yxat nusxa qurilma sichqoncha klaviatura kompyuter noutbuk aloqa pochta avtobus poyezd vagon mashina samolyot kema qayiq g‘ildirak qanot parvoz chipta yo‘lovchi haydovchi bekat bino makon kutubxona muzey teatr sahna tomosha mahkum shifokor hamshira bemor dori dorixona tabiat yaylov o‘rmon cho‘l vodiy qir sohil orol to‘lqin tuproq tosh qum temir kumush oltin mis ipak mato kiyim ko‘ylak shim paypoq etik qalpoq kamar cho‘ntak savat sandiq tokcha javon qo‘l oyoq bosh barmoq tirnoq kaft yelka quloq ko‘z qosh kiprik yuz burun lab til tish yurak nafas qush kaptar chumchuq qaldirg‘och burgut lochin baliq ot quyon mushuk sher tuya echki qo‘y sigir tovuq jo‘ja asalari kapalak chumoli qishloqdosh qo‘shni mehmon do‘st hamkor jamoa jamiyat xalq el yurt davlat bayroq madhiyа madaniyat meros qadriyat an’ana bayram sovg‘a tabrik tabassum quvonch baxt sezgi saviya daraja sifat natija vazifa reja loyiha qaror tartib qoida usul sabab dalil misol mashq imkoniyat tashkilot korxona zavod fabrika dehqon bog‘bon oshpaz tikuvchi quruvchi sotuvchi xaridor rassom yozuvchi olim muhandis tarjimon o‘qituvchi o‘quvchi kitobxon dasturchi hunarmand sportchi suzuvchi murabbiy hakam maydoncha to‘p shaxmat musobaqa jism og‘irlik balandlik kenglik uzunlik hajm son kasr tenglama yechim qatlam manba boylik hosil hosildorlik dehqonchilik madad ezgulik go‘zallik do‘stlik yoshlik bolalik kelajak avlod maktabdosh sinfdosh hamroh`
    .replaceAll("а", "a")
    .split(/\s+/);
const other =
  `men sen biz siz ular u bu shu o‘sha kim nima qanday qachon qayerda qancha qaysi har ham barcha butun yana ammo lekin chunki bilan uchun orqali kabi sari tomon avval keyin hozir bugun ertaga doim ba’zan tez sekin bir ikki uch to‘rt besh olti yetti sakkiz to‘qqiz o‘n yuz ming katta kichik uzun qisqa baland past keng tor yaqin uzoq chuqur yengil og‘ir qattiq yumshoq issiq sovuq iliq salqin toza tiniq yorug‘ qorong‘i eski yangi yaxshi ajoyib chiroyli shirin achchiq mazali qizil sariq yashil oq qora kulrang pushti moviy serquyosh bepoyon mustahkam erkin tinch ochiq yopiq birga yolg‘iz asta darrov birdan ancha juda eng faqat albatta balki hatto ko‘p kam bor yo‘q kerak mumkin yozmoq o‘qimoq ishlamoq o‘rganmoq izlamoq topmoq ko‘rmoq bilmoq bormoq kelmoq olmoq bermoq aytmoq eshitmoq kutmoq yurmoq yugurmoq yaratmoq tinglamoq boshlamoq tugatmoq tushunmoq o‘ylamoq tanlamoq chizmoq sezmoq o‘smoq ochmoq yopmoq`.split(
    /\s+/,
  );
const additional =
  `atrof ich tashqari old orqa yon o‘ng chap yuqori quyi o‘rta chekka chet ost ust tag oraliq manzara ufq koinot sayyora yulduzcha galaktika fazo zamin qit’a okean materik yarimorol muzlik cho‘qqi jar qoya g‘or vodiylik jarlik sharshara qirg‘oq ko‘rfaz mavj ko‘chat buta qayin eman tut jiyda yong‘oq bodom pista behi limon nok hurmo apelsin mandarin qulupnay malina tarvuz qovun qovoq sabzi piyoz sarimsoq kartoshka pomidor bodring karam lavlagi sholg‘om turp no‘xat loviya mosh guruch suli tariq makkajo‘xori sedana zira yalpiz rayhon petrushka ukrop zaytun kungaboqar lola atirgul binafsha boychechak chinnigul kaktus yalpiz g‘uncha chang gulzor xiyobon o‘tloq tomorqa issiqxona niholzor bog‘cha ko‘chatzor shudgor egat ariq kanal to‘g‘on suvombor hovuz favvora tomchi qirov shabnam tuman chaqmoq momaqaldiroq do‘l izg‘irin shabada bo‘ron sel muz bug‘ qurg‘oqchilik namlik harorat iqlim muhit mavsum salqinlik jazirama kechqurun ertalab kunduz tush yarim tun qorong‘ilik shafaq soniya daqiqa lahza muddat payt asr chorak tanaffus ta’til dushanba seshanba chorshanba payshanba juma shanba yakshanba yanvar fevral mart aprel may iyun iyul avgust sentabr oktabr noyabr dekabr nevarа nabira buvi bobo amaki amma tog‘a xola jiyan egizak qarindosh kelin kuyov turmush rafiqa farzand go‘dak chaqaloq o‘smir yigit ayol erkak inson shaxs fuqaro hamyurt tengdosh tanish suhbatdosh sinfdosh kursdosh hamkasb hamshahar sherik sardor yetakchi rahbar boshliq direktor vazir elchi tadbirkor ishchi xodim xizmatkor posbon qorovul temirchi zargar duradgor chilangar sartarosh kulol to‘quvchi chorvador baliqchi novvoy qassob muxbir jurnalist muharrir shoir bastakor xonanda sozanda aktyor aktrisa me’mor fizik kimyogar tadqiqotchi hisobchi uchuvchi dengizchi sayyoh sayohat sayohatchi ziyorat ziyoratchi mehmonxona yotoqxona oshxona choyxona nonvoyxona sartaroshxona ustaxona ishxona shifoxona poliklinika oromgoh dam olish aeroport vokzal metro tramvay trolleybus velosiped mototsikl yuk tirkama traktor teplovoz lokomotiv rels svetofor chorraha yo‘lak trotuar burilish chiqish kirish yo‘nalish qatnov haydovchilik xarita reys viza pasport guvohnoma hujjat ariza bayonnoma xat konvert marka muhr imzo sana nusxa qoralama sarlavha mundarija izoh xulosa band bob bo‘lim nashr matbaa muqova jild muallif qahramon obraz syujet sahifa lug‘at atama ibora bo‘g‘in alifbo imlo talaffuz tarjima ifoda ma’no mazmun muloqot munozara bahs suhbat murojaat tilak taklif iltimos minnatdorlik e’tibor e’lon ma’lumot ma’ruza taqdimot darslik qo‘llanma imtihon baho ball sinovnoma sertifikat diplom fakultet universitet litsey kollej institut laboratoriya tajribaxona formula modda suyuqlik gaz zarra atom molekula hujayra to‘qima organizm ildizpoya tana teri suyak mushak bilak tirsak tizza tovon boldir bo‘yin peshona iyak soqol soch yonoq tomoq ko‘krak qorin bel tirik jonivor hayvon ayiq bo‘ri tulki kiyik bug‘u fil jirafa zebra maymun yo‘lbars qoplon tipratikan yumronqoziq olmaxon yumronqoziq toshbaqa qurbaqa ilon kaltakesak timsoh akula delfin kit laqqa zog‘ora chumchuq qarg‘a to‘ti boyqush laylak turna bedana g‘oz o‘rdak xo‘roz kurka tovus echkiemar ninachi qo‘ng‘iz pashsha chivin ari o‘rgimchak pilla qurt uyа tuxum pat dum panja tuyoq shox tumshuq parvarish yem xashak yaydoq poda gala to‘da sumka xalta hamyon quti savatcha chelak tog‘ora lagan patnis likopcha stakan shisha banka qopqoq pech o‘choq tandir qozon tova elak taxta taxtacha bolg‘a arra mix ombur qaychi igna ip tugma tasma arqon sim rozetka batareya quvvatlagich ulagich kabel kamera mikrofon karnay kuzatuv o‘lchov tarozi chizg‘ich sirkul bo‘yoq mo‘yqalam o‘chirg‘ich qayd eslatma qog‘oz karton charm jun kigiz atlas adras paxtakor atlascha do‘ppi ro‘mol belbog‘ sharf kurtka palto nimcha yaktak kostyum yubka paytava shippak mahsi tufli ko‘zoynak qo‘lqop javohir uzuk bilaguzuk marjon taroq sovun sochiq ko‘zgu tishcho‘tka pardoz orastalik sog‘lik salomatlik poklik ozodalik gigiyena uyqu hordiq huzur zavq ilhom iste’dod qobiliyat ko‘nikma malaka tirishqoqlik jasorat jur’at g‘ayrat iroda matonat bardosh chidam g‘urur vijdon adolat halollik kamtarlik mehribonlik g‘amxo‘rlik hurmat izzat obro‘ shuhrat muvaffaqiyat ishtiyoq qiziqish tashabbus birlik ahillik totuvlik hamjihatlik xursandchilik iste’mol ehtiyoj tanlov samara dalda foyda zarаr xarajat daromad jamg‘arma budjet valuta qiymat to‘lov hisobvaraq chegirma buyurtma talab taklif mahsulot tovar xizmat sifat kafolat miqdor o‘lcham andaza namuna yangilik tadbir uchrashuv anjuman yig‘ilish festival ko‘rgazma tantana marosim nikoh to‘y navro‘z hayit taom atala shavla mastava norin chuchvara kabob palov qiyma qovurma salat murabbo sharbat qaynatma qand holva kulcha patir qatlama pishiriq qandolat shirinlik`
    .replaceAll("а", "a")
    .split(/\s+/);
export const latin = [
  ...new Set([
    ...nouns,
    ...other,
    ...additional,
    ...nouns.map((w) => w + "lar"),
    ...nouns.map((w) => w + "ni"),
  ]),
];
const alphabet = Object.fromEntries(
  [..."abdfghijklmnopqrstuvxyz"].map((x, i) => [
    x,
    [..."абдфгҳижклмнопқрстувхйз"][i],
  ]),
);
function cyrillic(w) {
  const exceptions = {
    sentabr: "сентябрь",
    oktabr: "октябрь",
    noyabr: "ноябрь",
    dekabr: "декабрь",
    yanvar: "январь",
    fevral: "февраль",
    iyun: "июнь",
    iyul: "июль",
    kompyuter: "компьютер",
    poyezd: "поезд",
    obyekt: "объект",
    budjet: "бюджет",
    trolleybus: "троллейбус",
    albom: "альбом",
    palto: "пальто",
    festival: "фестиваль",
    rejissyor: "режиссёр",
    valuta: "валюта",
    samolyot: "самолёт",
    aktyor: "актёр",
    intervyu: "интервью",
    aeroport: "аэропорт",
    aprel: "апрель",
    metro: "метро",
    teatr: "театр",
    ekran: "экран",
    ertak: "эртак",
    etak: "этак",
  };
  const stem = w.replace(/(lar|ni)$/, "");
  if (exceptions[w]) return exceptions[w];
  if (stem !== w && exceptions[stem])
    return exceptions[stem] + (w.endsWith("lar") ? "лар" : "ни");
  return w.replace(
    /yo‘|s[’‘']h|o‘|g‘|sh|ch|yo|yu|ya|ye|./g,
    (s, i) =>
      ({
        "yo‘": "йў",
        "s’h": "сҳ",
        "o‘": "ў",
        "g‘": "ғ",
        sh: "ш",
        ch: "ч",
        yo: "ё",
        yu: "ю",
        ya: "я",
        ye: "е",
        "’": "ъ",
        e: i === 0 ? "э" : "е",
        c: "ц",
      })[s] ??
      alphabet[s] ??
      s,
  );
}
export const dictionaries = {
  latin,
  easy: latin.filter((w) => !/[’‘']/.test(w)),
  cyrillic: [...new Set(latin.map(cyrillic))],
  code: "const let var function return async await try catch finally throw class extends import export default break continue switch case while for of in if else new this null true false undefined typeof Promise Array Object Map Set String Number def print range enumerate lambda yield with as from except raise None True False elif pass self list dict tuple int bool str len zip filter map sorted open global nonlocal".split(
    " ",
  ),
};
export const quotes = {
  short: [
    "Yetti o‘lchab, bir kes.",
    "Bugungi ishni ertaga qo‘yma.",
    "Avval o‘yla, keyin so‘yla.",
    "Birlik bor joyda tiriklik bor.",
  ],
  medium: [
    "Bilgan o‘qir, bilmagan to‘qir. Bilagi zo‘r birni yiqar, bilimi zo‘r mingni yiqar.",
    "Oltin olma, duo ol. Duo oltin emasmi?",
    "Do‘st achitib gapirar, dushman kuldirib.",
  ],
  long: [
    "Oz-oz o‘rganib dono bo‘lur, qatra-qatra yig‘ilib daryo bo‘lur. Bilmaganni so‘rab o‘rgangan olim, orlanib so‘ramagan o‘ziga zolim.",
    "Yaxshi so‘z bilan ilon inidan chiqar, yomon so‘z bilan pichoq qinidan chiqar. Avval o‘yla, keyin so‘yla. Yetti o‘lchab, bir kes.",
  ],
};
export const regions = [
  "Qoraqalpog‘iston Respublikasi",
  "Andijon",
  "Buxoro",
  "Jizzax",
  "Qashqadaryo",
  "Navoiy",
  "Namangan",
  "Samarqand",
  "Surxondaryo",
  "Sirdaryo",
  "Toshkent viloyati",
  "Farg‘ona",
  "Xorazm",
  "Toshkent shahri",
];
export const normalize = (s) => s.replace(/['`’‘ʻʼ]/g, "'");
export function generate(lang, count, marks = false, numbers = false) {
  const pool = dictionaries[lang];
  return Array.from({ length: count }, () => {
    let word = pool[Math.floor(Math.random() * pool.length)];
    if (numbers && Math.random() < 0.1)
      word = String(Math.floor(Math.random() * 1000));
    if (marks && Math.random() < 0.18)
      word += [".", ",", "?", "!"][Math.floor(Math.random() * 4)];
    return word;
  }).join(" ");
}
export const level = (n) =>
  n >= 200
    ? "Usta Harfchi"
    : n >= 75
      ? "Tezkor"
      : n >= 30
        ? "Kotib"
        : n >= 10
          ? "Izlanuvchi"
          : "Boshlovchi";
export const day = (t) =>
  new Date(new Date(t).getTime() + 5 * 3600000).toISOString().slice(0, 10);
export function streak(days, today = day(Date.now())) {
  const unique = [...new Set(days)].sort();
  let prev = "",
    run = 0,
    best = 0;
  for (const d of unique) {
    run = Date.parse(d) - Date.parse(prev) === 86400000 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return {
    current: Date.parse(today) - Date.parse(prev) <= 86400000 ? run : 0,
    best,
    last: prev || null,
  };
}
