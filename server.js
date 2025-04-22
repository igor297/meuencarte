const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

// Verificar se o Puppeteer está instalado
let puppeteer;
try {
    puppeteer = require('puppeteer');
    console.log('✅ Puppeteer carregado com sucesso');
} catch (error) {
    console.error('❌ Erro ao carregar Puppeteer:', error.message);
    console.log('Por favor, execute: npm install puppeteer');
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '50mb'}));

// Configurações para desabilitar cache durante desenvolvimento
app.use((req, res, next) => {
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
    res.header('Surrogate-Control', 'no-store');
    next();
});

// Serve arquivos estáticos com versão baseada no timestamp para evitar cache
app.use(express.static('public', {
    etag: false,
    lastModified: false,
    setHeaders: (res) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
    }
}));

// Rota principal - Modificada para incluir versão de cache
app.get('/', (req, res) => {
    // Adicionar timestamp ou versão para evitar cache
    const version = Date.now();
    const indexPath = path.join(__dirname, 'public', 'index.html');
    
    fs.readFile(indexPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Erro ao carregar a página.');
        }
        
        // Substituir as referências a arquivos CSS e JS com parâmetros de versão
        const updatedData = data.replace(/(href=["']css\/[^"']+["'])/g, `$1?v=${version}`)
                               .replace(/(src=["']js\/[^"']+["'])/g, `$1?v=${version}`);
        
        res.send(updatedData);
    });
});

// Rota para gerar PDF com puppeteer
app.post('/gerar-pdf', async (req, res) => {
  console.log('📄 Iniciando geração do PDF...');
  
  try {
    const conteudo = req.body.conteudo;
    
    // Usar sistema de arquivo temporário para salvar o HTML
    const tempHtmlPath = path.join(__dirname, 'temp_pdf.html');
    console.log(`💾 Salvando HTML temporário em: ${tempHtmlPath}`);
    fs.writeFileSync(tempHtmlPath, conteudo);

    console.log('🌐 Iniciando navegador Chrome headless...');
    // Iniciar o navegador com opções otimizadas
    const browser = await puppeteer.launch({
      headless: "new", // Usar a nova versão do headless
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    console.log('📃 Criando nova página...');
    const page = await browser.newPage();
    
    // Navegar para o arquivo HTML temporário
    console.log('🔍 Carregando conteúdo HTML...');
    await page.goto(`file://${tempHtmlPath}`, {
      waitUntil: 'networkidle0',
      timeout: 60000 // 60 segundos de timeout, mais do que o padrão
    });

    // Configurar o tamanho da página para A4
    console.log('📐 Configurando tamanho de página A4...');
    await page.setViewport({
      width: 794, // A4 width in pixels (aproximadamente 210mm)
      height: 1123, // A4 height in pixels (aproximadamente 297mm)
      deviceScaleFactor: 1.5 // Para melhor qualidade
    });

    // Criar o PDF
    console.log('🖨️ Gerando PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: true
    });

    // Fechar o navegador
    console.log('🔒 Fechando navegador...');
    await browser.close();

    // Excluir o arquivo temporário
    if (fs.existsSync(tempHtmlPath)) {
      console.log('🗑️ Excluindo arquivo HTML temporário...');
      fs.unlinkSync(tempHtmlPath);
    }

    console.log('✅ PDF gerado com sucesso!');
    
    // Enviar o PDF como resposta
    res.type('application/pdf');
    res.send(pdfBuffer);
    
  } catch (err) {
    console.error("❌ Erro ao gerar PDF:", err);
    res.status(500).json({ error: 'Erro ao gerar PDF: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`
  =============================================
   Meu Encarte - Servidor rodando na porta ${PORT}
  =============================================
   - Acesse: http://localhost:${PORT}
   - Pressione Ctrl+C para encerrar
  =============================================
  `);
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não tratado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promessa rejeitada não tratada:', reason);
});
