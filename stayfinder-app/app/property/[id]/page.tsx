"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Star, MapPin, Wifi, Car, Coffee, Tv, Heart, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"

interface Property {
  id: string
  title: string
  location: string
  price: number
  rating: number
  reviews: number
  images: string[]
  type: string
  guests: number
  bedrooms: number
  bathrooms: number
  amenities: string[]
  description: string
  host: {
    name: string
    avatar: string
    joinedYear: number
    verified: boolean
  }
}

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (params.id) {
      fetchProperty(params.id as string)
    }
  }, [params.id])

  const fetchProperty = async (id: string) => {
    try {
      const response = await fetch(`/api/listings/${id}`)
      if (response.ok) {
        const data = await response.json()
        setProperty(data)
      } else {
        router.push("/404")
      }
    } catch (error) {
      console.error("Error fetching property:", error)
      router.push("/404")
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async () => {
    if (!checkIn || !checkOut) {
      alert("Please select check-in and check-out dates")
      return
    }

    const bookingData = {
      propertyId: property?.id,
      checkIn,
      checkOut,
      guests,
      totalPrice: calculateTotalPrice(),
    }

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      })

      if (response.ok) {
        alert("Booking successful!")
        router.push("/bookings")
      } else {
        alert("Booking failed. Please try again.")
      }
    } catch (error) {
      console.error("Error creating booking:", error)
      alert("Booking failed. Please try again.")
    }
  }

  const calculateTotalPrice = () => {
    if (!checkIn || !checkOut || !property) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return nights * property.price
  }

  const amenityIcons: { [key: string]: any } = {
    WiFi: Wifi,
    Parking: Car,
    Kitchen: Coffee,
    TV: Tv,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="h-96 bg-gray-200 rounded mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
              <div className="h-64 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property not found</h1>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    )
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
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link href="/" className="text-rose-500 hover:underline">
            Home
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-900">{property.title}</span>
        </nav>

        {/* Property Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                  <span>{property.rating}</span>
                  <span className="mx-1">·</span>
                  <span>{property.reviews} reviews</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{property.location}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-96">
            <div className="relative rounded-lg overflow-hidden">
              <Image
                src={property.images[currentImageIndex] || "/placeholder.svg"}
                alt={property.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {property.images.slice(1, 5).map((image, index) => (
                <div
                  key={index}
                  className="relative rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => setCurrentImageIndex(index + 1)}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${property.title} ${index + 2}`}
                    fill
                    className="object-cover hover:opacity-80 transition-opacity"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Details */}
          <div className="lg:col-span-2">
            {/* Property Info */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {property.type} hosted by {property.host.name}
                    </h2>
                    <div className="flex items-center space-x-4 text-gray-600 mt-1">
                      <span>{property.guests} guests</span>
                      <span>·</span>
                      <span>{property.bedrooms} bedrooms</span>
                      <span>·</span>
                      <span>{property.bathrooms} bathrooms</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={property.host.avatar || "/placeholder.svg"}
                      alt={property.host.name}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-gray-700 leading-relaxed">{property.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>What this place offers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {property.amenities.map((amenity, index) => {
                    const IconComponent = amenityIcons[amenity] || Coffee
                    return (
                      <div key={index} className="flex items-center">
                        <IconComponent className="h-5 w-5 text-gray-600 mr-3" />
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Host Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                    <Image
                      src={property.host.avatar || "/placeholder.svg"}
                      alt={property.host.name}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Hosted by {property.host.name}</h3>
                    <p className="text-gray-600">Joined in {property.host.joinedYear}</p>
                    {property.host.verified && (
                      <Badge variant="secondary" className="mt-1">
                        Verified Host
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">${property.price}</span>
                    <span className="text-gray-600 ml-1">night</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span>{property.rating}</span>
                    <span className="mx-1">·</span>
                    <span className="text-gray-600">{property.reviews} reviews</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="checkin">Check-in</Label>
                      <Input
                        id="checkin"
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div>
                      <Label htmlFor="checkout">Check-out</Label>
                      <Input
                        id="checkout"
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        min={checkIn || new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="guests">Guests</Label>
                    <Input
                      id="guests"
                      type="number"
                      min="1"
                      max={property.guests}
                      value={guests}
                      onChange={(e) => setGuests(Number.parseInt(e.target.value))}
                    />
                  </div>

                  {checkIn && checkOut && (
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>
                          ${property.price} x{" "}
                          {Math.ceil(
                            (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24),
                          )}{" "}
                          nights
                        </span>
                        <span>${calculateTotalPrice()}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg border-t pt-2">
                        <span>Total</span>
                        <span>${calculateTotalPrice()}</span>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full bg-rose-500 hover:bg-rose-600"
                    onClick={handleBooking}
                    disabled={!checkIn || !checkOut}
                  >
                    Reserve
                  </Button>

                  <p className="text-center text-sm text-gray-600">You won't be charged yet</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
