import { NextResponse } from "next/server"

// Mock users database - In a real app, this would be in a database
const users = [
  {
    id: "1",
    email: "demo@stayfinder.com",
    password: "password123",
    firstName: "Demo",
    lastName: "User",
    avatar: "/placeholder.svg?height=100&width=100",
  },
]

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, password } = await request.json()

    // Check if user already exists
    const existingUser = users.find((u) => u.email === email)
    if (existingUser) {
      return NextResponse.json({ message: "User already exists with this email" }, { status: 400 })
    }

    // Create new user
    const newUser = {
      id: (users.length + 1).toString(),
      email,
      password, // In real app, this would be hashed
      firstName,
      lastName,
      avatar: "/placeholder.svg?height=100&width=100",
    }

    users.push(newUser)

    // Generate token
    const token = "mock-jwt-token-" + newUser.id

    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({
      user: userWithoutPassword,
      token,
      message: "Registration successful",
    })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
