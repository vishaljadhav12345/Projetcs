import { NextResponse } from "next/server"

// Mock host properties database (same as in main route)
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

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const propertyIndex = hostProperties.findIndex((p) => p.id === params.id)

    if (propertyIndex === -1) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    hostProperties.splice(propertyIndex, 1)

    return NextResponse.json({
      message: "Property deleted successfully",
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete property" }, { status: 500 })
  }
}
