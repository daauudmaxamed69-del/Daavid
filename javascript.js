// ── DATA STORE ──
const DB = {
  donors: [
    {id:1,fname:"Amira",lname:"Mohamoud",blood:"O+",age:28,gender:"Female",phone:"+252 63 410 0001",location:"Hargeisa Central",lastdon:"2024-11-12",avail:"Available",notes:""},
    {id:2,fname:"Farah",lname:"Khadar",blood:"A+",age:32,gender:"Male",phone:"+252 63 410 0002",location:"Hodan District",lastdon:"2024-09-05",avail:"Available",notes:""},
    {id:3,fname:"Mohamed",lname:"Moalim",blood:"B-",age:24,gender:"Male",phone:"+252 63 410 0003",location:"Sha'ab Area",lastdon:"2025-01-20",avail:"Busy",notes:"Recent donation"},
    {id:4,fname:"Zamzam",lname:"Ahmed",blood:"AB+",age:30,gender:"Female",phone:"+252 63 410 0004",location:"Jigjiga Yar",lastdon:"2024-12-01",avail:"Available",notes:""},
    {id:5,fname:"Nasro",lname:"Warsame",blood:"O-",age:22,gender:"Female",phone:"+252 63 410 0005",location:"26 June District",lastdon:"2024-10-14",avail:"Available",notes:"Universal donor"},
    {id:6,fname:"Abdi",lname:"Samatar",blood:"B+",age:35,gender:"Male",phone:"+252 63 410 0006",location:"Mohamoud Haibe",lastdon:"2025-02-28",avail:"Busy",notes:""},
  ],
  hospitals: [
    {id:1,name:"Hargeisa Group Hospital",type:"Public",city:"Hargeisa",contact:"Dr. Ahmed Farah",phone:"+252 63 420 0001",email:"info@hgh.so",address:"Airport Road, Hargeisa"},
    {id:2,name:"Edna Adan Hospital",type:"Private",city:"Hargeisa",contact:"Dr. Edna Adan",phone:"+252 63 420 0002",email:"info@ednahospital.so",address:"Western Hargeisa"},
    {id:3,name:"Manhal Hospital",type:"Private",city:"Hargeisa",contact:"Dr. Omar Hussein",phone:"+252 63 420 0003",email:"info@manhal.so",address:"Sha'ab, Hargeisa"},
    {id:4,name:"Berbera Referral Hospital",type:"Public",city:"Berbera",contact:"Dr. Sahra Ibrahim",phone:"+252 63 420 0004",email:"berbera@gov.so",address:"Main St, Berbera"},
  ],
  requests: [
    {id:1,hospital:"Hargeisa Group Hospital",blood:"O-",units:3,urgency:"Emergency",status:"Urgent",date:"2025-04-28",notes:"Emergency surgery"},
    {id:2,hospital:"Edna Adan Hospital",blood:"A+",units:2,urgency:"Standard",status:"Approved",date:"2025-04-29",notes:"Scheduled operation"},
    {id:3,hospital:"Manhal Hospital",blood:"B+",units:1,urgency:"Urgent",status:"Pending",date:"2025-04-30",notes:""},
    {id:4,hospital:"Berbera Referral Hospital",blood:"AB+",units:2,urgency:"Standard",status:"Pending",date:"2025-05-01",notes:"Elective"},
    {id:5,hospital:"Hargeisa Group Hospital",blood:"O+",units:4,urgency:"Standard",status:"Completed",date:"2025-04-20",notes:""},
  ],
  nextId: { donors: 7, hospitals: 5, requests: 6 }
};

let editTarget = { type: null, id: null };

// ── SPLASH ──
window.onload = function() {
  const msgs = ["Connecting to database…","Loading donor registry…","System ready."];
  let i = 0;
  const pct = document.getElementById('splash-pct');
  const interval = setInterval(() => { if(i < msgs.length) pct.textContent = msgs[i++]; }, 700);
  setTimeout(() => {
    clearInterval(interval);
    document.getElementById('splash').classList.add('fade-out');
    setTimeout(() => {
      document.getElementById('splash').style.display = 'none';
      document.getElementById('login-screen').classList.add('show');
    }, 600);
  }, 2400);
};

// ── AUTH ──
function doLogin() {
  const u = document.getElementById('login-user').value.trim();
  const p = document.getElementById('login-pass').value;
  const err = document.getElementById('login-error');
  if(u === 'admin' && p === 'admin123') {
    document.getElementById('login-screen').classList.remove('show');
    document.getElementById('app').classList.add('show');
    renderAll();
  } else {
    err.style.display = 'block';
    setTimeout(() => err.style.display = 'none', 3000);
  }
}

document.getElementById('login-pass').addEventListener('keydown', e => { if(e.key==='Enter') doLogin(); });
document.getElementById('login-user').addEventListener('keydown', e => { if(e.key==='Enter') doLogin(); });

function doLogout() {
  document.getElementById('app').classList.remove('show');
  document.getElementById('login-user').value = '';
  document.getElementById('login-pass').value = '';
  document.getElementById('login-screen').classList.add('show');
}

// ── NAVIGATION ──
function navigate(page, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  el.classList.add('active');
  const titles = {dashboard:'Dashboard',donors:'Donors',hospitals:'Hospitals',requests:'Blood Requests',settings:'Settings'};
  document.getElementById('topbar-title').textContent = titles[page] || page;
  if(page==='donors') renderDonors();
  if(page==='hospitals') renderHospitals();
  if(page==='requests') renderRequests();
  if(page==='dashboard') renderDashboard();
}

// ── RENDER ALL ──
function renderAll() {
  updateBadges();
  renderDashboard();
  renderDonors();
  renderHospitals();
  renderRequests();
}

function updateBadges() {
  document.getElementById('badge-donors').textContent = DB.donors.length;
  document.getElementById('badge-hospitals').textContent = DB.hospitals.length;
  document.getElementById('badge-requests').textContent = DB.requests.filter(r=>r.status==='Pending'||r.status==='Urgent').length;
}

// ── DASHBOARD ──
function renderDashboard() {
  document.getElementById('stat-donors').textContent = DB.donors.length;
  document.getElementById('stat-hospitals').textContent = DB.hospitals.length;
  document.getElementById('stat-requests').textContent = DB.requests.filter(r=>r.status==='Pending'||r.status==='Urgent').length;
  document.getElementById('stat-completed').textContent = DB.requests.filter(r=>r.status==='Completed').length;
  document.getElementById('stat-donors-delta').textContent = DB.donors.filter(d=>d.avail==='Available').length + ' available';
  document.getElementById('stat-hospitals-delta').textContent = DB.hospitals.length + ' registered';
  document.getElementById('stat-requests-delta').textContent = DB.requests.filter(r=>r.urgency==='Emergency').length + ' emergency';
  document.getElementById('stat-completed-delta').textContent = 'All time';

  // Recent donors
  const recent = DB.donors.slice(-4).reverse();
  document.getElementById('dash-recent-donors').innerHTML = recent.map(d => `
    <div class="mini-row">
      <div class="mini-avatar" style="background:${avatarColor(d.blood)};color:white">${d.fname[0]}${d.lname[0]}</div>
      <div class="mini-info">
        <div class="mini-name">${d.fname} ${d.lname}</div>
        <div class="mini-sub">${d.location}</div>
      </div>
      <span class="badge badge-blood">${d.blood}</span>
      <span class="badge ${d.avail==='Available'?'badge-avail':'badge-busy'}">${d.avail}</span>
    </div>`).join('');

  // Recent requests
  const recentReq = DB.requests.slice(-4).reverse();
  document.getElementById('dash-recent-requests').innerHTML = recentReq.map(r => `
    <div class="mini-row">
      <div class="mini-avatar" style="background:var(--red-light);color:var(--red-dark);font-size:11px;font-weight:700">${r.blood}</div>
      <div class="mini-info">
        <div class="mini-name">${r.hospital}</div>
        <div class="mini-sub">${r.units} units · ${r.urgency}</div>
      </div>
      <span class="badge badge-${r.status.toLowerCase()}">${r.status}</span>
    </div>`).join('');

  // Blood bars
  const groups = ['O+','A+','B+','AB+','O-','A-','B-','AB-'];
  const max = Math.max(...groups.map(g => DB.donors.filter(d=>d.blood===g).length)) || 1;
  document.getElementById('dash-blood-bars').innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 32px">${
    groups.map(g => {
      const cnt = DB.donors.filter(d=>d.blood===g).length;
      return `<div class="bar-group"><div class="bar-meta"><span class="bar-meta-label">${g}</span><span class="bar-meta-count">${cnt}</span></div><div class="bar-track"><div class="bar-fill" style="width:${Math.round(cnt/max*100)}%"></div></div></div>`;
    }).join('')
  }</div>`;
}

function avatarColor(blood) {
  const m = {'O+':'#C8102E','A+':'#0C447C','B+':'#085041','AB+':'#712B13','O-':'#3C3489','A-':'#633806','B-':'#27500A','AB-':'#4A1B0C'};
  return m[blood] || '#888';
}

// ── DONORS ──
function renderDonors() {
  const q = (document.getElementById('donor-search').value||'').toLowerCase();
  const bf = document.getElementById('donor-blood-filter').value;
  const af = document.getElementById('donor-avail-filter').value;
  const gf = document.getElementById('donor-gender-filter').value;
  const filtered = DB.donors.filter(d => {
    const name = (d.fname+' '+d.lname).toLowerCase();
    return (!q || name.includes(q) || d.location.toLowerCase().includes(q) || d.phone.includes(q))
      && (!bf || d.blood===bf) && (!af || d.avail===af) && (!gf || d.gender===gf);
  });
  const tbody = document.getElementById('donors-tbody');
  if(!filtered.length) { tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-text">No donors match your filters</div></div></td></tr>`; return; }
  tbody.innerHTML = filtered.map((d,i) => `
    <tr>
      <td>${i+1}</td>
      <td class="td-name">${d.fname} ${d.lname}</td>
      <td><span class="badge badge-blood">${d.blood}</span></td>
      <td>${d.age}</td>
      <td>${d.gender}</td>
      <td>${d.phone}</td>
      <td>${d.location}</td>
      <td><span class="badge ${d.avail==='Available'?'badge-avail':'badge-busy'}">${d.avail}</span></td>
      <td><div class="action-btns">
        <button class="btn btn-outline btn-sm btn-icon" title="Edit" onclick="editDonor(${d.id})">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="btn btn-danger btn-sm btn-icon" title="Delete" onclick="confirmDelete('donor',${d.id},'${d.fname} ${d.lname}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
        </button>
      </div></td>
    </tr>`).join('');
}

function openDonorModal(donor) {
  editTarget = { type: null, id: null };
  document.getElementById('donor-modal-title').textContent = 'Add Donor';
  ['fname','lname','phone','location','notes'].forEach(f => document.getElementById('d-'+f).value = donor ? donor[f] : '');
  document.getElementById('d-blood').value = donor ? donor.blood : 'O+';
  document.getElementById('d-age').value = donor ? donor.age : '';
  document.getElementById('d-gender').value = donor ? donor.gender : 'Male';
  document.getElementById('d-avail').value = donor ? donor.avail : 'Available';
  document.getElementById('d-lastdon').value = donor ? donor.lastdon : '';
  document.getElementById('donor-modal').classList.add('show');
}

function editDonor(id) {
  const d = DB.donors.find(x=>x.id===id);
  if(!d) return;
  editTarget = { type: 'donor', id };
  document.getElementById('donor-modal-title').textContent = 'Edit Donor';
  document.getElementById('d-fname').value = d.fname;
  document.getElementById('d-lname').value = d.lname;
  document.getElementById('d-blood').value = d.blood;
  document.getElementById('d-age').value = d.age;
  document.getElementById('d-gender').value = d.gender;
  document.getElementById('d-phone').value = d.phone;
  document.getElementById('d-location').value = d.location;
  document.getElementById('d-avail').value = d.avail;
  document.getElementById('d-lastdon').value = d.lastdon;
  document.getElementById('d-notes').value = d.notes;
  document.getElementById('donor-modal').classList.add('show');
}

function saveDonor() {
  const fname = document.getElementById('d-fname').value.trim();
  const lname = document.getElementById('d-lname').value.trim();
  if(!fname || !lname) { showToast('Please fill in the name fields','red'); return; }
  const data = {
    fname, lname,
    blood: document.getElementById('d-blood').value,
    age: parseInt(document.getElementById('d-age').value) || 0,
    gender: document.getElementById('d-gender').value,
    phone: document.getElementById('d-phone').value.trim(),
    location: document.getElementById('d-location').value.trim(),
    avail: document.getElementById('d-avail').value,
    lastdon: document.getElementById('d-lastdon').value,
    notes: document.getElementById('d-notes').value.trim()
  };
  if(editTarget.type === 'donor') {
    const idx = DB.donors.findIndex(x=>x.id===editTarget.id);
    DB.donors[idx] = { ...DB.donors[idx], ...data };
    showToast('Donor updated successfully');
  } else {
    DB.donors.push({ id: DB.nextId.donors++, ...data });
    showToast('Donor added successfully');
  }
  closeModal('donor-modal');
  renderDonors();
  updateBadges();
  renderDashboard();
}

// ── HOSPITALS ──
function renderHospitals() {
  const q = (document.getElementById('hospital-search').value||'').toLowerCase();
  const tf = document.getElementById('hospital-type-filter').value;
  const filtered = DB.hospitals.filter(h =>
    (!q || h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q) || h.contact.toLowerCase().includes(q))
    && (!tf || h.type===tf)
  );
  const tbody = document.getElementById('hospitals-tbody');
  if(!filtered.length) { tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">🏥</div><div class="empty-text">No hospitals found</div></div></td></tr>`; return; }
  tbody.innerHTML = filtered.map((h,i) => `
    <tr>
      <td>${i+1}</td>
      <td class="td-name">${h.name}</td>
      <td><span class="badge" style="background:${h.type==='Public'?'#EAF3DE':h.type==='Private'?'#E6F1FB':'#FAEEDA'};color:${h.type==='Public'?'#27500A':h.type==='Private'?'#0C447C':'#633806'}">${h.type}</span></td>
      <td>${h.city}</td>
      <td>${h.contact}</td>
      <td>${h.phone}</td>
      <td style="color:var(--text2);font-size:12px">${h.email}</td>
      <td><div class="action-btns">
        <button class="btn btn-outline btn-sm btn-icon" title="Edit" onclick="editHospital(${h.id})">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="btn btn-danger btn-sm btn-icon" title="Delete" onclick="confirmDelete('hospital',${h.id},'${h.name}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
        </button>
      </div></td>
    </tr>`).join('');
}

function openHospitalModal() {
  editTarget = { type: null, id: null };
  document.getElementById('hospital-modal-title').textContent = 'Add Hospital';
  ['name','city','contact','phone','email','address'].forEach(f => document.getElementById('h-'+f).value = '');
  document.getElementById('h-type').value = 'Public';
  document.getElementById('hospital-modal').classList.add('show');
}

function editHospital(id) {
  const h = DB.hospitals.find(x=>x.id===id);
  if(!h) return;
  editTarget = { type: 'hospital', id };
  document.getElementById('hospital-modal-title').textContent = 'Edit Hospital';
  document.getElementById('h-name').value = h.name;
  document.getElementById('h-type').value = h.type;
  document.getElementById('h-city').value = h.city;
  document.getElementById('h-contact').value = h.contact;
  document.getElementById('h-phone').value = h.phone;
  document.getElementById('h-email').value = h.email;
  document.getElementById('h-address').value = h.address;
  document.getElementById('hospital-modal').classList.add('show');
}

function saveHospital() {
  const name = document.getElementById('h-name').value.trim();
  if(!name) { showToast('Please enter hospital name','red'); return; }
  const data = {
    name,
    type: document.getElementById('h-type').value,
    city: document.getElementById('h-city').value.trim(),
    contact: document.getElementById('h-contact').value.trim(),
    phone: document.getElementById('h-phone').value.trim(),
    email: document.getElementById('h-email').value.trim(),
    address: document.getElementById('h-address').value.trim()
  };
  if(editTarget.type === 'hospital') {
    const idx = DB.hospitals.findIndex(x=>x.id===editTarget.id);
    DB.hospitals[idx] = { ...DB.hospitals[idx], ...data };
    showToast('Hospital updated successfully');
  } else {
    DB.hospitals.push({ id: DB.nextId.hospitals++, ...data });
    showToast('Hospital added successfully');
  }
  closeModal('hospital-modal');
  renderHospitals();
  updateBadges();
  renderDashboard();
}

// ── REQUESTS ──
function renderRequests() {
  const q = (document.getElementById('request-search').value||'').toLowerCase();
  const sf = document.getElementById('request-status-filter').value;
  const bf = document.getElementById('request-blood-filter').value;
  const filtered = DB.requests.filter(r =>
    (!q || r.hospital.toLowerCase().includes(q) || r.blood.toLowerCase().includes(q))
    && (!sf || r.status===sf) && (!bf || r.blood===bf)
  );
  const tbody = document.getElementById('requests-tbody');
  if(!filtered.length) { tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">📋</div><div class="empty-text">No requests found</div></div></td></tr>`; return; }
  tbody.innerHTML = filtered.map((r,i) => `
    <tr>
      <td>${i+1}</td>
      <td class="td-name">${r.hospital}</td>
      <td><span class="badge badge-blood">${r.blood}</span></td>
      <td>${r.units}</td>
      <td><span class="badge" style="background:${r.urgency==='Emergency'?'var(--red-light)':r.urgency==='Urgent'?'var(--warn-bg)':'#F0FDF4'};color:${r.urgency==='Emergency'?'var(--red-dark)':r.urgency==='Urgent'?'var(--warn)':'#166534'}">${r.urgency}</span></td>
      <td><span class="badge badge-${r.status.toLowerCase()}">${r.status}</span></td>
      <td style="font-size:12px;color:var(--text2)">${r.date}</td>
      <td><div class="action-btns">
        <button class="btn btn-outline btn-sm btn-icon" title="Edit" onclick="editRequest(${r.id})">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="btn btn-danger btn-sm btn-icon" title="Delete" onclick="confirmDelete('request',${r.id},'blood request #${r.id}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
        </button>
      </div></td>
    </tr>`).join('');
}

function openRequestModal() {
  editTarget = { type: null, id: null };
  document.getElementById('request-modal-title').textContent = 'New Blood Request';
  const sel = document.getElementById('r-hospital');
  sel.innerHTML = '<option value="">Select hospital…</option>' + DB.hospitals.map(h=>`<option>${h.name}</option>`).join('');
  document.getElementById('r-units').value = 2;
  document.getElementById('r-blood').value = 'O+';
  document.getElementById('r-urgency').value = 'Standard';
  document.getElementById('r-status').value = 'Pending';
  document.getElementById('r-notes').value = '';
  document.getElementById('request-modal').classList.add('show');
}

function editRequest(id) {
  const r = DB.requests.find(x=>x.id===id);
  if(!r) return;
  editTarget = { type: 'request', id };
  document.getElementById('request-modal-title').textContent = 'Edit Request';
  const sel = document.getElementById('r-hospital');
  sel.innerHTML = '<option value="">Select hospital…</option>' + DB.hospitals.map(h=>`<option>${h.name}</option>`).join('');
  sel.value = r.hospital;
  document.getElementById('r-blood').value = r.blood;
  document.getElementById('r-units').value = r.units;
  document.getElementById('r-urgency').value = r.urgency;
  document.getElementById('r-status').value = r.status;
  document.getElementById('r-notes').value = r.notes;
  document.getElementById('request-modal').classList.add('show');
}

function saveRequest() {
  const hospital = document.getElementById('r-hospital').value;
  if(!hospital) { showToast('Please select a hospital','red'); return; }
  const data = {
    hospital,
    blood: document.getElementById('r-blood').value,
    units: parseInt(document.getElementById('r-units').value) || 1,
    urgency: document.getElementById('r-urgency').value,
    status: document.getElementById('r-status').value,
    date: new Date().toISOString().split('T')[0],
    notes: document.getElementById('r-notes').value.trim()
  };
  if(editTarget.type === 'request') {
    const idx = DB.requests.findIndex(x=>x.id===editTarget.id);
    DB.requests[idx] = { ...DB.requests[idx], ...data };
    showToast('Request updated successfully');
  } else {
    DB.requests.push({ id: DB.nextId.requests++, ...data });
    showToast('Request created successfully');
  }
  closeModal('request-modal');
  renderRequests();
  updateBadges();
  renderDashboard();
}

// ── DELETE ──
function confirmDelete(type, id, label) {
  document.getElementById('confirm-msg').textContent = `Delete "${label}"? This cannot be undone.`;
  document.getElementById('confirm-ok-btn').onclick = function() {
    if(type==='donor') DB.donors = DB.donors.filter(x=>x.id!==id);
    else if(type==='hospital') DB.hospitals = DB.hospitals.filter(x=>x.id!==id);
    else if(type==='request') DB.requests = DB.requests.filter(x=>x.id!==id);
    closeModal('confirm-modal');
    renderAll();
    showToast('Record deleted','red');
  };
  document.getElementById('confirm-modal').classList.add('show');
}

// ── MODALS ──
function closeModal(id) { document.getElementById(id).classList.remove('show'); }
document.querySelectorAll('.modal-overlay').forEach(o => o.addEventListener('click', e => { if(e.target===o) o.classList.remove('show'); }));

// ── SETTINGS TABS ──
function setSettingsTab(tab, el) {
  document.querySelectorAll('.settings-section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.settings-nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('settings-'+tab).classList.add('active');
  el.classList.add('active');
}

// ── GLOBAL SEARCH ──
function globalSearch(q) {
  if(!q) return;
  const lq = q.toLowerCase();
  const inDonors = DB.donors.some(d=>(d.fname+' '+d.lname).toLowerCase().includes(lq)||d.blood.toLowerCase()===lq);
  const inHospitals = DB.hospitals.some(h=>h.name.toLowerCase().includes(lq));
  if(inDonors) { document.getElementById('donor-search').value = q; navigate('donors', document.querySelectorAll('.nav-item')[1]); renderDonors(); }
  else if(inHospitals) { document.getElementById('hospital-search').value = q; navigate('hospitals', document.querySelectorAll('.nav-item')[2]); renderHospitals(); }
}

// ── TOAST ──
function showToast(msg, type) {
  document.getElementById('toast-msg').textContent = msg;
  document.getElementById('toast-dot').className = 'toast-dot' + (type==='red'?' red':'');
  const t = document.getElementById('toast');
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 3000);
}