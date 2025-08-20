import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types';
import { supabase } from '../lib/supabase';
import { Plus, Edit, Trash2, Upload, Save, X, Eye, Tag, Image, Settings, Monitor } from 'lucide-react';

interface SeoSettings {
  home_title?: string;
  product_title_template?: string;
  category_title_template?: string;
  default_title?: string;
  site_name?: string;
}

interface BannerSettings {
  id?: number;
  title: string;
  subtitle: string;
  background_image?: string;
  background_color: string;
  text_color: string;
  is_active: boolean;
}

interface SiteSettings {
  site_logo_url?: {
    value: string;
    type: string;
    description: string;
    updated_at: string;
  };
  site_logo_alt?: {
    value: string;
    type: string;
    description: string;
    updated_at: string;
  };
}

const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  
  // SEO设置相关状态
  const [showSeoSettings, setShowSeoSettings] = useState(false);
  const [seoSettings, setSeoSettings] = useState<SeoSettings>({
    home_title: '',
    product_title_template: '',
    category_title_template: '',
    default_title: '',
    site_name: ''
  });
  
  // Banner设置相关状态
  const [showBannerSettings, setShowBannerSettings] = useState(false);
  const [bannerSettings, setBannerSettings] = useState<BannerSettings>({
    title: '',
    subtitle: '',
    background_color: '#3B82F6',
    text_color: '#FFFFFF',
    is_active: true
  });
  
  // 网站设置相关状态
  const [showSiteSettings, setShowSiteSettings] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    variant: '',
    price: '',
    description: '',
    category_id: '',
    buy_link: '',
    featured: false,
    is_pinned: false,
    images: [] as string[]
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    if (password === '19961015') {
      setIsAuthenticated(true);
    } else {
      alert('密码错误，请重试');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch products with pinned sorting
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (productsData) {
        setProducts(productsData);
      }

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (categoriesData) {
        setCategories(categoriesData);
      }

      // Fetch SEO settings
      const { data: seoData } = await supabase
        .from('seo_settings')
        .select('*')
        .single();
      
      if (seoData) {
        setSeoSettings(seoData);
      }
      
      // Fetch Banner settings
      const { data: bannerData } = await supabase
        .from('banner_settings')
        .select('*')
        .eq('is_active', true)
        .single();
      
      if (bannerData) {
        setBannerSettings(bannerData);
      }
      
      // Fetch Site settings
      await fetchSiteSettings();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const productData = {
        name: formData.name,
        variant: formData.variant || null,
        price: parseFloat(formData.price),
        description: formData.description || null,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        buy_link: formData.buy_link || null,
        featured: formData.featured,
        is_pinned: formData.is_pinned,
        images: formData.images.length > 0 ? formData.images : null,
        is_active: true,
        updated_at: new Date().toISOString()
      };

      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
        alert('产品更新成功');
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        
        if (error) throw error;
        alert('产品创建成功');
      }
      
      // Reset form and fetch updated data
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      variant: product.variant || '',
      price: product.price.toString(),
      description: product.description || '',
      category_id: product.category_id?.toString() || '',
      buy_link: product.buy_link || '',
      featured: product.featured || false,
      is_pinned: product.is_pinned || false,
      images: product.images || []
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个产品吗？')) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      alert('产品删除成功');
      fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('删除失败');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      variant: '',
      price: '',
      description: '',
      category_id: '',
      buy_link: '',
      featured: false,
      is_pinned: false,
      images: []
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  // 切换产品置顶状态
  const togglePinProduct = async (productId: string, currentPinned: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          is_pinned: !currentPinned,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);
      
      if (error) throw error;
      
      // 刷新产品列表
      fetchData();
    } catch (error) {
      console.error('Error toggling pin status:', error);
      alert('切换置顶状态失败');
    }
  };

  // 保存SEO设置
  const handleSaveSeoSettings = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('seo_settings')
        .upsert(seoSettings);
      
      if (error) throw error;
      
      alert('SEO设置保存成功');
      setShowSeoSettings(false);
    } catch (error) {
      console.error('Error saving SEO settings:', error);
      alert('保存SEO设置失败');
    } finally {
      setLoading(false);
    }
  };

  // 保存Banner设置
  const handleSaveBannerSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('save-banner-settings', {
        body: {
          settings: bannerSettings
        }
      });
      
      if (error) {
        throw error;
      }
      
      alert('Banner设置保存成功');
      setShowBannerSettings(false);
      fetchData(); // 重新获取数据
    } catch (error) {
      console.error('Error saving banner settings:', error);
      alert('保存Banner设置失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  // 获取网站设置
  const fetchSiteSettings = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-site-settings');
      
      if (error) {
        console.error('Error fetching site settings:', error);
        return;
      }
      
      setSiteSettings(data.data || {});
    } catch (error) {
      console.error('Error fetching site settings:', error);
    }
  };

  // 处理logo文件选择
  const handleLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 验证文件类型
    const allowedTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('请选择有效的图片文件 (SVG, PNG, JPG, WebP)');
      return;
    }
    
    // 验证文件大小 (2MB)
    if (file.size > 2097152) {
      alert('文件大小不能超过 2MB');
      return;
    }
    
    setLogoFile(file);
    
    // 创建预览
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 处理拖放
  const handleLogoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleLogoDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    // 验证文件类型
    const allowedTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('请选择有效的图片文件 (SVG, PNG, JPG, WebP)');
      return;
    }
    
    // 验证文件大小 (2MB)
    if (file.size > 2097152) {
      alert('文件大小不能超过 2MB');
      return;
    }
    
    setLogoFile(file);
    
    // 创建预览
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 上传logo
  const handleLogoUpload = async () => {
    if (!logoFile) return;
    
    setLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', logoFile);
      
      const { data, error } = await supabase.functions.invoke('logo-upload', {
        body: formData
      });
      
      if (error) {
        throw error;
      }
      
      alert('Logo上传成功!');
      setLogoFile(null);
      setLogoPreview(null);
      await fetchSiteSettings(); // 重新获取设置
      setShowSiteSettings(false);
    } catch (error) {
      console.error('Logo upload error:', error);
      alert('Logo上传失败: ' + (error.message || '未知错误'));
    } finally {
      setLogoUploading(false);
    }
  };

  // 删除logo
  const handleLogoDelete = async () => {
    if (!confirm('确定要删除当前logo并重置为默认logo吗？')) return;
    
    try {
      const currentLogoUrl = siteSettings.site_logo_url?.value;
      if (!currentLogoUrl || currentLogoUrl === '/logo.svg') {
        alert('当前已经是默认logo');
        return;
      }
      
      // 提取文件名
      const fileName = currentLogoUrl.split('/').pop();
      if (!fileName) {
        throw new Error('无法获取文件名');
      }
      
      const { data, error } = await supabase.functions.invoke('logo-delete', {
        body: {
          fileName,
          settingKey: 'site_logo_url'
        }
      });
      
      if (error) {
        throw error;
      }
      
      alert('Logo删除成功，已重置为默认logo');
      await fetchSiteSettings(); // 重新获取设置
    } catch (error) {
      console.error('Logo delete error:', error);
      alert('Logo删除失败: ' + (error.message || '未知错误'));
    }
  };

  // 重置logo表单
  const resetLogoForm = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setShowSiteSettings(false);
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // 上传图片到Supabase Storage
  const uploadImages = async (files: FileList) => {
    if (!files || files.length === 0) return [];
    
    setUploadingImages(true);
    const uploadedUrls: string[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);
        
        if (error) {
          console.error('Upload error:', error);
          alert(`上传图片 ${file.name} 失败: ${error.message}`);
          continue;
        }
        
        // 获取公共URL
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
        
        uploadedUrls.push(publicUrl);
      }
      
      return uploadedUrls;
    } catch (error) {
      console.error('Upload error:', error);
      alert('上传图片失败');
      return [];
    } finally {
      setUploadingImages(false);
    }
  };

  // 处理文件选择
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const uploadedUrls = await uploadImages(files);
    if (uploadedUrls.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
    }
    
    // 清空文件输入
    e.target.value = '';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">管理员登录</h1>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="请输入管理员密码 (19961015)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3483FA]"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <button
              onClick={handleLogin}
              className="btn-primary w-full py-3 font-medium"
            >
              登录
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">产品管理系统</h1>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="btn-primary px-4 py-2 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>添加产品</span>
              </button>
              
              <button
                onClick={() => setShowSeoSettings(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
              >
                <Tag className="w-5 h-5" />
                <span>SEO设置</span>
              </button>
              
              <button
                onClick={() => setShowBannerSettings(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center space-x-2"
              >
                <Image className="w-5 h-5" />
                <span>Banner设置</span>
              </button>
              
              <button
                onClick={() => setShowSiteSettings(true)}
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 flex items-center space-x-2"
              >
                <Monitor className="w-5 h-5" />
                <span>网站设置</span>
              </button>
              
              <button
                onClick={() => setIsAuthenticated(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>

        {/* Product Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    {editingProduct ? '编辑产品' : '添加新产品'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        产品名称 *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3483FA]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        变体/型号
                      </label>
                      <input
                        type="text"
                        value={formData.variant}
                        onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3483FA]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        价格 (MXN) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3483FA]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        分类
                      </label>
                      <select
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3483FA]"
                      >
                        <option value="">选择分类</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      产品描述
                    </label>
                    <textarea
                      rows={6}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3483FA]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      购买链接
                    </label>
                    <input
                      type="url"
                      value={formData.buy_link}
                      onChange={(e) => setFormData({ ...formData, buy_link: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3483FA]"
                      placeholder="https://example.com/product"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">设为推荐产品</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.is_pinned}
                        onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">置顶产品（显示在列表最前面）</span>
                    </label>
                  </div>

                  {/* 产品图片管理 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      产品图片
                    </label>
                    
                    {/* 文件上传区域 */}
                    <div className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-md hover:border-[#3483FA] transition-colors">
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <label className="cursor-pointer">
                          <span className="text-sm text-gray-600">
                            点击上传图片 或 拖拽图片到此处
                          </span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={uploadingImages}
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          支持 JPG, PNG, WebP 格式，最大 5MB
                        </p>
                        {uploadingImages && (
                          <div className="mt-2 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#3483FA]"></div>
                            <span className="ml-2 text-sm text-[#3483FA]">上传中...</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* 已有图片列表 */}
                    {formData.images.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">已添加的图片:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {formData.images.map((image, index) => (
                            <div key={index} className="relative group border border-gray-300 rounded-md overflow-hidden">
                              <img
                                src={image}
                                alt={`产品图片 ${index + 1}`}
                                className="w-full h-20 object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder/100x100.png';
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* 手动添加URL的选项 */}
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">或手动添加图片URL:</h4>
                      <div className="flex space-x-2">
                        <input
                          type="url"
                          placeholder="https://example.com/image.jpg"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3483FA] text-sm"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const input = e.target as HTMLInputElement;
                              const url = input.value.trim();
                              if (url) {
                                setFormData(prev => ({
                                  ...prev,
                                  images: [...prev.images, url]
                                }));
                                input.value = '';
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            const input = (e.target as HTMLButtonElement).previousElementSibling as HTMLInputElement;
                            const url = input.value.trim();
                            if (url) {
                              setFormData(prev => ({
                                ...prev,
                                images: [...prev.images, url]
                              }));
                              input.value = '';
                            }
                          }}
                          className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
                        >
                          添加
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-[#3483FA] text-white px-6 py-3 rounded-md hover:bg-[#2968C8] flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" />
                      <span>{loading ? '保存中...' : '保存产品'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600"
                    >
                      取消
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">产品列表 ({products.length})</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3483FA] mx-auto mb-4"></div>
              <p>加载中...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      产品信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      价格
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      分类
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => {
                    const category = categories.find(c => c.id === product.category_id);
                    return (
                      <tr key={product.id} className="hover:bg-gray-50">                      
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={product.images?.[0] || '/placeholder/100x100.png'}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              {product.variant && (
                                <div className="text-sm text-gray-500">{product.variant}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatPrice(product.price)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {category?.name || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {product.is_active && (
                              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                                活跃
                              </span>
                            )}
                            {product.featured && (
                              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                                推荐
                              </span>
                            )}
                            {product.is_pinned && (
                              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                                置顶
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => togglePinProduct(product.id, product.is_pinned || false)}
                              className={`text-gray-400 hover:text-red-500 ${
                                product.is_pinned ? 'text-red-500' : ''
                              }`}
                              title={product.is_pinned ? '取消置顶' : '置顶产品'}
                            >
                              <Tag className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                const slug = `${product.name.toLowerCase().replace(/\s+/g, '-')}-${product.variant?.toLowerCase().replace(/\s+/g, '-') || ''}`;
                                window.open(`/producto/${product.id}/${slug}`, '_blank');
                              }}
                              className="text-gray-400 hover:text-[#3483FA]"
                              title="查看产品"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleEdit(product)}
                              className="text-gray-400 hover:text-[#3483FA]"
                              title="编辑产品"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="text-gray-400 hover:text-red-500"
                              title="删除产品"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SEO设置模态框 */}
        {showSeoSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">SEO设置</h2>
                  <button
                    onClick={() => setShowSeoSettings(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      首页标题
                    </label>
                    <input
                      type="text"
                      value={seoSettings.home_title || ''}
                      onChange={(e) => setSeoSettings({ ...seoSettings, home_title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3483FA]"
                      placeholder="例：MercadoLibre México - Compra y vende en línea"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      产品详情页标题模板
                    </label>
                    <input
                      type="text"
                      value={seoSettings.product_title_template || ''}
                      onChange={(e) => setSeoSettings({ ...seoSettings, product_title_template: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3483FA]"
                      placeholder="例：{productName} - {siteName}"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      可用变量：{'{productName}'}, {'{siteName}'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      分类页标题模板
                    </label>
                    <input
                      type="text"
                      value={seoSettings.category_title_template || ''}
                      onChange={(e) => setSeoSettings({ ...seoSettings, category_title_template: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3483FA]"
                      placeholder="例：{categoryName} - {siteName}"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      可用变量：{'{categoryName}'}, {'{siteName}'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      网站名称
                    </label>
                    <input
                      type="text"
                      value={seoSettings.site_name || ''}
                      onChange={(e) => setSeoSettings({ ...seoSettings, site_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3483FA]"
                      placeholder="例：MercadoLibre México"
                    />
                  </div>
                  
                  <div className="flex space-x-4 pt-6">
                    <button
                      onClick={handleSaveSeoSettings}
                      disabled={loading}
                      className="bg-[#3483FA] text-white px-6 py-3 rounded-md hover:bg-[#2968C8] flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" />
                      <span>{loading ? '保存中...' : '保存设置'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSeoSettings(false)}
                      className="bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600"
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Banner设置模态框 */}
        {showBannerSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Banner设置</h2>
                  <button
                    onClick={() => setShowBannerSettings(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      主标题
                    </label>
                    <input
                      type="text"
                      value={bannerSettings.title}
                      onChange={(e) => setBannerSettings({ ...bannerSettings, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3483FA]"
                      placeholder="例：Descubre los Mejores Productos"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      副标题
                    </label>
                    <input
                      type="text"
                      value={bannerSettings.subtitle}
                      onChange={(e) => setBannerSettings({ ...bannerSettings, subtitle: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3483FA]"
                      placeholder="例：Calidad premium para el mercado mexicano"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      背景图片URL
                    </label>
                    <input
                      type="text"
                      value={bannerSettings.background_image || ''}
                      onChange={(e) => setBannerSettings({ ...bannerSettings, background_image: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3483FA]"
                      placeholder="https://example.com/banner.jpg"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      如果不设置背景图片，将使用纯色背景
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        背景颜色
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={bannerSettings.background_color}
                          onChange={(e) => setBannerSettings({ ...bannerSettings, background_color: e.target.value })}
                          className="w-10 h-10 rounded border border-gray-300"
                        />
                        <input
                          type="text"
                          value={bannerSettings.background_color}
                          onChange={(e) => setBannerSettings({ ...bannerSettings, background_color: e.target.value })}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3483FA]"
                          placeholder="#3B82F6"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        文字颜色
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={bannerSettings.text_color}
                          onChange={(e) => setBannerSettings({ ...bannerSettings, text_color: e.target.value })}
                          className="w-10 h-10 rounded border border-gray-300"
                        />
                        <input
                          type="text"
                          value={bannerSettings.text_color}
                          onChange={(e) => setBannerSettings({ ...bannerSettings, text_color: e.target.value })}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3483FA]"
                          placeholder="#FFFFFF"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={handleSaveBannerSettings}
                      className="bg-[#3483FA] text-white px-6 py-3 rounded-md hover:bg-[#2968c8] flex items-center space-x-2"
                      disabled={loading}
                    >
                      {loading ? '保存中...' : '保存设置'}
                      {!loading && <Save className="w-5 h-5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBannerSettings(false)}
                      className="bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600"
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Site Settings Modal */}
        {showSiteSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                    <Monitor className="w-6 h-6 text-[#3483FA]" />
                    <span>网站设置</span>
                  </h2>
                  <button
                    onClick={resetLogoForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Logo 管理 */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo 管理</h3>
                    
                    {/* 当前Logo显示 */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        当前Logo
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-white border border-gray-300 rounded-lg flex items-center justify-center p-2">
                          {siteSettings.site_logo_url?.value ? (
                            <img 
                              src={siteSettings.site_logo_url.value} 
                              alt={siteSettings.site_logo_alt?.value || 'Logo'}
                              className="max-w-full max-h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/logo.svg';
                              }}
                            />
                          ) : (
                            <div className="text-gray-400 text-xs">加载中...</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">
                            当前URL: {siteSettings.site_logo_url?.value || '加载中...'}
                          </p>
                          <p className="text-xs text-gray-500">
                            更新时间: {siteSettings.site_logo_url?.updated_at 
                              ? new Date(siteSettings.site_logo_url.updated_at).toLocaleString('zh-CN')
                              : '未知'}
                          </p>
                        </div>
                        <button
                          onClick={handleLogoDelete}
                          className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 text-sm flex items-center space-x-1"
                          disabled={!siteSettings.site_logo_url?.value || siteSettings.site_logo_url.value === '/logo.svg'}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>重置</span>
                        </button>
                      </div>
                    </div>

                    {/* Logo上传区域 */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        上传新Logo
                      </label>
                      
                      <div 
                        className={`p-8 border-2 border-dashed rounded-lg text-center transition-colors ${
                          isDragOver 
                            ? 'border-[#3483FA] bg-blue-50' 
                            : 'border-gray-300 hover:border-[#3483FA]'
                        }`}
                        onDragOver={handleLogoDragOver}
                        onDragLeave={handleLogoDragLeave}
                        onDrop={handleLogoDrop}
                      >
                        {logoPreview ? (
                          <div className="space-y-4">
                            <div className="flex justify-center">
                              <img 
                                src={logoPreview} 
                                alt="Logo预览" 
                                className="max-w-32 max-h-32 object-contain border border-gray-200 rounded"
                              />
                            </div>
                            <div className="text-sm text-gray-600">
                              <strong>文件名:</strong> {logoFile?.name}<br/>
                              <strong>文件大小:</strong> {logoFile ? (logoFile.size / 1024 / 1024).toFixed(2) : 0} MB<br/>
                              <strong>文件类型:</strong> {logoFile?.type}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div>
                              <label className="cursor-pointer">
                                <span className="text-lg text-[#3483FA] font-medium">
                                  点击上传或拖放Logo文件
                                </span>
                                <input
                                  type="file"
                                  accept="image/svg+xml,image/png,image/jpeg,image/jpg,image/webp"
                                  onChange={handleLogoFileSelect}
                                  className="hidden"
                                  disabled={logoUploading}
                                />
                              </label>
                            </div>
                            <p className="text-sm text-gray-500">
                              支持格式: SVG, PNG, JPG, WebP<br/>
                              最大大小: 2MB<br/>
                              推荐尺寸: 200x60px 或相同比例
                            </p>
                          </div>
                        )}
                        
                        {logoUploading && (
                          <div className="mt-4 flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#3483FA]"></div>
                            <span className="text-[#3483FA] font-medium">上传中...</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex justify-end space-x-4">
                      {logoPreview && (
                        <button
                          onClick={handleLogoUpload}
                          disabled={logoUploading}
                          className="bg-[#3483FA] text-white px-6 py-3 rounded-md hover:bg-[#2968c8] flex items-center space-x-2 disabled:opacity-50"
                        >
                          <Save className="w-5 h-5" />
                          <span>{logoUploading ? '上传中...' : '上传Logo'}</span>
                        </button>
                      )}
                      <button
                        onClick={resetLogoForm}
                        className="bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;