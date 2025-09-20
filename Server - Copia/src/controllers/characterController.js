const Character = require('../models/Character');
const logger = require('../utils/logger');

class CharacterController {
  // Criar personagem
  static async createCharacter(accountId, name, characterClass, race) {
    try {
      // Verificar se o nome já existe
      const existingCharacter = await Character.findByName(name);
      if (existingCharacter) {
        throw new Error('Nome de personagem já existe');
      }

      // Verificar se a classe é válida
      const validClasses = ['warrior', 'mage', 'archer', 'rogue', 'cleric'];
      if (!validClasses.includes(characterClass)) {
        throw new Error('Classe inválida');
      }

      // Verificar se a raça é válida
      const validRaces = ['human', 'elf', 'dark_elf', 'orc', 'dwarf'];
      if (!validRaces.includes(race)) {
        throw new Error('Raça inválida');
      }

      // Criar personagem
      const characterId = await Character.create(accountId, name, characterClass, race);
      return { success: true, characterId };
    } catch (error) {
      logger.error('Erro ao criar personagem:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Buscar personagens de uma conta
  static async getCharacters(accountId) {
    try {
      const characters = await Character.findByAccountId(accountId);
      return { success: true, characters };
    } catch (error) {
      logger.error('Erro ao buscar personagens:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Selecionar personagem para jogar
  static async selectCharacter(characterId) {
    try {
      const character = await Character.findById(characterId);
      if (!character) {
        throw new Error('Personagem não encontrado');
      }

      // Atualizar último acesso
      await Character.updateLastPlayed(characterId);

      return { success: true, character };
    } catch (error) {
      logger.error('Erro ao selecionar personagem:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = CharacterController;