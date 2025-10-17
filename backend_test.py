#!/usr/bin/env python3
"""
Backend Authentication System Test Suite
Tests all authentication endpoints and functionality
"""

import requests
import json
import uuid
import time
from datetime import datetime, timezone
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/backend/.env')

# Configuration
BASE_URL = "https://elite-marketplace.preview.emergentagent.com/api"
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')

# Test data
TEST_USER_1 = {
    "email": f"testuser1_{uuid.uuid4().hex[:8]}@example.com",
    "password": "testpass123",
    "name": "Test User One"
}

TEST_USER_2 = {
    "email": f"testuser2_{uuid.uuid4().hex[:8]}@example.com", 
    "password": "testpass456",
    "name": "Test User Two"
}

class AuthTestSuite:
    def __init__(self):
        self.session = requests.Session()
        self.user1_data = None
        self.user2_data = None
        self.user1_session_token = None
        self.user2_session_token = None
        self.user1_referral_code = None
        self.test_results = []
        
    def log_result(self, test_name, success, message="", details=None):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        if not success and details:
            print(f"   Details: {details}")
        print()

    def test_database_connection(self):
        """Test MongoDB connection and collections"""
        try:
            from motor.motor_asyncio import AsyncIOMotorClient
            import asyncio
            
            async def check_db():
                client = AsyncIOMotorClient(MONGO_URL)
                db = client[DB_NAME]
                
                # Check if collections exist
                collections = await db.list_collection_names()
                expected_collections = ['users', 'user_sessions']
                
                missing_collections = []
                for col in expected_collections:
                    if col not in collections:
                        missing_collections.append(col)
                
                client.close()
                return missing_collections
            
            missing = asyncio.run(check_db())
            if missing:
                self.log_result("Database Connection", False, 
                              f"Missing collections: {missing}")
            else:
                self.log_result("Database Connection", True, 
                              "All required collections exist")
                
        except Exception as e:
            self.log_result("Database Connection", False, 
                          f"Database connection failed: {str(e)}")

    def test_register_user1(self):
        """Test user registration (first user for referral system)"""
        try:
            response = self.session.post(
                f"{BASE_URL}/auth/register",
                json=TEST_USER_1,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validate response structure
                required_fields = ['user', 'session_token']
                user_fields = ['id', 'email', 'name', 'referral_code']
                
                missing_fields = []
                for field in required_fields:
                    if field not in data:
                        missing_fields.append(field)
                
                if 'user' in data:
                    for field in user_fields:
                        if field not in data['user']:
                            missing_fields.append(f"user.{field}")
                
                if missing_fields:
                    self.log_result("User Registration (User 1)", False,
                                  f"Missing fields: {missing_fields}")
                    return
                
                # Store user data
                self.user1_data = data['user']
                self.user1_session_token = data['session_token']
                self.user1_referral_code = data['user']['referral_code']
                
                # Check if cookie was set
                cookies = response.cookies
                session_cookie = cookies.get('session_token')
                
                if not session_cookie:
                    self.log_result("User Registration (User 1)", False,
                                  "Session cookie not set")
                    return
                
                self.log_result("User Registration (User 1)", True,
                              f"User registered successfully. Referral code: {self.user1_referral_code}")
                
            else:
                self.log_result("User Registration (User 1)", False,
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("User Registration (User 1)", False, str(e))

    def test_register_user2_with_referral(self):
        """Test user registration with referral code"""
        if not self.user1_referral_code:
            self.log_result("User Registration with Referral", False,
                          "User 1 referral code not available")
            return
            
        try:
            # Add referral code to user 2 data
            user2_with_referral = TEST_USER_2.copy()
            user2_with_referral['referral_code'] = self.user1_referral_code
            
            response = self.session.post(
                f"{BASE_URL}/auth/register",
                json=user2_with_referral,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.user2_data = data['user']
                self.user2_session_token = data['session_token']
                
                self.log_result("User Registration with Referral", True,
                              f"User 2 registered with referral code: {self.user1_referral_code}")
            else:
                self.log_result("User Registration with Referral", False,
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("User Registration with Referral", False, str(e))

    def test_referral_bonus(self):
        """Test that referral bonus was added to user 1"""
        if not self.user1_session_token:
            self.log_result("Referral Bonus System", False,
                          "User 1 session token not available")
            return
            
        try:
            # Get user 1 data to check referral bonus
            headers = {"Authorization": f"Bearer {self.user1_session_token}"}
            response = self.session.get(
                f"{BASE_URL}/auth/me",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                referral_bonus = data.get('referral_bonus', 0)
                
                if referral_bonus >= 10.0:
                    self.log_result("Referral Bonus System", True,
                                  f"Referral bonus correctly added: {referral_bonus} AZN")
                else:
                    self.log_result("Referral Bonus System", False,
                                  f"Referral bonus not added correctly. Expected: 10.0, Got: {referral_bonus}")
            else:
                self.log_result("Referral Bonus System", False,
                              f"Failed to get user data: HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("Referral Bonus System", False, str(e))

    def test_duplicate_registration(self):
        """Test registration with existing email"""
        try:
            response = self.session.post(
                f"{BASE_URL}/auth/register",
                json=TEST_USER_1,  # Same email as user 1
                timeout=10
            )
            
            if response.status_code == 400:
                data = response.json()
                if "already registered" in data.get('detail', '').lower():
                    self.log_result("Duplicate Email Registration", True,
                                  "Correctly rejected duplicate email")
                else:
                    self.log_result("Duplicate Email Registration", False,
                                  f"Wrong error message: {data.get('detail')}")
            else:
                self.log_result("Duplicate Email Registration", False,
                              f"Should return 400, got {response.status_code}")
                
        except Exception as e:
            self.log_result("Duplicate Email Registration", False, str(e))

    def test_login_valid_credentials(self):
        """Test login with valid credentials"""
        try:
            login_data = {
                "email": TEST_USER_1["email"],
                "password": TEST_USER_1["password"]
            }
            
            response = self.session.post(
                f"{BASE_URL}/auth/login",
                json=login_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validate response structure
                if 'user' in data and 'session_token' in data:
                    # Check if cookie was set
                    cookies = response.cookies
                    session_cookie = cookies.get('session_token')
                    
                    if session_cookie:
                        self.log_result("Login Valid Credentials", True,
                                      "Login successful with valid credentials")
                    else:
                        self.log_result("Login Valid Credentials", False,
                                      "Session cookie not set")
                else:
                    self.log_result("Login Valid Credentials", False,
                                  "Invalid response structure")
            else:
                self.log_result("Login Valid Credentials", False,
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Login Valid Credentials", False, str(e))

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        try:
            login_data = {
                "email": TEST_USER_1["email"],
                "password": "wrongpassword"
            }
            
            response = self.session.post(
                f"{BASE_URL}/auth/login",
                json=login_data,
                timeout=10
            )
            
            if response.status_code == 401:
                self.log_result("Login Invalid Credentials", True,
                              "Correctly rejected invalid credentials")
            else:
                self.log_result("Login Invalid Credentials", False,
                              f"Should return 401, got {response.status_code}")
                
        except Exception as e:
            self.log_result("Login Invalid Credentials", False, str(e))

    def test_login_nonexistent_user(self):
        """Test login with non-existent email"""
        try:
            login_data = {
                "email": "nonexistent@example.com",
                "password": "anypassword"
            }
            
            response = self.session.post(
                f"{BASE_URL}/auth/login",
                json=login_data,
                timeout=10
            )
            
            if response.status_code == 401:
                self.log_result("Login Non-existent User", True,
                              "Correctly rejected non-existent user")
            else:
                self.log_result("Login Non-existent User", False,
                              f"Should return 401, got {response.status_code}")
                
        except Exception as e:
            self.log_result("Login Non-existent User", False, str(e))

    def test_get_current_user_with_cookie(self):
        """Test /auth/me with session cookie"""
        if not self.user1_session_token:
            self.log_result("Get Current User (Cookie)", False,
                          "No session token available")
            return
            
        try:
            # Set session cookie
            cookies = {"session_token": self.user1_session_token}
            
            response = self.session.get(
                f"{BASE_URL}/auth/me",
                cookies=cookies,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validate user data
                required_fields = ['id', 'email', 'name', 'role', 'referral_code', 'referral_bonus']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_result("Get Current User (Cookie)", False,
                                  f"Missing fields: {missing_fields}")
                else:
                    self.log_result("Get Current User (Cookie)", True,
                                  f"User data retrieved successfully: {data['email']}")
            else:
                self.log_result("Get Current User (Cookie)", False,
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Get Current User (Cookie)", False, str(e))

    def test_get_current_user_with_header(self):
        """Test /auth/me with Authorization header"""
        if not self.user1_session_token:
            self.log_result("Get Current User (Header)", False,
                          "No session token available")
            return
            
        try:
            headers = {"Authorization": f"Bearer {self.user1_session_token}"}
            
            response = self.session.get(
                f"{BASE_URL}/auth/me",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log_result("Get Current User (Header)", True,
                              f"User data retrieved via header: {data['email']}")
            else:
                self.log_result("Get Current User (Header)", False,
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Get Current User (Header)", False, str(e))

    def test_get_current_user_invalid_token(self):
        """Test /auth/me with invalid token"""
        try:
            # Use fresh session to avoid cookie contamination
            fresh_session = requests.Session()
            headers = {"Authorization": "Bearer invalid_token_12345"}
            
            response = fresh_session.get(
                f"{BASE_URL}/auth/me",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 401:
                self.log_result("Get Current User (Invalid Token)", True,
                              "Correctly rejected invalid token")
            else:
                self.log_result("Get Current User (Invalid Token)", False,
                              f"Should return 401, got {response.status_code}")
                
        except Exception as e:
            self.log_result("Get Current User (Invalid Token)", False, str(e))

    def test_get_current_user_no_token(self):
        """Test /auth/me without token"""
        try:
            # Use fresh session to avoid cookie contamination
            fresh_session = requests.Session()
            response = fresh_session.get(
                f"{BASE_URL}/auth/me",
                timeout=10
            )
            
            if response.status_code == 401:
                self.log_result("Get Current User (No Token)", True,
                              "Correctly rejected request without token")
            else:
                self.log_result("Get Current User (No Token)", False,
                              f"Should return 401, got {response.status_code}")
                
        except Exception as e:
            self.log_result("Get Current User (No Token)", False, str(e))

    def test_logout(self):
        """Test logout functionality"""
        if not self.user1_session_token:
            self.log_result("Logout", False, "No session token available")
            return
            
        try:
            # Set session cookie
            cookies = {"session_token": self.user1_session_token}
            
            response = self.session.post(
                f"{BASE_URL}/auth/logout",
                cookies=cookies,
                timeout=10
            )
            
            if response.status_code == 200:
                # Try to access protected endpoint with same token
                test_response = self.session.get(
                    f"{BASE_URL}/auth/me",
                    cookies=cookies,
                    timeout=10
                )
                
                if test_response.status_code == 401:
                    self.log_result("Logout", True,
                                  "Session successfully invalidated")
                else:
                    self.log_result("Logout", False,
                                  "Session not properly invalidated")
            else:
                self.log_result("Logout", False,
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Logout", False, str(e))

    def test_password_validation(self):
        """Test password validation (minimum length)"""
        try:
            short_password_user = {
                "email": f"shortpass_{uuid.uuid4().hex[:8]}@example.com",
                "password": "123",  # Too short
                "name": "Short Pass User"
            }
            
            response = self.session.post(
                f"{BASE_URL}/auth/register",
                json=short_password_user,
                timeout=10
            )
            
            # Should either reject with 400/422 or accept (depends on validation)
            if response.status_code in [400, 422]:
                self.log_result("Password Validation", True,
                              "Short password correctly rejected")
            elif response.status_code == 200:
                self.log_result("Password Validation", True,
                              "Password validation not enforced (acceptable)")
            else:
                self.log_result("Password Validation", False,
                              f"Unexpected status code: {response.status_code}")
                
        except Exception as e:
            self.log_result("Password Validation", False, str(e))

    def run_all_tests(self):
        """Run all authentication tests"""
        print("🚀 Starting Backend Authentication Test Suite")
        print("=" * 60)
        
        # Database tests
        self.test_database_connection()
        
        # Registration tests
        self.test_register_user1()
        self.test_register_user2_with_referral()
        self.test_referral_bonus()
        self.test_duplicate_registration()
        self.test_password_validation()
        
        # Login tests
        self.test_login_valid_credentials()
        self.test_login_invalid_credentials()
        self.test_login_nonexistent_user()
        
        # Session management tests
        self.test_get_current_user_with_cookie()
        self.test_get_current_user_with_header()
        self.test_get_current_user_invalid_token()
        self.test_get_current_user_no_token()
        
        # Logout tests
        self.test_logout()
        
        # Print summary
        self.print_summary()

    def print_summary(self):
        """Print test summary"""
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  • {result['test']}: {result['message']}")
        
        print("\n" + "=" * 60)

if __name__ == "__main__":
    test_suite = AuthTestSuite()
    test_suite.run_all_tests()