document.addEventListener('DOMContentLoaded', () => {
  const loginScreen = document.getElementById('login-screen');
  const dashboardScreen = document.getElementById('dashboard-screen');
  const loginBtn = document.getElementById('login-btn');
  const passwordInput = document.getElementById('admin-password');
  const loginError = document.getElementById('login-error');
  const logoutBtn = document.getElementById('logout-btn');
  
  let authToken = localStorage.getItem('vortex_admin_token') || null;
  let leadsData = [];
  let notesData = [];

  // Initialize
  if (authToken) {
    showDashboard();
  }

  // --- LOGIN LOGIC ---
  loginBtn.addEventListener('click', () => {
    const pwd = passwordInput.value;
    if (pwd === 'vortex2026') {
      authToken = 'Bearer ' + pwd;
      localStorage.setItem('vortex_admin_token', authToken);
      loginError.style.display = 'none';
      showDashboard();
    } else {
      loginError.style.display = 'block';
    }
  });

  logoutBtn.addEventListener('click', () => {
    authToken = null;
    localStorage.removeItem('vortex_admin_token');
    dashboardScreen.classList.remove('active');
    loginScreen.classList.add('active');
    passwordInput.value = '';
  });

  function showDashboard() {
    loginScreen.classList.remove('active');
    dashboardScreen.classList.add('active');
    loadAllData();
  }

  // --- TABS LOGIC ---
  const navItems = document.querySelectorAll('.sidebar .nav li');
  const tabContents = document.querySelectorAll('.tab-content');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove active from all
      navItems.forEach(nav => nav.classList.remove('active'));
      tabContents.forEach(tab => tab.classList.remove('active'));
      
      // Add active to clicked
      item.classList.add('active');
      const targetId = item.getAttribute('data-tab');
      document.getElementById(targetId).classList.add('active');

      if (targetId === 'tab-dashboard') initCharts();
    });
  });

  // --- FETCH DATA ---
  async function loadAllData() {
    await fetchLeads();
    await fetchNotes();
    initCharts(); // Inicia graficos caso a aba principal esteja ativa
  }

  // --- LEADS MODULE ---
  const refreshBtn = document.getElementById('refresh-btn');
  const leadsBody = document.getElementById('leads-body');

  refreshBtn.addEventListener('click', async () => {
    refreshBtn.innerHTML = '<i class="fa-solid fa-sync fa-spin"></i>';
    await fetchLeads();
    setTimeout(() => { refreshBtn.innerHTML = '<i class="fa-solid fa-sync"></i> Atualizar Dados'; }, 500);
  });

  function fetchLeads() {
    return new Promise((resolve) => {
      db.collection('leads').orderBy('created_at', 'desc').onSnapshot(snapshot => {
        leadsData = [];
        snapshot.forEach(doc => {
          leadsData.push({ id: doc.id, ...doc.data() });
        });
        renderLeads();
        resolve();
      }, err => {
        console.error('Erro ao buscar leads do Firestore:', err);
      });
    });
  }

  function renderLeads() {
    leadsBody.innerHTML = '';
    let budgetCount = 0;
    let contactCount = 0;
    let potentialRev = 0;

    leadsData.forEach(lead => {
      if (lead.type === 'budget') {
        budgetCount++;
        try {
          const d = JSON.parse(lead.details);
          if(d.total) potentialRev += d.total;
        } catch(e) {}
      }
      if (lead.type === 'contact') contactCount++;

      const tr = document.createElement('tr');
      const date = new Date(lead.created_at);
      const dateStr = date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
      
      const typeBadge = lead.type === 'budget' ? '<span class="badge budget">Orçamento</span>' : '<span class="badge contact">Contato</span>';
      const statusBadge = lead.status === 'novo' ? '<span class="badge novo">Novo</span>' : '<span class="badge atendido">Atendido</span>';

      let detailsHtml = '';
      if (lead.type === 'budget' && lead.details) {
        try {
          const d = JSON.parse(lead.details);
          detailsHtml = `<div style="font-size: 13px;"><strong>${d.typeName}</strong><br><span style="color:var(--primary);">R$ ${d.total.toLocaleString('pt-BR')}</span></div>`;
        } catch(e) {}
      } else if (lead.type === 'contact') {
        detailsHtml = `<div style="font-size: 13px;"><strong>${lead.company || 'S/ Empresa'}</strong><br><span style="color:var(--text-muted);">${lead.message.substring(0, 30)}...</span></div>`;
      }

      const wppClean = lead.whatsapp ? lead.whatsapp.replace(/\D/g, '') : '';
      let wppBtn = '-';
      if (wppClean) {
        let msg = lead.type === 'budget' ? 'Olá! Vi que você fez uma simulação no site da Vortex.' : 'Olá! Recebi seu contato pelo site da Vortex.';
        wppBtn = `<a href="https://wa.me/55${wppClean}?text=${encodeURIComponent(msg)}" target="_blank" class="whatsapp-btn"><i class="fa-brands fa-whatsapp"></i> Chamar</a>`;
      }

      tr.innerHTML = `
        <td>
          <select class="status-select" data-id="${lead.id}" style="background:transparent; border:1px solid var(--border); color:white; border-radius:4px; padding:4px;">
            <option value="novo" ${lead.status==='novo'?'selected':''}>Novo</option>
            <option value="atendido" ${lead.status==='atendido'?'selected':''}>Atendido</option>
          </select>
        </td>
        <td style="font-size: 12px; color: var(--text-muted);">${dateStr}</td>
        <td><strong>${lead.name}</strong></td>
        <td>${typeBadge}</td>
        <td>${detailsHtml}</td>
        <td>${wppBtn}</td>
      `;
      leadsBody.appendChild(tr);
    });

    document.getElementById('stat-budgets').innerText = budgetCount;
    document.getElementById('stat-contacts').innerText = contactCount;
    document.getElementById('stat-revenue').innerText = 'R$ ' + potentialRev.toLocaleString('pt-BR');

    document.querySelectorAll('.status-select').forEach(select => {
      select.addEventListener('change', async (e) => {
        const id = e.target.dataset.id;
        const newStatus = e.target.value;
        await db.collection('leads').doc(id).update({ status: newStatus });
      });
    });
  }

  // --- CHARTS MODULE ---
  let leadsChartInstance = null;
  let typeChartInstance = null;

  function initCharts() {
    if (!document.getElementById('tab-dashboard').classList.contains('active')) return;
    
    // Process Data for charts
    const budgetCount = leadsData.filter(l => l.type === 'budget').length;
    const contactCount = leadsData.filter(l => l.type === 'contact').length;
    
    // Bar Chart
    const ctxLeads = document.getElementById('leadsChart').getContext('2d');
    if (leadsChartInstance) leadsChartInstance.destroy();
    leadsChartInstance = new Chart(ctxLeads, {
      type: 'bar',
      data: {
        labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'],
        datasets: [{
          label: 'Interações (Simulação)',
          data: [1, 3, 2, Math.max(0, budgetCount+contactCount), 0, 0, 0], // Mock misturado com real para visual
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' } }, x: { grid: { display: false } } }, plugins: { legend: { labels: { color: '#fff' } } } }
    });

    // Doughnut Chart
    const ctxType = document.getElementById('typeChart').getContext('2d');
    if (typeChartInstance) typeChartInstance.destroy();
    typeChartInstance = new Chart(ctxType, {
      type: 'doughnut',
      data: {
        labels: ['One Page', 'Painel Admin', 'Combos'],
        datasets: [{
          data: [budgetCount > 0 ? budgetCount : 5, 2, 1], // fallback visual
          backgroundColor: ['#3b82f6', '#a855f7', '#10b981'],
          borderWidth: 0
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#fff' } } }, cutout: '75%' }
    });
  }

  // --- KANBAN MODULE ---
  const saveNoteBtn = document.getElementById('save-note-btn');
  const newNoteInput = document.getElementById('new-note-input');
  
  const colTodo = document.querySelector('#kanban-todo .kanban-col-body');
  const colDoing = document.querySelector('#kanban-doing .kanban-col-body');
  const colDone = document.querySelector('#kanban-done .kanban-col-body');

  function fetchNotes() {
    return new Promise((resolve) => {
      db.collection('notes').orderBy('created_at', 'desc').onSnapshot(snapshot => {
        notesData = [];
        snapshot.forEach(doc => {
          notesData.push({ id: doc.id, ...doc.data() });
        });
        renderKanban();
        resolve();
      });
    });
  }

  saveNoteBtn.addEventListener('click', async () => {
    const content = newNoteInput.value.trim();
    if (!content) return;

    saveNoteBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    try {
      await db.collection('notes').add({
        content: content,
        status: 'todo',
        created_at: firebase.firestore.FieldValue.serverTimestamp()
      });
      newNoteInput.value = '';
    } catch (err) {
      console.error(err);
    }
    saveNoteBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Nova Anotação';
  });

  function renderKanban() {
    colTodo.innerHTML = '';
    colDoing.innerHTML = '';
    colDone.innerHTML = '';

    notesData.forEach(note => {
      const div = document.createElement('div');
      div.className = 'kanban-card';
      div.setAttribute('draggable', 'true');
      div.setAttribute('data-id', note.id);
      
      const date = new Date(note.created_at).toLocaleDateString('pt-BR');
      
      div.innerHTML = `
        <i class="fa-solid fa-trash delete-note" data-id="${note.id}"></i>
        <p>${note.content.replace(/\n/g, '<br>')}</p>
        <div class="kanban-card-date"><i class="fa-regular fa-clock"></i> ${date}</div>
      `;

      // Drag events
      div.addEventListener('dragstart', (e) => {
        div.classList.add('dragging');
        e.dataTransfer.setData('text/plain', note.id);
      });
      
      div.addEventListener('dragend', () => {
        div.classList.remove('dragging');
      });

      // Distribute based on status
      if (note.status === 'done') colDone.appendChild(div);
      else if (note.status === 'doing') colDoing.appendChild(div);
      else colTodo.appendChild(div);
    });

    document.querySelectorAll('.delete-note').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (!confirm('Apagar esta anotação?')) return;
        const id = e.target.dataset.id;
        await db.collection('notes').doc(id).delete();
      });
    });
  }

  // Set up Dropzones
  document.querySelectorAll('.dropzone').forEach(zone => {
    zone.addEventListener('dragover', e => {
      e.preventDefault(); // Necessary to allow dropping
      zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', () => {
      zone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', async e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      
      const id = e.dataTransfer.getData('text/plain');
      const draggedElement = document.querySelector(`.kanban-card[data-id="${id}"]`);
      if (draggedElement) {
        zone.appendChild(draggedElement); // UI Update immediately for smooth UX
        
        const newStatus = zone.parentElement.getAttribute('data-status');
        
        // Update DB
        try {
          await db.collection('notes').doc(id).update({ status: newStatus });
        } catch(err) {
          console.error("Failed to update status", err);
          fetchNotes(); // Revert on failure
        }
      }
    });
  });

  // --- VORTEX AI (Robozinho) MODULE ---
  const aiMessage = document.getElementById('ai-message');
  const btnGetIdea = document.getElementById('btn-get-idea');
  let isTyping = false;

  const aiInsights = [
    "Dica de Copy: Troque 'Fazemos sites' por 'Transformamos visitantes em clientes em 5 segundos'. Foca no resultado, não no meio.",
    "Upsell de Manutenção: Quando entregar um site, ofereça R$150/mês para 'Hospedagem Premium + Backups de Segurança'. Gera receita recorrente.",
    "Estratégia de Prospecção: Procure empresas locais no Google Maps com sites lentos ou quebrados. Mande um vídeo de 1 minuto mostrando o erro e como a Vortex resolve.",
    "Dica de Fechamento: Se o cliente achar caro, não dê desconto. Em vez disso, divida o projeto em fases ou tire funcionalidades. Mantenha seu valor hora intacto.",
    "Escala com Templates: Tenha 3 arquiteturas base de código. Quando vender uma landing page, você não começa do zero, você personaliza os blocos. O lucro está na velocidade de entrega.",
    "Gatilho da Escassez: No final do orçamento, adicione: 'Esta proposta é válida por 5 dias, pois nossa esteira de desenvolvimento permite apenas X projetos simultâneos'.",
    "Estratégia de Portfólio: Não coloque 20 sites meia-boca no portfólio. Escolha os 3 melhores, faça um Estudo de Caso de cada um (Desafio -> Solução Vortex -> Resultado).",
    "Autoridade no Instagram: Em vez de postar print de site, poste você desenhando uma tela no Figma e explicando o PORQUE de cada botão. Mostre que a Vortex pensa no UX.",
    "O poder do SEO Local: Ofereça a configuração do 'Google Meu Negócio' de brinde para fechamentos acima de R$2.000. Custa 20 min do seu tempo e entrega um super valor pro cliente."
  ];

  btnGetIdea.addEventListener('click', () => {
    if (isTyping) return;
    
    // Choose random insight
    const randomIndex = Math.floor(Math.random() * aiInsights.length);
    const idea = aiInsights[randomIndex];
    
    // Typewriter effect
    aiMessage.innerHTML = '';
    aiMessage.classList.add('typing');
    isTyping = true;
    
    let i = 0;
    const speed = 30; // ms per char

    function typeWriter() {
      if (i < idea.length) {
        aiMessage.innerHTML += idea.charAt(i);
        i++;
        setTimeout(typeWriter, speed);
      } else {
        aiMessage.classList.remove('typing');
        isTyping = false;
      }
    }
    
    typeWriter();
  });

});
