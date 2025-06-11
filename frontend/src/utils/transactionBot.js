// Transaction Bot service for automating domain purchases
// Similar to Dan.com's transaction automation system

// Transaction states
export const TRANSACTION_STATES = {
  INITIATED: 'initiated',
  PAYMENT_PENDING: 'payment_pending',
  PAYMENT_CONFIRMED: 'payment_confirmed',
  TRANSFER_INITIATED: 'transfer_initiated',
  TRANSFER_IN_PROGRESS: 'transfer_in_progress',
  TRANSFER_COMPLETED: 'transfer_completed',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// Mock database of transactions
const transactions = [];

// Helper functions
const generateTransactionId = () => {
  return `TRANS-${Math.floor(Math.random() * 1000000)}`;
};

const getRandomDelay = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// Transaction Bot class
class TransactionBot {
  constructor() {
    this.listeners = {};
  }

  // Subscribe to transaction updates
  subscribe(transactionId, callback) {
    if (!this.listeners[transactionId]) {
      this.listeners[transactionId] = [];
    }
    this.listeners[transactionId].push(callback);
    return () => {
      this.listeners[transactionId] = this.listeners[transactionId].filter(cb => cb !== callback);
    };
  }

  // Notify listeners of transaction updates
  notifyListeners(transactionId, state, details) {
    if (this.listeners[transactionId]) {
      this.listeners[transactionId].forEach(callback => {
        callback({ state, details, timestamp: new Date().toISOString() });
      });
    }
  }

  // Start a new transaction
  initiateTransaction(domainName, buyerInfo, sellerInfo, amount, paymentMethod) {
    const transactionId = generateTransactionId();
    
    const transaction = {
      id: transactionId,
      domainName,
      buyerInfo,
      sellerInfo,
      amount,
      paymentMethod,
      state: TRANSACTION_STATES.INITIATED,
      history: [
        {
          state: TRANSACTION_STATES.INITIATED,
          details: 'Transaction initiated',
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    transactions.push(transaction);
    
    // Notify listeners
    this.notifyListeners(transactionId, TRANSACTION_STATES.INITIATED, 'Transaction initiated');
    
    // Automatically move to next state (payment pending)
    setTimeout(() => {
      this.updateTransaction(transactionId, TRANSACTION_STATES.PAYMENT_PENDING, 'Waiting for payment confirmation');
    }, 1000);
    
    return transaction;
  }

  // Update transaction state
  updateTransaction(transactionId, state, details) {
    const transaction = transactions.find(t => t.id === transactionId);
    
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }
    
    transaction.state = state;
    transaction.updatedAt = new Date().toISOString();
    transaction.history.push({
      state,
      details,
      timestamp: new Date().toISOString()
    });
    
    // Notify listeners
    this.notifyListeners(transactionId, state, details);
    
    // Automatic transaction flow (simulate the Dan.com automated process)
    this.progressTransaction(transaction);
    
    return transaction;
  }

  // Progress transaction through automated flow
  progressTransaction(transaction) {
    // Only progress if not in a final state
    if ([TRANSACTION_STATES.COMPLETED, TRANSACTION_STATES.FAILED].includes(transaction.state)) {
      return;
    }
    
    let nextState = null;
    let details = '';
    let delay = 0;
    
    // Determine next state based on current state
    switch (transaction.state) {
      case TRANSACTION_STATES.PAYMENT_PENDING:
        nextState = TRANSACTION_STATES.PAYMENT_CONFIRMED;
        details = 'Payment confirmed';
        delay = getRandomDelay(2000, 5000);
        break;
        
      case TRANSACTION_STATES.PAYMENT_CONFIRMED:
        nextState = TRANSACTION_STATES.TRANSFER_INITIATED;
        details = 'Domain transfer initiated';
        delay = getRandomDelay(2000, 4000);
        break;
        
      case TRANSACTION_STATES.TRANSFER_INITIATED:
        nextState = TRANSACTION_STATES.TRANSFER_IN_PROGRESS;
        details = 'Domain transfer in progress';
        delay = getRandomDelay(3000, 6000);
        break;
        
      case TRANSACTION_STATES.TRANSFER_IN_PROGRESS:
        nextState = TRANSACTION_STATES.TRANSFER_COMPLETED;
        details = 'Domain transfer completed';
        delay = getRandomDelay(4000, 8000);
        break;
        
      case TRANSACTION_STATES.TRANSFER_COMPLETED:
        nextState = TRANSACTION_STATES.COMPLETED;
        details = 'Transaction completed successfully';
        delay = getRandomDelay(1000, 3000);
        break;
        
      default:
        return;
    }
    
    // Schedule the next state transition
    if (nextState) {
      setTimeout(() => {
        this.updateTransaction(transaction.id, nextState, details);
      }, delay);
    }
  }

  // Get transaction by ID
  getTransaction(transactionId) {
    return transactions.find(t => t.id === transactionId);
  }

  // Get all transactions
  getAllTransactions() {
    return [...transactions];
  }

  // Get transactions for a user (buyer or seller)
  getUserTransactions(userId, role = 'buyer') {
    return transactions.filter(t => {
      if (role === 'buyer') {
        return t.buyerInfo.id === userId;
      } else {
        return t.sellerInfo.id === userId;
      }
    });
  }
}

// Export singleton instance
export const transactionBot = new TransactionBot();

export default transactionBot;
