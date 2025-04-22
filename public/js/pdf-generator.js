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
