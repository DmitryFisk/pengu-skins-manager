const localeTable = {
    en_US: {
        checkboxLabel: "Enable skin randomizer",
    },

    ru_RU: {
        checkboxLabel: "Включить рандомайзер скинов",
    },
};

async function getClientLocale() {
    const res = await fetch("/riotclient/get_region_locale");
    const data = await res.json();

    return data.locale;
}

async function pickLocale(locale, element) {
    if (!element) return console.error("Specify an element to translate");
    if (!localeTable[locale]) locale = "en_US";

    return localeTable[locale][element];
}

export default {
    pickLocale: pickLocale,
    getClientLocale: getClientLocale,
};
