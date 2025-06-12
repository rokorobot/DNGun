import requests
import sys
import json
import os
from datetime import datetime

class DNGunAPITester:
    def __init__(self, base_url=None):
        # Use the environment variable or fallback to default
        self.base_url = base_url or os.environ.get('REACT_APP_BACKEND_URL', 'https://fe2a4b0f-3203-46bc-b0cf-2cc736b736fd.preview.emergentagent.com')
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        
        # Print the base URL being used
        print(f"Using base URL: {self.base_url}")
        
        # Test different URL combinations
        self.test_urls = [
            f"{self.base_url}/api/auth/token",  # Correct URL with /api prefix
            f"{self.base_url}/auth/token",      # Incorrect URL without /api prefix
        ]

    def test_login_with_different_urls(self, email, password):
        """Test login with different URL combinations"""
        print("\n🔍 Testing login with different URL combinations...")
        
        form_data = {
            'username': email,
            'password': password
        }
        
        headers = {'Content-Type': 'application/x-www-form-urlencoded'}
        
        for url in self.test_urls:
            print(f"\n🔍 Testing URL: {url}")
            try:
                response = requests.post(
                    url, 
                    data=form_data,
                    headers=headers
                )
                
                print(f"Status code: {response.status_code}")
                if response.status_code == 200:
                    print("✅ Login successful with this URL")
                    try:
                        data = response.json()
                        print(f"Response: {json.dumps(data)[:50]}...")
                    except:
                        print(f"Response is not JSON: {response.text[:100]}...")
                else:
                    print("❌ Login failed with this URL")
                    print(f"Response: {response.text[:100]}...")
            except Exception as e:
                print(f"❌ Error: {str(e)}")

    def test_direct_api_calls(self):
        """Test direct API calls with different URL combinations"""
        print("\n🔍 Testing direct API calls with different URL combinations...")
        
        # Test endpoints
        endpoints = [
            "/domains",  # Public endpoint that doesn't require auth
            "/",         # Root endpoint
        ]
        
        for base_url in [f"{self.base_url}/api", self.base_url]:
            print(f"\n🔍 Testing base URL: {base_url}")
            
            for endpoint in endpoints:
                url = f"{base_url}{endpoint}"
                print(f"\n🔍 Testing endpoint: {url}")
                
                try:
                    response = requests.get(url)
                    print(f"Status code: {response.status_code}")
                    
                    if response.status_code == 200:
                        print("✅ Request successful")
                        try:
                            data = response.json()
                            if isinstance(data, list):
                                print(f"Response: List with {len(data)} items")
                            else:
                                print(f"Response: {json.dumps(data)[:100]}...")
                        except:
                            print(f"Response is not JSON: {response.text[:100]}...")
                    else:
                        print("❌ Request failed")
                        print(f"Response: {response.text[:100]}...")
                except Exception as e:
                    print(f"❌ Error: {str(e)}")

def test_axios_url_construction():
    """Test how axios constructs URLs with different base URLs"""
    print("\n🔍 TESTING AXIOS URL CONSTRUCTION\n")
    
    # Test cases for baseURL
    base_urls = [
        "https://fe2a4b0f-3203-46bc-b0cf-2cc736b736fd.preview.emergentagent.com",
        "https://fe2a4b0f-3203-46bc-b0cf-2cc736b736fd.preview.emergentagent.com/",
        "https://fe2a4b0f-3203-46bc-b0cf-2cc736b736fd.preview.emergentagent.com/api",
        "https://fe2a4b0f-3203-46bc-b0cf-2cc736b736fd.preview.emergentagent.com/api/"
    ]
    
    # Test endpoints
    endpoints = [
        "/auth/token",
        "auth/token"
    ]
    
    print("Simulating how axios would construct URLs with different base URLs and endpoints:")
    
    for base_url in base_urls:
        print(f"\nBase URL: {base_url}")
        
        for endpoint in endpoints:
            # Simulate axios URL construction logic
            if endpoint.startswith('/'):
                # If endpoint starts with /, axios will replace the path part of baseURL
                if base_url.endswith('/'):
                    url = base_url[:-1] + endpoint
                else:
                    url = base_url + endpoint
            else:
                # If endpoint doesn't start with /, axios will append to baseURL
                if base_url.endswith('/'):
                    url = base_url + endpoint
                else:
                    url = base_url + '/' + endpoint
            
            print(f"  Endpoint: {endpoint} → Resulting URL: {url}")

def main():
    # Test axios URL construction
    test_axios_url_construction()
    
    # Test API with different URL combinations
    tester = DNGunAPITester()
    
    # Test login with different URLs
    tester.test_login_with_different_urls("rokoroko@seznam.cz", "testpassword123")
    
    # Test direct API calls
    tester.test_direct_api_calls()
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
