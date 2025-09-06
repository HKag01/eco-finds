'use client'

import { useEffect, useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ProductCard from '@/components/ProductCard'
import axios from 'axios'
import { CircleNotchIcon } from '@phosphor-icons/react'

interface Product {
  id: number
  title: string
  description: string
  price: number
  imageUrl: string
  category: string
  createdAt: string
  sellerId: string
  blurHash?: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  useEffect(() => {
    const fetchProducts = async() => {
      try {
        setLoading(true)
        const response = await axios.get("/api/products");
        if(response.data) {
          setProducts(response.data)
          setFilteredProducts(response.data)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProducts()
  },[])

  useEffect(() => {
    let filtered = products
    
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }
    
    setFilteredProducts(filtered)
  }, [products, searchTerm, selectedCategory])

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))]

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CircleNotchIcon className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground font-serif mb-4">
            Discover Useful Products
          </h1>
          <p className="text-muted-foreground">
            Find products which you really need
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="search">Search Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search for sustainable products..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2 min-w-[200px]">
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {searchTerm || selectedCategory !== 'all' 
                ? 'No products match your search criteria.' 
                : 'No products found.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}