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
        const { fileName, settingKey = 'site_logo_url' } = await req.json();

        if (!fileName) {
            throw new Error('File name is required');
        }

        // 获取环境变量
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        console.log('Deleting logo:', fileName);

        // 从Storage删除文件
        const deleteResponse = await fetch(`${supabaseUrl}/storage/v1/object/logo-images/${fileName}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`
            }
        });

        if (!deleteResponse.ok) {
            const errorText = await deleteResponse.text();
            console.error('Delete error:', errorText);
            throw new Error(`Failed to delete file: ${errorText}`);
        }

        // 重置site_settings为默认logo
        const updateResponse = await fetch(`${supabaseUrl}/rest/v1/site_settings?setting_key=eq.${settingKey}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                setting_value: '/logo.svg',
                updated_at: new Date().toISOString()
            })
        });

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.error('Database update error:', errorText);
            throw new Error(`Failed to update database: ${errorText}`);
        }

        console.log('Logo deleted and reset successfully');

        return new Response(JSON.stringify({
            data: {
                message: 'Logo deleted successfully',
                resetToDefault: '/logo.svg'
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Logo delete error:', error);

        const errorResponse = {
            error: {
                code: 'LOGO_DELETE_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});