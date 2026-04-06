// ============================================================
// 7 WebLY Sins — Popup Controller
// Handles tabs, dashboard, settings, and premium features
// ============================================================

const SIN_INFO = {
  pride:    { emoji: '👑', name: 'Pride',    color: '#e1bee7' },
  greed:    { emoji: '💰', name: 'Greed',    color: '#fff176' },
  lust:     { emoji: '🔥', name: 'Lust',     color: '#ef9a9a' },
  envy:     { emoji: '💚', name: 'Envy',     color: '#a5d6a7' },
  gluttony: { emoji: '🍔', name: 'Gluttony', color: '#ffcc80' },
  wrath:    { emoji: '😡', name: 'Wrath',    color: '#e57373' },
  sloth:    { emoji: '🦥', name: 'Sloth',    color: '#90caf9' },
};

const SIN_KEYS = ['pride', 'greed', 'lust', 'envy', 'gluttony', 'wrath', 'sloth'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const EXTPAY_ID = '7weblysins';
const extpay = typeof ExtPay === 'function' ? ExtPay(EXTPAY_ID) : null;

// ============================================================
// TAB SWITCHING
// ============================================================

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
  });
});

// ============================================================
// HELPERS
// ============================================================

function formatTime(seconds) {
  if (!seconds || seconds < 60) return seconds ? `${Math.round(seconds)}s` : '0m';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

function getScoreGrade(score) {
  if (score >= 90) return { text: 'Saintly! 😇', color: '#66bb6a' };
  if (score >= 75) return { text: 'Virtuous! ✨', color: '#81c784' };
  if (score >= 60) return { text: 'Good 👍', color: '#4fc3f7' };
  if (score >= 40) return { text: 'Needs Work 🤔', color: '#ffd54f' };
  if (score >= 20) return { text: 'Tempted 😬', color: '#ff9800' };
  return { text: 'Fallen 😈', color: '#ef5350' };
}

// ============================================================
// LOAD STATE
// ============================================================

let isPremium = false; // Default to free, set true if paid

async function getPremiumStatusFromExtensionPay() {
  if (!extpay) return false;
  try {
    const user = await extpay.getUser();
    return !!(user && user.paid);
  } catch (e) {
    console.log('ExtensionPay check failed:', e);
    return false;
  }
}

async function refreshPremiumStatus() {
  const paid = await getPremiumStatusFromExtensionPay();
  await chrome.storage.local.set({ isPremium: paid });
  isPremium = paid;
  return paid;
}

async function init() {
  await refreshPremiumStatus();
  chrome.storage.local.get(['enabled', 'isPremium', 'settings', 'customEmojis', 'tokenIcon', 'bannerStyle'], (result) => {
    isPremium = result.isPremium === true;
    selectedTokenIcon = result.tokenIcon || '\ud83c\udfc5';

    // Enabled toggle
    const toggle = document.getElementById('toggle-enabled');
    toggle.checked = result.enabled !== false;
    toggle.addEventListener('change', (e) => {
      chrome.storage.local.set({ enabled: e.target.checked });
    });

    // Load settings
    const settings = result.settings || { enabledSins: {} };
    const enabledSins = settings.enabledSins || {};

    // Sin toggles — premium users can choose which sins to monitor
    // Free users see all toggles ON but can't change them
    const sinFrequencies = settings.sinFrequencies || {};
    document.querySelectorAll('.sin-toggle').forEach(toggle => {
      if (isPremium) {
        const sin = toggle.dataset.sin;
        toggle.disabled = false;
        toggle.checked = enabledSins[sin] !== false;
        if (!toggle.dataset.bound) {
          toggle.addEventListener('change', saveSinToggles);
          toggle.dataset.bound = 'true';
        }
      } else {
        toggle.checked = true;
        toggle.disabled = true;
      }
    });

    // Frequency dropdowns — premium only
    document.querySelectorAll('.sin-freq-select').forEach(select => {
      const sin = select.dataset.sin;
      const saved = sinFrequencies[sin];
      if (saved && saved > 1) {
        select.value = String(saved);
      }
      // else keep "Frequency" placeholder selected (default = every page)
      if (isPremium) {
        select.disabled = false;
        if (!select.dataset.bound) {
          select.addEventListener('change', saveSinFrequencies);
          select.dataset.bound = 'true';
        }
      } else {
        select.disabled = true;
      }
    });

    // Banner style picker — always load, but lock for free users
    loadBannerStylePicker(isPremium ? (result.bannerStyle || 'default') : 'default');

    if (isPremium) {
      // Show all UI features
      showPremiumUI(result.customEmojis || {}, settings);
      document.getElementById('sins-premium-notice').style.display = 'none';
      // Dashboard
      loadDashboard();
      // Show manage subscription
      document.getElementById('btn-manage-sub').style.display = 'block';
    } else {
      // Show premium gate in dashboard
      document.getElementById('premium-gate').style.display = 'block';
      document.getElementById('dashboard-content').style.display = 'none';
      document.getElementById('sins-premium-notice').style.display = 'block';
      // Hide manage subscription
      document.getElementById('btn-manage-sub').style.display = 'none';
      // Load all premium section content so it's visible
      showPremiumUI(result.customEmojis || {}, settings);
      // Lock premium settings sections (visible but not clickable)
      const premiumSections = [
        'premium-emoji-section',
        'premium-whitelist-section',
        'premium-token-icon-section',
        'premium-font-section',
        'premium-colors-section',
        'premium-flash-section',
      ];
      premiumSections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('premium-locked');
      });
      // Lock banner style options except Default (which stays selected & visible)
      document.querySelectorAll('.banner-style-option').forEach(label => {
        const radio = label.querySelector('input[name="bannerStyle"]');
        if (radio && radio.value !== 'default') {
          label.classList.add('premium-locked');
        }
      });
    }

    // Buy premium button
    const unlockBtn = document.getElementById('btn-unlock');
    if (unlockBtn) {
      unlockBtn.addEventListener('click', async () => {
        if (!extpay) {
          const status = document.getElementById('premium-status-message');
          if (status) {
            status.textContent = 'ExtensionPay is not available. Please reload the extension.';
            status.style.display = 'block';
            status.style.color = '#ef5350';
          }
          return;
        }

        const status = document.getElementById('premium-status-message');
        if (status) {
          status.textContent = 'Opening secure checkout...';
          status.style.display = 'block';
          status.style.color = '#ffd54f';
        }

        try {
          extpay.openPaymentPage();
        } catch (e) {
          console.log('Failed to open ExtensionPay page:', e);
        }

        // Give the user a moment to complete checkout, then refresh status.
        setTimeout(async () => {
          const paid = await refreshPremiumStatus();
          if (paid) {
            chrome.storage.local.get(['settings', 'customEmojis'], (r) => {
              showPremiumUI(r.customEmojis || {}, r.settings || {});
              loadDashboard();
              const savedEnabledSins = (r.settings && r.settings.enabledSins) || {};
              document.querySelectorAll('.sin-toggle').forEach(toggle => {
                const sin = toggle.dataset.sin;
                toggle.disabled = false;
                toggle.checked = savedEnabledSins[sin] !== false;
                if (!toggle.dataset.bound) {
                  toggle.addEventListener('change', saveSinToggles);
                  toggle.dataset.bound = 'true';
                }
              });
              const savedFreqs = (r.settings && r.settings.sinFrequencies) || {};
              document.querySelectorAll('.sin-freq-select').forEach(select => {
                select.disabled = false;
                const saved = savedFreqs[select.dataset.sin];
                if (saved && saved > 1) {
                  select.value = String(saved);
                }
                if (!select.dataset.bound) {
                  select.addEventListener('change', saveSinFrequencies);
                  select.dataset.bound = 'true';
                }
              });
              document.getElementById('sins-premium-notice').style.display = 'none';
              // Unlock all premium settings sections
              document.querySelectorAll('.premium-locked').forEach(el => el.classList.remove('premium-locked'));
              // Switch buttons
              document.getElementById('btn-manage-sub').style.display = 'block';
            });
            if (status) {
              status.textContent = 'Premium unlocked! Enjoy your pro features.';
              status.style.display = 'block';
              status.style.color = '#66bb6a';
            }
          } else if (status) {
            status.textContent = 'Payment not detected yet. Complete checkout, then reopen popup.';
            status.style.display = 'block';
            status.style.color = '#bbb';
          }
        }, 4000);
      });
    }

    // Allow manual refresh of payment status by re-opening popup.
    chrome.runtime.sendMessage({ type: 'refreshPremiumStatus' }, () => {
      // Ignore response; popup state already initialized.
    });

    // "Premium" link in sins tab notice
    const premiumLinkSins = document.getElementById('premium-link-sins');
    if (premiumLinkSins) {
      premiumLinkSins.addEventListener('click', (e) => {
        e.preventDefault();
        if (extpay) extpay.openPaymentPage();
      });
    }

    // Manage Subscription button (bottom of popup)
    const manageSubBtn = document.getElementById('btn-manage-sub');
    if (manageSubBtn) {
      manageSubBtn.addEventListener('click', () => {
        if (extpay) {
          extpay.openPaymentPage();
        }
      });
    }
  });
}

// ============================================================
// SIN TOGGLES
// ============================================================

function saveSinToggles() {
  const enabledSins = {};
  document.querySelectorAll('.sin-toggle').forEach(toggle => {
    enabledSins[toggle.dataset.sin] = toggle.checked;
  });

  chrome.storage.local.get(['settings'], (result) => {
    const settings = result.settings || {};
    settings.enabledSins = enabledSins;
    chrome.storage.local.set({ settings });
  });
}

function saveSinFrequencies() {
  const sinFrequencies = {};
  document.querySelectorAll('.sin-freq-select').forEach(select => {
    sinFrequencies[select.dataset.sin] = parseInt(select.value, 10);
  });

  chrome.storage.local.get(['settings'], (result) => {
    const settings = result.settings || {};
    settings.sinFrequencies = sinFrequencies;
    chrome.storage.local.set({ settings });
  });
}

function showPremiumUI(customEmojis, settings) {
  if (isPremium) {
    // Show dashboard, hide gate
    document.getElementById('premium-gate').style.display = 'none';
    document.getElementById('dashboard-content').style.display = 'block';
  }

  // Show custom emoji section
  document.getElementById('premium-emoji-section').style.display = 'block';

  // Show whitelist section
  document.getElementById('premium-whitelist-section').style.display = 'block';

  // Load custom emojis
  document.querySelectorAll('.emoji-input').forEach(input => {
    const sin = input.dataset.sin;
    if (customEmojis[sin]) {
      input.value = customEmojis[sin];
    }
    if (isPremium) {
      input.addEventListener('input', () => saveCustomEmojis());
    }
  });

  // Load frequency settings if they exist
  if (isPremium) loadFrequencySettings(settings);

  // Load whitelist
  if (isPremium) loadWhitelist();

  // Show and load token icon picker
  document.getElementById('premium-token-icon-section').style.display = 'block';
  loadTokenIconPicker();

  // Show and load font picker
  document.getElementById('premium-font-section').style.display = 'block';
  loadFontPicker(settings);

  // Show and load color picker
  document.getElementById('premium-colors-section').style.display = 'block';
  loadColorPicker(settings);

  // Show and load flash toggle
  document.getElementById('premium-flash-section').style.display = 'block';
  loadFlashToggle(settings);
}

// ============================================================
// BANNER STYLE PICKER (Free)
// ============================================================

function toggleStyleColorSections(style) {
  const videoSection = document.getElementById('video-color-section');
  const neonSection = document.getElementById('neon-color-section');
  const bannerColorsSection = document.getElementById('premium-colors-section');
  if (videoSection) videoSection.style.display = style === 'video' ? 'block' : 'none';
  if (neonSection) neonSection.style.display = style === 'neon' ? 'block' : 'none';
  if (bannerColorsSection) bannerColorsSection.style.display = (style === 'video' || style === 'neon' || style === 'scroll') ? 'none' : 'block';
}

function loadBannerStylePicker(savedStyle) {
  const options = document.querySelectorAll('.banner-style-option');
  toggleStyleColorSections(savedStyle);
  options.forEach(label => {
    const radio = label.querySelector('input[name="bannerStyle"]');
    if (radio.value === savedStyle) {
      radio.checked = true;
      label.style.borderColor = '#4fc3f7';
    }
    label.addEventListener('click', () => {
      options.forEach(l => l.style.borderColor = 'transparent');
      label.style.borderColor = '#4fc3f7';
      radio.checked = true;
      chrome.storage.local.set({ bannerStyle: radio.value });
      toggleStyleColorSections(radio.value);
    });
  });

  // Video text color picker
  chrome.storage.local.get(['videoTextColor'], (result) => {
    const savedColor = result.videoTextColor || '#00ff41';
    document.querySelectorAll('.video-text-color').forEach(el => {
      if (el.dataset.color === savedColor) el.style.border = '2px solid #4fc3f7';
      el.addEventListener('click', () => {
        document.querySelectorAll('.video-text-color').forEach(e => e.style.border = '2px solid transparent');
        el.style.border = '2px solid #4fc3f7';
        chrome.storage.local.set({ videoTextColor: el.dataset.color });
      });
    });
  });

  // Neon edge color picker
  chrome.storage.local.get(['neonColor'], (result) => {
    const savedNeon = result.neonColor || '#ff3333';
    document.querySelectorAll('.neon-edge-color').forEach(el => {
      if (el.dataset.color === savedNeon) el.style.border = '2px solid #4fc3f7';
      el.addEventListener('click', () => {
        document.querySelectorAll('.neon-edge-color').forEach(e => e.style.border = '2px solid transparent');
        el.style.border = '2px solid #4fc3f7';
        chrome.storage.local.set({ neonColor: el.dataset.color });
      });
    });
  });

  // Video virtue text color picker
  chrome.storage.local.get(['videoVirtueColor'], (result) => {
    const savedColor = result.videoVirtueColor || '#00ff41';
    document.querySelectorAll('.video-virtue-color').forEach(el => {
      if (el.dataset.color === savedColor) el.style.border = '2px solid #4fc3f7';
      el.addEventListener('click', () => {
        document.querySelectorAll('.video-virtue-color').forEach(e => e.style.border = '2px solid transparent');
        el.style.border = '2px solid #4fc3f7';
        chrome.storage.local.set({ videoVirtueColor: el.dataset.color });
      });
    });
  });

  // Neon virtue edge color picker
  chrome.storage.local.get(['neonVirtueColor'], (result) => {
    const savedNeon = result.neonVirtueColor || '#33ff66';
    document.querySelectorAll('.neon-virtue-color').forEach(el => {
      if (el.dataset.color === savedNeon) el.style.border = '2px solid #4fc3f7';
      el.addEventListener('click', () => {
        document.querySelectorAll('.neon-virtue-color').forEach(e => e.style.border = '2px solid transparent');
        el.style.border = '2px solid #4fc3f7';
        chrome.storage.local.set({ neonVirtueColor: el.dataset.color });
      });
    });
  });
}

function saveCustomEmojis() {
  const customEmojis = {};
  document.querySelectorAll('.emoji-input').forEach(input => {
    const val = input.value.trim();
    if (val) {
      customEmojis[input.dataset.sin] = val;
    }
  });
  chrome.storage.local.set({ customEmojis });
}

// ============================================================
// FONT PICKER (Premium)
// ============================================================

function loadFontPicker(settings) {
  const select = document.getElementById('font-select');
  const preview = document.getElementById('font-preview');
  const saved = (settings && settings.messageFont) || 'default';

  select.value = saved;
  applyFontPreview(saved);

  select.addEventListener('change', () => {
    const font = select.value;
    applyFontPreview(font);
    chrome.storage.local.get(['settings'], (result) => {
      const s = result.settings || {};
      s.messageFont = font;
      chrome.storage.local.set({ settings: s });
    });
  });

  function applyFontPreview(font) {
    preview.style.fontFamily = font === 'default' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : font;
  }
}

// ============================================================
// COLOR PICKER (Premium)
// ============================================================

function loadColorPicker(settings) {
  const savedWarning = (settings && settings.warningColor) || 'rgba(200, 35, 25, 0.95)';
  const savedPraise = (settings && settings.praiseColor) || 'rgba(50, 80, 55, 0.95)';

  // Highlight saved selections
  document.querySelectorAll('.warning-color').forEach(el => {
    if (el.dataset.color === savedWarning) el.style.border = '2px solid #ffd54f';
    el.addEventListener('click', () => {
      document.querySelectorAll('.warning-color').forEach(e => e.style.border = '2px solid transparent');
      el.style.border = '2px solid #ffd54f';
      saveBannerColor('warningColor', el.dataset.color);
    });
  });

  document.querySelectorAll('.praise-color').forEach(el => {
    if (el.dataset.color === savedPraise) el.style.border = '2px solid #ffd54f';
    el.addEventListener('click', () => {
      document.querySelectorAll('.praise-color').forEach(e => e.style.border = '2px solid transparent');
      el.style.border = '2px solid #ffd54f';
      saveBannerColor('praiseColor', el.dataset.color);
    });
  });
}

function saveBannerColor(key, color) {
  chrome.storage.local.get(['settings'], (result) => {
    const s = result.settings || {};
    s[key] = color;
    chrome.storage.local.set({ settings: s });
  });
}

// ============================================================
// FLASH TOGGLE (Premium)
// ============================================================

function loadFlashToggle(settings) {
  const toggle = document.getElementById('toggle-flash');
  toggle.checked = (settings && settings.flashBanner) || false;
  toggle.addEventListener('change', () => {
    chrome.storage.local.get(['settings'], (result) => {
      const s = result.settings || {};
      s.flashBanner = toggle.checked;
      chrome.storage.local.set({ settings: s });
    });
  });
}

// ============================================================
// FREQUENCY SETTINGS (Premium)
// ============================================================

function loadFrequencySettings(settings) {
  // Add frequency controls if not already present
  const settingsTab = document.getElementById('tab-settings');
  if (document.getElementById('frequency-section')) return;

  const freqSection = document.createElement('div');
  freqSection.id = 'frequency-section';
  freqSection.className = 'setting-group';

  const frequencies = (settings && settings.frequency) || {};

  freqSection.innerHTML = `
    <h3>Warning Frequency</h3>
    <p style="font-size:11px; color:#666; margin-bottom:8px;">How often should each sin warning appear?</p>
    ${SIN_KEYS.map(sin => {
      const freq = frequencies[sin] || 'every';
      return `
        <div style="display:flex; align-items:center; justify-content:space-between; padding:6px 0;">
          <label style="font-size:14px;">${SIN_INFO[sin].emoji} ${SIN_INFO[sin].name}</label>
          <select class="freq-select" data-sin="${sin}" style="
            background: rgba(255,255,255,0.08); color: #eee; border: 1px solid rgba(255,255,255,0.15);
            border-radius: 6px; padding: 5px 8px; font-size: 12px; outline: none;
          ">
            <option value="every" ${freq === 'every' ? 'selected' : ''}>Every page</option>
            <option value="5min" ${freq === '5min' ? 'selected' : ''}>Every 5 min</option>
            <option value="15min" ${freq === '15min' ? 'selected' : ''}>Every 15 min</option>
            <option value="30min" ${freq === '30min' ? 'selected' : ''}>Every 30 min</option>
            <option value="hourly" ${freq === 'hourly' ? 'selected' : ''}>Once per hour</option>
            <option value="daily" ${freq === 'daily' ? 'selected' : ''}>Once per day</option>
          </select>
        </div>
      `;
    }).join('')}
  `;

  // Insert before the emoji section
  const emojiSection = document.getElementById('premium-emoji-section');
  settingsTab.insertBefore(freqSection, emojiSection);

  // Save frequency changes
  freqSection.querySelectorAll('.freq-select').forEach(select => {
    select.addEventListener('change', () => {
      const frequency = {};
      document.querySelectorAll('.freq-select').forEach(s => {
        frequency[s.dataset.sin] = s.value;
      });
      chrome.storage.local.get(['settings'], (result) => {
        const settings = result.settings || {};
        settings.frequency = frequency;
        chrome.storage.local.set({ settings });
      });
    });
  });
}

// ============================================================
// DASHBOARD
// ============================================================

function loadDashboard() {
  // Get today's data
  chrome.runtime.sendMessage({ type: 'getTimeData' }, (response) => {
    if (!response || !response.data) {
      renderDashboardEmpty();
      return;
    }
    renderDashboard(response.data);
  });

  // Get week data
  chrome.runtime.sendMessage({ type: 'getWeekData' }, (response) => {
    if (response && response.data) {
      renderWeekChart(response.data, response.keys);
    }
  });

  // Get virtue tokens
  chrome.runtime.sendMessage({ type: 'getVirtueTokens' }, (response) => {
    if (response) {
      renderVirtueTokens(response.tokens, response.log);
    }
  });
}

function renderDashboardEmpty() {
  document.getElementById('sin-score').textContent = '--';
  document.getElementById('score-grade').textContent = 'Start browsing to see your score!';
  document.getElementById('score-grade').style.color = '#888';
  document.getElementById('virtue-duration').textContent = '0m';
  document.getElementById('virtue-bar').style.width = '0%';
  document.getElementById('sin-time-list').innerHTML = '<div class="no-data">No sin time tracked yet today. Keep it up!</div>';
  document.getElementById('total-time').textContent = '0m';
}

function renderDashboard(data) {
  const virtueTime = data.virtue || 0;
  let totalSinTime = 0;

  // Build sin time rows
  const sinRows = [];
  SIN_KEYS.forEach(sin => {
    const time = data[sin] || 0;
    totalSinTime += time;
    if (time > 0) {
      sinRows.push({ sin, time });
    }
  });

  // Sort by most time
  sinRows.sort((a, b) => b.time - a.time);

  const totalTime = virtueTime + totalSinTime;
  const maxTime = Math.max(virtueTime, ...sinRows.map(r => r.time), 1);

  // Sin Score (0-100, higher is more virtuous)
  let score;
  if (totalTime === 0) {
    score = 100;
  } else {
    score = Math.round((virtueTime / totalTime) * 100);
  }

  const grade = getScoreGrade(score);
  const scoreCircle = document.getElementById('score-circle');

  document.getElementById('sin-score').textContent = score;
  document.getElementById('score-grade').textContent = grade.text;
  document.getElementById('score-grade').style.color = grade.color;
  scoreCircle.style.borderColor = grade.color;

  // Virtue bar
  document.getElementById('virtue-duration').textContent = formatTime(virtueTime);
  document.getElementById('virtue-bar').style.width = (virtueTime / maxTime * 100) + '%';

  // Sin rows
  const sinList = document.getElementById('sin-time-list');
  if (sinRows.length === 0) {
    sinList.innerHTML = '<div class="no-data">No sin time today! You\'re doing great! 😇</div>';
  } else {
    sinList.innerHTML = sinRows.map(row => {
      const info = SIN_INFO[row.sin];
      const pct = (row.time / maxTime * 100);
      return `
        <div class="time-row sin-row">
          <span class="time-emoji">${info.emoji}</span>
          <div class="time-info">
            <div class="time-name">${info.name}</div>
            <div class="time-bar-bg"><div class="time-bar-fill" style="width:${pct}%"></div></div>
          </div>
          <span class="time-duration">${formatTime(row.time)}</span>
        </div>
      `;
    }).join('');
  }

  // Total
  document.getElementById('total-time').textContent = formatTime(totalTime);
}

function renderWeekChart(data, keys) {
  const chart = document.getElementById('week-chart');
  const days = [];

  // keys are in reverse order (today first), so reverse for display
  for (let i = keys.length - 1; i >= 0; i--) {
    const dayData = data[keys[i]];
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayName = DAY_NAMES[d.getDay()];

    let sinTotal = 0;
    let virtueTotal = 0;

    if (dayData) {
      SIN_KEYS.forEach(sin => { sinTotal += dayData[sin] || 0; });
      virtueTotal = dayData.virtue || 0;
    }

    days.push({ dayName, sinTotal, virtueTotal });
  }

  // Find max for scaling
  const maxSeconds = Math.max(...days.map(d => Math.max(d.sinTotal, d.virtueTotal)), 1);

  chart.innerHTML = days.map(day => {
    const sinHeight = Math.max(3, (day.sinTotal / maxSeconds) * 55);
    const virtueHeight = Math.max(3, (day.virtueTotal / maxSeconds) * 55);
    return `
      <div class="week-day">
        <div class="week-bars">
          <div class="week-bar sin-bar" style="height:${sinHeight}px" title="Sin: ${formatTime(day.sinTotal)}"></div>
          <div class="week-bar virtue-bar" style="height:${virtueHeight}px" title="Virtue: ${formatTime(day.virtueTotal)}"></div>
        </div>
        <span class="week-label">${day.dayName}</span>
      </div>
    `;
  }).join('');
}

// ============================================================
// VIRTUE TOKENS (Premium)
// ============================================================

const TOKEN_ICON_OPTIONS = [
  '🏅', '⭐', '🌟', '✨', '💫', '☀️', '🔆',
  '🎖️', '🛡️', '⚜️', '🏆',
  '😇', '👼', '🕊️', '🙏', '✝️', '☮️',
  '💎', '🔮', '💠',
  '🌿', '🍃', '🪷',
];

let selectedTokenIcon = '🏅';
let tokenLogExpanded = false;

function loadTokenIconPicker() {
  chrome.storage.local.get(['tokenIcon'], (result) => {
    selectedTokenIcon = result.tokenIcon || '🏅';
    applyTokenIcon(selectedTokenIcon);

    const grid = document.getElementById('token-icon-grid');
    grid.innerHTML = TOKEN_ICON_OPTIONS.map(icon => `
      <div class="token-icon-option${icon === selectedTokenIcon ? ' selected' : ''}" data-icon="${icon}">${icon}</div>
    `).join('');

    grid.querySelectorAll('.token-icon-option').forEach(el => {
      el.addEventListener('click', () => {
        selectedTokenIcon = el.dataset.icon;
        chrome.storage.local.set({ tokenIcon: selectedTokenIcon });
        grid.querySelectorAll('.token-icon-option').forEach(o => o.classList.remove('selected'));
        el.classList.add('selected');
        applyTokenIcon(selectedTokenIcon);
      });
    });
  });
}

function applyTokenIcon(icon) {
  document.getElementById('token-header-icon').textContent = icon;
  document.getElementById('token-display-icon').textContent = icon;
  // Update log items if they exist
  document.querySelectorAll('.token-log-icon').forEach(el => { el.textContent = icon; });
}

function renderVirtueTokens(tokens, log) {
  document.getElementById('token-count').textContent = tokens;

  const logContainer = document.getElementById('token-log');
  const shareBtn = document.getElementById('btn-share-tokens');

  if (tokens > 0) {
    shareBtn.style.display = 'block';
    shareBtn.onclick = () => shareTokensOnFacebook(tokens);
  }

  if (!log || log.length === 0) {
    logContainer.innerHTML = '<p style="font-size:12px; color:#555; text-align:center;">Browse virtuous sites to earn tokens!</p>';
    return;
  }

  const showCount = tokenLogExpanded ? log.length : Math.min(5, log.length);
  const visibleLog = log.slice(0, showCount);

  logContainer.innerHTML = visibleLog.map(entry => {
    const date = new Date(entry.time);
    const timeStr = formatTokenDate(date);
    return `
      <div class="token-log-item">
        <div class="token-log-left">
          <span class="token-log-icon">${selectedTokenIcon}</span>
          <div>
            <div class="token-log-site">${entry.site}</div>
            <div class="token-log-virtue">${entry.virtue}</div>
          </div>
        </div>
        <div class="token-log-time">${timeStr}</div>
      </div>
    `;
  }).join('');

  if (log.length > 5 && !tokenLogExpanded) {
    logContainer.innerHTML += `<div class="token-log-more" id="show-more-tokens">Show all ${log.length} tokens ▾</div>`;
    document.getElementById('show-more-tokens').addEventListener('click', () => {
      tokenLogExpanded = true;
      renderVirtueTokens(tokens, log);
    });
  } else if (tokenLogExpanded && log.length > 5) {
    logContainer.innerHTML += `<div class="token-log-more" id="show-less-tokens">Show less ▴</div>`;
    document.getElementById('show-less-tokens').addEventListener('click', () => {
      tokenLogExpanded = false;
      renderVirtueTokens(tokens, log);
    });
  }
}

function formatTokenDate(date) {
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

function shareTokensOnFacebook(tokens) {
  const text = `I've earned ${tokens} Virtue Tokens on The 7 WebLY Sins! ${selectedTokenIcon} How virtuous is YOUR browsing?`;
  const url = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'width=600,height=400');
}

// ============================================================
// WHITELIST (Premium)
// ============================================================

function loadWhitelist() {
  chrome.storage.local.get(['whitelist'], (result) => {
    const whitelist = result.whitelist || [];
    renderWhitelist(whitelist);
  });

  document.getElementById('btn-add-site').addEventListener('click', addWhitelistSite);
  document.getElementById('whitelist-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addWhitelistSite();
  });
}

function addWhitelistSite() {
  const input = document.getElementById('whitelist-input');
  let site = input.value.trim().toLowerCase();
  if (!site) return;

  // Clean up: remove http/https/www prefixes and trailing slashes
  site = site.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '');
  if (!site) return;

  chrome.storage.local.get(['whitelist'], (result) => {
    const whitelist = result.whitelist || [];
    if (whitelist.includes(site)) {
      input.value = '';
      return;
    }
    whitelist.push(site);
    chrome.storage.local.set({ whitelist }, () => {
      input.value = '';
      renderWhitelist(whitelist);
    });
  });
}

function removeWhitelistSite(site) {
  chrome.storage.local.get(['whitelist'], (result) => {
    const whitelist = (result.whitelist || []).filter(s => s !== site);
    chrome.storage.local.set({ whitelist }, () => {
      renderWhitelist(whitelist);
    });
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderWhitelist(whitelist) {
  const list = document.getElementById('whitelist-list');
  if (whitelist.length === 0) {
    list.innerHTML = '<p style="font-size:12px; color:#555; text-align:center;">No exempt sites yet.</p>';
    return;
  }
  list.innerHTML = whitelist.map(site => {
    const safe = escapeHtml(site);
    return `
    <div class="whitelist-item">
      <span>🌐 ${safe}</span>
      <button class="btn-remove-site" data-site="${safe}" title="Remove">✕</button>
    </div>
  `;
  }).join('');

  list.querySelectorAll('.btn-remove-site').forEach(btn => {
    btn.addEventListener('click', () => removeWhitelistSite(btn.dataset.site));
  });
}

// ============================================================
// INIT
// ============================================================

init();
