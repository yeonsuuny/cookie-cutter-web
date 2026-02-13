import { createClient } from '@supabase/supabase-js';

/**
 * =============================================================================
 * [파일 설명: supabaseClient.ts - 로그인 서버 연결고리]
 * =============================================================================
 * 이 파일은 우리 웹사이트가 **Supabase(로그인/DB 서버)**와 대화할 수 있게 해주는 파일
 * * 나중에 새로운 Supabase 프로젝트를 파게 되면, 아래 두 줄만 바꿔주면 됩니다.
 * =============================================================================
 */

// 1. [프로젝트 주소] Supabase 대시보드 -> Project Settings -> API -> Project URL
const supabaseUrl = "https://laopkfujploxewbbuimh.supabase.co";
// 2. [공개 키] Supabase 대시보드 -> Project Settings -> API -> anon public key
const supabaseAnonKey = "sb_publishable_oo6uBhyxmwzIPNdqvAqpPQ_6l11q9UM"

export const supabase = createClient(supabaseUrl, supabaseAnonKey);