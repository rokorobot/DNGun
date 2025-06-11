# DNGun Marketplace Registrar Account Setup Guide

## 🏢 Required Marketplace Accounts for Domain Transactions

To facilitate secure domain transactions, DNGun needs to establish marketplace accounts at major domain registrars. These accounts will serve as escrow intermediaries for domain transfers.

### 📋 Priority Registrars for Account Setup

#### 1. **Namecheap**
- **Account Username:** `dngun_marketplace`
- **Primary TLDs:** .com, .net, .org, .info, .biz
- **Push Requirements:** Domain can remain locked
- **Navigation:** Domain List → Manage → Transfer → Push Domain
- **Notes:** Most user-friendly push process

#### 2. **GoDaddy**
- **Account Username:** `dngun_escrow`
- **Primary TLDs:** .co, .me, .tv, .us
- **Push Requirements:** Domain must be unlocked
- **Navigation:** My Products → Domains → Manage → Transfer to Another GoDaddy Account
- **Notes:** Requires domain unlock before push

#### 3. **Namesilo**
- **Account Username:** `dngun_marketplace`
- **Primary TLDs:** .io, .ai, .tech
- **Push Requirements:** Domain must be unlocked
- **Navigation:** Domain Manager → Change Account
- **Notes:** Popular for tech domains

#### 4. **Dynadot**
- **Account Username:** `dngun_marketplace`
- **Primary TLDs:** .cc, .ws, .tv
- **Push Requirements:** Domain can remain locked
- **Navigation:** My Domains → Push Domain
- **Notes:** Good for alternative TLDs

#### 5. **Porkbun**
- **Account Username:** `dngun_marketplace`
- **Primary TLDs:** .app, .dev, .xyz
- **Push Requirements:** Domain must be unlocked
- **Navigation:** Domain Management → Transfer to Another Porkbun Account
- **Notes:** Developer-friendly registrar

#### 6. **Sav (formerly Name.com)**
- **Account Username:** `dngun_marketplace`
- **Primary TLDs:** .online, .store, .tech
- **Push Requirements:** Domain can remain locked
- **Navigation:** Domain Management → Change Ownership
- **Notes:** Good for new TLDs

### 🔧 Account Setup Requirements

#### For Each Registrar Account:

1. **Business Verification**
   - Business name: DNGun Marketplace LLC
   - Business email: marketplace@dngun.com
   - Phone verification required

2. **Security Settings**
   - Two-factor authentication enabled
   - Strong password with regular rotation
   - API access enabled (where available)

3. **Payment Methods**
   - Business credit card
   - ACH bank account for large transactions
   - PayPal business account (backup)

4. **Contact Information**
   - Primary: marketplace@dngun.com
   - Technical: tech@dngun.com
   - Administrative: admin@dngun.com

### 📊 Transaction Volume Estimates

| Registrar | Expected Monthly Domains | Priority Level |
|-----------|-------------------------|----------------|
| Namecheap | 50-100 domains         | HIGH           |
| GoDaddy   | 30-60 domains          | HIGH           |
| Namesilo  | 20-40 domains          | MEDIUM         |
| Dynadot   | 10-30 domains          | MEDIUM         |
| Porkbun   | 15-25 domains          | MEDIUM         |
| Sav       | 5-15 domains           | LOW            |

### 🔄 Transaction Bot Integration

The transaction bot is already configured with:
- Automatic registrar detection from domain extensions
- Registrar-specific push instructions
- Correct marketplace usernames for each registrar
- Navigation paths for each registrar's interface

### 📞 Next Steps

1. **Immediate Setup** (Priority: HIGH)
   - Namecheap marketplace account
   - GoDaddy escrow account

2. **Secondary Setup** (Priority: MEDIUM)
   - Namesilo, Dynadot, Porkbun accounts

3. **Future Expansion** (Priority: LOW)
   - Additional registrars based on transaction volume
   - Regional registrars for international expansion

### 🛡️ Security Considerations

- Each account should have unique credentials
- Regular security audits and password rotation
- Monitor account activity for unauthorized access
- Implement IP restrictions where possible
- Keep detailed logs of all domain transfers

### 📈 Monitoring & Analytics

Track the following metrics for each registrar:
- Number of successful pushes/transfers
- Average completion time
- Failed transaction reasons
- Customer satisfaction scores
- Cost per transaction

This setup will enable DNGun to provide professional domain escrow services comparable to Dan.com and other industry leaders.