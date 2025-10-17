from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import List, Optional, Dict, Any
import uuid
import random
import string
import httpx

def generate_short_id():
    """Generate 8 character order ID (letters + numbers)"""
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choices(chars, k=8))
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# JWT settings
SECRET_KEY = os.environ.get('JWT_SECRET', 'atabuy_secret_key_2025')
ALGORITHM = "HS256"

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============= MODELS =============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    email: str
    password_hash: Optional[str] = None  # None for Google OAuth users
    name: str  # Changed from full_name to name for Emergent Auth compatibility
    picture: Optional[str] = None
    role: str = "user"  # user, admin
    referral_code: Optional[str] = Field(default_factory=lambda: ''.join(random.choices(string.ascii_uppercase + string.digits, k=8)))
    referred_by: Optional[str] = None
    referral_bonus: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    email: str
    password: str
    name: str
    referral_code: Optional[str] = None

class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    name_az: str
    description: Optional[str] = None
    icon: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    price: float
    original_price: Optional[float] = None
    discount_percent: Optional[int] = 0
    category_id: str
    brand: Optional[str] = None
    size: Optional[str] = None
    color: Optional[str] = None
    stock: int = 0
    images: List[str] = []
    is_active: bool = True
    rating: float = 0.0
    review_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Coupon(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    discount_percent: int
    discount_amount: Optional[float] = 0
    min_purchase: float = 0
    max_discount: Optional[float] = None
    is_active: bool = True
    expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=generate_short_id)
    tracking_number: Optional[str] = None
    customer_name: str
    customer_email: str
    customer_phone: str
    delivery_address: str
    items: List[Dict[str, Any]] = []
    subtotal: float
    discount: float = 0
    coupon_code: Optional[str] = None
    total: float
    status: str = "confirmed"  # confirmed, warehouse, airplane, atabuy_warehouse, delivered, cancelled
    status_history: List[Dict[str, Any]] = []
    payment_status: str = "pending"  # pending, paid, failed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    warehouse_date: Optional[datetime] = None
    airplane_date: Optional[datetime] = None
    atabuy_date: Optional[datetime] = None
    delivery_date: Optional[datetime] = None

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    customer_name: str
    rating: int  # 1-5
    comment: str
    is_approved: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    message: str
    type: str = "info"  # info, success, warning, promotion
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    role: str  # user, assistant
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatRequest(BaseModel):
    message: str
    session_id: str

# ============= AUTH HELPERS =============

async def get_current_user_from_token(session_token: str) -> Optional[Dict]:
    """Get user from session token (from cookie or Authorization header)"""
    try:
        # Find session
        session = await db.user_sessions.find_one({"session_token": session_token})
        if not session:
            return None
        
        # Check if expired
        expires_at = session.get('expires_at')
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        
        if expires_at < datetime.now(timezone.utc):
            # Delete expired session
            await db.user_sessions.delete_one({"session_token": session_token})
            return None
        
        # Find user
        user = await db.users.find_one({"id": session["user_id"]})
        if not user:
            return None
        
        # Convert _id to id for response
        if "_id" in user:
            user["id"] = user.pop("_id")
        
        return user
    except Exception as e:
        logging.error(f"Error in get_current_user_from_token: {e}")
        return None

async def get_current_user(request: Request, response: Response):
    """Get current user from cookie or Authorization header"""
    # Try cookie first
    session_token = request.cookies.get("session_token")
    
    # Try Authorization header if no cookie
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.replace("Bearer ", "")
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = await get_current_user_from_token(session_token)
    if not user:
        # Clear invalid cookie
        response.delete_cookie("session_token")
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    return user

async def get_optional_user(request: Request) -> Optional[Dict]:
    """Get current user if authenticated, else return None"""
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.replace("Bearer ", "")
    
    if not session_token:
        return None
    
    return await get_current_user_from_token(session_token)

# ============= AUTH ROUTES =============

# Email/Password Registration
@api_router.post("/auth/register")
async def register(user_data: UserRegister, response: Response):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user = User(
        id=user_id,
        email=user_data.email,
        password_hash=pwd_context.hash(user_data.password),
        name=user_data.name,
        referred_by=user_data.referral_code
    )
    
    # Check if referral code is valid and add bonus
    if user_data.referral_code:
        referrer = await db.users.find_one({"referral_code": user_data.referral_code})
        if referrer:
            # Add 10 AZN bonus to referrer
            await db.users.update_one(
                {"id": referrer.get("id") or referrer.get("_id")},
                {"$inc": {"referral_bonus": 10.0}}
            )
    
    doc = user.model_dump(by_alias=True)
    if 'created_at' in doc:
        doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    
    # Create session
    session_token = str(uuid.uuid4())
    session = UserSession(
        id=str(uuid.uuid4()),
        user_id=user_id,
        session_token=session_token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7)
    )
    session_doc = session.model_dump(by_alias=True)
    session_doc['expires_at'] = session_doc['expires_at'].isoformat()
    session_doc['created_at'] = session_doc['created_at'].isoformat()
    await db.user_sessions.insert_one(session_doc)
    
    # Set httpOnly cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,
        path="/"
    )
    
    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "picture": user.picture,
            "referral_code": user.referral_code
        },
        "session_token": session_token
    }

# Email/Password Login
@api_router.post("/auth/login")
async def login(credentials: UserLogin, response: Response):
    user = await db.users.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.get('password_hash'):
        raise HTTPException(status_code=401, detail="This account uses Google login")
    
    if not pwd_context.verify(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_id = user.get("id") or user.get("_id")
    
    # Create session
    session_token = str(uuid.uuid4())
    session = UserSession(
        id=str(uuid.uuid4()),
        user_id=user_id,
        session_token=session_token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7)
    )
    session_doc = session.model_dump(by_alias=True)
    session_doc['expires_at'] = session_doc['expires_at'].isoformat()
    session_doc['created_at'] = session_doc['created_at'].isoformat()
    await db.user_sessions.insert_one(session_doc)
    
    # Set httpOnly cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,
        path="/"
    )
    
    return {
        "user": {
            "id": user_id,
            "email": user['email'],
            "name": user.get('name', user.get('full_name', '')),
            "picture": user.get('picture'),
            "referral_code": user.get('referral_code')
        },
        "session_token": session_token
    }

# Emergent Auth - Process session_id
@api_router.post("/auth/session")
async def process_session_id(request: Request, response: Response):
    """Process session_id from Emergent Auth and create user session"""
    try:
        # Get session_id from header
        session_id = request.headers.get("X-Session-ID")
        if not session_id:
            raise HTTPException(status_code=400, detail="session_id required")
        
        # Call Emergent API to get user data
        async with httpx.AsyncClient() as client:
            emergent_response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id},
                timeout=10.0
            )
            
            if emergent_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session_id")
            
            user_data = emergent_response.json()
        
        # Check if user exists
        existing_user = await db.users.find_one({"email": user_data["email"]})
        
        if existing_user:
            user_id = existing_user.get("id") or existing_user.get("_id")
        else:
            # Create new user
            user_id = str(uuid.uuid4())
            new_user = User(
                id=user_id,
                email=user_data["email"],
                name=user_data.get("name", ""),
                picture=user_data.get("picture"),
                password_hash=None  # OAuth user
            )
            doc = new_user.model_dump(by_alias=True)
            if 'created_at' in doc:
                doc['created_at'] = doc['created_at'].isoformat()
            await db.users.insert_one(doc)
        
        # Use session_token from Emergent
        session_token = user_data["session_token"]
        
        # Store session in our database
        session = UserSession(
            id=str(uuid.uuid4()),
            user_id=user_id,
            session_token=session_token,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7)
        )
        session_doc = session.model_dump(by_alias=True)
        session_doc['expires_at'] = session_doc['expires_at'].isoformat()
        session_doc['created_at'] = session_doc['created_at'].isoformat()
        await db.user_sessions.insert_one(session_doc)
        
        # Set httpOnly cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            max_age=7 * 24 * 60 * 60,
            path="/"
        )
        
        return {
            "user": {
                "id": user_id,
                "email": user_data["email"],
                "name": user_data.get("name", ""),
                "picture": user_data.get("picture")
            },
            "session_token": session_token
        }
    
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Emergent Auth timeout")
    except Exception as e:
        logging.error(f"Error processing session_id: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get current user
@api_router.get("/auth/me")
async def get_me(request: Request, response: Response):
    user = await get_current_user(request, response)
    user_id = user.get("id") or user.get("_id")
    return {
        "id": user_id,
        "email": user['email'],
        "name": user.get('name', user.get('full_name', '')),
        "picture": user.get('picture'),
        "role": user.get('role', 'user'),
        "referral_code": user.get('referral_code'),
        "referral_bonus": user.get('referral_bonus', 0.0)
    }

# Logout
@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        # Delete session from database
        await db.user_sessions.delete_one({"session_token": session_token})
    
    # Clear cookie
    response.delete_cookie("session_token", path="/")
    return {"message": "Logged out successfully"}

# ============= CATEGORY ROUTES =============

@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = await db.categories.find({"is_active": True}, {"_id": 0}).to_list(100)
    for cat in categories:
        if isinstance(cat.get('created_at'), str):
            cat['created_at'] = datetime.fromisoformat(cat['created_at'])
    return categories

@api_router.post("/categories", response_model=Category)
async def create_category(category: Category, request: Request, response: Response):
    await get_current_user(request, response)  # Check authentication
    doc = category.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.categories.insert_one(doc)
    return category

@api_router.put("/categories/{category_id}")
async def update_category(category_id: str, updates: dict, request: Request, response: Response):
    await get_current_user(request, response)  # Check authentication
    await db.categories.update_one({"id": category_id}, {"$set": updates})
    return {"message": "Category updated"}

@api_router.delete("/categories/{category_id}")
async def delete_category(category_id: str, request: Request, response: Response):
    await get_current_user(request, response)  # Check authentication
    await db.categories.delete_one({"id": category_id})
    return {"message": "Category deleted"}

# ============= PRODUCT ROUTES =============

@api_router.get("/products", response_model=List[Product])
async def get_products(
    category_id: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    brand: Optional[str] = None,
    search: Optional[str] = None
):
    query = {"is_active": True}
    if category_id:
        query["category_id"] = category_id
    if min_price is not None:
        query["price"] = {"$gte": min_price}
    if max_price is not None:
        if "price" in query:
            query["price"]["$lte"] = max_price
        else:
            query["price"] = {"$lte": max_price}
    if brand:
        query["brand"] = brand
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    for prod in products:
        if isinstance(prod.get('created_at'), str):
            prod['created_at'] = datetime.fromisoformat(prod['created_at'])
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    return product

@api_router.post("/products", response_model=Product)
async def create_product(product: Product, request: Request, response: Response):
    await get_current_user(request, response)  # Check authentication
    doc = product.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.products.insert_one(doc)
    return product

@api_router.put("/products/{product_id}")
async def update_product(product_id: str, updates: dict, request: Request, response: Response):
    await get_current_user(request, response)  # Check authentication
    await db.products.update_one({"id": product_id}, {"$set": updates})
    return {"message": "Product updated"}

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, request: Request, response: Response):
    await get_current_user(request, response)  # Check authentication
    await db.products.delete_one({"id": product_id})
    return {"message": "Product deleted"}

# ============= COUPON ROUTES =============

@api_router.get("/coupons")
async def get_coupons(request: Request, response: Response):
    await get_current_user(request, response)  # Check authentication
    coupons = await db.coupons.find({}, {"_id": 0}).to_list(100)
    for coupon in coupons:
        if isinstance(coupon.get('created_at'), str):
            coupon['created_at'] = datetime.fromisoformat(coupon['created_at'])
        if coupon.get('expires_at') and isinstance(coupon['expires_at'], str):
            coupon['expires_at'] = datetime.fromisoformat(coupon['expires_at'])
    return coupons

@api_router.post("/coupons/validate")
async def validate_coupon(code: str, subtotal: float):
    coupon = await db.coupons.find_one({"code": code, "is_active": True}, {"_id": 0})
    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid coupon code")
    
    if coupon.get('expires_at'):
        expires = datetime.fromisoformat(coupon['expires_at']) if isinstance(coupon['expires_at'], str) else coupon['expires_at']
        if expires < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Coupon expired")
    
    if subtotal < coupon.get('min_purchase', 0):
        raise HTTPException(status_code=400, detail=f"Minimum purchase {coupon['min_purchase']} required")
    
    discount = 0
    if coupon.get('discount_percent'):
        discount = subtotal * (coupon['discount_percent'] / 100)
    elif coupon.get('discount_amount'):
        discount = coupon['discount_amount']
    
    if coupon.get('max_discount') and discount > coupon['max_discount']:
        discount = coupon['max_discount']
    
    return {"discount": discount, "coupon": coupon}

@api_router.post("/coupons", response_model=Coupon)
async def create_coupon(coupon: Coupon, request: Request, response: Response):
    await get_current_user(request, response)  # Check authentication
    doc = coupon.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc.get('expires_at'):
        doc['expires_at'] = doc['expires_at'].isoformat()
    await db.coupons.insert_one(doc)
    return coupon

@api_router.delete("/coupons/{coupon_id}")
async def delete_coupon(coupon_id: str, request: Request, response: Response):
    await get_current_user(request, response)  # Check authentication
    await db.coupons.delete_one({"id": coupon_id})
    return {"message": "Coupon deleted"}

# ============= ORDER ROUTES =============

@api_router.post("/orders", response_model=Order)
async def create_order(order: Order):
    from datetime import timedelta
    
    doc = order.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    doc['tracking_number'] = f"ATB{generate_short_id()}"
    doc['status'] = 'confirmed'
    
    # Calculate real-time dates
    now = datetime.now(timezone.utc)
    warehouse_date = now + timedelta(days=7)
    airplane_date = warehouse_date + timedelta(days=5)
    atabuy_date = airplane_date + timedelta(days=4)
    delivery_date = atabuy_date + timedelta(days=4)
    
    doc['warehouse_date'] = warehouse_date.isoformat()
    doc['airplane_date'] = airplane_date.isoformat()
    doc['atabuy_date'] = atabuy_date.isoformat()
    doc['delivery_date'] = delivery_date.isoformat()
    
    # Status history
    doc['status_history'] = [
        {
            'status': 'confirmed',
            'date': now.isoformat(),
            'message': 'Sifarişiniz təsdiqləndi'
        },
        {
            'status': 'warehouse',
            'date': warehouse_date.isoformat(),
            'message': 'Anbardan çıxdı'
        },
        {
            'status': 'airplane',
            'date': airplane_date.isoformat(),
            'message': 'Təyyarəyə verildi'
        },
        {
            'status': 'atabuy_warehouse',
            'date': atabuy_date.isoformat(),
            'message': 'AtaBuy anbarına gətirildi'
        },
        {
            'status': 'delivered',
            'date': delivery_date.isoformat(),
            'message': 'Ünvana çatdırıldı'
        }
    ]
    
    await db.orders.insert_one(doc)
    
    # Update stock
    for item in order.items:
        await db.products.update_one(
            {"id": item['product_id']},
            {"$inc": {"stock": -item['quantity']}}
        )
    
    return order

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if isinstance(order.get('created_at'), str):
        order['created_at'] = datetime.fromisoformat(order['created_at'])
    if isinstance(order.get('updated_at'), str):
        order['updated_at'] = datetime.fromisoformat(order['updated_at'])
    return order

@api_router.get("/orders")
async def get_orders(current_user: dict = Depends(get_current_user)):
    orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    for order in orders:
        if isinstance(order.get('created_at'), str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
        if isinstance(order.get('updated_at'), str):
            order['updated_at'] = datetime.fromisoformat(order['updated_at'])
    return orders

@api_router.put("/orders/{order_id}")
async def update_order(order_id: str, updates: dict, current_user: dict = Depends(get_current_user)):
    updates['updated_at'] = datetime.now(timezone.utc).isoformat()
    await db.orders.update_one({"id": order_id}, {"$set": updates})
    return {"message": "Order updated"}

# ============= REVIEW ROUTES =============

@api_router.get("/reviews/{product_id}")
async def get_reviews(product_id: str):
    reviews = await db.reviews.find({"product_id": product_id, "is_approved": True}, {"_id": 0}).to_list(100)
    for review in reviews:
        if isinstance(review.get('created_at'), str):
            review['created_at'] = datetime.fromisoformat(review['created_at'])
    return reviews

@api_router.post("/reviews", response_model=Review)
async def create_review(review: Review, current_user: dict = Depends(get_current_user)):
    doc = review.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.reviews.insert_one(doc)
    
    # Update product rating
    reviews = await db.reviews.find({"product_id": review.product_id, "is_approved": True}).to_list(1000)
    if reviews:
        avg_rating = sum(r.get('rating', 0) for r in reviews) / len(reviews)
        await db.products.update_one(
            {"id": review.product_id},
            {"$set": {"rating": round(avg_rating, 1), "review_count": len(reviews)}}
        )
    
    return review

@api_router.put("/reviews/{review_id}")
async def update_review(review_id: str, updates: dict, current_user: dict = Depends(get_current_user)):
    await db.reviews.update_one({"id": review_id}, {"$set": updates})
    return {"message": "Review updated"}

@api_router.delete("/reviews/{review_id}")
async def delete_review(review_id: str, current_user: dict = Depends(get_current_user)):
    await db.reviews.delete_one({"id": review_id})
    return {"message": "Review deleted"}

# ============= NOTIFICATION ROUTES =============

@api_router.get("/notifications")
async def get_notifications():
    notifications = await db.notifications.find({"is_active": True}, {"_id": 0}).to_list(10)
    for notif in notifications:
        if isinstance(notif.get('created_at'), str):
            notif['created_at'] = datetime.fromisoformat(notif['created_at'])
    return notifications

@api_router.post("/notifications", response_model=Notification)
async def create_notification(notification: Notification, current_user: dict = Depends(get_current_user)):
    doc = notification.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.notifications.insert_one(doc)
    return notification

@api_router.delete("/notifications/{notification_id}")
async def delete_notification(notification_id: str, current_user: dict = Depends(get_current_user)):
    await db.notifications.delete_one({"id": notification_id})
    return {"message": "Notification deleted"}

# ============= AI CHAT ROUTES =============

@api_router.post("/chat")
async def chat(request: ChatRequest):
    try:
        # Save user message
        user_msg = ChatMessage(
            session_id=request.session_id,
            role="user",
            content=request.message
        )
        user_doc = user_msg.model_dump()
        user_doc['created_at'] = user_doc['created_at'].isoformat()
        await db.chat_messages.insert_one(user_doc)
        
        # Get chat history
        history = await db.chat_messages.find(
            {"session_id": request.session_id},
            {"_id": 0}
        ).sort("created_at", 1).to_list(50)
        
        # Initialize AI chat
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        chat_bot = LlmChat(
            api_key=api_key,
            session_id=request.session_id,
            system_message="Sən Atabuy onlayn mağazasının AI köməkçisisən. Müştərilərə mehriban və peşəkar şəkildə kömək et. Məhsullar, sifarişlər, çatdırılma və ödəniş haqqında sualları cavablandır. Azərbaycan dilində danış."
        ).with_model("openai", "gpt-4o")
        
        # Send message
        ai_message = UserMessage(text=request.message)
        response = await chat_bot.send_message(ai_message)
        
        # Save AI response
        ai_msg = ChatMessage(
            session_id=request.session_id,
            role="assistant",
            content=response
        )
        ai_doc = ai_msg.model_dump()
        ai_doc['created_at'] = ai_doc['created_at'].isoformat()
        await db.chat_messages.insert_one(ai_doc)
        
        return {"response": response}
    except Exception as e:
        logging.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/chat/history/{session_id}")
async def get_chat_history(session_id: str):
    messages = await db.chat_messages.find(
        {"session_id": session_id},
        {"_id": 0}
    ).sort("created_at", 1).to_list(100)
    for msg in messages:
        if isinstance(msg.get('created_at'), str):
            msg['created_at'] = datetime.fromisoformat(msg['created_at'])
    return messages

# ============= ADMIN STATS =============

@api_router.get("/admin/stats")
async def get_admin_stats(current_user: dict = Depends(get_current_user)):
    total_products = await db.products.count_documents({"is_active": True})
    total_orders = await db.orders.count_documents({})
    total_revenue = 0
    
    orders = await db.orders.find({"payment_status": "paid"}).to_list(10000)
    for order in orders:
        total_revenue += order.get('total', 0)
    
    pending_orders = await db.orders.count_documents({"status": "pending"})
    
    # Top products
    top_products = await db.products.find(
        {"is_active": True},
        {"_id": 0, "title": 1, "price": 1, "stock": 1, "rating": 1}
    ).sort("rating", -1).limit(5).to_list(5)
    
    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "total_revenue": round(total_revenue, 2),
        "pending_orders": pending_orders,
        "top_products": top_products
    }

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()