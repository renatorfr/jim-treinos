# Jim Treinos — PWA Mobile & Google Sheets Tracker

Aplicativo web progressivo (PWA) desenvolvido sob medida para acompanhar as fichas de treino do **Prof. Marco Jim Gui Vallin** (Circuitos Bi-set `Cir 1..6`, pausas duplas `10s / 60s`, treinos `A / B / C / D`, contagem de sessões no calendário e evolução de cargas), sincronizando diretamente com uma planilha no seu **Google Drive**.

---

## ✨ Funcionalidades

- **Fichas Pré-carregadas (`Micro 02` e `Micro 01`)**: Todos os circuitos, exercícios, séries, repetições, aquecimentos e alongamentos dos seus PDFs já estão cadastrados em [`data.js`](./data.js).
- **Tema Escuro Pastel Suave**: Cores escuras confortáveis para usar na academia com tons pastéis suaves (verde sálvia, lavanda, pêssego e azul sereno) sem cores neon/chamativas.
- **Timer Duplo Inteligente (`10s / 60s` ou `10s / 45s`)**:
  - Ao concluir a série do 1º exercício do circuito (`1A`), inicia automaticamente o timer de **10s** (transição).
  - Ao concluir a série do 2º exercício do circuito (`1B`), inicia automaticamente o timer de **60s** (ou **45s** no Micro 01).
  - Inclui também timers dedicados para os intervalos do **Treino D (Cardio Bike/Elíptico)**.
- **Memória de Carga & Sugestão do Próximo Treino**:
  - Preenche automaticamente o peso (`kg`) e as repetições com base na última sessão daquele exercício (inclusive aproveitando cargas do `Micro 01` no `Micro 02`).
  - Destaca automaticamente qual é o **Próximo Treino (`A`, `B`, `C` ou `D`)** da sequência.
- **Funciona Offline na Academia**: Salva tudo instantaneamente no celular (`localStorage`) e sincroniza com a Planilha Google assim que houver conexão.

---

## 🚀 Passo a Passo de Implantação

### Parte 1: Configurar a Planilha no Google Drive (Compatível com Proteção Avançada)

1. Acesse o [Google Sheets](https://sheets.new) e crie uma nova planilha chamada **`Jim Treinos - Renato Freire`**.
2. No menu superior da planilha, clique em **Extensões** $\rightarrow$ **Apps Script**.
3. Apague o código padrão que estiver lá e cole todo o conteúdo do arquivo [`google-apps-script/Code.gs`](./google-apps-script/Code.gs) — ele inclui a diretiva `/** @OnlyCurrentDoc */` no topo, que restringe a permissão **exclusivamente a esta única planilha** (`spreadsheets.currentonly`) em vez de todos os arquivos do Drive.
4. *(Importante se você já havia tentado executar antes)* Para garantir que o Apps Script limpe o escopo antigo e peça permissão **apenas para este arquivo**:
   - No menu lateral esquerdo do Apps Script, clique no ícone de **Engrenagem (Configurações do projeto)**.
   - Marque a caixa **"Mostrar o arquivo de manifesto 'appsscript.json' no editor"**.
   - Volte para o **Editor (`< >`)**, clique no arquivo `appsscript.json` à esquerda e substitua o conteúdo pelo de [`google-apps-script/appsscript.json`](./google-apps-script/appsscript.json) (que define explicitamente `"oauthScopes": ["https://www.googleapis.com/auth/spreadsheets.currentonly"]`).
5. Clique no ícone de **Salvar** (disquete ou `Ctrl+S`).
6. *(Opcional)* No topo do editor Apps Script, selecione `setupPlanilha` e clique em **Executar**. Agora o Google solicitará acesso **somente à planilha onde o script está instalado** (escopo não-sensível, permitido pela Proteção Avançada).
7. No canto superior direito, clique em **Implantar** $\rightarrow$ **Nova implantação**:
   - Clique na engrenagem ao lado de "Selecionar tipo" e escolha **App da Web**.
   - **Descrição**: `Webhook Jim Treinos`
   - **Executar como**: `Eu (seu e-mail)`
   - **Quem pode acessar**: `Qualquer pessoa` *(necessário para que o app no celular consiga enviar dados sem bloqueio de CORS)*.
   - Clique em **Implantar** e copie a **URL do App da Web** gerada (`https://script.google.com/macros/s/.../exec`).

---

### Parte 2: Publicar o App no GitHub Pages (Gratuito)

1. Crie um repositório no seu GitHub chamado `jim-treinos`.
2. Envie o código desta pasta para o GitHub:
   ```bash
   git add .
   git commit -m "Initial commit: Jim Treinos PWA + Google Sheets webhook"
   git branch -M main
   git remote add origin git@github.com:SEU_USUARIO/jim-treinos.git
   git push -u origin main
   ```
3. No GitHub, abra o repositório e vá em **Settings** $\rightarrow$ **Pages** (no menu lateral esquerdo).
4. Em **Build and deployment** $\rightarrow$ **Source**, escolha **Deploy from a branch**.
5. Selecione a branch **`main`** e a pasta **`/ (root)`**, depois clique em **Save**.
6. Aguarde ~1 minuto e acesse `https://SEU_USUARIO.github.io/jim-treinos/` pelo navegador do seu celular!

---

### Parte 3: Conectar e Instalar no Celular

1. Abra o link do app no celular (Chrome no Android ou Safari no iPhone).
2. Toque na aba **Planilha** (no menu inferior):
   - Cole a **URL do Webhook** gerada na Parte 1 e toque em **Salvar Conexão**.
   - Toque em **📤 Enviar Fichas (Micro 01 e 02) p/ Planilha** para preencher a aba `Planos` da sua planilha com todos os exercícios.
3. **Adicione à Tela Inicial do Celular**:
   - **No Android (Chrome)**: Toque nos 3 pontinhos $\rightarrow$ **Instalar aplicativo** (ou *Adicionar à tela inicial*).
   - **No iPhone (Safari)**: Toque no botão **Compartilhar** $\rightarrow$ **Adicionar à Tela de Início**.

---

## 📄 Como adicionar novas fichas (`Micro 03`, `Micro 04`...)

Quando o Marco enviar um novo PDF:
- Basta abrir esta pasta no **Antigravity**, anexar o PDF novo na conversa e pedir: *"Adicione esta nova ficha Micro 03 ao `data.js`"* e depois fazer `git push`!
