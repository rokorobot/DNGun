import axios from 'axios';

// Payment API utilities for Stripe integration
export const paymentAPI = {
  
  // Create checkout session for domain purchase
  createDomainCheckout: async (domainId, domainName) => {
    const originUrl = window.location.origin;
    
    const response = await axios.post('/payments/checkout/domain', {
      domain_id: domainId,
      domain_name: domainName,
      origin_url: originUrl,
      currency: 'usd',
      metadata: {
        source: 'domain_marketplace',
        timestamp: new Date().toISOString()
      }
    });
    
    return response.data;
  },

  // Check payment status (for polling after Stripe redirect)
  checkPaymentStatus: async (sessionId) => {
    const response = await axios.get(`/payments/status/${sessionId}`);
    return response.data;
  },

  // Get user's payment history
  getPaymentHistory: async () => {
    const response = await axios.get('/payments/history');
    return response.data;
  },

  // Poll payment status with retry logic
  pollPaymentStatus: async (sessionId, maxAttempts = 10, interval = 2000) => {
    let attempts = 0;
    
    const poll = async () => {
      try {
        const status = await paymentAPI.checkPaymentStatus(sessionId);
        
        // Payment completed successfully
        if (status.payment_status === 'paid') {
          return { success: true, status };
        }
        
        // Payment failed or expired
        if (['failed', 'expired', 'canceled'].includes(status.payment_status)) {
          return { success: false, status };
        }
        
        // Still pending, continue polling if attempts remaining
        attempts++;
        if (attempts >= maxAttempts) {
          return { 
            success: false, 
            status,
            error: 'Payment status check timed out' 
          };
        }
        
        // Wait and poll again
        await new Promise(resolve => setTimeout(resolve, interval));
        return poll();
        
      } catch (error) {
        console.error('Error polling payment status:', error);
        return { 
          success: false, 
          error: 'Failed to check payment status' 
        };
      }
    };
    
    return poll();
  },

  // Handle Stripe checkout redirect
  handleStripeReturn: () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      return sessionId;
    }
    
    return null;
  },

  // Initiate domain purchase flow
  initiateDomainPurchase: async (domain) => {
    try {
      // Create checkout session
      const checkoutResponse = await paymentAPI.createDomainCheckout(
        domain.id, 
        `${domain.name}${domain.extension}`
      );
      
      // Redirect to Stripe Checkout
      if (checkoutResponse.checkout_url) {
        window.location.href = checkoutResponse.checkout_url;
      } else {
        throw new Error('No checkout URL received');
      }
      
    } catch (error) {
      console.error('Payment initiation error:', error);
      throw error;
    }
  }
};

export default paymentAPI;