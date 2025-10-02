'use client';

import { useState } from 'react';

import {
  Clock,
  Search,
  Star,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Image } from '@imagekit/next';

interface SearchResult {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  prepTime: string;
}

const mockResults: SearchResult[] = [
  {
    id: '1',
    name: 'Ultimate Beast Burger',
    description: 'Double beef patties, crispy bacon, aged cheddar',
    price: 14.99,
    image: 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&cs=tinysrgb&w=300',
    category: 'burgers',
    rating: 4.9,
    prepTime: '12-15'
  },
  {
    id: '2',
    name: 'Spicy Buffalo Chicken',
    description: 'Hand-breaded chicken breast, buffalo sauce',
    price: 12.99,
    image: 'https://images.pexels.com/photos/2271107/pexels-photo-2271107.jpeg?auto=compress&cs=tinysrgb&w=300',
    category: 'chicken',
    rating: 4.7,
    prepTime: '10-12'
  }
];

interface SearchBarProps {
  onResultSelect?: (result: SearchResult) => void;
}

export function SearchBar({ onResultSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    
    if (searchQuery.length > 2) {
      setIsLoading(true);
      setIsOpen(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate search
      const filtered = mockResults.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered);
      setIsLoading(false);
    } else {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setQuery(result.name);
    setIsOpen(false);
    onResultSelect?.(result);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2 transform" />
        <Input
          type="text"
          placeholder="Search meals, categories..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pr-10 pl-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="top-1/2 right-1 absolute p-0 w-6 h-6 -translate-y-1/2 transform"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <Card className="top-full right-0 left-0 z-50 absolute mt-2 max-h-96 overflow-y-auto">
          <div className="p-2">
            <div className="flex justify-between items-center mb-2 px-2">
              <span className="font-medium text-sm">Search Results</span>
              <Badge variant="secondary">{results.length} found</Badge>
            </div>
            <div className="space-y-1">
              {results.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => handleResultClick(result)}
                  className="flex items-center space-x-3 hover:bg-accent p-3 rounded-lg w-full text-left transition-colors cursor-pointer"
                >
                  <Image
                    src={result.image}
                    alt={result.name}
                    width={48}
                    height={48}
                    className="rounded-lg object-cover"
                    unoptimized
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-medium text-sm truncate">{result.name}</h4>
                    <p className="text-muted-foreground text-xs truncate">
                      {result.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center space-x-1">
                        <Star className="fill-current w-3 h-3 text-yellow-400" />
                        <span className="text-xs">{result.rating}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{result.prepTime} min</span>
                      </div>
                    </div>
                  </div>
                  <div className="font-medium text-primary text-sm">
                    R{result.price}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {isOpen && isLoading && (
        <Card className="top-full right-0 left-0 z-50 absolute mt-2">
          <div className="p-4">
            <div className="flex justify-center items-center space-x-2">
              <div className="border-2 border-primary border-t-transparent rounded-full w-4 h-4 animate-spin"></div>
              <span className="text-muted-foreground text-sm">Searching...</span>
            </div>
          </div>
        </Card>
      )}

      {isOpen && results.length === 0 && query.length > 2 && (
        <Card className="top-full right-0 left-0 z-50 absolute mt-2">
          <div className="p-4 text-center">
            <Search className="mx-auto mb-2 w-8 h-8 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">
              No results found for &quot;{query}&quot;
            </p>
            <p className="mt-1 text-muted-foreground text-xs">
              Try searching for burgers, chicken, or sides
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}