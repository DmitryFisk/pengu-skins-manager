const localeTable = {
    en_US: {
        checkboxLabel_isEnabled: "Enable skin randomizer",
        checkboxLabel_randomizeOnPick: "Randomize on champion pick"
    },

    ru_RU: {
        checkboxLabel_isEnabled: "Включить рандомайзер скинов",
        checkboxLabel_randomizeOnPick: "Выбрать случайный скин после выбора чемпиона"
    },
};

async function getClientLocale() {
    const res = await fetch("/riotclient/get_region_locale");
    const data = await res.json();

    return data.locale;
}

function pickLocale(locale, element) {
    if (!element) return console.error("Specify an element to translate");
    if (!localeTable[locale]) locale = "en_US";

    return localeTable[locale][element];
}

export default {
    pickLocale: pickLocale,
    getClientLocale: getClientLocale,
};
