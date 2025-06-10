import NetInfo from '@react-native-community/netinfo';

class NetworkService {
  private isConnected = false;
  private listeners: Set<(isConnected: boolean) => void> = new Set();

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // Get initial network state
    const state = await NetInfo.fetch();
    this.isConnected = state.isConnected ?? false;

    // Listen for network changes
    NetInfo.addEventListener(state => {
      const wasConnected = this.isConnected;
      this.isConnected = state.isConnected ?? false;

      // Only notify if connection status actually changed
      if (wasConnected !== this.isConnected) {
        this.notifyListeners();
      }
    });
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.isConnected);
      } catch (error) {
        console.error('Error in network listener:', error);
      }
    });
  }

  isOnline(): boolean {
    return this.isConnected;
  }

  onNetworkChange(callback: (isConnected: boolean) => void): () => void {
    this.listeners.add(callback);

    // Return cleanup function
    return () => {
      this.listeners.delete(callback);
    };
  }

  cleanup() {
    this.listeners.clear();
  }
}

export const networkService = new NetworkService();
