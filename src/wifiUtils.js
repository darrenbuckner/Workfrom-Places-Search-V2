// wifiUtils.js
export const getWifiStatus = (place, isDark = false) => {
  if (place.no_wifi === "1") {
    return { 
      icon: 'WifiOff',
      label: "No WiFi",
      value: "Not Available",
      color: isDark ? "text-red-400" : "text-red-500",
      iconColor: isDark ? "text-red-400" : "text-red-500"
    };
  }

  if (place.download) {
    const speed = Math.round(place.download);
    if (speed >= 50) {
      return {
        icon: 'Wifi',
        label: "Fast WiFi",
        value: "Excellent",
        color: isDark ? "text-green-400" : "text-green-500",
        iconColor: isDark ? "text-green-400" : "text-green-500"
      };
    }
    if (speed >= 25) {
      return {
        icon: 'Wifi',
        label: "Very Good WiFi",
        value: "Very Good",
        color: isDark ? "text-green-400" : "text-green-500",
        iconColor: isDark ? "text-green-400" : "text-green-500"
      };
    }
    if (speed >= 10) {
      return {
        icon: 'Wifi',
        label: "Good WiFi",
        value: "Good",
        color: isDark ? "text-yellow-400" : "text-yellow-500",
        iconColor: isDark ? "text-yellow-400" : "text-yellow-500"
      };
    }
    return {
      icon: 'Wifi',
      label: `${speed} Mbps`,
      value: "Basic",
      color: isDark ? "text-yellow-400" : "text-yellow-500",
      iconColor: isDark ? "text-yellow-400" : "text-yellow-500"
    };
  }

  return {
    icon: 'Wifi',
    label: "WiFi Available",
    value: "Unknown",
    color: isDark ? "text-gray-400" : "text-gray-500",
    iconColor: isDark ? "text-gray-400" : "text-gray-500"
  };
};