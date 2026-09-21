// Every word a member reads, in both languages.
//
// The second language is Urdu written in Roman letters, not Urdu script. Most
// of the Jamaat's older members read Hinglish fluently off a phone screen and
// far fewer read nastaliq. The register follows the committee's own message:
// plain, respectful, unhurried. Never a fundraising campaign.

export type Lang = "en" | "ur";

export const LANGS = [
  { code: "en" as const, label: "English" },
  { code: "ur" as const, label: "Roman Urdu" },
];

export const DEFAULT_LANG: Lang = "en";

export function toLang(value: string | undefined): Lang {
  return value === "ur" ? "ur" : "en";
}

type Copy = {
  htmlLang: string;
  switchLabel: string;

  title: string;
  standfirst: string;

  daysLeft: (days: number) => string;
  lastDay: string;
  closed: (date: string) => string;

  progressHeading: string;
  progressEmpty: string;
  progressJoined: (members: number) => string;
  progressOf: (pledged: string, target: string) => string;
  progressCovered: string;
  progressBarLabel: (pledged: string, target: string) => string;

  obligationHeading: string;
  roleTotal: string;

  standingHeading: string;
  standingBody: (rate: string, low: string, high: string, target: string) => string;
  shortfallLabel: string;
  standingAfter: string;

  askHeading: string;
  askEquation: (members: number, amount: string, target: string) => string;
  askBody: string;
  notice: string;

  datesHeading: string;
  formCloses: string;
  effectiveFrom: string;
  whoFor: string;

  jumpToForm: string;

  formHeading: string;
  step1: string;
  step2: string;
  step3: string;

  fullName: string;
  country: string;
  mobile: string;
  mobileHint: string;
  email: string;
  optional: string;
  address: string;
  addressHint: string;
  city: string;

  amountLegend: string;
  amountCovers: (members: number) => string;
  amountOther: string;
  otherLabel: string;
  submit: string;
  refillHint: string;

  doneHeading: string;
  doneUpdatedHeading: string;
  doneAmount: (amount: string) => string;
  doneEffective: (date: string) => string;
  doneChange: string;

  problemFallback: string;
};

const en: Copy = {
  htmlLang: "en",
  switchLabel: "Read this in",

  title: "Monthly contribution towards the Jamaat’s salaries",
  standfirst: "Managing Committee",

  daysLeft: (days) => `${days} ${days === 1 ? "day" : "days"} left to fill this in`,
  lastDay: "Today is the last day to fill this in",
  closed: (date) => `This form closed on ${date}`,

  progressHeading: "Where we have reached",
  progressEmpty: "Nobody has filled this in yet. You can be the first.",
  progressJoined: (members) =>
    `${members} ${members === 1 ? "member has" : "members have"} joined so far`,
  progressOf: (pledged, target) => `${pledged} pledged of the ${target} needed every month`,
  progressCovered: "The salaries are covered. Anything further builds the reserve.",
  progressBarLabel: (pledged, target) => `${pledged} pledged against ${target} needed.`,

  obligationHeading: "What the Jamaat pays every month",
  roleTotal: "Total every month",

  standingHeading: "Where the fund stands today",
  standingBody: (rate, low, high, target) =>
    `At the present ${rate} per member, collection averages ${low} to ${high} a month. The salaries alone come to ${target}.`,
  shortfallLabel: "short every month, on salaries alone",
  standingAfter:
    "That is before welfare, maintenance, religious education, emergencies or any development work.",

  askHeading: "What we are asking",
  askEquation: (members, amount, target) => `${members} members × ${amount} = ${target}`,
  askBody:
    "If that many earning members give voluntarily each month, the salaries are covered in full. Anything above that builds a reserve for the work the salaries do not cover.",
  notice: "This is not a mandatory increase. Members give what they can afford.",

  datesHeading: "Dates",
  formCloses: "Form closes",
  effectiveFrom: "Contributions effective from",
  whoFor:
    "This is for all earning members of the Jamaat, wherever they live — India, the UAE, Oman, elsewhere in the Gulf, or anywhere else.",

  jumpToForm: "Fill in your details",

  formHeading: "Your details",
  step1: "Your name and number",
  step2: "Your address",
  step3: "What you can give",

  fullName: "Full name",
  country: "Country you live in",
  mobile: "Mobile number",
  mobileHint: "The country above sets the code. Type only your own number after it.",
  email: "Email address",
  optional: "optional",
  address: "Current residential address",
  addressHint: "House or flat, street, area, and postcode if you have one.",
  city: "City",

  amountLegend: "How much would you like to give each month?",
  amountCovers: (members) => `covers the salaries in full if ${members} members choose it`,
  amountOther: "Another amount",
  otherLabel: "You chose another amount. How much each month?",
  submit: "Send my details",
  refillHint: "Filled it already? Fill it again and the new amount replaces the old.",

  doneHeading: "Thank you. Your details are recorded.",
  doneUpdatedHeading: "Thank you. Your contribution has been updated.",
  doneAmount: (amount) => `${amount} every month`,
  doneEffective: (date) => `This starts from ${date}.`,
  doneChange: "Changed your mind? Fill the form again and the new amount replaces this one.",

  problemFallback: "Something went wrong. Please try again.",
};

const ur: Copy = {
  htmlLang: "en",
  switchLabel: "Ise padhein",

  title: "Jamaat ki tankhwahon ke liye mahana taawun",
  standfirst: "Managing Committee",

  daysLeft: (days) => `${days} din baaqi hain`,
  lastDay: "Aaj aakhri din hai",
  closed: (date) => `Yeh form ${date} ko band ho gaya`,

  progressHeading: "Ab tak kahan pahunche hain",
  progressEmpty: "Abhi tak kisi ne nahin bhara. Aap pehle ho sakte hain.",
  progressJoined: (members) => `${members} members shamil ho chuke hain`,
  progressOf: (pledged, target) =>
    `Har mahine ke ${target} mein se ${pledged} ka waada ho chuka hai`,
  progressCovered: "Tankhwahon ka intezam ho gaya hai. Is se aage jo aayega wo reserve banayega.",
  progressBarLabel: (pledged, target) => `${target} mein se ${pledged} ka waada.`,

  obligationHeading: "Jamaat har mahine kitna ada karti hai",
  roleTotal: "Har mahine kul",

  standingHeading: "Fund ki maujooda haalat",
  standingBody: (rate, low, high, target) =>
    `Abhi har member ${rate} deta hai, is se har mahine ${low} se ${high} tak jama hote hain. Sirf tankhwahon ka kharch ${target} hai.`,
  shortfallLabel: "har mahine kam pad raha hai, sirf tankhwahon mein",
  standingAfter:
    "Yeh to sirf tankhwah hai — welfare, marammat, deeni taleem, emergency aur development ka kharch is ke alawa hai.",

  askHeading: "Hamari guzarish",
  askEquation: (members, amount, target) => `${members} members × ${amount} = ${target}`,
  askBody:
    "Agar itne kamane wale members apni marzi se har mahine dein, to poori tankhwah ka intezam ho jata hai. Is se zyada jo aayega wo un kaamon ke liye reserve banega jo tankhwah mein nahin aate.",
  notice: "Yeh koi lazmi izafa nahin hai. Har member jitna kar sakta hai, utna de.",

  datesHeading: "Tareekhein",
  formCloses: "Form band hone ki tareekh",
  effectiveFrom: "Taawun shuru hone ki tareekh",
  whoFor:
    "Yeh Jamaat ke tamam kamane wale members ke liye hai — chahe wo Hindustan mein hon, UAE, Oman, Gulf ke kisi aur mulk mein, ya kahin aur.",

  jumpToForm: "Apni tafseelat bharein",

  formHeading: "Aap ki tafseelat",
  step1: "Naam aur number",
  step2: "Aap ka pata",
  step3: "Aap kitna de sakte hain",

  fullName: "Poora naam",
  country: "Aap kis mulk mein rehte hain",
  mobile: "Mobile number",
  mobileHint: "Upar wale mulk se code khud lag jayega. Aap sirf apna number likhein.",
  email: "Email",
  optional: "marzi se",
  address: "Maujooda ghar ka pata",
  addressHint: "Ghar ya flat, gali, ilaaqa, aur pin code agar ho to.",
  city: "Shehar",

  amountLegend: "Aap har mahine kitna dena chahenge?",
  amountCovers: (members) => `agar ${members} members yeh chunein to poori tankhwah ho jati hai`,
  amountOther: "Koi aur raqam",
  otherLabel: "Aap ne koi aur raqam chuni. Har mahine kitna?",
  submit: "Meri tafseelat bhejein",
  refillHint: "Pehle bhar chuke hain? Dobara bhar dein, nayi raqam purani ki jagah le legi.",

  doneHeading: "Shukriya. Aap ki tafseelat mehfooz ho gayi.",
  doneUpdatedHeading: "Shukriya. Aap ka taawun badal diya gaya hai.",
  doneAmount: (amount) => `Har mahine ${amount}`,
  doneEffective: (date) => `Yeh ${date} se shuru hoga.`,
  doneChange: "Raqam badalni hai? Form dobara bhar dein, nayi raqam purani ki jagah le legi.",

  problemFallback: "Kuch gadbad ho gayi. Meherbani kar ke dobara koshish karein.",
};

export const COPY: Record<Lang, Copy> = { en, ur };

export function copy(lang: Lang): Copy {
  return COPY[lang];
}

// ---------------------------------------------------------------------------
// Rejections. Every one is a plain sentence saying what to fix — no codes.

export type ErrorCopy = {
  nameRequired: string;
  nameShort: (min: number) => string;
  nameLong: (max: number) => string;
  countryRequired: string;
  phoneRequired: string;
  phoneNoDigits: string;
  phoneIndiaLength: (want: number, got: number) => string;
  phoneIndiaStart: string;
  phoneLength: (min: number, max: number, got: number) => string;
  emailLong: string;
  emailInvalid: string;
  addressRequired: string;
  addressLong: (max: number) => string;
  cityRequired: string;
  cityLong: (max: number) => string;
  amountRequired: string;
  amountNotListed: string;
  otherRequired: string;
  otherDigitsOnly: string;
  otherTooSmall: (min: string) => string;
  otherTooLarge: (max: string) => string;
  saveFailed: string;
};

const errorsEn: ErrorCopy = {
  nameRequired: "Please enter your full name.",
  nameShort: (min) => `Your name looks too short. Please enter at least ${min} letters.`,
  nameLong: (max) => `That name is longer than ${max} letters. Please shorten it.`,
  countryRequired: "Please choose the country you live in.",
  phoneRequired: "Please enter your mobile number.",
  phoneNoDigits: "That mobile number has no digits in it. Please enter the number.",
  phoneIndiaLength: (want, got) =>
    `An Indian mobile number is ${want} digits. You entered ${got}. Please check the number and try again.`,
  phoneIndiaStart:
    "An Indian mobile number starts with 6, 7, 8 or 9. Please check the number and try again.",
  phoneLength: (min, max, got) =>
    `A mobile number should be between ${min} and ${max} digits. You entered ${got}. Please check the number and try again.`,
  emailLong: "That email address is too long. Please check it, or leave it blank.",
  emailInvalid: "That email address does not look right. Please check it, or leave it blank.",
  addressRequired: "Please enter your current residential address.",
  addressLong: (max) => `That address is longer than ${max} letters. Please shorten it.`,
  cityRequired: "Please enter the city you live in.",
  cityLong: (max) => `That city name is longer than ${max} letters. Please shorten it.`,
  amountRequired: "Please choose how much you would like to contribute each month.",
  amountNotListed: "Please choose one of the amounts listed, or choose another amount.",
  otherRequired: "You chose another amount. Please type how much you would like to give each month.",
  otherDigitsOnly: "Please type the amount in whole rupees, using digits only.",
  otherTooSmall: (min) => `The smallest amount the form can record is ${min}.`,
  otherTooLarge: (max) => `The largest amount the form can record is ${max}.`,
  saveFailed: "We could not save your form just now. Please try again in a moment.",
};

const errorsUr: ErrorCopy = {
  nameRequired: "Meherbani kar ke apna poora naam likhein.",
  nameShort: (min) => `Naam bahut chhota lag raha hai. Kam se kam ${min} harf likhein.`,
  nameLong: (max) => `Yeh naam ${max} harf se lamba hai. Meherbani kar ke chhota karein.`,
  countryRequired: "Meherbani kar ke apna mulk chunein.",
  phoneRequired: "Meherbani kar ke apna mobile number likhein.",
  phoneNoDigits: "Is mobile number mein koi ank nahin hai. Meherbani kar ke number likhein.",
  phoneIndiaLength: (want, got) =>
    `Hindustani mobile number ${want} ank ka hota hai. Aap ne ${got} likhe. Number dobara dekh lein.`,
  phoneIndiaStart:
    "Hindustani mobile number 6, 7, 8 ya 9 se shuru hota hai. Number dobara dekh lein.",
  phoneLength: (min, max, got) =>
    `Mobile number ${min} se ${max} ank ke darmiyan hona chahiye. Aap ne ${got} likhe. Number dobara dekh lein.`,
  emailLong: "Yeh email bahut lamba hai. Dobara dekh lein, ya khaali chhod dein.",
  emailInvalid: "Yeh email theek nahin lag raha. Dobara dekh lein, ya khaali chhod dein.",
  addressRequired: "Meherbani kar ke apne ghar ka maujooda pata likhein.",
  addressLong: (max) => `Yeh pata ${max} harf se lamba hai. Meherbani kar ke chhota karein.`,
  cityRequired: "Meherbani kar ke apna shehar likhein.",
  cityLong: (max) => `Shehar ka naam ${max} harf se lamba hai. Meherbani kar ke chhota karein.`,
  amountRequired: "Meherbani kar ke chunein ke aap har mahine kitna dena chahenge.",
  amountNotListed: "Meherbani kar ke di gayi raqamon mein se ek chunein, ya koi aur raqam chunein.",
  otherRequired: "Aap ne koi aur raqam chuni. Meherbani kar ke likhein ke har mahine kitna denge.",
  otherDigitsOnly: "Meherbani kar ke raqam sirf anko mein, poore rupay mein likhein.",
  otherTooSmall: (min) => `Sab se kam raqam jo yeh form le sakta hai wo ${min} hai.`,
  otherTooLarge: (max) => `Sab se zyada raqam jo yeh form le sakta hai wo ${max} hai.`,
  saveFailed: "Abhi aap ka form mehfooz nahin ho saka. Thodi der baad dobara koshish karein.",
};

export const ERRORS: Record<Lang, ErrorCopy> = { en: errorsEn, ur: errorsUr };

export function errors(lang: Lang): ErrorCopy {
  return ERRORS[lang];
}
