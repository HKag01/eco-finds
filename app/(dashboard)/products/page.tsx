'use client'

import { useState } from 'react'
import { Search, Filter, Star } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const products = [
  {
    id: 1,
    name: 'Eco Water Bottle',
    price: 24.99,
    rating: 4.8,
    reviews: 127,
    image: '/api/placeholder/200/200',
    category: 'Drinkware',
    ecoScore: 95
  },
  {
    id: 2,
    name: 'Bamboo Toothbrush Set',
    price: 12.99,
    rating: 4.6,
    reviews: 89,
    image: '/api/placeholder/200/200',
    category: 'Personal Care',
    ecoScore: 92
  },
  {
    id: 3,
    name: 'Reusable Food Wraps',
    price: 18.99,
    rating: 4.7,
    reviews: 156,
    image: '/api/placeholder/200/200',
    category: 'Kitchen',
    ecoScore: 88
  },
  {
    id: 4,
    name: 'Solar Power Bank',
    price: 39.99,
    rating: 4.5,
    reviews: 94,
    image: '/api/placeholder/200/200',
    category: 'Electronics',
    ecoScore: 85
  }
]

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredProducts, setFilteredProducts] = useState(products)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase())
    )
    setFilteredProducts(filtered)
  }

  return (
    <div className="container mx-auto p-4 pb-20 md:pb-4">
      <div>products-ahh-page</div>
    </div>
  );
}