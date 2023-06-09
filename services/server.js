// Configuração do servidor
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const path = require('path');
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));
// ...

app.get('/', (req, res) => {
  const filePath = path.join(publicPath, 'index.html');
  res.sendFile(filePath);
});

// Variáveis para controlar o estado da sala
let player1 = null;
let player2 = null;
  
// Evento de conexão
io.on('connection', (socket) => {
  // Verifica se a sala já está cheia
  if (player1 && player2) {
    socket.emit('roomFull');
    socket.disconnect(true);
    return;
  }

  // Define o jogador como player1 ou player2, dependendo da disponibilidade
  if (!player1) {
    player1 = socket.id;
    socket.emit('playerAssignment', { player: 1 });
  } else {
    player2 = socket.id;
    socket.emit('playerAssignment', { player: 2 });
    io.emit('startGame');
  }

  // Evento de jogada
  socket.on('guess', (guess) => {
    // Verifica se o jogador está na vez correta
    if ((socket.id === player1 && guess.player === 1) || (socket.id === player2 && guess.player === 2)) {
      // Lógica para verificar se a jogada está correta ou errada
      // Atualize o estado do jogo e envie eventos de atualização para ambos os jogadores
      io.emit('updateGameState', { guess });
      io.emit('nextTurn');
    }
  });

  // Evento de desconexão
  socket.on('disconnect', () => {
    // Verifica se o jogador desconectado era o player1 ou player2
    if (socket.id === player1) {
      player1 = null;
    } else if (socket.id === player2) {
      player2 = null;
    }
  });
});

// Inicia o servidor
server.listen(3000, () => {
  console.log('Servidor iniciado na porta 3000');
});
