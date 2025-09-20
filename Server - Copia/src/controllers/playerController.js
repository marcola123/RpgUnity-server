const Character = require('../models/Character');
const logger = require('../utils/logger');

class PlayerController {
  // Mover jogador
  static async movePlayer(characterId, posX, posY, posZ, map) {
    try {
      await Character.updatePosition(characterId, posX, posY, posZ, map);
      return { success: true };
    } catch (error) {
      logger.error('Erro ao mover jogador:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Atualizar status do jogador
  static async updatePlayerStats(characterId, stats) {
    try {
      await Character.updateStats(characterId, stats);
      return { success: true };
    } catch (error) {
      logger.error('Erro ao atualizar stats do jogador:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Buscar jogador por ID
  static async getPlayer(characterId) {
    try {
      const character = await Character.findById(characterId);
      if (!character) {
        throw new Error('Jogador não encontrado');
      }

      return { success: true, character };
    } catch (error) {
      logger.error('Erro ao buscar jogador:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = PlayerController;