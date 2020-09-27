async function saveOptions(e) {
  e.preventDefault();

  const pinned = document.querySelector("[name=suspend-pinned]").checked === true;
  const audible = document.querySelector("[name=suspend-audible]").checked === true;
  const time = Number(document.querySelector("[name=suspend-time]").value);

  await browser.storage.sync.set({
    pinned,
    audible,
    time,
  });
}

async function loadOptions() {
  const options = await browser.storage.sync.get();
  document.querySelector("[name=suspend-pinned]").checked = options.pinned || false;
  document.querySelector("[name=suspend-audible]").checked = options.audible || false;
  document.querySelector("[name=suspend-time]").value = options.time || 1800000;
}

document.addEventListener("DOMContentLoaded", loadOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
