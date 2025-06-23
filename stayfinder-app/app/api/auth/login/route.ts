import { NextResponse } from "next/server"

// Mock users database - In a real app, this would be in a database
const users = [
  {
    id: "1",
    email: "demo@stayfinder.com",
    password: "password123", // In real app, this would be hashed
    firstName: "Demo",
    lastName: "User",
    avatar: "/placeholder.svg?height=100&width=100",
  },
]

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Find user by email
    const user = users.find((u) => u.email === email)

    if (!user || user.password !== password) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // In a real app, you would generate a proper JWT token
    const token = "mock-jwt-token-" + user.id

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      user: userWithoutPassword,
      token,
      message: "Login successful",
    })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
