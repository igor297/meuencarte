/**
 * Script específico para mobile - MeuEncarte
 * Este arquivo gerencia comportamentos específicos de dispositivos móveis
 */

document.addEventListener('DOMContentLoaded', function() {
    // Detecta se é dispositivo móvel
    const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
    
    if (!isMobile) return; // Sai se não for dispositivo móvel
    
    console.log('MeuEncarte Mobile iniciado');
    
    // Criar apenas o menu hamburger
    criarInterfaceMobile();
    
    // Referências aos elementos principais
    const indexButton = document.querySelector('.mobile-index-button');
    const indexModal = document.querySelector('.mobile-index-modal');
    const indexClose = document.querySelector('.mobile-index-close');
    const loadingScreen = document.querySelector('.loading-screen');
    
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
    
    // Criar apenas o botão de menu hamburger e o modal de índice
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
        
        // Criar tela de carregamento
        const loadingScreen = document.createElement('div');
        loadingScreen.className = 'loading-screen';
        loadingScreen.innerHTML = '<div class="spinner"></div>';
        
        // Adicionar elementos ao DOM
        document.body.appendChild(indexButton);
        document.body.appendChild(indexModal);
        document.body.appendChild(loadingScreen);
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
