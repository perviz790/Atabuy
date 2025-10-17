#!/usr/bin/env python3
"""
Debug admin authentication
"""

import requests
import json

BASE_URL = "https://ecommerce-elite.preview.emergentagent.com/api"

def test_admin_auth():
    session = requests.Session()
    
    # Test admin login
    admin_credentials = {
        "email": "nextstationmme@gmail.com",
        "password": "4677362ee"
    }
    
    print("Testing admin login...")
    response = session.post(f"{BASE_URL}/auth/login", json=admin_credentials, timeout=10)
    print(f"Login response: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Login data: {json.dumps(data, indent=2)}")
        
        session_token = data.get('session_token')
        print(f"Session token: {session_token}")
        
        # Test /auth/me with the session token
        print("\nTesting /auth/me...")
        headers = {"Authorization": f"Bearer {session_token}"}
        me_response = session.get(f"{BASE_URL}/auth/me", headers=headers, timeout=10)
        print(f"Me response: {me_response.status_code}")
        
        if me_response.status_code == 200:
            me_data = me_response.json()
            print(f"Me data: {json.dumps(me_data, indent=2)}")
        else:
            print(f"Me error: {me_response.text}")
    else:
        print(f"Login error: {response.text}")

if __name__ == "__main__":
    test_admin_auth()