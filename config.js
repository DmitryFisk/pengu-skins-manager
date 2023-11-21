function update(k, v) {
    let prefs = DataStore.get("sr_preferences");
    prefs[k] = v;

    DataStore.set("sr_preferences", prefs);
}

function get(k) {
    DataStore.get("sr_preferences")[k];
}

async function init() {
    if (!DataStore.has("sr_preferences"))
        DataStore.set("sr_preferences", {
            championId: 0,
            enableRandomize: true,
            removeLockedSkins: false
        });
}

export default {
    update: update,
    get: get,
    init: init
};
