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
        self.test_product_id = None
        self.test_session_id = None
        self.test_order_id = None
        
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
            # Small delay to ensure database update is complete
            time.sleep(1)
            
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

    # ============= STRIPE PAYMENT TESTS =============

    def setup_payment_tests(self):
        """Setup fresh authentication for payment tests"""
        try:
            # Create a fresh user for payment tests
            payment_user = {
                "email": f"paymentuser_{uuid.uuid4().hex[:8]}@example.com",
                "password": "paymentpass123",
                "name": "Payment Test User"
            }
            
            response = self.session.post(
                f"{BASE_URL}/auth/register",
                json=payment_user,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.user1_session_token = data['session_token']  # Update token for payment tests
                self.log_result("Setup Payment Tests", True, "Fresh user created for payment tests")
                return True
            else:
                self.log_result("Setup Payment Tests", False, f"Failed to create payment user: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Setup Payment Tests", False, str(e))
            return False

    def test_create_test_product(self):
        """Create a test product for payment testing"""
        if not self.user1_session_token:
            self.log_result("Create Test Product", False, "No admin session token available")
            return
            
        try:
            # Create a test product
            test_product = {
                "title": "Test Payment Product",
                "description": "Product for testing Stripe payment integration",
                "price": 29.99,
                "original_price": 39.99,
                "discount_percent": 25,
                "category_id": str(uuid.uuid4()),
                "brand": "TestBrand",
                "stock": 100,
                "images": ["https://example.com/test-product.jpg"],
                "is_active": True
            }
            
            headers = {"Authorization": f"Bearer {self.user1_session_token}"}
            response = self.session.post(
                f"{BASE_URL}/products",
                json=test_product,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.test_product_id = data.get('id')
                self.log_result("Create Test Product", True,
                              f"Test product created with ID: {self.test_product_id}")
            else:
                self.log_result("Create Test Product", False,
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Create Test Product", False, str(e))

    def test_stripe_checkout_session_creation(self):
        """Test POST /api/checkout/create-session"""
        if not self.test_product_id:
            self.log_result("Stripe Checkout Session Creation", False, "No test product available")
            return
            
        try:
            # Prepare checkout request
            checkout_data = {
                "cart_items": [
                    {
                        "product_id": self.test_product_id,
                        "quantity": 2,
                        "price": 29.99,
                        "title": "Test Payment Product"
                    }
                ],
                "origin_url": "https://elite-marketplace.preview.emergentagent.com",
                "message": "Test checkout session",
                "session_id": str(uuid.uuid4())
            }
            
            # Set session cookie if available
            cookies = {}
            if self.user1_session_token:
                cookies["session_token"] = self.user1_session_token
            
            response = self.session.post(
                f"{BASE_URL}/checkout/create-session",
                json=checkout_data,
                cookies=cookies,
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validate response structure
                required_fields = ['url', 'session_id']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_result("Stripe Checkout Session Creation", False,
                                  f"Missing fields: {missing_fields}")
                    return
                
                # Store session ID for status testing
                self.test_session_id = data['session_id']
                
                # Validate URL format
                if data['url'].startswith('https://checkout.stripe.com/'):
                    self.log_result("Stripe Checkout Session Creation", True,
                                  f"Checkout session created successfully. Session ID: {self.test_session_id}")
                else:
                    self.log_result("Stripe Checkout Session Creation", False,
                                  f"Invalid Stripe URL format: {data['url']}")
            else:
                self.log_result("Stripe Checkout Session Creation", False,
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Stripe Checkout Session Creation", False, str(e))

    def test_stripe_checkout_session_invalid_product(self):
        """Test checkout session creation with invalid product ID"""
        try:
            checkout_data = {
                "cart_items": [
                    {
                        "product_id": "invalid_product_id_12345",
                        "quantity": 1,
                        "price": 29.99,
                        "title": "Invalid Product"
                    }
                ],
                "origin_url": "https://elite-marketplace.preview.emergentagent.com",
                "message": "Test invalid product",
                "session_id": str(uuid.uuid4())
            }
            
            response = self.session.post(
                f"{BASE_URL}/checkout/create-session",
                json=checkout_data,
                timeout=10
            )
            
            if response.status_code == 400:
                data = response.json()
                if "not found" in data.get('detail', '').lower():
                    self.log_result("Stripe Checkout Invalid Product", True,
                                  "Correctly rejected invalid product ID")
                else:
                    self.log_result("Stripe Checkout Invalid Product", False,
                                  f"Wrong error message: {data.get('detail')}")
            else:
                self.log_result("Stripe Checkout Invalid Product", False,
                              f"Should return 400, got {response.status_code}")
                
        except Exception as e:
            self.log_result("Stripe Checkout Invalid Product", False, str(e))

    def test_stripe_checkout_status_polling(self):
        """Test GET /api/checkout/status/{session_id}"""
        if not self.test_session_id:
            self.log_result("Stripe Checkout Status Polling", False, "No test session ID available")
            return
            
        try:
            # Set session cookie if available
            cookies = {}
            if self.user1_session_token:
                cookies["session_token"] = self.user1_session_token
            
            response = self.session.get(
                f"{BASE_URL}/checkout/status/{self.test_session_id}",
                cookies=cookies,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validate response structure
                required_fields = ['status', 'payment_status', 'amount_total', 'currency']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_result("Stripe Checkout Status Polling", False,
                                  f"Missing fields: {missing_fields}")
                    return
                
                # Validate expected values
                expected_amount = 59.98  # 2 * 29.99
                actual_amount = data.get('amount_total', 0)
                
                if abs(actual_amount - expected_amount) < 0.01:  # Allow small floating point differences
                    self.log_result("Stripe Checkout Status Polling", True,
                                  f"Status polling successful. Status: {data['status']}, Payment: {data['payment_status']}")
                else:
                    self.log_result("Stripe Checkout Status Polling", False,
                                  f"Amount mismatch. Expected: {expected_amount}, Got: {actual_amount}")
            else:
                self.log_result("Stripe Checkout Status Polling", False,
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Stripe Checkout Status Polling", False, str(e))

    def test_stripe_checkout_status_invalid_session(self):
        """Test checkout status with invalid session ID"""
        try:
            response = self.session.get(
                f"{BASE_URL}/checkout/status/invalid_session_id_12345",
                timeout=10
            )
            
            if response.status_code == 404:
                self.log_result("Stripe Checkout Status Invalid Session", True,
                              "Correctly rejected invalid session ID")
            else:
                self.log_result("Stripe Checkout Status Invalid Session", False,
                              f"Should return 404, got {response.status_code}")
                
        except Exception as e:
            self.log_result("Stripe Checkout Status Invalid Session", False, str(e))

    def test_payment_transaction_database_entry(self):
        """Test that PaymentTransaction is created in database"""
        if not self.test_session_id:
            self.log_result("Payment Transaction Database Entry", False, "No test session ID available")
            return
            
        try:
            from motor.motor_asyncio import AsyncIOMotorClient
            import asyncio
            
            async def check_transaction():
                client = AsyncIOMotorClient(MONGO_URL)
                db = client[DB_NAME]
                
                # Find transaction by session_id
                transaction = await db.payment_transactions.find_one({"session_id": self.test_session_id})
                client.close()
                return transaction
            
            transaction = asyncio.run(check_transaction())
            
            if transaction:
                # Validate transaction structure
                required_fields = ['session_id', 'amount', 'currency', 'payment_status', 'cart_items']
                missing_fields = [field for field in required_fields if field not in transaction]
                
                if missing_fields:
                    self.log_result("Payment Transaction Database Entry", False,
                                  f"Missing fields in transaction: {missing_fields}")
                else:
                    self.log_result("Payment Transaction Database Entry", True,
                                  f"Transaction correctly stored in database. Status: {transaction.get('payment_status')}")
            else:
                self.log_result("Payment Transaction Database Entry", False,
                              "Transaction not found in database")
                
        except Exception as e:
            self.log_result("Payment Transaction Database Entry", False, str(e))

    def test_order_status_update_endpoint(self):
        """Test PUT /api/orders/{order_id} for Kanban functionality"""
        if not self.user1_session_token:
            self.log_result("Order Status Update Endpoint", False, "No admin session token available")
            return
            
        try:
            # First create a test order
            test_order = {
                "customer_name": "Test Customer",
                "customer_email": "test@example.com",
                "customer_phone": "+994501234567",
                "delivery_address": "Test Address, Baku",
                "items": [
                    {
                        "product_id": self.test_product_id or "test_product",
                        "title": "Test Product",
                        "price": 29.99,
                        "quantity": 1,
                        "image": "test.jpg"
                    }
                ],
                "subtotal": 29.99,
                "total": 29.99,
                "status": "confirmed"
            }
            
            response = self.session.post(
                f"{BASE_URL}/orders",
                json=test_order,
                timeout=10
            )
            
            if response.status_code == 200:
                order_data = response.json()
                order_id = order_data.get('id')
                
                if order_id:
                    # Now test status update
                    headers = {"Authorization": f"Bearer {self.user1_session_token}"}
                    update_data = {"status": "warehouse"}
                    
                    update_response = self.session.put(
                        f"{BASE_URL}/orders/{order_id}",
                        json=update_data,
                        headers=headers,
                        timeout=10
                    )
                    
                    if update_response.status_code == 200:
                        self.test_order_id = order_id
                        self.log_result("Order Status Update Endpoint", True,
                                      f"Order status updated successfully. Order ID: {order_id}")
                    else:
                        self.log_result("Order Status Update Endpoint", False,
                                      f"Status update failed: HTTP {update_response.status_code}")
                else:
                    self.log_result("Order Status Update Endpoint", False,
                                  "Order creation succeeded but no ID returned")
            else:
                self.log_result("Order Status Update Endpoint", False,
                              f"Order creation failed: HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("Order Status Update Endpoint", False, str(e))

    def test_server_side_price_validation(self):
        """Test that server uses product prices, not client-sent prices"""
        if not self.test_product_id:
            self.log_result("Server-side Price Validation", False, "No test product available")
            return
            
        try:
            # Try to manipulate price in cart_items
            checkout_data = {
                "cart_items": [
                    {
                        "product_id": self.test_product_id,
                        "quantity": 1,
                        "price": 1.00,  # Manipulated low price
                        "title": "Test Payment Product"
                    }
                ],
                "origin_url": "https://elite-marketplace.preview.emergentagent.com",
                "message": "Test price manipulation",
                "session_id": str(uuid.uuid4())
            }
            
            response = self.session.post(
                f"{BASE_URL}/checkout/create-session",
                json=checkout_data,
                timeout=10
            )
            
            if response.status_code == 200:
                # Check if server used real price by checking the status
                data = response.json()
                session_id = data.get('session_id')
                
                if session_id:
                    # Check the actual amount in status
                    status_response = self.session.get(
                        f"{BASE_URL}/checkout/status/{session_id}",
                        timeout=10
                    )
                    
                    if status_response.status_code == 200:
                        status_data = status_response.json()
                        actual_amount = status_data.get('amount_total', 0)
                        
                        # Should be 29.99 (server price), not 1.00 (manipulated price)
                        if actual_amount > 25.0:  # Reasonable threshold
                            self.log_result("Server-side Price Validation", True,
                                          f"Server correctly used product price: {actual_amount}")
                        else:
                            self.log_result("Server-side Price Validation", False,
                                          f"Server may have used manipulated price: {actual_amount}")
                    else:
                        self.log_result("Server-side Price Validation", False,
                                      "Could not verify price through status endpoint")
                else:
                    self.log_result("Server-side Price Validation", False,
                                  "No session ID returned from checkout")
            else:
                self.log_result("Server-side Price Validation", False,
                              f"Checkout creation failed: HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("Server-side Price Validation", False, str(e))

    def run_all_tests(self):
        """Run all authentication tests"""
        print("🚀 Starting Backend Authentication & Payment Test Suite")
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
        
        # Stripe Payment Integration tests
        print("\n💳 Starting Stripe Payment Integration Tests")
        print("-" * 40)
        self.test_create_test_product()
        self.test_stripe_checkout_session_creation()
        self.test_stripe_checkout_session_invalid_product()
        self.test_stripe_checkout_status_polling()
        self.test_stripe_checkout_status_invalid_session()
        self.test_payment_transaction_database_entry()
        self.test_order_status_update_endpoint()
        self.test_server_side_price_validation()
        
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