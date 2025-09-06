'use client'

import { useState } from 'react'
import { User, Mail, Phone, MapPin, Award, Leaf, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    ecoPoints: 1245,
    level: 'Eco Warrior',
    carbonSaved: 24.5,
    ordersCompleted: 12
  })

  const handleSave = () => {
    setIsEditing(false)
    // Here you would typically save to API
  }

  return (
    <div>profile-ahh-page</div>
  )
}