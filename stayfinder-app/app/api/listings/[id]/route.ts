import { NextResponse } from "next/server"

// Mock data - same as in the main listings route
const properties = [
  {
    id: "1",
    title: "Modern Downtown Apartment",
    location: "New York, NY",
    price: 150,
    rating: 4.8,
    reviews: 124,
    images: [
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
    ],
    type: "Apartment",
    guests: 4,
    bedrooms: 2,
    bathrooms: 2,
    amenities: ["WiFi", "Kitchen", "TV", "Parking"],
    description:
      "Beautiful modern apartment in the heart of downtown. Perfect for business travelers and tourists alike. Walking distance to major attractions and public transportation.",
    host: {
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=100&width=100",
      joinedYear: 2019,
      verified: true,
    },
  },
  {
    id: "2",
    title: "Cozy Beach House",
    location: "Miami, FL",
    price: 200,
    rating: 4.9,
    reviews: 89,
    images: [
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
    ],
    type: "House",
    guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ["WiFi", "Kitchen", "TV", "Parking"],
    description:
      "Stunning beach house with ocean views. Perfect for families and groups looking for a relaxing getaway by the sea.",
    host: {
      name: "Mike Davis",
      avatar: "/placeholder.svg?height=100&width=100",
      joinedYear: 2020,
      verified: true,
    },
  },
  {
    id: "3",
    title: "Mountain Cabin Retreat",
    location: "Aspen, CO",
    price: 300,
    rating: 4.7,
    reviews: 67,
    images: [
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
    ],
    type: "Cabin",
    guests: 8,
    bedrooms: 4,
    bathrooms: 3,
    amenities: ["WiFi", "Kitchen", "TV", "Parking"],
    description: "Rustic mountain cabin with breathtaking views. Ideal for ski trips and mountain adventures.",
    host: {
      name: "Emily Chen",
      avatar: "/placeholder.svg?height=100&width=100",
      joinedYear: 2018,
      verified: true,
    },
  },
  {
    id: "4",
    title: "Urban Loft Studio",
    location: "San Francisco, CA",
    price: 120,
    rating: 4.6,
    reviews: 156,
    images: ["/placeholder.svg?height=300&width=400", "/placeholder.svg?height=300&width=400"],
    type: "Loft",
    guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ["WiFi", "Kitchen", "TV"],
    description: "Stylish loft studio in the heart of San Francisco. Perfect for couples and solo travelers.",
    host: {
      name: "David Wilson",
      avatar: "/placeholder.svg?height=100&width=100",
      joinedYear: 2021,
      verified: false,
    },
  },
  {
    id: "5",
    title: "Luxury Villa with Pool",
    location: "Los Angeles, CA",
    price: 500,
    rating: 4.9,
    reviews: 43,
    images: [
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
    ],
    type: "Villa",
    guests: 10,
    bedrooms: 5,
    bathrooms: 4,
    amenities: ["WiFi", "Kitchen", "TV", "Parking"],
    description:
      "Luxurious villa with private pool and stunning city views. Perfect for large groups and special occasions.",
    host: {
      name: "Jessica Martinez",
      avatar: "/placeholder.svg?height=100&width=100",
      joinedYear: 2017,
      verified: true,
    },
  },
  {
    id: "6",
    title: "Historic Brownstone",
    location: "Boston, MA",
    price: 180,
    rating: 4.5,
    reviews: 92,
    images: [
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
    ],
    type: "House",
    guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ["WiFi", "Kitchen", "TV", "Parking"],
    description:
      "Charming historic brownstone in a quiet neighborhood. Rich in character and close to major attractions.",
    host: {
      name: "Robert Taylor",
      avatar: "/placeholder.svg?height=100&width=100",
      joinedYear: 2019,
      verified: true,
    },
  },
]

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const property = properties.find((p) => p.id === params.id)

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    return NextResponse.json(property)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch property" }, { status: 500 })
  }
}
