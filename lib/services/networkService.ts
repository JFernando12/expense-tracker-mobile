import NetInfo from '@react-native-community/netinfo';

class NetworkService {
  private isConnected: boolean = true;
  private listeners: ((isConnected: boolean) => void)[] = [];

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // Get initial network state
    const state = await NetInfo.fetch();
    this.isConnected = state.isConnected ?? false;

    // Listen for network state changes
    NetInfo.addEventListener(state => {
      const newConnectionStatus = state.isConnected ?? false;
      if (newConnectionStatus !== this.isConnected) {
        this.isConnected = newConnectionStatus;
        this.notifyListeners();
      }
    });
  }

  isOnline(): boolean {
    return this.isConnected;
  }

  isOffline(): boolean {
    return !this.isConnected;
  }

  // Subscribe to network changes
  onNetworkChange(callback: (isConnected: boolean) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.isConnected));
  }

  // Check connectivity with a timeout
  async checkConnectivity(timeout: number = 5000): Promise<boolean> {
    try {
      const state = await Promise.race([
        NetInfo.fetch(),
        new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), timeout)
        )
      ]);
      
      return state?.isConnected ?? false;
    } catch (error) {
      console.warn('Network check failed:', error);
      return false;
    }
  }
}

export const networkService = new NetworkService();
