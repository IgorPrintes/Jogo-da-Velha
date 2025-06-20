// Aguarda o carregamento completo do DOM antes de executar o script
document.addEventListener('DOMContentLoaded', () => {

    // --- CONSTANTES ---
    const ICON_URL_MULTIPLAYER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXJzLWljb24gbHVjaWRlLXVzZXJzIj48cGF0aCBkPSJNMTYgMjF2LTJhNCA0IDAgMCAwLTQtNEg2YTQgNCAwIDAgMC00IDR2MiIvPjxwYXRoIGQ9Ik0xNiAzLjEyOGE0IDQgMCAwIDEgMCA3Ljc0NCIvPjxwYXRoIGQ9Ik0yMiAyMXYtMmE0IDQgMCAwIDAtMy0zLjg3Ii8+PGNpcmNsZSBjeD0iOSIgY3k9IjciIHI9IjQiLz48L3N2Zz4=';
    const ICON_URL_SINGLE_PLAYER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWJvdC1pY29uIGx1Y2lkZS1ib3QiPjxwYXRoIGQ9Ik0xMiA4VjRIOCIvPjxyZWN0IHdpZHRoPSIxNiIgaGVpZ2h0PSIxMiIgeD0iNCIgeT0iOCIgcng9IjIiLz48cGF0aCBkPSJNMiAxNGgyIi8+PHBhdGggZD0iTTIwIDE0aDIiLz48cGF0aCBkPSJNMTUgMTN2MiIvPjxwYXRoIGQ9Ik05IDEzdjIiLz48L3N2Zz4=';

    // --- SELEÇÃO DOS ELEMENTOS DO DOM ---
    // Seleciona todas as células do tabuleiro
    const cells = document.querySelectorAll('.cell');
    // Seleciona a área de mensagem de status
    const statusMessage = document.getElementById('status-message');
    // Seleciona o botão de reiniciar
    const resetButton = document.getElementById('reset-button');
    // Seleciona o botão de modo de jogo e seus componentes
    const modeButton = document.getElementById('mode-button');
    const modeIcon = document.getElementById('mode-icon');
    const modeText = document.getElementById('mode-text');
    // Seleciona os spans do placar
    const scoreXElement = document.getElementById('score-x');
    const scoreOElement = document.getElementById('score-o');
    const scoreTiesElement = document.getElementById('score-ties');

    // Chave para armazenar o estado do jogo no localStorage
    const LOCAL_STORAGE_KEY = 'tictactoeGameState';
    // Seleciona o elemento da linha de vitória
    const strikeLine = document.getElementById('strike-line');

    // --- ESTADO DO JOGO ---
    // 'pvp' para Jogador vs Jogador, 'pvb' para Jogador vs Bot
    let gameMode = 'pvp'; 
    // Jogador atual, 'X' sempre começa
    let currentPlayer = 'X';
    // Representação do tabuleiro. Array de 9 posições, inicialmente vazias
    let board = ['', '', '', '', '', '', '', '', ''];
    // Flag para controlar se o jogo está ativo ou se já terminou
    let isGameActive = true;
    // Objeto para armazenar o placar
    let score = { X: 0, O: 0, ties: 0 };

    // --- CONDIÇÕES DE VITÓRIA ---
    // Array com todas as combinações possíveis para vencer
    // Cada condição está acoplada ao seu tipo e índice para aplicar o estilo CSS correto.
    const winningCombos = [
        { condition: [0, 1, 2], type: 'horizontal', index: 0 },
        { condition: [3, 4, 5], type: 'horizontal', index: 1 },
        { condition: [6, 7, 8], type: 'horizontal', index: 2 },
        { condition: [0, 3, 6], type: 'vertical', index: 0 },
        { condition: [1, 4, 7], type: 'vertical', index: 1 },
        { condition: [2, 5, 8], type: 'vertical', index: 2 },
        { condition: [0, 4, 8], type: 'diag1' },
        { condition: [2, 4, 6], type: 'diag2' }
    ];

    // --- FUNÇÕES PRINCIPAIS ---

    /**
     * Lida com o clique em uma célula do tabuleiro.
     * @param {MouseEvent} event - O evento de clique.
     */
    const handleCellClick = (event) => {
        const clickedCell = event.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        // Verifica se a célula já foi preenchida ou se o jogo terminou
        if (board[clickedCellIndex] !== '' || !isGameActive) {
            return;
        }

        // Processa a jogada
        placeMark(clickedCellIndex);
        checkResult();

        // Se o jogo ainda estiver ativo e for o modo PvB, o bot joga
        if (isGameActive && gameMode === 'pvb' && currentPlayer === 'O') {
            // Adiciona um pequeno delay para a jogada do bot parecer mais natural
            setTimeout(botMove, 500);
        }
    };

    /**
     * Coloca a marca ('X' ou 'O') no tabuleiro e na UI.
     * @param {number} index - O índice da célula a ser marcada.
     */
    const placeMark = (index) => {
        board[index] = currentPlayer;
        cells[index].textContent = currentPlayer;
        // Adiciona a classe do jogador ('x' ou 'o') e a classe de animação 'pop'
        cells[index].classList.add(currentPlayer.toLowerCase());
        cells[index].classList.add('pop');
        saveGameState(); // Salva o estado do jogo após cada jogada
    };

    /**
     * Verifica o resultado do jogo (vitória, empate ou continuação).
     */
    const checkResult = () => {
        let roundWon = false;
        let winningCombo = null;

        for (const combo of winningCombos) {
            const { condition } = combo;
            const a = board[condition[0]];
            const b = board[condition[1]];
            const c = board[condition[2]];

            if (a === '' || b === '' || c === '') continue;

            if (a === b && b === c) {
                roundWon = true; // Encontrou um vencedor
                winningCombo = combo; // Salva o objeto da combinação vencedora
                break;
            }
        }

        if (roundWon) {
            statusMessage.textContent = `Jogador ${currentPlayer} venceu!`;
            isGameActive = false;
            updateScore(currentPlayer);
            applyWinningAnimation(winningCombo);
            saveGameState(); // Salva o estado após a vitória
            return;
        }

        // Verifica se houve empate (nenhuma célula vazia sobrando)
        if (!board.includes('')) {
            statusMessage.textContent = 'O jogo empatou!';
            isGameActive = false; // O jogo termina em empate
            updateScore('ties');
            saveGameState(); // Salva o estado após o empate
            return;
        }

        // Se ninguém venceu e não empatou, troca o jogador
        switchPlayer();
    };

    /**
     * Aplica as animações de vitória.
     * @param {object} winningCombo - O objeto contendo a condição e a classe da linha.
     */
    const applyWinningAnimation = (winningCombo) => {
        const { condition, type, index } = winningCombo;
        // Adiciona a classe de destaque às células vencedoras
        condition.forEach(cellIndex => {
            cells[cellIndex].classList.add('winning-cell');
        });

        // Adiciona a classe do tipo de vitória para posicionar a linha
        strikeLine.classList.add(type);

        // Define a variável CSS para a posição da linha, se for horizontal ou vertical
        if (type === 'horizontal') {
            strikeLine.style.setProperty('--row', index);
        } else if (type === 'vertical') {
            strikeLine.style.setProperty('--col', index);
        }
        strikeLine.classList.add('visible');
    };

    /**
     * Troca o jogador atual e atualiza a mensagem de status.
     */
    const switchPlayer = () => {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusMessage.textContent = `É a vez do Jogador ${currentPlayer}`;
    };

    /**
     * Salva o estado atual do jogo no localStorage.
     */
    const saveGameState = () => {
        const gameState = {
            board: board,
            currentPlayer: currentPlayer,
            gameMode: gameMode,
            score: score,
            isGameActive: isGameActive // Salva também se o jogo está ativo
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(gameState));
        console.log('Estado do jogo salvo.');
    };

    /**
     * Carrega o estado do jogo do localStorage, se existir.
     * @returns {boolean} True se o estado foi carregado, false caso contrário.
     */
    const loadGameState = () => {
        const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedState) {
            const gameState = JSON.parse(savedState);
            board = gameState.board;
            currentPlayer = gameState.currentPlayer;
            gameMode = gameState.gameMode;
            score = gameState.score;
            isGameActive = gameState.isGameActive;

            // Atualiza a UI com o estado carregado
            cells.forEach((cell, index) => {
                cell.textContent = board[index];
                cell.className = 'cell'; // Limpa classes anteriores
                if (board[index]) cell.classList.add(board[index].toLowerCase());
            });
            statusMessage.textContent = `É a vez do Jogador ${currentPlayer}`;
            updateScore(); // Atualiza o placar na UI
            updateModeButtonUI(); // Atualiza a UI do botão de modo
            strikeLine.className = 'strike'; // Garante que a linha de vitória esteja escondida ao carregar
            console.log('Estado do jogo carregado.');
            return true;
        }
        return false;
    };

    /**
     * Encontra uma jogada que resultaria em vitória para um determinado jogador.
     * @param {string} player - O jogador ('X' ou 'O') para verificar.
     * @returns {number|null} - O índice da jogada vencedora ou null se não houver.
     */
    const findWinningMove = (player) => {
        for (const { condition } of winningCombos) {
            const [a, b, c] = condition;
            // Verifica se duas células são do jogador e uma está vazia
            if (board[a] === player && board[b] === player && board[c] === '') return c;
            if (board[a] === player && board[c] === player && board[b] === '') return b;
            if (board[b] === player && board[c] === player && board[a] === '') return a;
        }
        return null; // Nenhuma jogada vencedora encontrada
    };

    /**
     * Lógica para a jogada do Bot.
     * A estratégia segue uma ordem de prioridade:
     * 1. Vencer: Se o Bot pode vencer, ele faz a jogada.
     * 2. Bloquear: Se o jogador está prestes a vencer, o Bot o bloqueia.
     * 3. Centro: Tenta ocupar a casa central.
     * 4. Canto: Tenta ocupar um canto vazio.
     * 5. Lado: Ocupa uma casa lateral vazia como último recurso.
     */
    const botMove = () => {
        if (!isGameActive) return;

        // 1. Tentar vencer (o Bot é 'O')
        let move = findWinningMove('O');
        if (move !== null) {
            placeMark(move);
            checkResult();
            return;
        }

        // 2. Tentar bloquear o jogador ('X')
        move = findWinningMove('X');
        if (move !== null) {
            placeMark(move);
            checkResult();
            return;
        }

        // 3. Tentar pegar o centro
        if (board[4] === '') {
            placeMark(4);
            checkResult();
            return;
        }

        // 4. Tentar pegar um canto vazio
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(index => board[index] === '');
        if (availableCorners.length > 0) {
            const randomCorner = availableCorners[Math.floor(Math.random() * availableCorners.length)];
            placeMark(randomCorner);
            checkResult();
            return;
        }

        // 5. Tentar pegar um lado vazio
        const sides = [1, 3, 5, 7];
        const availableSides = sides.filter(index => board[index] === '');
        if (availableSides.length > 0) {
            const randomSide = availableSides[Math.floor(Math.random() * availableSides.length)];
            placeMark(randomSide);
            checkResult();
            return;
        }
    };
    /**
     * Atualiza o placar na memória e na tela.
     * @param {string} winner - 'X', 'O' ou 'ties'.
     */
    const updateScore = (winner) => {
        if (winner === 'ties') {
            score.ties++;
        } else {
            score[winner]++;
        }
        scoreXElement.textContent = score.X;
        scoreOElement.textContent = score.O;
        scoreTiesElement.textContent = score.ties;
    };

    /**
     * Reinicia o jogo para uma nova partida.
     */
    const resetGame = () => {
        board = ['', '', '', '', '', '', '', '', ''];
        isGameActive = true;
        currentPlayer = 'X';
        statusMessage.textContent = `É a vez do Jogador ${currentPlayer}`;

        cells.forEach(cell => {
            cell.textContent = '';
            // Remove todas as classes de estado, mantendo apenas 'cell'
            cell.className = 'cell';
        });
        // Esconde a linha de vitória
        strikeLine.className = 'strike'; // Garante que a linha de vitória esteja escondida
        clearGameState(); // Limpa o checkpoint ao reiniciar
    };

    /**
     * Alterna entre os modos de jogo (PvP e PvB) ao clicar no botão.
     */
    const toggleMode = () => {
        gameMode = gameMode === 'pvp' ? 'pvb' : 'pvp';
        updateModeButtonUI();
        // Reinicia o jogo e o placar ao trocar de modo
        score = { X: 0, O: 0, ties: 0 }; // Zera o placar
        updateScore(); // Atualiza a UI do placar
        resetGame(); // Reinicia o tabuleiro e limpa o checkpoint
    };

    /**
     * Atualiza a aparência do botão de modo (ícone e texto) com base no estado atual.
     */
    const updateModeButtonUI = () => {
        if (gameMode === 'pvp') {
            modeIcon.innerHTML = `<img src="${ICON_URL_MULTIPLAYER}" alt="Multiplayer">`;
            modeText.textContent = 'Jogador vs Jogador';
        } else {
            modeIcon.innerHTML = `<img src="${ICON_URL_SINGLE_PLAYER}" alt="Single Player">`;
            modeText.textContent = 'Jogador vs Bot';
        }
    };

    /**
     * Limpa o estado do jogo salvo no localStorage.
     */
    const clearGameState = () => {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        console.log('Checkpoint do jogo limpo.');
    };
    
    /**
     * Define o estado inicial da aplicação.
     */
    const initializeApp = () => {
        // Tenta carregar um estado salvo, se não houver, inicializa do zero
        loadGameState();
        updateModeButtonUI(); // Garante que o botão esteja sempre no estado correto ao carregar
    };

    // --- ADIÇÃO DOS EVENT LISTENERS ---
    // Adiciona um listener de clique para cada célula
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    // Adiciona um listener de clique para o botão de reiniciar
    resetButton.addEventListener('click', resetGame);
    // Adiciona um listener de clique para o botão de modo de jogo
    modeButton.addEventListener('click', toggleMode);

    // Inicia a aplicação
    initializeApp();
});