import requests
import sys
import json
import os
from datetime import datetime

class DNGunAPITester:
    def __init__(self, base_url=None):
        # Use the environment variable or fallback to default
        self.base_url = base_url or os.environ.get('REACT_APP_BACKEND_URL', 'https://fe2a4b0f-3203-46bc-b0cf-2cc736b736fd.preview.emergentagent.com/api')
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

    def test_get_user_domains(self):
        """Test getting user's domains"""
        success, response = self.run_test(
            "Get User Domains",
            "GET",
            "users/me/domains",
            200
        )
        if success:
            print(f"Retrieved {len(response)} user domains")
        return success

    def test_get_user_transactions(self):
        """Test getting user's transactions"""
        success, response = self.run_test(
            "Get User Transactions",
            "GET",
            "transactions",
            200
        )
        if success:
            print(f"Retrieved {len(response)} user transactions")
        return success

    def test_payment_checkout(self, domain_id):
        """Test creating a payment checkout session"""
        checkout_data = {
            "domain_id": domain_id,
            "origin_url": "https://fe2a4b0f-3203-46bc-b0cf-2cc736b736fd.preview.emergentagent.com"
        }
        
        success, response = self.run_test(
            "Create Payment Checkout",
            "POST",
            "payments/checkout/domain",
            200,
            data=checkout_data
        )
        
        if success and 'checkout_url' in response:
            print(f"✅ Checkout URL: {response['checkout_url']}")
        
        return success, response

def test_critical_issues():
    """Test the critical issues mentioned in the review request"""
    # Get backend URL from environment
    backend_url = os.environ.get('REACT_APP_BACKEND_URL', 'https://fe2a4b0f-3203-46bc-b0cf-2cc736b736fd.preview.emergentagent.com/api')
    
    print("\n🔍 TESTING CRITICAL ISSUES\n")
    print(f"Backend URL: {backend_url}")
    
    # Setup tester
    tester = DNGunAPITester(backend_url)
    
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
        print("❌ Authentication failed, stopping tests")
        return 1
    
    # Test user domains endpoint
    print("\n🔍 Testing User Domains Endpoint...")
    domains_success = tester.test_get_user_domains()
    if domains_success:
        print("✅ User domains endpoint is working")
    else:
        print("❌ User domains endpoint failed")
    
    # Test user transactions endpoint
    print("\n🔍 Testing User Transactions Endpoint...")
    transactions_success = tester.test_get_user_transactions()
    if transactions_success:
        print("✅ User transactions endpoint is working")
    else:
        print("❌ User transactions endpoint failed")
    
    # Test getting all domains
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
    
    # Test payment checkout
    print("\n🔍 Testing Payment Checkout...")
    checkout_success, checkout_response = tester.test_payment_checkout(domain_id)
    if checkout_success:
        print("✅ Payment checkout endpoint is working")
    else:
        print("❌ Payment checkout endpoint failed")
    
    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

def test_comprehensive_api():
    """Run a comprehensive test of all API endpoints"""
    # Get backend URL from environment
    backend_url = os.environ.get('REACT_APP_BACKEND_URL', 'https://fe2a4b0f-3203-46bc-b0cf-2cc736b736fd.preview.emergentagent.com/api')
    
    print("\n🔍 COMPREHENSIVE API TESTING\n")
    print(f"Backend URL: {backend_url}")
    
    # Setup tester
    tester = DNGunAPITester(backend_url)
    
    # Test root endpoint
    root_success = tester.test_root_endpoint()
    
    # Test authentication
    print("\n🔍 Testing Authentication...")
    auth_success = tester.test_login("admin@dngun.com", "admin123")
    if auth_success:
        print("✅ Authentication successful")
        # Test user info
        user_info_success = tester.test_get_current_user()
    else:
        print("❌ Authentication failed")
        user_info_success = False
    
    # Test domain endpoints
    print("\n🔍 Testing Domain Endpoints...")
    domains_success = tester.test_get_all_domains()
    
    if domains_success and tester.test_domain:
        # Test domain search
        search_term = tester.test_domain.get('name')[:3]
        search_success = tester.test_search_domains(search_term)
        
        # Test domain by name
        name_success = tester.test_get_domain_by_name(
            tester.test_domain.get('name'),
            tester.test_domain.get('extension')
        )
    else:
        search_success = False
        name_success = False
    
    # Test user-specific endpoints if authenticated
    if auth_success:
        print("\n🔍 Testing User-specific Endpoints...")
        user_domains_success = tester.test_get_user_domains()
        user_transactions_success = tester.test_get_user_transactions()
    else:
        user_domains_success = False
        user_transactions_success = False
    
    # Test payment endpoints
    print("\n🔍 Testing Payment Endpoints...")
    if domains_success and tester.test_domain:
        domain_id = tester.test_domain["id"]
    else:
        domain_id = "170258b4-8250-4c2e-ae67-d32c694acd6f"  # Hardcoded example
    
    checkout_success, _ = tester.test_payment_checkout(domain_id)
    
    # Summarize results
    print("\n📊 API TEST SUMMARY:")
    print(f"✅ Root Endpoint: {root_success}")
    print(f"✅ Authentication: {auth_success}")
    print(f"✅ User Info: {user_info_success}")
    print(f"✅ Domain Listing: {domains_success}")
    print(f"✅ Domain Search: {search_success}")
    print(f"✅ Domain by Name: {name_success}")
    print(f"✅ User Domains: {user_domains_success}")
    print(f"✅ User Transactions: {user_transactions_success}")
    print(f"✅ Payment Checkout: {checkout_success}")
    
    print(f"\n📊 Total tests passed: {tester.tests_passed}/{tester.tests_run}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(test_comprehensive_api())