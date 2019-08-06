import "https://unpkg.com/vis-network@5.2.0/dist/vis-network.min.js?module";

function loadCSS(url) {
  const link = document.createElement("link");
  link.type = "text/css";
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
}

loadCSS("https://unpkg.com/vis-network@5.2.0/dist/vis-network.min.css");

class ZHANetworkVisualizationCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({
      mode: "open"
    });
    this.card_height = 50;
    this.networkOptions = {
      autoResize: true,
      height: "1000px",
      layout: {
        improvedLayout: true
      },
      physics: {
        barnesHut: {
          springConstant: 0,
          avoidOverlap: 10,
          damping: 0.09
        }
      },
      nodes: {
        font: {
          multi: "html"
        }
      }
    };
  }

  setConfig(config) {
    // get & keep card-config and hass-interface
    const root = this.shadowRoot;
    if (root.lastChild) root.removeChild(root.lastChild);

    const cfg = Object.assign({}, config);

    // assemble html
    const card = document.createElement("ha-card");
    card.header = cfg.title;
    const content = document.createElement("div");

    card.appendChild(content);
    // append card to _root_ node...
    root.appendChild(card);
    this._config = cfg;
    this.network = new vis.Network(content, {}, this.networkOptions);
  }

  _updateContent(devices) {
    var data = {
      nodes: [],
      edges: []
    };

    devices.map(device => {
      data.nodes.push({
        id: device["ieee"],
        label: this._buildLabel(device),
        shape: this._getShape(device)
      });
      if (device.neighbours && device.neighbours.length > 0) {
        device.neighbours.map(neighbour => {
          data.edges.push({
            from: device["ieee"],
            to: neighbour["ieee"],
            label: neighbour["lqi"] + ""
          });
        });
      }
    });

    this.network.setData(data);
  }

  _getShape(device) {
    if (device.device_type === "Coordinator") {
      return "box";
    } else if (device.device_type === "Router") {
      return "ellipse";
    } else {
      return "circle";
    }
  }

  _buildLabel(device) {
    return (
      "<b>Manufacturer:</b> " +
      device.manufacturer +
      "\n <b>Model:</b> " +
      device.model +
      "\n <b>IEEE:</b> " +
      device.ieee +
      " \n <b>NWK:</b> " +
      device.nwk +
      "\n <b>Device Type:</b>" +
      device.device_type.replace("_", " ")
    );
  }

  set hass(hass) {
    const config = this._config;
    const root = this.shadowRoot;

    hass
      .callWS({
        type: "zha_map/devices"
      })
      .then(devices => {
        this._updateContent(devices);
      });
  }

  _setCardSize(num_rows) {
    this.card_height = parseInt(num_rows * 0.5);
  }

  getCardSize() {
    return 40;
  }
}

customElements.define(
  "zha-network-visualization-card",
  ZHANetworkVisualizationCard
);
