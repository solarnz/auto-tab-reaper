async function saveOptions(e) {
  e.preventDefault();

  const form = new FormData(document.querySelector("form"));

  const pinned = form.get('suspend-pinned') === 'on';
  const audible = form.get('suspend-audible') === 'on';
  const time = Number(document.querySelector("[name=suspend-time]").value);
  const regexes = (form.getAll('regex') || []).map(r => r.trim()).filter(r => r.length > 0);

  for (let regex of regexes) {
    try {
      new RegExp(regex);
    } catch(e) {
      alert('Cannot save, regex: "' + regex + '" does not compile: \n' + e);
      return;
    }
  }

  const options = {
    pinned,
    audible,
    time,
    regexes,
  };

  await browser.storage.sync.set(options);
}

async function loadOptions() {
  const options = await browser.storage.sync.get();
  document.querySelector("[name=suspend-pinned]").checked = options.pinned || false;
  document.querySelector("[name=suspend-audible]").checked = options.audible || false;
  document.querySelector("[name=suspend-time]").value = options.time || 1800000;

  const regexes = options.regexes || [];
  for (let regex of regexes) {
    addRegexInput(regex);
  }
}

function regexButton(e) {
  e.preventDefault();

  if (e.target.className == 'regexAdd') {
    addRegexInput('');
  }
  if (e.target.className == 'regexDelete') {
    deleteRegexInput(e.target);
  }
}

function deleteRegexInput(element) {
  element.closest('.rejexInput').remove();
}

function addRegexInput(value) {
  const regexSection = document.querySelector("#regex");

  const span = document.createElement("span");
  span.className = "rejexInput";

  span.appendChild(document.createElement('br'));

  const input = document.createElement('input');
  input.type = 'text';
  input.name = 'regex';
  input.placeholder = 'console\\..*\\.(google|amazon).com';
  input.size = 50;
  input.value = value || '';
  span.appendChild(input);

  const removeButton = document.createElement('input');
  removeButton.type = 'button';
  removeButton.name = 'remove';
  removeButton.value = 'X';
  removeButton.className = 'regexDelete';
  span.appendChild(removeButton);

  document.querySelector('#regex').appendChild(span);
}

document.addEventListener("DOMContentLoaded", loadOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
document.querySelector("#regex").addEventListener("click", regexButton);
