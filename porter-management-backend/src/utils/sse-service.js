/**
 * Server-Sent Events (SSE) Service
 * Manages active SSE connections for real-time notifications.
 */

class SSEService {
  constructor() {
    this.userConnections = new Map();
    this.porterConnections = new Map();
    // Keep alive interval to prevent proxy timeouts
    this.keepAliveInterval = setInterval(
      () => this.broadcastKeepAlive(),
      30000,
    );
  }

  /**
   * Add a new user connection
   */
  addUserConnection(userId, res) {
    const id = userId.toString();
    if (!this.userConnections.has(id)) {
      this.userConnections.set(id, new Set());
    }
    this.userConnections.get(id).add(res);

    res.on("close", () => {
      const userSet = this.userConnections.get(id);
      if (userSet) {
        userSet.delete(res);
        if (userSet.size === 0) {
          this.userConnections.delete(id);
        }
      }
    });

    // Send initial connection success message
    this.send(res, "connected", { status: "success", type: "user" });
  }

  /**
   * Add a new porter connection
   */
  addPorterConnection(porterId, res) {
    const id = porterId.toString();
    if (!this.porterConnections.has(id)) {
      this.porterConnections.set(id, new Set());
    }
    this.porterConnections.get(id).add(res);

    res.on("close", () => {
      const porterSet = this.porterConnections.get(id);
      if (porterSet) {
        porterSet.delete(res);
        if (porterSet.size === 0) {
          this.porterConnections.delete(id);
        }
      }
    });

    // Send initial connection success message
    this.send(res, "connected", { status: "success", type: "porter" });
  }

  /**
   * Format and send data to an SSE response stream
   */
  send(res, eventName, data) {
    try {
      res.write(`event: ${eventName}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      console.error("Error writing to SSE stream", error);
    }
  }

  /**
   * Emit an event to a specific user
   */
  sendToUser(userId, eventName, data) {
    const id = userId.toString();
    const connections = this.userConnections.get(id);
    if (connections) {
      connections.forEach((res) => {
        this.send(res, eventName, data);
      });
      return true;
    }
    return false;
  }

  /**
   * Emit an event to a specific porter
   */
  sendToPorter(porterId, eventName, data) {
    const id = porterId.toString();
    const connections = this.porterConnections.get(id);
    if (connections) {
      connections.forEach((res) => {
        this.send(res, eventName, data);
      });
      return true;
    }
    return false;
  }

  /**
   * Send keep-alive comments to prevent connection drop
   */
  broadcastKeepAlive() {
    const comment = ": keep-alive\n\n";
    this.userConnections.forEach((connections) => {
      connections.forEach((res) => res.write(comment));
    });
    this.porterConnections.forEach((connections) => {
      connections.forEach((res) => res.write(comment));
    });
  }

  /**
   * Clean up interval on shutdown
   */
  shutdown() {
    clearInterval(this.keepAliveInterval);
  }
}

// Export a singleton instance
const sseService = new SSEService();
export default sseService;
