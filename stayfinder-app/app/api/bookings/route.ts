import { NextResponse } from "next/server"

// Mock bookings database
const bookings: any[] = []

export async function GET() {
  try {
    return NextResponse.json(bookings)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const bookingData = await request.json()

    const newBooking = {
      id: (bookings.length + 1).toString(),
      ...bookingData,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    }

    bookings.push(newBooking)

    return NextResponse.json({
      booking: newBooking,
      message: "Booking created successfully",
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
