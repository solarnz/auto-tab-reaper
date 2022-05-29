const defaultOptions = {
  pinned: false,
  audible: false,
  time: 1800000,
  timeToClose: 0,
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

  const lastActiveLimit = Date.now() - (options.time);

  let tabs = await browser.tabs.query({
    active: false, // Don't discard the current tab
    discarded: false, // Don't get already discarded tabs!
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

    if (tab.lastAccessed > lastActiveLimit) {
      return false;
    }

    // Ignore tabs the match the list of regular expressions
    if (regexes.some((r) => r.test(tab.url))) {
      return false;
    };

    return true;
  });

  for (const tab of tabs) {
    browser.tabs.discard(tab.id);
  };
}

/**
 * closes any tabs that are discarded, inactive for the specified time and discardable by options
 */
async function closeTabs() {
  const userOptions = await browser.storage.sync.get();
  const options = {
    ...defaultOptions,
    ...userOptions,
  };

  const regexes = options.regexes.map(r => new RegExp(r));

  const lastActiveLimit = Date.now() - (options.timeToClose);

  let tabs = await browser.tabs.query({
    discarded: true, // Only get previously discarded tabs!
    active: false, // Don't discard the current tab  
  });

  tabs = tabs.filter(function(tab) {
    // Only close pinned tabs if the user has enabled it
    if (!options.pinned && tab.pinned) {
      return false;
    }

    // Only close audible tabs if the user has enabled it
    if (!options.audible && tab.audible) {
      return false;
    }

    // Only close tabs that are inactive for the specified time
    if (tab.lastAccessed > lastActiveLimit) {
      return false;
    }

    // Ignore tabs the match the list of regular expressions
    if (regexes.some((r) => r.test(tab.url))) {
      return false;
    };

    return true;
  });
}

// Check once a minute if there are any tabs we should discard
setInterval(discardTabs, 60*1000);

// Check every second if there are any tabs we should close
setInterval(closeTabs, 60*1000);

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
