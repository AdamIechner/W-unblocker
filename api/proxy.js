const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Web Unblocker Proxy</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
            }
            
            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }
            
            .header {
                text-align: center;
                padding: 40px 20px;
                background: rgba(255, 255, 255, 0.95);
                border-radius: 20px;
                margin-bottom: 30px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            
            h1 {
                color: #333;
                margin-bottom: 10px;
                font-size: 2.5em;
            }
            
            .subtitle {
                color: #666;
                margin-bottom: 30px;
            }
            
            .url-form {
                display: flex;
                gap: 10px;
                max-width: 600px;
                margin: 0 auto;
            }
            
            .url-input {
                flex: 1;
                padding: 15px;
                font-size: 16px;
                border: 2px solid #ddd;
                border-radius: 10px;
                transition: border-color 0.3s;
            }
            
            .url-input:focus {
                outline: none;
                border-color: #667eea;
            }
            
            .go-btn {
                padding: 15px 30px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
                transition: transform 0.2s;
            }
            
            .go-btn:hover {
                transform: translateY(-2px);
            }
            
            .iframe-container {
                background: white;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                min-height: 600px;
            }
            
            iframe {
                width: 100%;
                height: 80vh;
                border: none;
            }
            
            .info {
                text-align: center;
                color: white;
                margin-top: 20px;
                padding: 10px;
            }
            
            .error {
                background: #ff4444;
                color: white;
                padding: 10px;
                border-radius: 10px;
                margin-top: 10px;
                display: none;
            }
            
            @media (max-width: 768px) {
                .url-form {
                    flex-direction: column;
                }
                
                .go-btn {
                    width: 100%;
                }
                
                iframe {
                    height: 60vh;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🌐 Web Unblocker Proxy</h1>
                <p class="subtitle">Access any website freely and securely</p>
                <div class="url-form">
                    <input type="text" id="urlInput" class="url-input" placeholder="Enter URL (e.g., https://example.com)" value="https://">
                    <button onclick="loadSite()" class="go-btn">Go →</button>
                </div>
                <div id="errorMsg" class="error"></div>
            </div>
            
            <div class="iframe-container">
                <iframe id="contentFrame" src="about:blank"></iframe>
            </div>
            <div class="info">
                <p>🔒 Your requests are proxied through our server for privacy and access</p>
            </div>
        </div>
        
        <script>
            async function loadSite() {
                let url = document.getElementById('urlInput').value;
                const errorDiv = document.getElementById('errorMsg');
                const iframe = document.getElementById('contentFrame');
                
                // Add https:// if no protocol specified
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    url = 'https://' + url;
                }
                
                try {
                    errorDiv.style.display = 'none';
                    iframe.style.display = 'block';
                    
                    // Load via proxy
                    const proxyUrl = '/api/proxy?url=' + encodeURIComponent(url);
                    iframe.src = proxyUrl;
                    
                    // Update URL input with full URL
                    document.getElementById('urlInput').value = url;
                } catch (error) {
                    errorDiv.textContent = 'Error loading site: ' + error.message;
                    errorDiv.style.display = 'block';
                    iframe.style.display = 'none';
                }
            }
            
            // Handle enter key
            document.getElementById('urlInput').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    loadSite();
                }
            });
            
            // Load example site on startup
            setTimeout(() => {
                document.getElementById('urlInput').value = 'https://example.com';
                loadSite();
            }, 500);
        </script>
    </body>
    </html>
  `);
});

// Proxy endpoint
app.get('/api/proxy', async (req, res) => {
  try {
    let targetUrl = req.query.url;
    
    if (!targetUrl) {
      return res.status(400).send('URL parameter is required');
    }
    
    // Validate and clean URL
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }
    
    // Fetch the target website
    const response = await axios({
      method: 'get',
      url: targetUrl,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      maxRedirects: 5,
      timeout: 10000,
      responseType: 'arraybuffer'
    });
    
    // Get content type
    const contentType = response.headers['content-type'] || 'text/html';
    
    // Check if it's HTML content
    if (contentType.includes('text/html')) {
      let html = response.data.toString('utf-8');
      const $ = cheerio.load(html);
      
      // Rewrite all links to go through proxy
      $('a').each((i, elem) => {
        const $elem = $(elem);
        let href = $elem.attr('href');
        if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
          if (href.startsWith('/')) {
            // Relative path - need to construct full URL
            const baseUrl = new URL(targetUrl);
            href = baseUrl.origin + href;
          } else if (!href.startsWith('http://') && !href.startsWith('https://')) {
            // Handle relative URLs without leading slash
            const baseUrl = new URL(targetUrl);
            href = baseUrl.origin + '/' + href;
          }
          $elem.attr('href', `/api/proxy?url=${encodeURIComponent(href)}`);
        }
      });
      
      // Rewrite form actions
      $('form').each((i, elem) => {
        const $elem = $(elem);
        let action = $elem.attr('action');
        if (action) {
          if (action.startsWith('/')) {
            const baseUrl = new URL(targetUrl);
            action = baseUrl.origin + action;
          } else if (!action.startsWith('http://') && !action.startsWith('https://')) {
            const baseUrl = new URL(targetUrl);
            action = baseUrl.origin + '/' + action;
          }
          $elem.attr('action', `/api/proxy?url=${encodeURIComponent(action)}`);
        }
      });
      
      // Rewrite img src
      $('img').each((i, elem) => {
        const $elem = $(elem);
        let src = $elem.attr('src');
        if (src && !src.startsWith('data:')) {
          if (src.startsWith('/')) {
            const baseUrl = new URL(targetUrl);
            src = baseUrl.origin + src;
          } else if (!src.startsWith('http://') && !src.startsWith('https://')) {
            const baseUrl = new URL(targetUrl);
            src = baseUrl.origin + '/' + src;
          }
          $elem.attr('src', src);
        }
      });
      
      // Rewrite link and script tags
      $('link[rel="stylesheet"]').each((i, elem) => {
        const $elem = $(elem);
        let href = $elem.attr('href');
        if (href && !href.startsWith('data:')) {
          if (href.startsWith('/')) {
            const baseUrl = new URL(targetUrl);
            href = baseUrl.origin + href;
          } else if (!href.startsWith('http://') && !href.startsWith('https://')) {
            const baseUrl = new URL(targetUrl);
            href = baseUrl.origin + '/' + href;
          }
          $elem.attr('href', href);
        }
      });
      
      $('script').each((i, elem) => {
        const $elem = $(elem);
        let src = $elem.attr('src');
        if (src && !src.startsWith('data:')) {
          if (src.startsWith('/')) {
            const baseUrl = new URL(targetUrl);
            src = baseUrl.origin + src;
          } else if (!src.startsWith('http://') && !src.startsWith('https://')) {
            const baseUrl = new URL(targetUrl);
            src = baseUrl.origin + '/' + src;
          }
          $elem.attr('src', src);
        }
      });
      
      html = $.html();
      res.set('Content-Type', 'text/html');
      res.send(html);
    } else {
      // For non-HTML content, just forward the response
      res.set('Content-Type', contentType);
      res.send(response.data);
    }
    
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Proxy Error</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .error-container {
            background: rgba(255,255,255,0.95);
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
            margin: 0 auto;
            color: #333;
          }
          h1 { color: #ff4444; }
          button {
            margin-top: 20px;
            padding: 10px 20px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <h1>⚠️ Proxy Error</h1>
          <p>Failed to load the requested page.</p>
          <p><strong>Error:</strong> ${error.message}</p>
          <button onclick="history.back()">Go Back</button>
        </div>
      </body>
      </html>
    `);
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
  });
}

// Export for Vercel
module.exports = app;
