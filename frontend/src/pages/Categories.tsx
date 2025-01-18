import React, { useState, useEffect } from 'react';
import { getCategories, Category } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getCategories();
        setCategories(response);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <div className="p-6">Помилка завантаження: {error}</div>;
  }

  return (
    <div className="p-6">
      <ul className="mt-4">
        {categories.map((category) => (
          <li key={category.id} className="py-2">
            {category.name}
          </li>
        ))}
      </ul>
    </div>
  );
}