import { useEffect, useState } from 'react'
import ApiService, { API_URL } from '../services/api'
import { Kanji } from '../models'

interface PaginationData {
    from: number
    take: number
    total: number
    hasMore: boolean
}

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}

interface UseKanjiSearchOptions {
    initialPageSize?: number
    debounceDelay?: number
}

export const useKanjiSearch = (options: UseKanjiSearchOptions = {}) => {
    const { initialPageSize = 200, debounceDelay = 500 } = options

    const [kanjiList, setKanjiList] = useState<Kanji[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [jlptLevel, setJlptLevel] = useState<string | undefined>(undefined)
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState<PaginationData>({
        from: 0,
        take: initialPageSize,
        total: 0,
        hasMore: false
    })

    // Debounce search query
    const debouncedSearchQuery = useDebounce(searchQuery, debounceDelay)

    const fetchKanjis = async (from = 0, take = initialPageSize, query = '', jlpt?: string) => {
        try {
            setLoading(true)
            let url = `${API_URL}/kanji/paginated?from=${from}&take=${take}`
            if (query) {
                url += `&query=${encodeURIComponent(query)}`
            }
            if (jlpt) {
                url += `&jlptLevel=${jlpt}`
            }

            console.log('Fetching with URL:', url)
            const response = await ApiService.get(url)
            setKanjiList(response.data.data)
            setPagination(response.data.pagination)
            console.log('Pagination response:', response.data.pagination)

        } catch (error) {
            console.error('Failed to fetch kanjis:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchKanjis(0, pagination.take, debouncedSearchQuery, jlptLevel)
    }, [debouncedSearchQuery, jlptLevel, pagination.take])

    const handleTableChange = (page: number, pageSize?: number) => {
        const from = (page - 1) * (pageSize || pagination.take)
        const take = pageSize || pagination.take
        fetchKanjis(from, take, debouncedSearchQuery, jlptLevel)
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    const handleJlptChange = (value: string | undefined) => {
        setJlptLevel(value)
    }

    const clearFilters = () => {
        setSearchQuery('')
        setJlptLevel(undefined)
    }

    const refresh = () => {
        fetchKanjis(0, pagination.take, debouncedSearchQuery, jlptLevel)
    }

    return {
        // Data
        kanjiList,
        pagination,
        loading,

        // Filter states
        searchQuery,
        jlptLevel,

        // Handlers
        handleSearchChange,
        handleJlptChange,
        handleTableChange,
        clearFilters,
        refresh,

        // Utils
        fetchKanjis
    }
} 