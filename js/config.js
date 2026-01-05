// إعدادات عامة للموقع (عدّلها حسب احتياجك)
export const CONFIG = {
  siteUrl: "https://www.hebaelsherifacademy.com",
  whatsappNumber: "2011149216", // عدّل الرقم: 201xxxxxxxxx
  coupons: {
    HEBA1000: { minutes: 60, finalPrice: 1000 },
    HEBA1500: { minutes: 90, finalPrice: 1500 }
  },
  basePrices: {
    60: 1200,
    90: 1800
  },
  // ضع هنا إيميل/إيميلات الأدمن (لازم تكون نفس الإيميل اللي بتسجّل بيه في الموقع)
  adminEmails: [
    "medoogomaa21@gmail.com"
  ],
  timeSlots: {
    startHour: 9,
    endHour: 21,
    stepMinutes: 30
  }
};
