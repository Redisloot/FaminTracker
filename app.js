const API = "https://script.google.com/macros/s/AKfycbxcBFQcxJWPd76FvPXucmw6CdFZ-gGdC1ZSePykOPApAxekHbd2B4Wnz-3as1UJlafW/exec";
let people = [];

fetch(API)
  .then(r => r.json())
  .then(r => {
    people = r.data;
    drawTree();
  });

function drawTree() {
  if (people.length === 0) return;

  const rootPerson =
    people.find(p => JSON.parse(p.parent_ids || "[]").length === 0)
    || people[0];

  const map = Object.fromEntries(people.map(p => [p.id, p]));

  function node(p) {
    return {
      name: p.full_name,
      data: p,
      children: JSON.parse(p.child_ids || "[]")
        .map(id => map[id])
        .filter(Boolean)
        .map(node)
    };
  }

  const root = d3.hierarchy(node(rootPerson));
  const tree = d3.tree().nodeSize([120, 180]);
  tree(root);

  const svg = d3.select("#tree");
  svg.selectAll("*").remove();

  const g = svg.append("g");
  svg.call(d3.zoom().on("zoom", e => g.attr("transform", e.transform)));

  g.selectAll(".link")
    .data(root.links())
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", d3.linkVertical()
      .x(d => d.x)
      .y(d => d.y)
    );

  const n = g.selectAll(".node")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.x},${d.y})`)
    .on("click", (_, d) => view(d.data.data));

  n.append("circle").attr("r", 30);
  n.append("text").attr("dy", 5).text(d => d.data.name);
}

function view(p) {
  document.getElementById("viewName").textContent = p.full_name;
  document.getElementById("viewBio").textContent = p.bio || "";
  document.getElementById("viewPhoto").src = p.photo_url || "";
  document.getElementById("viewModal").classList.remove("hidden");
}

function closeView() {
  document.getElementById("viewModal").classList.add("hidden");
}

document.getElementById("addBtn").onclick = () =>
  document.getElementById("formModal").classList.remove("hidden");

function closeForm() {
  document.getElementById("formModal").classList.add("hidden");
}

async function save() {
  const name = document.getElementById("nameInput").value.trim();
  if (!name) {
    alert("Name is required");
    return;
  }

  const bio = document.getElementById("bioInput").value;
  const file = document.getElementById("photoInput").files[0];

  let photoUrl = "";

  if (file) {
    const b64 = await toBase64(file);

    const upload = await fetch(API, {
      method: "POST",
      body: JSON.stringify({
        action: "upload",
        file: b64,
        type: file.type,
        name: file.name
      })
    }).then(r => r.json());

    photoUrl = upload.url;
  }

  await fetch(API, {
    method: "POST",
    body: JSON.stringify({
      action: "save",
      id: crypto.randomUUID(),
      full_name: name,
      bio: bio,
      photo_url: photoUrl
    })
  });

  location.reload();
}

function toBase64(file) {
  return new Promise(res => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.readAsDataURL(file);
  });
}



