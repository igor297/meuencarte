/**
 * Script para gerenciar o cache e forçar recarregamentos quando necessário
 */

console.log('Cache cleaner inicializado');

// Função para limpar todo o cache armazenado no navegador
async function limparTodoCache() {
    try {
        // Verifica se a API de cache está disponível no navegador
        if ('caches' in window) {
            // Obtém todos os nomes de cache
            const cacheNames = await caches.keys();
            
            // Exclui todos os caches
            await Promise.all(
                cacheNames.map(cacheName => {
                    console.log(`Limpando cache: ${cacheName}`);
                    return caches.delete(cacheName);
                })
            );
            
            console.log('Cache limpo com sucesso');
        } else {
            console.log('API de cache não suportada neste navegador');
        }
    } catch (error) {
        console.error('Erro ao limpar cache:', error);
    }
}

// Configuração de evento para recarregar com F5
document.addEventListener('keydown', function(e) {
    if (e.key === 'F5') {
        e.preventDefault();
        limparTodoCache().then(() => location.reload(true));
    }
});

// Função para limpar cache programaticamente (pode ser chamada de outros scripts se necessário)
window.limparCacheERecarregar = function() {
    limparTodoCache().then(() => location.reload(true));
};
