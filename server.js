const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

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

// Função para inicializar Puppeteer apenas quando necessário (lazy loading)
async function getPuppeteer() {
    const puppeteer = require('puppeteer-core');
    
    // Detectar ambiente Vercel
    const isVercel = process.env.VERCEL === '1';
    
    let browser;
    try {
        if (isVercel) {
            // Em produção/Vercel, use chrome-aws-lambda
            const chromium = require('chrome-aws-lambda');
            browser = await puppeteer.launch({
                args: chromium.args,
                executablePath: await chromium.executablePath,
                headless: chromium.headless,
            });
        } else {
            // Em ambiente local, use configurações padrão
            browser = await puppeteer.launch({
                headless: "new",
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            });
        }
        return { puppeteer, browser };
    } catch (error) {
        console.error("Erro ao inicializar Puppeteer:", error);
        throw error;
    }
}

// Rota de teste simples
app.get('/api/test', (req, res) => {
  console.log('✅ Rota /api/test acionada');
  res.status(200).json({ message: 'API está funcionando!' });
});

// Rota para gerar PDF - Modificada para compatibilidade com Vercel
app.post('/gerar-pdf', async (req, res) => {
  console.log('📄 Rota /gerar-pdf ACIONADA!'); // Log adicionado aqui
  console.log('📄 Iniciando geração do PDF...');
  let browser;
  
  try {
    const conteudo = req.body.conteudo;
    
    // Usar memória em vez de arquivo temporário
    console.log('🌐 Inicializando Puppeteer...');
    
    // Tentar carregar puppeteer-core e chrome-aws-lambda primeiro (para Vercel)
    try {
        const { puppeteer, browser: initializedBrowser } = await getPuppeteer();
        browser = initializedBrowser;
    } catch (error) {
        console.error('❌ Erro ao inicializar Puppeteer:', error);
        return res.status(500).json({ error: 'Erro ao inicializar gerador de PDF' });
    }

    console.log('📃 Criando nova página...');
    const page = await browser.newPage();
    
    // Usar conteúdo diretamente em vez de arquivo
    console.log('🔍 Definindo conteúdo HTML...');
    await page.setContent(conteudo, {
      waitUntil: 'networkidle0',
      timeout: 30000 // 30 segundos de timeout (reduzido para ambiente serverless)
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
    browser = null;

    console.log('✅ PDF gerado com sucesso!');
    
    // Enviar o PDF como resposta
    res.type('application/pdf');
    res.send(pdfBuffer);
    
  } catch (err) {
    console.error("❌ Erro ao gerar PDF:", err);
    // Tentar fechar o navegador em caso de erro
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        console.error("Erro ao fechar navegador:", closeErr);
      }
    }
    res.status(500).json({ error: 'Erro ao gerar PDF: ' + err.message });
  }
});

// Verificar se o script está sendo executado diretamente (não como import/require)
if (require.main === module) {
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
}

// Para compatibilidade com Vercel, também exportamos a aplicação
module.exports = app;

// Adicione um handler específico para serverless
if (process.env.VERCEL) {
  // Exportar um handler serverless
  module.exports = (req, res) => {
    // Verifique se req.url tem a rota correta
    console.log(`[Vercel Handler] Recebendo requisição para: ${req.url}, método: ${req.method}`);
    
    // Manter compatibilidade com o Express padrão
    return app(req, res);
  };
}

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não tratado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promessa rejeitada não tratada:', reason);
});
