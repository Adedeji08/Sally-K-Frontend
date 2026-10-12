import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { ClipLoader } from "react-spinners";
import Navbar from "../../../layouts/navbar";
import { useAuth } from "../../../context/auth-context";
import { useCart } from "../../../context/cart-context";
import { useToast } from "../../../context/toast-context";
import { useWishlist } from "../../../context/wishlist-context";
import { useShopProducts } from "../../../context/shop-product-context";
import useRequest from "../../../hooks/use-req";
import type { ApiProduct } from "../../../types/product";
import { categoryLabel } from "../../../types/product";


// ── Types ─────────────────────────────────────────────────────────────

interface Product {
    id: string;
    name: string;
    designer: string;
    price: number;
    category: string;
    image: string;
    // Has sizes or colours to pick — the cart API needs them, so the card
    // sends shoppers to the product page instead of adding directly.
    needsOptions: boolean;
    stock: number;
    tag?: 'New' | 'Trending' | 'Sale';
    sponsored?: boolean;
}

type Category = 'All' | 'Women' | 'Men' | 'Shoes' | 'Bags' | 'Accessories';

// Tab -> API category values for GET /products?category=. "Women" rolls up two.
const CATEGORY_QUERY: Record<Category, string | undefined> = {
    All: undefined,
    Women: 'dresses,tops',
    Men: 'men',
    Shoes: 'shoes',
    Bags: 'bags',
    Accessories: 'accessories',
};
type SortOption = 'Most Popular' | 'Price: Low to High' | 'Price: High to Low' | 'Newest';

// The shopper catalogue, straight from GET /products (see ShopProductProvider).
// Mapped to the shape the grid / detail / wishlist screens already expect.
function toCardProduct(p: ApiProduct): Product {
    return {
        id: p.id,
        name: p.name,
        designer: p.seller?.brandName ?? 'Independent Designer',
        price: p.price,
        category: categoryLabel(p.category),
        image: p.images[0] ?? '',
        needsOptions: p.sizes.length > 0 || (p.colors?.length ?? 0) > 0,
        stock: p.stock,
    };
}

export function useProductsData(): Product[] {
    const { products } = useShopProducts();
    return useMemo(() => products.map(toCardProduct), [products]);
}

// ── Constants ─────────────────────────────────────────────────────────────

const TAG_COLORS: Record<string, string> = {
    New: 'bg-emerald-500',
    Trending: 'bg-rose-500',
    Sale: 'bg-amber-500'
};

const CATEGORIES: Category[] = ['All', 'Women', 'Men', 'Shoes', 'Bags', 'Accessories'];
const SORT_OPTIONS: SortOption[] = ['Most Popular', 'Price: Low to High', 'Price: High to Low', 'Newest'];

const SORT_QUERY: Record<SortOption, string> = {
    'Most Popular': 'popular',
    'Price: Low to High': 'price_asc',
    'Price: High to Low': 'price_desc',
    'Newest': 'newest',
};

interface PriceBucket {
    label: string;
    min: number;
    max: number;
}

const PRICE_BUCKETS: PriceBucket[] = [
    { label: 'Under ₦10,000', min: 0, max: 10000 },
    { label: '₦10,000 - ₦50,000', min: 10000, max: 50000 },
    { label: '₦50,000 - ₦100,000', min: 50000, max: 100000 },
    { label: '₦100,000+', min: 100000, max: Infinity },
];

interface FilterOptions {
    sizes: string[];
    sellers: { id: string; brandName: string }[];
}

// GET /products with the grid's filters. Search is debounced; responses from
// superseded requests are dropped so fast clicking can't show stale results.
function useStorefrontProducts(params: Record<string, string>, skip: boolean) {
    const { makeRequest } = useRequest('/products', 'GET');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const latest = useRef(0);
    const key = JSON.stringify(params);

    useEffect(() => {
        if (skip) return;
        const requestId = ++latest.current;
        const timer = setTimeout(async () => {
            setLoading(true);
            const [json, status] = await makeRequest(undefined, JSON.parse(key));
            if (requestId !== latest.current) return;
            setLoading(false);
            const ok = status >= 200 && status < 300 && Array.isArray(json?.data);
            setError(!ok);
            if (ok) setProducts((json.data as ApiProduct[]).map(toCardProduct));
        }, 300);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, skip]);

    return { products, loading, error };
}

// GET /products/filters — the sizes and designers actually listed in this tab.
function useFilterOptions(category: string | undefined) {
    const { makeRequest } = useRequest('/products/filters', 'GET');
    const [options, setOptions] = useState<FilterOptions>({ sizes: [], sellers: [] });

    useEffect(() => {
        let cancelled = false;
        makeRequest(undefined, category ? { category } : undefined).then(([json, status]) => {
            if (cancelled || status < 200 || status >= 300 || !json?.data) return;
            setOptions({ sizes: json.data.sizes ?? [], sellers: json.data.sellers ?? [] });
        });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category]);

    return options;
}

// ── Hero Banner ───────────────────────────────────────────

const HERO_SLIDE_IMAGES = [
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=85',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400&q=85',
    'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1400&q=85',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400&q=85',
];

const HERO_SLIDE_DURATION = 5000;

function HeroBanner() {
    const [activeSlide, setActiveSlide] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (paused) return;
        const timer = setInterval(() => {
            setActiveSlide(prev => (prev + 1) % HERO_SLIDE_IMAGES.length);
        }, HERO_SLIDE_DURATION);
        return () => clearInterval(timer);
    }, [paused]);

    const goPrev = () => setActiveSlide(prev => (prev - 1 + HERO_SLIDE_IMAGES.length) % HERO_SLIDE_IMAGES.length);
    const goNext = () => setActiveSlide(prev => (prev + 1) % HERO_SLIDE_IMAGES.length);

    return (
        <section
            className="relative overflow-hidden mx-4 mt-4 rounded-2xl"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {/* Slides */}
            {HERO_SLIDE_IMAGES.map((image, index) => (
                <div
                    key={image}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === activeSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform ease-out"
                        style={{
                            backgroundImage: `url('${image}')`,
                            transform: index === activeSlide ? 'scale(1.08)' : 'scale(1)',
                            transitionDuration: '6000ms',
                        }}
                    />
                </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-r from-stone-900/75 via-stone-900/40 to-transparent" />

            <div className="relative z-10 px-6 sm:px-8 md:px-12 py-16 md:py-20 max-w-2xl">
                <span className="inline-block text-rose-300 text-xs font-bold tracking-wider uppercase mb-4">
                    Spring / Summer 2026
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-4">
                    Discover Unique<br />
                    <span className="text-rose-400">Fashion</span> with<br />
                    Sally–K
                </h1>
                <p className="text-stone-300 text-sm sm:text-base max-w-md mb-7 leading-relaxed">
                    Explore curated collections of exclusive designs from emerging and established fashion creators. Find your next statement piece.
                </p>
                <div className="flex flex-wrap gap-3">
                    <button className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-7 py-3 rounded-full text-sm transition-colors">
                        Shop Now
                    </button>
                    {/* <button className="bg-white/15 hover:bg-white/25 text-white font-semibold px-7 py-3 rounded-full text-sm border border-white/30 backdrop-blur-sm transition-colors">
                        Sell Your Designs
                    </button> */}
                </div>
            </div>
            <div className="relative z-10 flex gap-8 px-6 sm:px-8 md:px-12 pb-8 flex-wrap">
                {[
                    ['20+', 'Products'],
                    ['180+', 'Designers'],
                    ['1+', 'Countries']
                ].map(([value, label]) => (
                    <div key={label} className="text-white">
                        <div className="text-xl sm:text-2xl font-bold font-serif">{value}</div>
                        <div className="text-xs text-stone-400 tracking-wider">{label}</div>
                    </div>
                ))}
            </div>

            {/* Prev / Next arrows */}
            <button
                onClick={goPrev}
                aria-label="Previous slide"
                className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm items-center justify-center text-white transition-colors"
            >
                <ChevronLeft className="w-5 h-5" strokeWidth={2} />
            </button>
            <button
                onClick={goNext}
                aria-label="Next slide"
                className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm items-center justify-center text-white transition-colors"
            >
                <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </button>

            {/* Dot indicators */}
            <div className="absolute z-20 bottom-4 right-4 sm:right-6 flex gap-1.5">
                {HERO_SLIDE_IMAGES.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                        className={`h-1.5 rounded-full transition-all duration-300 ${index === activeSlide ? 'w-6 bg-rose-400' : 'w-1.5 bg-white/50 hover:bg-white/70'
                            }`}
                    />
                ))}
            </div>
        </section>
    );
}

// ── Promo Banners (sponsored placements) ───────────────────

interface PromoBanner {
    id: string;
    label: string;
    title: string;
    subtitle: string;
    image: string;
    ctaLabel: string;
}

const PROMO_BANNERS: PromoBanner[] = [
    {
        id: 'promo-1',
        label: 'Ad',
        title: '20% Off Saint Laurent',
        subtitle: 'This week only',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=700&q=80',
        ctaLabel: 'Shop the sale',
    },
    {
        id: 'promo-2',
        label: 'Ad',
        title: 'New: Acne Studios Drop',
        subtitle: 'Fresh menswear arrivals',
        image: 'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=700&q=80',
        ctaLabel: 'Explore now',
    },
    {
        id: 'promo-3',
        label: 'Ad',
        title: 'A.P.C. Accessories',
        subtitle: 'Everyday essentials, reimagined',
        image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=700&q=80',
        ctaLabel: 'Discover',
    },
];

function PromoBanners() {
    return (
        <section className="max-w-7xl mx-auto px-6 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {PROMO_BANNERS.map(promo => (
                    <a
                        key={promo.id}
                        href="#"
                        className="group relative overflow-hidden rounded-2xl aspect-[16/9] sm:aspect-[4/3]"
                    >
                        <img
                            src={promo.image}
                            alt={promo.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent" />
                        <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wide text-stone-600 bg-white/90 px-2 py-0.5 rounded-full">
                            {promo.label}
                        </span>
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                            <p className="text-white font-semibold text-sm">{promo.title}</p>
                            <p className="text-stone-300 text-xs mb-2">{promo.subtitle}</p>
                            <span className="inline-flex items-center gap-1 text-rose-300 text-xs font-semibold group-hover:text-rose-200 transition-colors">
                                {promo.ctaLabel} →
                            </span>
                        </div>
                    </a>
                ))}
            </div>
        </section>
    );
}

// ── Product Card ──────────────────────────────────────────

interface ProductCardProps {
    product: Product;
}

function ProductCard({ product }: ProductCardProps) {
    const [added, setAdded] = useState(false);
    const { isAuthenticated, openLoginModal } = useAuth();
    const [adding, setAdding] = useState(false);
    const { addItem } = useCart();
    const toast = useToast();
    const { isWishlisted, toggleWishlist } = useWishlist();
    const navigate = useNavigate();
    const liked = isWishlisted(product.id);
    const outOfStock = product.stock <= 0;

    const handleAdd = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (product.needsOptions) {
            navigate(`/product/${product.id}`);
            return;
        }
        if (!isAuthenticated) {
            openLoginModal("Sign in to add items to your bag and check out.");
            return;
        }
        setAdding(true);
        const result = await addItem({ productId: product.id });
        setAdding(false);
        if (!result.ok) {
            toast.error(result.message);
            return;
        }
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            openLoginModal("Sign in to save items to your wishlist.");
            return;
        }
        toggleWishlist(product.id);
    };

    return (
        <div
            onClick={() => navigate(`/product/${product.id}`)}
            role="button"
            tabIndex={0}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow group cursor-pointer"
        >
            <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />
                {product.tag && (
                    <span className={`absolute top-3 left-3 text-xs font-bold text-white px-3 py-1 rounded-full ${TAG_COLORS[product.tag]}`}>
                        {product.tag}
                    </span>
                )}
                <button
                    onClick={handleLike}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                >
                    <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill={liked ? "#f43f5e" : "none"}
                        stroke={liked ? "#f43f5e" : "currentColor"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-stone-600"
                    >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                </button>
                <div className="absolute bottom-0 left-0 right-0">
                    <button
                        onClick={handleAdd}
                        disabled={adding || outOfStock}
                        className={`w-full disabled:opacity-70 disabled:cursor-not-allowed py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${added ? 'bg-rose-600 text-white' : 'bg-stone-900 text-white hover:bg-stone-800'
                            }`}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        {outOfStock
                            ? 'Out of stock'
                            : product.needsOptions
                                ? 'Choose options'
                                : adding
                                    ? 'Adding...'
                                    : added
                                        ? 'Added!'
                                        : 'Add to Bag'}
                    </button>
                </div>
            </div>
            <div className="p-4">
                <p className="text-xs text-stone-400 font-medium mb-1 flex items-center gap-1.5">
                    <Link
                        to={`/designer/${encodeURIComponent(product.designer)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-rose-500 hover:underline transition-colors"
                    >
                        {product.designer}
                    </Link>
                    {product.sponsored && (
                        <span className="text-[9px] uppercase tracking-wide text-stone-400 border border-stone-200 rounded px-1 py-[1px] font-semibold">
                            Ad
                        </span>
                    )}
                </p>
                <h3 className="text-sm font-semibold text-stone-800 mb-1 truncate">{product.name}</h3>
                <p className="text-sm font-bold text-stone-900">₦{product.price}</p>
            </div>
        </div>
    );
}

// ── Product Grid ──────────────────────────────────────────

function ProductGrid() {
    const [searchParams, setSearchParams] = useSearchParams();

    const initialCategory = (() => {
        const param = searchParams.get('category');
        return CATEGORIES.includes(param as Category) ? (param as Category) : 'All';
    })();

    const [search, setSearch] = useState('');
    const [cat, setCat] = useState<Category>(initialCategory);
    const [tagFilter, setTagFilter] = useState<string | null>(searchParams.get('tag'));
    const [sort, setSort] = useState<SortOption>('Most Popular');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [priceBucket, setPriceBucket] = useState<string | null>(null);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    // Seller ids — the API filters by seller, not brand name.
    const [selectedDesigners, setSelectedDesigners] = useState<string[]>([]);

    const clearTagFilter = () => {
        setTagFilter(null);
        setSearchParams(params => {
            params.delete('tag');
            return params;
        });
    };

    // Nav links (e.g. "Sale", "Women") point back to "/" with query params. Since
    // ProductGrid doesn't remount on same-route navigation, re-sync from the URL
    // whenever it changes so clicking a nav link while already on the dashboard works.
    useEffect(() => {
        const categoryParam = searchParams.get('category');
        if (CATEGORIES.includes(categoryParam as Category)) {
            setCat(categoryParam as Category);
        }
        setTagFilter(searchParams.get('tag'));
    }, [searchParams]);

    const activeFilterCount =
        (priceBucket ? 1 : 0) + (selectedSizes.length ? 1 : 0) + (selectedDesigners.length ? 1 : 0);

    const toggleSize = (size: string) => {
        setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
    };

    const toggleDesigner = (designer: string) => {
        setSelectedDesigners(prev => prev.includes(designer) ? prev.filter(d => d !== designer) : [...prev, designer]);
    };

    const clearFilters = () => {
        setPriceBucket(null);
        setSelectedSizes([]);
        setSelectedDesigners([]);
    };

    const categoryQuery = CATEGORY_QUERY[cat];
    const filterOptions = useFilterOptions(categoryQuery);

    // Keep selected options visible even if the new tab doesn't list them, so
    // they can still be un-ticked.
    const sizeOptions = useMemo(
        () => [...filterOptions.sizes, ...selectedSizes.filter(s => !filterOptions.sizes.includes(s))],
        [filterOptions.sizes, selectedSizes]
    );

    // "New Arrivals" in the nav is just the newest-first sort. There's no sale
    // pricing in the API yet, so "Sale" has nothing to show.
    const effectiveSort = tagFilter === 'New' ? 'Newest' : sort;
    const noResultsForTag = !!tagFilter && tagFilter !== 'New';

    const queryParams = useMemo(() => {
        const params: Record<string, string> = { sort: SORT_QUERY[effectiveSort] };
        if (categoryQuery) params.category = categoryQuery;
        if (search.trim()) params.search = search.trim();
        const bucket = PRICE_BUCKETS.find(b => b.label === priceBucket);
        if (bucket) {
            params.minPrice = String(bucket.min);
            if (Number.isFinite(bucket.max)) params.maxPrice = String(bucket.max);
        }
        if (selectedSizes.length) params.sizes = selectedSizes.join(',');
        if (selectedDesigners.length) params.sellers = selectedDesigners.join(',');
        return params;
    }, [effectiveSort, categoryQuery, search, priceBucket, selectedSizes, selectedDesigners]);

    const { products, loading, error } = useStorefrontProducts(queryParams, noResultsForTag);
    const filtered = noResultsForTag ? [] : products;

    return (
        <main className="max-w-7xl mx-auto px-6 py-10 md:py-12">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl text-stone-900 mb-2">Discover Your Style</h2>
                <p className="text-sm text-stone-400">Browse our curated collection of fashion-forward pieces.</p>
            </div>

            {/* Search */}
            <div className="max-w-md mx-auto mb-6 relative">
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    type="text"
                    placeholder="Search for products, brands, and more"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-full border border-stone-200 text-sm text-stone-700 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
                />
            </div>

            {/* Active tag filter (from nav links like New Arrivals / Sale) */}
            {tagFilter && (
                <div className="flex justify-center mb-5">
                    <button
                        onClick={clearTagFilter}
                        className="flex items-center gap-1.5 pl-4 pr-3 py-1.5 rounded-full bg-rose-50 text-rose-600 text-sm font-medium hover:bg-rose-100 transition-colors"
                    >
                        Showing: {tagFilter === 'New' ? 'New Arrivals' : tagFilter}
                        <X className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                </div>
            )}

            {/* Category Tabs */}
            <div className="flex overflow-x-auto gap-1 mb-5 pb-1 scrollbar-hide">
                {CATEGORIES.map(c => (
                    <button
                        key={c}
                        onClick={() => setCat(c)}
                        className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all ${cat === c
                                ? 'bg-stone-900 text-white'
                                : 'text-stone-500 hover:text-stone-700'
                            }`}
                    >
                        {c}
                    </button>
                ))}
            </div>

            {/* Filter bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => setFiltersOpen(o => !o)}
                        className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border rounded-full transition-colors ${
                            filtersOpen || activeFilterCount > 0
                                ? 'border-rose-500 bg-rose-50 text-rose-600'
                                : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="4" y1="21" x2="4" y2="14" />
                            <line x1="4" y1="10" x2="4" y2="3" />
                            <line x1="12" y1="21" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12" y2="3" />
                            <line x1="20" y1="21" x2="20" y2="16" />
                            <line x1="20" y1="12" x2="20" y2="3" />
                            <line x1="1" y1="14" x2="7" y2="14" />
                            <line x1="9" y1="8" x2="15" y2="8" />
                            <line x1="17" y1="16" x2="23" y2="16" />
                        </svg>
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                    {(['Price', 'Size', 'Designer'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFiltersOpen(o => !o)}
                            className="flex items-center gap-1 px-4 py-2 text-sm font-medium border border-stone-200 rounded-full text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                            {f}
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-stone-400">{filtered.length} items</span>
                    <select
                        value={effectiveSort}
                        disabled={tagFilter === 'New'}
                        onChange={e => setSort(e.target.value as SortOption)}
                        className="text-sm font-medium text-stone-700 border border-stone-200 rounded-full px-4 py-2 outline-none bg-white focus:border-rose-400"
                    >
                        {SORT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                </div>
            </div>

            {/* Filter panel */}
            {filtersOpen && (
                <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {/* Price */}
                        <div>
                            <p className="text-sm font-semibold text-stone-800 mb-3">Price</p>
                            <div className="flex flex-col gap-2">
                                {PRICE_BUCKETS.map(bucket => (
                                    <label key={bucket.label} className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="price-bucket"
                                            checked={priceBucket === bucket.label}
                                            onChange={() => setPriceBucket(priceBucket === bucket.label ? null : bucket.label)}
                                            className="accent-rose-500"
                                        />
                                        {bucket.label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Size */}
                        <div>
                            <p className="text-sm font-semibold text-stone-800 mb-3">Size</p>
                            <div className="flex flex-wrap gap-2">
                                {sizeOptions.length === 0 && (
                                    <p className="text-sm text-stone-400">No sizes listed yet.</p>
                                )}
                                {sizeOptions.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => toggleSize(size)}
                                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                                            selectedSizes.includes(size)
                                                ? 'border-rose-500 text-rose-600 bg-rose-50'
                                                : 'border-stone-200 text-stone-600 hover:border-stone-300'
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Designer */}
                        <div>
                            <p className="text-sm font-semibold text-stone-800 mb-3">Designer</p>
                            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                                {filterOptions.sellers.length === 0 && (
                                    <p className="text-sm text-stone-400">No designers listed yet.</p>
                                )}
                                {filterOptions.sellers.map(seller => (
                                    <label key={seller.id} className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedDesigners.includes(seller.id)}
                                            onChange={() => toggleDesigner(seller.id)}
                                            className="accent-rose-500"
                                        />
                                        {seller.brandName}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-stone-100">
                        <button
                            onClick={clearFilters}
                            className="text-sm font-medium text-stone-500 hover:text-stone-700 transition-colors"
                        >
                            Clear all filters
                        </button>
                        <button
                            onClick={() => setFiltersOpen(false)}
                            className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-5 py-2 rounded-full text-sm transition-colors"
                        >
                            Show {filtered.length} results
                        </button>
                    </div>
                </div>
            )}

            {/* Grid */}
            {loading && filtered.length === 0 && !noResultsForTag ? (
                <div className="flex justify-center py-20">
                    <ClipLoader size={28} color="#f43f5e" />
                </div>
            ) : error && filtered.length === 0 ? (
                <div className="text-center py-20 text-stone-400">
                    <p className="text-lg font-semibold mb-1">Couldn't load products</p>
                    <p className="text-sm">Check your connection and try again.</p>
                </div>
            ) : filtered.length > 0 ? (
                <div
                    className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-opacity ${
                        loading ? 'opacity-50' : ''
                    }`}
                >
                    {filtered.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
            ) : (
                <div className="text-center py-20 text-stone-400">
                    <p className="text-lg font-semibold mb-1">No results found</p>
                    <p className="text-sm">Try adjusting your search or filters.</p>
                </div>
            )}
        </main>
    );
}

// ── Footer ────────────────────────────────────────────────

function Footer() {
    const footerLinks: { label: string; to?: string }[] = [
        { label: 'About Us' },
        { label: 'Careers' },
        { label: 'Press' },
        { label: 'Contact', to: '/help' },
        { label: 'FAQ', to: '/help' },
        { label: 'Privacy Policy' },
        { label: 'Terms of Service' },
        { label: 'Cookie Settings' },
    ];
    const socialLinks: string[] = ['Instagram', 'TikTok', 'Pinterest'];

    return (
        <footer className="border-t border-stone-100 bg-white mt-6">
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="flex flex-wrap gap-8 justify-between mb-8">
                    <div>
                        <div className="flex gap-0.5 mb-2">
                            <span className="text-lg font-black font-serif text-stone-900">Sally</span>
                            <span className="text-lg font-black font-serif text-rose-500">–K</span>
                        </div>
                        <p className="text-sm text-stone-400 max-w-xs leading-relaxed">
                            Fashion Affairs — Curating the world's most exciting designers.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-10 gap-y-2">
                        {footerLinks.map(link => (
                            link.to ? (
                                <Link
                                    key={link.label}
                                    to={link.to}
                                    className="text-sm text-stone-500 hover:text-rose-500 transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ) : (
                                <a
                                    key={link.label}
                                    href="#"
                                    className="text-sm text-stone-500 hover:text-rose-500 transition-colors"
                                >
                                    {link.label}
                                </a>
                            )
                        ))}
                    </div>
                </div>
                <div className="pt-5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-stone-400">© 2026 Sally–K Fashion Affairs. All rights reserved.</p>
                    <div className="flex gap-4">
                        {socialLinks.map(social => (
                            <a
                                key={social}
                                href="#"
                                className="text-xs text-stone-400 hover:text-rose-500 transition-colors"
                            >
                                {social}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function UserDashboard() {
    return (
        <>
            <Navbar />
            <HeroBanner />
            <PromoBanners />
            <ProductGrid />
            <Footer />
        </>
    );
}

// ── Exports for data and constants ─────────────────────────────────────────────

export const tagColors = TAG_COLORS;
export const categories = CATEGORIES;
export const sortOptions = SORT_OPTIONS;