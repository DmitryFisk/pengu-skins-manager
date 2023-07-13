import localeSelector from "./localeSelector";

function update(k, v) {
    if (DataStore.has("sr_preferences")) {
        let prefs = DataStore.get("sr_preferences");
        prefs[k] = v;

        DataStore.set("sr_preferences", prefs)
    }
}

function get(k) {
    if (DataStore.has("sr_preferences"))
        return DataStore.get("sr_preferences")[k];
}

async function init() {
    if (!DataStore.has("sr_preferences")) {
        DataStore.remove("sr_enable");
        DataStore.remove("sr_locale");
        DataStore.remove("champion_id");

        const clientLocale = await localeSelector.getClientLocale();

        DataStore.set("sr_preferences", {
            enabled: true,
            locale: clientLocale,
            championId: 0,
            showRerollButton: false,
            randomizeOnPick: true
        });
    }
}

export default {
    update: update,
    get: get,
    init: init,
};
