import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "../../api";
import { jwtDecode } from "jwt-decode";
// Define types
export type Category = {
  id: number;
  name: string;
};

export type User = {
  id: string;
  username: string;
  full_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  avatar: string;
  shipping_address_data: any | null;
};

export type Testimonials = {
  id: string;
  user: User;
  position: string;
  rating: number;
  comment: string;
};
export type Product = {
  id: string;
  title: string;
  description: string;
  image: string;
  brand: string;
  category: Category;
  rating: number;
  numReviews: number;
  countInStock: number;
  new_price: string;
  old_price: string | null;
  specs: Record<string, any>;
  best_seller: boolean;
  flash_sale: boolean;
  flash_sale_price: string | null;
  flash_sale_end: string | null;
  Date_added: string;
};

type CartItem = {
  product: Product;
  quantity: number;
  customization?: string;
};
type OrderItem = {
  order: string;
  product: string;
  quantity: number;
  price: number;
};
type Order = {
  user: User;
  orderId: string;
  paymentmethod: string;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  status: string;
  isDelivered: string;
  deliveredAt: string;
  paidAt: string;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: any | null;
};

type UserInfo = {
  email: string;
  userId: string;
  role: string;
};

// type PaginatedResponse = {
//   total_items: number;
//   total_pages: number;
//   current_page: number;
//   next: string | null;
//   previous: string | null;
//   data: Product[];
// };

type StoreContextType = {
  products: Product[];
  featuredProducts: Product[];
  cartItems: CartItem[];
  loading: boolean;
  error: string | null;
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  testimonials: Testimonials[];
  orders: Order[];
  fetchProducts: (query?: string, page?: number) => Promise<void>;
  addToCart: (
    product: Product,
    quantity: number,
    customization?: string
  ) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (categoryName: string) => Product[];
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  userInfo: UserInfo | null;
};

// Create context
const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Context provider component
export const StoreProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonials[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    hasNext: false,
    hasPrevious: false,
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchOrders();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/api/token", {
          withCredentials: true,
        });
        const decoded = jwtDecode<any>(res.data.access);
        setIsLoggedIn(true);
        setUserInfo({
          email: decoded.email,
          userId: decoded.user_id,
          role: decoded.is_admin ? "admin" : "user",
        });
      } catch {
        setIsLoggedIn(false);
        setUserInfo(null);
      }
    };
    checkAuth();
  }, []);
  const login = async (email: string, password: string) => {
    const res = await api.post(
      "/api/token/",
      { email, password },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        withCredentials: true,
      }
    );
    const decoded = jwtDecode<any>(res.data.access);
    const user = {
      email,
      role: decoded.is_admin ? "admin" : "user",
      userId: decoded.user_id,
    };
    setIsLoggedIn(true);
    setUserInfo(user);
  };

  const logout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setIsLoggedIn(false);
    setUserInfo(null);
  };

  const fetchProducts = async (query: string = "", page: number = 1) => {
    setLoading(true);
    api
      .get(`/api/products/?query=${query}&page=${page}`)
      .then((res) => res.data)
      .then((data) => {
        setProducts(data.data);

        const bestSellers = data.data.filter(
          (product: Product) => product.best_seller
        );
        if (bestSellers.length > 0) {
          setFeaturedProducts(bestSellers);
        }
        setPagination({
          totalItems: data.total_items,
          totalPages: data.total_pages,
          currentPage: data.current_page,
          hasNext: !!data.next,
          hasPrevious: !!data.previous,
        });
        setLoading(false);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "An error occurred")
      );
  };
  const fetchCategories = async () => {
    api
      .get("/api/categories/")
      .then((res) => res.data)
      .then((data) => {
        setCategory(data);
      });
  };

  const fetchOrders = async () => {
    api
      .get("/api/orders/")
      .then((res) => res.data)
      .then((data) => {
        setOrders(data);
      })
      .catch((error) => {
        setError(
          error instanceof Error
            ? error.message
            : "An error occurred while fetching orders"
        );
      });
  };

  const fetchTestimonials = async () => {
    api
      .get("/api/testimonials/")
      .then((res) => res.data)
      .then((data) => {
        setTestimonials(data);
      });
  };

  // Cart functions
  const addToCart = (
    product: Product,
    quantity: number,
    customization?: string
  ) => {
    setCartItems((prevItems) => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(
        (item) => item.product.id === product.id
      );

      if (existingItemIndex !== -1) {
        // Update existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
          customization:
            customization || updatedItems[existingItemIndex].customization,
        };
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, { product, quantity, customization }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.product.id !== productId)
    );
  };

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Product utility functions
  const getProductById = (id: string) => {
    return products.find((product) => product.id === id);
  };

  const getProductsByCategory = (categoryName: string) => {
    return products.filter(
      (product) => product.category?.name === categoryName
    );
  };

  // Context value
  const value = {
    products,
    featuredProducts,
    cartItems,
    loading,
    error,
    pagination,
    category,
    fetchProducts,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getProductById,
    getProductsByCategory,
    isLoggedIn,
    login,
    logout,
    testimonials,
    orders,
    selectedOrder,
    setSelectedOrder,
    userInfo,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
};

// Custom hook to use the store context
export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
