/**
 * Script específico para mobile - MeuEncarte
 * Este arquivo gerencia comportamentos específicos de dispositivos móveis
 */

document.addEventListener('DOMContentLoaded', function() {
    // Detecta se é dispositivo móvel
    const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
    
    if (!isMobile) return; // Sai se não for dispositivo móvel
    
    console.log('MeuEncarte Mobile iniciado');
    
    // Criar elementos da interface mobile
    criarInterfaceMobile();
    
    // Referências aos elementos principais
    const navBar = document.querySelector('.mobile-nav');
    const fab = document.querySelector('.fab');
    const fabMenu = document.querySelector('.fab-menu');
    const loadingScreen = document.querySelector('.loading-screen');
    
    // Elementos do modal índice
    const indexButton = document.querySelector('.mobile-index-button');
    const indexModal = document.querySelector('.mobile-index-modal');
    const indexClose = document.querySelector('.mobile-index-close');
    
    // Event listeners para touch
    document.addEventListener('touchstart', iniciarTouch);
    document.addEventListener('touchmove', moverTouch);
    document.addEventListener('touchend', finalizarTouch);
    
    // Controle do modal índice
    if (indexButton && indexModal && indexClose) {
        indexButton.addEventListener('click', function() {
            indexModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        });
        
        indexClose.addEventListener('click', function() {
            indexModal.classList.remove('show');
            document.body.style.overflow = 'auto';
        });
        
        // Fechar ao tocar fora do modal
        indexModal.addEventListener('click', function(e) {
            if (e.target === this) {
                indexModal.classList.remove('show');
                document.body.style.overflow = 'auto';
            }
        });
        
        // Configurar eventos para as opções do índice
        document.querySelectorAll('.mobile-index-option').forEach(option => {
            option.addEventListener('click', function() {
                const action = this.getAttribute('data-action');
                
                // Fechar o modal
                indexModal.classList.remove('show');
                document.body.style.overflow = 'auto';
                
                // Executar a ação correspondente
                executarAcao(action);
            });
        });
    }
    
    // Controle do FAB (Floating Action Button)
    fab.addEventListener('click', function() {
        fab.classList.toggle('active');
        fabMenu.classList.toggle('active');
    });
    
    // Clicar fora do FAB menu fecha ele
    document.addEventListener('click', function(e) {
        if (!fab.contains(e.target) && !fabMenu.contains(e.target) && fabMenu.classList.contains('active')) {
            fab.classList.remove('active');
            fabMenu.classList.remove('active');
        }
    });
    
    // Event listeners para botões do FAB menu
    document.querySelectorAll('.fab-item').forEach(item => {
        item.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            
            // Fechar o menu após ação
            fab.classList.remove('active');
            fabMenu.classList.remove('active');
            
            // Executar ação
            executarAcao(action);
        });
    });
    
    // Função centralizada para executar ações
    function executarAcao(action) {
        switch(action) {
            case 'add-produto':
                document.getElementById('adicionar-produto').click();
                break;
            case 'add-fundo':
                document.getElementById('definir-fundo').click();
                break;
            case 'add-decoracao':
                document.getElementById('adicionar-decoracao').click();
                break;
            case 'gerar-pdf':
                document.getElementById('gerar-pdf').click();
                break;
            case 'mostrar-info':
                document.getElementById('mostrar-info').click();
                break;
        }
    }
    
    // Controle de gestos de toque
    let touchStartY = 0;
    let touchStartX = 0;
    let refreshIndicator;
    let refreshTriggered = false;
    
    function iniciarTouch(e) {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
    }
    
    function moverTouch(e) {
        if (e.touches.length !== 1) return;
        
        const touchY = e.touches[0].clientY;
        const touchX = e.touches[0].clientX;
        const deltaY = touchY - touchStartY;
        
        // Verificar pull-to-refresh
        if (deltaY > 50 && window.scrollY === 0 && !refreshTriggered) {
            if (!refreshIndicator) {
                refreshIndicator = document.querySelector('.pull-indicator');
                if (!refreshIndicator) {
                    refreshIndicator = document.createElement('div');
                    refreshIndicator.className = 'pull-indicator';
                    refreshIndicator.innerHTML = 'Solte para atualizar';
                    document.body.appendChild(refreshIndicator);
                }
            }
            
            refreshIndicator.classList.add('visible');
            refreshTriggered = true;
        }
    }
    
    function finalizarTouch(e) {
        // Verificar pull-to-refresh
        if (refreshTriggered) {
            refreshIndicator.classList.remove('visible');
            refreshTriggered = false;
            
            // Mostrar animação de carregamento
            mostrarTelaCarregamento();
            
            // Recarregar página após delay
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }
    
    // Mostrar tela de carregamento
    function mostrarTelaCarregamento() {
        loadingScreen.classList.add('active');
    }
    
    // Ocultar tela de carregamento
    function ocultarTelaCarregamento() {
        loadingScreen.classList.remove('active');
    }
    
    // Criar elementos da interface mobile
    function criarInterfaceMobile() {
        // Criar botão de índice
        const indexButton = document.createElement('button');
        indexButton.className = 'mobile-index-button';
        indexButton.innerHTML = '≡';
        indexButton.setAttribute('aria-label', 'Abrir menu');
        
        // Criar modal de índice
        const indexModal = document.createElement('div');
        indexModal.className = 'mobile-index-modal';
        indexModal.innerHTML = `
            <div class="mobile-index-content">
                <div class="mobile-index-header">
                    <h2>Menu do Encarte</h2>
                    <button class="mobile-index-close" aria-label="Fechar">&times;</button>
                </div>
                <div class="mobile-index-options">
                    <div class="mobile-index-option" data-action="add-produto">
                        <div class="mobile-index-icon">📝</div>
                        <div>
                            <div class="mobile-index-text">Adicionar Produto</div>
                            <div class="mobile-index-description">Insira novos produtos no encarte</div>
                        </div>
                    </div>
                    <div class="mobile-index-option" data-action="add-fundo">
                        <div class="mobile-index-icon">🖼️</div>
                        <div>
                            <div class="mobile-index-text">Definir Fundo</div>
                            <div class="mobile-index-description">Configure a imagem de fundo do encarte</div>
                        </div>
                    </div>
                    <div class="mobile-index-option" data-action="add-decoracao">
                        <div class="mobile-index-icon">✨</div>
                        <div>
                            <div class="mobile-index-text">Adicionar Decoração</div>
                            <div class="mobile-index-description">Insira imagens decorativas ou logomarcas</div>
                        </div>
                    </div>
                    <div class="mobile-index-option" data-action="gerar-pdf">
                        <div class="mobile-index-icon">📄</div>
                        <div>
                            <div class="mobile-index-text">Gerar PDF</div>
                            <div class="mobile-index-description">Exporte seu encarte como arquivo PDF</div>
                        </div>
                    </div>
                    <div class="mobile-index-option" data-action="mostrar-info">
                        <div class="mobile-index-icon">ℹ️</div>
                        <div>
                            <div class="mobile-index-text">Informações</div>
                            <div class="mobile-index-description">Ajuda e instruções de uso</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Criar navigation bar
        const navBar = document.createElement('nav');
        navBar.className = 'mobile-nav';
        navBar.innerHTML = `
            <a href="#" class="mobile-nav-button active" data-page="editor">
                <span class="mobile-nav-icon">📝</span>
                <span>Editor</span>
            </a>
            <a href="#" class="mobile-nav-button" data-page="preview">
                <span class="mobile-nav-icon">👁️</span>
                <span>Visualizar</span>
            </a>
            <a href="#" class="mobile-nav-button" data-page="export">
                <span class="mobile-nav-icon">📤</span>
                <span>Exportar</span>
            </a>
        `;
        
        // Criar Floating Action Button (FAB)
        const fab = document.createElement('div');
        fab.className = 'fab';
        fab.innerHTML = '+';
        
        // Criar menu do FAB
        const fabMenu = document.createElement('div');
        fabMenu.className = 'fab-menu';
        fabMenu.innerHTML = `
            <div class="fab-item" data-action="add-produto">
                <span>Adicionar Produto</span>
            </div>
            <div class="fab-item" data-action="add-fundo">
                <span>Definir Fundo</span>
            </div>
            <div class="fab-item" data-action="add-decoracao">
                <span>Adicionar Decoração</span>
            </div>
        `;
        
        // Criar tela de carregamento
        const loadingScreen = document.createElement('div');
        loadingScreen.className = 'loading-screen';
        loadingScreen.innerHTML = '<div class="spinner"></div>';
        
        // Adicionar elementos ao DOM
        document.body.appendChild(indexButton);
        document.body.appendChild(indexModal);
        document.body.appendChild(navBar);
        document.body.appendChild(fab);
        document.body.appendChild(fabMenu);
        document.body.appendChild(loadingScreen);
        
        // Adicionar eventos aos botões de navegação
        navBar.querySelectorAll('.mobile-nav-button').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const page = this.getAttribute('data-page');
                
                // Remover classe active de todos os botões
                navBar.querySelectorAll('.mobile-nav-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Adicionar classe active ao botão clicado
                this.classList.add('active');
                
                // Lidar com a navegação
                handleNavigation(page);
            });
        });
    }
    
    // Lidar com a navegação entre "páginas"
    function handleNavigation(page) {
        switch(page) {
            case 'editor':
                // Mostrar editor
                break;
            case 'preview':
                // Mostrar visualização
                break;
            case 'export':
                // Mostrar opções de exportação
                document.getElementById('gerar-pdf').click();
                break;
        }
    }
    
    // Mostrar tela de carregamento no início
    window.addEventListener('load', function() {
        // Ocultar a tela de carregamento depois que tudo estiver carregado
        setTimeout(ocultarTelaCarregamento, 500);
    });
    
    // Mostrar tela de carregamento quando usuário clicar em gerar PDF
    document.getElementById('gerar-pdf').addEventListener('click', function() {
        mostrarTelaCarregamento();
    });
});
