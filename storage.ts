import {
  users,
  categories,
  products,
  productVariants,
  blackoutDates,
  bookings,
  cartItems,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type ProductVariant,
  type InsertProductVariant,
  type BlackoutDate,
  type InsertBlackoutDate,
  type Booking,
  type InsertBooking,
  type CartItem,
  type InsertCartItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, or, sql, ilike } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, data: Partial<UpsertUser>): Promise<User | undefined>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, data: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<void>;

  // Product operations
  getProducts(filters?: {
    categorySlug?: string;
    search?: string;
    isActive?: boolean;
  }): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;

  // Blackout dates
  getBlackoutDates(productId: number): Promise<BlackoutDate[]>;
  createBlackoutDate(blackoutDate: InsertBlackoutDate): Promise<BlackoutDate>;
  deleteBlackoutDate(id: number): Promise<void>;

  // Booking operations
  getBookings(userId?: string): Promise<Booking[]>;
  getBookingById(id: number): Promise<Booking | undefined>;
  getRecentBookings(userId: string, limit?: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, data: Partial<InsertBooking>): Promise<Booking | undefined>;

  // Cart operations
  getCartItems(userId: string): Promise<CartItem[]>;
  getCartItemById(id: number): Promise<CartItem | undefined>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId: string): Promise<void>;

  // Admin operations
  getAdminStats(): Promise<{
    totalProducts: number;
    totalBookings: number;
    pendingBookings: number;
    activeBookings: number;
    revenue: number;
  }>;
  getUpcomingReturns(): Promise<Booking[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<UpsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(categories.displayOrder);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, data: Partial<InsertCategory>): Promise<Category | undefined> {
    const [category] = await db
      .update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning();
    return category;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Product operations
  async getProducts(filters?: {
    categorySlug?: string;
    search?: string;
    isActive?: boolean;
  }): Promise<Product[]> {
    let query = db.select().from(products);
    
    const conditions = [];
    
    if (filters?.isActive !== undefined) {
      conditions.push(eq(products.isActive, filters.isActive));
    }

    if (filters?.categorySlug && filters.categorySlug !== "all") {
      const category = await this.getCategoryBySlug(filters.categorySlug);
      if (category) {
        conditions.push(eq(products.categoryId, category.id));
      }
    }

    if (filters?.search) {
      conditions.push(ilike(products.name, `%${filters.search}%`));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return query.orderBy(desc(products.isFeatured), desc(products.createdAt));
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return db
      .select()
      .from(products)
      .where(and(eq(products.isActive, true), eq(products.isFeatured, true)))
      .orderBy(desc(products.createdAt))
      .limit(8);
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Blackout dates
  async getBlackoutDates(productId: number): Promise<BlackoutDate[]> {
    return db
      .select()
      .from(blackoutDates)
      .where(eq(blackoutDates.productId, productId));
  }

  async createBlackoutDate(blackoutDate: InsertBlackoutDate): Promise<BlackoutDate> {
    const [newBlackoutDate] = await db
      .insert(blackoutDates)
      .values(blackoutDate)
      .returning();
    return newBlackoutDate;
  }

  async deleteBlackoutDate(id: number): Promise<void> {
    await db.delete(blackoutDates).where(eq(blackoutDates.id, id));
  }

  // Booking operations
  async getBookings(userId?: string): Promise<Booking[]> {
    if (userId) {
      return db
        .select()
        .from(bookings)
        .where(eq(bookings.userId, userId))
        .orderBy(desc(bookings.createdAt));
    }
    return db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  async getBookingById(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getRecentBookings(userId: string, limit = 5): Promise<Booking[]> {
    return db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt))
      .limit(limit);
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async updateBooking(id: number, data: Partial<InsertBooking>): Promise<Booking | undefined> {
    const [booking] = await db
      .update(bookings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  // Cart operations
  async getCartItems(userId: string): Promise<CartItem[]> {
    return db.select().from(cartItems).where(eq(cartItems.userId, userId));
  }

  async getCartItemById(id: number): Promise<CartItem | undefined> {
    const [item] = await db.select().from(cartItems).where(eq(cartItems.id, id));
    return item;
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    const [newItem] = await db.insert(cartItems).values(cartItem).returning();
    return newItem;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Admin operations
  async getAdminStats(): Promise<{
    totalProducts: number;
    totalBookings: number;
    pendingBookings: number;
    activeBookings: number;
    revenue: number;
  }> {
    const [productCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(eq(products.isActive, true));

    const [bookingStats] = await db.select({
      total: sql<number>`count(*)::int`,
      pending: sql<number>`count(*) filter (where ${bookings.status} = 'pending')::int`,
      active: sql<number>`count(*) filter (where ${bookings.status} in ('confirmed', 'delivered'))::int`,
      revenue: sql<number>`coalesce(sum(${bookings.rentalAmount}::numeric), 0)::float`,
    }).from(bookings);

    return {
      totalProducts: productCount?.count || 0,
      totalBookings: bookingStats?.total || 0,
      pendingBookings: bookingStats?.pending || 0,
      activeBookings: bookingStats?.active || 0,
      revenue: bookingStats?.revenue || 0,
    };
  }

  async getUpcomingReturns(): Promise<Booking[]> {
    const today = new Date().toISOString().split("T")[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    
    return db
      .select()
      .from(bookings)
      .where(
        and(
          or(eq(bookings.status, "confirmed"), eq(bookings.status, "delivered")),
          gte(bookings.endDate, today),
          lte(bookings.endDate, nextWeek)
        )
      )
      .orderBy(bookings.endDate)
      .limit(10);
  }
}

export const storage = new DatabaseStorage();
