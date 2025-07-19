import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  // 處理 CORS 預檢請求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 從請求中獲取保姆 ID
    const { sitterId } = await req.json();
    if (!sitterId) {
      throw new Error('Sitter ID is required');
    }

    // 建立 Supabase 管理員客戶端
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 更新保姆的 is_approved 狀態
    const { data, error } = await supabaseAdmin
      .from('sitters')
      .update({ is_approved: true })
      .eq('id', sitterId)
      .select();

    if (error) {
      throw error;
    }

    // 回傳成功訊息
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    // 回傳錯誤訊息
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});