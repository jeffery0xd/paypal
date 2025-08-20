Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { imageData, fileName, settingKey = 'site_logo_url' } = await req.json();

        if (!imageData || !fileName) {
            throw new Error('Image data and filename are required');
        }

        // 验证文件类型
        const allowedTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        const mimeType = imageData.split(';')[0].split(':')[1];
        
        if (!allowedTypes.includes(mimeType)) {
            throw new Error('Unsupported file type. Only SVG, PNG, JPG, and WebP are allowed.');
        }

        // 获取环境变量
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // 提取base64数据
        const base64Data = imageData.split(',')[1];
        
        // 转换为二进制数据
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        
        // 检查文件大小限制 (2MB)
        if (binaryData.length > 2097152) {
            throw new Error('File size exceeds 2MB limit.');
        }

        // 生成唯一的文件名
        const timestamp = Date.now();
        const fileExtension = fileName.split('.').pop();
        const uniqueFileName = `logo-${timestamp}.${fileExtension}`;

        console.log('Uploading logo:', uniqueFileName, 'Size:', binaryData.length, 'Type:', mimeType);

        // 上传到Supabase Storage
        const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/logo-images/${uniqueFileName}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': mimeType,
                'x-upsert': 'true'
            },
            body: binaryData
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error('Upload error:', errorText);
            throw new Error(`Upload failed: ${errorText}`);
        }

        // 获取公共URL
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/logo-images/${uniqueFileName}`;
        
        console.log('Logo uploaded successfully:', publicUrl);

        // 更新site_settings表中的logo URL
        const updateResponse = await fetch(`${supabaseUrl}/rest/v1/site_settings?setting_key=eq.${settingKey}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                setting_value: publicUrl,
                updated_at: new Date().toISOString()
            })
        });

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.error('Database update error:', errorText);
            // 如果数据库更新失败，删除已上传的文件
            try {
                await fetch(`${supabaseUrl}/storage/v1/object/logo-images/${uniqueFileName}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`
                    }
                });
            } catch (deleteError) {
                console.error('Failed to cleanup uploaded file:', deleteError);
            }
            throw new Error(`Failed to update database: ${errorText}`);
        }

        console.log('Logo settings updated successfully');

        return new Response(JSON.stringify({
            data: {
                publicUrl,
                fileName: uniqueFileName,
                size: binaryData.length,
                mimeType,
                settingKey
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Logo upload error:', error);

        const errorResponse = {
            error: {
                code: 'LOGO_UPLOAD_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});