#!/usr/bin/env python3
"""
Profile and Authentication Features Test Suite
Tests the new profile endpoints and authentication protection
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

class ProfileTestSuite:
    def __init__(self):
        self.session = requests.Session()
        self.user_data = None
        self.session_token = None
        self.test_results = []
        self.test_product_id = None
        
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

    def setup_authenticated_user(self):
        """Create and authenticate a user for testing"""
        try:
            # Create user
            user_data = {
                "email": f"profiletest_{uuid.uuid4().hex[:8]}@example.com",
                "password": "profilepass123",
                "name": "Profile Test User"
            }
            
            response = self.session.post(
                f"{BASE_URL}/auth/register",
                json=user_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.user_data = data['user']
                self.session_token = data['session_token']
                self.log_result("Setup Authenticated User", True, 
                              f"User created: {self.user_data['email']}")
                return True
            else:
                self.log_result("Setup Authenticated User", False,
                              f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Setup Authenticated User", False, str(e))
            return False

    def test_get_user_profile_authenticated(self):
        """Test GET /api/user/profile with authenticated user"""
        try:
            headers = {"Authorization": f"Bearer {self.session_token}"}
            
            response = self.session.get(
                f"{BASE_URL}/user/profile",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validate response structure
                required_fields = ['id', 'email', 'name', 'saved_cards', 'role', 'referral_code', 'referral_bonus']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_result("GET /api/user/profile (Authenticated)", False,
                                  f"Missing fields: {missing_fields}")
                else:
                    # Validate data types
                    if isinstance(data.get('saved_cards'), list) and isinstance(data.get('referral_bonus'), (int, float)):
                        self.log_result("GET /api/user/profile (Authenticated)", True,
                                      f"Profile retrieved successfully for {data['email']}")
                    else:
                        self.log_result("GET /api/user/profile (Authenticated)", False,
                                      "Invalid data types in response")
            else:
                self.log_result("GET /api/user/profile (Authenticated)", False,
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("GET /api/user/profile (Authenticated)", False, str(e))

    def test_get_user_profile_unauthenticated(self):
        """Test GET /api/user/profile without authentication"""
        try:
            # Use fresh session to avoid cookie contamination
            fresh_session = requests.Session()
            response = fresh_session.get(
                f"{BASE_URL}/user/profile",
                timeout=10
            )
            
            if response.status_code == 401:
                self.log_result("GET /api/user/profile (Unauthenticated)", True,
                              "Correctly rejected unauthenticated request")
            else:
                self.log_result("GET /api/user/profile (Unauthenticated)", False,
                              f"Should return 401, got {response.status_code}")
                
        except Exception as e:
            self.log_result("GET /api/user/profile (Unauthenticated)", False, str(e))

    def test_update_user_profile(self):
        """Test PUT /api/user/profile"""
        try:
            headers = {"Authorization": f"Bearer {self.session_token}"}
            
            # Update profile data
            profile_update = {
                "name": "Updated Profile Test User",
                "phone": "+994501234567",
                "address": "123 Test Street, Apartment 4B",
                "city": "Baku",
                "postal_code": "AZ1000"
            }
            
            response = self.session.put(
                f"{BASE_URL}/user/profile",
                json=profile_update,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                # Verify the update by getting profile again
                get_response = self.session.get(
                    f"{BASE_URL}/user/profile",
                    headers=headers,
                    timeout=10
                )
                
                if get_response.status_code == 200:
                    data = get_response.json()
                    
                    # Check if fields were updated
                    updated_correctly = (
                        data.get('name') == profile_update['name'] and
                        data.get('phone') == profile_update['phone'] and
                        data.get('address') == profile_update['address'] and
                        data.get('city') == profile_update['city'] and
                        data.get('postal_code') == profile_update['postal_code']
                    )
                    
                    if updated_correctly:
                        self.log_result("PUT /api/user/profile", True,
                                      "Profile updated successfully and verified in database")
                    else:
                        self.log_result("PUT /api/user/profile", False,
                                      "Profile update not reflected in database")
                else:
                    self.log_result("PUT /api/user/profile", False,
                                  "Could not verify profile update")
            else:
                self.log_result("PUT /api/user/profile", False,
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("PUT /api/user/profile", False, str(e))

    def test_add_saved_card(self):
        """Test POST /api/user/cards"""
        try:
            headers = {"Authorization": f"Bearer {self.session_token}"}
            
            # Add first card
            card_data = {
                "last4": "4242",
                "brand": "visa",
                "exp_month": "12",
                "exp_year": "2025"
            }
            
            response = self.session.post(
                f"{BASE_URL}/user/cards",
                json=card_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                # Verify card was added by getting profile
                get_response = self.session.get(
                    f"{BASE_URL}/user/profile",
                    headers=headers,
                    timeout=10
                )
                
                if get_response.status_code == 200:
                    data = get_response.json()
                    saved_cards = data.get('saved_cards', [])
                    
                    # Check if card was added
                    card_found = any(card.get('last4') == '4242' for card in saved_cards)
                    
                    if card_found:
                        self.log_result("POST /api/user/cards", True,
                                      f"Card added successfully. Total cards: {len(saved_cards)}")
                    else:
                        self.log_result("POST /api/user/cards", False,
                                      "Card not found in saved_cards array")
                else:
                    self.log_result("POST /api/user/cards", False,
                                  "Could not verify card addition")
            else:
                self.log_result("POST /api/user/cards", False,
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("POST /api/user/cards", False, str(e))

    def test_add_second_saved_card(self):
        """Test adding a second card"""
        try:
            headers = {"Authorization": f"Bearer {self.session_token}"}
            
            # Add second card
            card_data = {
                "last4": "5555",
                "brand": "mastercard",
                "exp_month": "06",
                "exp_year": "2026"
            }
            
            response = self.session.post(
                f"{BASE_URL}/user/cards",
                json=card_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                self.log_result("POST /api/user/cards (Second Card)", True,
                              "Second card added successfully")
            else:
                self.log_result("POST /api/user/cards (Second Card)", False,
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("POST /api/user/cards (Second Card)", False, str(e))

    def test_delete_saved_card(self):
        """Test DELETE /api/user/cards/{last4}"""
        try:
            headers = {"Authorization": f"Bearer {self.session_token}"}
            
            # Delete the first card (4242)
            response = self.session.delete(
                f"{BASE_URL}/user/cards/4242",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                # Verify card was deleted by getting profile
                get_response = self.session.get(
                    f"{BASE_URL}/user/profile",
                    headers=headers,
                    timeout=10
                )
                
                if get_response.status_code == 200:
                    data = get_response.json()
                    saved_cards = data.get('saved_cards', [])
                    
                    # Check if card was removed
                    card_found = any(card.get('last4') == '4242' for card in saved_cards)
                    
                    if not card_found:
                        self.log_result("DELETE /api/user/cards/{last4}", True,
                                      f"Card deleted successfully. Remaining cards: {len(saved_cards)}")
                    else:
                        self.log_result("DELETE /api/user/cards/{last4}", False,
                                      "Card still found in saved_cards array")
                else:
                    self.log_result("DELETE /api/user/cards/{last4}", False,
                                  "Could not verify card deletion")
            else:
                self.log_result("DELETE /api/user/cards/{last4}", False,
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("DELETE /api/user/cards/{last4}", False, str(e))

    def test_get_user_orders_authenticated(self):
        """Test GET /api/user/orders with authenticated user"""
        try:
            headers = {"Authorization": f"Bearer {self.session_token}"}
            
            response = self.session.get(
                f"{BASE_URL}/user/orders",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Should return an array (even if empty)
                if isinstance(data, list):
                    self.log_result("GET /api/user/orders (Authenticated)", True,
                                  f"Orders retrieved successfully. Count: {len(data)}")
                else:
                    self.log_result("GET /api/user/orders (Authenticated)", False,
                                  "Response is not an array")
            else:
                self.log_result("GET /api/user/orders (Authenticated)", False,
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("GET /api/user/orders (Authenticated)", False, str(e))

    def test_get_user_orders_unauthenticated(self):
        """Test GET /api/user/orders without authentication"""
        try:
            # Use fresh session to avoid cookie contamination
            fresh_session = requests.Session()
            response = fresh_session.get(
                f"{BASE_URL}/user/orders",
                timeout=10
            )
            
            if response.status_code == 401:
                self.log_result("GET /api/user/orders (Unauthenticated)", True,
                              "Correctly rejected unauthenticated request")
            else:
                self.log_result("GET /api/user/orders (Unauthenticated)", False,
                              f"Should return 401, got {response.status_code}")
                
        except Exception as e:
            self.log_result("GET /api/user/orders (Unauthenticated)", False, str(e))

    def test_create_review_unauthenticated(self):
        """Test POST /api/reviews without authentication (should fail)"""
        try:
            # Use fresh session to avoid cookie contamination
            fresh_session = requests.Session()
            
            review_data = {
                "product_id": "test_product_id",
                "customer_name": "Anonymous User",
                "rating": 5,
                "comment": "Great product!"
            }
            
            response = fresh_session.post(
                f"{BASE_URL}/reviews",
                json=review_data,
                timeout=10
            )
            
            if response.status_code == 401:
                self.log_result("POST /api/reviews (Unauthenticated)", True,
                              "Correctly rejected unauthenticated review creation")
            else:
                self.log_result("POST /api/reviews (Unauthenticated)", False,
                              f"Should return 401, got {response.status_code}")
                
        except Exception as e:
            self.log_result("POST /api/reviews (Unauthenticated)", False, str(e))

    def test_create_review_authenticated(self):
        """Test POST /api/reviews with authentication (should succeed)"""
        try:
            headers = {"Authorization": f"Bearer {self.session_token}"}
            
            review_data = {
                "product_id": "test_product_id",
                "customer_name": "Authenticated User",
                "rating": 4,
                "comment": "Good product, would recommend!"
            }
            
            response = self.session.post(
                f"{BASE_URL}/reviews",
                json=review_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validate review structure
                required_fields = ['id', 'product_id', 'customer_name', 'rating', 'comment']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_result("POST /api/reviews (Authenticated)", False,
                                  f"Missing fields: {missing_fields}")
                else:
                    self.log_result("POST /api/reviews (Authenticated)", True,
                                  f"Review created successfully. ID: {data.get('id')}")
            else:
                self.log_result("POST /api/reviews (Authenticated)", False,
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("POST /api/reviews (Authenticated)", False, str(e))

    def run_profile_flow_test(self):
        """Run the complete profile flow test as specified in the review request"""
        print("🔄 Running Complete Profile Flow Test")
        print("-" * 50)
        
        try:
            # 1. Register/Login user (already done in setup)
            print("1. ✅ User registered and authenticated")
            
            # 2. Update profile with full data
            headers = {"Authorization": f"Bearer {self.session_token}"}
            profile_update = {
                "name": "Flow Test User",
                "phone": "+994501111111",
                "address": "Flow Test Address 123",
                "city": "Baku",
                "postal_code": "AZ1001"
            }
            
            response = self.session.put(
                f"{BASE_URL}/user/profile",
                json=profile_update,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                print("2. ✅ Profile updated with full data")
            else:
                print(f"2. ❌ Profile update failed: {response.status_code}")
                return
            
            # 3. Add 2 cards
            card1 = {"last4": "1111", "brand": "visa", "exp_month": "01", "exp_year": "2027"}
            card2 = {"last4": "2222", "brand": "mastercard", "exp_month": "02", "exp_year": "2028"}
            
            for i, card in enumerate([card1, card2], 1):
                response = self.session.post(
                    f"{BASE_URL}/user/cards",
                    json=card,
                    headers=headers,
                    timeout=10
                )
                if response.status_code == 200:
                    print(f"3.{i}. ✅ Card {card['last4']} added")
                else:
                    print(f"3.{i}. ❌ Card {card['last4']} failed: {response.status_code}")
            
            # 4. Delete 1 card
            response = self.session.delete(
                f"{BASE_URL}/user/cards/1111",
                headers=headers,
                timeout=10
            )
            if response.status_code == 200:
                print("4. ✅ Card 1111 deleted")
            else:
                print(f"4. ❌ Card deletion failed: {response.status_code}")
            
            # 5. Get profile (verify all data)
            response = self.session.get(
                f"{BASE_URL}/user/profile",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                cards_count = len(data.get('saved_cards', []))
                has_profile_data = all([
                    data.get('name') == profile_update['name'],
                    data.get('phone') == profile_update['phone'],
                    data.get('address') == profile_update['address'],
                    data.get('city') == profile_update['city'],
                    data.get('postal_code') == profile_update['postal_code']
                ])
                
                if has_profile_data and cards_count == 1:
                    print(f"5. ✅ Profile verified: all data correct, {cards_count} card remaining")
                else:
                    print(f"5. ❌ Profile verification failed: profile_ok={has_profile_data}, cards={cards_count}")
            else:
                print(f"5. ❌ Profile retrieval failed: {response.status_code}")
            
            # 6. Create order
            user_email = self.user_data['email']
            test_order = {
                "customer_name": "Flow Test User",
                "customer_email": user_email,
                "customer_phone": "+994501111111",
                "delivery_address": "Flow Test Address 123, Baku",
                "items": [{"product_id": "flow_test", "title": "Flow Test Product", "price": 25.99, "quantity": 1, "image": "test.jpg"}],
                "subtotal": 25.99,
                "total": 25.99,
                "status": "confirmed"
            }
            
            response = self.session.post(
                f"{BASE_URL}/orders",
                json=test_order,
                timeout=10
            )
            
            if response.status_code == 200:
                order_data = response.json()
                print(f"6. ✅ Order created: {order_data.get('id')}")
            else:
                print(f"6. ❌ Order creation failed: {response.status_code}")
            
            # 7. Get user orders (verify order appears)
            response = self.session.get(
                f"{BASE_URL}/user/orders",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                orders = response.json()
                user_orders = [o for o in orders if o.get('customer_email') == user_email]
                print(f"7. ✅ User orders retrieved: {len(user_orders)} orders found")
            else:
                print(f"7. ❌ User orders retrieval failed: {response.status_code}")
            
            # 8. Try to create review without auth (should fail)
            fresh_session = requests.Session()
            review_data = {"product_id": "flow_test", "customer_name": "Anonymous", "rating": 5, "comment": "Test"}
            
            response = fresh_session.post(
                f"{BASE_URL}/reviews",
                json=review_data,
                timeout=10
            )
            
            if response.status_code == 401:
                print("8. ✅ Review creation without auth correctly rejected")
            else:
                print(f"8. ❌ Review creation without auth should fail: {response.status_code}")
            
            # 9. Create review with auth (should succeed)
            review_data = {"product_id": "flow_test", "customer_name": "Flow Test User", "rating": 4, "comment": "Great flow test!"}
            
            response = self.session.post(
                f"{BASE_URL}/reviews",
                json=review_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                review_data = response.json()
                print(f"9. ✅ Review created with auth: {review_data.get('id')}")
            else:
                print(f"9. ❌ Review creation with auth failed: {response.status_code}")
            
            print("\n🎉 Complete Profile Flow Test Completed!")
            
        except Exception as e:
            print(f"❌ Flow test error: {e}")

    def run_all_tests(self):
        """Run all profile tests"""
        print("👤 Starting Profile & Authentication Features Test Suite")
        print("=" * 60)
        
        # Setup
        if not self.setup_authenticated_user():
            print("❌ Cannot proceed without authenticated user")
            return
        
        # Individual endpoint tests
        print("\n🔧 Individual Endpoint Tests")
        print("-" * 30)
        self.test_get_user_profile_authenticated()
        self.test_get_user_profile_unauthenticated()
        self.test_update_user_profile()
        self.test_add_saved_card()
        self.test_add_second_saved_card()
        self.test_delete_saved_card()
        self.test_get_user_orders_authenticated()
        self.test_get_user_orders_unauthenticated()
        self.test_create_review_unauthenticated()
        self.test_create_review_authenticated()
        
        # Complete flow test
        print("\n" + "=" * 60)
        self.run_profile_flow_test()
        
        # Print summary
        self.print_summary()

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 PROFILE FEATURES TEST SUMMARY")
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
    test_suite = ProfileTestSuite()
    test_suite.run_all_tests()