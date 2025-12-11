import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import { differenceInDays } from "date-fns";

export async function registerRoutes(server: Server, app: Express): Promise<void> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName, phone, address, pincode } = req.body;
      const user = await storage.updateUser(userId, {
        firstName,
        lastName,
        phone,
        address,
        pincode,
      });
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category, search } = req.query;
      const products = await storage.getProducts({
        categorySlug: category as string,
        search: search as string,
        isActive: true,
      });
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });

  app.get("/api/products/:slug", async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.get("/api/products/:id/blackout-dates", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const blackoutDates = await storage.getBlackoutDates(productId);
      res.json(blackoutDates);
    } catch (error) {
      console.error("Error fetching blackout dates:", error);
      res.status(500).json({ message: "Failed to fetch blackout dates" });
    }
  });

  // Cart routes
  app.get("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartItems = await storage.getCartItems(userId);
      
      // Populate with product details
      const itemsWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProductById(item.productId);
          return { ...item, product };
        })
      );
      
      res.json(itemsWithProducts);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { productId, size, color, startDate, endDate } = req.body;
      
      const cartItem = await storage.addToCart({
        userId,
        productId,
        size,
        color,
        startDate,
        endDate,
      });
      
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.delete("/api/cart/:id", isAuthenticated, async (req: any, res) => {
    try {
      const cartItemId = parseInt(req.params.id);
      await storage.removeFromCart(cartItemId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  // Booking routes
  app.get("/api/bookings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookings = await storage.getBookings(userId);
      
      // Populate with product details
      const bookingsWithProducts = await Promise.all(
        bookings.map(async (booking) => {
          const product = await storage.getProductById(booking.productId);
          return { ...booking, product };
        })
      );
      
      res.json(bookingsWithProducts);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/recent", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookings = await storage.getRecentBookings(userId, 5);
      
      // Populate with product details
      const bookingsWithProducts = await Promise.all(
        bookings.map(async (booking) => {
          const product = await storage.getProductById(booking.productId);
          return { ...booking, product };
        })
      );
      
      res.json(bookingsWithProducts);
    } catch (error) {
      console.error("Error fetching recent bookings:", error);
      res.status(500).json({ message: "Failed to fetch recent bookings" });
    }
  });

  app.post("/api/bookings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { phone, address, pincode, city, notes } = req.body;
      
      // Get cart items
      const cartItems = await storage.getCartItems(userId);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Update user delivery info
      await storage.updateUser(userId, { phone, address, pincode, city });

      // Create bookings for each cart item
      const createdBookings = [];
      for (const item of cartItems) {
        const product = await storage.getProductById(item.productId);
        if (!product) continue;

        const startDate = new Date(item.startDate);
        const endDate = new Date(item.endDate);
        const totalDays = differenceInDays(endDate, startDate) + 1;
        const basePrice = parseFloat(product.basePrice);
        const depositAmount = parseFloat(product.depositAmount);
        const rentalAmount = totalDays * basePrice;
        const totalAmount = rentalAmount + depositAmount;

        const booking = await storage.createBooking({
          userId,
          productId: item.productId,
          variantId: item.variantId,
          startDate: item.startDate,
          endDate: item.endDate,
          totalDays,
          rentalAmount: rentalAmount.toString(),
          depositAmount: depositAmount.toString(),
          totalAmount: totalAmount.toString(),
          status: "pending",
          paymentStatus: "pending",
          size: item.size,
          color: item.color,
          deliveryAddress: `${address}, ${city} - ${pincode}`,
          notes,
        });

        createdBookings.push(booking);
      }

      // Clear the cart
      await storage.clearCart(userId);

      // Return success (in production, you'd create a Stripe checkout session here)
      res.json({
        success: true,
        bookings: createdBookings,
        // checkoutUrl would be set if Stripe is configured
      });
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/products", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/admin/products", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const product = await storage.createProduct(req.body);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.patch("/api/admin/products/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.updateProduct(productId, req.body);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/admin/products/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      await storage.deleteProduct(productId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  app.get("/api/admin/bookings", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      
      // Populate with product details
      const bookingsWithProducts = await Promise.all(
        bookings.map(async (booking) => {
          const product = await storage.getProductById(booking.productId);
          return { ...booking, product };
        })
      );
      
      res.json(bookingsWithProducts);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get("/api/admin/bookings/recent", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      const recentBookings = bookings.slice(0, 10);
      
      // Populate with product details
      const bookingsWithProducts = await Promise.all(
        recentBookings.map(async (booking) => {
          const product = await storage.getProductById(booking.productId);
          return { ...booking, product };
        })
      );
      
      res.json(bookingsWithProducts);
    } catch (error) {
      console.error("Error fetching recent bookings:", error);
      res.status(500).json({ message: "Failed to fetch recent bookings" });
    }
  });

  app.get("/api/admin/bookings/upcoming-returns", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const bookings = await storage.getUpcomingReturns();
      
      // Populate with product details
      const bookingsWithProducts = await Promise.all(
        bookings.map(async (booking) => {
          const product = await storage.getProductById(booking.productId);
          return { ...booking, product };
        })
      );
      
      res.json(bookingsWithProducts);
    } catch (error) {
      console.error("Error fetching upcoming returns:", error);
      res.status(500).json({ message: "Failed to fetch upcoming returns" });
    }
  });

  app.patch("/api/admin/bookings/:id/status", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const { status } = req.body;
      const booking = await storage.updateBooking(bookingId, { status });
      res.json(booking);
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  app.post("/api/admin/categories", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const category = await storage.createCategory(req.body);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.patch("/api/admin/categories/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await storage.updateCategory(categoryId, req.body);
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/admin/categories/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      await storage.deleteCategory(categoryId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });
}
