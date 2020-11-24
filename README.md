# zha-network-visualization-card
Lovelace custom element for visualizing the ZHA Zigbee network

[zha-map](https://github.com/zha-ng/zha-map) integration commponent for [Home Assistant](https://www.home-assistant.io) allow you to make a ZHA (Zigbee Home Automation) network topology map and zha-network-visualization-card allows you to visualize that map in Lovelace.

Requires that you are already using the [ZHA](https://www.home-assistant.io/integrations/zha/) integration commponent in Home Assistant.

Zigbee network mapping with zha-map can help you identify weak points like bad links between your devices.

# Installation Instructions

1. Install the zha_map custom component
- https://github.com/zha-ng/zha-map
2. Add zha_map: to your configuration.yaml and restart Home Assistant
3. Wait for a scan to complete (logs to DEBUG, or use the new zha_map service to scan on demand)
4. Put the [zha-network-visualization-card.js](https://github.com/dmulcahey/zha-network-visualization-card) lovelace card into the `\[config\]/www/zha-network-visualization-card directory` ether by copying it there or by using the file editor to create it with a cut and paste of the content.
5. Add the lovelace resource with `Configuration ¦ Lovelace Dashboards ¦ Resources ¦ ⊕ ¦ /local/zha-network-visualization-card/zha-network-visualization-card.js` & `Resource Type JavaScript Module ¦ Click Update`.
6. Add custom card (works best in panel mode) through `Overview ¦ ⋮ ¦ Edit Dashboard ¦ Add Card + ¦ Choose Manual` A a card configuration window will open. This is where you will add type: `'custom:zha-network-visualization-card' ¦ Click Save` to exit UI configurator
7. Optional: Restart Home Assistant. Once its back go to Developer Tools then open the Services tab and choose the `zha_map.scan_now` service and click call service button. Check logs for details.

The new map card should appear in the Main Overview window.

# Usage
The Zigbee coordinator will be represented by a rectangle at the top. Any device that serves as Zigbee router (usually all devices running on Mains electricity / grid power) will represented as ovals, and Zigbee end-device (usually battery powered sensors) will be represented by as circles.

The lines between those representions show all the possible paths through Zigbee mesh. Any path with a LQI over 192 is shown as green, LQI 129-192 is shown as yellow, and anything 128 and lower is shown as red.
