/**
 * @author AxiFisk
 * @name SkinsManager
 * @description soon:tm:
 * @version 1.0.0
 */

import config from "./config";
import "./styles.css";

async function getChampionSkins() {
    const res = await fetch("/lol-champ-select/v1/skin-carousel-skins");
    const data = await res.json();

    return data.filter(s => s.unlocked == true);
}

async function initCmdBar(id, name, action) {
    CommandBar.addAction({
        id: id,
        name: name,
        group: "Skins Manager",
        hidden: false,
        perform: async () => await action()
    });
}

function highlightUnlockedQuickplay() {
    setInterval(() => {
        if (!config.get("highlightUnlocked")) return;
        if (!document.querySelector(".carousel-track-container")) return;

        const skinCarousel = document.querySelector(".carousel-track").children;
        const skinCarouselIndicators = document.querySelector(
            ".skin-selection-indicator-list"
        ).children;

        if (skinCarousel)
            for (let i = 0; i < skinCarousel.length; i++) {
                if (!skinCarousel[i].classList.contains("unowned"))
                    skinCarouselIndicators[i].classList.add("skin-pip-unlocked");
            }
    }, 300);
}

// function highlightUnlocked() { // todo: figure out how to make it work properly
//     setInterval(() => {
//         if (!document.querySelector(".skin-selection-carousel-container")) return;

//         const skinCarousel = document.querySelector(".skin-selection-carousel").children;
//         const skinCarouselIndicators = document.querySelector(".skin-selection-indicator-list").children;

//         if (skinCarousel) for (let i = 0; i < skinCarousel.length; i++) {
//             if (!skinCarousel[i].classList.contains("unowned")) skinCarouselIndicators[i].classList.add("skin-selection-indicator-selector-unlocked");
//         }
//     }, 300);
// }

async function randomize(skinsArray) {
    if (!config.get("enableRandomize")) return;

    const randomSkin = skinsArray[Math.floor(Math.random() * skinsArray.length)];
    const req = await fetch(`/lol-champ-select/v1/session/my-selection`, {
        method: "PATCH",
        body: JSON.stringify({ selectedSkinId: randomSkin.id }),
        headers: {
            "accept": "application/json",
            "content-type": "application/json"
        }
    });

    if (req.status == 204 || 200) {
        return Toast.success(`[SM] Selected skin: ${randomSkin.name}`);
    } else {
        return Toast.error(`[SM] Something went wrong`);
    }
}

async function manage(message) {
    let championId = 0;

    if (!message) {
        championId = config.get("championId");
    } else {
        championId = message.data;
        config.update("championId", championId);
    }

    if (championId != 0) {
        const skinsArray = await getChampionSkins();

        if (skinsArray.length < 2) return console.error("Only 1 skin");

        await randomize(skinsArray);
    }
}

export function init(context) {
    config.init();

    context.socket.observe(`/lol-champ-select/v1/current-champion`, async message => {
        await manage(message);
    });

    initCmdBar("sm-randomizer-toggle", "Enable skin randomizer", () =>
        config.update("enableRandomize", !config.get("enableRandomize"))
    );
    initCmdBar("sm-randomizer-reroll", "Reroll skin", manage);

    highlightUnlockedQuickplay();
}
