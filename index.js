/*
 * @author AxiFisk
 * @name Skin randomizer
 * @description picks random skin for your champion
 * @version 1.5
 */

import localeSelector from "./localeSelector";
import config from "./config";
import "./button.css";

const delay = (t) => new Promise((r) => setTimeout(r, t));

async function getChampionSkins() {
    const res = await fetch("/lol-champ-select/v1/skin-carousel-skins");
    const data = await res.json();

    const skinsArray = manageSkinsArray(data);

    return skinsArray;
}

function manageSkinsArray(skinsArray) {
    const availableSkinsArray = skinsArray
        .filter((s) => s.unlocked == true)
        .map((s) => s.id);
    return availableSkinsArray;
}

async function pickRandomSkin(message, isReroll = false) {
    let data = 0;
    if (!message) {
        data = config.get("championId");
    } else {
        data = JSON.parse(message.data);
        data = data[2].data;
        config.update("championId", data);
    }

    if (data != 0) {
        const championSkinsArray = await getChampionSkins();
        
        if (championSkinsArray.length > 2) {
            config.update("showRerollButton", true);
            createRerollButton();
            
            const randomSkinId =
                championSkinsArray[
                    Math.floor(Math.random() * championSkinsArray.length)
                ];
            
            if (isReroll || config.get("randomizeOnPick")) await fetch(
                `/lol-champ-select/v1/session/my-selection`,
                {
                    method: "PATCH",
                    body: JSON.stringify({ selectedSkinId: randomSkinId }),
                    headers: {
                        accept: "application/json",
                        "content-type": "application/json",
                    },
                }
            );


            return;
        } else {
            config.update("showRerollButton", false);
        }
    }
}

function subscribeOnEvent() {
    const uri = document.querySelector(
        `link[rel="riot:plugins:websocket"]`
    ).href;
    const socket = new WebSocket(uri, "wamp");
    const targetAPI = "/lol-champ-select/v1/current-champion";
    const targetEvent = targetAPI.replace(/\//g, "_");

    socket.onopen = () =>
        socket.send(JSON.stringify([5, "OnJsonApiEvent" + targetEvent]));
    socket.onmessage = async (message) => {
        if (config.get("enabled") && message.data.startsWith("[8")) {
            return await pickRandomSkin(message);
        }
    };
}

async function createCheckbox(checkboxClassName, checkboxLocaleName, checkboxAttribute, checkboxConfigKey, appendBeforePosition) {
    const checkboxDiv = document.createElement("div");
    const checkbox = document.createElement("lol-uikit-flat-checkbox");
    const checkboxInput = document.createElement("input");
    const checkboxLabel = document.createElement("label");

    checkboxDiv.className = "lol-settings-general-row";
    
    checkbox.className = `${checkboxClassName}`;
    checkbox.setAttribute("for", checkboxAttribute);

    checkboxLabel.textContent = localeSelector.pickLocale(
        config.get("locale"),
        checkboxLocaleName
    );
    checkboxLabel.setAttribute("slot", "label");

    checkboxInput.className = "ember-checkbox ember-view";
    checkboxInput.setAttribute("name", checkboxAttribute);
    checkboxInput.setAttribute("slot", "input");
    checkboxInput.setAttribute("type", "checkbox");

    checkbox.append(checkboxInput, checkboxLabel);
    checkboxDiv.append(checkbox);

    if (config.get(checkboxConfigKey)) checkboxInput.setAttribute("checked", "true");

    checkboxInput.onclick = async () =>
        config.update(checkboxConfigKey, !config.get(checkboxConfigKey));

    setInterval(() => {
        const settingsEl = document.querySelector(".lol-settings-options");
        if (
            settingsEl &&
            !document.querySelector(`.${checkboxClassName}`) &&
            document.querySelector(".lol-settings-account-verification-row")
        ) {
            settingsEl.children[0].insertBefore(
                checkboxDiv,
                document.querySelectorAll(".lol-settings-general-row")[appendBeforePosition] //todo: replace it by autodetecting after which one it should append another one 
            );
        }
    }, 300);
}

async function createRerollButton() {
    const buttonDiv = document.createElement("div");
    const button = document.createElement("div");

    buttonDiv.classList = "sr-reroll-div mission-button-component ember-view";
    button.classList = "sr-reroll mission-button use-animation";

    buttonDiv.append(button);
    button.onclick = async () => {
        await pickRandomSkin(null, true);
    };

    const leftPanel = document.querySelector(".bottom-right-buttons");
    const skinSelector = document.querySelector(".skin-select");

    if (
        leftPanel &&
        skinSelector.parentElement.className == "visible" &&
        config.get("enabled")
    ) {
        if (!document.querySelector(".sr-reroll-div"))
            leftPanel.insertBefore(
                buttonDiv,
                document.querySelector("lol-social-chat-toggle-button")
            );
    } else {
        if (
            document.querySelector(".sr-reroll-div") &&
            !config.get("enabled") &&
            !config.get("showRerollButton")
        )
            document.querySelector(".sr-reroll-div").remove();
    }
}

window.addEventListener("load", async () => {
    await delay(3000);

    config.init();
    subscribeOnEvent();
    createCheckbox("sr-enable", "checkboxLabel_isEnabled", "checkbox_enableSkinRandomizer", "enabled", 1);
    createCheckbox("sr-randomizeOnPick", "checkboxLabel_randomizeOnPick", "checkbox_randomizeOnPick", "randomizeOnPick", 2);
});
