const CharacterController = require('../controllers/characterController');
const ServerController = require('../controllers/serverController');
const logger = require('../utils/logger');

module.exports = (io, socket) => {
  // Buscar servidores disponíveis
  socket.on('get_servers', async () => {
    try {
      // Usar o novo controlador para obter informações dinâmicas dos servidores
      const result = await ServerController.getServers(io);
      
      if (result.success) {
        socket.emit('get_servers_response', [{
          success: true,
          servers: result.servers
        }]);
      } else {
        // Fallback para dados estáticos em caso de erro
        const fallbackServers = [
          { id: 1, name: 'Server 1 - Gludin', status: 'online', playerCount: io.engine.clientsCount, maxPlayers: 1000 },
          { id: 2, name: 'Server 2 - Giran', status: 'online', playerCount: Math.floor(io.engine.clientsCount * 0.7), maxPlayers: 1000 },
          { id: 3, name: 'Server 3 - Dion', status: 'maintenance', playerCount: 0, maxPlayers: 1000 }
        ];
        
        socket.emit('get_servers_response', [{
          success: true,
          servers: fallbackServers
        }]);
      }
    } catch (error) {
      logger.error('Erro no evento get_servers:', error.message);
      
      // Fallback para dados estáticos em caso de erro
      const fallbackServers = [
        { id: 1, name: 'Server 1 - Gludin', status: 'online', playerCount: io.engine.clientsCount, maxPlayers: 1000 },
        { id: 2, name: 'Server 2 - Giran', status: 'online', playerCount: Math.floor(io.engine.clientsCount * 0.7), maxPlayers: 1000 },
        { id: 3, name: 'Server 3 - Dion', status: 'maintenance', playerCount: 0, maxPlayers: 1000 }
      ];
      
      socket.emit('get_servers_response', [{
        success: true,
        servers: fallbackServers
      }]);
    }
  });

  // Criar personagem
  socket.on('create_character', async (data) => {

    console.log('Dados recebidos do cliente Unity:', data); // <-- aqui

    try {
      if (!socket.accountId) {
        return socket.emit('create_character_response', [{
          success: false,
          error: 'Não autenticado'
        }]);
      }
      
      const { name, class: characterClass, race } = data;
      
      if (!name || !characterClass || !race) {
        return socket.emit('create_character_response', [{
          success: false,
          error: 'Nome, classe e raça são obrigatórios'
        }]);
      }
      
      const result = await CharacterController.createCharacter(socket.accountId, name, characterClass, race);
      socket.emit('create_character_response', [result]);
    } catch (error) {
      logger.error('Erro no evento create_character:', error.message);
      socket.emit('create_character_response', [{
        success: false,
        error: 'Erro interno do servidor'
      }]);
    }
  });

  // Buscar personagens da conta
  socket.on('get_characters', async () => {
    try {
      if (!socket.accountId) {
        return socket.emit('get_characters_response', [{
          success: false,
          error: 'Não autenticado'
        }]);
      }
      
      const result = await CharacterController.getCharacters(socket.accountId);
      socket.emit('get_characters_response', [result]);
    } catch (error) {
      logger.error('Erro no evento get_characters:', error.message);
      socket.emit('get_characters_response', [{
        success: false,
        error: 'Erro interno do servidor'
      }]);
    }
  });

  // Selecionar personagem para jogar
  socket.on('select_character', async (data) => {
    try {
      if (!socket.accountId) {
        return socket.emit('select_character_response', [{
          success: false,
          error: 'Não autenticado'
        }]);
      }
      
      const { characterId } = data;
      
      if (!characterId) {
        return socket.emit('select_character_response', [{
          success: false,
          error: 'ID do personagem é obrigatório'
        }]);
      }
      
      const result = await CharacterController.selectCharacter(characterId);
      
      if (result.success) {
        // Associar characterId ao socket
        socket.characterId = characterId;
        socket.character = result.character;
        
        // Adicionar o jogador à sala do mapa
        socket.join(result.character.map);
        
        // Notificar outros jogadores no mesmo mapa
        socket.to(result.character.map).emit('player_joined', {
          characterId: result.character.id,
          name: result.character.name,
          class: result.character.class,
          race: result.character.race,
          level: result.character.level,
          posX: result.character.pos_x,
          posY: result.character.pos_y,
          posZ: result.character.pos_z
        });
      }
      
      socket.emit('select_character_response', [result]);
    } catch (error) {
      logger.error('Erro no evento select_character:', error.message);
      socket.emit('select_character_response', [{
        success: false,
        error: 'Erro interno do servidor'
      }]);
    }
  });
};