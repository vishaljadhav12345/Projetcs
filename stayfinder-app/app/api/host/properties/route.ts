import { NextResponse } from "next/server"

// Mock host properties database
const hostProperties = [
  {
    id: "1",
    title: "Modern Downtown Apartment",
    location: "New York, NY",
    price: 150,
    type: "apartment",
    guests: 4,
    bedrooms: 2,
    bathrooms: 2,
    images: ["/placeholder.svg?height=300&width=400"],
    status: "active" as const,
    bookings: 12,
  },
  {
    id: "2",
    title: "Cozy Beach House",
    location: "Miami, FL",
    price: 200,
    type: "house",
    guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    images: ["/placeholder.svg?height=300&width=400"],
    status: "active" as const,
    bookings: 8,
  },
]

export async function GET() {
  try {
    return NextResponse.json(hostProperties)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const propertyData = await request.json()

    const newProperty = {
      id: (hostProperties.length + 1).toString(),
      ...propertyData,
      status: "active" as const,
      bookings: 0,
    }

    hostProperties.push(newProperty)

    return NextResponse.json({
      property: newProperty,
      message: "Property created successfully",
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 })
  }
}
