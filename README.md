## DEPRECATED THIS IS NOW BUILT INTO HOME ASSISTANT!!!

There will be no further updates to this card. If you have it installed make sure to remove it and the zha_map custom component when updating to HA 1.0.0

# zha-network-visualization-card

Lovelace custom element for visualizing the ZHA Zigbee network

Requires that you are already using the [ZHA](https://www.home-assistant.io/integrations/zha/) integration commponent in Home Assistant.

This card can help you identify weak points like bad links between your devices.

# Installation Instructions

1. Put the [zha-network-visualization-card.js](https://github.com/dmulcahey/zha-network-visualization-card) lovelace card into the `\[config\]/www/zha-network-visualization-card directory` ether by copying it there or by using the file editor to create it with a cut and paste of the content.
2. Add the lovelace resource with `Configuration ¦ Lovelace Dashboards ¦ Resources ¦ ⊕ ¦ /local/zha-network-visualization-card/zha-network-visualization-card.js` & `Resource Type JavaScript Module ¦ Click Update`.
3. Add custom card (works best in panel mode) through `Overview ¦ ⋮ ¦ Edit Dashboard ¦ Add Card + ¦ Choose Manual` A a card configuration window will open. This is where you will add type: `'custom:zha-network-visualization-card' ¦ Click Save` to exit UI configurator

The new map card should appear in the Main Overview window.

# Usage

The Zigbee coordinator will be represented by a rectangle at the top. Any device that serves as Zigbee router (usually all devices running on Mains electricity / grid power) will represented as ovals, and Zigbee end-device (usually battery powered sensors) will be represented by as circles.

The lines between those representions show all the possible paths through Zigbee mesh. Any path with a LQI over 192 is shown as green, LQI 129-192 is shown as yellow, and anything 128 and lower is shown as red.
