document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('produto-modal');
    const fundoModal = document.getElementById('fundo-modal');
    const decoracaoModal = document.getElementById('decoracao-modal');
    const btnAdicionarProduto = document.getElementById('adicionar-produto');
    const btnDefinirFundo = document.getElementById('definir-fundo');
    const btnAdicionarDecoracao = document.getElementById('adicionar-decoracao');
    const btnFecharModal = document.querySelector('.fechar-modal');
    const btnFecharModalFundo = document.querySelector('.fechar-modal-fundo');
    const btnFecharModalDecoracao = document.querySelector('.fechar-modal-decoracao');
    const btnSalvarProduto = document.getElementById('salvar-produto');
    const btnAplicarFundo = document.getElementById('aplicar-fundo');
    const btnRemoverFundo = document.getElementById('remover-fundo');
    const btnAdicionarImagemDecorativa = document.getElementById('adicionar-imagem-decorativa');
    const btnGerarPDF = document.getElementById('gerar-pdf');
    const encarteA4 = document.getElementById('encarte-a4');
    const opacidadeFundo = document.getElementById('opacidade-fundo');
    const valorOpacidade = document.getElementById('valor-opacidade');
    const opacidadeDecoracao = document.getElementById('opacidade-decoracao');
    const valorOpacidadeDecoracao = document.getElementById('valor-opacidade-decoracao');
    const infoModal = document.getElementById('info-modal');
    const btnMostrarInfo = document.getElementById('mostrar-info');
    const btnFecharInfo = document.getElementById('fechar-info');
    
    // Limites globais - mantido apenas uma declaração aqui
    const NOME_PRODUTO_LIMITE = 30; // Limite para o nome (aprox. 2 linhas)
    const DESCRICAO_PRODUTO_LIMITE = 45; // Limite para a descrição (aprox. 3 linhas)
    
    // Inicializar as variáveis de preview no início
    const corTextoInput = document.getElementById('cor-texto');
    const corDescricaoInput = document.getElementById('cor-descricao');
    const corPrecoInput = document.getElementById('cor-preco');
    
    const nomePreview = document.querySelector('.nome-preview span');
    const descricaoPreview = document.querySelector('.descricao-preview span');
    const precoPreview = document.querySelector('.preco-preview span');
    
    // Aplicar cores iniciais
    if (nomePreview) nomePreview.style.color = corTextoInput?.value || '#000000';
    if (descricaoPreview) descricaoPreview.style.color = corDescricaoInput?.value || '#666666';
    if (precoPreview) precoPreview.style.color = corPrecoInput?.value || '#FF0000';
    
    let produtoEmEdicao = null;
    let produtoId = 0;
    let decoracaoId = 0;
    let fundoAtual = {
        url: '',
        modo: 'cover',
        opacidade: 1
    };
    let cardAtivo = null;
    let decoracaoAtiva = null;
    let offsetX = 0;
    let offsetY = 0;
    
    // Dimensões do encarte para posicionamento seguro
    const encarteBounds = {
        width: encarteA4.offsetWidth,
        height: encarteA4.offsetHeight
    };
    
    // Atualizar bounds quando a página for redimensionada
    window.addEventListener('resize', function() {
        encarteBounds.width = encarteA4.offsetWidth;
        encarteBounds.height = encarteA4.offsetHeight;
    });

    // Configuração do controle deslizante de opacidade
    opacidadeFundo.addEventListener('input', function() {
        const valor = this.value;
        valorOpacidade.textContent = `${Math.round(valor * 100)}%`;
    });
    
    // Configuração do controle deslizante de opacidade para decoração
    opacidadeDecoracao.addEventListener('input', function() {
        const valor = this.value;
        valorOpacidadeDecoracao.textContent = `${Math.round(valor * 100)}%`;
    });

    // Abrir modal para adicionar decoração
    btnAdicionarDecoracao.addEventListener('click', function() {
        // Limpar o formulário
        document.getElementById('url-decoracao').value = '';
        document.getElementById('preview-decoracao').style.display = 'none';
        document.getElementById('largura-decoracao').value = '150';
        document.getElementById('altura-decoracao').value = '150';
        document.getElementById('opacidade-decoracao').value = '1';
        valorOpacidadeDecoracao.textContent = '100%';
        document.getElementById('tipo-decoracao').value = 'logomarca';
        
        decoracaoModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Impedir rolagem do conteúdo por trás do modal
    });

    // Fechar modal de decoração
    btnFecharModalDecoracao.addEventListener('click', function() {
        decoracaoModal.style.display = 'none';
        restaurarRolagem();
    });
    
    // Fechar modal de decoração ao clicar fora dele
    window.addEventListener('click', function(event) {
        if (event.target === decoracaoModal) {
            decoracaoModal.style.display = 'none';
            restaurarRolagem();
        }
    });

    // Preview da imagem decorativa quando a URL é inserida
    document.getElementById('url-decoracao').addEventListener('change', function() {
        const urlDecoracao = this.value;
        const previewDecoracao = document.getElementById('preview-decoracao');
        
        if (urlDecoracao) {
            previewDecoracao.src = urlDecoracao;
            previewDecoracao.style.display = 'block';
            
            // Verificar se a imagem pode ser carregada
            previewDecoracao.onerror = function() {
                alert('Não foi possível carregar a imagem decorativa. Verifique a URL.');
                previewDecoracao.style.display = 'none';
            };
        } else {
            previewDecoracao.style.display = 'none';
        }
    });

    // Adicionar imagem decorativa
    btnAdicionarImagemDecorativa.addEventListener('click', function() {
        const urlDecoracao = document.getElementById('url-decoracao').value;
        const largura = document.getElementById('largura-decoracao').value;
        const altura = document.getElementById('altura-decoracao').value;
        const opacidade = document.getElementById('opacidade-decoracao').value;
        const tipo = document.getElementById('tipo-decoracao').value;
        const fundoTransparente = document.getElementById('fundo-transparente-decoracao').checked;
        const corFundo = document.getElementById('cor-fundo-decoracao').value;
        
        if (!urlDecoracao) {
            alert('Por favor, insira a URL da imagem decorativa.');
            return;
        }
        
        adicionarImagemDecorativa(urlDecoracao, largura, altura, opacidade, tipo, fundoTransparente, corFundo);
        decoracaoModal.style.display = 'none';
        restaurarRolagem();
    });

    // Adicionar imagem decorativa ao encarte
    function adicionarImagemDecorativa(url, largura, altura, opacidade, tipo, fundoTransparente, corFundo) {
        const decoracaoDiv = document.createElement('div');
        decoracaoDiv.className = `decoracao-imagem tipo-${tipo}${fundoTransparente ? ' transparente' : ''}`;
        decoracaoDiv.id = `decoracao-${decoracaoId++}`;
        
        // Converter largura e altura para números
        const larguraNum = parseInt(largura);
        const alturaNum = parseInt(altura);
        
        // Posição inicial centralizada ou aleatória
        // Usar limites mais precisos para garantir que toda a imagem fique visível
        const maxX = encarteBounds.width - larguraNum - 20; // 20px de margem
        const maxY = encarteBounds.height - alturaNum - 20; // 20px de margem
        
        const posX = Math.min(Math.max(10, Math.random() * maxX), maxX);
        const posY = Math.min(Math.max(10, Math.random() * maxY), maxY);
        
        // Definir posição e dimensões
        decoracaoDiv.style.left = `${posX}px`;
        decoracaoDiv.style.top = `${posY}px`;
        decoracaoDiv.style.width = `${larguraNum}px`;
        decoracaoDiv.style.height = `${alturaNum}px`;
        decoracaoDiv.style.opacity = opacidade;
        
        // Definir cor de fundo se não for transparente
        if (!fundoTransparente) {
            decoracaoDiv.style.backgroundColor = corFundo;
        }
        
        // Adicionar botão de excluir
        decoracaoDiv.innerHTML = `
            <img src="${url}" alt="Decoração ${tipo}">
            <div class="decoracao-controles">
                <span class="btn-excluir-decoracao">×</span>
            </div>
            <div class="position-info">${Math.round(posX)}×${Math.round(posY)}</div>
        `;
        
        // Adicionar ao encarte
        encarteA4.appendChild(decoracaoDiv);
        
        // Adicionar evento de exclusão
        const btnExcluir = decoracaoDiv.querySelector('.btn-excluir-decoracao');
        btnExcluir.addEventListener('click', function(e) {
            e.stopPropagation();
            if (confirm('Tem certeza que deseja remover esta imagem?')) {
                decoracaoDiv.remove();
            }
        });
        
        // Adicionar manipuladores para arrastar e soltar
        configurarDragAndDropDecoracao(decoracaoDiv);
        
        // Salvar informações de fundo para uso futuro (ex: edição)
        decoracaoDiv.dataset.fundoTransparente = fundoTransparente;
        decoracaoDiv.dataset.corFundo = corFundo;
    }
    
    // Configurar eventos de arrastar e soltar para imagens decorativas
    function configurarDragAndDropDecoracao(element) {
        element.addEventListener('mousedown', iniciarArrastoDecoracao);
        element.addEventListener('touchstart', iniciarArrastoDecoracaoTouch, { passive: false });
    }
    
    function iniciarArrastoDecoracao(e) {
        // Impedir arrasto se o clique for nos controles
        if (e.target.closest('.decoracao-controles')) {
            return;
        }
        
        e.preventDefault();
        decoracaoAtiva = this;
        decoracaoAtiva.classList.add('dragging');
        
        // Calcular offset do mouse em relação ao elemento
        const rect = decoracaoAtiva.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        
        // Adicionar listeners temporários
        document.addEventListener('mousemove', moverDecoracao);
        document.addEventListener('mouseup', pararArrastoDecoracao);
    }
    
    function iniciarArrastoDecoracaoTouch(e) {
        // Impedir arrasto se o toque for nos controles
        if (e.target.closest('.decoracao-controles')) {
            return;
        }
        
        e.preventDefault();
        decoracaoAtiva = this;
        decoracaoAtiva.classList.add('dragging');
        
        // Calcular offset do toque em relação ao elemento
        const rect = decoracaoAtiva.getBoundingClientRect();
        offsetX = e.touches[0].clientX - rect.left;
        offsetY = e.touches[0].clientY - rect.top;
        
        // Adicionar listeners temporários
        document.addEventListener('touchmove', moverDecoracaoTouch, { passive: false });
        document.addEventListener('touchend', pararArrastoDecoracaoTouch);
    }
    
    function moverDecoracao(e) {
        if (!decoracaoAtiva) return;
        e.preventDefault();
        
        const encarteRect = encarteA4.getBoundingClientRect();
        
        // Obter largura e altura como números
        const largura = parseInt(decoracaoAtiva.style.width) || 150;
        const altura = parseInt(decoracaoAtiva.style.height) || 150;
        
        // Calcular os limites para o posicionamento
        const maxX = encarteRect.width - largura;
        const maxY = encarteRect.height - altura;
        
        let x = e.clientX - encarteRect.left - offsetX;
        let y = e.clientY - encarteRect.top - offsetY;
        
        // Limitar posicionamento dentro do encarte com margem de segurança
        x = Math.min(Math.max(0, x), maxX);
        y = Math.min(Math.max(0, y), maxY);
        
        decoracaoAtiva.style.left = `${x}px`;
        decoracaoAtiva.style.top = `${y}px`;
        
        // Atualizar indicador de posição
        const positionInfo = decoracaoAtiva.querySelector('.position-info');
        if (positionInfo) {
            positionInfo.textContent = `${Math.round(x)}×${Math.round(y)}`;
        }
    }
    
    function moverDecoracaoTouch(e) {
        if (!decoracaoAtiva) return;
        e.preventDefault();
        
        const encarteRect = encarteA4.getBoundingClientRect();
        
        // Obter largura e altura como números
        const largura = parseInt(decoracaoAtiva.style.width) || 150;
        const altura = parseInt(decoracaoAtiva.style.height) || 150;
        
        // Calcular os limites para o posicionamento
        const maxX = encarteRect.width - largura;
        const maxY = encarteRect.height - altura;
        
        let x = e.touches[0].clientX - encarteRect.left - offsetX;
        let y = e.touches[0].clientY - encarteRect.top - offsetY;
        
        // Limitar posicionamento dentro do encarte com margem de segurança
        x = Math.min(Math.max(0, x), maxX);
        y = Math.min(Math.max(0, y), maxY);
        
        decoracaoAtiva.style.left = `${x}px`;
        decoracaoAtiva.style.top = `${y}px`;
        
        // Atualizar indicador de posição
        const positionInfo = decoracaoAtiva.querySelector('.position-info');
        if (positionInfo) {
            positionInfo.textContent = `${Math.round(x)}×${Math.round(y)}`;
        }
    }
    
    function pararArrastoDecoracao() {
        if (!decoracaoAtiva) return;
        decoracaoAtiva.classList.remove('dragging');
        decoracaoAtiva = null;
        
        // Remover listeners temporários
        document.removeEventListener('mousemove', moverDecoracao);
        document.removeEventListener('mouseup', pararArrastoDecoracao);
    }
    
    function pararArrastoDecoracaoTouch() {
        if (!decoracaoAtiva) return;
        decoracaoAtiva.classList.remove('dragging');
        decoracaoAtiva = null;
        
        // Remover listeners temporários
        document.removeEventListener('touchmove', moverDecoracaoTouch);
        document.removeEventListener('touchend', pararArrastoDecoracaoTouch);
    }

    // Abrir modal para definir fundo
    btnDefinirFundo.addEventListener('click', function() {
        // Se já tiver um fundo definido, preencher o campo
        document.getElementById('url-fundo').value = fundoAtual.url;
        document.getElementById('modo-fundo').value = fundoAtual.modo;
        document.getElementById('opacidade-fundo').value = fundoAtual.opacidade;
        valorOpacidade.textContent = `${Math.round(fundoAtual.opacidade * 100)}%`;
        
        // Mostrar preview se houver URL
        const previewFundo = document.getElementById('preview-fundo');
        if (fundoAtual.url) {
            previewFundo.src = fundoAtual.url;
            previewFundo.style.display = 'block';
        } else {
            previewFundo.style.display = 'none';
        }
        
        fundoModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Impedir rolagem do conteúdo por trás do modal
    });

    // Fechar modal de fundo
    btnFecharModalFundo.addEventListener('click', function() {
        fundoModal.style.display = 'none';
        restaurarRolagem();
    });
    
    // Fechar modal de fundo ao clicar fora dele
    window.addEventListener('click', function(event) {
        if (event.target === fundoModal) {
            fundoModal.style.display = 'none';
            restaurarRolagem();
        }
    });

    // Preview da imagem de fundo quando a URL é inserida
    document.getElementById('url-fundo').addEventListener('change', function() {
        const urlFundo = this.value;
        const previewFundo = document.getElementById('preview-fundo');
        
        if (urlFundo) {
            previewFundo.src = urlFundo;
            previewFundo.style.display = 'block';
            
            // Verificar se a imagem pode ser carregada
            previewFundo.onerror = function() {
                alert('Não foi possível carregar a imagem de fundo. Verifique a URL.');
                previewFundo.style.display = 'none';
            };
        } else {
            previewFundo.style.display = 'none';
        }
    });

    // Aplicar fundo ao encarte
    btnAplicarFundo.addEventListener('click', function() {
        const urlFundo = document.getElementById('url-fundo').value;
        const modoFundo = document.getElementById('modo-fundo').value;
        const opacidade = document.getElementById('opacidade-fundo').value;
        
        if (urlFundo) {
            // Salvar configurações atuais
            fundoAtual = {
                url: urlFundo,
                modo: modoFundo,
                opacidade: opacidade
            };
            
            // Aplicar ao estilo do encarte
            encarteA4.style.backgroundImage = `url('${urlFundo}')`;
            encarteA4.style.backgroundSize = modoFundo === 'repeat' ? 'auto' : modoFundo;
            encarteA4.style.backgroundRepeat = modoFundo === 'repeat' ? 'repeat' : 'no-repeat';
            
            // Ajustar opacidade usando pseudo-elemento
            const estiloAnterior = document.getElementById('estilo-fundo');
            if (estiloAnterior) {
                document.head.removeChild(estiloAnterior);
            }
            
            const estiloOpacidade = document.createElement('style');
            estiloOpacidade.id = 'estilo-fundo';
            estiloOpacidade.innerHTML = `
                .a4-page::before {
                    background-color: white;
                    opacity: ${1 - opacidade};
                }
            `;
            document.head.appendChild(estiloOpacidade);
        }
        
        fundoModal.style.display = 'none';
        restaurarRolagem();
    });

    // Remover fundo do encarte
    btnRemoverFundo.addEventListener('click', function() {
        encarteA4.style.backgroundImage = '';
        document.getElementById('url-fundo').value = '';
        document.getElementById('preview-fundo').style.display = 'none';
        
        // Limpar configurações atuais
        fundoAtual = {
            url: '',
            modo: 'cover',
            opacidade: 1
        };
        
        // Remover estilo de opacidade
        const estiloAnterior = document.getElementById('estilo-fundo');
        if (estiloAnterior) {
            document.head.removeChild(estiloAnterior);
        }
        
        fundoModal.style.display = 'none';
        restaurarRolagem();
    });
    
    // Abrir modal para adicionar produto
    if (btnAdicionarProduto) {
        btnAdicionarProduto.addEventListener('click', function() {
            console.log("Botão 'Adicionar Produto' clicado."); // Log adicionado
            if (!modal) {
                console.error("ERRO: Modal de produto não encontrado!");
                return;
            }
            console.log("Modal de produto encontrado, tentando abrir..."); // Log adicionado
            limparFormulario();
            produtoEmEdicao = null;
            document.querySelector('#produto-modal .modal-content h2').textContent = 'Adicionar Produto';
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Impedir rolagem do conteúdo por trás do modal

            const previewCard = document.querySelector('#produto-modal .modal-content .produto-card-preview');
            if (previewCard) { // Verificar se previewCard existe
                previewCard.style.backgroundColor = document.getElementById('fundo-transparente-produto').checked
                    ? 'transparent'
                    : document.getElementById('cor-fundo-produto').value;
            } else {
                console.warn("Preview do card não encontrado no modal de produto.");
            }
            console.log("Modal de produto aberto."); // Log adicionado
        });
    } else {
        console.error("ERRO: Botão 'Adicionar Produto' não encontrado no DOM.");
    }
    
    // Fechar modal
    btnFecharModal.addEventListener('click', function() {
        modal.style.display = 'none';
        restaurarRolagem();
    });
    
    // Fechar modal ao clicar fora dele
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            restaurarRolagem();
        }
    });
    
    // Preview da imagem quando a URL é inserida
    document.getElementById('url-imagem').addEventListener('change', function() {
        const urlImagem = this.value;
        const previewImg = document.getElementById('preview');
        
        if (urlImagem) {
            previewImg.src = urlImagem;
            previewImg.style.display = 'block';
            
            // Verificar se a imagem pode ser carregada
            previewImg.onerror = function() {
                alert('Não foi possível carregar a imagem. Verifique a URL.');
                previewImg.style.display = 'none';
            };
        } else {
            previewImg.style.display = 'none';
        }
    });
    
    // Configurar os botões de alinhamento
    document.querySelectorAll('.btn-alinhamento').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remover classe 'active' de todos os botões do mesmo grupo
            const alvo = this.getAttribute('data-alvo');
            document.querySelectorAll(`.btn-alinhamento[data-alvo="${alvo}"]`).forEach(b => {
                b.classList.remove('active');
            });
            
            // Adicionar classe 'active' ao botão clicado
            this.classList.add('active');
        });
    });
    
    // Salvar produto
    btnSalvarProduto.addEventListener('click', function() {
        const urlImagem = document.getElementById('url-imagem').value;
        const nomeProduto = document.getElementById('nome-produto').value;
        const precoProduto = document.getElementById('preco-produto').value;
        const descricaoProduto = document.getElementById('descricao-produto').value;
        const fonteTexto = document.getElementById('fonte-texto').value;
        const corTexto = document.getElementById('cor-texto').value;
        const corDescricao = document.getElementById('cor-descricao').value;
        const corPreco = document.getElementById('cor-preco').value;
        const tamanhoTexto = document.getElementById('tamanho-texto').value;
        const fundoTransparente = document.getElementById('fundo-transparente-produto').checked;
        let corFundo = document.getElementById('cor-fundo-produto').value;
        const tamanhoTitulo = document.getElementById('tamanho-titulo').value || 18;
        const tamanhoDescricao = document.getElementById('tamanho-descricao').value || 14;
        
        // Validar campos obrigatórios
        if (!urlImagem || !nomeProduto || !precoProduto) {
            alert('Por favor, preencha todos os campos obrigatórios: imagem, nome e preço.');
            return;
        }
        
        // Formatar preço no padrão brasileiro
        const precoFormatado = formatarPreco(precoProduto);
        
        // Obter configurações de alinhamento
        const alinhamentos = {
            imagem: document.querySelector('.btn-alinhamento[data-alvo="imagem"].active').getAttribute('data-alinhamento'),
            nome: document.querySelector('.btn-alinhamento[data-alvo="nome"].active').getAttribute('data-alinhamento'),
            descricao: document.querySelector('.btn-alinhamento[data-alvo="descricao"].active').getAttribute('data-alinhamento'),
            preco: document.querySelector('.btn-alinhamento[data-alvo="preco"].active').getAttribute('data-alinhamento')
        };
        
        // Se não houver cor de fundo selecionada, definir como branca
        if (!fundoTransparente && (!corFundo || corFundo === '')) {
            corFundo = '#FFFFFF';
        }
        
        if (produtoEmEdicao) {
            // Atualiza produto existente
            atualizarProdutoNoEncarte(
                produtoEmEdicao, urlImagem, nomeProduto, precoFormatado, descricaoProduto, fonteTexto, corTexto, corDescricao, corPreco, tamanhoTexto, fundoTransparente, corFundo, alinhamentos,
                tamanhoTitulo, tamanhoDescricao
            );
        } else {
            // Cria novo produto
            adicionarProdutoAoEncarte(
                urlImagem, nomeProduto, precoFormatado, descricaoProduto, fonteTexto, corTexto, corDescricao, corPreco, tamanhoTexto, fundoTransparente, corFundo, alinhamentos,
                tamanhoTitulo, tamanhoDescricao
            );
        }
        
        // Fecha o modal
        modal.style.display = 'none';
        restaurarRolagem();
    });
    
    // Adiciona novo produto ao encarte
    function adicionarProdutoAoEncarte(urlImagem, nome, preco, descricao, fonte, corTexto, corDescricao, corPreco, tamanhoTexto, fundoTransparente, corFundo, alinhamentos, tamanhoTitulo, tamanhoDescricao) {
        const produtoCard = document.createElement('div');
        produtoCard.className = `produto-card${fundoTransparente ? ' transparente' : ''}`;
        produtoCard.id = `produto-${produtoId++}`;
        
        // Tamanho padronizado do card
        const cardWidth = 150;
        const cardHeight = 280;
        
        // Calcular posição inicial para o novo card com margens de segurança
        const maxX = encarteBounds.width - cardWidth - 20;
        const maxY = encarteBounds.height - cardHeight - 20;
        
        const posX = Math.min(Math.max(10, Math.random() * maxX), maxX);
        const posY = Math.min(Math.max(10, Math.random() * maxY), maxY);
        
        // Definir posição e tamanho padronizado
        produtoCard.style.left = `${posX}px`;
        produtoCard.style.top = `${posY}px`;
        produtoCard.style.width = `${cardWidth}px`;
        produtoCard.style.height = `${cardHeight}px`;
        
        // Definir cor de fundo se não for transparente
        if (!fundoTransparente) {
            corFundo = corFundo || '#FFFFFF'; // Garantir que sempre tenha uma cor, padrão branco
            produtoCard.style.backgroundColor = corFundo;
            
            // Adicionar classe white-bg se a cor for branca
            if (corFundo.toLowerCase() === '#ffffff' || corFundo.toLowerCase() === '#fff') {
                produtoCard.classList.add('white-bg');
            }
        }
        
        // Garantir que a descrição sempre tenha conteúdo para manter o espaçamento
        const descricaoExibida = descricao.trim() === '' ? '&nbsp;' : descricao;
        
        // Aplicar alinhamentos aos elementos
        const imgAlign = alinhamentos.imagem || 'center';
        const nomeAlign = alinhamentos.nome || 'center';
        const descricaoAlign = alinhamentos.descricao || 'center';
        const precoAlign = alinhamentos.preco || 'center';
        
        // Criar HTML com divs flex para garantir alinhamento consistente
        produtoCard.innerHTML = `
            <div class="produto-controles">
                <button class="btn-editar">Editar</button>
                <button class="btn-remover">Remover</button>
            </div>
            <div class="produto-imagem" style="text-align: ${imgAlign};">
                <img src="${urlImagem}" alt="${nome}">
            </div>
            <div class="produto-info" style="font-family: ${fonte}; font-size: ${tamanhoTexto}px;">
                <div class="produto-nome" style="text-align: ${nomeAlign}; color: ${corTexto}; font-size: ${tamanhoTitulo || 18}px;">${nome}</div>
                <div class="produto-descricao" style="text-align: ${descricaoAlign}; color: ${corDescricao}; font-size: ${tamanhoDescricao || 14}px;">${descricaoExibida}</div>
                <div class="produto-preco" style="text-align: ${precoAlign}; color: ${corPreco}; font-size: 20px;">${preco}</div>
            </div>
            <div class="position-info">${Math.round(posX)}×${Math.round(posY)}</div>
        `;
        
        encarteA4.appendChild(produtoCard);
        
        // Adiciona eventos aos botões
        const btnEditar = produtoCard.querySelector('.btn-editar');
        const btnRemover = produtoCard.querySelector('.btn-remover');
        
        btnEditar.addEventListener('click', function(e) {
            e.stopPropagation(); // Evitar que o evento chegue ao card
            editarProduto(produtoCard);
        });
        
        btnRemover.addEventListener('click', function(e) {
            e.stopPropagation(); // Evitar que o evento chegue ao card
            if (confirm('Tem certeza que deseja remover este produto?')) {
                produtoCard.remove();
            }
        });
        
        // Adicionar manipuladores para arrastar e soltar
        configurarDragAndDrop(produtoCard);
        
        // Salvar informações de fundo para uso futuro (ex: edição)
        produtoCard.dataset.fundoTransparente = fundoTransparente;
        produtoCard.dataset.corFundo = corFundo || '#FFFFFF';
        
        // Salvar informações de alinhamento para uso futuro (ex: edição)
        produtoCard.dataset.imgAlign = alinhamentos.imagem;
        produtoCard.dataset.nomeAlign = alinhamentos.nome;
        produtoCard.dataset.descricaoAlign = alinhamentos.descricao;
        produtoCard.dataset.precoAlign = alinhamentos.preco;

        // Salvar informações de cores para uso futuro (ex: edição)
        produtoCard.dataset.corTexto = corTexto;
        produtoCard.dataset.corDescricao = corDescricao;
        produtoCard.dataset.corPreco = corPreco;
    }
    
    // Configurar eventos de arrastar e soltar para o card
    function configurarDragAndDrop(card) {
        card.addEventListener('mousedown', iniciarArrasto);
        card.addEventListener('touchstart', iniciarArrastoTouch, { passive: false });
    }
    
    function iniciarArrasto(e) {
        // Impedir arrasto se o clique for nos controles
        if (e.target.closest('.produto-controles')) {
            return;
        }
        
        e.preventDefault();
        cardAtivo = this;
        cardAtivo.classList.add('dragging');
        
        // Calcular offset do mouse em relação ao card
        const rect = cardAtivo.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        
        // Adicionar listeners temporários
        document.addEventListener('mousemove', moverCard);
        document.addEventListener('mouseup', pararArrasto);
    }
    
    function iniciarArrastoTouch(e) {
        // Impedir arrasto se o toque for nos controles
        if (e.target.closest('.produto-controles')) {
            return;
        }
        
        e.preventDefault();
        cardAtivo = this;
        cardAtivo.classList.add('dragging');
        
        // Calcular offset do toque em relação ao card
        const rect = cardAtivo.getBoundingClientRect();
        offsetX = e.touches[0].clientX - rect.left;
        offsetY = e.touches[0].clientY - rect.top;
        
        // Adicionar listeners temporários
        document.addEventListener('touchmove', moverCardTouch, { passive: false });
        document.addEventListener('touchend', pararArrastoTouch);
    }
    
    function moverCard(e) {
        if (!cardAtivo) return;
        e.preventDefault();
        
        const encarteRect = encarteA4.getBoundingClientRect();
        
        // Calcular limites baseados no tamanho do card (150x280)
        const maxX = encarteRect.width - 150;
        const maxY = encarteRect.height - 280;
        
        let x = e.clientX - encarteRect.left - offsetX;
        let y = e.clientY - encarteRect.top - offsetY;
        
        // Limitar posicionamento dentro do encarte
        x = Math.min(Math.max(0, x), maxX);
        y = Math.min(Math.max(0, y), maxY);
        
        cardAtivo.style.left = `${x}px`;
        cardAtivo.style.top = `${y}px`;
        
        // Atualizar indicador de posição
        const positionInfo = cardAtivo.querySelector('.position-info');
        if (positionInfo) {
            positionInfo.textContent = `${Math.round(x)}×${Math.round(y)}`;
        }
    }
    
    function moverCardTouch(e) {
        if (!cardAtivo) return;
        e.preventDefault();
        
        const encarteRect = encarteA4.getBoundingClientRect();
        
        // Calcular limites baseados no tamanho do card (150x280)
        const maxX = encarteRect.width - 150;
        const maxY = encarteRect.height - 280;
        
        let x = e.touches[0].clientX - encarteRect.left - offsetX;
        let y = e.touches[0].clientY - encarteRect.top - offsetY;
        
        // Limitar posicionamento dentro do encarte
        x = Math.min(Math.max(0, x), maxX);
        y = Math.min(Math.max(0, y), maxY);
        
        cardAtivo.style.left = `${x}px`;
        cardAtivo.style.top = `${y}px`;
        
        // Atualizar indicador de posição
        const positionInfo = cardAtivo.querySelector('.position-info');
        if (positionInfo) {
            positionInfo.textContent = `${Math.round(x)}×${Math.round(y)}`;
        }
    }
    
    function pararArrasto() {
        if (!cardAtivo) return;
        cardAtivo.classList.remove('dragging');
        cardAtivo = null;
        
        // Remover listeners temporários
        document.removeEventListener('mousemove', moverCard);
        document.removeEventListener('mouseup', pararArrasto);
    }
    
    function pararArrastoTouch() {
        if (!cardAtivo) return;
        cardAtivo.classList.remove('dragging');
        cardAtivo = null;
        
        // Remover listeners temporários
        document.removeEventListener('touchmove', moverCardTouch);
        document.removeEventListener('touchend', pararArrastoTouch);
    }

    // Atualiza um produto existente
    function atualizarProdutoNoEncarte(produtoCard, urlImagem, nome, preco, descricao, fonte, corTexto, corDescricao, corPreco, tamanhoTexto, fundoTransparente, corFundo, alinhamentos, tamanhoTitulo, tamanhoDescricao) {
        const produtoImagem = produtoCard.querySelector('.produto-imagem');
        const produtoImg = produtoCard.querySelector('.produto-imagem img');
        const produtoNome = produtoCard.querySelector('.produto-nome');
        const produtoDescricao = produtoCard.querySelector('.produto-descricao');
        const produtoPreco = produtoCard.querySelector('.produto-preco');
        const produtoInfo = produtoCard.querySelector('.produto-info');
        
        // Atualizar conteúdo
        produtoImg.src = urlImagem;
        produtoImg.alt = nome;
        produtoNome.textContent = nome;
        produtoNome.style.display = 'flex';
        produtoNome.style.fontSize = (tamanhoTitulo || 18) + 'px';
        
        // Garantir que a descrição sempre tenha conteúdo para manter o espaçamento
        if (descricao.trim() === '') {
            produtoDescricao.innerHTML = '&nbsp;';
        } else {
            produtoDescricao.textContent = descricao;
        }
        produtoDescricao.style.display = 'flex';
        produtoDescricao.style.fontSize = (tamanhoDescricao || 14) + 'px';
        
        produtoPreco.textContent = preco;
        produtoPreco.style.display = 'flex';
        
        // Atualizar estilos
        produtoNome.style.color = corTexto;
        produtoDescricao.style.color = corDescricao;
        produtoPreco.style.color = corPreco;
        produtoInfo.style.fontFamily = fonte;
        produtoInfo.style.fontSize = `${tamanhoTexto}px`;
        
        // Atualizar alinhamentos
        produtoImagem.style.textAlign = alinhamentos.imagem;
        produtoNome.style.textAlign = alinhamentos.nome;
        produtoDescricao.style.textAlign = alinhamentos.descricao;
        produtoPreco.style.textAlign = alinhamentos.preco;
        
        // Atualizar cor de fundo
        if (fundoTransparente) {
            produtoCard.classList.add('transparente');
            produtoCard.classList.remove('white-bg');
            produtoCard.style.backgroundColor = '';
        } else {
            corFundo = corFundo || '#FFFFFF'; // Garantir que sempre tenha uma cor, padrão branco
            produtoCard.classList.remove('transparente');
            produtoCard.style.backgroundColor = corFundo;
            
            // Adicionar classe white-bg se a cor for branca
            if (corFundo.toLowerCase() === '#ffffff' || corFundo.toLowerCase() === '#fff') {
                produtoCard.classList.add('white-bg');
            } else {
                produtoCard.classList.remove('white-bg');
            }
        }
        
        // Atualizar dados salvos
        produtoCard.dataset.fundoTransparente = fundoTransparente;
        produtoCard.dataset.corFundo = corFundo || '#FFFFFF';
        
        // Atualizar dados de alinhamento salvos
        produtoCard.dataset.imgAlign = alinhamentos.imagem;
        produtoCard.dataset.nomeAlign = alinhamentos.nome;
        produtoCard.dataset.descricaoAlign = alinhamentos.descricao;
        produtoCard.dataset.precoAlign = alinhamentos.preco;

        // Atualizar dados de cores salvos
        produtoCard.dataset.corTexto = corTexto;
        produtoCard.dataset.corDescricao = corDescricao;
        produtoCard.dataset.corPreco = corPreco;
    }
    
    // Editar produto
    function editarProduto(produtoCard) {
        produtoEmEdicao = produtoCard;

        // Obter os dados do produto do card
        const urlImagem = produtoCard.querySelector('.produto-imagem img').src;
        const nome = produtoCard.querySelector('.produto-nome').textContent.trim();
        const descricao = produtoCard.querySelector('.produto-descricao').textContent.trim();
        const preco = produtoCard.querySelector('.produto-preco').textContent.replace('R$', '').trim();
        const fonte = produtoCard.querySelector('.produto-info').style.fontFamily.replace(/"/g, '');
        const corTexto = produtoCard.querySelector('.produto-nome').style.color || '#000000';
        const corDescricao = produtoCard.querySelector('.produto-descricao').style.color || '#666666';
        const corPreco = produtoCard.querySelector('.produto-preco').style.color || '#FF0000';
        const tamanhoTexto = parseInt(produtoCard.querySelector('.produto-info').style.fontSize) || 16;
        const fundoTransparente = produtoCard.classList.contains('transparente');
        const corFundo = produtoCard.style.backgroundColor || '#FFFFFF';

        // Preencher os campos do modal com os dados do produto
        document.getElementById('url-imagem').value = urlImagem;
        document.getElementById('nome-produto').value = nome;
        document.getElementById('descricao-produto').value = descricao;
        document.getElementById('preco-produto').value = preco;
        document.getElementById('fonte-texto').value = fonte;
        document.getElementById('cor-texto').value = corTexto;
        document.getElementById('cor-descricao').value = corDescricao;
        document.getElementById('cor-preco').value = corPreco;
        document.getElementById('tamanho-texto').value = tamanhoTexto;
        document.getElementById('fundo-transparente-produto').checked = fundoTransparente;
        document.getElementById('cor-fundo-produto').value = corFundo;
        document.getElementById('cor-fundo-produto').disabled = fundoTransparente;

        // Atualizar o preview da imagem
        const previewImg = document.getElementById('preview');
        previewImg.src = urlImagem;
        previewImg.style.display = 'block';

        // Atualizar o título do modal
        document.querySelector('.modal-content h2').textContent = 'Editar Produto';

        // Abrir o modal
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Impedir rolagem do conteúdo por trás do modal
    }
    
    // Limpar formulário
    function limparFormulario() {
        document.getElementById('url-imagem').value = '';
        document.getElementById('nome-produto').value = '';
        document.getElementById('preco-produto').value = '';
        document.getElementById('descricao-produto').value = '';
        document.getElementById('fonte-texto').value = 'Arial'; // Atualizado para Arial
        document.getElementById('cor-texto').value = '#000000';
        document.getElementById('cor-descricao').value = '#666666';
        document.getElementById('cor-preco').value = '#FF0000';
        document.getElementById('tamanho-texto').value = '16';
        document.getElementById('tamanho-titulo').value = '18'; // Resetar tamanho do título
        document.getElementById('tamanho-descricao').value = '14'; // Resetar tamanho da descrição
        document.getElementById('preview').style.display = 'none';
        document.getElementById('fundo-transparente-produto').checked = false;
        document.getElementById('cor-fundo-produto').value = '#FFFFFF';
        document.getElementById('cor-fundo-produto').disabled = false;

        // Resetar o preview da fonte
        const fonteTextoValue = document.getElementById('fonte-texto').value;
        document.getElementById('texto-preview').style.fontFamily = fonteTextoValue;
        
        // Restaurar previews de cores (com verificação null-safe)
        if (nomePreview) nomePreview.style.color = '#000000';
        if (descricaoPreview) descricaoPreview.style.color = '#666666';
        if (precoPreview) precoPreview.style.color = '#FF0000';

        // Resetar contadores
        atualizarContadorNome();
        // Chamar função para atualizar contador da descrição
        atualizarContadorDescricao();

        // Resetar alinhamentos para o padrão (center)
        document.querySelectorAll('.btn-alinhamento').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.btn-alinhamento[data-alinhamento="center"]').forEach(btn => btn.classList.add('active'));

        // Resetar preview do fundo
        const previewCard = document.querySelector('#produto-modal .modal-content .produto-card-preview');
        if (previewCard) {
            previewCard.style.backgroundColor = '#FFFFFF';
            previewCard.classList.remove('transparente');
            previewCard.classList.add('white-bg');
        }
        const dicaFundo = document.querySelector('.dica-fundo');
        if (dicaFundo) {
            dicaFundo.textContent = 'Cor branca selecionada. Uma borda fina será adicionada para visualização.';
        }
    }
    
    // Formatar preço para o padrão brasileiro
    function formatarPreco(preco) {
        const valor = parseFloat(preco);
        return `R$ ${valor.toFixed(2).replace('.', ',')}`;
    }
    
    // Gerar PDF do encarte
    btnGerarPDF.addEventListener('click', function() {
        // Desabilitar o botão temporariamente
        btnGerarPDF.disabled = true;
        btnGerarPDF.textContent = 'Preparando Impressão...'; // Mudar texto
        btnGerarPDF.style.cursor = 'wait';

        // Remover temporariamente os controles visuais
        const botoesControleProduto = document.querySelectorAll('.produto-controles');
        const botoesControleDecoracao = document.querySelectorAll('.decoracao-controles');
        const positionInfos = document.querySelectorAll('.position-info');
        botoesControleProduto.forEach(botao => botao.style.display = 'none');
        botoesControleDecoracao.forEach(botao => botao.style.display = 'none');
        positionInfos.forEach(info => info.style.display = 'none');
        
        // Capturar HTML dos produtos e decorações (como antes)
        const produtos = document.querySelectorAll('.produto-card');
        const produtosHTML = Array.from(produtos).map(card => {
            // ... (código existente para gerar produtosHTML) ...
            // Garantir que os estilos inline corretos sejam capturados
            const left = card.style.left;
            const top = card.style.top;
            const width = card.style.width; // Capturar largura se necessário
            const height = card.style.height; // Capturar altura se necessário
            const bgColor = card.style.backgroundColor;
            const isTransparent = card.classList.contains('transparente');
            
            // Clonar o card para não modificar o original diretamente ao remover controles
            const cardClone = card.cloneNode(true);
            cardClone.querySelectorAll('.produto-controles, .position-info').forEach(el => el.remove());
            
            let style = `position: absolute; left: ${left}; top: ${top}; width: ${width}; height: ${height};`;
            if (!isTransparent) {
                style += ` background-color: ${bgColor || 'white'};`;
            } else {
                 style += ` background-color: transparent;`;
            }

            // Adicionar estilos de texto e alinhamento diretamente se necessário
            // (O ideal é que pdf-styles.css cuide disso, mas como fallback)
            const nomeEl = card.querySelector('.produto-nome');
            const descEl = card.querySelector('.produto-descricao');
            const precoEl = card.querySelector('.produto-preco');
            const infoEl = card.querySelector('.produto-info');
            
            style += ` font-family: ${infoEl.style.fontFamily || 'Arial'};`; // Exemplo

            return `<div class="produto-card${isTransparent ? ' transparente' : ''}" style="${style}">${cardClone.innerHTML}</div>`;
        }).join('');
        
        const decoracoes = document.querySelectorAll('.decoracao-imagem');
        const decoracoesHTML = Array.from(decoracoes).map(dec => {
            // ... (código existente para gerar decoracoesHTML) ...
            const left = dec.style.left;
            const top = dec.style.top;
            const width = dec.style.width;
            const height = dec.style.height;
            const opacity = dec.style.opacity;
            const bgColor = dec.style.backgroundColor;
            const isTransparent = dec.classList.contains('transparente');
            
            const decClone = dec.cloneNode(true);
            decClone.querySelectorAll('.decoracao-controles, .position-info').forEach(el => el.remove());

            let style = `position: absolute; left: ${left}; top: ${top}; width: ${width}; height: ${height}; opacity: ${opacity};`;
             if (!isTransparent) {
                style += ` background-color: ${bgColor || 'transparent'};`;
            } else {
                 style += ` background-color: transparent;`;
            }

            return `<div class="decoracao-imagem ${dec.className.replace('dragging','')}" style="${style}">${decClone.innerHTML}</div>`;
        }).join('');
        
        // Verificar se estamos em um ambiente hospedado (como Vercel)
        const isHosted = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
        
        // ALTERAÇÃO: SEMPRE usar impressão via navegador no ambiente Vercel/hospedado
        // Sem tentar a rota /gerar-pdf no servidor que causa erro 404
        if (isHosted) {
            console.log("Ambiente hospedado detectado. Usando diretamente impressão via navegador.");
            const impressaoIniciada = imprimirEncarteNoNavegador(decoracoesHTML, produtosHTML, fundoAtual);
            
            if (!impressaoIniciada) {
                alert('Falha ao abrir a janela de impressão. Verifique se o bloqueador de pop-ups está desativado.');
            }
            // Restaurar controles independentemente do sucesso/falha da abertura da janela
            restaurarControles();
            
        } else {
            // Em ambiente local, tentar gerar PDF via servidor (como antes)
            console.log("Ambiente local detectado. Tentando gerar PDF via servidor.");
            const conteudo = prepararConteudoPDF(decoracoesHTML, produtosHTML, fundoAtual); // Usar a função original para gerar HTML completo
            fetch('/gerar-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conteudo })
            })
            .then(response => {
                if (response.ok) return response.blob();
                throw new Error('Erro ao gerar PDF no servidor local.');
            })
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'encarte.pdf';
                a.click();
                window.URL.revokeObjectURL(url);
                restaurarControles();
            })
            .catch(error => {
                console.error('Erro no fetch local:', error);
                alert('Erro ao gerar PDF localmente. Tentando impressão via navegador como fallback...');
                // Fallback para impressão via navegador se o servidor local falhar
                const impressaoIniciada = imprimirEncarteNoNavegador(decoracoesHTML, produtosHTML, fundoAtual);
                 if (!impressaoIniciada) {
                    alert('Falha ao abrir a janela de impressão. Verifique se o bloqueador de pop-ups está desativado.');
                }
                restaurarControles();
            });
        }
        
        // Função para restaurar os controles visuais
        function restaurarControles() {
            botoesControleProduto.forEach(botao => botao.style.display = 'flex');
            botoesControleDecoracao.forEach(botao => botao.style.display = 'block');
            positionInfos.forEach(info => info.style.display = 'block');
            
            // Reativar o botão
            btnGerarPDF.disabled = false;
            btnGerarPDF.textContent = 'Gerar PDF / Imprimir'; // Atualizar texto
            btnGerarPDF.style.cursor = 'pointer';
        }
    });
    
    // Recalcular dimensões do encarte quando a janela for redimensionada
    window.addEventListener('load', function() {
        encarteBounds.width = encarteA4.offsetWidth;
        encarteBounds.height = encarteA4.offsetHeight;
    });
    
    // Gerenciar transparência do fundo do produto
    document.getElementById('fundo-transparente-produto').addEventListener('change', function() {
        const colorPicker = document.getElementById('cor-fundo-produto');
        const previewCard = document.querySelector('#produto-modal .modal-content .produto-card-preview');
        const dicaFundo = document.querySelector('.dica-fundo');
        
        colorPicker.disabled = this.checked;

        // Atualizar visualização do fundo imediatamente
        if (previewCard) {
            if (this.checked) {
                previewCard.style.backgroundColor = 'transparent';
                previewCard.classList.add('transparente');
                previewCard.classList.remove('white-bg');
                // Atualizar a mensagem de ajuda
                if (dicaFundo) dicaFundo.textContent = 'Fundo transparente selecionado. O produto aparecerá sobre o fundo do encarte.';
            } else {
                const corFundo = colorPicker.value || '#FFFFFF';
                previewCard.style.backgroundColor = corFundo;
                previewCard.classList.remove('transparente');
                
                // Verificar se é branco
                if (corFundo.toLowerCase() === '#ffffff' || corFundo.toLowerCase() === '#fff') {
                    previewCard.classList.add('white-bg');
                    if (dicaFundo) dicaFundo.textContent = 'Cor branca selecionada. Uma borda fina será adicionada para visualização.';
                } else {
                    previewCard.classList.remove('white-bg');
                    if (dicaFundo) dicaFundo.textContent = 'Escolha uma cor para o fundo ou marque "Transparente" para removê-lo. Se nenhuma opção for selecionada, a cor branca será aplicada automaticamente.';
                }
            }
        }
    });

    // Atualizar cor do fundo do preview ao mudar o color picker
    document.getElementById('cor-fundo-produto').addEventListener('input', function() {
        const transparente = document.getElementById('fundo-transparente-produto').checked;
        const previewCard = document.querySelector('#produto-modal .modal-content .produto-card-preview');
        const dicaFundo = document.querySelector('.dica-fundo');
        
        if (previewCard && !transparente) {
            const corFundo = this.value || '#FFFFFF'; // Se não houver valor, usar branco
            
            // Atualiza a cor de fundo do preview em tempo real
            previewCard.style.backgroundColor = corFundo; 
            
            // Adicionar a classe 'white-bg' se a cor for branca ou próxima ao branco
            if (corFundo.toLowerCase() === '#ffffff' || corFundo.toLowerCase() === '#fff') {
                previewCard.classList.add('white-bg');
                // Atualizar a mensagem de ajuda
                if (dicaFundo) dicaFundo.textContent = 'Cor branca selecionada. Uma borda fina será adicionada para visualização.';
            } else {
                previewCard.classList.remove('white-bg');
                // Restaurar a mensagem de ajuda padrão
                if (dicaFundo) dicaFundo.textContent = 'Escolha uma cor para o fundo ou marque "Transparente" para removê-lo. Se nenhuma opção for selecionada, a cor branca será aplicada automaticamente.';
            }
        }
    });

    // Adicionar preview do card no modal se não existir
    if (!document.querySelector('.produto-card-preview')) {
        const formGroup = document.querySelector('#produto-modal .modal-content .form-group:has(#cor-fundo-produto)'); // Encontra o form-group correto
        if (formGroup) {
            const previewDiv = document.createElement('div');
            previewDiv.className = 'produto-card-preview';
            // Estilos inline removidos, serão controlados pelo CSS
            
            // Verificar se inicialmente a cor é branca
            const corFundo = document.getElementById('cor-fundo-produto').value || '#FFFFFF';
            previewDiv.style.backgroundColor = corFundo;
            
            if (corFundo.toLowerCase() === '#ffffff' || corFundo.toLowerCase() === '#fff') {
                previewDiv.classList.add('white-bg');
            }
            
            // Adicionar texto de indicação
            const previewLabel = document.createElement('div');
            previewLabel.className = 'preview-label';
            previewLabel.textContent = 'Exemplo de Fundo';
            previewDiv.appendChild(previewLabel);
            
            // Inserir o preview antes da mensagem de dica
            const dicaFundoElement = formGroup.querySelector('.dica-fundo');
            if (dicaFundoElement) {
                formGroup.insertBefore(previewDiv, dicaFundoElement);
            } else {
                formGroup.appendChild(previewDiv); // Fallback caso a dica não exista
            }
            
            // Atualizar a mensagem de ajuda inicialmente
            const dicaFundo = formGroup.querySelector('.dica-fundo'); // Seleciona novamente dentro do escopo
            if (dicaFundo) {
                if (document.getElementById('fundo-transparente-produto').checked) {
                    dicaFundo.textContent = 'Fundo transparente selecionado. O produto aparecerá sobre o fundo do encarte.';
                } else if (corFundo.toLowerCase() === '#ffffff' || corFundo.toLowerCase() === '#fff') {
                    dicaFundo.textContent = 'Cor branca selecionada. Uma borda fina será adicionada para visualização.';
                } else {
                    dicaFundo.textContent = 'Escolha uma cor para o fundo ou marque "Transparente" para removê-lo. Se nenhuma opção for selecionada, a cor branca será aplicada automaticamente.';
                }
            }
        } else {
            console.error("Não foi possível encontrar o .form-group para adicionar o preview do fundo.");
        }
    }

    // Gerenciar transparência do fundo da decoração
    document.getElementById('fundo-transparente-decoracao').addEventListener('change', function() {
        const colorPicker = document.getElementById('cor-fundo-decoracao');
        colorPicker.disabled = this.checked;
    });

    // Fechar modais - restaurar rolagem
    function restaurarRolagem() {
        document.body.style.overflow = 'auto';
    }

    // Adicionar contador de caracteres para a descrição
    const descricaoTextarea = document.getElementById('descricao-produto');
    const contadorElement = document.getElementById('contador');

    // Função para atualizar contador da descrição (pode ser chamada no limparFormulario)
    function atualizarContadorDescricao() {
        if (descricaoTextarea && contadorElement) {
            const caracteresAtuais = descricaoTextarea.value.length;
            contadorElement.textContent = caracteresAtuais;

            // Truncar se exceder o limite (já tratado pelo maxlength, mas reforça)
            if (caracteresAtuais > DESCRICAO_PRODUTO_LIMITE) {
                descricaoTextarea.value = descricaoTextarea.value.substring(0, DESCRICAO_PRODUTO_LIMITE);
                contadorElement.textContent = DESCRICAO_PRODUTO_LIMITE; // Atualiza contador após truncar
            }

            // Destacar quando chegar perto do limite
            const contadorContainer = descricaoTextarea.closest('.form-group').querySelector('.contador-caracteres:not(.nome-contador)');
            if (contadorContainer) {
                // Usar DESCRICAO_PRODUTO_LIMITE definido no escopo global
                if (caracteresAtuais >= Math.floor(DESCRICAO_PRODUTO_LIMITE * 0.9)) { // 90% do limite
                    contadorContainer.classList.add('limite');
                } else {
                    contadorContainer.classList.remove('limite');
                }
            }
        }
    }

    if (descricaoTextarea) {
        // Define o maxlength diretamente no elemento
        descricaoTextarea.maxLength = DESCRICAO_PRODUTO_LIMITE;
        descricaoTextarea.addEventListener('input', atualizarContadorDescricao);
        // Chama a função uma vez para inicializar o contador
        atualizarContadorDescricao();
    }

    // Abrir modal de informações
    if (btnMostrarInfo) {
        btnMostrarInfo.addEventListener('click', function() {
            console.log("Botão 'Informações' clicado."); // Log adicionado
            if (!infoModal) {
                console.error("ERRO: Modal de informações não encontrado!");
                return;
            }
            console.log("Modal de informações encontrado, tentando abrir..."); // Log adicionado
            infoModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            console.log("Modal de informações aberto."); // Log adicionado
        });
    } else {
        console.error("ERRO: Botão 'Informações' não encontrado no DOM.");
    }
    
    // Fechar modal de informações
    btnFecharInfo.addEventListener('click', function() {
        infoModal.style.display = 'none';
        restaurarRolagem();
    });
    
    // Fechar modal de informações ao clicar fora
    window.addEventListener('click', function(event) {
        if (event.target === infoModal) {
            infoModal.style.display = 'none';
            restaurarRolagem();
        }
    });

    // Verificar se os elementos existem antes de adicionar eventos
    console.log("Verificando elementos no DOM:");
    console.log("- Botão Definir Fundo:", btnDefinirFundo ? "Encontrado" : "Não encontrado");
    console.log("- Botão Adicionar Produto:", btnAdicionarProduto ? "Encontrado" : "Não encontrado");
    console.log("- Botão Adicionar Decoração:", btnAdicionarDecoracao ? "Encontrado" : "Não encontrado");
    console.log("- Botão Gerar PDF:", btnGerarPDF ? "Encontrado" : "Não encontrado");
    console.log("- Botão Informações:", btnMostrarInfo ? "Encontrado" : "Não encontrado");

    // Garantir que todos os listeners sejam adicionados apenas se os elementos existirem
    if (btnMostrarInfo) {
        btnMostrarInfo.addEventListener('click', function() {
            console.log("Botão Informações clicado");
            infoModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (btnFecharInfo) {
        btnFecharInfo.addEventListener('click', function() {
            infoModal.style.display = 'none';
            restaurarRolagem();
        });
    }

    // Preview da fonte selecionada
    const fonteSelect = document.getElementById('fonte-texto');
    const textoPreview = document.getElementById('texto-preview');
    
    // Atualizar a fonte do preview quando o select mudar
    if (fonteSelect && textoPreview) {
        fonteSelect.addEventListener('change', function() {
            textoPreview.style.fontFamily = this.value;
        });
        
        // Definir a fonte inicial
        textoPreview.style.fontFamily = fonteSelect.value;
    }
    
    // Atualizar cor do nome no preview
    if (corTextoInput && nomePreview) {
        corTextoInput.addEventListener('input', function() {
            nomePreview.style.color = this.value;
        });
    }
    
    // Atualizar cor da descrição no preview
    if (corDescricaoInput && descricaoPreview) {
        corDescricaoInput.addEventListener('input', function() {
            descricaoPreview.style.color = this.value;
        });
    }
    
    // Atualizar cor do preço no preview
    if (corPrecoInput && precoPreview) {
        corPrecoInput.addEventListener('input', function() {
            precoPreview.style.color = this.value;
        });
    }
    
    const nomeProdutoInput = document.getElementById('nome-produto');
    const contadorNomeElement = document.getElementById('contador-nome');
    const limiteNomeElement = document.getElementById('limite-nome');
    
    if (limiteNomeElement) {
        limiteNomeElement.textContent = NOME_PRODUTO_LIMITE; // Exibe o limite no HTML
    }

    // Função para atualizar o contador do nome do produto
    function atualizarContadorNome() {
        if (nomeProdutoInput && contadorNomeElement) {
            const caracteresAtuais = nomeProdutoInput.value.length;
            contadorNomeElement.textContent = caracteresAtuais;

            // Truncar se exceder o limite
            if (caracteresAtuais > NOME_PRODUTO_LIMITE) {
                nomeProdutoInput.value = nomeProdutoInput.value.substring(0, NOME_PRODUTO_LIMITE);
                contadorNomeElement.textContent = NOME_PRODUTO_LIMITE; // Atualiza contador após truncar
            }

            // Adicionar classe de limite visualmente
            const contadorContainer = nomeProdutoInput.closest('.input-with-counter').querySelector('.contador-caracteres');
            if (contadorContainer) {
                // Destacar um pouco antes do limite
                if (caracteresAtuais >= Math.floor(NOME_PRODUTO_LIMITE * 0.9)) { // 90% do limite
                    contadorContainer.classList.add('limite');
                } else {
                    contadorContainer.classList.remove('limite');
                }
            }
        }
    }

    // Adicionar listener ao input do nome do produto
    if (nomeProdutoInput) {
        nomeProdutoInput.addEventListener('input', atualizarContadorNome);
    }

    // Definir timestamp da versão no rodapé
    const versionSpan = document.getElementById('app-version');
    if (versionSpan) {
        // Usar um timestamp simples como indicador de build/deploy
        const buildTimestamp = new Date().toISOString(); // Ou use um valor fixo se preferir
        versionSpan.textContent = `Build: ${buildTimestamp}`;
    }

    // Abrir modal para adicionar produto
    if (btnAdicionarProduto) {
        btnAdicionarProduto.addEventListener('click', function() {
            console.log("Botão 'Adicionar Produto' clicado."); // Log adicionado
            if (!modal) {
                console.error("ERRO: Modal de produto não encontrado!");
                return;
            }
            console.log("Modal de produto encontrado, tentando abrir..."); // Log adicionado
            limparFormulario();
            produtoEmEdicao = null;
            document.querySelector('#produto-modal .modal-content h2').textContent = 'Adicionar Produto';
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Impedir rolagem do conteúdo por trás do modal

            const previewCard = document.querySelector('#produto-modal .modal-content .produto-card-preview');
            if (previewCard) { // Verificar se previewCard existe
                previewCard.style.backgroundColor = document.getElementById('fundo-transparente-produto').checked
                    ? 'transparent'
                    : document.getElementById('cor-fundo-produto').value;
            } else {
                console.warn("Preview do card não encontrado no modal de produto.");
            }
            console.log("Modal de produto aberto."); // Log adicionado
        });
    } else {
        console.error("ERRO: Botão 'Adicionar Produto' não encontrado no DOM.");
    }
});
