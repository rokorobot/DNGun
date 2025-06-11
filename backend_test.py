import requests
import sys
import json
from datetime import datetime

class DNGunAPITester:
    def __init__(self, base_url="http://localhost:8001/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.current_user = None
        self.test_domain = None
        self.test_transaction = None

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
        print(f"\n🔍 Testing Login...")
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

    def test_add_chat_message(self):
        """Test adding a chat message to a transaction"""
        if not self.test_transaction:
            print("❌ No test transaction available for chat")
            return False
            
        chat_data = {
            "message": "Hello, I'm interested in this domain",
            "sender_type": "user"
        }
        
        success, response = self.run_test(
            "Add Chat Message",
            "POST",
            f"transactions/{self.test_transaction['id']}/chat",
            200,
            data=chat_data
        )
        
        if success:
            print(f"Added chat message to transaction")
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
        return success

    def test_update_transaction_status(self):
        """Test updating transaction status"""
        if not self.test_transaction:
            print("❌ No test transaction available")
            return False
            
        status_data = {
            "status": "completed",
            "message": "Transaction completed successfully"
        }
        
        success, response = self.run_test(
            "Update Transaction Status",
            "PUT",
            f"transactions/{self.test_transaction['id']}/status",
            200,
            data=status_data
        )
        
        if success:
            print(f"Updated transaction status to 'completed'")
        return success

def main():
    # Get backend URL from environment or use default
    backend_url = "http://localhost:8001/api"
    
    # Setup tester
    tester = DNGunAPITester(backend_url)
    
    # Run tests
    print("🚀 Starting DNGun API Tests")
    print(f"Backend URL: {backend_url}")
    
    # Test root endpoint
    tester.test_root_endpoint()
    
    # Test authentication
    if not tester.test_login("buyer@dngun.com", "buyer123"):
        print("❌ Login failed, stopping tests")
        return 1
        
    # Test user info
    tester.test_get_current_user()
    
    # Test domain endpoints
    tester.test_get_all_domains()
    tester.test_search_domains("tech")
    tester.test_get_domain_by_name("webcreator", ".com")
    
    # Test transaction endpoints
    tester.test_create_transaction()
    tester.test_add_chat_message()
    tester.test_get_chat_messages()
    tester.test_update_transaction_status()
    
    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())