const API_URL = "https://script.google.com/macros/s/AKfycbxk_igWWM4S7D8mjh5qveVTui-UKk9vsr6SQz6Iu3EJ6kvONUCsoAuiKCmXg6kqW-Zs/exec";

fetch(API_URL)
  .then(r => r.json())
  .then(res => renderTree(res.data));

function renderTree(data) {
  const container = document.getElementById("tree-container");
  data.forEach(person => {
    const div = document.createElement("div");
    div.className = "node";
    div.textContent = person.full_name;
    div.onclick = () => openModal(person);
    container.appendChild(div);
  });
}

function openModal(person) {
  document.getElementById("name").textContent = person.full_name;
  document.getElementById("bio").textContent = person.bio;
  document.getElementById("photo").src = person.photo_url;
  document.getElementById("modal").classList.remove("hidden");
}

document.getElementById("close").onclick = () =>
  document.getElementById("modal").classList.add("hidden");

