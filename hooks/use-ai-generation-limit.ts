import { useState, useEffect, useCallback } from 'react';

interface AiGenerationLimit {
  count: number;
  limit: number;
}

export function useAiGenerationLimit() {
  const [limit, setLimit] = useState<AiGenerationLimit | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLimit = useCallback(async () => {
    try {
      const response = await fetch('/api/ai-generation-limit');
      const data = await response.json();
      if (data.success) {
        setLimit(data.data);
      }
    } catch (error) {
      console.error('Error fetching AI generation limit:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLimit();
  }, [fetchLimit]);

  return { limit, loading, refreshLimit: fetchLimit };
} 