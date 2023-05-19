class ToggleCardVanillaJs extends HTMLElement {

    // private properties

    _config;
    _hass;
    _elements = {};
    _isAttached = false;

    // lifecycle
    constructor() {
        super();
        console.log("ToggleCardVanillaJs.constructor()")
        this.doStyle();
        this.doCard();
    }

    setConfig(config) {
        console.log("ToggleCardVanillaJs.setConfig()")
        this._config = config;
        if (!this._isAttached) {
            this.doAttach();
            this.doQueryElements();
            this.doListen();
            this._isAttached = true;
        }
        this.doCheckConfig();
        this.doUpdateConfig();
    }

    set hass(hass) {
        console.log("ToggleCardVanillaJs.hass()")
        this._hass = hass;
        this.doUpdateHass()
    }

    connectedCallback() {
        console.log("ToggleCardVanillaJs.connectedCallback()")
    }

    onClicked() {
        console.log("ToggleCardVanillaJs.onClicked()");
        this.doToggle();
    }

    // accessors
    isOff() {
        return this.getState().state == 'off';
    }

    isOn() {
        return this.getState().state == 'on';
    }

    getHeader() {
        return this._config.header;
    }

    getEntityID() {
        return this._config.entity;
    }

    getState() {
        return this._hass.states[this.getEntityID()];
    }

    getAttributes() {
        return this.getState().attributes
    }

    getName() {
        const friendlyName = this.getAttributes().friendly_name;
        return friendlyName ? friendlyName : this.getEntityID();
    }


    // jobs
    doCheckConfig() {
        if (!this._config.entity) {
            throw new Error('Please define an entity!');
        }
    }

    doStyle() {
        this._elements.style = document.createElement("style");
        this._elements.style.textContent = `
            .tcvj-error {
                text-color: red;
            }
            .tcvj-error--hidden {
                display: none;
            }
            .tcvj-dl {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
            .tcvj-dl--hidden {
                display: none;
            }
            .tcvj-dt {
                display: flex;
                align-content: center;
                flex-wrap: wrap;
            }
            .tcvj-dd {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, auto) minmax(0, 2fr));
                margin: 0;
            }
            .tcvj-toggle {
                padding: 0.6em;
                border: grey;
                border-radius: 50%;
            }
            .tcvj-toggle--on {
                background-color: green;
            }
            .tcvj-toggle--off{
                background-color: red;
            }
            .tcvj-button {
                display: block;
                border: outset 0.2em;
                border-radius: 50%;
                background-color: silver;
                width: 1.4em;
                height: 1.4em;
            }
            .tcvj-toggle--on .tcvj-button {
            }
            .tcvj-toggle--off .tcvj-button {
            }
            .tcvj-value {
                padding-left: 0.5em;
                display: flex;
                align-content: center;
                flex-wrap: wrap;
            }
        `
    }

    doCard() {
        this._elements.card = document.createElement("ha-card");
        this._elements.card.innerHTML = `
                <div class="card-content">
                    <p class="tcvj-error tcvj-error--hidden">
                    <dl class="tcvj-dl">
                        <dt class="tcvj-dt"></dt>
                        <dd class="tcvj-dd">
                            <span class="tcvj-toggle">
                                <span class="tcvj-button"></span>
                            </span>
                            <span class="tcvj-value">
                            </span>
                        </dd>
                    </dl>
                </div>
        `;
    }

    doAttach() {
        this.appendChild(this._elements.style);
        this.appendChild(this._elements.card);
    }

    doQueryElements() {
        const card = this._elements.card;
        this._elements.error = card.querySelector(".tcvj-error")
        this._elements.dl = card.querySelector(".tcvj-dl")
        this._elements.topic = card.querySelector(".tcvj-dt")
        this._elements.toggle = card.querySelector(".tcvj-toggle")
        this._elements.value = card.querySelector(".tcvj-value")
    }

    doListen() {
        this._elements.dl.addEventListener("click", this.onClicked.bind(this), false);
    }

    doUpdateConfig() {
        if (this.getHeader()) {
            this._elements.card.setAttribute("header", this.getHeader());
        } else {
            this._elements.card.removeAttribute("header");
        }
    }

    doUpdateHass() {
        if (!this.getState()) {
            this._elements.error.textContent = `${this.getEntityID()} is unavailable.`;
            this._elements.error.classList.remove("tcvj-error--hidden");
            this._elements.dl.classList.add("tcvj-dl--hidden");
        } else {
            this._elements.error.textContent = "";
            this._elements.topic.textContent = this.getName();
            if (this.isOff()) {
                this._elements.toggle.classList.remove("tcvj-toggle--on");
                this._elements.toggle.classList.add("tcvj-toggle--off");
            } else if (this.isOn()) {
                this._elements.toggle.classList.remove("tcvj-toggle--off");
                this._elements.toggle.classList.add("tcvj-toggle--on");
            }
            this._elements.value.textContent = this.getState().state;
            this._elements.error.classList.add("tcvj-error--hidden");
            this._elements.dl.classList.remove("tcvj-dl--hidden");
        }
    }

    doToggle() {
        this._hass.callService('input_boolean', 'toggle', {
            entity_id: this.getEntityID()
        });
    }

    // configuration defaults
    static getStubConfig() {
        return { entity: "input_boolean.tcvj" }
    }

}

customElements.define('toggle-card-vanilla-js', ToggleCardVanillaJs);

window.customCards = window.customCards || [];
window.customCards.push({
    type: "toggle-card-vanilla-js",
    name: "Vanilla Js Toggle",
    description: "Turn an entity on and off"
});
