import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const TransactionChat = ({ transaction, onBotAction, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [awaitingResponse, setAwaitingResponse] = useState(null);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    // Initialize chat with welcome message based on user role
    initializeChat();
  }, [transaction]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeChat = () => {
    const userRole = getUserRole();
    const initialMessages = [
      {
        id: 1,
        type: 'bot',
        message: `🤖 Hello! I'm your DNGun Transaction Bot. I'll guide you through the secure domain transfer process.`,
        timestamp: new Date(),
        actions: []
      },
      {
        id: 2,
        type: 'bot',
        message: `📋 Transaction Details:
• Domain: ${transaction.domain?.name}${transaction.domain?.extension}
• Amount: $${transaction.amount?.toLocaleString()}
• Your role: ${userRole}

Let's start the secure transfer process!`,
        timestamp: new Date(),
        actions: []
      }
    ];

    setMessages(initialMessages);
    
    // Start the transaction flow based on user role
    setTimeout(() => {
      if (userRole === 'buyer') {
        startBuyerFlow();
      } else if (userRole === 'seller') {
        startSellerFlow();
      }
    }, 2000);
  };

  const getUserRole = () => {
    if (user?.id === transaction.buyer_id) return 'buyer';
    if (user?.id === transaction.seller_id) return 'seller';
    return 'observer';
  };

  const addBotMessage = (message, actions = [], delay = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const newMessage = {
        id: Date.now(),
        type: 'bot',
        message,
        timestamp: new Date(),
        actions
      };
      setMessages(prev => [...prev, newMessage]);
      
      if (actions.length > 0) {
        setAwaitingResponse(actions);
      }
    }, delay);
  };

  const addUserMessage = (message) => {
    const newMessage = {
      id: Date.now(),
      type: 'user',
      message,
      timestamp: new Date(),
      user: user?.username || 'User'
    };
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
  };

  const startBuyerFlow = () => {
    addBotMessage(
      `💰 Step 1: Payment Escrow

To ensure a secure transaction, you need to transfer the payment to our escrow service first. This protects both you and the seller.

Please transfer $${transaction.amount?.toLocaleString()} to our secure escrow account:

**Bank Details:**
Account: DNGun Escrow Services
Account #: 1234-5678-9012
Routing: 123456789
Reference: TXN-${transaction.id}

Once you've made the transfer, please confirm below.`,
      [
        { type: 'confirm_payment', label: '✅ I have transferred the payment' },
        { type: 'payment_help', label: '❓ Need help with payment' }
      ],
      3000
    );
  };

  const startSellerFlow = () => {
    // First check if seller has payment method set up
    addBotMessage(
      `🔍 Checking your payment setup...

For this transaction to proceed, you need to have a payment method configured to receive funds.`,
      [],
      2000
    );

    setTimeout(() => {
      // Simulate checking payment method
      const hasPaymentMethod = Math.random() > 0.3; // 70% chance they have it set up
      
      if (hasPaymentMethod) {
        addBotMessage(
          `✅ Payment method verified!

Your configured payment method: PayPal (****@example.com)

I'll notify you once the buyer has transferred their payment to our escrow service. Please standby...`,
          [],
          2000
        );
      } else {
        addBotMessage(
          `❌ No payment method found!

Before we can proceed, you need to set up your preferred payment method to receive funds.

Please go to Settings → Payment Methods and add:
• Bank account details, or
• PayPal account, or
• Cryptocurrency wallet

Once set up, return here to continue.`,
          [
            { type: 'setup_payment', label: '⚙️ Set up payment method' },
            { type: 'payment_ready', label: '✅ I have set up payment method' }
          ],
          2000
        );
      }
    }, 4000);
  };

  const handleBotAction = (action) => {
    setAwaitingResponse(null);
    
    switch (action.type) {
      case 'confirm_payment':
        handlePaymentConfirmation();
        break;
      case 'payment_help':
        handlePaymentHelp();
        break;
      case 'setup_payment':
        handleSetupPayment();
        break;
      case 'payment_ready':
        handlePaymentReady();
        break;
      case 'transfer_domain':
        handleDomainTransfer();
        break;
      case 'push_domain':
        handleDomainPush();
        break;
      case 'provide_auth_code':
        handleAuthCodeRequest();
        break;
      case 'confirm_push_username':
        handlePushUsernameConfirmation();
        break;
      case 'confirm_push_complete':
        handlePushComplete();
        break;
      case 'provide_buyer_username':
        handleBuyerUsernameRequest();
        break;
      case 'prefer_transfer':
        handlePreferTransfer();
        break;
      case 'unlock_help':
        handleUnlockHelp();
        break;
      case 'change_to_push':
        handleChangeToPush();
        break;
      case 'push_help':
        handlePushHelp();
        break;
      case 'push_help':
        handlePushHelp();
        break;
      case 'unlock_for_push':
        handleUnlockForPush();
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const handlePaymentConfirmation = () => {
    addUserMessage("I have transferred the payment to the escrow account.");
    
    addBotMessage(
      `🔍 Verifying your payment...

Please allow 1-2 minutes for payment verification.`,
      [],
      1000
    );

    // Simulate payment verification
    setTimeout(() => {
      addBotMessage(
        `✅ Payment verified! $${transaction.amount?.toLocaleString()} received in escrow.

Now notifying the seller to transfer the domain...`,
        [],
        3000
      );

      // Notify seller (simulate)
      setTimeout(() => {
        notifySellerOfPayment();
      }, 2000);
    }, 5000);
  };

  const notifySellerOfPayment = () => {
    if (getUserRole() === 'seller') {
      const registry = getRegistryFromDomain(transaction.domain?.extension);
      const pushReqs = getPushRequirements(registry);
      
      addBotMessage(
        `💰 **Great news!** The buyer has transferred $${transaction.amount?.toLocaleString()} to our escrow service.

Now it's your turn to transfer the domain. You have **two options**:

**🚀 Option A: PUSH Domain (Recommended - Faster)**
• **Same Registrar Transfer** (${registry}-to-${registry})
• ❌ **No Auth Code Required**
• 🔒 **Domain Lock:** ${pushReqs.unlockRequired ? 'Must be unlocked' : 'Can remain locked'}
• ⏱️ **Timeline:** 5-10 minutes
• 💡 **Process:** Push to our verified ${registry} account: \`${pushReqs.marketplaceUsername}\`

**📤 Option B: TRANSFER Domain**
• **Different Registrar Transfer** (${registry}-to-DNGun's-Registrar)
• ✅ **Auth Code Required** (EPP Code)
• 🔓 **Domain must be unlocked** (always required)
• ⏱️ **Timeline:** 5-7 business days
• 💡 **Process:** Transfer between different registrars

**🏢 We have verified marketplace accounts at:**
Namecheap, GoDaddy, Namesilo, Dynadot, Porkbun, Sav

Which option would you prefer?`,
        [
          { type: 'push_domain', label: '🚀 Push Domain (Fast & Easy)' },
          { type: 'transfer_domain', label: '📤 Transfer Domain (Slow)' }
        ],
        2000
      );
    }
  };

  const handleDomainPush = () => {
    addUserMessage("I'll push the domain to the marketplace account (same registrar).");
    
    // Get registry information and requirements
    const registry = getRegistryFromDomain(transaction.domain?.extension);
    const pushReqs = getPushRequirements(registry);
    
    const lockStatusMessage = pushReqs.unlockRequired 
      ? "🔓 **Must be unlocked** (required by " + registry + ")"
      : "🔒 **Can remain locked** (allowed by " + registry + ")";
    
    addBotMessage(
      `🚀 Perfect! **Push is the fastest option** (same registrar transfer).

**📋 PUSH Process Details:**
• **Registry:** ${registry}
• **Auth Code:** ❌ Not required
• **Domain Lock:** ${lockStatusMessage}
• **Process:** Internal account ownership change

**🎯 Detailed ${registry} Instructions:**
1. Log into your ${registry} account
2. Navigate to: **${pushReqs.pushPath}**
${pushReqs.unlockRequired ? '3. **Unlock the domain first** (required by ' + registry + ')\n4.' : '3.'} Push "${transaction.domain?.name}${transaction.domain?.extension}" to our marketplace account:
   
   **🏢 DNGun Marketplace Username:** \`${pushReqs.marketplaceUsername}\`
   
   **⚠️ Important:** Use the exact username above - case sensitive!

${pushReqs.unlockRequired ? '5.' : '4.'} Confirm the push request
${pushReqs.unlockRequired ? '6.' : '5.'} DNGun will automatically accept the push

**⏱️ Timeline:** Usually completes within 5-10 minutes
**💡 ${registry} Note:** ${pushReqs.notes}

Once the push is completed, please confirm below.`,
      [
        { type: 'confirm_push_complete', label: '✅ Domain push completed' },
        { type: 'push_help', label: '❓ Need help with push process' },
        ...(pushReqs.unlockRequired ? [{ type: 'unlock_for_push', label: '🔓 Help with unlocking' }] : [])
      ],
      2000
    );
  };

  const handleDomainTransfer = () => {
    addUserMessage("I'll transfer the domain to DNGun's preferred registrar (different registrar).");
    
    addBotMessage(
      `📤 **Transfer option selected** (different registrar transfer).

**📋 TRANSFER Process Details:**
• **Auth Code:** ✅ Required (EPP Code)
• **Domain Lock:** 🔓 Must be unlocked first
• **Process:** Move from your registrar to DNGun's registrar
• **Timeline:** 5-7 business days

**🎯 Required Steps:**
1. **Unlock the domain** in your current registrar
2. **Obtain Authorization Code** (EPP Code) from your registrar
3. **Provide the Auth Code** to initiate transfer to DNGun's registrar

**⚠️ Important:** 
- Domain transfers take significantly longer than pushes
- Additional ICANN transfer fees may apply
- Domain must be unlocked for transfer to proceed

Are you ready to provide the authorization code?`,
      [
        { type: 'provide_auth_code', label: '🔑 Provide Auth Code' },
        { type: 'unlock_help', label: '❓ How to unlock domain' },
        { type: 'change_to_push', label: '🚀 Switch to Push (Faster)' }
      ],
      2000
    );
  };

  const handleAuthCodeRequest = () => {
    setAwaitingResponse([{ type: 'auth_code_input', label: 'Enter Auth Code' }]);
    addUserMessage("I'm ready to provide the authorization code.");
    
    addBotMessage(
      `🔑 **Authorization Code (EPP Code) Required**

Please enter the authorization code for "${transaction.domain?.name}${transaction.domain?.extension}":

**📋 Auth Code Requirements:**
• 8-16 characters long
• Contains letters and numbers
• Case-sensitive
• Must be from your current registrar

**💡 Where to find it:**
• Registrar Control Panel → Domain Management → Auth Code/EPP Code
• Some registrars email it separately

**⚠️ Important:** Make sure the domain is unlocked before providing the code.`,
      [{ type: 'auth_code_input', label: 'Enter Auth Code' }],
      1000
    );
  };

  const handlePushUsernameConfirmation = () => {
    addUserMessage("Domain push has been completed successfully.");
    
    addBotMessage(
      `✅ Excellent! Domain push confirmed.

Verifying domain ownership transfer...`,
      [],
      1500
    );

    setTimeout(() => {
      addBotMessage(
        `🔍 Domain ownership verified! 

The domain "${transaction.domain?.name}${transaction.domain?.extension}" is now in DNGun's possession.

Now I need to collect the buyer's registry information for the final transfer...`,
        [],
        3000
      );

      setTimeout(() => {
        getBuyerRegistryInfo();
      }, 2000);
    }, 3000);
  };

  const getBuyerRegistryInfo = () => {
    if (getUserRole() === 'buyer') {
      const registry = getRegistryFromDomain(transaction.domain?.extension);
      
      addBotMessage(
        `🎯 Final Step: Domain Transfer to Your Account

To complete the transfer, I need your registry username for ${registry}.

**Registry:** ${registry}
**Your username at ${registry}:** (required)

Please provide your ${registry} username below so we can push the domain directly to your account.

💡 **Push vs Transfer:**
• Push (recommended): Instant, within same registry
• Transfer: 5-7 days, between different registries`,
        [
          { type: 'provide_buyer_username', label: '👤 Provide Registry Username' },
          { type: 'prefer_transfer', label: '📤 I prefer domain transfer instead' }
        ],
        2000
      );
    }
  };

  const handleSetupPayment = () => {
    addUserMessage("I'll set up my payment method now.");
    
    addBotMessage(
      `⚙️ Setting up payment method...

Please go to Settings → Payment Methods and configure:

**Recommended Options:**
• 🏦 Bank Account (ACH transfer - 1-2 days)
• 💳 PayPal (Instant transfer)
• 🪙 Cryptocurrency (Bitcoin, Ethereum)

Once you've added a payment method, return here and click "Payment Ready".`,
      [
        { type: 'payment_ready', label: '✅ Payment method set up' }
      ],
      2000
    );
  };

  const handlePaymentReady = () => {
    addUserMessage("I have set up my payment method.");
    
    addBotMessage(
      `✅ Great! Payment method configured.

I'll notify you once the buyer transfers their payment to our escrow service. Please standby...

You'll receive an email notification when it's time to transfer the domain.`,
      [],
      2000
    );
  };

  const handlePushComplete = () => {
    addUserMessage("Domain push has been completed.");
    
    addBotMessage(
      `🔍 Verifying domain push...

Checking domain ownership in our system...`,
      [],
      2000
    );

    setTimeout(() => {
      addBotMessage(
        `✅ Domain push verified successfully!

The domain "${transaction.domain?.name}${transaction.domain?.extension}" is now in DNGun's possession.

💰 Releasing payment to seller...

Preparing final transfer to buyer...`,
        [],
        3000
      );

      setTimeout(() => {
        getBuyerRegistryInfo();
      }, 2000);
    }, 4000);
  };

  const handleBuyerUsernameRequest = () => {
    setAwaitingResponse([{ type: 'buyer_username_input', label: 'Enter Username' }]);
    addUserMessage("I'll provide my registry username.");
    
    const registry = getRegistryFromDomain(transaction.domain?.extension);
    
    addBotMessage(
      `👤 Please enter your ${registry} username:

This should be the username you use to log into your ${registry} account where you want to receive the domain.

**Important:** Make sure the username is correct - we'll push the domain directly to this account.`,
      [{ type: 'buyer_username_input', label: 'Enter Username' }],
      1000
    );
  };

  const handlePreferTransfer = () => {
    addUserMessage("I prefer domain transfer to a different registrar.");
    
    addBotMessage(
      `📤 Transfer option selected.

Please note:
• Transfer process takes 5-7 business days
• Domain will be transferred to DNGun's preferred registrar first
• Then we'll initiate transfer to your preferred registrar
• Additional transfer fees may apply

If you still prefer this option, please provide your preferred registrar details.`,
      [
        { type: 'provide_transfer_details', label: '📋 Provide Transfer Details' },
        { type: 'change_to_push', label: '🚀 Change to Push (Faster)' }
      ],
      2000
    );
  };

  const handleCompleteTransaction = () => {
    addBotMessage(
      `🎉 **TRANSACTION COMPLETED SUCCESSFULLY!**

**Summary:**
✅ Payment received: $${transaction.amount?.toLocaleString()}
✅ Domain transferred to DNGun: ${transaction.domain?.name}${transaction.domain?.extension}
✅ Payment released to seller
✅ Domain transferred to buyer account

**What happens next:**
• Buyer: Check your registry account - domain should appear within 5-10 minutes
• Seller: Payment will be processed to your account within 1-2 business days
• Both parties will receive email confirmations

Thank you for using DNGun's secure escrow service! 🛡️

**Transaction ID:** ${transaction.id}
**Support:** If you need any assistance, contact support@dngun.com`,
      [
        { type: 'download_receipt', label: '📄 Download Receipt' },
        { type: 'close_chat', label: '✅ Close Chat' }
      ],
      3000
    );
  };

  const handlePaymentHelp = () => {
    addUserMessage("I need help with the payment process.");
    
    addBotMessage(
      `💡 Payment Help

**For Bank Transfer:**
1. Log into your online banking
2. Add new payee: DNGun Escrow Services
3. Use the account details provided
4. Add transaction reference: TXN-${transaction.id}
5. Transfer the exact amount: $${transaction.amount?.toLocaleString()}

**For Wire Transfer:**
1. Visit your bank branch
2. Request international wire transfer
3. Provide the account details
4. Include transaction reference

**Important:** The reference number is crucial for automatic verification.

Still need help?`,
      [
        { type: 'contact_support', label: '📞 Contact Support' },
        { type: 'confirm_payment', label: '✅ I have transferred the payment' }
      ],
      2000
    );
  };

  const getRegistryFromDomain = (extension) => {
    const registryMap = {
      '.com': 'Namecheap',
      '.net': 'Namecheap', 
      '.org': 'Namecheap',
      '.info': 'Namecheap',
      '.biz': 'Namecheap',
      '.io': 'Namesilo',
      '.co': 'GoDaddy',
      '.me': 'GoDaddy',
      '.tv': 'GoDaddy',
      '.cc': 'Dynadot',
      '.ws': 'Dynadot',
      '.app': 'Porkbun',
      '.dev': 'Porkbun',
      '.xyz': 'Porkbun',
      '.online': 'Sav',
      '.store': 'Sav',
      '.tech': 'Sav'
    };
    return registryMap[extension] || 'Namecheap';
  };

  // Get registrar-specific push requirements and DNGun marketplace accounts
  const getPushRequirements = (registry) => {
    const requirements = {
      'Namecheap': {
        unlockRequired: false,
        notes: 'Domains can usually be pushed while locked',
        marketplaceUsername: 'dngun_marketplace',
        pushPath: 'Domain List → Manage → Transfer → Push Domain'
      },
      'GoDaddy': {
        unlockRequired: true,
        notes: 'Domains must be unlocked before pushing',
        marketplaceUsername: 'dngun_escrow',
        pushPath: 'My Products → Domains → Manage → Transfer to Another GoDaddy Account'
      },
      'Namesilo': {
        unlockRequired: true,
        notes: 'Domains must be unlocked for account changes',
        marketplaceUsername: 'dngun_marketplace',
        pushPath: 'Domain Manager → Change Account'
      },
      'Dynadot': {
        unlockRequired: false,
        notes: 'Push available for unlocked domains',
        marketplaceUsername: 'dngun_marketplace',
        pushPath: 'My Domains → Push Domain'
      },
      'Porkbun': {
        unlockRequired: true,
        notes: 'Domain must be unlocked for account transfer',
        marketplaceUsername: 'dngun_marketplace',
        pushPath: 'Domain Management → Transfer to Another Porkbun Account'
      },
      'Sav': {
        unlockRequired: false,
        notes: 'Internal transfers usually allowed while locked',
        marketplaceUsername: 'dngun_marketplace',
        pushPath: 'Domain Management → Change Ownership'
      }
    };
    
    return requirements[registry] || {
      unlockRequired: true,
      notes: 'Check your registrar policy - unlock may be required',
      marketplaceUsername: 'dngun_marketplace',
      pushPath: 'Domain Management → Transfer/Push Domain'
    };
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      // Check if we're expecting specific input
      if (awaitingResponse && awaitingResponse[0]?.type === 'auth_code_input') {
        handleAuthCodeSubmission(inputMessage.trim());
        return;
      }
      
      if (awaitingResponse && awaitingResponse[0]?.type === 'buyer_username_input') {
        handleBuyerUsernameSubmission(inputMessage.trim());
        return;
      }
      
      addUserMessage(inputMessage);
      
      // Auto-respond to general messages
      setTimeout(() => {
        addBotMessage(
          `I understand you said: "${inputMessage}"

I'm here to help with your domain transaction. Please use the action buttons for specific steps, or type "help" for assistance.`,
          [],
          1500
        );
      }, 1000);
    }
  };

  const handleAuthCodeSubmission = (authCode) => {
    addUserMessage(`Authorization code: ${authCode}`);
    setAwaitingResponse(null);
    
    addBotMessage(
      `🔑 **Authorization code received:** ${authCode}

**📤 Initiating domain transfer process...**

**Transfer Details:**
• Domain: ${transaction.domain?.name}${transaction.domain?.extension}
• From: Your current registrar
• To: DNGun's preferred registrar
• Auth Code: ${authCode}

**⏱️ Transfer Timeline:**
• Day 1: Transfer initiated
• Day 2-3: Current registrar review
• Day 4-5: ICANN approval process
• Day 6-7: Transfer completion

I'll keep you updated on the progress. The transfer should complete within 5-7 business days.`,
      [],
      2000
    );

    // Simulate transfer progress updates
    setTimeout(() => {
      addBotMessage(
        `📤 **Transfer Update:** Transfer successfully initiated!

Current Status: Pending approval from your current registrar
Next Step: Awaiting confirmation (usually 1-2 days)

I'll notify both parties once the domain is successfully transferred to DNGun.`,
        [],
        3000
      );
    }, 3000);
  };

  const handleBuyerUsernameSubmission = (username) => {
    addUserMessage(`My registry username: ${username}`);
    setAwaitingResponse(null);
    
    const registry = getRegistryFromDomain(transaction.domain?.extension);
    
    addBotMessage(
      `👤 Username received: ${username}

Initiating domain push to your ${registry} account...

Please check your ${registry} account in 5-10 minutes.`,
      [],
      2000
    );

    // Simulate push completion
    setTimeout(() => {
      addBotMessage(
        `✅ Domain push completed!

The domain "${transaction.domain?.name}${transaction.domain?.extension}" has been successfully pushed to your ${registry} account (${username}).

💰 Payment has been released to the seller.

🎉 Transaction completed successfully!`,
        [
          { type: 'complete_transaction', label: '🎉 View Transaction Summary' }
        ],
        3000
      );
    }, 4000);
  };

  const handleUnlockHelp = () => {
    addUserMessage("I need help unlocking my domain.");
    
    addBotMessage(
      `🔓 Domain Unlock Instructions:

1. Log into your registrar account
2. Go to Domain Management
3. Find "${transaction.domain?.name}${transaction.domain?.extension}"
4. Look for "Domain Lock" or "Transfer Lock" setting
5. Toggle the lock to "Disabled" or "Off"
6. Save changes

Note: It may take up to 24 hours for unlock to take effect.

Need the Auth Code (EPP) after unlocking?`,
      [
        { type: 'provide_auth_code', label: '🔑 Yes, provide Auth Code' },
        { type: 'change_to_push', label: '🚀 Switch to Push instead' }
      ],
      2000
    );
  };

  const handleChangeToPush = () => {
    addUserMessage("I'd like to switch to the Push method instead.");
    
    addBotMessage(
      `🚀 Great choice! Push transfer is much faster.

The Push method:
• Completes in 5-10 minutes
• No domain unlocking required
• No auth codes needed
• Same registrar transfer

Let me guide you through the Push process instead...`,
      [],
      2000
    );

    setTimeout(() => {
      handleDomainPush();
    }, 3000);
  };

  const handleUnlockForPush = () => {
    addUserMessage("The domain push failed - I need to unlock it first.");
    
    const registry = getRegistryFromDomain(transaction.domain?.extension);
    
    addBotMessage(
      `🔓 Some registrars require domains to be unlocked before pushing.

Quick steps to unlock in ${registry}:
1. Log into your ${registry} account
2. Go to Domain Management
3. Find "${transaction.domain?.name}${transaction.domain?.extension}"
4. Look for "Domain Lock" or "Transfer Lock" setting
5. Toggle the lock to "Disabled" or "Off"
6. Save changes
7. Wait 5-10 minutes for changes to take effect

Once unlocked, try the push process again.`,
      [
        { type: 'confirm_push_complete', label: '✅ Domain unlocked and pushed' },
        { type: 'push_help', label: '❓ Need more help' }
      ],
      2000
    );
  };

  const handlePushHelp = () => {
    addUserMessage("I need help with the domain push process.");
    
    const registry = getRegistryFromDomain(transaction.domain?.extension);
    const pushReqs = getPushRequirements(registry);
    
    addBotMessage(
      `🚀 Here's a detailed guide for pushing your domain in ${registry}:

1. **Login to ${registry}**
   • Go to ${registry}'s website
   • Sign in to your account

2. **Navigate to Push/Transfer Section**
   • Path: ${pushReqs.pushPath}

3. **Select the Domain**
   • Find "${transaction.domain?.name}${transaction.domain?.extension}"
   • Choose "Push" or "Change Account Owner"

4. **Enter DNGun Details**
   • DNGun Username: ${pushReqs.marketplaceUsername}
   • Double-check for typos!

5. **Confirm Push**
   • Review all details
   • Confirm the transfer

**Important Notes:**
• ${pushReqs.notes}
• Push should complete in 5-10 minutes
• No auth code needed for push

Need more specific help?`,
      [
        { type: 'confirm_push_complete', label: '✅ Push completed successfully' },
        { type: 'unlock_for_push', label: '🔓 Help with unlocking' }
      ],
      2000
    );
  };

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-96 bg-white border rounded-lg">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-primary to-accent-teal text-white p-4 rounded-t-lg">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
            <span className="text-primary font-bold">🤖</span>
          </div>
          <div>
            <h3 className="font-semibold">DNGun Transaction Bot</h3>
            <p className="text-sm opacity-90">Secure Domain Transfer Assistant</p>
          </div>
          <div className="ml-auto flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            <span className="text-sm">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.type === 'user' 
                ? 'bg-accent-teal text-white' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {message.type === 'bot' && (
                <div className="flex items-center mb-1">
                  <span className="text-xs font-semibold">🤖 DNGun Bot</span>
                </div>
              )}
              {message.type === 'user' && (
                <div className="flex items-center mb-1">
                  <span className="text-xs font-semibold">{message.user}</span>
                </div>
              )}
              <div className="text-sm whitespace-pre-line">{message.message}</div>
              <div className="text-xs opacity-70 mt-1">
                {formatTimestamp(message.timestamp)}
              </div>
              
              {/* Action Buttons */}
              {message.actions && message.actions.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleBotAction(action)}
                      className="block w-full text-left px-3 py-2 bg-white text-gray-800 rounded border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-1">
                <span className="text-xs">🤖 DNGun Bot is typing</span>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-teal"
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-accent-teal text-white rounded-md hover:bg-opacity-90 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionChat;