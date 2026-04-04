// ============================================================
// 7 WebLY SINS — Background Service Worker
// Tracks time spent on sin/virtue sites and manages premium features
// ============================================================

importScripts('ExtPay.js');

const EXTPAY_ID = '7weblysins';
const extpay = typeof ExtPay === 'function' ? ExtPay(EXTPAY_ID) : null;
if (extpay && typeof extpay.startBackground === 'function') {
  extpay.startBackground();
}

async function syncPremiumStatus() {
  if (!extpay) return false;
  try {
    const user = await extpay.getUser();
    const paid = !!(user && user.paid);
    await chrome.storage.local.set({ isPremium: paid });
    return paid;
  } catch (e) {
    console.log('ExtensionPay sync failed:', e);
    return false;
  }
}

// Keep local premium state aligned with ExtensionPay.
syncPremiumStatus();
setInterval(syncPremiumStatus, 5 * 60 * 1000);

// Multiple emojis per sin for premium rotating feature
const PREMIUM_EMOJIS = {
  pride:    ['👑', '🪞', '🦚', '💎', '🏆', '🎭'],
  greed:    ['💰', '💎', '💵', '💳', '🏦', '🤑'],
  lust:     ['🔥', '❤️‍🔥', '🌹', '😈', '💋'],
  envy:     ['💚', '🐍', '👀', '😒', '🫠', '😤', '🫣', '🤥', '😏', '🥀'],
  gluttony: ['🍔', '🍕', '🍩', '🍰', '🍫', '🍗', '🥤'],
  wrath:    ['😡', '🤬', '�', '⚡', '🌋', '👊'],
  sloth:    ['🦥', '😴', '🛋️', '💤', '🐌', '⏰'],
};

const FREE_EMOJIS = {
  pride: '👑',
  greed: '💰',
  lust: '🔥',
  envy: '💚',
  gluttony: '🍔',
  wrath: '😡',
  sloth: '🦥',
};

// Site-to-sin mapping for time tracking
const SITE_SIN_MAP = [
  { sin: 'greed', patterns: ['amazon', 'ebay', 'walmart', 'target', 'bestbuy', 'etsy', 'shopify', 'aliexpress', 'wish.com', 'macys', 'nordstrom', 'zappos', 'shein', 'temu', 'costco', 'wayfair', 'overstock', 'newegg', 'draftkings', 'fanduel', 'betmgm', 'caesars', 'pointsbet', 'bovada', 'bet365', 'pokerstars', 'casino'] },
  { sin: 'gluttony', patterns: ['doordash', 'ubereats', 'grubhub', 'postmates', 'seamless', 'yelp.com/biz', 'opentable', 'allrecipes', 'foodnetwork', 'epicurious', 'dominos', 'pizzahut', 'mcdonalds', 'chipotle', 'instacart'] },
  { sin: 'envy', patterns: ['facebook.com', 'instagram.com', 'tiktok.com', 'snapchat.com', 'pinterest.com', 'threads.net'] },
  { sin: 'pride', patterns: ['linkedin.com', 'twitter.com', 'x.com'] },
  { sin: 'sloth', patterns: ['netflix.com', 'hulu.com', 'disneyplus.com', 'hbomax.com', 'max.com', 'peacock', 'paramount', 'crunchyroll', 'twitch.tv', 'youtube.com/watch'] },
  { sin: 'wrath', patterns: ['reddit.com', 'news.ycombinator', 'foxnews', 'cnn.com', 'msnbc', 'breitbart', '4chan', 'dailymail'] },
  { sin: 'lust', patterns: ['tinder.com', 'bumble.com', 'hinge.co', 'match.com', 'okcupid', 'pof.com', 'grindr.com'] },
];

const VIRTUE_PATTERNS = [
  'mail.google.com', 'outlook.office', 'outlook.live', 'mail.yahoo', 'protonmail',
  'docs.google.com', 'sheets.google.com', 'slides.google.com', 'notion.so', 'trello.com',
  'asana.com', 'monday.com', 'jira', 'confluence', 'basecamp', 'clickup',
  'github.com', 'gitlab.com', 'bitbucket.org', 'stackoverflow.com', 'stackexchange.com',
  'developer.', 'learn.microsoft', 'codecademy', 'udemy.com', 'coursera.org',
  'khanacademy.org', 'edx.org', 'calendar.google.com', 'todoist.com', 'ticktick.com',
  'wikipedia.org', 'britannica.com', 'nationalgeographic.com', 'scholar.google',
  'myfitnesspal', 'strava.com', 'fitbit.com', 'headspace.com', 'calm.com',
  'mint.com', 'ynab.com', 'nerdwallet.com',
  'gofundme.com', 'kiva.org', 'habitat.org', 'redcross.org', 'feedingamerica.org',
  'indeed.com', 'glassdoor.com', 'ziprecruiter.com', 'monster.com', 'careerbuilder.com', 'usajobs.gov', 'weworkremotely.com',
];

// ============================================================
// TIME TRACKING
// ============================================================

let activeTabId = null;
let activeCategory = null; // 'virtue' or sin name
let trackingStartTime = null;

function classifyUrl(url) {
  if (!url) return null;
  const lowerUrl = url.toLowerCase();

  // Check virtue sites first
  for (const pattern of VIRTUE_PATTERNS) {
    if (lowerUrl.includes(pattern)) return 'virtue';
  }

  // Check sin sites
  for (const entry of SITE_SIN_MAP) {
    for (const pattern of entry.patterns) {
      if (lowerUrl.includes(pattern)) return entry.sin;
    }
  }

  return null; // Uncategorized
}

function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

async function saveTimeSpent(category, seconds) {
  if (!category || seconds < 5) return; // Ignore less than 5 seconds

  const todayKey = getTodayKey();
  const storageKey = `time_${todayKey}`;

  const result = await chrome.storage.local.get([storageKey]);
  const dayData = result[storageKey] || {
    pride: 0, greed: 0, lust: 0, envy: 0,
    gluttony: 0, wrath: 0, sloth: 0, virtue: 0
  };

  const prevVirtue = dayData.virtue || 0;
  dayData[category] = (dayData[category] || 0) + Math.round(seconds);

  await chrome.storage.local.set({ [storageKey]: dayData });

  // Award virtue tokens: 1 token per 5 minutes of virtue time
  if (category === 'virtue') {
    const prevTokens = Math.floor(prevVirtue / 300);
    const newTokens = Math.floor(dayData.virtue / 300);
    if (newTokens > prevTokens) {
      const count = newTokens - prevTokens;
      await awardVirtueTokens(count);
    }
  }
}

// ============================================================
// VIRTUE TOKENS
// ============================================================

const VIRTUE_NAMES = {
  'mail.google.com': 'Email (Gmail)',
  'outlook.office': 'Email (Outlook)',
  'outlook.live': 'Email (Outlook)',
  'mail.yahoo': 'Email (Yahoo)',
  'protonmail': 'Email (ProtonMail)',
  'docs.google.com': 'Google Docs',
  'sheets.google.com': 'Google Sheets',
  'slides.google.com': 'Google Slides',
  'notion.so': 'Notion',
  'trello.com': 'Trello',
  'asana.com': 'Asana',
  'monday.com': 'Monday.com',
  'jira': 'Jira',
  'confluence': 'Confluence',
  'clickup': 'ClickUp',
  'github.com': 'GitHub',
  'gitlab.com': 'GitLab',
  'stackoverflow.com': 'Stack Overflow',
  'codecademy': 'Codecademy',
  'udemy.com': 'Udemy',
  'coursera.org': 'Coursera',
  'khanacademy.org': 'Khan Academy',
  'edx.org': 'edX',
  'calendar.google.com': 'Google Calendar',
  'todoist.com': 'Todoist',
  'wikipedia.org': 'Wikipedia',
  'scholar.google': 'Google Scholar',
  'myfitnesspal': 'MyFitnessPal',
  'strava.com': 'Strava',
  'headspace.com': 'Headspace',
  'calm.com': 'Calm',
  'mint.com': 'Mint',
  'ynab.com': 'YNAB',
  'nerdwallet.com': 'NerdWallet',
  'gofundme.com': 'GoFundMe',
  'redcross.org': 'Red Cross',
  'kiva.org': 'Kiva',
};

function identifyVirtueSite(url) {
  if (!url) return 'Productive Site';
  const lowerUrl = url.toLowerCase();
  for (const [pattern, name] of Object.entries(VIRTUE_NAMES)) {
    if (lowerUrl.includes(pattern)) return name;
  }
  return 'Productive Site';
}

async function awardVirtueTokens(count) {
  const result = await chrome.storage.local.get(['virtueTokens', 'virtueTokenLog']);
  const tokens = (result.virtueTokens || 0) + count;
  const log = result.virtueTokenLog || [];

  // Get current active tab to identify the site
  let siteName = 'Productive Site';
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      siteName = identifyVirtueSite(tab.url);
    }
  } catch (e) {}

  const now = new Date();
  for (let i = 0; i < count; i++) {
    log.unshift({
      site: siteName,
      time: now.toISOString(),
      virtue: getVirtueForSite(siteName),
    });
  }

  // Keep only last 100 log entries
  if (log.length > 100) log.length = 100;

  await chrome.storage.local.set({ virtueTokens: tokens, virtueTokenLog: log });
}

function getVirtueForSite(siteName) {
  const map = {
    'Email': 'Diligence', 'Gmail': 'Diligence', 'Outlook': 'Diligence', 'Yahoo': 'Diligence', 'ProtonMail': 'Diligence',
    'Docs': 'Discipline', 'Sheets': 'Discipline', 'Slides': 'Discipline', 'Notion': 'Discipline',
    'Trello': 'Discipline', 'Asana': 'Discipline', 'Monday': 'Discipline', 'Jira': 'Discipline',
    'ClickUp': 'Discipline', 'Confluence': 'Discipline',
    'GitHub': 'Focus', 'GitLab': 'Focus', 'Stack Overflow': 'Focus', 'Codecademy': 'Focus',
    'Udemy': 'Focus', 'Coursera': 'Focus', 'Khan Academy': 'Focus', 'edX': 'Focus',
    'Calendar': 'Intentionality', 'Todoist': 'Intentionality',
    'Wikipedia': 'Mindfulness', 'Google Scholar': 'Mindfulness',
    'MyFitnessPal': 'Temperance', 'Strava': 'Temperance', 'Headspace': 'Temperance', 'Calm': 'Temperance',
    'Mint': 'Restraint', 'YNAB': 'Restraint', 'NerdWallet': 'Restraint',
    'GoFundMe': 'Charity', 'Red Cross': 'Charity', 'Kiva': 'Charity',
  };
  for (const [key, virtue] of Object.entries(map)) {
    if (siteName.includes(key)) return virtue;
  }
  return 'Diligence';
}

function stopTracking() {
  if (activeCategory && trackingStartTime) {
    const elapsed = (Date.now() - trackingStartTime) / 1000;
    saveTimeSpent(activeCategory, elapsed);
  }
  activeCategory = null;
  trackingStartTime = null;
}

async function startTracking(tabId) {
  stopTracking(); // Save any previous tracking

  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab || !tab.url) return;

    const category = classifyUrl(tab.url);
    if (category) {
      activeTabId = tabId;
      activeCategory = category;
      trackingStartTime = Date.now();
    }
  } catch (e) {
    // Tab might have been closed
  }
}

// Track tab switches
chrome.tabs.onActivated.addListener((activeInfo) => {
  startTracking(activeInfo.tabId);
});

// Track URL changes within the same tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && tabId === activeTabId) {
    startTracking(tabId);
  }
});

// Track when Chrome loses focus
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    stopTracking();
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) startTracking(tabs[0].id);
    });
  }
});

// Save tracking data periodically (every 30 seconds)
setInterval(() => {
  if (activeCategory && trackingStartTime) {
    const elapsed = (Date.now() - trackingStartTime) / 1000;
    saveTimeSpent(activeCategory, elapsed);
    trackingStartTime = Date.now(); // Reset timer
  }
}, 30000);

// ============================================================
// PREMIUM EMOJI ROTATION
// ============================================================

// Respond to content script requests
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getEmoji') {
    chrome.storage.local.get(['isPremium', 'customEmojis'], (result) => {
      const sin = message.sin;
      const isPremium = result.isPremium === true;
      if (isPremium && result.customEmojis && result.customEmojis[sin]) {
        sendResponse({ emoji: result.customEmojis[sin] });
      } else if (isPremium) {
        const emojis = PREMIUM_EMOJIS[sin] || [FREE_EMOJIS[sin]];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        sendResponse({ emoji: randomEmoji });
      } else {
        // Free users: only default emoji
        sendResponse({ emoji: FREE_EMOJIS[sin] });
      }
    });
    return true; // Keep channel open for async response
  }

  if (message.type === 'getTimeData') {
    const todayKey = getTodayKey();
    const storageKey = `time_${todayKey}`;
    chrome.storage.local.get([storageKey], (result) => {
      sendResponse({ data: result[storageKey] || null });
    });
    return true;
  }

  if (message.type === 'getWeekData') {
    const keys = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `time_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      keys.push(key);
    }
    chrome.storage.local.get(keys, (result) => {
      sendResponse({ data: result, keys });
    });
    return true;
  }

  if (message.type === 'getVirtueTokens') {
    chrome.storage.local.get(['virtueTokens', 'virtueTokenLog'], (result) => {
      sendResponse({
        tokens: result.virtueTokens || 0,
        log: result.virtueTokenLog || [],
      });
    });
    return true;
  }

  if (message.type === 'refreshPremiumStatus') {
    syncPremiumStatus().then((paid) => sendResponse({ isPremium: paid }));
    return true;
  }
});

// ============================================================
// DEFAULT SETTINGS ON INSTALL
// ============================================================

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['settings'], (result) => {
    if (!result.settings) {
      chrome.storage.local.set({
        enabled: true,
        isPremium: false,
        settings: {
          enabledSins: {
            pride: true,
            greed: true,
            lust: true,
            envy: true,
            gluttony: true,
            wrath: true,
            sloth: true,
          },
          bannerPosition: 'bottom',
          theme: 'dark',
          intensity: 'normal',
        },
        customEmojis: {},
      });
    }
  });
});
