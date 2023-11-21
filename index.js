/**
 * @author AxiFisk
 * @name SkinManager
 * @description soon:tm:
 * @version 1.0.0
 */

import config from "./config";

async function getChampionSkins() {
    const res = await fetch("/lol-champ-select/v1/skin-carousel-skins");
    const data = await res.json();

    return data.filter(s => s.unlocked == true).map(s => s.id);
}

async function removeLockedSkins() {}

async function manage(message, reroll = false) {
    if (!config.get("enableRandomize") || !reroll) return;
    let data = 0;

    if (!message) {
        data = config.get("championId");
    } else {
        data = message.data;
        config.update("championId", data);
    }

    if (data != 0) {
        const skinsArray = getChampionSkins();

        if (skinsArray.length < 2) return;

        const randomSkinId = skinsArray[Math.floor(Math.random() * skinsArray.length)];

        await fetch(`/lol-champ-select/v1/session/my-selection`, {
            method: "PATCH",
            body: JSON.stringify({ selectedSkinId: randomSkinId }),
            headers: {
                accept: "application/json",
                "content-type": "application/json"
            }
        });
    }
}

export function init(context) {
    config.init();
    
    context.socket.observe(`/lol-champ-select/v1/current-champion`, (message) => {
        console.log(message)
        manage(message);
    });
}
