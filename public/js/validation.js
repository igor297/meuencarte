/**
 * Script para validação de campos do formulário
 */

document.addEventListener('DOMContentLoaded', function() {
    // Definir limite de caracteres consistente com script.js
    const DESCRICAO_PRODUTO_LIMITE = 45; // Aproximadamente 3 linhas
    
    // Validar campo de descrição do produto
    const descricaoTextarea = document.getElementById('descricao-produto');
    if (descricaoTextarea) {
        // Atualizar o atributo maxlength
        descricaoTextarea.maxLength = DESCRICAO_PRODUTO_LIMITE;
        
        // Listener de 'input' já está em script.js, mas podemos manter o de 'paste' aqui
        descricaoTextarea.addEventListener('paste', function(e) {
            // Permitir colar, mas depois verificar e truncar se necessário
            setTimeout(() => {
                if (this.value.length > DESCRICAO_PRODUTO_LIMITE) {
                    this.value = this.value.substring(0, DESCRICAO_PRODUTO_LIMITE);
                    // Tenta chamar a função global de atualização do contador, se existir
                    if (typeof atualizarContadorDescricao === 'function') {
                        atualizarContadorDescricao();
                    }
                    alert(`A descrição foi truncada para o limite de ${DESCRICAO_PRODUTO_LIMITE} caracteres.`);
                }
            }, 0);
        });

        // A função atualizarContador foi movida para script.js como atualizarContadorDescricao
        // para ser acessível globalmente (inclusive no limparFormulario)
    }
});
