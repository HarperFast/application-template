// Elements
const apiOutput = document.getElementById('api-output');
const breedResult = document.getElementById('breed-result');

const tableForm = document.getElementById('table-form');
const tableIdInput = document.getElementById('table-id');
const tableBodyInput = document.getElementById('table-body');
const tableSubmitButton = document.getElementById('table-submit');

const resourceToggle = document.getElementById('resource-toggle');
const methodToggle = document.getElementById('method-toggle');

const breedForm = document.getElementById('breed-form');
const breedOwnerInput = document.getElementById('breed-owner-name');
const breedNameInput = document.getElementById('breed-name');
const breedSubmitButton = document.getElementById('breed-submit');

// State
let currentResource = 'Owner';
let currentMethod = 'GET';

// Helpers
function showResponse(label, data, isError = false) {
  const time = new Date().toLocaleTimeString();
  apiOutput.textContent =
    `${label} (${time})${isError ? ' [ERROR]' : ''}\n\n` +
    JSON.stringify(data, null, 2);
}

function updateBreedBadge(result) {
  if (!result || typeof result.hasBreed === 'undefined') {
    breedResult.className = 'badge badge-muted';
    breedResult.textContent = 'No check performed yet.';
    return;
  }

  if (result.hasBreed) {
    breedResult.className = 'badge badge-success';
    breedResult.textContent = `${result.ownerName} has a dog of breed "${result.breed}".`;
  } else {
    breedResult.className = 'badge badge-error';
    breedResult.textContent = `${result.ownerName} does not have a dog of breed "${result.breed}".`;
  }
}

async function sendRequest(path, method, body, button, label) {
  const original = button.textContent;
  button.disabled = true;
  button.textContent = 'Working...';

  const options = { method };

  if (body !== undefined) {
    options.headers = { 'content-type': 'application/json' };
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(path, options);
    const data = await res.json().catch(() => ({}));
    showResponse(`${label} ${method} ${path}`, data, !res.ok);
    return { ok: res.ok, data };
  } catch (err) {
    showResponse(`${label} ${method} ${path}`, { message: err.message }, true);
    return { ok: false, data: null };
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
}

// Toggle handling
resourceToggle.addEventListener('click', (event) => {
  if (!(event.target instanceof HTMLElement)) return;
  const value = event.target.getAttribute('data-resource');
  if (!value) return;

  currentResource = value;
  Array.from(resourceToggle.querySelectorAll('.toggle')).forEach((btn) =>
    btn.classList.toggle('active', btn.getAttribute('data-resource') === value)
  );
});

methodToggle.addEventListener('click', (event) => {
  if (!(event.target instanceof HTMLElement)) return;
  const value = event.target.getAttribute('data-method');
  if (!value) return;

  currentMethod = value;
  Array.from(methodToggle.querySelectorAll('.toggle')).forEach((btn) =>
    btn.classList.toggle('active', btn.getAttribute('data-method') === value)
  );
});

// Table form
tableForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const id = tableIdInput.value.trim();
  const rawBody = tableBodyInput.value.trim();

  // Route to /Dog or /Owner for default table handlers
  let basePath;
  if (currentResource === 'Owner') {
    basePath = '/Owner/';
  } else if (currentResource === 'Dog') {
    basePath = '/Dog/';
  } else {
    basePath = `/${currentResource}/`;
  }
  const path = id ? `${basePath}${encodeURIComponent(id)}` : basePath;

  let body;
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(currentMethod);

  if (hasBody) {
    if (rawBody) {
      try {
        body = JSON.parse(rawBody);
      } catch (err) {
        showResponse('Invalid JSON body', { message: err.message }, true);
        return;
      }
    } else {
      body = {};
    }
  }

  sendRequest(path, currentMethod, hasBody ? body : undefined, tableSubmitButton, 'Table API');
});

// OwnerHasBreed form
breedForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const ownerName = breedOwnerInput.value.trim();
  const breed = breedNameInput.value.trim();

  const url = new URL('/OwnerHasBreed', window.location.origin);
  if (ownerName) url.searchParams.set('ownerName', ownerName);
  if (breed) url.searchParams.set('breed', breed);

  sendRequest(url.toString(), 'GET', undefined, breedSubmitButton, 'OwnerHasBreed')
    .then((result) => {
      if (!result) return;
      if (!result.ok) {
        updateBreedBadge(null);
      } else {
        updateBreedBadge(result.data);
      }
    });
});

// Initial state
showResponse('Ready', { message: 'Use the controls above to talk to your Harper API.' });
updateBreedBadge(null);
