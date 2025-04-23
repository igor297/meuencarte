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
                
                @media print {
                    .print-instructions {
                        display: none;
                    }
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
    
    // Escrever o conteúdo na nova janela
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Dar tempo para os recursos carregarem e chamar a impressão da janela principal
    printWindow.onload = function() { // Esperar o carregamento completo da nova janela
        setTimeout(() => {
            try {
                printWindow.focus(); // Focar na janela
                printWindow.print(); // Chamar a impressão
                // printWindow.close(); // Opcional: fechar a janela após a impressão (pode ser bloqueado)
            } catch (e) {
                console.error("Erro ao tentar imprimir:", e);
                alert("Não foi possível iniciar a impressão automaticamente. Por favor, use Ctrl+P na janela que abriu.");
            }
        }, 500); // Atraso de 500ms para garantir carregamento
    };
    
    return true;
}
