const defaultOptions = {
  pinned: false,
  audible: false,
  time: 1800000,
  timeToClose: 3600000,
  regexes: [],
};

async function discardTabs() {
  const userOptions = await browser.storage.sync.get();
  const options = {
    ...defaultOptions,
    ...userOptions,
  };

  // If the time has been set to 0, it disables the auto-discarding
  if (options.time === 0) {
    return;
  }

  const regexes = options.regexes.map(r => new RegExp(r));

  const lastActiveLimitSuspending = Date.now() - (options.time);
  const lastActiveLimitClosing = Date.now() - (options.timeToClose);

  let tabs = await browser.tabs.query({
    active: false // Don't discard the current tab
  });

  tabs = tabs.filter(function(tab) {

    // Only suspend pinned tabs if the user has enabled it
    if (!options.pinned && tab.pinned) {
      return false;
    }

    // Only suspend audible tabs if the user has enabled it
    if (!options.audible && tab.audible) {
      return false;
    }

    if (tab.lastAccessed > lastActiveLimitSuspending) {
      return false;
    }

    // Ignore tabs the match the list of regular expressions
    if (regexes.some((r) => r.test(tab.url))) {
      return false;
    };

    return true;
  });

  for (const tab of tabs) {
    if (tab.lastAccessed > lastActiveLimitClosing && options.timeToClose > 0) {
      browser.tabs.remove(tab.id);
    } else {
      browser.tabs.discard(tab.id);
    }
  };
}

// Check once a minute if there are any tabs we should discard
setInterval(discardTabs, 60*1000);

// Add the context menu item on tabs
//
browser.menus.create({
  id: "suspend",
  title: "Suspend this tab",
  contexts: ["tab"]
});

browser.menus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== "suspend") {
    return;
  }

  browser.tabs.discard(tab.id);
});
