export interface ProductReview {
  author: string;
  rating: number;
  date: string;
  content: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: "Home" | "Wellness" | "Work";
  image: string;
  description: string;
  details: string[];
  specs: Record<string, string>;
  options?: {
    name: string;
    values: string[];
  };
  rating: number;
  reviewCount: number;
  reviews: ProductReview[];
}

export const PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Aether Ceramic Diffuser",
    price: 85,
    category: "Wellness",
    image: "https://picsum.photos/seed/ceramics/600/600",
    description: "An ultrasonic stone aromatherapy diffuser crafted from premium natural terracotta clay. Fills any space with a fine, cool ambient mist and warm organic glow.",
    details: [
      "Crafted from premium double-fired hand-molded ceramic",
      "Ultrasonic mist technology runs quietly for up to 8 hours",
      "Features optional warm-spectrum breathing light mode",
      "Automatic shut-off when water level is low"
    ],
    specs: {
      "Material": "Terracotta Ceramic, BPA-free polymer interior",
      "Water Capacity": "120 ml",
      "Runtime": "3h continuous or 8h interval mode",
      "Dimensions": "8.6 cm x 18 cm",
      "Coverage": "Up to 500 sq ft"
    },
    options: {
      name: "Clay Tint",
      values: ["Terracotta", "Chalk White", "Basalt Black"]
    },
    rating: 4.8,
    reviewCount: 34,
    reviews: [
      { author: "Evelyn K.", rating: 5, date: "2026-06-15", content: "Absolutely stunning on my nightstand. The warm light matches my evening routine perfectly, and the terracotta feel is gorgeous." },
      { author: "Marcus L.", rating: 4, date: "2026-05-22", content: "Runs quiet and distributes scent very evenly. I only wish the reservoir was slightly larger, but 120ml is plenty for a full night on interval mode." }
    ]
  },
  {
    id: "prod-2",
    name: "Halogen Brass Pen Tray",
    price: 45,
    category: "Work",
    image: "https://picsum.photos/seed/brasstray/600/600",
    description: "A heavy, solid milled brass desk tray with an exquisite brushed finish. Designed to hold your writing instruments and desk essentials, gaining a beautiful natural patina over time.",
    details: [
      "Precision-milled from a solid block of eco-brass",
      "Brushed micro-texture prevents slipping and fingerprints",
      "Heavy weighted base with anti-scratch natural wool felt protection",
      "Grows a beautiful, deep, personalized bronze patina with age"
    ],
    specs: {
      "Material": "Solid C360 Brass, Merino Wool Felt base",
      "Weight": "420 grams (substantial desk anchor)",
      "Dimensions": "20 cm x 7.5 cm x 1.2 cm",
      "Finishing": "Satin-brushed raw brass (unlacquered)"
    },
    options: {
      name: "Finish",
      values: ["Raw Satin Brass", "Aged Antique Bronze"]
    },
    rating: 4.9,
    reviewCount: 18,
    reviews: [
      { author: "Liam S.", rating: 5, date: "2026-06-28", content: "This is a work of art. The weight is amazing—it double-acts as a paperweight. It brings a refined vintage touch to my minimalist mechanical keyboard setup." },
      { author: "Elena R.", rating: 5, date: "2026-04-12", content: "Perfect packaging, and the raw brass is already developing a gorgeous character after just a few weeks of use." }
    ]
  },
  {
    id: "prod-3",
    name: "Verdant Ceremonial Matcha",
    price: 32,
    category: "Wellness",
    image: "https://picsum.photos/seed/matcha/600/600",
    description: "Ceremonial-grade stone-ground Uji matcha tea, shade-grown and harvested by hand in Kyoto, Japan. Delivers a vibrant green liquor with a smooth umami finish and clean energy boost.",
    details: [
      "100% organic, shade-grown tencha tea leaves",
      "Hand-picked first-harvest spring crop from Kyoto prefecture",
      "Traditional granite-stone ground for peak freshness and fine texture",
      "Hermetically sealed in a light-blocking, gold-stamped tin"
    ],
    specs: {
      "Origin": "Uji, Kyoto, Japan",
      "Grade": "Imperial Ceremonial",
      "Net Weight": "30 grams (approx. 20-25 servings)",
      "Flavor Profile": "Deep umami, natural sweetness, velvety creaminess"
    },
    rating: 4.7,
    reviewCount: 52,
    reviews: [
      { author: "Ami T.", rating: 5, date: "2026-07-02", content: "Outstanding quality. It has zero bitterness and is incredibly sweet even without any milk or sweetener. Luminous emerald color!" },
      { author: "Derek J.", rating: 4, date: "2026-06-11", content: "Excellent daily ceremonial matcha. Whistles up beautifully with a nice foam. Solid, rich taste." }
    ]
  },
  {
    id: "prod-4",
    name: "Keystone Mechanical Keyboard",
    price: 190,
    category: "Work",
    image: "https://picsum.photos/seed/mechanicalkeyboard/600/600",
    description: "A tenkeyless compact mechanical keyboard housed in a rich solid American Walnut chassis. Featuring lubed linear cream switches for an ultra-creamy, tactile writing signature.",
    details: [
      "CNC-sculpted solid American Walnut case with beautiful grain matching",
      "Hot-swappable PCB supports 3-pin and 5-pin MX switches",
      "Custom lubed linear cream switches with POM stems for butter-smooth keypresses",
      "Integrated poron case foam and silicone dampeners for acoustics"
    ],
    specs: {
      "Form Factor": "75% Layout (82-key TKL)",
      "Case Material": "Solid American Walnut",
      "Switches": "Linear Custom Cream (lubed, 45g actuation)",
      "Connectivity": "USB-C detachable, Bluetooth 5.1 (3 device memory)",
      "Backlight": "Warm white ambient per-key lighting"
    },
    options: {
      name: "Keycap Profile",
      values: ["Aesthetic Minimalist", "Classic Retro Charcoal"]
    },
    rating: 4.9,
    reviewCount: 29,
    reviews: [
      { author: "Kenji S.", rating: 5, date: "2026-06-30", content: "The typing sound is pure rain-like ASMR. Absolutely premium wood. Pairs gorgeously with my wood monitor riser." },
      { author: "Sarah B.", rating: 5, date: "2026-05-18", content: "A premium keyboard that feels like premium furniture. Wireless connectivity swaps instantly between my Mac and iPad. Highly recommend." }
    ]
  },
  {
    id: "prod-5",
    name: "Sora Washi Pendant Light",
    price: 120,
    category: "Home",
    image: "https://picsum.photos/seed/pendantlight/600/600",
    description: "A sculptural hanging pendant light shade constructed from traditional, handmade Japanese Washi paper. Offers a soft, diffuse glow that creates a calming minimalist atmosphere.",
    details: [
      "Individually hand-ribbed with split bamboo reeds",
      "Made of traditional mulberry bark fibers (Washi paper)",
      "Flat-pack collapsible design with easy structural brass anchors",
      "Includes premium 1.5m braided cream cord and smart warm-LED bulb"
    ],
    specs: {
      "Material": "Mulberry Washi Paper, Bamboo, Solid Brass",
      "Diameter": "40 cm (Standard Medium Size)",
      "Socket Type": "E26 / E27, max 60W",
      "Cord Length": "1.5 meters, fully adjustable, braided fabric",
      "Included Bulb": "9W smart LED (2200K - 4000K tuneable warm white)"
    },
    options: {
      name: "Shape",
      values: ["Sora Dome", "Sora Ellipse"]
    },
    rating: 4.6,
    reviewCount: 22,
    reviews: [
      { author: "Harlan F.", rating: 4, date: "2026-06-05", content: "Looks like a beautiful cloud hanging in my dining room. Assembly was slightly delicate but the light diffusion is unmatched." },
      { author: "Naomi W.", rating: 5, date: "2026-05-01", content: "Adds a zen, soothing mood to the entire room. Combined with a warm smart bulb, it's perfect for unwinding." }
    ]
  },
  {
    id: "prod-6",
    name: "Arkos Organic Linen Sheets",
    price: 210,
    category: "Home",
    image: "https://picsum.photos/seed/bedsheet/600/600",
    description: "Indulgently soft linen bedding woven from premium French organic flax. Pre-washed with natural volcanic stones to ensure a relaxed, breathable, and cozy feel starting on night one.",
    details: [
      "Woven from 100% certified organic French flax fibers",
      "Volcanic stone-washed for peak textural softness and relaxed look",
      "Highly breathable and moisture-wicking; keeps cool in summer, cozy in winter",
      "Set includes: 1 Fitted Sheet, 1 Flat Sheet, 2 envelope-closure Pillowcases"
    ],
    specs: {
      "Material": "100% French Flax Linen",
      "Thread Weight": "165 GSM (optimal heavy-soft balance)",
      "Certifications": "OEKO-TEX® Standard 100",
      "Mattress Depth": "Fits deep mattresses up to 40 cm"
    },
    options: {
      name: "Bed Size",
      values: ["Queen Set", "King Set"]
    },
    rating: 4.8,
    reviewCount: 41,
    reviews: [
      { author: "Sophie P.", rating: 5, date: "2026-06-25", content: "This is easily the best investment I have made for my bedroom. Sleeping in these linen sheets feels like floating on a cloud, and they wash incredibly well without losing their charm." },
      { author: "Gavin D.", rating: 5, date: "2026-05-14", content: "The texture is perfect. They feel substantial but stay unbelievably breezy on warm summer nights. Highly satisfied." }
    ]
  },
  {
    id: "prod-7",
    name: "Terra Clay Carafe Set",
    price: 55,
    category: "Home",
    image: "https://picsum.photos/seed/carafe/600/600",
    description: "A hand-thrown terracotta water carafe and matching tumbler. Naturally porous clay keeps your drinking water beautifully cool through traditional evaporative cooling.",
    details: [
      "Handmade on the wheel by ceramic artisans in Portugal",
      "Glazed only on the interior lip and rim for rustic texture and water protection",
      "Naturally maintains water temperature slightly below room temperature",
      "Set includes 1.2L carafe and one matching 300ml clay tumbler"
    ],
    specs: {
      "Material": "100% Local Portuguese Terracotta Clay",
      "Carafe Capacity": "1.2 Liters (40 oz)",
      "Tumbler Capacity": "300 ml (10 oz)",
      "Care": "Handwash only, air dry thoroughly"
    },
    rating: 4.5,
    reviewCount: 15,
    reviews: [
      { author: "Isabella V.", rating: 5, date: "2026-06-20", content: "Absolutely gorgeous rustic charm. Sits beautifully on our outdoor table. The water has a clean, mineral, cool taste." },
      { author: "Robert M.", rating: 4, date: "2026-04-29", content: "Very neat evaporative cooling effect. Mind that the outside of the clay breathes, so it's best to place it on a coaster." }
    ]
  },
  {
    id: "prod-8",
    name: "Onyx Mineral Cork Desk Pad",
    price: 40,
    category: "Work",
    image: "https://picsum.photos/seed/deskpad/600/600",
    description: "A premium oak cork desk mat dyed with natural charcoal minerals for a beautiful, matte onyx-black finish. Provides a warm, acoustic, and comfortable mouse gliding surface.",
    details: [
      "Woven from renewable Portuguese Oak cork barks",
      "Stained with organic deep iron-charcoal mineral wash",
      "Water-resistant wax coating prevents stains and coffee spills",
      "Naturally anti-static, anti-bacterial, and sound-absorbing"
    ],
    specs: {
      "Material": "Natural Cork composite, organic mineral dyes",
      "Thickness": "4 mm (cushioned wrist support)",
      "Dimensions": "80 cm x 40 cm (Large format)",
      "Backing": "Non-slip cell rubber backing"
    },
    rating: 4.7,
    reviewCount: 20,
    reviews: [
      { author: "Arthur C.", rating: 5, date: "2026-06-19", content: "Exactly the finish I was looking for. Unlike felt desk pads, this doesn't lint or gather dust. My mouse slides perfectly on it." },
      { author: "Nina P.", rating: 4, date: "2026-05-10", content: "Very clean desk pad. Protects the desk and cushions mechanical typing nicely. Came rolled up but flattened out in one day." }
    ]
  }
];
