/**
 * Script de diagnóstico para identificar problemas com os botões
 */
console.log('Script de diagnóstico carregado');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM completamente carregado (diagnóstico)');
    
    // Verificar os principais botões
    const botoes = [
        'definir-fundo',
        'adicionar-produto',
        'adicionar-decoracao',
        'gerar-pdf',
        'mostrar-info'
    ];
    
    botoes.forEach(id => {
        const botao = document.getElementById(id);
        if (botao) {
            console.log(`Diagnóstico: Botão '${id}' encontrado.`);
            // Remover listener de clique daqui para evitar conflitos
            // botao.addEventListener('click', function() {
            //     console.log(`Diagnóstico: Botão '${id}' clicado`);
            // });
        } else {
            console.error(`Diagnóstico ERRO: Botão '${id}' NÃO encontrado.`);
        }
    });
    
    // Verificar se há erros de JavaScript
    window.addEventListener('error', function(e) {
        console.error('Diagnóstico: Erro JavaScript detectado:', e.message, 'em', e.filename, 'linha', e.lineno);
    });
});
