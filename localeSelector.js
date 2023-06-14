const localeTable = {
    en_US: {
        checkboxLabel: "Enable skin randomizer",
    },

    ru_RU: {
        checkboxLabel: "Включить рандомайзер скинов",
    },
};

function pickLocale(locale, element) {
    if (!element) return console.error("Specify an element to translate");
    if (!localeTable[locale]) locale = "en_US";

    return localeTable[locale][element];
}

export default {
    pickLocale: pickLocale,
};
