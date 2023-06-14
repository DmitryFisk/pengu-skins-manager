/*
 * @author AxiFisk
 * @name Skin randomizer
 * @description picks random skin for your champion
 * @version 1.3
 */

import localeSelector from "./localeSelector";
import "./button.css";

const delay = (t) => new Promise((r) => setTimeout(r, t));

async function getChampionSkins() {
    const res = await fetch("/lol-champ-select/v1/skin-carousel-skins");
    const data = await res.json();

    const skinsArray = manageSkinsArray(data);

    return skinsArray;
}

function manageSkinsArray(skinsArray) {
    skinsArray = skinsArray.filter((s) => s.unlocked == true);

    const availableSkinsArray = skinsArray.map((s) => s.id);
    return availableSkinsArray;
}

async function pickRandomSkin(message) {
    let data = 0;
    if (!message) {
        data = DataStore.get("champion_id");
    } else {
        data = JSON.parse(message.data);
        data = data[2].data;
        DataStore.set("champion_id", data);
    }

    if (data != 0) {
        const championSkinsArray = await getChampionSkins();

        if (championSkinsArray.length > 1) {
            const randomSkinId =
                championSkinsArray[
                    Math.floor(Math.random() * championSkinsArray.length)
                ];
            console.log(randomSkinId);
            const res = await fetch(
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
            console.log(res.status);
            return;
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
        if (!DataStore.get("sr_enable")) return;

        await pickRandomSkin(message);
    };
}

async function createToggleCheckbox() {
    const checkboxDiv = document.createElement("div");
    const checkbox = document.createElement("lol-uikit-flat-checkbox");
    const checkboxInput = document.createElement("input");
    const checkboxLabel = document.createElement("label");

    checkboxDiv.className = "lol-settings-general-row";

    checkbox.className = "sr-checkbox";
    checkbox.setAttribute("for", "enableSkinRandomizer");

    checkboxLabel.textContent = await localeSelector.pickLocale(
        DataStore.get("sr_locale"),
        "checkboxLabel"
    );
    checkboxLabel.setAttribute("slot", "label");

    checkboxInput.className = "ember-checkbox ember-view";
    checkboxInput.setAttribute("name", "enableSkinRandomizer");
    checkboxInput.setAttribute("slot", "input");
    checkboxInput.setAttribute("type", "checkbox");

    checkbox.append(checkboxInput, checkboxLabel);
    checkboxDiv.append(checkbox);

    if (DataStore.get("sr_enable"))
        checkboxInput.setAttribute("checked", "true");

    checkboxInput.onclick = (i) => {
        if (i.toElement.getAttribute("checked", "true")) {
            i.toElement.removeAttribute("checked");
            DataStore.set("sr_enable", false);
        } else {
            i.toElement.setAttribute("checked", "true");
            DataStore.set("sr_enable", true);
        }
    };

    setInterval(() => {
        const settingsEl = document.querySelector(".lol-settings-options");
        if (
            settingsEl &&
            !document.querySelector(".sr-checkbox") &&
            document.querySelector(".lol-settings-account-verification-row")
        ) {
            settingsEl.children[0].insertBefore(
                checkboxDiv,
                document.querySelectorAll(".lol-settings-general-row")[1]
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
        await pickRandomSkin();
    };

    setInterval(() => {
        const leftPanel = document.querySelector(".bottom-right-buttons");

        if (leftPanel && !document.querySelector(".lock-in.visible")) {
            if (!document.querySelector(".sr-reroll-div")) leftPanel.append(buttonDiv);
        } else {
            document.querySelector(".sr-reroll-div").remove();
        }
    }, 100);
}

window.addEventListener("load", async () => {
    const locale = await localeSelector.getClientLocale();
    if (locale != DataStore.get("sr_locale"))
        DataStore.set("sr_locale", locale);

    await delay(1000);

    if (DataStore.get("sr_enable") == undefined)
        DataStore.set("sr_enable", true);

    if (DataStore.get("champion_id")) DataStore.remove("champion_id");

    subscribeOnEvent();
    createToggleCheckbox();
    createRerollButton();
});
