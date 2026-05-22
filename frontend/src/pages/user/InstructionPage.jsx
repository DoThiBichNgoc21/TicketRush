import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '../../components/header';
import { Footer } from '../../components/footer';
import axiosInstance from '../../lib/axiosInstance';
import { 
    Search, 
    BookOpen, 
    ChevronRight, 
    HelpCircle, 
    ShieldCheck, 
    Users,
    ArrowLeft,
    Mail,
    MessageCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';

const InstructionPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [currentArticle, setCurrentArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const categories = [
        { code: "CUSTOMER", name: "Khách hàng", icon: <Users className="w-5 h-5" />, color: "bg-blue-500" },
        { code: "POLICY", name: "Chính sách", icon: <ShieldCheck className="w-5 h-5" />, color: "bg-red-500" },
        { code: "ORGANIZER", name: "Ban tổ chức", icon: <BookOpen className="w-5 h-5" />, color: "bg-green-500" },
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await axiosInstance.get('/support/articles');
                if (res.data.success) {
                    setArticles(res.data.data);
                }

                if (slug) {
                    const articleRes = await axiosInstance.get(`/support/articles/${slug}`);
                    if (articleRes.data.success) {
                        setCurrentArticle(articleRes.data.data);
                    }
                } else {
                    setCurrentArticle(null);
                }
            } catch (error) {
                console.error("Failed to fetch support data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug]);

    const filteredArticles = articles.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.short_description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const articlesByCategory = categories.reduce((acc, cat) => {
        acc[cat.code] = filteredArticles.filter(a => a.category_code === cat.code);
        return acc;
    }, {});

    if (loading && !articles.length) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-4 pt-24 pb-12">
                    <Skeleton className="h-12 w-1/3 mb-8" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <Skeleton key={i} className="h-48 w-full" />
                        ))}
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            
            <main className="pt-24 pb-12 min-h-[calc(100vh-200px)]">
                {currentArticle ? (
                    <div className="container mx-auto px-4 max-w-4xl">
                        <Button 
                            variant="ghost" 
                            className="mb-6 hover:text-primary transition-colors"
                            onClick={() => navigate('/huong-dan')}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại trung tâm hỗ trợ
                        </Button>

                        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                            <div className="bg-primary/5 px-8 py-10 border-b border-border">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                                        {currentArticle.category_name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        Cập nhật: {new Date(currentArticle.updated_at).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight">
                                    {currentArticle.title}
                                </h1>
                            </div>
                            
                            <div className="px-8 py-10">
                                <div 
                                    className="prose prose-slate dark:prose-invert max-w-none 
                                    prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                                    prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6"
                                    dangerouslySetInnerHTML={{ __html: currentArticle.content }}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="container mx-auto px-4 max-w-6xl">
                        <section className="text-center mb-16 space-y-4">
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Trung tâm hỗ trợ TicketRush</h1>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                Tìm kiếm hướng dẫn, câu hỏi thường gặp và chính sách của chúng tôi.
                            </p>
                            
                            <div className="max-w-xl mx-auto mt-8 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input 
                                    className="pl-12 h-14 text-lg rounded-full shadow-lg border-primary/20 focus-visible:ring-primary"
                                    placeholder="Bạn cần giúp đỡ điều gì?"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </section>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            <div className="lg:col-span-2 space-y-12">
                                {categories.map(cat => (
                                    articlesByCategory[cat.code]?.length > 0 && (
                                        <div key={cat.code} className="space-y-6">
                                            <div className="flex items-center gap-3 border-b border-border pb-4">
                                                <div className={`p-2 rounded-lg text-white ${cat.color}`}>
                                                    {cat.icon}
                                                </div>
                                                <h2 className="text-2xl font-bold">{cat.name}</h2>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {articlesByCategory[cat.code].map(article => (
                                                    <Link key={article.id} to={`/huong-dan/${article.slug}`}>
                                                        <Card className="h-full hover:shadow-md transition-all border-border/50 hover:border-primary group">
                                                            <CardHeader className="p-5 pb-2">
                                                                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                                                    {article.title}
                                                                </CardTitle>
                                                            </CardHeader>
                                                            <CardContent className="p-5 pt-0">
                                                                <CardDescription className="line-clamp-2">
                                                                    {article.short_description || "Xem chi tiết hướng dẫn này..."}
                                                                </CardDescription>
                                                            </CardContent>
                                                        </Card>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>

                            <div className="space-y-6">
                                <Card className="bg-primary/5 border-none shadow-none">
                                    <CardHeader>
                                        <CardTitle className="text-lg text-primary">Liên hệ hỗ trợ</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-sm text-muted-foreground">
                                            Vui lòng tham khảo các bài hướng dẫn trước khi liên hệ trực tiếp.
                                        </p>
                                        <div className="space-y-3">
                                            <Button className="w-full justify-start font-bold" variant="outline">
                                                <Mail className="mr-2 h-4 w-4" /> Gửi yêu cầu
                                            </Button>
                                            <Button className="w-full justify-start font-bold" variant="outline">
                                                <MessageCircle className="mr-2 h-4 w-4" /> Chat hỗ trợ
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default InstructionPage;
