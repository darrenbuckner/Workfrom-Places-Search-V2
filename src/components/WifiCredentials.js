import React, { useState } from 'react';
import { Wifi, Copy, Check, Lock } from 'lucide-react';

const WifiCredentials = ({ password }) => {
  const [copied, setCopied] = useState(false);

  // Parse the wifi info
  const parseWifiInfo = (password) => {
    if (!password) return { ssid: null, password: null };
    
    // Check if it contains a separator
    if (password.includes('|')) {
      const [ssid, pass] = password.split('|').map(s => s.trim());
      return { ssid, password: pass };
    }
    
    // Common SSIDs that don't require passwords
    const commonFreeNetworks = ['Google Starbucks', 'Google Fi', 'xfinitywifi', 'attwifi'];
    if (commonFreeNetworks.some(network => password.toLowerCase().includes(network.toLowerCase()))) {
      return { ssid: password.trim(), password: null };
    }
    
    // If it's short and contains numbers, likely a password
    if (password.length < 15 && /\d/.test(password)) {
      return { ssid: null, password: password.trim() };
    }
    
    // Default to treating it as an SSID
    return { ssid: password.trim(), password: null };
  };

  const wifiInfo = parseWifiInfo(password);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!password) return null;

  return (
    <div className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
      <div className="p-4">
        <div className="flex items-start gap-2.5 mb-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/10 
              flex items-center justify-center">
              <Wifi className="w-4 h-4 text-[var(--accent-primary)]" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-[var(--text-primary)]">
              WiFi Access
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Network credentials
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {wifiInfo.ssid && (
            <div className="flex items-center justify-between gap-2 p-2 rounded-md
              bg-[var(--bg-primary)] border border-[var(--border-primary)]">
              <div className="min-w-0">
                <div className="text-xs text-[var(--text-secondary)] mb-0.5">Network Name</div>
                <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {wifiInfo.ssid}
                </div>
              </div>
              <button
                onClick={() => handleCopy(wifiInfo.ssid)}
                className="flex items-center justify-center w-8 h-8 rounded-md
                  hover:bg-[var(--bg-secondary)] transition-colors"
                title="Copy network name"
              >
                {copied ? (
                  <Check size={16} className="text-[var(--success)]" />
                ) : (
                  <Copy size={16} className="text-[var(--text-secondary)]" />
                )}
              </button>
            </div>
          )}

          {wifiInfo.password && (
            <div className="flex items-center justify-between gap-2 p-2 rounded-md
              bg-[var(--bg-primary)] border border-[var(--border-primary)]">
              <div className="min-w-0">
                <div className="text-xs text-[var(--text-secondary)] mb-0.5">Password</div>
                <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {wifiInfo.password}
                </div>
              </div>
              <button
                onClick={() => handleCopy(wifiInfo.password)}
                className="flex items-center justify-center w-8 h-8 rounded-md
                  hover:bg-[var(--bg-secondary)] transition-colors"
                title="Copy password"
              >
                {copied ? (
                  <Check size={16} className="text-[var(--success)]" />
                ) : (
                  <Copy size={16} className="text-[var(--text-secondary)]" />
                )}
              </button>
            </div>
          )}

          {!wifiInfo.password && !wifiInfo.ssid && (
            <div className="flex items-center gap-2 p-2 text-sm text-[var(--text-secondary)]">
              <Lock size={16} />
              Ask staff for network credentials
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WifiCredentials;