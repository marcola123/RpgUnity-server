const ServerController = require("../controllers/serverController");
const logger = require("../utils/logger");

class ServerManager {
  constructor(io, serverId = 1) {
    this.io = io;
    this.serverId = serverId;
    this.playerCount = 0;
    this.isRunning = false;
    this.updateInterval = null;
  }

  // Iniciar monitoramento do servidor
  start() {
    if (this.isRunning) {
      logger.warn("ServerManager já está rodando");
      return;
    }

    this.isRunning = true;
    logger.info(`Iniciando monitoramento do servidor ${this.serverId}`);

    // Atualizar status do servidor a cada 30 segundos
    this.updateInterval = setInterval(() => {
      this.updateServerStatus();
    }, 30000);

    // Atualizar status inicial
    this.updateServerStatus();

    // Escutar eventos de conexão/desconexão
    this.setupSocketListeners();
  }

  // Parar monitoramento do servidor
  stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    logger.info(`Parando monitoramento do servidor ${this.serverId}`);

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Configurar listeners para eventos de socket
  setupSocketListeners() {
    this.io.on("connection", (socket) => {
      this.playerCount = this.io.engine.clientsCount;
      logger.info(`Jogador conectado. Total: ${this.playerCount}`);

      socket.on("disconnect", () => {
        this.playerCount = this.io.engine.clientsCount;
        logger.info(`Jogador desconectado. Total: ${this.playerCount}`);
      });
    });
  }

  // Atualizar status do servidor no banco de dados
  async updateServerStatus() {
    try {
      const currentPlayerCount = this.io.engine.clientsCount;
      await ServerController.updateServerStatus(this.serverId, "online", currentPlayerCount);
      
      logger.info(`Status do servidor ${this.serverId} atualizado: ${currentPlayerCount} jogadores`);
    } catch (error) {
      logger.error("Erro ao atualizar status do servidor:", error.message);
    }
  }

  // Obter contagem atual de jogadores
  getCurrentPlayerCount() {
    return this.io.engine.clientsCount;
  }

  // Verificar se o servidor está ativo
  isActive() {
    return this.isRunning;
  }
}

module.exports = ServerManager;
