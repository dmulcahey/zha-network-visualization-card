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
    this.bufferTime = 1000 * 60 * 5; //5 minutes
    this.attachShadow({
      mode: "open"
    });
    this.networkOptions = {
      autoResize: true,
      height: "1000px",
      layout: {
        improvedLayout: false, 
	hierarchical: {
	  enabled:true,
	  nodeSpacing: 500
	} 
      },
      physics: {
        forceAtlas2Based: {
          springConstant: 0,
          avoidOverlap: 1,
          damping: 0.09
        },
    hierarchicalRepulsion: {
      centralGravity: 0.0,
      springLength: 100,
      springConstant: 0.01,
      nodeDistance: 400,
      damping: 0.09,
      avoidOverlap: 1 
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

    this._config = Object.assign({}, config);

    // assemble html
    const card = document.createElement("ha-card");
    const content = document.createElement("div");
    this.timelabel = document.createElement('label');
    this.filterinput = document.createElement('input');

    card.appendChild(this.timelabel);
    card.appendChild(this.filterinput);
    card.appendChild(content);
    root.appendChild(card);

    this.nodes = []
    this.network = new vis.Network(content, {}, this.networkOptions);

    this.network.on("click", function(properties) {
      const ieee = properties.nodes[0];
      if (ieee) {
        let ev = new Event("zha-show-device-dialog", {
          bubbles: true,
          cancelable: false,
          composed: true
        });
        ev.detail = { ieee: ieee };
        root.dispatchEvent(ev);
      }
    });

    self = this;
    this.filterinput.oninput = function() {
      let filterednodes = self.nodes.filter(
        x => x.label.toLowerCase().includes(self.filterinput.value.toLowerCase()));
      self.network.selectNodes(filterednodes.map(x => x.id));
    };
  }

  _updateContent(data) {
    this._updateDevices(data.devices);
    this._updateTimestamp(data.time);
  }

  _updateTimestamp(timestamp) {
    var date = new Date(timestamp * 1000);
    var iso = date.toISOString().match(/(\d{4}\-\d{2}\-\d{2})T(\d{2}:\d{2}:\d{2})/)
    this.timelabel.innerHTML = iso[1] + ' ' + iso[2];
  }

  _updateDevices(devices) {
    this.nodes = [];
    var edges = [];

    devices.map(device => {
      this.nodes.push({
        id: device["ieee"],
        label: this._buildLabel(device),
        shape: this._getShape(device),
        mass: this._getMass(device)
      });
      if (device.neighbours && device.neighbours.length > 0) {
        device.neighbours.map(neighbour => {
          var idx = edges.findIndex(function(e) {
            return device.ieee === e.to && neighbour.ieee === e.from;
          });
          if (idx === -1) {
            edges.push({
              from: device["ieee"],
              to: neighbour["ieee"],
              label: neighbour["lqi"] + "",
              color: this._getLQI(neighbour["lqi"])
            });
          } else {
            edges[idx].color = this._getLQI(
              (parseInt(edges[idx].label) + neighbour.lqi) / 2
            );
            edges[idx].label += "/" + neighbour["lqi"];
          }
        });
      }
    });

    this.network.setData({ nodes: this.nodes, edges: edges });
  }

  _getLQI(lqi) {
    if (lqi > 192) {
      return { color: "green", highlight: "green" };
    } else if (lqi > 128) {
      return { color: "yellow", highlight: "yellow" };
    }
    return { color: "red", highlight: "red" };
  }

  _getMass(device) {
    if (device.device_type === "Coordinator") {
      return 2;
    } else if (device.device_type === "Router") {
      return 4;
    } else {
      return 5;
    }
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
    var regDevices = this.deviceRegistry.filter(regDev => {
      return regDev.ieee === device.ieee
    });

    var res = regDevices.length > 0 ?
      "<b>" + regDevices[0].user_given_name + "</b>" + "\n" : "";
    res += "<b>IEEE: </b>" + device.ieee;
    res += "\n<b>Device Type: </b>" + device.device_type.replace("_", " ");
    if (device.nwk != null) {
      res += "\n<b>NWK: </b>" + device.nwk;
    }
    if (device.manufacturer != null && device.model != null) {
      res += "\n<b>Device: </b>" + device.manufacturer + " " + device.model;
    } else {
      res += "\n<b>Device is not in <i>'zigbee.db'</i></b>";
    }
    if (device.offline) {
      res += "\n<b>Device is <i>Offline</i></b>";
    }
    return res;
  }

  set hass(hass) {
    if (
      this.lastUpdated &&
      new Date(this.lastUpdated + this.bufferTime) > Date.now()
    ) {
      return;
    }
    hass
      .callWS({
        type: "zha/devices"
      })
      .then(devices => {
        this.deviceRegistry = devices;

        hass
          .callWS({
            type: "zha_map/devices"
          })
          .then(zhaMapData => {
            this._updateContent(zhaMapData);
          });
      });

    this.lastUpdated = Date.now();
  }

  getCardSize() {
    return 10;
  }
}

customElements.define(
  "zha-network-visualization-card",
  ZHANetworkVisualizationCard
);
