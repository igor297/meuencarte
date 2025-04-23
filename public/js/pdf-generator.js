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
 */
function imprimirEncarteNoNavegador(decoracoesHTML, produtosHTML, fundoAtual) {
    // Criar uma nova janela para impressão
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert("O bloqueador de pop-ups impediu a abertura da janela de impressão. Por favor, permita pop-ups para este site.");
        return false;
    }
    
    // Construir o HTML para impressão
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
                
                body {
                    width: 210mm;
                    height: 297mm;
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                    background-color: white;
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
                
                .produto-card {
                    width: 150px;
                    height: 280px;
                    border: none !important;
                    border-radius: 0 !important;
                    padding: 10px;
                    display: flex;
                    flex-direction: column;
                    position: absolute;
                    background-color: rgba(255, 255, 255, 0.9);
                    box-sizing: border-box;
                    z-index: 10;
                    box-shadow: none !important;
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
                
                .decoracao-imagem {
                    position: absolute;
                    z-index: 5;
                    border: none !important;
                }
                
                .decoracao-imagem.transparente {
                    background-color: transparent !important;
                }
                
                .decoracao-imagem img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
                
                .produto-controles, .decoracao-controles, .position-info {
                    display: none !important;
                }
                
                .print-instructions {
                    position: fixed;
                    top: 10px;
                    left: 10px;
                    right: 10px;
                    background-color: rgba(0, 102, 204, 0.9);
                    color: white;
                    padding: 15px;
                    border-radius: 5px;
                    text-align: center;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                    z-index: 9999;
                }
                
                .print-instructions button {
                    background-color: white;
                    color: #0066cc;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    margin-top: 10px;
                    cursor: pointer;
                    font-weight: bold;
                }
                
                @media print {
                    .print-instructions {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="print-instructions">
                Para obter o PDF, pressione Ctrl+P (ou ⌘+P no Mac) e selecione "Salvar como PDF". 
                <br>Escolha configuração "Sem margens" para melhor resultado.
                <br><button onclick="window.print()">Imprimir Agora</button>
            </div>
            <div class="a4-page">
                ${decoracoesHTML}
                ${produtosHTML}
            </div>
        </body>
        </html>
    `;
    
    // Escrever o conteúdo na nova janela
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Dar tempo para os recursos carregarem antes de imprimir
    printWindow.setTimeout(() => {
        printWindow.focus();
    }, 300);
    
    return true;
}
