const professionals = [
    {
        id: 'hortencio',
        name: 'Hortêncio Silva',
        role: 'Pedreiro',
        desc: 'Deus é amor. 30 anos de experiência, fiz o bar da Juquinha e sou perito em essencial piso e alvenaria. Trabalho com seriedade e qualidade, minha palavra vale mais que ...',
        rating: 8.4,
        reviews: 17,
        distance: '1.2 km',
        status: 'disponivel',
        experience: '30 anos de experiência',
        avatarBg: 'bg-orange',
        avatarIcon: '👱‍♂️',
        mapPos: { top: '30%', left: '20%' }
    },
    {
        id: 'jovelino',
        name: 'Jovelino Costa',
        role: 'Eletricista',
        desc: 'Ator pela profissão, 20 anos de profissional, faz tudo que é casado e sou o melhor em rabeta e elétrica em geral. Instalação de tomadas, disjuntores, chuveiros, ar-condic...',
        rating: 7.2,
        reviews: 9,
        distance: '0.8 km',
        status: 'disponivel',
        experience: '20 anos de experiência',
        avatarBg: 'bg-blue',
        avatarIcon: '⚡',
        mapPos: { top: '25%', left: '75%' }
    },
    {
        id: 'raimundo',
        name: 'Raimundo Figueiredo',
        role: 'Pintor',
        desc: 'Quer uma casa pode contar comigo, já estive por aqui construí 24 casas e ninguém tem mais experiência do que eu. 25 anos pintando, ergo um muro como ninguém. Es...',
        rating: 9.1,
        reviews: 31,
        distance: '2.5 km',
        status: 'ocupado',
        experience: '25 anos de experiência',
        avatarBg: 'bg-pink',
        avatarIcon: '🎨',
        mapPos: { top: '45%', left: '40%' }
    },
    {
        id: 'benedito',
        name: 'Benedito Araújo',
        role: 'Encanador',
        desc: 'Encanador especializado em conserto de vazamentos, instalação de caixas d\'água, desentupimentos e instalação de banheiros completos. Atendo em Cáceres e região.',
        rating: 6.8,
        reviews: 5,
        distance: '3.1 km',
        status: 'disponivel',
        experience: '12 anos de experiência',
        avatarBg: 'bg-slate',
        avatarIcon: '🔧',
        mapPos: { top: '60%', left: '85%' }
    },
    {
        id: 'claudia',
        name: 'Cláudia Mendes',
        role: 'Diarista',
        desc: '15 anos de experiência em limpeza residencial e comercial. Casa limpa é casa feliz! Limpeza pesada, pós-obra, organização de ambientes. Uso produtos de qualidade e s...',
        rating: 9.7,
        reviews: 48,
        distance: '0.5 km',
        status: 'disponivel',
        experience: '15 anos de experiência',
        avatarBg: 'bg-amber',
        avatarIcon: '✨',
        mapPos: { top: '70%', left: '55%' }
    },
    {
        id: 'ze',
        name: 'Zé Carpinteiro',
        role: 'Carpinteiro',
        desc: 'Marcos \'Zé\' Ferreira, carpinteiro com 18 anos de ofício. Faço móveis planejados, portas, janelas, pergolados e reformas em madeira. Trabalho sob medida com madeiras n...',
        rating: null,
        reviews: 0,
        distance: '4.0 km',
        status: 'disponivel',
        experience: '18 anos de experiência',
        avatarBg: 'bg-brown',
        avatarIcon: '🪵',
        mapPos: { top: '65%', left: '15%' }
    }
];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    renderProfessionalsList();
    renderMapNodes();
    setupNavigation();
    setupFilters();
    setupFormToggles();
});

function renderProfessionalsList() {
    const container = document.getElementById('professionals-list');
    container.innerHTML = professionals.map(prof => `
        <div class="prof-card">
            <div class="prof-avatar ${prof.avatarBg}">
                ${prof.avatarIcon}
            </div>
            <div class="prof-info">
                <div class="prof-header">
                    <div>
                        <h3 class="prof-name">${prof.name}</h3>
                        <div class="prof-role">${prof.role}</div>
                    </div>
                    <div class="prof-distance">${prof.distance}</div>
                </div>
                <p class="prof-desc">${prof.desc}</p>
                ${prof.rating ? `
                <div class="prof-rating">
                    <div class="stars">
                        <i class="ph-fill ph-star"></i>
                        <i class="ph-fill ph-star"></i>
                        <i class="ph-fill ph-star"></i>
                        <i class="ph-fill ph-star"></i>
                        <i class="ph-fill ph-star-half"></i>
                    </div>
                    <span class="score">${prof.rating}</span>
                    <span class="reviews">(${prof.reviews})</span>
                </div>
                ` : ''}
                <div class="prof-footer">
                    <div class="status-indicator">
                        <span class="status-dot ${prof.status}"></span>
                        <span class="status-text ${prof.status}">${prof.status === 'disponivel' ? 'Disponível' : 'Ocupado agora'}</span>
                    </div>
                    <span>•</span>
                    <span>${prof.experience}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function renderMapNodes() {
    const nodesContainer = document.getElementById('map-nodes-container');
    const scrollList = document.getElementById('map-scroll-list');

    // Render nodes on map
    nodesContainer.innerHTML = professionals.map(prof => `
        <div class="map-node ${prof.status === 'disponivel' ? 'available' : 'busy'}" 
             style="top: ${prof.mapPos.top}; left: ${prof.mapPos.left};"
             data-id="${prof.id}">
            <div class="node-label">
                ${prof.avatarIcon} ${prof.name.split(' ')[0]}
            </div>
            <div class="node-dot"></div>
        </div>
    `).join('');

    // Render horizontal scroll cards for map
    scrollList.innerHTML = professionals.map(prof => `
        <div class="map-card" data-id="${prof.id}">
            <div class="map-card-header">
                <div class="map-card-avatar ${prof.avatarBg}">
                    ${prof.avatarIcon}
                </div>
                <div>
                    <h4>${prof.name.split(' ')[0]}</h4>
                    <div class="role">${prof.role}</div>
                </div>
            </div>
            <div class="dist">
                <i class="ph-fill ph-map-pin"></i> ${prof.distance}
            </div>
        </div>
    `).join('');

    // Add interactivity to map cards
    const mapCards = scrollList.querySelectorAll('.map-card');
    const mapNodes = nodesContainer.querySelectorAll('.map-node');

    mapCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove active from all
            mapCards.forEach(c => c.classList.remove('active'));
            // Add to clicked
            card.classList.add('active');
            
            // Highlight node (optional enhancement)
            const id = card.getAttribute('data-id');
            mapNodes.forEach(node => {
                if(node.getAttribute('data-id') === id) {
                    node.style.transform = 'translate(-50%, -50%) scale(1.2)';
                    node.style.zIndex = '20';
                } else {
                    node.style.transform = 'translate(-50%, -50%) scale(1)';
                    node.style.zIndex = '5';
                }
            });
        });
    });
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active state from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active state to clicked item
            item.classList.add('active');

            // Hide all views
            views.forEach(view => view.classList.remove('active-view'));
            
            // Show target view
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active-view');
        });
    });
}

function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function setupFormToggles() {
    const skillBtns = document.querySelectorAll('.skill-btn');
    skillBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('selected');
        });
    });
}
