/**
 * Função específica para gerar PDF de uma única página
 */
function prepararConteudoPDF(decoracoesHTML, produtosHTML, fundoAtual) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                /* Definir tamanho fixo de página e evitar quebras */
                @page {
                    size: 210mm 297mm;
                    margin: 0;
                }
                
                html {
                    width: 210mm;
                    height: 297mm;
                }
                
                body {
                    width: 210mm;
                    height: 297mm;
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                    background-color: white;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                
                .a4-page {
                    position: relative;
                    width: 210mm;
                    height: 297mm;
                    box-sizing: border-box;
                    padding: 5mm;
                    overflow: hidden;
                    background-image: ${fundoAtual.url ? `url('${fundoAtual.url}')` : 'none'};
                    background-size: ${fundoAtual.modo === 'repeat' ? 'auto' : fundoAtual.modo};
                    background-repeat: ${fundoAtual.modo === 'repeat' ? 'repeat' : 'no-repeat'};
                    background-position: center;
                }
                
                .a4-page::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: white;
                    opacity: ${1 - fundoAtual.opacidade};
                    z-index: -1;
                }
                
                /* Estilos para produtos */
                .produto-card {
                    width: 150px;
                    height: 280px;
                    border: none !important; /* Removendo a borda para o PDF */
                    border-radius: 0 !important; /* Removendo o border-radius */
                    padding: 10px;
                    display: flex;
                    flex-direction: column;
                    position: absolute;
                    background-color: rgba(255, 255, 255, 0.9);
                    box-sizing: border-box;
                    z-index: 10;
                    box-shadow: none !important; /* Removendo sombras */
                }
                
                .produto-card.transparente {
                    background-color: transparent !important;
                    box-shadow: none;
                }
                
                .produto-imagem {
                    text-align: center;
                    margin-bottom: 10px;
                    height: 150px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .produto-imagem img {
                    max-width: 100%;
                    max-height: 150px;
                    object-fit: contain;
                }
                
                .produto-info {
                    flex: 1;
                    max-height: 110px;
                    overflow: hidden;
                }
                
                .produto-nome {
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                
                .produto-descricao {
                    font-size: 14px;
                    color: #666;
                    margin-bottom: 10px;
                }
                
                .produto-preco {
                    font-size: 20px;
                    font-weight: bold;
                }
                
                /* Estilos para decorações */
                .decoracao-imagem {
                    position: absolute;
                    z-index: 5;
                    border: none !important; /* Removendo bordas das decorações também */
                }
                
                .decoracao-imagem.transparente {
                    background-color: transparent !important;
                }
                
                .decoracao-imagem img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
                
                /* Ocultar controles */
                .produto-controles, .decoracao-controles, .position-info {
                    display: none !important;
                }
            </style>
        </head>
        <body>
            <div class="a4-page">
                ${decoracoesHTML}
                ${produtosHTML}
            </div>
        </body>
        </html>
    `;
}

/**
 * Alternativa para ambiente serverless (Vercel) onde o Puppeteer pode não funcionar
 * Abre uma nova janela com o conteúdo e chama a impressão do navegador.
 */
function imprimirEncarteNoNavegador(decoracoesHTML, produtosHTML, fundoAtual) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert("O bloqueador de pop-ups impediu a abertura da janela de impressão. Por favor, permita pop-ups para este site.");
        return false;
    }

    // Adiciona crossorigin="anonymous" em todas as imagens
    function addCrossorigin(html) {
        return html.replace(/<img /g, '<img crossorigin="anonymous" ');
    }

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>MeuEncarte - Pronto para Impressão</title>
            <style>
                @page {
                    size: 210mm 297mm;
                    margin: 0;
                }
                
                html, body {
                    width: 210mm;
                    height: 297mm;
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                }
                
                /* Forçar impressão de cores e imagens de fundo */
                html, body, .a4-page {
                    -webkit-print-color-adjust: exact !important;
                    color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                
                .a4-page {
                    position: relative;
                    width: 210mm;
                    height: 297mm;
                    box-sizing: border-box;
                    padding: 5mm;
                    background-color: white;
                    background-image: ${fundoAtual.url ? `url('${fundoAtual.url}')` : 'none'};
                    background-size: ${fundoAtual.modo === 'repeat' ? 'auto' : fundoAtual.modo};
                    background-repeat: ${fundoAtual.modo === 'repeat' ? 'repeat' : 'no-repeat'};
                    background-position: center;
                }
                
                .a4-page::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: white;
                    opacity: ${1 - fundoAtual.opacidade};
                    z-index: -1;
                    pointer-events: none;
                }
                
                /* Instruções impressas apenas na tela (não no PDF) */
                .print-instructions {
                    position: fixed;
                    top: 10px;
                    left: 10px;
                    right: 10px;
                    padding: 15px;
                    background-color: #0066cc;
                    color: white;
                    border-radius: 5px;
                    text-align: center;
                    font-family: Arial, sans-serif;
                    z-index: 9999;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                }
                
                .print-instructions button {
                    background-color: white;
                    color: #0066cc;
                    border: none;
                    padding: 8px 20px;
                    margin-top: 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                }
                
                /* Na impressão, ocultar as instruções */
                @media print {
                    .print-instructions {
                        display: none !important;
                    }
                    
                    /* Forçar cores e fundos na impressão */
                    * { print-color-adjust: exact !important; }
                }
                
                /* Estilo para produtos e decorações */
                .produto-card, .decoracao-imagem {
                    position: absolute !important;
                    box-shadow: none !important;
                }
                
                /* Ocultar controles */
                .produto-controles, .decoracao-controles, .position-info {
                    display: none !important;
                }
            </style>
        </head>
        <body>
            <div class="print-instructions">
                <strong>Instruções:</strong> Use Ctrl+P (ou ⌘+P no Mac) e selecione "Salvar como PDF"
                <br>Para melhor resultado, escolha "Sem margens" e "Imprimir fundos"
                <button onclick="window.print()">Imprimir Agora</button>
                <button onclick="window.close()">Fechar</button>
            </div>
            
            <div class="a4-page">
                ${addCrossorigin(decoracoesHTML)}
                ${addCrossorigin(produtosHTML)}
            </div>
            
            <script>
                // Auto-executar print após carregar completo
                window.onload = function() {
                    setTimeout(function() {
                        // Tentar imprimir automaticamente
                        try {
                            window.print();
                        } catch(e) {
                            console.error("Erro ao imprimir automaticamente:", e);
                        }
                    }, 1000);
                };
            </script>
        </body>
        </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    
    return true;
}
