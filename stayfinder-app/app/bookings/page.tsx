"use client"

import { useState, useEffect } from "react"
import { Calendar, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"

interface Booking {
  id: string
  propertyId: string
  checkIn: string
  checkOut: string
  guests: number
  totalPrice: number
  status: "confirmed" | "pending" | "cancelled"
  createdAt: string
  property: {
    title: string
    location: string
    images: string[]
  }
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings")
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-rose-500">
              StayFinder
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-rose-500">
                Home
              </Link>
              <Link href="/host" className="text-gray-700 hover:text-rose-500">
                Host
              </Link>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Bookings</h1>
          <p className="text-gray-600 mt-1">Manage your upcoming and past stays</p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="flex">
                  <div className="w-48 h-32 bg-gray-200 animate-pulse" />
                  <div className="flex-1 p-6">
                    <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3 mb-4" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No bookings yet</h2>
            <p className="text-gray-600 mb-6">Start exploring amazing places to stay</p>
            <Link href="/">
              <Button className="bg-rose-500 hover:bg-rose-600">Browse Properties</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="flex">
                  <div className="w-48 h-32 relative">
                    <Image
                      src={booking.property?.images?.[0] || "/placeholder.svg?height=128&width=192"}
                      alt={booking.property?.title || "Property"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {booking.property?.title || "Property"}
                        </h3>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{booking.property?.location || "Location"}</span>
                        </div>
                      </div>
                      <Badge
                        variant={
                          booking.status === "confirmed"
                            ? "default"
                            : booking.status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <div>
                          <p className="font-medium">Check-in</p>
                          <p>{formatDate(booking.checkIn)}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <div>
                          <p className="font-medium">Check-out</p>
                          <p>{formatDate(booking.checkOut)}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <div>
                          <p className="font-medium">Guests</p>
                          <p>{booking.guests} guests</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">
                          {calculateNights(booking.checkIn, booking.checkOut)} nights
                        </p>
                        <p className="text-lg font-semibold text-gray-900">Total: ${booking.totalPrice}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Link href={`/property/${booking.propertyId}`}>
                          <Button variant="outline">View Property</Button>
                        </Link>
                        {booking.status === "confirmed" && <Button variant="outline">Manage Booking</Button>}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
