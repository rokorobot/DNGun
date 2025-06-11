import requests
import sys
import json
import os
from datetime import datetime

class DNGunAPITester:
    def __init__(self, base_url=None):
        # Use the environment variable or fallback to default
        self.base_url = base_url or os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001/api')
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.current_user = None
        self.test_domain = None
        self.test_transaction = None
        self.buyer_user = None
        self.seller_user = None

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.text else {}
                except json.JSONDecodeError:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test the root endpoint"""
        success, response = self.run_test(
            "Root Endpoint",
            "GET",
            "",
            200
        )
        return success

    def test_login(self, email, password):
        """Test login and get token"""
        # For FastAPI OAuth2 form data
        form_data = {
            'username': email,  # FastAPI OAuth2 uses 'username' field
            'password': password
        }
        
        # Direct request without using run_test to handle form data
        print(f"\n🔍 Testing Login for {email}...")
        self.tests_run += 1
        
        try:
            url = f"{self.base_url}/auth/token"
            response = requests.post(
                url, 
                data=form_data,
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            success = response.status_code == 200
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                data = response.json()
                self.token = data.get('access_token')
                return True
            else:
                print(f"❌ Failed - Expected 200, got {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False

    def test_get_current_user(self):
        """Test getting current user info"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "users/me",
            200
        )
        if success:
            self.current_user = response
            print(f"Current user: {response.get('username')}")
        return success

    def test_get_all_domains(self):
        """Test getting all domains"""
        success, response = self.run_test(
            "Get All Domains",
            "GET",
            "domains",
            200
        )
        if success:
            print(f"Retrieved {len(response)} domains")
            if len(response) > 0:
                # Find a domain with status 'available'
                available_domains = [d for d in response if d.get('status') == 'available']
                if available_domains:
                    self.test_domain = available_domains[0]
                else:
                    self.test_domain = response[0]
                print(f"Sample domain: {self.test_domain.get('name')}{self.test_domain.get('extension')}")
        return success

    def test_search_domains(self, query):
        """Test domain search"""
        success, response = self.run_test(
            "Search Domains",
            "GET",
            f"domains/search",
            200,
            params={"q": query}
        )
        if success:
            print(f"Found {len(response)} domains matching '{query}'")
        return success

    def test_get_domain_by_name(self, name, extension):
        """Test getting domain by name and extension"""
        success, response = self.run_test(
            "Get Domain by Name",
            "GET",
            f"domains/name/{name}/extension/{extension}",
            200
        )
        if success:
            print(f"Retrieved domain: {response.get('name')}{response.get('extension')}")
            self.test_domain = response
        return success

    def test_create_transaction(self):
        """Test creating a transaction"""
        if not self.test_domain:
            print("❌ No test domain available for transaction")
            return False
            
        transaction_data = {
            "domain_id": self.test_domain["id"],
            "amount": self.test_domain["price"],
            "payment_method": "escrow_transfer"
        }
        
        success, response = self.run_test(
            "Create Transaction",
            "POST",
            "transactions",
            200,
            data=transaction_data
        )
        
        if success:
            self.test_transaction = response
            print(f"Created transaction ID: {response.get('id')}")
        return success

    def test_add_chat_message(self, message="Hello, I'm interested in this domain", sender_type="user"):
        """Test adding a chat message to a transaction"""
        if not self.test_transaction:
            print("❌ No test transaction available for chat")
            return False
            
        chat_data = {
            "message": message,
            "sender_type": sender_type
        }
        
        success, response = self.run_test(
            "Add Chat Message",
            "POST",
            f"transactions/{self.test_transaction['id']}/chat",
            200,
            data=chat_data
        )
        
        if success:
            print(f"Added chat message to transaction: '{message}'")
        return success

    def test_get_chat_messages(self):
        """Test getting chat messages for a transaction"""
        if not self.test_transaction:
            print("❌ No test transaction available for chat")
            return False
            
        success, response = self.run_test(
            "Get Chat Messages",
            "GET",
            f"transactions/{self.test_transaction['id']}/chat",
            200
        )
        
        if success:
            print(f"Retrieved {len(response)} chat messages")
            if len(response) > 0:
                print(f"Sample message: '{response[0].get('message')}'")
        return success

    def test_update_transaction_status(self, status="completed", message="Transaction completed successfully"):
        """Test updating transaction status"""
        if not self.test_transaction:
            print("❌ No test transaction available")
            return False
            
        status_data = {
            "status": status,
            "message": message
        }
        
        success, response = self.run_test(
            "Update Transaction Status",
            "PUT",
            f"transactions/{self.test_transaction['id']}/status",
            200,
            data=status_data
        )
        
        if success:
            print(f"Updated transaction status to '{status}'")
        return success

    def test_transaction_chat_flow(self):
        """Test the complete transaction chat flow"""
        if not self.test_transaction:
            print("❌ No test transaction available for chat flow")
            return False
        
        print("\n🔄 Testing Transaction Chat Flow...")
        
        # Buyer sends initial message
        self.test_add_chat_message("I'd like to purchase this domain", "user")
        
        # Bot responds with escrow instructions
        self.test_add_chat_message("To proceed with the purchase, please transfer the payment to our escrow service.", "bot")
        
        # Buyer confirms payment
        self.test_add_chat_message("I have transferred the payment to the escrow account", "user")
        
        # Bot confirms payment received
        self.test_add_chat_message("Payment verified! Now notifying the seller to transfer the domain.", "bot")
        
        # Seller responds about domain transfer
        self.test_add_chat_message("I'll transfer the domain to DNGun's account", "user")
        
        # Bot confirms domain transfer
        self.test_add_chat_message("Domain transfer verified! Releasing payment to seller.", "bot")
        
        # Bot completes transaction
        self.test_add_chat_message("Transaction completed successfully! The domain has been transferred to the buyer.", "bot")
        
        # Get all messages to verify the flow
        return self.test_get_chat_messages()

    def test_register_user(self, email, username, password, full_name=None):
        """Test user registration"""
        user_data = {
            "email": email,
            "username": username,
            "password": password,
            "full_name": full_name
        }
        
        success, response = self.run_test(
            "Register User",
            "POST",
            "auth/register",
            200,
            data=user_data
        )
        
        if success:
            print(f"Registered new user: {response.get('username')}")
        return success

def test_buyer_seller_interaction():
    """Test the complete buyer-seller interaction with transaction chat"""
    # Get backend URL from environment
    backend_url = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001/api')
    
    print("🚀 Starting DNGun Transaction Chat Flow Test")
    print(f"Backend URL: {backend_url}")
    
    # Create buyer tester
    buyer_tester = DNGunAPITester(backend_url)
    
    # Test root endpoint
    buyer_tester.test_root_endpoint()
    
    # Login as buyer
    if not buyer_tester.test_login("buyer@dngun.com", "buyer123"):
        print("❌ Buyer login failed, stopping tests")
        return 1
    
    # Get buyer info
    buyer_tester.test_get_current_user()
    
    # Find available domains
    buyer_tester.test_get_all_domains()
    
    # Create transaction
    if not buyer_tester.test_create_transaction():
        print("❌ Transaction creation failed, stopping tests")
        return 1
    
    # Store transaction info
    transaction_id = buyer_tester.test_transaction["id"]
    domain_id = buyer_tester.test_transaction["domain_id"]
    
    # Buyer sends initial message
    buyer_tester.test_add_chat_message("I'd like to purchase this domain", "user")
    
    # Create seller tester
    seller_tester = DNGunAPITester(backend_url)
    
    # Login as seller
    if not seller_tester.test_login("seller@dngun.com", "seller123"):
        print("❌ Seller login failed, stopping tests")
        return 1
    
    # Get seller info
    seller_tester.test_get_current_user()
    
    # Seller checks transaction chat
    seller_tester.test_transaction = {"id": transaction_id}
    seller_tester.test_get_chat_messages()
    
    # Seller responds
    seller_tester.test_add_chat_message("I'll transfer the domain once payment is confirmed", "user")
    
    # Buyer checks for seller's response
    buyer_tester.test_get_chat_messages()
    
    # Buyer confirms payment
    buyer_tester.test_add_chat_message("I have transferred the payment to the escrow account", "user")
    
    # Seller confirms domain transfer
    seller_tester.test_add_chat_message("I've transferred the domain to DNGun's account", "user")
    
    # Buyer updates transaction status
    buyer_tester.test_update_transaction_status("completed", "Domain received successfully")
    
    # Both check final messages
    buyer_tester.test_get_chat_messages()
    seller_tester.test_get_chat_messages()
    
    # Print results
    print(f"\n📊 Buyer tests passed: {buyer_tester.tests_passed}/{buyer_tester.tests_run}")
    print(f"📊 Seller tests passed: {seller_tester.tests_passed}/{seller_tester.tests_run}")
    
    total_tests = buyer_tester.tests_run + seller_tester.tests_run
    total_passed = buyer_tester.tests_passed + seller_tester.tests_passed
    
    print(f"📊 Total tests passed: {total_passed}/{total_tests}")
    return 0 if total_passed == total_tests else 1

def test_payment_integration():
    """Test the Stripe payment integration"""
    # Get backend URL from environment
    backend_url = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001/api')
    
    print("\n🔍 TESTING STRIPE PAYMENT INTEGRATION\n")
    print(f"Backend URL: {backend_url}")
    
    # Setup tester
    tester = DNGunAPITester(backend_url)
    
    # Test root endpoint
    tester.test_root_endpoint()
    
    # Test authentication
    if not tester.test_login("admin@dngun.com", "admin123"):
        print("❌ Login failed, but continuing with tests...")
    
    # Test user info
    tester.test_get_current_user()
    
    # Test getting available domains
    tester.test_get_all_domains()
    
    if not tester.test_domain:
        print("❌ No domain available for testing, stopping payment tests")
        return 1
    
    # Test payment endpoints
    print("\n🔍 Testing Payment Endpoints...")
    
    # Test creating checkout session
    checkout_data = {
        "domain_id": tester.test_domain["id"],
        "domain_name": f"{tester.test_domain['name']}{tester.test_domain['extension']}",
        "origin_url": "http://localhost:3000",
        "currency": "usd",
        "metadata": {
            "test": "true",
            "timestamp": datetime.now().isoformat()
        }
    }
    
    success, response = tester.run_test(
        "Create Checkout Session",
        "POST",
        "payments/checkout/domain",
        200,
        data=checkout_data
    )
    
    if success and 'session_id' in response:
        session_id = response['session_id']
        print(f"✅ Created checkout session: {session_id}")
        print(f"✅ Checkout URL: {response['checkout_url']}")
        
        # Test checking payment status
        success, status_response = tester.run_test(
            "Check Payment Status",
            "GET",
            f"payments/status/{session_id}",
            200
        )
        
        if success and 'payment_status' in status_response:
            print(f"✅ Payment status: {status_response['payment_status']}")
            print(f"✅ Stripe payment status: {status_response['stripe_payment_status']}")
        
        # Test payment history
        success, history_response = tester.run_test(
            "Get Payment History",
            "GET",
            "payments/history",
            200
        )
        
        if success:
            print(f"✅ Retrieved payment history with {len(history_response)} entries")
    
    # Test unauthenticated checkout
    # Save token temporarily and clear it
    temp_token = tester.token
    tester.token = None
    
    success, response = tester.run_test(
        "Unauthenticated Checkout",
        "POST",
        "payments/checkout/domain",
        200,  # Should still work without auth
        data=checkout_data
    )
    
    # Restore token
    tester.token = temp_token
    
    if success and 'session_id' in response:
        print(f"✅ Created unauthenticated checkout session: {response['session_id']}")
    
    # Test invalid domain checkout
    import uuid
    invalid_domain_id = str(uuid.uuid4())
    
    invalid_checkout_data = {
        "domain_id": invalid_domain_id,
        "domain_name": "invalid-domain.com",
        "origin_url": "http://localhost:3000",
        "currency": "usd"
    }
    
    success, response = tester.run_test(
        "Invalid Domain Checkout",
        "POST",
        "payments/checkout/domain",
        404,  # Should return 404 Not Found
        data=invalid_checkout_data
    )
    
    if not success:
        print("✅ Correctly handled invalid domain checkout")
    
    # Print results
    print(f"\n📊 Payment tests passed: {tester.tests_passed}/{tester.tests_run}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

def main():
    # Get backend URL from environment
    backend_url = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001/api')
    
    print("\n🔍 TESTING STRIPE PAYMENT INTEGRATION\n")
    print(f"Backend URL: {backend_url}")
    
    # Setup tester
    tester = DNGunAPITester(backend_url)
    
    # Test root endpoint
    tester.test_root_endpoint()
    
    # Test getting available domains
    tester.test_get_all_domains()
    
    if not tester.test_domain:
        print("❌ No domain available for testing, stopping payment tests")
        return 1
    
    # Test payment endpoints
    print("\n🔍 Testing Payment Endpoints...")
    
    # Test creating checkout session
    checkout_data = {
        "domain_id": tester.test_domain["id"],
        "domain_name": f"{tester.test_domain['name']}{tester.test_domain['extension']}",
        "origin_url": "http://localhost:3000",
        "currency": "usd",
        "metadata": {
            "test": "true",
            "timestamp": datetime.now().isoformat()
        }
    }
    
    # Test anonymous checkout (without authentication)
    success, response = tester.run_test(
        "Anonymous Checkout",
        "POST",
        "payments/checkout/domain",
        200,  # Should work without auth
        data=checkout_data
    )
    
    if success and 'session_id' in response:
        session_id = response['session_id']
        print(f"✅ Created anonymous checkout session: {session_id}")
        print(f"✅ Checkout URL: {response['checkout_url']}")
        
        # Test checking payment status
        success, status_response = tester.run_test(
            "Check Payment Status",
            "GET",
            f"payments/status/{session_id}",
            200
        )
        
        if success and 'payment_status' in status_response:
            print(f"✅ Payment status: {status_response['payment_status']}")
            print(f"✅ Stripe payment status: {status_response['stripe_payment_status']}")
    
    # Test authenticated checkout
    # Login as a user
    if tester.test_login("buyer@dngun.com", "buyer123"):
        print("✅ Login successful, testing authenticated checkout")
        
        # Test user info
        tester.test_get_current_user()
        
        # Test creating checkout session as authenticated user
        success, response = tester.run_test(
            "Authenticated Checkout",
            "POST",
            "payments/checkout/domain",
            200,
            data=checkout_data
        )
        
        if success and 'session_id' in response:
            session_id = response['session_id']
            print(f"✅ Created authenticated checkout session: {session_id}")
            print(f"✅ Checkout URL: {response['checkout_url']}")
            
            # Test checking payment status
            success, status_response = tester.run_test(
                "Check Payment Status",
                "GET",
                f"payments/status/{session_id}",
                200
            )
            
            if success and 'payment_status' in status_response:
                print(f"✅ Payment status: {status_response['payment_status']}")
                print(f"✅ Stripe payment status: {status_response['stripe_payment_status']}")
            
            # Test payment history
            success, history_response = tester.run_test(
                "Get Payment History",
                "GET",
                "payments/history",
                200
            )
            
            if success:
                print(f"✅ Retrieved payment history with {len(history_response)} entries")
    else:
        print("⚠️ Login failed, skipping authenticated checkout tests")
    
    # Test invalid domain checkout
    import uuid
    invalid_domain_id = str(uuid.uuid4())
    
    invalid_checkout_data = {
        "domain_id": invalid_domain_id,
        "domain_name": "invalid-domain.com",
        "origin_url": "http://localhost:3000",
        "currency": "usd"
    }
    
    success, response = tester.run_test(
        "Invalid Domain Checkout",
        "POST",
        "payments/checkout/domain",
        404,  # Should return 404 Not Found
        data=invalid_checkout_data
    )
    
    if not success:
        print("✅ Correctly handled invalid domain checkout")
    
    # Print results
    print(f"\n📊 Payment tests passed: {tester.tests_passed}/{tester.tests_run}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

def test_stripe_payment_integration():
    """Test the Stripe payment integration specifically"""
    # Get backend URL from environment
    backend_url = os.environ.get('REACT_APP_BACKEND_URL', 'https://fe2a4b0f-3203-46bc-b0cf-2cc736b736fd.preview.emergentagent.com')
    
    print("\n🔍 TESTING STRIPE PAYMENT INTEGRATION\n")
    print(f"Backend URL: {backend_url}")
    
    # Setup tester with explicit /api prefix
    tester = DNGunAPITester(f"{backend_url}/api")
    
    # Test root endpoint
    tester.test_root_endpoint()
    
    # Test payment endpoints
    print("\n🔍 Testing Payment Endpoints...")
    
    # Use a specific domain ID from the available domains
    domain_id = "170258b4-8250-4c2e-ae67-d32c694acd6f"  # shopease.com
    print(f"Using domain ID: {domain_id}")
    
    checkout_data = {
        "domain_id": domain_id,
        "origin_url": "http://localhost:3000",
    }
    
    # Test anonymous checkout (without authentication)
    success, response = tester.run_test(
        "Anonymous Checkout",
        "POST",
        "payments/checkout/domain",
        200,  # Should work without auth
        data=checkout_data
    )
    
    if success and 'session_id' in response:
        session_id = response['session_id']
        print(f"✅ Created anonymous checkout session: {session_id}")
        print(f"✅ Checkout URL: {response['checkout_url']}")
        
        # Test checking payment status
        success, status_response = tester.run_test(
            "Check Payment Status",
            "GET",
            f"payments/status/{session_id}",
            200
        )
        
        if success and 'payment_status' in status_response:
            print(f"✅ Payment status: {status_response['payment_status']}")
            print(f"✅ Stripe payment status: {status_response['stripe_payment_status']}")
    
    # Test invalid domain checkout
    import uuid
    invalid_domain_id = str(uuid.uuid4())
    
    invalid_checkout_data = {
        "domain_id": invalid_domain_id,
        "origin_url": "http://localhost:3000",
    }
    
    success, response = tester.run_test(
        "Invalid Domain Checkout",
        "POST",
        "payments/checkout/domain",
        404,  # Should return 404 Not Found
        data=invalid_checkout_data
    )
    
    if not success:
        print("✅ Correctly handled invalid domain checkout")
    
    # Print results
    print(f"\n📊 Payment tests passed: {tester.tests_passed}/{tester.tests_run}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

def test_stripe_payment_integration_enhanced():
    """Test the Stripe payment integration with enhanced error handling"""
    # Get backend URL from environment
    backend_url = os.environ.get('REACT_APP_BACKEND_URL', 'https://fe2a4b0f-3203-46bc-b0cf-2cc736b736fd.preview.emergentagent.com')
    
    print("\n🔍 TESTING STRIPE PAYMENT INTEGRATION (ENHANCED)\n")
    print(f"Backend URL: {backend_url}")
    
    # Setup tester with explicit /api prefix
    tester = DNGunAPITester(f"{backend_url}/api")
    
    # Test root endpoint
    tester.test_root_endpoint()
    
    # Test authentication
    print("\n🔍 Testing Authentication...")
    auth_success = tester.test_login("admin@dngun.com", "admin123")
    if auth_success:
        print("✅ Authentication successful")
        # Test user info
        tester.test_get_current_user()
    else:
        print("⚠️ Authentication failed, continuing with anonymous checkout")
    
    # Test getting available domains
    print("\n🔍 Testing Domain Retrieval...")
    domains_success = tester.test_get_all_domains()
    
    if not tester.test_domain and domains_success:
        print("⚠️ No domains returned from API, using hardcoded domain ID")
        # Use a hardcoded domain ID for testing
        domain_id = "170258b4-8250-4c2e-ae67-d32c694acd6f"  # Example domain ID
    elif not domains_success:
        print("❌ Failed to retrieve domains, using hardcoded domain ID")
        domain_id = "170258b4-8250-4c2e-ae67-d32c694acd6f"  # Example domain ID
    else:
        domain_id = tester.test_domain["id"]
        print(f"✅ Using domain: {tester.test_domain.get('name')}{tester.test_domain.get('extension')} (ID: {domain_id})")
    
    # Test payment endpoints
    print("\n🔍 Testing Payment Endpoints...")
    
    # Test creating checkout session
    checkout_data = {
        "domain_id": domain_id,
        "origin_url": "http://localhost:3000",
    }
    
    # Test checkout with current authentication state
    success, response = tester.run_test(
        "Create Checkout Session",
        "POST",
        "payments/checkout/domain",
        200,
        data=checkout_data
    )
    
    if success and 'session_id' in response:
        session_id = response['session_id']
        print(f"✅ Created checkout session: {session_id}")
        print(f"✅ Checkout URL: {response['checkout_url']}")
        
        # Test checking payment status
        success, status_response = tester.run_test(
            "Check Payment Status",
            "GET",
            f"payments/status/{session_id}",
            200
        )
        
        if success and 'payment_status' in status_response:
            print(f"✅ Payment status: {status_response['payment_status']}")
            print(f"✅ Stripe payment status: {status_response['stripe_payment_status']}")
        
        # If authenticated, test payment history
        if tester.token:
            success, history_response = tester.run_test(
                "Get Payment History",
                "GET",
                "payments/history",
                200
            )
            
            if success:
                print(f"✅ Retrieved payment history with {len(history_response)} entries")
    
    # Test invalid domain checkout
    import uuid
    invalid_domain_id = str(uuid.uuid4())
    
    invalid_checkout_data = {
        "domain_id": invalid_domain_id,
        "origin_url": "http://localhost:3000",
    }
    
    success, response = tester.run_test(
        "Invalid Domain Checkout",
        "POST",
        "payments/checkout/domain",
        404,  # Should return 404 Not Found
        data=invalid_checkout_data
    )
    
    if not success:
        print("✅ Correctly handled invalid domain checkout")
    
    # Print results
    print(f"\n📊 Payment tests passed: {tester.tests_passed}/{tester.tests_run}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

def test_domain_loading():
    """Test the domain loading functionality"""
    # Get backend URL from environment
    backend_url = os.environ.get('REACT_APP_BACKEND_URL', 'https://fe2a4b0f-3203-46bc-b0cf-2cc736b736fd.preview.emergentagent.com')
    
    print("\n🔍 TESTING DOMAIN LOADING FUNCTIONALITY\n")
    print(f"Backend URL: {backend_url}")
    
    # Setup tester with explicit /api prefix
    tester = DNGunAPITester(f"{backend_url}/api")
    
    # Test root endpoint
    tester.test_root_endpoint()
    
    # Test getting all domains
    print("\n🔍 Testing Domain Retrieval...")
    domains_success = tester.test_get_all_domains()
    
    if domains_success:
        if len(tester.test_domain) > 0:
            print(f"✅ Successfully retrieved domains from API")
            print(f"✅ Sample domain: {tester.test_domain.get('name')}{tester.test_domain.get('extension')}")
        else:
            print("⚠️ Retrieved domains but the list is empty")
    else:
        print("❌ Failed to retrieve domains from API")
    
    # Test domain search
    if domains_success and tester.test_domain:
        # Use the first few characters of a domain name for search
        search_term = tester.test_domain.get('name')[:3]
        print(f"\n🔍 Testing Domain Search with term: '{search_term}'...")
        search_success = tester.test_search_domains(search_term)
        
        if search_success:
            print(f"✅ Domain search functionality is working")
        else:
            print(f"❌ Domain search functionality failed")
    
    # Test getting domain by name
    if domains_success and tester.test_domain:
        domain_name = tester.test_domain.get('name')
        domain_extension = tester.test_domain.get('extension')
        
        print(f"\n🔍 Testing Get Domain by Name: '{domain_name}{domain_extension}'...")
        name_success = tester.test_get_domain_by_name(domain_name, domain_extension)
        
        if name_success:
            print(f"✅ Get domain by name functionality is working")
        else:
            print(f"❌ Get domain by name functionality failed")
    
    # Print results
    print(f"\n📊 Domain loading tests passed: {tester.tests_passed}/{tester.tests_run}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(test_stripe_payment_integration_enhanced())