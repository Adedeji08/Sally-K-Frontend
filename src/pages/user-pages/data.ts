export const products = [
  { id:1, name:'Elegant Evening Gown', designer:'Stella McCartney', price:250, category:'Dresses', image:'https://images.unsplash.com/photo-1566479179817-11c7c3c43c8b?w=400&q=80', tag:'Trending' },
  { id:2, name:'Casual Summer Dress', designer:'Ganni', price:80, category:'Dresses', image:'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=400&q=80', tag:'Sale' },
  { id:3, name:'Boho Chic Maxi Dress', designer:'Isabel Marant', price:120, category:'Dresses', image:'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80', tag:'New' },
  { id:4, name:'Classic Little Black Dress', designer:'Saint Laurent', price:180, category:'Dresses', image:'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80', sponsored:true },
  { id:5, name:'Floral Print Sundress', designer:'Zimmermann', price:90, category:'Dresses', image:'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=400&q=80' },
  { id:6, name:'Bodycon Party Dress', designer:'Versace', price:150, category:'Dresses', image:'https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=400&q=80', tag:'New' },
  { id:7, name:'Silk Wrap Blouse', designer:'Equipment', price:95, category:'Tops', image:'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&q=80' },
  { id:8, name:'Classic Oxford Shirt', designer:'Ralph Lauren', price:110, category:'Tops', image:'https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=400&q=80', tag:'Trending' },
  { id:9, name:'Ribbed Knit Turtleneck', designer:'COS', price:75, category:'Tops', image:'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80' },
  { id:10, name:'Linen Oversized Tee', designer:'Toteme', price:60, category:'Tops', image:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80', tag:'New' },
  { id:11, name:'Slim Fit Blazer', designer:'Hugo Boss', price:320, category:'Men', image:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', tag:'New' },
  { id:12, name:'Tailored Chinos', designer:'Acne Studios', price:140, category:'Men', image:'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400&q=80', sponsored:true },
  { id:13, name:'Merino Wool Crew', designer:'A.P.C.', price:130, category:'Men', image:'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=400&q=80', tag:'Trending' },
  { id:14, name:'Leather Biker Jacket', designer:'AllSaints', price:420, category:'Men', image:'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=400&q=80', tag:'New' },
  { id:15, name:'Silk Square Scarf', designer:'Hermès', price:340, category:'Accessories', image:'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&q=80', tag:'Trending' },
  { id:16, name:'Gold Hoop Earrings', designer:'Mejuri', price:68, category:'Accessories', image:'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80' },
  { id:17, name:'Structured Sun Hat', designer:'Maison Michel', price:220, category:'Accessories', image:'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400&q=80', tag:'New' },
  { id:18, name:'Classic White Sneakers', designer:'Common Projects', price:290, category:'Shoes', image:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', tag:'Trending' },
  { id:19, name:'Strappy Heeled Sandals', designer:'Jacquemus', price:180, category:'Shoes', image:'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80', tag:'Sale' },
  { id:20, name:'Chelsea Ankle Boots', designer:"Church's", price:450, category:'Shoes', image:'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&q=80', tag:'New' },
  { id:21, name:'Leather Derby Shoes', designer:'Grenson', price:310, category:'Shoes', image:'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&q=80' },
  { id:22, name:'Mini Leather Crossbody', designer:'Polène', price:295, category:'Bags', image:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80', tag:'Trending' },
  { id:23, name:'Canvas Tote Bag', designer:'A.P.C.', price:120, category:'Bags', image:'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400&q=80', sponsored:true },
  { id:24, name:'Structured Top Handle', designer:'Boyy', price:580, category:'Bags', image:'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&q=80', tag:'New' },
  { id:25, name:'Woven Raffia Clutch', designer:'Loewe', price:390, category:'Bags', image:'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&q=80' },
];

export const TAG_COLORS = { New: '#10b981', Trending: '#f43f5e', Sale: '#f59e0b' };
export const CATEGORIES = ['All', 'Dresses', 'Tops', 'Men', 'Shoes', 'Bags', 'Accessories'];
export const SORT_OPTIONS = ['Most Popular', 'Price: Low to High', 'Price: High to Low', 'Newest'];
