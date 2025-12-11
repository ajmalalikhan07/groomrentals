
The app will start on a local Vite dev server (for example `http://localhost:5173`) if environment variables like `DATABASE_URL` are configured.

## 📊 Data Model (High Level)

- **Users:** account details, profile information  
- **Products:** name, category, pricePerDay, size, images, rating, availability  
- **Bookings:** user, product, rental dates, total amount, status  
- **CartItems:** user cart with selected outfits and dates  

## 🔮 Future Improvements

- Real payment gateway integration (Razorpay / Stripe)  
- Email/SMS notifications for booking and return reminders  
- Admin analytics dashboard for revenue and popular outfits  
- Native mobile app using React Native

---

**Author:** Ajmal Ali Khan  
**Report:** See `GroomRentals-Report.pdf` for a one‑page project summary.
