class ToggleCardVanillaJs extends HTMLElement {

    // status
    status = {};


    // lifecycle
    constructor() {
        console.log("constructor")
        super();
    }

    setConfig(config) {
        console.log("setConfig")
        this.status.config = config;
        this.doCheck();
        this.doStyle();
        this.doSetup();
        this.doListen();
    }

    set hass(hass) {
        console.log("hass")
        this.status.hass = hass;
        this.doUpdate()
    }

    onToggle() {
        console.log("onToggle");
        this.doToggle();
    }

    // accessors
    getHeader() {
        return this.status.config.header;
    }

    getEntityID() {
        return this.status.config.entity;
    }

    getState() {
        return this.status.hass.states[this.getEntityID()];
    }

    getAttributes() {
        return this.getState().attributes
    }

    getName() {
        const friendlyName = this.getAttributes().friendly_name;
        return friendlyName ? friendlyName : this.getEntityID();
    }

    isOff() {
        return this.getState().state == 'off';
    }

    isOn() {
        return this.getState().state == 'on';
    }

    // jobs
    doCheck() {
        if (!this.status.config.entity) {
            throw new Error('Please define an entity!');
        }
    }

    doStyle() {
        const style = this.appendChild(document.createElement("style"));
        style.textContent = `
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

    doSetup() {
        const html = `
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
        const card = this.appendChild(document.createElement("ha-card"));
        if (this.getHeader()) {
            card.setAttribute("header", this.getHeader());
        }
        card.innerHTML = html;
        this.status.error = card.querySelector(".tcvj-error")
        this.status.dl = card.querySelector(".tcvj-dl")
        this.status.topic = card.querySelector(".tcvj-dt")
        this.status.toggle = card.querySelector(".tcvj-toggle")
        this.status.value = card.querySelector(".tcvj-value")
    }

    doListen() {
        this.status.dl.addEventListener("click", this.onToggle.bind(this), false);
    }

    doUpdate() {
        if (!this.getState()) {
            this.status.error.textContent = `${this.getEntityID()} is unavailable.`;
            this.status.error.classList.remove("tcvj-error--hidden");
            this.status.dl.classList.add("tcvj-dl--hidden");
        } else {
            this.status.error.textContent = "";
            this.status.topic.textContent = this.getName();
            if (this.isOff()) {
                this.status.toggle.classList.remove("tcvj-toggle--on");
                this.status.toggle.classList.add("tcvj-toggle--off");
            } else if (this.isOn()) {
                this.status.toggle.classList.remove("tcvj-toggle--off");
                this.status.toggle.classList.add("tcvj-toggle--on");
            }
            this.status.value.textContent = this.getState().state;
            this.status.error.classList.add("tcvj-error--hidden");
            this.status.dl.classList.remove("tcvj-dl--hidden");
        }
    }

    doToggle() {
        this.status.hass.callService('input_boolean', 'toggle', {
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
